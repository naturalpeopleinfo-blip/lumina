-- Lumina Zone: FREE / PRO rollout update
-- Run this once in Supabase SQL Editor if your current app_users table
-- was created before FREE / PRO plan support was added.

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'app_users_plan_check'
      and conrelid = 'public.app_users'::regclass
  ) then
    alter table public.app_users
      drop constraint app_users_plan_check;
  end if;
end
$$;

alter table public.app_users
  add constraint app_users_plan_check
  check (plan in ('free', 'pro', 'beta_pro', 'team'));

alter table public.app_users
  alter column beta_unlocked set default false;

alter table public.app_users
  alter column daily_limit set default 2;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'pdf_exports_report_type_check'
      and conrelid = 'public.pdf_exports'::regclass
  ) then
    alter table public.pdf_exports
      drop constraint pdf_exports_report_type_check;
  end if;
end
$$;

-- Normalize existing rows before tightening the report_type check.
-- Older versions stored the history export as 'today'.
update public.pdf_exports
set report_type = case
  when report_type = 'today' then 'history_all'
  when report_type = 'selected' then 'history_selected'
  when report_type = 'entry' then 'history_entry'
  else report_type
end
where report_type in ('today', 'selected', 'entry');

alter table public.pdf_exports
  add constraint pdf_exports_report_type_check
  check (report_type in ('current', 'history_all', 'history_selected', 'history_entry'));

-- Optional rollout examples:
-- 1) Existing free usersを通常無料枠へ戻す
-- update public.app_users
-- set plan = 'free',
--     daily_limit = 2,
--     beta_unlocked = false
-- where plan = 'free';
--
-- 2) 個別ユーザーを PRO にする
-- update public.app_users
-- set plan = 'pro',
--     daily_limit = 9999,
--     beta_unlocked = false
-- where email = 'example@example.com';
--
-- 3) テスターだけ無料βを維持する
-- update public.app_users
-- set beta_unlocked = true
-- where email in ('tester1@example.com', 'tester2@example.com');
