-- Lumina Zone: Clerk-based history and usage schema
-- Run this in Supabase SQL Editor after deciding one of these approaches:
-- 1. Supabase third-party auth with Clerk JWTs
-- 2. A server-side bridge that writes with the service role key
--
-- Important:
-- - This does NOT replace the old `profiles` table.
-- - The old `profiles` table is still Supabase Auth-specific.
-- - These tables are for Clerk-authenticated users and app history.

create extension if not exists pgcrypto;

create or replace function public.current_clerk_user_id()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'sub', '');
$$;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.app_users (
  clerk_user_id text primary key default public.current_clerk_user_id(),
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free'
    check (plan in ('free', 'pro', 'beta_pro', 'team')),
  daily_limit integer not null default 2
    check (daily_limit >= 0),
  beta_unlocked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_app_users_updated_at on public.app_users;

create trigger set_app_users_updated_at
before update on public.app_users
for each row
execute function public.set_row_updated_at();

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null default public.current_clerk_user_id()
    references public.app_users(clerk_user_id) on delete cascade,
  media_key text not null,
  file_name text not null default '未命名素材',
  file_size_bytes bigint not null default 0
    check (file_size_bytes >= 0),
  duration_text text not null default '00:00',
  resolution_text text not null default '-- × --',
  flag_count integer not null default 0
    check (flag_count >= 0),
  last_opened_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (clerk_user_id, media_key)
);

drop trigger if exists set_projects_updated_at on public.projects;

create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_row_updated_at();

create table if not exists public.markers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  clerk_user_id text not null default public.current_clerk_user_id()
    references public.app_users(clerk_user_id) on delete cascade,
  flag_id text not null,
  time_seconds numeric(10, 3) not null default 0
    check (time_seconds >= 0),
  zone text not null
    check (zone in ('top', 'right', 'left', 'bottom', 'center')),
  x_ratio numeric(6, 5) not null
    check (x_ratio >= 0 and x_ratio <= 1),
  y_ratio numeric(6, 5) not null
    check (y_ratio >= 0 and y_ratio <= 1),
  platform_key text not null default 'all'
    check (platform_key in ('all', 'tiktok', 'reels', 'shorts')),
  comment text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  unique (project_id, flag_id)
);

create table if not exists public.pdf_exports (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null default public.current_clerk_user_id()
    references public.app_users(clerk_user_id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  report_type text not null
    check (report_type in ('current', 'history_all', 'history_selected', 'history_entry')),
  export_file_name text not null,
  marker_count integer not null default 0
    check (marker_count >= 0),
  project_count integer not null default 1
    check (project_count >= 0),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null default public.current_clerk_user_id()
    references public.app_users(clerk_user_id) on delete cascade,
  event_type text not null,
  project_id uuid references public.projects(id) on delete set null,
  event_date date not null default (timezone('Asia/Tokyo', now()))::date,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_app_users_plan
  on public.app_users(plan);

create index if not exists idx_projects_user_last_opened
  on public.projects(clerk_user_id, last_opened_at desc);

create index if not exists idx_markers_project_time
  on public.markers(project_id, time_seconds asc);

create index if not exists idx_markers_user_created
  on public.markers(clerk_user_id, created_at desc);

create index if not exists idx_pdf_exports_user_created
  on public.pdf_exports(clerk_user_id, created_at desc);

create index if not exists idx_usage_events_user_day_type
  on public.usage_events(clerk_user_id, event_date desc, event_type);

alter table public.app_users enable row level security;
alter table public.projects enable row level security;
alter table public.markers enable row level security;
alter table public.pdf_exports enable row level security;
alter table public.usage_events enable row level security;

drop policy if exists "app_users_select_own" on public.app_users;
create policy "app_users_select_own"
on public.app_users
for select
to authenticated
using (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "app_users_insert_own" on public.app_users;
create policy "app_users_insert_own"
on public.app_users
for insert
to authenticated
with check (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "app_users_update_own" on public.app_users;
create policy "app_users_update_own"
on public.app_users
for update
to authenticated
using (public.current_clerk_user_id() = clerk_user_id)
with check (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects
for select
to authenticated
using (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
on public.projects
for insert
to authenticated
with check (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
on public.projects
for update
to authenticated
using (public.current_clerk_user_id() = clerk_user_id)
with check (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects
for delete
to authenticated
using (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "markers_select_own" on public.markers;
create policy "markers_select_own"
on public.markers
for select
to authenticated
using (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "markers_insert_own" on public.markers;
create policy "markers_insert_own"
on public.markers
for insert
to authenticated
with check (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "markers_update_own" on public.markers;
create policy "markers_update_own"
on public.markers
for update
to authenticated
using (public.current_clerk_user_id() = clerk_user_id)
with check (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "markers_delete_own" on public.markers;
create policy "markers_delete_own"
on public.markers
for delete
to authenticated
using (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "pdf_exports_select_own" on public.pdf_exports;
create policy "pdf_exports_select_own"
on public.pdf_exports
for select
to authenticated
using (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "pdf_exports_insert_own" on public.pdf_exports;
create policy "pdf_exports_insert_own"
on public.pdf_exports
for insert
to authenticated
with check (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "usage_events_select_own" on public.usage_events;
create policy "usage_events_select_own"
on public.usage_events
for select
to authenticated
using (public.current_clerk_user_id() = clerk_user_id);

drop policy if exists "usage_events_insert_own" on public.usage_events;
create policy "usage_events_insert_own"
on public.usage_events
for insert
to authenticated
with check (public.current_clerk_user_id() = clerk_user_id);

create or replace function public.current_user_pdf_exports_today()
returns integer
language sql
stable
as $$
  select count(*)::integer
  from public.usage_events
  where clerk_user_id = public.current_clerk_user_id()
    and event_type = 'pdf_export'
    and event_date = (timezone('Asia/Tokyo', now()))::date;
$$;
