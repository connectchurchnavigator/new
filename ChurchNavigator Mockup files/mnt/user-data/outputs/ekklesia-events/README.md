# Ekklesia Events — module (linked to churches AND pastors)

A full events feature: public **directory + search**, a **rich event page**, **create event**, **registration/RSVP with ticket tiers**, and **visitor tracking** (new vs returning). Every event is hosted by a **church**, a **pastor**, or **both** — and links back to their pages.

TypeScript parses clean; SQL is balanced (5 tables, 9 RLS policies, dual-host CHECK).

---

## ⚠️ Important: this assumes ONE Supabase project
Events reference **both** `churches` and `pastors`. So the church schema and the pastor schema must live in the **same** database. Running `003_events.sql` is therefore also the moment the two backends converge. Required first:
- church schema — `0001_init.sql` (organizations, churches, org_members)
- pastor schema — `001_pastors_schema.sql`
- pastor auth — `002_pastor_auth.sql` (adds `pastors.owner_id`)

---

## Files
```
supabase/migrations/003_events.sql        ← schema + RLS + triggers (run last)
lib/events-types.ts                       ← Event / Session / Speaker / Ticket types
lib/events.ts                             ← data layer (search, get, create, register, insights)
app/events/page.tsx                       ← directory (SSR search)
app/events/EventsSearch.tsx               ← search bar + type filters (client)
app/events/[slug]/page.tsx                ← rich event page (SSR + SEO) with host links
app/events/[slug]/RegisterPanel.tsx       ← ticket select + RSVP (client)
app/events/create/page.tsx                ← create event (auth-guarded; picks a host you own)
```
Drop these into the unified app (the church app, once it also has the pastor tables). Uses the same `@/lib/supabase/{server,client}` and Tailwind tokens as the church app.

---

## The church/pastor link (what you asked for)
- **`events.host_church_id`** and **`events.host_pastor_id`** — both nullable, with a CHECK that at least one is set. An event can be hosted by a church, a pastor, or **co-hosted by both**.
- The event page's **"Hosted by"** card links to `/church/[slug]` and/or `/pastor/[slug]`.
- `getEventsForChurch(churchId)` → render on the church page; `getEventsForPastor(pastorId)` → render on the pastor profile's Events tab. (Two one-line calls to add to those pages.)
- Event **speakers** can each link to a real pastor profile (`event_speakers.pastor_id`).

## Security (RLS)
- Public reads **published** events + their sessions/speakers/tickets.
- Only someone who **manages the host** can create/edit: a member of the church's org **or** the pastor who owns the profile (`can_manage_event()` checks both, plus the creator).
- **Anyone can register** (guest RSVP); only the host can read the registration list and check people in.

## Visitor tracking (new vs returning)
- `event_registrations` feeds the insights. A **trigger** sets `is_new_visitor` automatically by checking whether that email has registered for the same host before.
- `getEventInsights(eventId)` returns registrations, checked-in, new-vs-returning %, and sources — exactly what the Insights dashboard prototype shows.

---

## Wire-up
1. Run `003_events.sql` (after the three migrations above) in the unified Supabase project.
2. Add a **Browse events** link to your home nav → `/events`.
3. On the church page, call `getEventsForChurch(supabase, church.id)` and render a small list.
4. On the pastor profile Events tab, call `getEventsForPastor(supabase, pastor.id)`.
5. `/events/create` is auth-guarded and only lets a user host as a church they belong to or a pastor profile they own.

## Not included (decide, then I can add)
- **Payments** — tickets carry a `price_pence`, but checkout is RSVP-only right now. Real paid tickets need Stripe + webhook + order records.
- **Calendar files / QR passes** — buttons are present; generating `.ics` and QR is a small follow-up.
- **Recurring events** — single-date for now.

As always: TS parses and mirrors the church app's verified patterns, but it hasn't been run against a live unified database — that's the first test.
