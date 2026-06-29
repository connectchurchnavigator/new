# Ekklesia — Developer Handoff

A global church-directory SaaS. Churches list themselves; the public finds them via search/SEO. This brief is everything you need to start. Read it top to bottom once.

---

## TL;DR
- **Stack:** Next.js 14 (App Router) + Supabase (Postgres · Auth · Row-Level Security · Storage). TypeScript.
- **Two deliverables in this handoff:**
  1. `ekklesia-app/` — the **real, runnable app** (build on this).
  2. `*.html` prototypes (`dashboard.html`, `Ekklesia-AddYourChurch.html`) — **design specs only**, in-memory demo data. Use as the visual/UX reference to build the remaining React screens. Do NOT ship them.
- **Status:** Core path works (auth → create church → edit/manage → publish → public listing → search). **`npm install && npm run build` passes clean — verified: `tsc --noEmit` zero errors, `next build` compiles all 7 routes.** Not yet run against a live Supabase — that's the one remaining check (point `.env.local` at a real project).

---

## Architecture & data model
```
auth.users → profiles
organization (the church brand/account)
   └── churches  (each branch / location = ONE public listing; HQ has is_hq=true)
         ├── church_services
         ├── leaders        (pastor + leadership)
         ├── teams          (Media, Audio, Worship, …)
         ├── visitors       (owner-only, private)
         ├── check_ins
         └── listing_views  (anonymous aggregate)
```
- "Branches" = churches sharing the same `org_id`.
- Security is enforced by **Row-Level Security in the database**, not the UI: public reads see only `status='published'`; writes are limited to org members. Never rely on the client for authz.

---

## Run it locally (~1 hr)
1. **Supabase:** create a project (UK/EU region).
2. **SQL Editor:** run `0001_init.sql`, then `0002_visitors.sql`. (`seed.sql` optional.)
3. **Storage:** create a **Public** bucket named `church-media` + add the upload/read policies (in `BACKEND_SETUP.md`).
4. **Auth → Email:** turn OFF "Confirm email" for local dev.
5. **App:** `cp .env.example .env.local`, fill in URL + anon + service_role keys.
6. `npm install && npm run dev` → http://localhost:3000
7. Walk: sign up → onboarding → dashboard → edit → publish → view listing → search.

Full detail: `ekklesia-app/README.md` and `ekklesia-backend/BACKEND_SETUP.md`.

---

## File map (what to touch)
```
ekklesia-app/
  app/page.tsx                 Home — search + featured churches (SSR)
  app/church/[slug]/page.tsx   Public listing (SSR + SEO) — about/services/pastor/teams
  app/login/page.tsx           Auth (email + password)
  app/onboarding/page.tsx      Create org + first church
  app/dashboard/page.tsx       Server: auth guard + data load
  app/dashboard/DashboardClient.tsx  Client: editors (profile, services, pastor, teams) via slide-over drawer
  app/globals.css              Design tokens + base styles
  lib/api.ts                   ★ Data layer — every read/write goes through here
  lib/types.ts                 Types matching the schema
  lib/supabase/{client,server,middleware}.ts
  middleware.ts                Session refresh + route protection
ekklesia-backend/
  supabase/migrations/0001_init.sql    schema + indexes + search + RLS (tuned)
  supabase/migrations/0002_visitors.sql visitor tracking + RLS
  app/api/address/{suggest,details}/route.ts  Google Places proxy (key stays server-side)
```

---

## Conventions (please follow)
- **All data access goes through `lib/api.ts`.** Don't scatter raw Supabase queries in components. Add new functions there.
- **Server components** read with the server client (`lib/supabase/server.ts`); **client components** use the browser client. Mutations from the dashboard run client-side as the logged-in user (RLS applies).
- **`service_role` key is server-only** — never import it into a client component.
- **Design tokens** live in `globals.css` (coral→purple gradient `--ek-grad`, Inter font, radius/spacing). Match the prototypes' look using these.
- **Slugs**: `toSlug()` in `lib/api.ts`. Listings are addressed by slug for SEO.
- **Images** go to the `church-media` Storage bucket via `uploadImage()`; store the returned URL on the row.

---

## What's DONE
- Schema, indexes, full-text + fuzzy search, RLS (performance-tuned with `(select auth.uid())`), visitor tables, Google Places proxy.
- Auth (email/password), org + church creation, route protection.
- Dashboard editors: profile/about, service times, pastor & leaders (+ photo upload), teams. Publish/unpublish.
- Public: home + search, SSR listing page with SEO metadata.

## What's LEFT (priority order)
1. **First run + fix** anything that surfaces (only happens against a live DB).
2. **Address autocomplete** — wire the Google proxy into onboarding/editors (`suggestAddress`/`getAddressDetails`); needs a Google Places key.
3. **Photo upload UI** — cover/logo/gallery (function exists).
4. **Port richer screens from the HTML prototypes:** full onboarding wizard, visitor-insights UI, branches UI, ministries/facilities/languages editors. Backend already supports all of it.
5. **Multi-branch** UI (model done): branch switcher, add-branch, org roles + invites.
6. **Production hardening:** email (Resend/Postmark), error monitoring (Sentry), rate limiting, input validation, accessibility, **GDPR** (privacy policy, consent for member/visitor data, data export/delete — UK requirement, not optional).
7. **Deploy:** Vercel + domain; separate prod vs dev Supabase; restrict Google key to prod domain.

---

## Honest gotchas (will save you time)
- The app is **a vertical slice**, not the full product — it proves the stack end-to-end. The prototypes show where the UI is headed; the gap between them is the main front-end work.
- **The build passes, but nothing has run against a live DB yet** — point `.env.local` at a real Supabase and run the migrations. Watch for: RLS denying a query you expected to work (usually means the user isn't an org member yet), and the Storage bucket/policies. (Note: `next build` prints a harmless Edge-Runtime warning about `process.version` from `@supabase/ssr` in middleware — it's a warning, not an error, and is safe to ignore.)
- **`@supabase/ssr` cookie handling** in `lib/supabase/*` is version-sensitive — if auth/session misbehaves, check that package version against the current Supabase SSR docs first.
- Prototypes use **in-memory data + CDN assets**; they render blank in any non-browser preview and aren't a code source — they're a design source.
- **"Bible College"** is an open product decision: model it as a team, or build it a dedicated program page with courses/apply. Confirm with the product owner before building.

---

## Suggested first 3 tasks
1. Get it running locally and reproduce the full path (proves the foundation).
2. Wire **address autocomplete + photo upload** (highest-impact "feels real" upgrade).
3. Port the **onboarding wizard** UI from `Ekklesia-AddYourChurch.html` into React, writing through `lib/api.ts`.
