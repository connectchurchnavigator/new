// ───────────────────────────────────────────────────────────────────────
// Ekklesia — Supabase clients
//   npm i @supabase/supabase-js @supabase/ssr
// Env (.env.local):
//   NEXT_PUBLIC_SUPABASE_URL=...
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (server only — NEVER expose to the browser)
// ───────────────────────────────────────────────────────────────────────

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client-side (browser) — respects the logged-in user + RLS. */
export function supabaseBrowser() {
  return createBrowserClient(URL, ANON);
}

/**
 * Server-side (RSC / route handlers) — reads the user's session from cookies
 * so RLS still applies as that user. Pass your framework's cookie adapter.
 */
export function supabaseServer(cookieAdapter: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: any) => void;
  remove: (name: string, options: any) => void;
}) {
  return createServerClient(URL, ANON, {
    cookies: {
      get: cookieAdapter.get,
      set: cookieAdapter.set,
      remove: cookieAdapter.remove,
    },
  });
}

/**
 * Admin client — bypasses RLS. Use ONLY in trusted server code
 * (cron jobs, webhooks, admin tools). Never import this in client components.
 */
export function supabaseAdmin() {
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(URL, SERVICE, { auth: { persistSession: false } });
}
