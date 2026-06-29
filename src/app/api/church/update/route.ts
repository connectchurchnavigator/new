import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const sb = createAdminClient();
    const body = await req.json();
    const { churchId, church, services } = body;

    if (!churchId) {
      return NextResponse.json({ error: 'churchId is required' }, { status: 400 });
    }

    // ── 1. Update the churches table ──────────────────────────
    const patch: Record<string, unknown> = {
      about:            church.about             ?? null,
      ministries:       church.ministries        ?? [],
      languages:        church.languages         ?? [],
      facilities:       church.facilities        ?? [],
      worship_styles:   church.worship_styles    ?? [],
      gallery:          church.gallery           ?? [],
      cover_url:        church.cover_url         ?? null,
      logo_url:         church.logo_url          ?? null,
      live_stream_url:  church.live_stream_url   ?? null,
      cover_images:     church.cover_images      ?? [],

      // Contact
      address_line:     church.address_line      ?? null,
      city:             church.city              ?? null,
      state:            church.state             ?? null,
      country:          church.country           ?? null,
      postcode:         church.postcode          ?? null,
      latitude:         church.latitude          ?? null,
      longitude:        church.longitude         ?? null,
      phone:            church.phone             ?? null,
      email:            church.email             ?? null,
      website:          church.website           ?? null,

      // Socials
      social_facebook:  church.social_facebook   ?? church.facebook  ?? null,
      social_instagram: church.social_instagram  ?? church.instagram ?? null,
      social_youtube:   church.social_youtube    ?? church.youtube   ?? null,
      social_twitter:   church.social_twitter    ?? null,
      social_tiktok:    church.social_tiktok     ?? null,
      social_telegram:  church.social_telegram   ?? null,

      updated_at: new Date().toISOString(),
    };

    const { error: churchError } = await sb
      .from('churches')
      .update(patch)
      .eq('id', churchId);

    if (churchError) {
      console.error('Church update error:', churchError);
      return NextResponse.json({ error: churchError.message }, { status: 500 });
    }

    // ── 2. Replace church_services ────────────────────────────
    if (Array.isArray(services)) {
      await sb.from('church_services').delete().eq('church_id', churchId);
      if (services.length > 0) {
        const rows = services.map((s: any, i: number) => ({
          church_id:      churchId,
          day:            s.day,
          name:           s.name,
          start_time:     s.start_time  ?? null,
          end_time:       s.end_time    ?? null,
          format:         s.format      ?? 'In-Person',
          language:       s.language    ?? null,
          livestream_url: s.livestream_url ?? null,
          display_order:  i,
        }));
        const { error: svcError } = await sb.from('church_services').insert(rows);
        if (svcError) throw svcError;
      }
    }

    // ── 3. Replace branches ───────────────────────────────────
    if (Array.isArray(body.branches)) {
      await sb.from('branches').delete().eq('church_id', churchId);
      if (body.branches.length > 0) {
        const branchRows = body.branches.map((b: any) => ({
          church_id:    churchId,
          name:         b.name,
          denomination: b.denomination ?? null,
          address:      b.address      ?? null,
          latitude:     b.latitude     ?? null,
          longitude:    b.longitude    ?? null,
          cover_url:    b.coverUrl     ?? b.cover_url ?? null,
          dp_url:       b.dpUrl        ?? b.dp_url    ?? null,
        }));
        const { error: brError } = await sb.from('branches').insert(branchRows);
        if (brError) throw brError;
      }
    }

    // ── 4. Replace teams ──────────────────────────────────────
    if (Array.isArray(body.teams)) {
      await sb.from('church_teams').delete().eq('church_id', churchId);
      if (body.teams.length > 0) {
        for (const t of body.teams) {
          const { data: insertedTeam, error: tError } = await sb.from('church_teams').insert({
            church_id:   churchId,
            name:        t.name,
            about:       t.about        ?? null,
            youtube_url: t.youtubeUrl   ?? t.youtube_url ?? null,
            cover_url:   t.coverUrl     ?? t.cover_url   ?? null,
          }).select().single();
          if (tError) throw tError;

          const members = t.teamMembers ?? t.members ?? [];
          if (Array.isArray(members) && members.length > 0) {
            const memberRows = members.map((m: any, i: number) => ({
              team_id:       insertedTeam.id,
              name:          m.name,
              role:          m.role      ?? null,
              photo_url:     m.photo     ?? m.photoUrl   ?? m.photo_url ?? null,
              display_order: i,
            }));
            const { error: mError } = await sb.from('church_team_members').insert(memberRows);
            if (mError) throw mError;
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('updateChurchProfile error:', err);
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
