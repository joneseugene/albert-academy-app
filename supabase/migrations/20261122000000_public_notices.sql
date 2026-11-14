-- =====================================================================
-- Public notices: announcements on the website. A notice can pop up as a
-- banner when the site loads, optionally only during a display period.
-- =====================================================================

create table public.notices (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) between 1 and 200),
  body          text not null,
  is_published  boolean not null default true,
  show_banner   boolean not null default true,   -- pop up when the site loads
  banner_from   timestamptz,                     -- null = from publishing
  banner_until  timestamptz,                     -- null = no end
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  check (banner_until is null or banner_from is null or banner_until > banner_from)
);
create index notices_published_idx on public.notices (is_published, published_at desc)
  where deleted_at is null;

create trigger notices_set_updated_at before update on public.notices
  for each row execute function public.set_updated_at();

alter table public.notices enable row level security;
revoke all on public.notices from anon, authenticated;

-- School Admins manage notices like other content (Super Admins already have '*').
update public.roles
set permissions = permissions || array['notices.read', 'notices.create', 'notices.update', 'notices.delete']
where name = 'School Admin' and deleted_at is null and not ('notices.read' = any (permissions));
