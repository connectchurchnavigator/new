// ───────────────────────────────────────────────────────────────────────
// Ekklesia — Google Places ADDRESS SUGGEST proxy  (server-side only)
// Next.js App Router:  app/api/address/suggest/route.ts
//
// The Google key NEVER reaches the browser. The client calls THIS endpoint;
// this endpoint calls Google. Session tokens group a suggest+details pair
// into one billable session.
//
// Env:  GOOGLE_PLACES_KEY=your-server-side-key   (restrict it to your backend)
//
// Client usage:
//   GET /api/address/suggest?q=322+High+Rd&country=gb&session=<uuid>
// ───────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const country = (searchParams.get('country') || '').toLowerCase();
  const session = searchParams.get('session') || '';

  if (q.length < 3) return NextResponse.json({ predictions: [] });

  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Address service not configured' }, { status: 500 });
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.set('input', q);
  url.searchParams.set('key', key);
  url.searchParams.set('types', 'address');
  if (country) url.searchParams.set('components', `country:${country}`);
  if (session) url.searchParams.set('sessiontoken', session);

  try {
    const r = await fetch(url.toString(), { cache: 'no-store' });
    const data = await r.json();
    // Return only what the client needs — never leak the raw key/response.
    const predictions = (data.predictions || []).map((p: any) => ({
      placeId: p.place_id,
      main: p.structured_formatting?.main_text ?? p.description,
      secondary: p.structured_formatting?.secondary_text ?? '',
      description: p.description,
    }));
    return NextResponse.json({ predictions });
  } catch (e) {
    return NextResponse.json({ error: 'lookup_failed', predictions: [] }, { status: 502 });
  }
}
