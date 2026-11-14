-- =====================================================================
-- Albert Academy Admin — initial schema
--
-- Auth is the app's own (src/server/auth/native), NOT Supabase Auth.
-- The Next.js server talks to Postgres with the service-role key after its
-- own permission checks. Every table has RLS enabled with NO policies and
-- no grants for anon/authenticated, so the public API keys can read or
-- write nothing.
--
-- Soft delete: content and user rows are never removed by the app; a
-- delete stamps `deleted_at` and every read filters it out.
-- =====================================================================

create extension if not exists citext;

-- ---------- updated_at ------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Roles (bundles of permission strings) ---------------------

create table public.roles (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 2 and 50),
  description  text,
  permissions  text[] not null default '{}',
  is_system    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create unique index roles_name_key on public.roles (lower(name)) where deleted_at is null;

-- ---------- Users -----------------------------------------------------

create table public.users (
  id                     uuid primary key default gen_random_uuid(),
  email                  citext not null,
  first_name             text not null check (char_length(first_name) between 1 and 100),
  last_name              text not null check (char_length(last_name) between 1 and 100),
  phone                  text,
  avatar_url             text,
  role_id                uuid references public.roles (id),
  password_hash          text,
  status                 text not null default 'active' check (status in ('active', 'blocked')),
  failed_login_attempts  integer not null default 0,
  locked_until           timestamptz,
  last_login_at          timestamptz,
  password_changed_at    timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  deleted_at             timestamptz
);
-- One live account per email; a deleted account's email can be reused.
create unique index users_email_key on public.users (email) where deleted_at is null;
create index users_role_id_idx on public.users (role_id);

-- Read model for the Users page (never exposes the password hash).
create view public.users_view
with (security_invoker = true) as
select
  u.id, u.email::text as email, u.first_name, u.last_name, u.phone, u.avatar_url, u.status,
  u.role_id, r.name as role_name, coalesce(r.permissions, '{}') as role_permissions,
  u.last_login_at, u.created_at, u.updated_at, u.deleted_at
from public.users u
left join public.roles r on r.id = u.role_id and r.deleted_at is null;

-- ---------- Sessions (refresh tokens, stored hashed) ------------------

create table public.auth_sessions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.users (id) on delete cascade,
  token_hash           text not null unique,
  previous_token_hash  text,
  rotated_at           timestamptz,
  persistent           boolean not null default false,
  expires_at           timestamptz not null,
  revoked_at           timestamptz,
  user_agent           text,
  ip                   text,
  created_at           timestamptz not null default now(),
  last_used_at         timestamptz
);
create index auth_sessions_user_id_idx on public.auth_sessions (user_id);
create index auth_sessions_previous_token_hash_idx on public.auth_sessions (previous_token_hash);

-- ---------- Rate limits (sign-in per IP) ------------------------------

create table public.rate_limits (
  key           text primary key,
  window_start  timestamptz not null,
  hits          integer not null
);

create or replace function public.hit_rate_limit(
  p_key text, p_limit integer, p_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql set search_path = '' as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window interval := make_interval(secs => p_window_seconds);
  r public.rate_limits;
begin
  insert into public.rate_limits as rl (key, window_start, hits)
  values (p_key, v_now, 1)
  on conflict (key) do update set
    hits = case when rl.window_start + v_window <= v_now then 1 else rl.hits + 1 end,
    window_start = case when rl.window_start + v_window <= v_now then v_now else rl.window_start end
  returning * into r;

  if random() < 0.01 then
    delete from public.rate_limits where window_start < v_now - interval '1 day';
  end if;

  return query select
    r.hits <= p_limit,
    greatest(0, ceil(extract(epoch from (r.window_start + v_window - v_now))))::integer;
end $$;

-- ---------- School information (single row) ---------------------------

create table public.school_info (
  id            smallint primary key default 1 check (id = 1),
  name          text not null,
  motto         text,
  founded_year  integer,
  logo_url      text,
  vision        text,
  mission       text,
  about         text,
  history       text,
  core_values   text[] not null default '{}',
  -- [{ "type": "phone|email|address|website|po_box|other", "label": "...", "value": "..." }]
  contacts      jsonb not null default '[]' check (jsonb_typeof(contacts) = 'array'),
  -- [{ "platform": "facebook|instagram|x|youtube|tiktok|linkedin|whatsapp|other", "handle": "..." }]
  social_links  jsonb not null default '[]' check (jsonb_typeof(social_links) = 'array'),
  updated_at    timestamptz not null default now()
);

-- ---------- Content ---------------------------------------------------

create table public.notable_alumni (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  nickname    text,
  class_year  text,          -- e.g. "2009/2010"
  position    text,
  summary     text,
  detail      text,
  photo_url   text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table public.leaders (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  title       text not null default 'Principal',
  photo_url   text,
  from_year   integer not null,
  to_year     integer,       -- null = currently in office
  summary     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  check (to_year is null or to_year >= from_year)
);

create table public.administrators (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  position    text not null,
  photo_url   text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table public.news (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  photo_url     text,
  summary       text,
  content       text not null,
  status        text not null default 'draft' check (status in ('draft', 'published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index news_status_idx on public.news (status, published_at desc) where deleted_at is null;

create table public.academic_resources (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  url          text not null,
  photo_url    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table public.gallery_items (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  photo_url    text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table public.activities (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  category     text not null,  -- academic | sports | entertainment | cultural | … (see app config)
  description  text,
  photo_url    text,
  start_date   date not null,
  end_date     date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  check (end_date is null or end_date >= start_date)
);
create index activities_category_idx on public.activities (category) where deleted_at is null;

-- ---------- Triggers --------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'roles', 'users', 'school_info', 'notable_alumni', 'leaders', 'administrators',
    'news', 'academic_resources', 'gallery_items', 'activities'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end $$;

-- ---------- Lock down: server (service role) only ---------------------

do $$
declare t text;
begin
  foreach t in array array[
    'roles', 'users', 'auth_sessions', 'rate_limits', 'school_info', 'notable_alumni',
    'leaders', 'administrators', 'news', 'academic_resources', 'gallery_items', 'activities'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

revoke all on public.users_view from anon, authenticated;
revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- ---------- Storage: public bucket for uploaded images ----------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------- Seed ------------------------------------------------------

insert into public.roles (name, description, permissions, is_system) values
  ('Super Admin', 'Full access to everything, including users', '{*}', true),
  ('School Admin', 'Manages website content (no user management)', array[
    'school.read', 'school.update',
    'leadership.read', 'leadership.create', 'leadership.update', 'leadership.delete',
    'administration.read', 'administration.create', 'administration.update', 'administration.delete',
    'alumni.read', 'alumni.create', 'alumni.update', 'alumni.delete',
    'news.read', 'news.create', 'news.update', 'news.delete',
    'activities.read', 'activities.create', 'activities.update', 'activities.delete',
    'gallery.read', 'gallery.create', 'gallery.update', 'gallery.delete',
    'resources.read', 'resources.create', 'resources.update', 'resources.delete'
  ], true);

insert into public.school_info (id, name, motto, founded_year)
values (1, 'Albert Academy Secondary School', null, 1904);

-- The first Super Admin is created with `pnpm seed:admin` (hashes the password in the app).
