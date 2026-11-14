-- =====================================================================
-- "Forgot password": one-time 6-digit codes sent by email.
-- Only an HMAC of the code is stored; codes expire after 15 minutes, allow
-- 5 tries, and asking for a new code cancels the previous one.
-- =====================================================================

create table public.password_reset_codes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  code_hash   text not null,
  expires_at  timestamptz not null,
  attempts    integer not null default 0,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index password_reset_codes_user_idx on public.password_reset_codes (user_id, created_at desc)
  where used_at is null;

alter table public.password_reset_codes enable row level security;
revoke all on public.password_reset_codes from anon, authenticated;
