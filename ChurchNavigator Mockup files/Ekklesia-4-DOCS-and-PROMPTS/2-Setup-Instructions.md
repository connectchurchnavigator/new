# Ekklesia — Setup & Run Instructions

Step-by-step guide to get the church app running locally and deployed. Written for a developer taking over the project.

---

## Prerequisites
- **Node.js 18+** and npm
- A free **Supabase** account (supabase.com)
- (Optional, for address autocomplete later) a **Google Cloud** account with the Places API enabled
- (Optional, for deploy) a **Vercel** account

---

## Part 1 — Database (Supabase)

### 1. Create the project
- supabase.com → **New project**
- Choose a region near your users (UK/EU for a UK product — also matters for GDPR data residency)
- Save the database password somewhere safe

### 2. Run the migrations
- Left sidebar → **SQL Editor** → **New query**
- Open `ekklesia-backend/supabase/migrations/0001_init.sql`, paste the whole file, **Run** (expect "Success")
- Repeat with `0002_visitors.sql`
- (Optional) run `seed.sql` for demo data — skip it if you'll create your own church through the app

### 3. Create the storage bucket
- **Storage** → **New bucket** → name it exactly `church-media` → toggle **Public** → create
- Add read/write policies as described in `ekklesia-backend/BACKEND_SETUP.md`

### 4. Auth settings
- **Authentication → Providers → Email**
- For local development, turn **OFF** "Confirm email" (so sign-up creates a session immediately)
- Turn it back **ON** before production

### 5. Get your keys
- **Project Settings → API**, copy:
  - **Project URL**
  - **anon public** key
  - **service_role** key (server-side only — never ships to the browser)

---

## Part 2 — Run the app

```bash
cd ekklesia-app
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then:
```bash
npm run dev
```
Open http://localhost:3000

### Verify the full path works
1. **/login** → create an account
2. You're sent to **/onboarding** → enter a church name → Create
3. You land on **/dashboard** → edit the About text → **Save** (writes to Supabase)
4. Click **Publish listing**
5. Click **View public listing** → your edits are live
6. Go to the home page and **search** → your church appears

That round trip proves the whole stack (browser → Next.js → Supabase + RLS → back).

---

## Part 3 — Deploy (Vercel)

1. Push the repo to GitHub
2. Vercel → **New Project** → import the repo
3. Add the same three env vars (use a **separate Supabase project** for production)
4. Run the migrations on the production database
5. Deploy, then smoke-test the full path on the live URL
6. Restrict your Google Places key (if used) to the production domain

---

## Troubleshooting (first-run issues)

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank data / "No churches" | Migrations not run, or nothing published | Run both SQL files; publish a church |
| Auth doesn't persist / redirect loop | "Confirm email" still on, or env vars wrong | Turn off email confirm for dev; recheck keys |
| "row violates row-level security" on save | User isn't a member of the org yet | Onboarding must create the org + membership first (it does — re-run the flow) |
| Image upload fails | `church-media` bucket missing or not public | Create the bucket + policies |
| Build warning about `process.version` / Edge Runtime | `@supabase/ssr` in middleware | **Harmless warning, not an error** — ignore |

The build itself passes clean (`npm run build` → compiles all routes). Any issue on first run is almost always one of the config items above, not the code.

---

## What's NOT wired yet (next dev tasks)
- Address autocomplete (Google proxy routes exist in `ekklesia-backend/app/api/address/` — drop into the app and call `suggestAddress` / `getAddressDetails`)
- Photo upload UI (the `uploadImage` function exists; wire it to the forms)
- Visitor-insights UI in React (schema + queries exist)
- Transactional email, rate limiting, monitoring, deploy hardening
- GDPR/legal pages (required before public launch in the UK)
