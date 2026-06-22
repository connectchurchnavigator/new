import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Reads/writes auth cookies via Next.js's `cookies()`.
 * Uses the public anon key — respects Row Level Security.
 *
 * NOTE: this is for reads on behalf of the visiting user. For writes
 * that need to bypass RLS (e.g. saving an onboarding submission from
 * an anonymous visitor), use `supabase-admin.ts` instead inside API
 * routes only — never import the admin client into client code.
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Same as above — safe to ignore in Server Components.
          }
        },
      },
    }
  );
}
