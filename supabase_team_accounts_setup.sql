-- Lumina Zone: simple Business team seats
-- Run this after supabase_clerk_history_setup.sql.
-- Business plan = owner + up to 4 invited members (5 accounts total).

create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_clerk_user_id text not null references public.app_users(clerk_user_id) on delete cascade,
  owner_email citext not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  seat_limit integer not null default 5 check (seat_limit between 1 and 50),
  status text not null default 'active' check (status in ('active', 'inactive', 'canceled', 'past_due')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_clerk_user_id)
);

create unique index if not exists idx_teams_subscription_unique
  on public.teams(stripe_subscription_id)
  where stripe_subscription_id is not null;

alter table public.app_users
  add column if not exists team_id uuid references public.teams(id) on delete set null,
  add column if not exists team_role text check (team_role in ('owner', 'member'));

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  clerk_user_id text references public.app_users(clerk_user_id) on delete set null,
  email citext not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  status text not null default 'invited' check (status in ('invited', 'active', 'removed')),
  joined_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (team_id, email)
);

create unique index if not exists idx_team_members_clerk_active_unique
  on public.team_members(team_id, clerk_user_id)
  where clerk_user_id is not null and status <> 'removed';

create index if not exists idx_team_members_email_status
  on public.team_members(email, status);

create index if not exists idx_app_users_team
  on public.app_users(team_id, team_role);

drop trigger if exists set_teams_updated_at on public.teams;
create trigger set_teams_updated_at
before update on public.teams
for each row
execute function public.set_row_updated_at();

drop trigger if exists set_team_members_updated_at on public.team_members;
create trigger set_team_members_updated_at
before update on public.team_members
for each row
execute function public.set_row_updated_at();

create or replace function public.current_user_team_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select team_id
  from public.app_users
  where clerk_user_id = public.current_clerk_user_id()
  limit 1;
$$;

create or replace function public.current_user_is_team_owner(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users
    where clerk_user_id = public.current_clerk_user_id()
      and team_id = target_team_id
      and team_role = 'owner'
      and plan = 'team'
  );
$$;

create or replace function public.current_user_is_team_member(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users
    where clerk_user_id = public.current_clerk_user_id()
      and team_id = target_team_id
      and plan = 'team'
  );
$$;

create or replace function public.enforce_team_member_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  max_seats integer;
begin
  if new.status = 'removed' then
    return new;
  end if;

  select seat_limit into max_seats
  from public.teams
  where id = new.team_id;

  if max_seats is null then
    raise exception 'TEAM_NOT_FOUND';
  end if;

  select count(*)::integer into current_count
  from public.team_members
  where team_id = new.team_id
    and status <> 'removed'
    and (tg_op = 'INSERT' or id <> new.id);

  if current_count >= max_seats then
    raise exception 'TEAM_SEAT_LIMIT_REACHED';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_team_member_limit_trigger on public.team_members;
create trigger enforce_team_member_limit_trigger
before insert or update of status, team_id
on public.team_members
for each row
execute function public.enforce_team_member_limit();

create or replace function public.claim_team_membership_for_current_user()
returns setof public.app_users
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id text := public.current_clerk_user_id();
  current_email citext;
  membership public.team_members%rowtype;
begin
  if current_id is null then
    return;
  end if;

  select email::citext into current_email
  from public.app_users
  where clerk_user_id = current_id;

  if current_email is null or current_email = '' then
    return query
      select *
      from public.app_users
      where clerk_user_id = current_id;
    return;
  end if;

  select tm.* into membership
  from public.team_members tm
  join public.teams t on t.id = tm.team_id
  where tm.email = current_email
    and tm.status in ('invited', 'active')
    and t.status = 'active'
  order by
    case when tm.role = 'owner' then 0 else 1 end,
    tm.created_at asc
  limit 1;

  if membership.id is null then
    return query
      select *
      from public.app_users
      where clerk_user_id = current_id;
    return;
  end if;

  update public.team_members
  set
    clerk_user_id = current_id,
    status = 'active',
    joined_at = coalesce(joined_at, timezone('utc', now()))
  where id = membership.id;

  return query
    update public.app_users
    set
      plan = 'team',
      daily_limit = 9999,
      beta_unlocked = false,
      team_id = membership.team_id,
      team_role = membership.role
    where clerk_user_id = current_id
    returning *;
end;
$$;

create or replace function public.list_current_team_members()
returns table (
  id uuid,
  email text,
  role text,
  status text,
  clerk_user_id text,
  joined_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_team_id uuid := public.current_user_team_id();
begin
  if target_team_id is null or not public.current_user_is_team_member(target_team_id) then
    return;
  end if;

  return query
    select
      tm.id,
      tm.email::text,
      tm.role,
      tm.status,
      tm.clerk_user_id,
      tm.joined_at,
      tm.created_at
    from public.team_members tm
    where tm.team_id = target_team_id
      and tm.status <> 'removed'
    order by
      case when tm.role = 'owner' then 0 else 1 end,
      tm.created_at asc;
end;
$$;

create or replace function public.add_team_member(member_email text)
returns setof public.team_members
language plpgsql
security definer
set search_path = public
as $$
declare
  target_team_id uuid := public.current_user_team_id();
  normalized_email citext := lower(trim(member_email))::citext;
  existing_clerk_user_id text;
  max_seats integer;
  current_count integer;
begin
  if target_team_id is null or not public.current_user_is_team_owner(target_team_id) then
    raise exception 'TEAM_OWNER_REQUIRED';
  end if;

  if normalized_email is null or normalized_email = '' or normalized_email::text !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'INVALID_EMAIL';
  end if;

  select seat_limit into max_seats
  from public.teams
  where id = target_team_id
    and status = 'active';

  if max_seats is null then
    raise exception 'TEAM_NOT_ACTIVE';
  end if;

  select count(*)::integer into current_count
  from public.team_members
  where team_id = target_team_id
    and status <> 'removed';

  if not exists (
    select 1
    from public.team_members
    where team_id = target_team_id
      and email = normalized_email
      and status <> 'removed'
  ) and current_count >= max_seats then
    raise exception 'TEAM_SEAT_LIMIT_REACHED';
  end if;

  select clerk_user_id into existing_clerk_user_id
  from public.app_users
  where lower(email) = normalized_email::text
  limit 1;

  if existing_clerk_user_id is not null then
    update public.app_users
    set
      plan = 'team',
      daily_limit = 9999,
      beta_unlocked = false,
      team_id = target_team_id,
      team_role = 'member'
    where clerk_user_id = existing_clerk_user_id;
  end if;

  return query
    insert into public.team_members (team_id, clerk_user_id, email, role, status, joined_at)
    values (
      target_team_id,
      existing_clerk_user_id,
      normalized_email,
      'member',
      case when existing_clerk_user_id is null then 'invited' else 'active' end,
      case when existing_clerk_user_id is null then null else timezone('utc', now()) end
    )
    on conflict (team_id, email)
    do update set
      clerk_user_id = coalesce(public.team_members.clerk_user_id, existing_clerk_user_id),
      status = case
        when coalesce(public.team_members.clerk_user_id, existing_clerk_user_id) is null then 'invited'
        else 'active'
      end,
      role = 'member',
      joined_at = case
        when coalesce(public.team_members.clerk_user_id, existing_clerk_user_id) is null then public.team_members.joined_at
        else coalesce(public.team_members.joined_at, timezone('utc', now()))
      end,
      updated_at = timezone('utc', now())
    where public.team_members.role <> 'owner'
    returning *;
end;
$$;

create or replace function public.remove_team_member(member_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_team_id uuid := public.current_user_team_id();
  target_member public.team_members%rowtype;
begin
  if target_team_id is null or not public.current_user_is_team_owner(target_team_id) then
    raise exception 'TEAM_OWNER_REQUIRED';
  end if;

  select * into target_member
  from public.team_members
  where id = member_id
    and team_id = target_team_id;

  if target_member.id is null then
    return false;
  end if;

  if target_member.role = 'owner' then
    raise exception 'TEAM_OWNER_CANNOT_BE_REMOVED';
  end if;

  update public.team_members
  set
    status = 'removed',
    clerk_user_id = null
  where id = member_id;

  if target_member.clerk_user_id is not null then
    update public.app_users
    set
      plan = 'free',
      daily_limit = 2,
      team_id = null,
      team_role = null
    where clerk_user_id = target_member.clerk_user_id
      and team_id = target_team_id
      and plan = 'team';
  end if;

  return true;
end;
$$;

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "teams_select_current_member" on public.teams;
create policy "teams_select_current_member"
on public.teams
for select
to authenticated
using (public.current_user_is_team_member(id));

drop policy if exists "team_members_select_current_member" on public.team_members;
create policy "team_members_select_current_member"
on public.team_members
for select
to authenticated
using (public.current_user_is_team_member(team_id));

drop policy if exists "team_members_insert_owner" on public.team_members;
create policy "team_members_insert_owner"
on public.team_members
for insert
to authenticated
with check (public.current_user_is_team_owner(team_id));

drop policy if exists "team_members_update_owner" on public.team_members;
create policy "team_members_update_owner"
on public.team_members
for update
to authenticated
using (public.current_user_is_team_owner(team_id))
with check (public.current_user_is_team_owner(team_id));

drop policy if exists "team_members_delete_owner" on public.team_members;
create policy "team_members_delete_owner"
on public.team_members
for delete
to authenticated
using (public.current_user_is_team_owner(team_id));

grant execute on function public.claim_team_membership_for_current_user() to authenticated;
grant execute on function public.list_current_team_members() to authenticated;
grant execute on function public.add_team_member(text) to authenticated;
grant execute on function public.remove_team_member(uuid) to authenticated;
