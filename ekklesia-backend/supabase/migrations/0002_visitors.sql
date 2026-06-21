-- ════════════════════════════════════════════════════════════════════════
-- EKKLESIA — visitor tracking (owner-only) + anonymous listing traffic
-- Run after 0001_init.sql.
--   visitors      : known people a church tracks (PRIVATE — owner only)
--   check_ins     : each visit/check-in event
--   listing_views : anonymous aggregate web traffic (NO personal data)
-- ════════════════════════════════════════════════════════════════════════

do $$ begin
  create type visitor_stage as enum
    ('discovery','first','returning','engaged','member','leader');
exception when duplicate_object then null; end $$;

-- ── visitors (known people — strictly owner-only) ───────────────────────
create table if not exists visitors (
  id           uuid primary key default uuid_generate_v4(),
  church_id    uuid not null references churches(id) on delete cascade,
  name         text,
  email        text,
  phone        text,
  city         text,
  stage        visitor_stage not null default 'first',
  source       text,                       -- Friend / Google / Walk-in / Instagram / Invited / Event
  first_seen   date not null default current_date,
  last_seen    date,
  visits_count int  not null default 0,
  emails_sent  int  not null default 0,
  is_at_risk   boolean not null default false,
  notes        text,
  created_at   timestamptz not null default now()
);

-- ── check-ins (each attendance / QR check-in) ───────────────────────────
create table if not exists check_ins (
  id            uuid primary key default uuid_generate_v4(),
  church_id     uuid not null references churches(id) on delete cascade,
  visitor_id    uuid references visitors(id) on delete set null,
  service_id    uuid references church_services(id) on delete set null,
  checked_in_at timestamptz not null default now(),
  is_first_time boolean not null default false
);

-- ── anonymous listing traffic (aggregate only, no PII) ──────────────────
create table if not exists listing_views (
  id         bigint generated always as identity primary key,
  church_id  uuid not null references churches(id) on delete cascade,
  viewed_at  timestamptz not null default now(),
  source     text,    -- search / direct / social / referral
  device     text,    -- mobile / desktop / tablet
  city       text
);

create index if not exists visitors_church_idx     on visitors(church_id);
create index if not exists visitors_stage_idx       on visitors(church_id, stage);
create index if not exists visitors_atrisk_idx      on visitors(church_id) where is_at_risk;
create index if not exists checkins_church_idx      on check_ins(church_id, checked_in_at desc);
create index if not exists listing_views_church_idx on listing_views(church_id, viewed_at desc);

-- ════════════════════════════════════════════════════════════════════════
-- LIFECYCLE / FUNNEL QUERIES (owner-only; RLS still applies)
-- ════════════════════════════════════════════════════════════════════════

-- Counts per stage for the journey funnel.
create or replace function visitor_funnel(p_church uuid)
returns table(stage visitor_stage, count bigint)
language sql stable as $$
  select stage, count(*) from visitors
  where church_id = p_church group by stage order by stage;
$$;

-- Headline stats for the visitor-insights tiles.
create or replace function visitor_stats(p_church uuid)
returns table(total bigint, new_this_month bigint, returning_rate int, at_risk bigint)
language sql stable as $$
  select
    count(*) as total,
    count(*) filter (where first_seen >= date_trunc('month', current_date)) as new_this_month,
    coalesce(round(100.0 * count(*) filter (where visits_count >= 2)
             / nullif(count(*),0))::int, 0) as returning_rate,
    count(*) filter (where is_at_risk) as at_risk
  from visitors where church_id = p_church;
$$;

-- Acquisition breakdown ("how they found us").
create or replace function visitor_sources(p_church uuid)
returns table(source text, count bigint)
language sql stable as $$
  select coalesce(source,'Unknown'), count(*) from visitors
  where church_id = p_church group by source order by count(*) desc;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY
--  visitors & check_ins  → OWNER ONLY (never public — this is personal data)
--  listing_views         → anyone may INSERT a view for a published church,
--                          but only members may READ the aggregates
-- ════════════════════════════════════════════════════════════════════════
alter table visitors      enable row level security;
alter table check_ins     enable row level security;
alter table listing_views enable row level security;

drop policy if exists "visitors members only" on visitors;
create policy "visitors members only" on visitors for all
  using (is_org_member(church_org(church_id)))
  with check (is_org_member(church_org(church_id)));

drop policy if exists "checkins members only" on check_ins;
create policy "checkins members only" on check_ins for all
  using (is_org_member(church_org(church_id)))
  with check (is_org_member(church_org(church_id)));

-- anyone (even anon) can record a view for a PUBLISHED church…
drop policy if exists "views insert public" on listing_views;
create policy "views insert public" on listing_views for insert
  with check (exists(select 1 from churches c where c.id = church_id and c.status='published'));
-- …but only members can read the aggregates
drop policy if exists "views read members" on listing_views;
create policy "views read members" on listing_views for select
  using (is_org_member(church_org(church_id)));
