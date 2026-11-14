-- =====================================================================
-- Notable alumni: mark someone as late (deceased), optionally with the
-- year of death. The website shows their photos in grey scale.
-- =====================================================================

alter table public.notable_alumni
  add column if not exists is_deceased boolean not null default false,
  add column if not exists death_year  integer check (death_year between 1800 and 2100);

alter table public.notable_alumni
  drop constraint if exists notable_alumni_death_year_needs_late,
  add constraint notable_alumni_death_year_needs_late
    check (death_year is null or is_deceased);
