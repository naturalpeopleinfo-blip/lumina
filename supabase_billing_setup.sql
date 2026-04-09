-- Lumina Zone: Stripe billing support
-- Run this once in Supabase SQL Editor before enabling automatic PRO sync.

alter table public.app_users
  add column if not exists stripe_customer_id text;

alter table public.app_users
  add column if not exists stripe_subscription_id text;

alter table public.app_users
  add column if not exists stripe_subscription_status text;

alter table public.app_users
  add column if not exists pro_activated_at timestamptz;

create unique index if not exists idx_app_users_stripe_customer_id_unique
  on public.app_users (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists idx_app_users_stripe_subscription_id_unique
  on public.app_users (stripe_subscription_id)
  where stripe_subscription_id is not null;
