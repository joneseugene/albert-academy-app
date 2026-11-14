-- =====================================================================
-- Live streams: YouTube / Facebook links managed in the admin and embedded
-- on the website (/live, home page banner). The app turns the pasted link
-- and these settings into the embed — no code per stream.
-- =====================================================================

create table public.livestreams (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  platform       text not null check (platform in ('youtube', 'facebook')),
  source_url     text not null,
  status         text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended')),
  starts_at      timestamptz,
  ends_at        timestamptz,
  photo_url      text,
  is_featured    boolean not null default true,   -- home page banner while upcoming / live
  show_replay    boolean not null default true,   -- keep on the website after it ends
  -- Player settings
  autoplay       boolean not null default true,
  start_muted    boolean not null default true,   -- browsers only autoplay muted video
  show_controls  boolean not null default true,   -- YouTube only
  show_chat      boolean not null default false,  -- YouTube videos only
  privacy_mode   boolean not null default false,  -- youtube-nocookie.com
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index livestreams_status_idx on public.livestreams (status, starts_at) where deleted_at is null;

create trigger livestreams_set_updated_at before update on public.livestreams
  for each row execute function public.set_updated_at();

alter table public.livestreams enable row level security;
revoke all on public.livestreams from anon, authenticated;

-- School Admins manage live streams like other content (Super Admins already have '*').
update public.roles
set permissions = permissions
  || array['livestreams.read', 'livestreams.create', 'livestreams.update', 'livestreams.delete']
where name = 'School Admin' and deleted_at is null and not ('livestreams.read' = any (permissions));
