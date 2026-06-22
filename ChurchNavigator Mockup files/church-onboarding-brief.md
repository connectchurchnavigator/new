# ChurchNavigator — Church Onboarding (New Listing)
### Build brief for Next.js (App Router) + Supabase (Postgres, Auth, Storage)

> **Scope of this brief:** ONLY the new-church onboarding wizard — a church owner creating a listing from scratch. The **claim-existing-listing** flow and **admin moderation** are explicitly **out of scope** for this build and will be handed off separately. Do not build them now.

> **Read this first — the one instruction that prevents the biggest mistake:** This data model is described relationally. Implement it as **proper Postgres tables with foreign keys and Row-Level Security**. Do **not** store nested documents/JSON blobs for things that need filtering. Languages, ministries, and facilities are **`text[]` array columns**, not nested JSON and not (for this build) join tables.

---

## Decisions (locked — defaults chosen by the product owner; override only if told otherwise)

| # | Decision | Setting for this build |
|---|----------|------------------------|
| 1 | **Publish gate** | **Auto-publish**, but every new listing carries an **`is_verified = false`** flag and shows an "Unverified" badge publicly until later review. No admin-approval bottleneck on publish. |
| 2 | **Address provider** | **Google Places (Autocomplete + Place Details), called SERVER-SIDE.** The API key lives only on the backend (Next.js route handler / Supabase edge function) and is **never exposed in client JS**. Free OpenStreetMap/Nominatim may be used as a no-key fallback in dev only. See the dedicated "Address capture" section below for the full UX + parsing contract. |
| 3 | **Row-Level Security** | **Author full RLS policies as part of Phase 1.** This is the security model — not optional, not UI-only. |
| 4 | **Save & resume** | **Server-side draft row** (`churches.status = 'draft'`), written progressively and keyed to the user. Not localStorage. Create and resume are the **same code path**. |
| 5 | **AI description model** | **`claude-sonnet-4-6`.** Pin this exact string. |
| 6 | **Admin role source of truth** | A **`role` column on `profiles`** (`'user' \| 'admin'`). (Not used in onboarding, but defined now so RLS is consistent.) |

**Please confirm before starting (the only open unknowns):**
- Is the Supabase project already initialised, with **Auth enabled**? Which providers — email magic link, Google, both?
- Does a **`profiles`** (or `users`) table already exist, or should Phase 1 create it?
- **Google Places** is the locked address provider (server-side). Do you have a key + billing enabled in Google Cloud, or should the backend ship the proxy endpoints behind a feature flag so the key can be dropped in later?

---

## Address capture (the model is settled — build it exactly this way)

**UX: country first, then one address field. The owner never sees City / Area / State / Postcode.**

1. **Country** — a mandatory, searchable picker (flag + name). Pre-select it from the browser's geolocation (reverse-geocode → country) with a graceful fallback to empty/manual if permission is denied. Global list.
2. **Address** — a single search box, enabled only after a country is chosen, and **restricted to that country**. The owner types just their street + number; Google returns validated suggestions; they pick one.
3. **Confirmation + map pin** so they can confirm the building is right.
4. **Everything else is parsed and stored, hidden from the owner.** From the chosen Google place, persist the full component set for analytics/reporting/search: `address_line`, `city` (post town), `area`/sublocality, `state`/region, `postcode`, `country`, `country_code`, `latitude`, `longitude`, and Google's `formatted_address` + `place_id`.

**Why Google specifically:** it carries Royal Mail PAF-quality data — correct UK post town (e.g. "Ilford", not "Greater London"), building-level house numbers, and accurate pins. Free OpenStreetMap does **not** have this; it returns wrong streets, missing house numbers, and region-level localities, so it is acceptable only as a dev-time fallback, never the production source.

**Server-side contract (the key never touches the browser):**
- Backend endpoint A: `GET /api/address/suggest?q=&country=` → proxies Google Autocomplete (with a session token), returns predictions.
- Backend endpoint B: `GET /api/address/details?placeId=` → proxies Place Details, returns the parsed component set above (parse `address_components` by type: `street_number`+`route` → line; `postal_town`/`locality` → city; `sublocality` → area; `administrative_area_level_1` → state; `postal_code`; `country` long+short name).
- Use **session tokens** (suggest calls + one details call billed as one session) to control cost.
- Restrict the key in Google Cloud to your backend; enable Places API + Geocoding API.
- Store the parsed components in `churches` (see schema). Keep `place_id` so an address can be re-validated later.

**Duplicate detection (name + postcode):** when both the church name and the postcode (from the validated address) are known, check for an existing church at the **same postcode** with an **exact or similar** normalized name. Normalize by trimming/collapsing spaces, lowercasing, stripping punctuation, and expanding common abbreviations (Int/Intl→International, Ch→Church, Min→Ministries, St→Saint, etc.) so "Grace Chapel Int" matches "Grace Chapel International". Exact match → block-strength warning with a link to the existing listing; similar match → soft, **dismissible** warning ("Not the same — continue") with the link. Back this with a DB index on `(postcode, normalized_name)`; compute a stored `normalized_name` column on write.



The risk in this feature is stacked: **schema → RLS → the 9 wizard steps.** Build inside-out. A working narrow path beats a broken wide one.

### Phase 1 — Foundation (build and TEST before any wizard UI)

Deliver the schema, RLS, and `profiles`/role setup. **Test RLS with two real Supabase test users before writing a single wizard screen.**

#### Tables

```sql
-- profiles: 1:1 with auth.users
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'user' check (role in ('user','admin')),
  created_at  timestamptz not null default now()
);

-- churches: the core listing (one owner may own many churches)
create table churches (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references profiles(id) on delete set null,
  slug          text unique,                       -- e.g. 'grace-covenant-croydon'
  status        text not null default 'draft'      -- draft | published
                  check (status in ('draft','published')),
  is_verified   boolean not null default false,
  wizard_step   int not null default 1,            -- for resume (1..9)

  name             text,
  normalized_name  text,                            -- lowercased, trimmed, abbreviations expanded (for duplicate detection)
  denomination     text,

  -- address: owner types one field; these are parsed from Google Place Details and hidden from them
  address_line     text,
  city             text,                            -- post town (e.g. 'Ilford')
  area             text,                            -- sublocality / district
  state            text,                            -- administrative_area_level_1
  postcode         text,
  country          text,
  country_code     text,                            -- ISO-3166 alpha-2
  formatted_address text,                           -- Google's single-line formatted string
  google_place_id  text,                            -- for re-validation later
  latitude         double precision,
  longitude        double precision,

  phone         text,
  email         text,
  website       text,

  about         text,
  ministries    text[] not null default '{}',      -- filterable: ministries @> '{Youth Ministry}'
  facilities    text[] not null default '{}',
  languages     text[] not null default '{}',

  pastor_name   text,
  pastor_title  text,
  pastor_bio    text,
  pastor_photo_url text,

  cover_image_url text,
  logo_url        text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- service_times: one row per service (1 church : many services)
create table service_times (
  id          uuid primary key default gen_random_uuid(),
  church_id   uuid not null references churches(id) on delete cascade,
  name        text not null,            -- 'Sunday Main Service'
  day_of_week text not null,            -- 'Sunday' (or 0-6 int — pick one, be consistent)
  start_time  time not null,
  end_time    time,
  sort_order  int not null default 0
);

-- church_photos: gallery (1 church : up to 10 photos). Cover/logo live on churches.
create table church_photos (
  id          uuid primary key default gen_random_uuid(),
  church_id   uuid not null references churches(id) on delete cascade,
  storage_path text not null,           -- Supabase Storage object path
  public_url  text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Enforce the 10-photo cap server-side (trigger), NOT just in the UI:
create or replace function enforce_photo_cap() returns trigger as $$
begin
  if (select count(*) from church_photos where church_id = new.church_id) >= 10 then
    raise exception 'A church may have at most 10 gallery photos';
  end if;
  return new;
end; $$ language plpgsql;
create trigger trg_photo_cap before insert on church_photos
  for each row execute function enforce_photo_cap();
```

#### RLS policies (enable RLS on every table)

- **`churches`**
  - **Public SELECT** only where `status = 'published'`.
  - **Owner SELECT/UPDATE** their own rows (including drafts) where `owner_id = auth.uid()`.
  - **INSERT** allowed for any authenticated user, with `owner_id` forced to `auth.uid()`.
  - (No public access to drafts.)
- **`service_times`, `church_photos`** — SELECT/INSERT/UPDATE/DELETE allowed only when the parent church's `owner_id = auth.uid()`; public SELECT only when the parent church is `published`.
- **`profiles`** — user can read/update their own row; admins can read all.
- Verify the negative cases: user B cannot read or edit user A's draft; anonymous cannot read any draft.

> **Phase 1 exit criterion:** two test users, each can create and edit only their own draft, neither can see the other's, and the public (anon) role sees only published rows. Prove this before Phase 2.

---

### Phase 2 — The spine (one thin vertical slice)

Build only **4 of the 9 steps**, end-to-end, to prove the whole mechanism:

- **Step 1 — Basic info:** name, denomination, address (Google Places autocomplete → autofills city/postcode/lat/lng), city, postcode. *Required: name, denomination, address.*
- **Step 3 — Service times:** add one or more services (name, day, start, end). *At least one required.*
- **Step 4 — About + AI assist:** a description textarea, plus **"AI helps me write this"** — owner enters a few bullets/keywords → call `claude-sonnet-4-6` → return a warm, first-person ("We are…") **100–150 word** description they can edit.
- **Step 9 — Review & publish:** full public-style preview, "Edit" link back to any step, **Publish** button → sets `status = 'published'`, generates `slug`, renders the public page.

Prove in this slice: draft row persists across reload/device, validation gates "Next," AI call works, publish flips status, public page renders. **Defer photos, ministries, languages, pastor — they cannot break the spine.**

#### AI description spec
- Model: `claude-sonnet-4-6`. Call **server-side** (Next.js Route Handler / Server Action) so the API key never reaches the browser.
- Prompt outline: *"Write a warm, welcoming church description in the first person plural ('We are…'), 100–150 words, for a UK church directory. Use ONLY the facts in these bullet points — do not invent service times, beliefs, history, or claims not provided. Bullets: {input}."*
- Guardrails: enforce the word range; instruct it to invent nothing; return plain text only. Show the result in the editable textarea (never auto-save without the owner seeing it).

---

### Phase 3 — Breadth (additive, low-risk, onto the working spine)

- **Step 2 — Contact:** phone, email, website. *All optional; validate format if present.*
- **Step 5 — Ministries & facilities:** multi-select chips with **custom additions** → write to `ministries[]` / `facilities[]`.
- **Step 6 — Languages:** searchable multi-select, **40–50 options** (include Yoruba, Twi, Telugu, Tamil, Mandarin, Polish, Romanian, Portuguese, Spanish, French, Igbo, Urdu, Punjabi, Cantonese, etc.) → `languages[]`. *Always include English by default.*
- **Step 7 — Photos:** cover image, logo, up to **10** gallery photos → **Supabase Storage**. Path convention `churches/{church_id}/{uuid}.{ext}`. Enforce server-side: 10-photo cap (trigger above), allowed types (jpeg/png/webp), max file size (e.g. 5 MB). On photo-row delete, **delete the Storage object too** (no orphans).
- **Step 8 — Pastor details:** name, title, bio, photo. *All optional — can be added later.*

---

## Cross-cutting wizard requirements

- **Progress indicator** ("Step 3 of 9") and **per-step validation before "Next."**
- **Back navigation never loses data** (everything reads/writes the draft row).
- **Resume:** on return, load the user's `draft` church and jump to `wizard_step`.
- Each step **autosaves** to the draft row (debounced) so closing the browser loses nothing.
- **Slug** generated on publish from name + city, deduped (`-2`, `-3`).
- `updated_at` maintained via trigger.

## Explicitly out of scope for this build
- Claim-existing-listing flow, admin moderation/queue, claim verification.
- Bulk / CSV import.
- Any automated identity/domain verification.

## Traps to avoid (call-outs for the implementer)
- Don't store ministries/facilities/languages as nested JSON — use `text[]`.
- Enforce the 10-photo cap and file limits **server-side**, never UI-only.
- Delete Storage objects when photo rows are deleted (no orphans).
- Force `owner_id = auth.uid()` on insert — never trust a client-supplied owner id.
- Call Claude **server-side only**; never expose the API key to the browser.
- Test RLS with two real users in Phase 1 before building UI.
- **Never put the Google key in client code** — all Places calls go through the backend proxy endpoints; restrict the key to your backend in Google Cloud and use session tokens to control cost.
- Add a DB index on `churches (postcode, normalized_name)` for the duplicate check; compute `normalized_name` on write (trim, lowercase, expand abbreviations).
- The owner only ever enters Country + one address line; do not surface city/state/postcode inputs — parse and store them server-side from the validated place.
