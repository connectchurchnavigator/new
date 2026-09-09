-- ============================================================
-- Ekklesia — Worship Leaders schema
-- Run this in the Supabase SQL editor (or via `supabase db push`
-- if you're using the Supabase CLI with this migrations folder).
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- 1. WORSHIP LEADERS — core profile table
-- ----------------------------------------------------------------
create table if not exists public.worship_leaders (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  owner_id            uuid not null references auth.users(id) on delete cascade,

  -- Identity
  display_name        text not null,
  tagline             text,
  avatar_url          text,
  cover_photo_urls    text[] default '{}',

  -- Location
  city                text,
  country             text default 'United Kingdom',

  -- Bio
  bio                 text,
  years_leading       int,

  -- Availability & Booking
  travel_range        text,                            -- e.g. "International", "UK only"
  lead_time           text,                            -- e.g. "2 weeks min"
  
  -- Social Links / Media URLs (other than native storage)
  website_url         text,
  instagram_url       text,
  youtube_url         text,
  spotify_url         text,

  -- Status / verification
  is_verified         boolean not null default false,
  is_published        boolean not null default false,
  view_count          int not null default 0,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists worship_leaders_slug_idx on public.worship_leaders (slug);
create index if not exists worship_leaders_published_idx on public.worship_leaders (is_published);

-- ----------------------------------------------------------------
-- 2. WORSHIP LEADER TAGS — covers styles, instruments, 
--    languages, available_for, fee_model via a `category` column
-- ----------------------------------------------------------------
create table if not exists public.worship_leader_tags (
  id                uuid primary key default gen_random_uuid(),
  worship_leader_id uuid not null references public.worship_leaders(id) on delete cascade,
  category          text not null check (category in ('style', 'instrument', 'language', 'available_for', 'fee_model')),
  label             text not null
);

create index if not exists worship_leader_tags_wlid_idx on public.worship_leader_tags (worship_leader_id);


-- ----------------------------------------------------------------
-- updated_at trigger for worship_leaders
-- ----------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists worship_leaders_set_updated_at on public.worship_leaders;
create trigger worship_leaders_set_updated_at
  before update on public.worship_leaders
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.worship_leaders enable row level security;
alter table public.worship_leader_tags enable row level security;

create policy "Public can read published worship leaders"
  on public.worship_leaders for select
  using (is_published = true);

create policy "Public can read tags of published worship leaders"
  on public.worship_leader_tags for select
  using (exists (select 1 from public.worship_leaders w where w.id = worship_leader_id and w.is_published = true));

