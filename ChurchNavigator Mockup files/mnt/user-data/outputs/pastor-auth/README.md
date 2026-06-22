# Pastor Auth — drop-in for ekklesia-pastor-app

Adds **login + ownership** so a pastor can sign in and edit only their own profile, and an **auth-guarded dashboard** that loads their real data (enquiries, views, profile strength). This is the prerequisite for "edit my own profile" and the pastor dashboard.

Built to match the church app's auth pattern (which builds clean) and your pastor app's Tailwind / Plus Jakarta Sans styling.

---

## Files to add
```
supabase/migrations/002_pastor_auth.sql   ← run after 001_pastors_schema.sql
lib/supabase/client.ts                     ← browser client (auth)
lib/supabase/server.ts                     ← server client (session + RLS)
lib/supabase/middleware.ts                 ← session refresh + route guard
middleware.ts                              ← at project root (or merge with an existing one)
app/login/page.tsx                         ← pastor sign in / sign up
app/dashboard/page.tsx                     ← server: auth guard + load owner's data
app/dashboard/DashboardClient.tsx          ← overview + enquiries inbox + profile strength
```

Requires `@supabase/ssr` (the church app uses `^0.5.1`):
```bash
npm install @supabase/ssr
```

---

## Setup

### 1. Run the migration
In Supabase SQL editor, run `002_pastor_auth.sql`. It:
- adds `owner_id uuid references auth.users` to `pastors`,
- adds RLS so the **owner** can insert/update/delete their own pastor + child rows,
- keeps **public read = published only**,
- lets the owner read their own `pastor_enquiries`.
Service-role (your existing admin client) still bypasses RLS, so current API routes keep working.

### 2. Enable email auth
Supabase → **Authentication → Providers → Email** (on). For local testing, turn **off** "Confirm email" so sign-up creates a session immediately.

### 3. Link new profiles to their owner
In your onboarding create step (`POST /api/pastors` or the wizard), set `owner_id` to the logged-in user. With the auth-aware server client:
```ts
const { data: { user } } = await supabase.auth.getUser();
// when inserting the pastor row:
owner_id: user!.id,
```
Existing rows created before auth will have `owner_id = null` — assign them once (SQL or a one-off admin script) so those pastors can claim their profile.

### 4. Run
```bash
npm run dev
```
- `/login` → sign up → you're sent to `/onboarding/pastor` to create the profile
- after that, `/dashboard` shows your real views, enquiries, and profile-strength
- `/dashboard` and `/onboarding/pastor` now redirect to `/login` when signed out

---

## How editing "my own profile" works now
- Public profile (`/pastor/[slug]`) stays a Server Component reading via the anon client (published only).
- Owner edits should go through the **auth-aware** server/client (`lib/supabase/server.ts` / `client.ts`); RLS guarantees a pastor can only change rows where `owner_id = auth.uid()`.
- Your existing service-role API routes still work for admin tasks, but for user-driven edits prefer the authenticated client so RLS — not the UI — enforces ownership.

---

## Check before shipping
- **Column names:** `dashboard/page.tsx` reads `view_count`, `follower_count`, `bio`, `vision_statement`, and `pastor_enquiries(name,email,event_type,message,status)`. If your schema names differ, adjust the `.select(...)` lists (one-line changes).
- **Enquiry insert policy:** the contact form must be allowed to insert. If it currently inserts via service role that's fine; if you move it to the anon client, add `create policy ... on pastor_enquiries for insert with check (true);`.
- **Middleware merge:** if you already have a `middleware.ts`, merge the matcher and call `updateSession` inside it rather than adding a second file.

TypeScript-parsed clean; mirrors the church app's verified auth flow. As always, the real test is `npm run build && npm run dev` against your Supabase.
