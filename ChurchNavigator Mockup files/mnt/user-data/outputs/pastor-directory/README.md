# Pastor Directory — drop-in for ekklesia-pastor-app

A `/pastors` listing page where visitors browse all published pastors, each card **connected to their church**. Built to match your existing zip (Plus Jakarta Sans, purple/coral gradient, Tabler icons, your `chip` styles, the `createServerSupabaseClient` server client, and the existing `pastors` / `pastor_tags` / `churches` schema).

## Files — copy into your project
```
app/pastors/page.tsx          ← the directory (Server Component, SSR + SEO)
app/pastors/PastorSearch.tsx  ← the search bar (Client Component)
app/page.tsx                  ← replaces your placeholder home, adds "Browse pastors"
```

That's it — no new deps, no schema changes. Run `npm run dev` and open `/pastors`.

## What it does
- **Lists published pastors** (RLS-safe: reads via the anon server client, which only sees `is_published = true`).
- **Each card shows the linked church** — pulled via the `church_id → churches` foreign key (`church:churches(...)` embed), with the church name on every card. Pastors with no church simply omit it (your "linked / not linked" requirement).
- **Search** by name + city, **quick-filters** by preaching specialism (reads `pastor_tags`), **verified + popularity ordering**, and **pagination** (12 per page).
- Avatar uses `avatar_url` if present, else a gradient monogram from `initials`.

## How "connected to church" works
The card reads the embedded `church` relation. Right now it displays the church **name**. Once the pastor app and the church app share one `churches` table (the convergence we flagged), make the church name a `<Link href={`/church/${p.church.slug}`}>` — the slug is already being fetched, so it's a one-line change to turn it into a live link to the church page.

## Notes
- Syntax-checked (TypeScript transpile clean). Not run against a live Supabase from here — first `npm run dev` against your project is the real test.
- If the `church:churches(...)` embed errors, your FK may be named differently; replace with `church:churches!pastors_church_id_fkey(...)` using your actual constraint name (`\d pastors` in psql shows it).
- The specialism quick-filters assume `pastor_tags.category = 'preaching'`. Adjust the labels to match your seed data if needed.
