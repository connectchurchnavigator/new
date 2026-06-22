-- ============================================================
-- 003_events.sql
-- Events module — an event is hosted by a CHURCH and/or a PASTOR.
-- Requires (in the SAME Supabase project):
--   * church schema  (organizations, churches, org_members)  -- 0001_init.sql
--   * pastor schema + auth (pastors.owner_id)                -- 001_pastors_schema.sql + 002_pastor_auth.sql
-- This migration is therefore also the point where the church
-- and pastor backends must live in one database (the reconcile step).
-- ============================================================

create extension if not exists pg_trgm;

-- ---------- enums ----------
do $$ begin
  create type event_type as enum ('Conference','Service','Crusade','Camp','Summit','Concert','Other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('draft','published','cancelled');
exception when duplicate_object then null; end $$;

-- ---------- events ----------
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  type          event_type not null default 'Conference',
  description   text,
  -- DUAL HOST: a church, a pastor, or both. At least one is required.
  host_church_id uuid references public.churches(id) on delete cascade,
  host_pastor_id uuid references public.pastors(id)  on delete cascade,
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  timezone      text default 'Europe/London',
  venue_name    text,
  address       text,
  city          text,
  latitude      double precision,
  longitude     double precision,
  cover_url     text,
  cover_gradient text,
  is_free       boolean not null default true,
  price_label   text,                 -- e.g. 'Free', '£15', 'From £15'
  capacity      int,
  is_hybrid     boolean not null default false,
  livestream_url text,
  tags          text[] default '{}',
  status        event_status not null default 'draft',
  view_count    int not null default 0,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint events_has_host check (host_church_id is not null or host_pastor_id is not null)
);

create index if not exists events_starts_idx   on public.events(starts_at);
create index if not exists events_status_idx   on public.events(status);
create index if not exists events_church_idx   on public.events(host_church_id);
create index if not exists events_pastor_idx   on public.events(host_pastor_id);
create index if not exists events_city_trgm    on public.events using gin (city gin_trgm_ops);
create index if not exists events_search_idx    on public.events
  using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(city,'')));

-- ---------- agenda / sessions ----------
create table if not exists public.event_sessions (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id) on delete cascade,
  time_label   text not null,          -- '10:00'
  title        text not null,
  description  text,
  speaker_name text,
  sort_order   int default 0
);
create index if not exists event_sessions_event_idx on public.event_sessions(event_id);

-- ---------- speakers / lineup ----------
create table if not exists public.event_speakers (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  name       text not null,
  role       text,
  photo_url  text,
  pastor_id  uuid references public.pastors(id) on delete set null,  -- optional link to a real pastor profile
  sort_order int default 0
);
create index if not exists event_speakers_event_idx on public.event_speakers(event_id);

-- ---------- ticket tiers ----------
create table if not exists public.event_tickets (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id) on delete cascade,
  name         text not null,          -- 'Free RSVP', 'VIP'
  description  text,
  price_pence  int not null default 0, -- 0 = free
  quantity     int,                    -- null = unlimited
  sort_order   int default 0
);
create index if not exists event_tickets_event_idx on public.event_tickets(event_id);

-- ---------- registrations (feeds visitor tracking) ----------
create table if not exists public.event_registrations (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events(id) on delete cascade,
  ticket_id       uuid references public.event_tickets(id) on delete set null,
  user_id         uuid references auth.users(id) on delete set null, -- null = guest
  name            text not null,
  email           text not null,
  party_size      int default 1,
  status          text not null default 'registered',  -- registered | checked_in | cancelled
  is_new_visitor  boolean default true,                -- first time engaging this host
  source          text,                                -- search | directory | shared | social
  created_at      timestamptz not null default now()
);
create index if not exists event_reg_event_idx on public.event_registrations(event_id);
create index if not exists event_reg_email_idx on public.event_registrations(event_id, email);

-- ============================================================
-- RLS
-- ============================================================
alter table public.events              enable row level security;
alter table public.event_sessions      enable row level security;
alter table public.event_speakers      enable row level security;
alter table public.event_tickets       enable row level security;
alter table public.event_registrations enable row level security;

-- can the current user manage this event? (church org member OR pastor owner OR creator)
create or replace function public.can_manage_event(p_event uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from public.events e
    left join public.churches c    on c.id = e.host_church_id
    left join public.org_members om on om.org_id = c.org_id and om.user_id = (select auth.uid())
    left join public.pastors p     on p.id = e.host_pastor_id
    where e.id = p_event
      and ( e.created_by = (select auth.uid())
         or om.user_id is not null
         or p.owner_id = (select auth.uid()) )
  );
$$;

-- events: public reads published; managers read/write their own
drop policy if exists events_select on public.events;
create policy events_select on public.events
  for select using (status = 'published' or public.can_manage_event(id));

drop policy if exists events_insert on public.events;
create policy events_insert on public.events
  for insert with check (
    created_by = (select auth.uid())
    and (
      (host_church_id is not null and exists (
        select 1 from public.churches c
        join public.org_members om on om.org_id = c.org_id
        where c.id = host_church_id and om.user_id = (select auth.uid())))
      or
      (host_pastor_id is not null and exists (
        select 1 from public.pastors p
        where p.id = host_pastor_id and p.owner_id = (select auth.uid())))
    )
  );

drop policy if exists events_update on public.events;
create policy events_update on public.events
  for update using (public.can_manage_event(id)) with check (public.can_manage_event(id));

drop policy if exists events_delete on public.events;
create policy events_delete on public.events
  for delete using (public.can_manage_event(id));

-- child tables: public read when parent published; manager read/write
do $$
declare t text;
begin
  foreach t in array array['event_sessions','event_speakers','event_tickets']
  loop
    execute format('drop policy if exists %1$s_select on public.%1$s;', t);
    execute format($f$create policy %1$s_select on public.%1$s for select using (
      exists(select 1 from public.events e where e.id = event_id
             and (e.status = 'published' or public.can_manage_event(e.id))));$f$, t);
    execute format('drop policy if exists %1$s_write on public.%1$s;', t);
    execute format($f$create policy %1$s_write on public.%1$s for all
      using (public.can_manage_event(event_id))
      with check (public.can_manage_event(event_id));$f$, t);
  end loop;
end $$;

-- registrations: anyone may register; managers (and the registrant) read; managers update (check-in)
drop policy if exists event_reg_insert on public.event_registrations;
create policy event_reg_insert on public.event_registrations
  for insert with check (true);

drop policy if exists event_reg_select on public.event_registrations;
create policy event_reg_select on public.event_registrations
  for select using (public.can_manage_event(event_id) or user_id = (select auth.uid()));

drop policy if exists event_reg_update on public.event_registrations;
create policy event_reg_update on public.event_registrations
  for update using (public.can_manage_event(event_id) or user_id = (select auth.uid()));

-- ---------- helper: mark new vs returning on register ----------
create or replace function public.mark_new_visitor()
returns trigger language plpgsql as $$
begin
  new.is_new_visitor := not exists (
    select 1 from public.event_registrations r
    join public.events e2 on e2.id = r.event_id
    join public.events e1 on e1.id = new.event_id
    where r.email = new.email
      and coalesce(e2.host_church_id,'00000000-0000-0000-0000-000000000000') = coalesce(e1.host_church_id,'00000000-0000-0000-0000-000000000000')
      and coalesce(e2.host_pastor_id,'00000000-0000-0000-0000-000000000000') = coalesce(e1.host_pastor_id,'00000000-0000-0000-0000-000000000000')
  );
  return new;
end $$;

drop trigger if exists trg_mark_new_visitor on public.event_registrations;
create trigger trg_mark_new_visitor before insert on public.event_registrations
  for each row execute function public.mark_new_visitor();

-- Done.

-- view counter RPC (used by recordEventView)
create or replace function public.increment_event_view(p_event uuid)
returns void language sql security definer as $$
  update public.events set view_count = view_count + 1 where id = p_event;
$$;
