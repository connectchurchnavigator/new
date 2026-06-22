-- ════════════════════════════════════════════════════════════════════════
-- EKKLESIA — core schema, search & row-level security
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- Model: organization (the church brand/account) → churches (each branch =
--        one public listing) → services / leaders / teams.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;   -- fuzzy / typo-tolerant search
create extension if not exists unaccent;  -- accent-insensitive search

-- ── enums ───────────────────────────────────────────────────────────────
do $$ begin
  create type org_role as enum ('owner','admin','editor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type church_status as enum ('draft','published');
exception when duplicate_object then null; end $$;

-- ── profiles (mirrors auth.users) ───────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── organizations (the church brand / account) ──────────────────────────
create table if not exists organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ── org membership (multi-user dashboard access) ────────────────────────
create table if not exists org_members (
  org_id     uuid not null references organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       org_role not null default 'editor',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- ── churches (each branch / location = one public listing) ───────────────
create table if not exists churches (
  id                uuid primary key default uuid_generate_v4(),
  org_id            uuid not null references organizations(id) on delete cascade,
  name              text not null,
  slug              text unique not null,
  status            church_status not null default 'draft',
  is_hq             boolean not null default false,
  is_verified       boolean not null default false,
  denomination      text,
  about             text,

  -- address: owner enters ONE line; these are parsed from Google Places
  address_line      text,
  city              text,         -- post town (e.g. "Ilford")
  area              text,         -- sublocality / district
  state             text,
  postcode          text,
  country           text,
  country_code      text,         -- ISO-3166 alpha-2
  formatted_address text,
  google_place_id   text,
  latitude          double precision,
  longitude         double precision,

  -- contact
  email     text, phone text, website text,
  facebook  text, instagram text, youtube text,

  -- media (URLs in Supabase Storage)
  cover_url text, logo_url text,
  gallery   text[] not null default '{}',

  -- filterable arrays
  ministries text[] not null default '{}',
  facilities text[] not null default '{}',
  languages  text[] not null default '{}',

  -- search (kept up to date by trigger below)
  normalized_name text,
  search_vector   tsvector,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── services ────────────────────────────────────────────────────────────
create table if not exists church_services (
  id            uuid primary key default uuid_generate_v4(),
  church_id     uuid not null references churches(id) on delete cascade,
  day           text not null,
  name          text not null,
  start_time    text,
  end_time      text,
  format        text not null default 'In-Person',  -- In-Person / Online / Hybrid
  language      text,
  livestream_url text,
  display_order int not null default 0,
  updated_at    timestamptz not null default now()
);

-- ── leaders (pastors & leadership) ──────────────────────────────────────
create table if not exists leaders (
  id            uuid primary key default uuid_generate_v4(),
  church_id     uuid not null references churches(id) on delete cascade,
  name          text not null,
  role          text,
  bio           text,
  photo_url     text,
  is_lead       boolean not null default false,
  display_order int not null default 0,
  updated_at    timestamptz not null default now()
);

-- ── teams (ministry / serving teams) ────────────────────────────────────
create table if not exists teams (
  id            uuid primary key default uuid_generate_v4(),
  church_id     uuid not null references churches(id) on delete cascade,
  name          text not null,
  icon          text,
  lead_name     text,
  member_count  int not null default 0,
  open_to_join  boolean not null default true,
  display_order int not null default 0,
  updated_at    timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════
-- INDEXES — built for 50k+ churches & fast search/filtering
-- ════════════════════════════════════════════════════════════════════════
create index if not exists churches_org_idx        on churches(org_id);
create index if not exists churches_status_idx     on churches(status);
create index if not exists churches_search_idx     on churches using gin(search_vector);
create index if not exists churches_name_trgm_idx  on churches using gin(normalized_name gin_trgm_ops);
create index if not exists churches_ministries_idx on churches using gin(ministries);
create index if not exists churches_languages_idx  on churches using gin(languages);
create index if not exists churches_city_idx       on churches(lower(city));
-- duplicate detection: same postcode + same normalized name
create unique index if not exists churches_postcode_name_uniq
  on churches(postcode, normalized_name) where postcode is not null;

create index if not exists services_church_idx on church_services(church_id);
create index if not exists leaders_church_idx  on leaders(church_id);
create index if not exists teams_church_idx    on teams(church_id);
create index if not exists org_members_user_idx on org_members(user_id);  -- speeds is_org_member()

-- ════════════════════════════════════════════════════════════════════════
-- TRIGGERS — updated_at + search vector / normalized name
-- ════════════════════════════════════════════════════════════════════════
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists churches_set_updated on churches;
create trigger churches_set_updated
  before update on churches
  for each row execute function set_updated_at();

drop trigger if exists services_set_updated on church_services;
create trigger services_set_updated before update on church_services
  for each row execute function set_updated_at();
drop trigger if exists leaders_set_updated on leaders;
create trigger leaders_set_updated before update on leaders
  for each row execute function set_updated_at();
drop trigger if exists teams_set_updated on teams;
create trigger teams_set_updated before update on teams
  for each row execute function set_updated_at();

create or replace function churches_search_refresh() returns trigger
language plpgsql as $$
begin
  new.normalized_name := lower(unaccent(coalesce(new.name,'')));
  new.search_vector :=
    setweight(to_tsvector('english', unaccent(coalesce(new.name,''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(new.denomination,''))), 'B') ||
    setweight(to_tsvector('english',
      unaccent(coalesce(new.city,'')||' '||coalesce(new.area,'')||' '||coalesce(new.postcode,''))), 'B') ||
    setweight(to_tsvector('english', unaccent(coalesce(array_to_string(new.ministries,' '),''))), 'C') ||
    setweight(to_tsvector('english', unaccent(coalesce(array_to_string(new.languages,' '),''))), 'C') ||
    setweight(to_tsvector('english', unaccent(coalesce(new.about,''))), 'D');
  return new;
end; $$;

drop trigger if exists churches_search_trg on churches;
create trigger churches_search_trg
  before insert or update on churches
  for each row execute function churches_search_refresh();

-- ════════════════════════════════════════════════════════════════════════
-- SEARCH + HOME FEED (callable from the client via supabase.rpc)
-- ════════════════════════════════════════════════════════════════════════

-- Full-text + fuzzy church search across PUBLISHED listings, with filters.
create or replace function search_churches(
  q              text default '',
  p_city         text default null,
  p_denomination text default null,
  p_ministry     text default null,
  p_language     text default null,
  p_limit        int  default 20,
  p_offset       int  default 0
) returns setof churches
language sql stable as $$
  select c.*
  from churches c
  where c.status = 'published'
    and (
      q = '' 
      or c.search_vector @@ websearch_to_tsquery('english', unaccent(q))
      or c.normalized_name % lower(unaccent(q))            -- trigram / typo tolerant
    )
    and (p_city         is null or lower(c.city) = lower(p_city))
    and (p_denomination is null or c.denomination = p_denomination)
    and (p_ministry     is null or c.ministries @> array[p_ministry])
    and (p_language     is null or c.languages  @> array[p_language])
  order by
    case when q = '' then 0
         else ts_rank(c.search_vector, websearch_to_tsquery('english', unaccent(q))) end desc,
    c.is_verified desc,
    c.created_at desc
  limit greatest(p_limit, 1) offset greatest(p_offset, 0);
$$;

-- Home-page feed: newest verified/published churches.
create or replace function home_churches(p_limit int default 12)
returns setof churches
language sql stable as $$
  select * from churches
  where status = 'published'
  order by is_verified desc, created_at desc
  limit greatest(p_limit, 1);
$$;

-- ════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY
-- Public can read PUBLISHED listings. Org members can manage their own data.
-- ════════════════════════════════════════════════════════════════════════
alter table profiles        enable row level security;
alter table organizations   enable row level security;
alter table org_members     enable row level security;
alter table churches        enable row level security;
alter table church_services enable row level security;
alter table leaders         enable row level security;
alter table teams           enable row level security;

-- helper: is the current user a member of this org?
create or replace function is_org_member(p_org uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from org_members m
    where m.org_id = p_org and m.user_id = (select auth.uid())
  );
$$;

-- helper: which org owns a given church?
create or replace function church_org(p_church uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select org_id from churches where id = p_church;
$$;

-- profiles
drop policy if exists "profiles read all" on profiles;
create policy "profiles read all" on profiles for select using (true);
drop policy if exists "profiles write self" on profiles;
create policy "profiles write self" on profiles for all
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- organizations
drop policy if exists "org read members" on organizations;
create policy "org read members" on organizations for select
  using (owner_id = (select auth.uid()) or is_org_member(id));
drop policy if exists "org insert owner" on organizations;
create policy "org insert owner" on organizations for insert
  with check (owner_id = (select auth.uid()));
drop policy if exists "org update owner" on organizations;
create policy "org update owner" on organizations for update
  using (owner_id = auth.uid()) with check (owner_id = (select auth.uid()));

-- org_members
drop policy if exists "members read own org" on org_members;
create policy "members read own org" on org_members for select
  using (is_org_member(org_id));
drop policy if exists "owner manages members" on org_members;
create policy "owner manages members" on org_members for all
  using (exists(select 1 from organizations o where o.id = org_id and o.owner_id = (select auth.uid())))
  with check (exists(select 1 from organizations o where o.id = org_id and o.owner_id = (select auth.uid())));

-- churches: public reads published; members manage their org's churches
drop policy if exists "church public read" on churches;
create policy "church public read" on churches for select
  using (status = 'published' or is_org_member(org_id));
drop policy if exists "church members manage" on churches;
create policy "church members manage" on churches for all
  using (is_org_member(org_id)) with check (is_org_member(org_id));

-- services / leaders / teams: read if parent published; members manage
drop policy if exists "services public read" on church_services;
create policy "services public read" on church_services for select
  using (exists(select 1 from churches c where c.id = church_id
               and (c.status='published' or is_org_member(c.org_id))));
drop policy if exists "services members manage" on church_services;
create policy "services members manage" on church_services for all
  using (is_org_member(church_org(church_id)))
  with check (is_org_member(church_org(church_id)));

drop policy if exists "leaders public read" on leaders;
create policy "leaders public read" on leaders for select
  using (exists(select 1 from churches c where c.id = church_id
               and (c.status='published' or is_org_member(c.org_id))));
drop policy if exists "leaders members manage" on leaders;
create policy "leaders members manage" on leaders for all
  using (is_org_member(church_org(church_id)))
  with check (is_org_member(church_org(church_id)));

drop policy if exists "teams public read" on teams;
create policy "teams public read" on teams for select
  using (exists(select 1 from churches c where c.id = church_id
               and (c.status='published' or is_org_member(c.org_id))));
drop policy if exists "teams members manage" on teams;
create policy "teams members manage" on teams for all
  using (is_org_member(church_org(church_id)))
  with check (is_org_member(church_org(church_id)));

-- When someone creates an organization, make them an owner-member.
create or replace function org_add_owner_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into org_members (org_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end; $$;

drop trigger if exists org_owner_member_trg on organizations;
create trigger org_owner_member_trg
  after insert on organizations
  for each row execute function org_add_owner_member();
