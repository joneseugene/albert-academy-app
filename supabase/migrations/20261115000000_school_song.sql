-- =====================================================================
-- School song: title, credits, audio file and lyrics.
-- Lyrics are plain text, one line per lyric line; a blank line separates
-- verses. A line may start with a [mm:ss.xx] timestamp (set with the
-- "Sync lyrics" tool in the admin) for word-perfect scrolling.
-- =====================================================================

alter table public.school_info
  add column song_title      text,
  add column song_credits    text,   -- e.g. "Words: …  ·  Music: …"
  add column song_audio_url  text,
  add column song_lyrics     text;

-- Public bucket for the song recording. Uploaded straight from the admin's
-- browser with a one-time signed URL (no app server size limits).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audio', 'audio', true, 31457280,
  array['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
