-- ============================================================
-- Ekklesia — Add Media URLs to Worship Leaders
-- ============================================================

-- Add song_url and video_url columns to worship_leaders
-- (cover_photo_urls already exists as text[])

alter table public.worship_leaders
  add column if not exists song_url text,
  add column if not exists video_url text;
