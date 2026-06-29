// ───────────────────────────────────────────────────────────────────────
// Ekklesia — Google Places ADDRESS DETAILS proxy  (server-side only)
// Next.js App Router:  app/api/address/details/route.ts
//
// Resolves a placeId (from /suggest) into a clean, parsed address with the
// correct post town (e.g. "Ilford"), house number, and lat/lng — the data
// free OpenStreetMap can't give. Key stays on the server.
//
// Client usage:
//   GET /api/address/details?placeId=<id>&session=<uuid>
// Returns: { address_line, city, area, state, postcode, country,
//            country_code, formatted_address, google_place_id, latitude, longitude }
// ───────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';

type Comp = { long_name: string; short_name: string; types: string[] };

function pick(comps: Comp[], type: string, short = false): string {
  const c = comps.find(x => x.types.includes(type));
  return c ? (short ? c.short_name : c.long_name) : '';
}

function parseComponents(comps: Comp[], formatted: string, loc: any) {
  const streetNumber = pick(comps, 'street_number');
  const route = pick(comps, 'route');
  const address_line = [streetNumber, route].filter(Boolean).join(' ') || formatted.split(',')[0];
  // post town: prefer Google's postal_town (UK), then locality
  const city = pick(comps, 'postal_town') || pick(comps, 'locality') || pick(comps, 'postal_town');
  const area = pick(comps, 'sublocality') || pick(comps, 'neighborhood');
  const state = pick(comps, 'administrative_area_level_1');
  const postcode = pick(comps, 'postal_code');
  const country = pick(comps, 'country');
  const country_code = pick(comps, 'country', true);
  return {
    address_line, city, area, state, postcode, country, country_code,
    formatted_address: formatted,
    latitude: loc?.lat ?? null,
    longitude: loc?.lng ?? null,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId') || '';
  const session = searchParams.get('session') || '';
  if (!placeId) return NextResponse.json({ error: 'placeId required' }, { status: 400 });

  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) return NextResponse.json({ error: 'Address service not configured' }, { status: 500 });

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('key', key);
  url.searchParams.set('fields', 'address_component,formatted_address,geometry,place_id');
  if (session) url.searchParams.set('sessiontoken', session);

  try {
    const r = await fetch(url.toString(), { cache: 'no-store' });
    const data = await r.json();
    const result = data.result;
    if (!result) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const parsed = parseComponents(
      result.address_components || [],
      result.formatted_address || '',
      result.geometry?.location,
    );
    return NextResponse.json({ ...parsed, google_place_id: result.place_id });
  } catch (e) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 502 });
  }
}
