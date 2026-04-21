-- Lumina Zone: lightweight device session limit
-- Purpose:
-- - Keep PRO account sharing modest by allowing only the latest 2 active devices.
-- - This is a soft application-level guard, not a perfect anti-abuse system.

create table if not exists public.device_sessions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null default public.current_clerk_user_id()
    references public.app_users(clerk_user_id) on delete cascade,
  device_id text not null,
  device_label text not null default '',
  user_agent text not null default '',
  last_seen_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default (timezone('utc', now()) + interval '2 hours'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (clerk_user_id, device_id)
);

drop trigger if exists set_device_sessions_updated_at on public.device_sessions;

create trigger set_device_sessions_updated_at
before update on public.device_sessions
for each row
execute function public.set_row_updated_at();

create index if not exists idx_device_sessions_user_seen
  on public.device_sessions(clerk_user_id, last_seen_at desc);

create index if not exists idx_device_sessions_expires
  on public.device_sessions(expires_at);

alter table public.device_sessions enable row level security;

drop policy if exists "device_sessions_select_own" on public.device_sessions;
create policy "device_sessions_select_own"
on public.device_sessions
for select
to authenticated
using (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "device_sessions_insert_own" on public.device_sessions;
create policy "device_sessions_insert_own"
on public.device_sessions
for insert
to authenticated
with check (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "device_sessions_update_own" on public.device_sessions;
create policy "device_sessions_update_own"
on public.device_sessions
for update
to authenticated
using (public.current_clerk_user_id() = clerk_user_id)
with check (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "device_sessions_delete_own" on public.device_sessions;
create policy "device_sessions_delete_own"
on public.device_sessions
for delete
to authenticated
using (public.current_clerk_user_id() = clerk_user_id);
