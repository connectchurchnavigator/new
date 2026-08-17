-- ============================================================
-- 005_events_schema_enhancements.sql
-- Adds ONLY the columns missing from the base events schema.
-- Safe to run even if base schema (001) was already applied.
-- ============================================================

-- Add columns to events table that aren't in the base schema
alter table public.events
  add column if not exists created_by  uuid,
  add column if not exists is_free     boolean default true,
  add column if not exists price_label text,
  add column if not exists is_hybrid   boolean default false;

-- event_faqs – created in base schema already, but kept here for safety
create table if not exists public.event_faqs (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  question   text not null,
  answer     text not null,
  sort_order int default 0
);
create index if not exists event_faqs_event_idx on public.event_faqs(event_id);

-- Disable RLS on all event tables (matches base schema setting)
alter table public.event_faqs disable row level security;
