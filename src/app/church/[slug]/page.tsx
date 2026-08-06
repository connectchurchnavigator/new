import React from 'react';
import { notFound } from 'next/navigation';
import { getChurchBySlug, searchChurches } from '@/lib/api';
import { createAdminClient } from '@/lib/supabase-admin';
import { safeParseJsonArray } from '@/lib/validation';
import Link from 'next/link';
import EditCoverModal from '@/components/church-profile/EditCoverModal';
import ShareButton from '@/components/church-profile/ShareButton';
import HeroCarousel from '@/components/church-profile/HeroCarousel';
import ChurchProfileClient from '@/components/church-profile/ChurchProfileClient';
import VisitorBanner from '@/components/church-profile/VisitorBanner';
import ContactSection from '@/components/church-profile/ContactSection';
import NearbySection from '@/components/church-profile/NearbySection';
import ViewTracker from '@/components/church-profile/ViewTracker';
import TopNav from '@/components/layout/TopNav';
import HeroHeader from '@/components/church-profile/HeroHeader';
import './church.css';

export default async function ChurchProfilePage({ params, searchParams }: { params: Promise<{ slug: string }> | { slug: string }, searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined } }) {
  const sb = createAdminClient();
  let church;
  try {
    const resolvedParams = await params;
    church = await getChurchBySlug(sb, resolvedParams.slug);
  } catch (error) {
    console.error('ERROR IN getChurchBySlug:', error);
    return notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isOwner = resolvedSearchParams.owner === 'true';
  const isEditing = resolvedSearchParams.edit === 'true';

  if (!church) return notFound();

  // Fetch branches count
  const { count: branchesCountRes } = await sb
    .from('churches')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', church.org_id)
    .eq('status', 'published');
  const branchesCount = branchesCountRes || 1;

  let nearbyChurches: any[] = [];
  try {
    if (church.city) {
      const results = await searchChurches(sb, { city: church.city, limit: 6 });
      nearbyChurches = results.filter(c => c.id !== church.id).slice(0, 3);
    }
    if (nearbyChurches.length < 3) {
      const fallbackResults = await searchChurches(sb, { limit: 8 });
      const extra = fallbackResults.filter(c => c.id !== church.id && !nearbyChurches.some(nc => nc.id === c.id));
      nearbyChurches = [...nearbyChurches, ...extra].slice(0, 3);
    }
  } catch (e) {
    console.error('Failed to fetch nearby churches:', e);
  }

  // --- Deserialization Workaround ---
  let realDenomination = church.denomination;
  let establishedYear = null;
  if (realDenomination && realDenomination.includes('|||est:')) {
    const parts = realDenomination.split('|||est:');
    realDenomination = parts[0];
    establishedYear = parts[1];
  }

  let realYoutube = church.youtube;
  let liveStreamUrl = null;
  let tiktokUrl = null;
  let twitterUrl = null;
  let telegramUrl = null;

  if (realYoutube) {
    const parts = realYoutube.split('|||');
    realYoutube = parts[0];

    for (let i = 1; i < parts.length; i++) {
      if (parts[i].startsWith('live:')) liveStreamUrl = parts[i].replace('live:', '');
      else if (parts[i].startsWith('tiktok:')) tiktokUrl = parts[i].replace('tiktok:', '');
      else if (parts[i].startsWith('twitter:')) twitterUrl = parts[i].replace('twitter:', '');
      else if (parts[i].startsWith('telegram:')) telegramUrl = parts[i].replace('telegram:', '');
    }
  }

  let coverUrls: string[] = [];
  if (church.cover_url) {
    if (church.cover_url.includes('|||')) {
      coverUrls = church.cover_url.split('|||');
    } else {
      coverUrls = [church.cover_url];
    }
  }
  // ----------------------------------

  // --- Rich Array Deserialization (using shared safeParseJsonArray helper) ---
  const languages = safeParseJsonArray<string>(church.languages);
  const facilities = safeParseJsonArray<string>(church.facilities);
  const ministries = safeParseJsonArray<string>(church.ministries);
  const worshipStyles = safeParseJsonArray<string>(church.worship_style);

  return (
    <>
      {!isOwner && <ViewTracker churchId={church.id} />}
      {isEditing && <EditCoverModal church={church} />}
      {isOwner && <div style={{ height: '48px', width: '100%' }} />}
      
      {/* ===== NAV ===== */}
      <TopNav />

      <main id="detail" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0' }}>
          <Link className="back" href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            All churches
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            {isOwner && (
              <Link href="/dashboard/insights" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textDecoration: 'none' }}>
                <i className="ti ti-chart-bar"></i> Visitor insights
              </Link>
            )}
            <Link id="tour-owner-toggle" href={`/church/${church.slug}${isOwner ? '' : '?owner=true'}`} scroll={false} style={{ textDecoration: 'none', background: isOwner ? '#7e22ce' : '#f3e8ff', color: isOwner ? '#fff' : '#7e22ce', border: '1px solid #e9d5ff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              Owner View {isOwner ? 'ON' : 'OFF'}
            </Link>
          </div>
        </div>

      {/* Main Client Profile */}

      <ChurchProfileClient
        initialChurch={church}
        isEditing={isOwner}
        twitterUrl={twitterUrl}
        tiktokUrl={tiktokUrl}
        telegramUrl={telegramUrl}
        initialBranchesCount={branchesCount}
        initialNearbyChurches={nearbyChurches}
      />

    </main>
    </>
  );
}
