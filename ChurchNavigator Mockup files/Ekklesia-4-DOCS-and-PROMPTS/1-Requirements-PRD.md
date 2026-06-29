# Ekklesia — Requirements Document (PRD)

**Product:** Ekklesia — a global directory of churches and pastors.
**Region focus:** United Kingdom (built to scale globally).
**Status legend:** ✅ built · 🟡 partial / prototype · ⬜ not started

---

## 1. Vision
A trusted directory where people can **find a church** or **find/book a pastor**, and where churches and pastors manage their own public presence. Churches list services, ministries, leadership and branches; pastors have professional profiles (like a ministry CV) that can be linked to one or more churches. Discovery is via search and SEO-friendly public pages.

## 2. Goals
- Make it easy for seekers to find the right church/pastor (search, filters, maps, SEO).
- Give churches and pastors a self-service way to create and manage a rich public listing.
- Build a foundation that scales to **50,000+ churches** without a separate search service.
- Be credible and safe: verified badges, correct data-protection handling.

## 3. Non-goals (for v1)
- Not a streaming/giving platform, not a church management system (ChMS), not social media.
- No payments in v1 (pricing model still to be decided).

---

## 4. Users / personas
1. **Seeker / visitor** — wants to find a church or pastor near them or for an event. Not logged in.
2. **Church owner / admin** — creates and manages a church listing (and its branches).
3. **Pastor** — creates and manages a personal ministry profile; can be linked to churches.
4. **(Future) Org admin** — manages multiple branches and team members.

---

## 5. Functional requirements

### 5.1 Church side
- **Onboarding** ✅ — create an organization + first church (name, denomination, city).
- **Owner dashboard** ✅ — edit profile/about, service times, pastor & leaders (with photo), teams; publish/unpublish.
- **Public listing** ✅ — SEO server-rendered page: about, services, leadership, teams, ministries, contact, languages, facilities.
- **Search** ✅ — full-text + fuzzy (typo-tolerant) search by name, city, denomination, ministry, language.
- **Branches** 🟡 — data model supports one org → many churches (HQ + branches); management UI to build.
- **Visitor insights** 🟡 — schema + funnel/stats queries done; React UI to build (6-stage funnel, sources, check-ins, follow-ups, CSV export).
- **Address autocomplete** 🟡 — Google Places proxy built (server-side key); wire into onboarding/editors.
- **Media** 🟡 — logo/cover/gallery upload (`uploadImage` exists; wire UI).

### 5.2 Pastor side *(separate app — not in the church handoff zip)*
- **Onboarding wizard** ✅ — 6 steps; writes to Supabase.
- **Public profile** ✅ — hero **cover slider**, stats, tabs (About, Sermons, Vision, Education, Events, Gallery, Reviews), specialisms, ministry areas, availability, journey timeline, affiliations, awards, social links with follower counts.
- **Owner editing** 🟡 (prototype) — edit every section via slide-over drawers; **QR share** and **PDF export** (professional one-pager) designed.
- **Pastor directory** ✅ — `/pastors` listing, search + filters, each card linked to the pastor's church.
- **Pastor dashboard** 🟡 (prototype) — enquiries inbox, profile-strength meter, sermons, events, reviews, analytics.
- **Auth/login for pastors** ⬜ — so a pastor edits only their own profile (currently open).

### 5.3 Cross-cutting: pastor ↔ church linking
- A pastor can be linked to **one, multiple, or no** churches (independent). ✅ (in the pastor profile/directory)
- From a pastor profile/card, navigate to the linked church page (becomes a live link once both apps share one `churches` table). 🟡

---

## 6. Data model (summary)
```
auth.users → profiles
organizations → churches (branches share org_id; HQ flagged is_hq)
  churches → church_services, leaders, teams
  churches → visitors (owner-only), check_ins, listing_views
pastors → pastor_languages, pastor_tags (specialisms/areas/available-for),
          pastor_education, pastor_timeline, pastor_sermons, pastor_events,
          pastor_gallery, pastor_affiliations, pastor_awards, pastor_reviews,
          pastor_enquiries
pastors.church_id → churches   (the link between the two sides)
```
Search via Postgres full-text + trigram with GIN indexes (no external search service).

---

## 7. Non-functional requirements
- **Security:** Row-Level Security on every table. Public reads see only published rows; writes limited to owners/members. Service-role key server-only. (Church RLS is performance-tuned with `(select auth.uid())`.)
- **Data protection (UK GDPR):** privacy policy, lawful basis + consent for storing member/visitor personal data, cookie notice, data export/deletion (data-subject rights), EU/UK data residency. **Required before public launch.** ⬜
- **Performance / scale:** indexed search and membership checks; target 50k+ churches. Verify under load.
- **Accessibility:** keyboard navigation, colour contrast, labelled controls. ⬜ (pass needed)
- **SEO:** server-rendered public pages, sitemap, structured data (Church / LocalBusiness schema). 🟡

---

## 8. Out of scope (current)
- Payments/giving, livestreaming, full ChMS, mobile native apps, admin moderation queue, transactional email (to be added).

---

## 9. Open decisions
- **Bible College:** model as a "team/ministry" or a dedicated **program page** (courses, intake, apply)? — product decision needed.
- **Pricing:** free / freemium / verified-badge tier?
- **Backend convergence:** church app and pastor app currently have separate backends (church = org/auth/RLS; pastor = open/service-role + a `churches` stub). For pastor login + clickable pastor↔church links, they must share one `churches` table and one auth model.
- **Positioning:** agency-style vs in-house emphasis (carried over from earlier strategy work) — affects directory framing.

---

## 10. Roadmap (suggested)
1. **Foundation** — run church app on live Supabase; verify the full path.
2. **MVP completeness** — address autocomplete, photo upload, finish dashboard editors in React.
3. **Production hardening** — auth emails, monitoring, rate limiting, accessibility, **GDPR**.
4. **Launch** — deploy to Vercel + domain; onboard 3–5 pilot churches.
5. **Growth** — visitor insights UI, multi-branch, pastor auth + dashboard, AI features (description generation, follow-up suggestions), reconcile the two backends.
