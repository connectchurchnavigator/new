# Ekklesia — Backend Setup

Stack: **Next.js (App Router) + Supabase (Postgres · Auth · Row-Level Security · Storage).**
This first pass covers **church listings, pastor, teams, branches, search, and the home feed.**
Visitor tracking and the Google Places address proxy are the next pass.

---

## What you have

```
backend/
├─ supabase/
│  ├─ migrations/0001_init.sql   ← schema, indexes, search, triggers, RLS
│  └─ seed.sql                   ← demo data (Grace Chapel + 3 branches)
└─ lib/
   ├─ types.ts                   ← TypeScript types
   ├─ supabaseClient.ts          ← browser / server / admin clients
   └─ api.ts                     ← every read/write the app needs
```

The data model: **organization** (the church brand/account) → **churches** (each branch = one public listing) → **services / leaders / teams.** A church's "branches" are simply other churches sharing the same `org_id`; the HQ has `is_hq = true`.

---

## 1. Create a Supabase project

1. Go to **supabase.com → New project**. Pick a region close to your users, set a strong DB password.
2. When it's ready, open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
   - **service_role** key (secret — server only)

## 2. Run the schema

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the entire contents of `supabase/migrations/0001_init.sql` and **Run**.
   This creates all tables, indexes, the search functions, and the RLS policies.

*(Alternatively with the CLI: `supabase link` then `supabase db push`.)*

## 3. Create the storage bucket (for photos)

**Storage → New bucket** → name it **`church-media`** → make it **Public**.
Then add an upload policy so signed-in users can write:

```sql
create policy "authenticated can upload church media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'church-media');

create policy "public can read church media"
  on storage.objects for select using (bucket_id = 'church-media');
```

## 4. Create your first user + seed demo data

1. **Authentication → Users → Add user** (or sign up through your app).
2. In the **SQL Editor**, run `supabase/seed.sql`.
   It attaches the demo organization (Grace Chapel + Ilford/Croydon/Stratford branches, pastors, teams, services) to your **first** user as the owner.

## 5. Wire the front end

```bash
npm i @supabase/supabase-js @supabase/ssr
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server only, never shipped to the browser
```

Drop `lib/types.ts`, `lib/supabaseClient.ts`, `lib/api.ts` into your Next.js app.

---

## How the screens map to the API

| Screen | Call |
| --- | --- |
| **Home page** | `getHomeChurches(sb, 12)` |
| **Search / browse** | `searchChurches(sb, { q, city, denomination, ministry, language })` + `getFilterFacets(sb)` |
| **Public listing page** | `getChurchBySlug(sb, slug)` → returns church + services + leaders + teams |
| **Dashboard → Branches** | `getMyOrg(sb)` → `getBranches(sb, org.id)` |
| **My listing → edit** | `updateChurch(sb, id, patch)` · `replaceServices(sb, id, services)` |
| **Pastor & teams** | `getLeaders` / `upsertLeader` / `deleteLeader` · `getTeams` / `upsertTeam` / `deleteTeam` |
| **Add a branch / onboarding** | `createChurch(sb, orgId, { name, ... })` then `setChurchStatus(sb, id, 'published')` |
| **Photo upload** | `uploadImage(sb, churchId, 'logo' \| 'cover' \| 'leader', file)` |

### Example — public listing page (Next.js server component)

```tsx
import { getChurchBySlug } from '@/lib/api';
import { supabaseServer } from '@/lib/supabaseClient';

export default async function ChurchPage({ params }: { params: { slug: string } }) {
  const sb = supabaseServer(/* your cookie adapter */);
  const church = await getChurchBySlug(sb, params.slug);
  return <ChurchProfile church={church} />; // renders about, services, leaders, teams…
}
```

### Example — search

```tsx
const sb = supabaseBrowser();
const results = await searchChurches(sb, { q: 'pentecostal ilford', language: 'Spanish' });
```

---

## Why this scales to 50k+ churches

- **Postgres full-text search** (`search_vector`, GIN-indexed) handles keyword search; **pg_trgm** adds typo tolerance — no separate search service needed at this scale.
- **GIN indexes** on `ministries` / `languages` make array filters fast; a `(postcode, normalized_name)` unique index powers duplicate detection.
- **RLS at the database** means security can't be bypassed by a buggy front-end: the public only ever reads `published` rows; owners only touch their own org.
- **Server-rendered listing pages** (Next.js) are fully indexable by Google — essential for a directory people find via search.
- Stateless API layer → runs on serverless/edge and scales horizontally.

---

## Security checklist

- ✅ `service_role` key stays server-side only (it bypasses RLS).
- ✅ RLS enabled on every table (the migration does this).
- ✅ Public reads limited to `status = 'published'`.
- ✅ Writes limited to org members via `is_org_member()`.
- ⬜ When you add the **Google Places** address proxy, keep that key server-side too (two endpoints: `/suggest`, `/details` — next pass).

---

## Pass 2 (now included)

**Visitor tracking** — run `supabase/migrations/0002_visitors.sql` after `0001`. It adds:
- `visitors` (known people — **owner-only** via RLS, never public), `check_ins`, and `listing_views` (anonymous aggregate traffic; anyone can insert a view for a published church, only members can read).
- Query functions: `visitor_stats`, `visitor_funnel`, `visitor_sources` — power the insight tiles, the journey funnel, and "how they found us".
- API: `getVisitors`, `getVisitorStats`, `getVisitorFunnel`, `getVisitorSources`, `upsertVisitor`, `recordCheckIn`, `recordView`.

**Google Places address proxy** — `app/api/address/suggest/route.ts` and `app/api/address/details/route.ts`. The key lives only in `GOOGLE_PLACES_KEY` on the server; the browser calls your endpoints, which call Google with a session token. `details` returns a fully parsed address (correct post town like "Ilford", house number, lat/lng). Client helpers: `suggestAddress`, `getAddressDetails`.

Add to `.env.local`:

```
GOOGLE_PLACES_KEY=your-server-side-google-key   # restrict to your backend in Google Cloud
```

Wire the dashboard / onboarding address field to call `suggestAddress(q, country, session)` → `getAddressDetails(placeId, session)` and store the returned fields on the church.

## Next pass (not built yet)

1. **AI features** — description generation and "people to follow up" suggestions via the Anthropic API, called server-side.
2. **Auth UI** — sign-up / login / org-creation flow.
3. **Cron** — nightly job to recompute `is_at_risk` (e.g. no check-in in 30 days).
