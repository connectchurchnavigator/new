# Ekklesia — Build Context & Prompts Guide

This project was built iteratively with AI assistance. This doc captures the **design system, key decisions, and reusable prompts** so a developer can continue the same way and keep everything consistent.

> Note: these are representative/reconstructed prompts and the standing context that shaped the build — not verbatim chat logs. Use them as templates.

---

## 1. Standing context (paste this at the top of any AI session)

> You are working on **Ekklesia**, a UK-based global directory of **churches and pastors** built on **Next.js 14 (App Router) + TypeScript + Supabase (Postgres, Auth, Storage, RLS)**. Security is enforced by Row-Level Security, not the UI. All data access goes through `lib/api.ts`. Keep the existing design system (below). Be honest about what is real vs. simulated and what has/hasn't been tested against a live database. Validate code before claiming it works.

## 2. Design system (keep consistent)
- **Fonts:** Inter (church app), Plus Jakarta Sans (pastor app).
- **Gradient:** coral → purple `linear-gradient(135deg,#f43f5e,#7c3aed)`.
- **Colors:** purple `#7c3aed` / dark `#6d28d9`, coral `#f43f5e`, ink `#0f0f1a`, gray `#6b7280`, border `#e9e9ef`, surface `#f5f3ff`, bg `#f7f7fb`.
- **Icons:** Tabler Icons. **Radii:** cards ~16–18px, pills/chips ~20px.
- **Section heading tiles:** colored gradient tile + white icon, color-coded per section.
- **Pattern:** slide-over drawers for editing; owner-view toggle reveals Edit buttons.

## 3. Conventions (enforce in every prompt)
- All Supabase reads/writes go through `lib/api.ts` — don't scatter queries in components.
- Server components use the server client; client components use the browser client; `service_role` key is **server-only**.
- Public pages read only `status='published'` (RLS enforces it).
- After generating code, **type-check / build before claiming success** (`tsc --noEmit`, `next build`).

## 4. Key decisions already made
- Multi-tenancy: `organizations → churches (branches via org_id, is_hq) → services/leaders/teams`.
- Search: Postgres full-text + trigram + GIN indexes (no external search engine) to scale to 50k+.
- RLS performance: wrap `auth.uid()` as `(select auth.uid())`; index `org_members(user_id)`.
- Pastor ↔ church: a pastor links to **one, many, or no** churches.
- **Two backends exist** (church: org/auth/RLS; pastor: open/service-role + churches stub) and must be **reconciled** for pastor login + clickable links.

---

## 5. Reusable prompt templates (for the next tasks)

**Wire address autocomplete**
> In `ekklesia-app`, add address autocomplete to the onboarding form and a new "Address" editor in the dashboard. Use the existing Google Places proxy routes in `ekklesia-backend/app/api/address/` and the `suggestAddress` / `getAddressDetails` helpers in `lib/api.ts`. Map `postal_town` → city (e.g. "Ilford"). Keep the Google key server-side. Type-check before finishing.

**Wire photo upload**
> Add cover, logo, and gallery uploads to the church dashboard editors using the existing `uploadImage(sb, churchId, kind, file)` helper against the `church-media` bucket. Store returned URLs on the row. Show a preview and a loading state. Don't use browser localStorage.

**Port visitor-insights UI to React**
> Build the visitor-insights screen in the React dashboard using `getVisitorFunnel`, `getVisitorStats`, `getVisitorSources` from `lib/api.ts`. Match the prototype `dashboard.html`: 6-stage funnel, stat tiles, "how they found us", a filterable table with CSV export. SSR where possible; keep RLS (owner-only) intact.

**Add pastor auth (the big one)**
> Add Supabase Auth to the pastor app so a pastor can log in and edit only their own profile. Add an `owner_id uuid references auth.users` to `pastors`, replace the open/service-role writes with authenticated writes guarded by RLS (`owner_id = (select auth.uid())`), and gate the onboarding/edit flows behind login. Keep public reads (published only). Provide a migration.

**Reconcile the two backends**
> Merge the pastor app's `churches` **stub** into the church app's real `churches` table so both share one source of truth and one auth model. Update `pastors.church_id` to reference the real table, make the church name on pastor cards a live `<Link href={/church/[slug]}>`, and keep RLS consistent across both. Provide migrations and note any breaking changes.

**General "continue safely" preamble for any task**
> Read the relevant files first. Make the change through `lib/api.ts` where data is involved. Preserve the design system and RLS. After coding, run `tsc --noEmit` (and `next build` if routes changed) and report the result honestly, including anything you could not verify without a live database.

---

## 6. How to verify (what "done" means here)
- `npm install && npx tsc --noEmit` → zero errors
- `npm run build` → compiles all routes (a `process.version`/Edge-Runtime **warning** from `@supabase/ssr` is harmless)
- Manually walk the affected user path against a live Supabase
- State clearly what was and wasn't tested live

---

## 7. Artifacts in this project
- **Church:** `ekklesia-app/` (Next.js), `ekklesia-backend/` (SQL + lib + address routes), `dashboard.html` (design spec), `Ekklesia-AddYourChurch.html` (onboarding spec).
- **Pastor:** the pastor app zip (onboarding + profile + API), `pastor-directory/` (drop-in `/pastors`), `Ekklesia-PastorProfile.html` (profile prototype), `Ekklesia-PastorDashboard.html` (dashboard prototype).
- **Docs:** Setup Instructions, Requirements (PRD), this guide, the Developer Handoff brief, and the Launch Tracker.
