-- Lumina Zone: cancellation state support
-- Run this once in Supabase SQL Editor if stripe billing sync is already enabled.

alter table public.app_users
  add column if not exists billing_cancel_at_period_end boolean not null default false;

alter table public.app_users
  add column if not exists billing_current_period_end timestamptz;
