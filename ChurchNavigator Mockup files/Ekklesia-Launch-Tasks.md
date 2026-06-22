# Ekklesia — Complete Task List (to launch & beyond)

Status key: `[x]` done · `[~]` partly done · `[ ]` to do
Honest note: nothing marked `[x]` has been run against a live database yet — Phase 0 is what verifies it all.

---

## PHASE 0 — Verify the foundation (DO THIS FIRST · you, ~1 hour)
Everything below is built but unproven until this runs.

- [ ] Create a Supabase project (region near your users; save the DB password)
- [ ] Run `0001_init.sql` in the SQL editor
- [ ] Run `0002_visitors.sql`
- [ ] Create Storage bucket `church-media` (Public) + add the upload/read policies
- [ ] Authentication → Email → turn OFF "Confirm email" (for local testing)
- [ ] Copy URL + anon key + service_role key
- [ ] In `ekklesia-app/`: `cp .env.example .env.local`, paste keys
- [ ] `npm install` then `npm run dev`
- [ ] Walk the path: sign up → create church → edit → publish → view listing → search
- [ ] Fix any first-run errors (paste them to me — expect 1–2, it's normal)

---

## PHASE 1 — Feature-complete the owner dashboard (mostly built)
Bring the live React app up to the richness of the prototype.

- [x] Profile & about editor (live, saves to DB)
- [x] Service times editor (add/edit/remove)
- [x] Pastor & leaders editor (add/edit/remove + photo upload)
- [x] Ministry teams editor (add/edit/remove)
- [x] Publish / unpublish listing
- [ ] **Address capture** — wire Google Places proxy into onboarding + an "Address" editor
      (proxy built; needs your Google key + billing enabled)
- [ ] **Photo upload UI** — cover photo + logo + gallery (function exists; wire the forms)
- [ ] Ministries & facilities editor (chips) — currently read-only in the app
- [ ] Languages editor (search + multi-select)
- [ ] Gallery management (reorder, delete)
- [ ] "Profile strength" / completeness meter (exists in prototype)

### Your church's structure — teams & programs to support
- [ ] **Pastor / leadership** — covered by leaders editor ✅ (lead pastor + associates)
- [ ] **Media team** — supported by teams editor ✅ (add as a team)
- [ ] **Audio / Sound team** — supported by teams editor ✅ (add as a team)
- [ ] **Bible College** — DECISION NEEDED: is this…
      - (a) just a "team/ministry" (simplest — add as a team), or
      - (b) a **program with its own page** (courses, intake dates, apply button)?
      If (b), it's a small new feature: a `programs` table + a public program page.
      → Tell me which and I'll build it.

---

## PHASE 2 — Public site (core built, needs polish)

- [x] Home page with search (SSR)
- [x] Public church listing page (SSR, SEO metadata) — about, services, pastor, teams
- [ ] Search filters UI (denomination, city, ministry, language — RPC already supports them)
- [ ] Map view / "near me" (lat-lng already stored)
- [ ] Listing page: "Get directions", "Add to calendar", share buttons
- [ ] Empty/loading/error states everywhere
- [ ] Mobile responsiveness pass (test on a real phone)
- [ ] 404 / not-found pages

---

## PHASE 3 — Visitor features (schema built, no UI yet)

- [x] Visitor tracking schema + funnel/stats queries + owner-only RLS
- [ ] Visitor-insights UI ported into the React dashboard (rich version is in prototype)
- [ ] QR check-in screen + check-in recording
- [ ] "People to follow up" list + send-message action
- [ ] CSV export
- [ ] Anonymous view tracking on public pages (`recordView`)
- [ ] Nightly job to recompute `is_at_risk`

---

## PHASE 4 — AI features (designed, not built)

- [ ] AI "write my description" (Anthropic API, server-side)
- [ ] AI "people to follow up" suggestions
- [ ] AI search / natural-language church finder
- [ ] Smart-import from an existing website/Facebook page (you've prototyped this idea)

---

## PHASE 5 — Multi-branch / organisation (concept built)

- [x] Data model supports one org → many branches
- [ ] Branch switcher + per-branch dashboards in the React app
- [ ] "Add a branch" flow
- [ ] Org-level roles (owner / admin / editor) + invite teammates

---

## PHASE 6 — Production hardening (NON-NEGOTIABLE before public launch)

- [ ] Auth: email confirmation back ON, password reset, magic-link option
- [ ] Email sending (transactional) — confirmations, follow-ups (e.g. Resend/Postmark)
- [ ] Error handling + a logging/monitoring tool (e.g. Sentry)
- [ ] Rate limiting on public endpoints + the address proxy
- [ ] Image optimisation + size limits on uploads
- [ ] Input validation on every form (server-side)
- [ ] Security review: confirm RLS on every table; service_role never client-side
- [ ] Accessibility pass (keyboard, contrast, screen-reader labels)
- [ ] Performance: indexes verified under load; page-speed check

### Legal / compliance (UK — important, easy to forget)
- [ ] **GDPR**: privacy policy, lawful basis for storing visitor/member data
- [ ] **Consent** for storing personal data (visitor tracking especially)
- [ ] Cookie notice
- [ ] Terms of service
- [ ] Data deletion / export process (data-subject rights)
- [ ] Decide data residency (EU/UK region for Supabase)

---

## PHASE 7 — Deploy & launch

- [ ] Deploy to Vercel (connect repo, add env vars)
- [ ] Buy a domain + connect it
- [ ] Set production env vars (separate Supabase project for prod vs dev — recommended)
- [ ] Restrict the Google Places key to your production domain
- [ ] Run migrations on the production database
- [ ] Smoke-test the full flow on production
- [ ] Set up backups (Supabase has them; confirm the plan)
- [ ] Basic analytics (e.g. Plausible/GA)

---

## PHASE 8 — Go-to-market (parallel, non-technical)

- [ ] Onboard 3–5 friendly churches as pilots (your network)
- [ ] Seed the directory so it doesn't look empty at launch
- [ ] Landing page / value proposition for church owners
- [ ] Pricing decision (free? freemium? verified-badge tier?)
- [ ] Feedback loop with pilot churches
- [ ] SEO basics: sitemap, structured data (LocalBusiness/Church schema)

---

## Suggested order (fastest route to a real soft-launch)
1. **Phase 0** (verify it runs) ← start here, today
2. Phase 1 remaining: address + photos (makes listings feel real)
3. Phase 2 polish + Phase 6 legal minimum
4. Phase 7 deploy → invite pilot churches
5. Then Phases 3–5 (visitors, AI, multi-branch) and the rest of Phase 8

---

## What I can build next (just say the word)
- Wire **address autocomplete + photo upload** into the app
- Build the **Bible College program** feature (if it needs its own page)
- Port the **visitor-insights UI** into React
- **Vercel deploy** config + a production checklist
- A **week-by-week soft-launch plan** with dates

## What only you can do
- Run Supabase + the app locally (Phase 0)
- Google Cloud key + billing
- Legal/GDPR docs (a solicitor or a template service)
- Domain, hosting account, pilot-church relationships
