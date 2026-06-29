# Ekklesia — Pastor Profiles (Next.js + Supabase)

A real backend for the Ekklesia "Pastor" profile page and onboarding wizard,
replacing the static HTML prototypes with a working Next.js 14 (App Router)
app backed by Supabase (Postgres + Storage).

## What's in this build

- **Pastor onboarding wizard** — `/onboarding/pastor`, a 6-step form (Basics,
  Contact, Ministry, Languages, Availability, Media) that uploads images to
  Supabase Storage and POSTs the completed profile to `/api/pastors`.
- **Pastor profile page** — `/pastor/[slug]`, a Server Component that fetches
  a pastor's full profile (bio, vision, ministry journey timeline, sermons,
  events, gallery, affiliations, awards, reviews) from Supabase and renders
  it in the Ekklesia visual style (Plus Jakarta Sans, purple/coral gradient,
  hero slider, sticky tabs).
- **API routes**:
  - `POST /api/pastors` — create a pastor profile (used by onboarding)
  - `GET /api/pastors` — list published pastors (for a future directory page)
  - `GET /api/pastors/[slug]` — fetch one full profile (JSON; the page itself
    fetches server-side directly, but this is here for any client-side or
    external use)
  - `POST /api/pastors/[slug]/enquiries` — the "Send Enquiry" / "Contact
    Pastor" form
  - `POST /api/upload` — image upload to Supabase Storage, used by the
    onboarding wizard's Media step

**Not included / explicitly out of scope for this pass:**
- No authentication / login. Onboarding is open — anyone with the link can
  create a pastor profile. Add Supabase Auth + an `owner_id` column on
  `pastors` if you need pastors to log in and edit only their own profile.
- No admin moderation queue. Profiles publish immediately
  (`is_published: true` on insert). Flip that to `false` in
  `app/api/pastors/route.ts` if you want a manual approval step first.
- No email notifications when an enquiry comes in — it's stored in the
  `pastor_enquiries` table only. Wire up Resend/Postmark/etc. in that route
  if you want pastors emailed immediately.
- The Church onboarding flow (the separate HTML prototype) was intentionally
  left as-is and is NOT part of this Next.js app.

## 0. Before you deploy — dependency freshness

This was built against **Next.js 14.2.35** (the patched 14.x line as of this
writing). Next.js ships security patches fairly often; run `npm audit` and
check [nextjs.org/blog](https://nextjs.org/blog) for any newer security
advisories before deploying, and bump the `next` (and `eslint-config-next`)
version in `package.json` to the latest patched 14.x release if one exists
by the time you read this.

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com) if you don't
   have one already.
2. Open the SQL Editor in your Supabase dashboard and run the contents of
   `supabase/migrations/001_pastors_schema.sql`. This creates:
   - A minimal `churches` stub table (skip/adjust if you already have a
     fuller one from the church onboarding work)
   - The full `pastors` table plus 10 related child tables (languages, tags,
     education, timeline, sermons, events, gallery, affiliations, awards,
     reviews) and an `pastor_enquiries` table
   - Row Level Security policies (public read-only for published profiles;
     writes go through the service role key in API routes)
   - A public storage bucket called `pastor-media` for avatar/cover/gallery
     image uploads
3. Get your project's API credentials: **Settings → API** in the Supabase
   dashboard. You'll need:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Local setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local and paste in your three Supabase values from step 1
npm run dev
```

Visit `http://localhost:3000` — it'll show a minimal landing page linking to
the onboarding wizard. Visit `http://localhost:3000/onboarding/pastor` to
create a test pastor profile; submitting redirects you straight to the new
profile page at `/pastor/your-generated-slug`.

## 3. Seeding a demo profile (optional)

If you want the original "Pastor James Okafor" demo data (matching the
earlier HTML prototype) in your database without filling out the wizard by
hand, run `supabase/seed.sql` (see that file) in the Supabase SQL editor
after running the migration.

## 4. Deployment

This is a standard Next.js 14 App Router project — deploys cleanly to
**Vercel** (recommended, zero config) or any Node host that supports Next.js
(Render, Railway, Fly.io, etc.).

### Vercel
1. Push this folder to a GitHub repo.
2. Import the repo in Vercel.
3. Add the three environment variables from `.env.local` in the Vercel
   project's **Settings → Environment Variables**.
4. Deploy. No build config changes needed — `next build` / `next start` work
   out of the box.

### Any other Node host
```bash
npm run build
npm run start
```
Make sure the three env vars are set in that environment before `npm run
build` runs (Next.js inlines `NEXT_PUBLIC_*` vars at build time).

## 5. Project structure

```
app/
  api/
    pastors/
      route.ts              # GET (list) / POST (create)
      [slug]/
        route.ts             # GET (single profile, JSON)
        enquiries/route.ts     # POST (contact form)
    upload/route.ts            # POST (image upload)
  onboarding/pastor/page.tsx     # the wizard (Client Component)
  pastor/[slug]/
    page.tsx                      # the profile page (Server Component)
    not-found.tsx
  page.tsx                          # minimal landing page
  layout.tsx                        # root layout, fonts, Tabler icons
  globals.css

components/
  HeroSlider.tsx     # hero slide rotation (Client Component)
  ProfileTabs.tsx     # tab switching (Client Component)
  EnquiryForm.tsx      # "Send Enquiry" modal (Client Component)
  TagInput.tsx          # chip input for wizard tag fields
  ImageUpload.tsx         # upload widget for wizard Media step

lib/
  supabase-browser.ts   # client-side Supabase client (anon key)
  supabase-server.ts     # Server Component Supabase client (anon key)
  supabase-admin.ts        # SERVER-ONLY admin client (service role key)
  validation.ts               # Zod schemas for onboarding + enquiries
  slug.ts                       # slugify / initials helpers

types/
  pastor.ts    # TypeScript types mirroring the DB schema

supabase/
  migrations/001_pastors_schema.sql
  seed.sql       # optional demo data
```

## 6. Extending this

- **Church ↔ Pastor linking**: the `pastors.church_id` column references
  `churches.id`. If you build out the church onboarding's backend later,
  point the wizard's "Home church" field at an autocomplete search against
  `GET /api/churches?search=...` and save the matched `church_id` instead of
  (or alongside) the free-text `church_name_cache`.
- **Directory / search page**: `GET /api/pastors` already supports `city`
  and `language` filters and pagination — a `/pastors` listing page just
  needs to call it and render cards.
- **Auth-gated editing**: add Supabase Auth, an `owner_id uuid` column on
  `pastors`, and an RLS policy like
  `using (owner_id = auth.uid())` for updates, so pastors can log in and
  edit only their own profile instead of onboarding being fully open.
