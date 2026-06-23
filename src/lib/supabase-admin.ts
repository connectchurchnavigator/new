import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client using the SERVICE ROLE key.
 *
 * !! SERVER-ONLY !! This bypasses Row Level Security entirely.
 * Only ever import this inside files under `app/api/**` (Route
 * Handlers) that run on the server. Never import it into a
 * Client Component, and never expose SUPABASE_SERVICE_ROLE_KEY
 * with the NEXT_PUBLIC_ prefix.
 *
 * Why we need it: the pastor onboarding wizard is filled out by an
 * unauthenticated visitor (no login flow in this version), so there's
 * no Supabase Auth session to satisfy a "user owns this row" RLS
 * policy. The API route validates the submission server-side instead,
 * then uses this admin client to insert it.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
