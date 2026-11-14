-- =====================================================================
-- School About photo: a picture of the school shown with the About text
-- (About page and the home page's "Who we are" section).
-- =====================================================================

alter table public.school_info
  add column if not exists about_photo_url text;
