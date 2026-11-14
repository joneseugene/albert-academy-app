-- =====================================================================
-- 1. School Info: the person the school is named after.
-- 2. "Did you know?" — short facts for the public website.
-- =====================================================================

-- ---------- Namesake --------------------------------------------------

alter table public.school_info
  add column namesake_name       text,
  add column namesake_photo_url  text,
  -- Free text so partial or historical dates fit: "1850", "12 March 1850, Ohio, USA".
  add column namesake_birth      text,
  add column namesake_death      text,
  add column namesake_about      text;

-- ---------- Did you know? ---------------------------------------------

create table public.facts (
  id            uuid primary key default gen_random_uuid(),
  fact          text not null check (char_length(fact) between 1 and 400),
  is_published  boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index facts_published_idx on public.facts (is_published, sort_order) where deleted_at is null;

create trigger facts_set_updated_at before update on public.facts
  for each row execute function public.set_updated_at();

alter table public.facts enable row level security;
revoke all on public.facts from anon, authenticated;

-- School Admins manage facts like other content (Super Admins already have '*').
update public.roles
set permissions = permissions || array['facts.read', 'facts.create', 'facts.update', 'facts.delete']
where name = 'School Admin' and deleted_at is null and not ('facts.read' = any (permissions));
