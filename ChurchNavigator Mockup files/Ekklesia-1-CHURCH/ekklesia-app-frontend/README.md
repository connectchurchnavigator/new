# Ekklesia — connected app (vertical slice)

A real **Next.js 14 + Supabase** app proving the whole stack end-to-end:

**Sign up → create your church → edit it in the dashboard → Publish → see it live on a public listing & in search.**

This is a focused, working slice — not the entire product. It deliberately wires *one path* all the way through so you can run it and watch real data flow. The big prototype dashboard (`dashboard.html`) remains the design spec for the richer screens (visitor insights, branches UI, drawers, etc.).

---

## What's here

```
app/
├─ page.tsx                     Home — search + featured churches (SSR)
├─ church/[slug]/page.tsx       Public listing (SSR, SEO) — about, services, pastor, teams
├─ login/page.tsx               Sign in / sign up
├─ onboarding/page.tsx          Create organization + first church
├─ dashboard/
│  ├─ page.tsx                  Auth guard + data load (server)
│  └─ DashboardClient.tsx       Edit profile/about, publish, view services/pastor/teams
├─ layout.tsx, globals.css      Shell + Ekklesia theme
lib/
├─ supabase/{client,server,middleware}.ts
├─ api.ts, types.ts            Data-access layer (same as the backend package)
middleware.ts                  Session refresh + route protection
```

---

## Run it (about 10 minutes)

### 1. Set up the database
Follow `BACKEND_SETUP.md` from the backend package:
- create a Supabase project,
- run `0001_init.sql` and `0002_visitors.sql`,
- create the `church-media` storage bucket.

(You don't need `seed.sql` — you'll create your own church through the app.)

### 2. Configure env
```bash
cp .env.example .env.local
```
Fill in from **Supabase → Project Settings → API**:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Turn off email confirmation (for fast local testing)
**Supabase → Authentication → Providers → Email** → disable "Confirm email".
(With it on, sign-up needs an email click before a session exists.)

### 4. Install & run
```bash
npm install
npm run dev
```
Open http://localhost:3000

### 5. Walk the path
1. **/login** → Create an account.
2. You're sent to **/onboarding** → enter a church name → Create.
3. You land on **/dashboard** → edit the About text → **Save** (writes to Supabase).
4. Click **Publish listing**.
5. Click **View public listing** (or go to the home page and search) → your edits are live, server-rendered, exactly what a visitor sees.

That round trip — browser → Next.js → Supabase (with RLS) → back — is the whole stack working.

---

## How security holds

- **RLS does the enforcing**, not the UI. The home/search/listing pages read with the anon key but only ever see `status = 'published'` rows. The dashboard reads/writes as the logged-in user, who can only touch their own org's data.
- `middleware.ts` refreshes the session and bounces logged-out users away from `/dashboard` and `/onboarding`.
- The `service_role` key is never imported into client code.

---

## Known gaps (honest)

- This slice edits **profile/about + publish**. Service-times, pastor, and team **editors** are fully built in the prototype `dashboard.html`; porting them into React here is the next step (the API functions — `replaceServices`, `upsertLeader`, `upsertTeam` — already exist in `lib/api.ts`).
- **Address autocomplete** isn't wired into onboarding yet; the Google proxy routes exist in the backend package (`app/api/address/*`) — drop them in and call `suggestAddress`/`getAddressDetails`.
- **Photo upload** uses `uploadImage` (in `lib/api.ts`) against the `church-media` bucket — wire it to the forms next.
- No tests, no deployment config yet. Deploy target: **Vercel** (Next.js) — push the repo, add the same env vars.

I generated and syntax-checked every file, but a Next.js app can only be truly verified by running it — expect a small fix or two on first `npm run dev`, which the steps above are designed to make quick.
