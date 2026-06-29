-- ============================================================
-- Ekklesia — Pastor Profiles schema
-- Run this in the Supabase SQL editor (or via `supabase db push`
-- if you're using the Supabase CLI with this migrations folder).
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- 1. CHURCHES (minimal stub table — only what pastors need to link to)
-- If you already created a fuller `churches` table for the church
-- onboarding flow, skip this block and just make sure the column
-- names line up, or adjust the foreign key below to match.
-- ----------------------------------------------------------------
create table if not exists public.churches (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique not null,
  denomination  text,
  city          text,
  member_count  int,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- 2. PASTORS — core profile table
-- ----------------------------------------------------------------
create table if not exists public.pastors (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,

  -- Identity
  full_name           text not null,
  title               text,                          -- e.g. "Senior Pastor"
  initials            text,                           -- monogram fallback, e.g. "JO"
  avatar_url          text,
  cover_photo_urls    text[] default '{}',             -- hero slider images

  -- Church link
  church_id           uuid references public.churches(id) on delete set null,
  church_name_cache   text,                            -- denormalised for fast display

  -- Location
  city                text,
  country             text default 'United Kingdom',

  -- Bio / vision
  bio                 text,
  vision_statement    text,
  years_in_ministry   int,
  churches_planted    int,
  nations_reached     int,
  books_published     int,
  events_spoken       int,

  -- Contact
  phone               text,
  email               text,
  website_url         text,

  -- Social
  facebook_url        text,
  facebook_followers   int,
  instagram_url        text,
  instagram_followers  int,
  youtube_url          text,
  youtube_subscribers  int,
  twitter_url           text,
  twitter_followers     int,
  whatsapp_url           text,

  -- Availability
  travel_range        text,                            -- e.g. "International", "UK only"
  lead_time            text,                            -- e.g. "2 weeks min"
  availability_status text default 'available',         -- available | limited | unavailable
  availability_note    text,                            -- e.g. "Open 2025"

  -- Status / verification
  is_verified          boolean not null default false,
  is_published          boolean not null default false,  -- false while in onboarding draft
  view_count             int not null default 0,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists pastors_slug_idx on public.pastors (slug);
create index if not exists pastors_church_id_idx on public.pastors (church_id);
create index if not exists pastors_published_idx on public.pastors (is_published);

-- ----------------------------------------------------------------
-- 3. PASTOR LANGUAGES (many-to-many style, simple text array works
--    fine at this scale — kept as its own table only if you want
--    to query/filter pastors by language later)
-- ----------------------------------------------------------------
create table if not exists public.pastor_languages (
  pastor_id  uuid not null references public.pastors(id) on delete cascade,
  language   text not null,
  primary key (pastor_id, language)
);

-- ----------------------------------------------------------------
-- 4. PASTOR TAGS — covers Preaching Specialisms, Ministry Areas,
--    Available For, generically via a `category` column so the
--    onboarding wizard's step-3-equivalent can write to one table.
-- ----------------------------------------------------------------
create table if not exists public.pastor_tags (
  id          uuid primary key default gen_random_uuid(),
  pastor_id   uuid not null references public.pastors(id) on delete cascade,
  category    text not null check (category in ('preaching', 'ministry_area', 'available_for')),
  label       text not null
);

create index if not exists pastor_tags_pastor_id_idx on public.pastor_tags (pastor_id);

-- ----------------------------------------------------------------
-- 5. PASTOR EDUCATION
-- ----------------------------------------------------------------
create table if not exists public.pastor_education (
  id           uuid primary key default gen_random_uuid(),
  pastor_id    uuid not null references public.pastors(id) on delete cascade,
  degree       text not null,
  institution  text not null,
  year_range   text,                                    -- e.g. "2014 – 2017"
  detail       text,                                     -- e.g. dissertation topic
  sort_order   int not null default 0
);

create index if not exists pastor_education_pastor_id_idx on public.pastor_education (pastor_id);

-- ----------------------------------------------------------------
-- 6. PASTOR MINISTRY JOURNEY (timeline)
-- ----------------------------------------------------------------
create table if not exists public.pastor_timeline (
  id           uuid primary key default gen_random_uuid(),
  pastor_id    uuid not null references public.pastors(id) on delete cascade,
  year         text not null,
  title        text not null,
  description  text,
  icon         text,                                     -- tabler icon name, e.g. "building-church"
  sort_order   int not null default 0
);

create index if not exists pastor_timeline_pastor_id_idx on public.pastor_timeline (pastor_id);

-- ----------------------------------------------------------------
-- 7. PASTOR SERMONS
-- ----------------------------------------------------------------
create table if not exists public.pastor_sermons (
  id            uuid primary key default gen_random_uuid(),
  pastor_id     uuid not null references public.pastors(id) on delete cascade,
  title         text not null,
  series        text,
  youtube_url   text,
  thumbnail_url text,
  duration_min  int,
  views         int default 0,
  likes         int default 0,
  published_at  timestamptz,
  sort_order    int not null default 0
);

create index if not exists pastor_sermons_pastor_id_idx on public.pastor_sermons (pastor_id);

-- ----------------------------------------------------------------
-- 8. PASTOR EVENTS
-- ----------------------------------------------------------------
create table if not exists public.pastor_events (
  id            uuid primary key default gen_random_uuid(),
  pastor_id     uuid not null references public.pastors(id) on delete cascade,
  title         text not null,
  event_date    date not null,
  location      text,
  start_time    text,
  tags          text[] default '{}',
  registration_url text,
  sort_order    int not null default 0
);

create index if not exists pastor_events_pastor_id_idx on public.pastor_events (pastor_id);

-- ----------------------------------------------------------------
-- 9. PASTOR GALLERY
-- ----------------------------------------------------------------
create table if not exists public.pastor_gallery (
  id          uuid primary key default gen_random_uuid(),
  pastor_id   uuid not null references public.pastors(id) on delete cascade,
  image_url   text not null,
  caption     text,
  sort_order  int not null default 0
);

create index if not exists pastor_gallery_pastor_id_idx on public.pastor_gallery (pastor_id);

-- ----------------------------------------------------------------
-- 10. PASTOR AFFILIATIONS (denominational bodies, fellowships)
-- ----------------------------------------------------------------
create table if not exists public.pastor_affiliations (
  id           uuid primary key default gen_random_uuid(),
  pastor_id    uuid not null references public.pastors(id) on delete cascade,
  organisation text not null,
  role         text,                                     -- e.g. "Ordained minister · Since 2006"
  sort_order   int not null default 0
);

create index if not exists pastor_affiliations_pastor_id_idx on public.pastor_affiliations (pastor_id);

-- ----------------------------------------------------------------
-- 11. PASTOR AWARDS
-- ----------------------------------------------------------------
create table if not exists public.pastor_awards (
  id           uuid primary key default gen_random_uuid(),
  pastor_id    uuid not null references public.pastors(id) on delete cascade,
  title        text not null,
  issuer       text,                                      -- e.g. "Mayor of Redbridge · 2023"
  sort_order   int not null default 0
);

create index if not exists pastor_awards_pastor_id_idx on public.pastor_awards (pastor_id);

-- ----------------------------------------------------------------
-- 12. PASTOR REVIEWS
-- ----------------------------------------------------------------
create table if not exists public.pastor_reviews (
  id              uuid primary key default gen_random_uuid(),
  pastor_id       uuid not null references public.pastors(id) on delete cascade,
  reviewer_name   text not null,
  reviewer_role   text,                                    -- e.g. "Pastor, Calvary Chapel Birmingham"
  rating          int not null check (rating between 1 and 5),
  comment         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists pastor_reviews_pastor_id_idx on public.pastor_reviews (pastor_id);

-- ----------------------------------------------------------------
-- 13. ENQUIRIES — from the "Contact Pastor" / "Send Enquiry" buttons
-- ----------------------------------------------------------------
create table if not exists public.pastor_enquiries (
  id            uuid primary key default gen_random_uuid(),
  pastor_id     uuid not null references public.pastors(id) on delete cascade,
  sender_name   text not null,
  sender_email  text not null,
  message       text not null,
  event_type    text,                                      -- e.g. "Conference", "Sunday service"
  status        text not null default 'new' check (status in ('new', 'read', 'responded', 'archived')),
  created_at    timestamptz not null default now()
);

create index if not exists pastor_enquiries_pastor_id_idx on public.pastor_enquiries (pastor_id);

-- ----------------------------------------------------------------
-- updated_at trigger for pastors
-- ----------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists pastors_set_updated_at on public.pastors;
create trigger pastors_set_updated_at
  before update on public.pastors
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Public (anon) visitors can only READ published pastor profiles
-- and their related child records. Writing (onboarding submissions,
-- edits) happens through API routes using the service role key,
-- which bypasses RLS entirely — so these policies are the
-- "browser using the anon key" safety net, not the only gate.

alter table public.pastors enable row level security;
alter table public.pastor_languages enable row level security;
alter table public.pastor_tags enable row level security;
alter table public.pastor_education enable row level security;
alter table public.pastor_timeline enable row level security;
alter table public.pastor_sermons enable row level security;
alter table public.pastor_events enable row level security;
alter table public.pastor_gallery enable row level security;
alter table public.pastor_affiliations enable row level security;
alter table public.pastor_awards enable row level security;
alter table public.pastor_reviews enable row level security;
alter table public.pastor_enquiries enable row level security;

create policy "Public can read published pastors"
  on public.pastors for select
  using (is_published = true);

create policy "Public can read languages of published pastors"
  on public.pastor_languages for select
  using (exists (select 1 from public.pastors p where p.id = pastor_id and p.is_published = true));

create policy "Public can read tags of published pastors"
  on public.pastor_tags for select
  using (exists (select 1 from public.pastors p where p.id = pastor_id and p.is_published = true));

create policy "Public can read education of published pastors"
  on public.pastor_education for select
  using (exists (select 1 from public.pastors p where p.id = pastor_id and p.is_published = true));

create policy "Public can read timeline of published pastors"
  on public.pastor_timeline for select
  using (exists (select 1 from public.pastors p where p.id = pastor_id and p.is_published = true));

create policy "Public can read sermons of published pastors"
  on public.pastor_sermons for select
  using (exists (select 1 from public.pastors p where p.id = pastor_id and p.is_published = true));

create policy "Public can read events of published pastors"
  on public.pastor_events for select
  using (exists (select 1 from public.pastors p where p.id = pastor_id and p.is_published = true));

create policy "Public can read gallery of published pastors"
  on public.pastor_gallery for select
  using (exists (select 1 from public.pastors p where p.id = pastor_id and p.is_published = true));

create policy "Public can read affiliations of published pastors"
  on public.pastor_affiliations for select
  using (exists (select 1 from public.pastors p where p.id = pastor_id and p.is_published = true));

create policy "Public can read awards of published pastors"
  on public.pastor_awards for select
  using (exists (select 1 from public.pastors p where p.id = pastor_id and p.is_published = true));

create policy "Public can read reviews of published pastors"
  on public.pastor_reviews for select
  using (exists (select 1 from public.pastors p where p.id = pastor_id and p.is_published = true));

-- Enquiries are write-only from the public's perspective (no select
-- policy at all means anon cannot read other people's enquiries).
create policy "Public can submit enquiries"
  on public.pastor_enquiries for insert
  with check (true);

-- ============================================================
-- STORAGE — bucket for avatar / cover / gallery uploads
-- ============================================================
insert into storage.buckets (id, name, public)
values ('pastor-media', 'pastor-media', true)
on conflict (id) do nothing;

create policy "Public can view pastor media"
  on storage.objects for select
  using (bucket_id = 'pastor-media');

create policy "Anyone can upload pastor media"
  on storage.objects for insert
  with check (bucket_id = 'pastor-media');
