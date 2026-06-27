-- ============================================================
-- 002_pastor_auth.sql
-- Adds authentication & ownership to pastor profiles.
-- A logged-in user (auth.users) owns a pastor row and can edit
-- only their own. Public still reads only PUBLISHED profiles.
-- Service role continues to bypass RLS (admin/seed scripts).
-- Safe to run on top of 001_pastors_schema.sql.
-- ============================================================

-- 1. Ownership column ----------------------------------------
alter table public.pastors
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists pastors_owner_idx on public.pastors(owner_id);

-- 2. Helper: does the current user own this pastor? ----------
create or replace function public.owns_pastor(p_pastor uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.pastors p
    where p.id = p_pastor and p.owner_id = (select auth.uid())
  );
$$;

-- 3. pastors table policies ----------------------------------
-- SELECT: public sees published; an owner also sees their own (any status)
drop policy if exists pastors_select_public on public.pastors;
create policy pastors_select_public on public.pastors
  for select
  using (is_published = true or owner_id = (select auth.uid()));

-- INSERT: a logged-in user may create a pastor they own
drop policy if exists pastors_insert_own on public.pastors;
create policy pastors_insert_own on public.pastors
  for insert
  with check (owner_id = (select auth.uid()));

-- UPDATE: only the owner
drop policy if exists pastors_update_own on public.pastors;
create policy pastors_update_own on public.pastors
  for update
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- DELETE: only the owner
drop policy if exists pastors_delete_own on public.pastors;
create policy pastors_delete_own on public.pastors
  for delete
  using (owner_id = (select auth.uid()));

-- 4. Child tables: owner of the parent pastor manages them ----
--    Public read happens through the published parent (existing
--    read policies are kept; these add owner write access).
do $$
declare t text;
begin
  foreach t in array array[
    'pastor_languages','pastor_tags','pastor_education','pastor_timeline',
    'pastor_sermons','pastor_events','pastor_gallery','pastor_affiliations','pastor_awards'
  ]
  loop
    execute format('drop policy if exists %1$s_write_own on public.%1$s;', t);
    execute format(
      'create policy %1$s_write_own on public.%1$s for all '
      || 'using (public.owns_pastor(pastor_id)) '
      || 'with check (public.owns_pastor(pastor_id));', t);
  end loop;
end $$;

-- 5. Enquiries: anyone may submit (contact form); owner reads ----
drop policy if exists pastor_enquiries_owner_read on public.pastor_enquiries;
create policy pastor_enquiries_owner_read on public.pastor_enquiries
  for select
  using (public.owns_pastor(pastor_id));

-- (pastor_enquiries already allows public INSERT via the contact form;
--  if not, add:  create policy ... for insert with check (true);)

-- 6. Reviews: public read of published parent; owner can delete ----
drop policy if exists pastor_reviews_owner_manage on public.pastor_reviews;
create policy pastor_reviews_owner_manage on public.pastor_reviews
  for delete
  using (public.owns_pastor(pastor_id));

-- Done. Note: existing onboarding/API routes that used the
-- service-role client will keep working; to move them to the
-- authenticated user, set owner_id = auth.uid() on insert and
-- use the auth-aware server client (see lib/supabase/server.ts).
