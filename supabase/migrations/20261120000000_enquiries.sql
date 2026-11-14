-- =====================================================================
-- Enquiries sent from the website's contact form, read in the admin.
-- =====================================================================

create table public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  email       citext not null,
  phone       text,
  topic       text not null default 'general',  -- admissions | general | alumni | media | other
  message     text not null check (char_length(message) between 1 and 5000),
  status      text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index enquiries_status_idx on public.enquiries (status, created_at desc) where deleted_at is null;

create trigger enquiries_set_updated_at before update on public.enquiries
  for each row execute function public.set_updated_at();

alter table public.enquiries enable row level security;
revoke all on public.enquiries from anon, authenticated;

-- School Admins read and answer enquiries (Super Admins already have '*').
update public.roles
set permissions = permissions || array['enquiries.read', 'enquiries.update', 'enquiries.delete']
where name = 'School Admin' and deleted_at is null and not ('enquiries.read' = any (permissions));
