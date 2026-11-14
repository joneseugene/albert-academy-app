-- =====================================================================
-- Flexible dates for activities and news: a single date, a date range,
-- a year or a range of years.
--
-- `*_precision` says how to read the dates:
--   'day'  -> start/end are exact days (end null = a single day)
--   'year' -> whole years: 2019 is stored as 2019-01-01 … 2019-12-31
-- start/end stay real dates, so sorting and upcoming/ongoing/past still work.
-- =====================================================================

alter table public.activities
  add column if not exists date_precision text not null default 'day'
    check (date_precision in ('day', 'year'));

-- News: when the story happened (optional; the publish date is used otherwise).
alter table public.news
  add column if not exists event_precision text check (event_precision in ('day', 'year')),
  add column if not exists event_start     date,
  add column if not exists event_end       date;

alter table public.news
  drop constraint if exists news_event_dates_check,
  add constraint news_event_dates_check check (
    (event_start is null and event_end is null and event_precision is null)
    or (event_start is not null and event_precision is not null
        and (event_end is null or event_end >= event_start))
  );
