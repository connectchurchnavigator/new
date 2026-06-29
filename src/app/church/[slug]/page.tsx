import React from 'react';
import { notFound } from 'next/navigation';
import { getChurchBySlug } from '@/lib/api';
import { createAdminClient } from '@/lib/supabase-admin';
import Link from 'next/link';
import EditCoverModal from '@/components/church-profile/EditCoverModal';
import ShareButton from '@/components/church-profile/ShareButton';
import HeroCarousel from '@/components/church-profile/HeroCarousel';
import ChurchProfileClient from '@/components/church-profile/ChurchProfileClient';
import VisitorBanner from '@/components/church-profile/VisitorBanner';
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

  // Parse JSON arrays for languages and facilities if they are stored as JSON strings
  let languages = church.languages || [];
  if (typeof languages === 'string') {
    try { languages = JSON.parse(languages); } catch(e) {}
  }
  let facilities = church.facilities || [];
  if (typeof facilities === 'string') {
    try { facilities = JSON.parse(facilities); } catch(e) {}
  }
  
  let ministries = church.ministries || [];
  if (typeof ministries === 'string') {
    try { ministries = JSON.parse(ministries); } catch(e) {}
  }
  
  let worshipStyles = church.worship_style || [];
  if (typeof worshipStyles === 'string') {
    try { worshipStyles = JSON.parse(worshipStyles); } catch(e) {}
  }

  return (
    <>
      {isEditing && <EditCoverModal church={church} />}
      
      {/* ===== NAV ===== */}
      <nav className="nav">
        <div className="wrap nav-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 2v6M9 5h6M12 8c-3 2-5 5-5 9 0 0 2 2 5 2s5-2 5-2c0-4-2-7-5-9z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span>Church Navigator<small>Church directory</small></span>
          </Link>
          <label className="nav-search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            <input placeholder="Search churches, cities, ministries…" />
          </label>
          <div className="nav-links">
            <span className="ai-pill"><span className="dot"></span>AI Directory</span>
            <Link href="/">Explore</Link>
            <Link href="/">For churches</Link>
            <Link className="nav-cta" href="/add-church/1">List your church</Link>
          </div>
        </div>
      </nav>

      <main id="detail" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px', paddingTop: isOwner ? '48px' : '0' }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0' }}>
          <Link className="back" href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            All churches
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            {isOwner && (
              <button style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <i className="ti ti-chart-bar"></i> Visitor insights
              </button>
            )}
            <Link href={`/church/${church.slug}${isOwner ? '' : '?owner=true'}`} scroll={false} style={{ textDecoration: 'none', background: isOwner ? '#7e22ce' : '#f3e8ff', color: isOwner ? '#fff' : '#7e22ce', border: '1px solid #e9d5ff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              Demo: Owner view {isOwner ? 'ON' : 'OFF'}
            </Link>
          </div>
        </div>

      <div className="wrap" style={{ paddingTop: '14px' }}>
        <div className="hero" id="hero" style={{ borderRadius: '24px', position: 'relative', overflow: 'hidden', minHeight: '460px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px' }}>
          
          <HeroCarousel coverUrls={coverUrls} />

          <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', gap: '8px', zIndex: 10 }}>
          </div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '20px', border: '3px solid #fff', background: church.logo_url ? `url(${church.logo_url}) center/cover` : 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: 800 }}>
              {!church.logo_url && church.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            
            <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.03em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {church.name}
            </h1>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {realDenomination && (
                <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-cross"></i> {realDenomination}
                </span>
              )}
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="ti ti-map-pin"></i> {church.city}{church.country ? `, ${church.country}` : ''}
              </span>
              {establishedYear && (
                <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Est. {establishedYear}
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href={church.address_line ? `https://maps.google.com/?q=${encodeURIComponent(church.address_line + (church.city ? ', ' + church.city : ''))}` : '#'} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#a855f7', color: '#fff', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)' }}>
                  <i className="ti ti-map-pin" style={{ fontSize: '18px' }}></i> Get directions
                </a>
                {liveStreamUrl && (
                  <a href={liveStreamUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ef4444', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
                    <span className="dot" style={{ background: '#fff', width: '8px', height: '8px', borderRadius: '50%' }}></span> Watch live
                  </a>
                )}
                <ShareButton title={church.name} />
                {isOwner && (
                  <Link href={`/church/${church.slug}?owner=true&edit=true`} scroll={false} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fbbf24', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)', textDecoration: 'none' }}>
                    <i className="ti ti-pencil" style={{ fontSize: '18px' }}></i> Edit cover
                  </Link>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(church.social_instagram || church.instagram) && (
                    <a href={church.social_instagram || church.instagram} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e1306c', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                      <i className="ti ti-brand-instagram"></i>
                    </a>
                  )}
                  {(church.social_facebook || church.facebook) && (
                    <a href={church.social_facebook || church.facebook} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877f2', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                      <i className="ti ti-brand-facebook"></i>
                    </a>
                  )}
                  {realYoutube && (
                    <a href={realYoutube} target="_blank" rel="noreferrer" className="s-icon yt" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                      <i className="ti ti-brand-youtube"></i>
                    </a>
                  )}
                  {twitterUrl && (
                    <a href={twitterUrl} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                      <i className="ti ti-brand-x"></i>
                    </a>
                  )}
                  {tiktokUrl && (
                    <a href={tiktokUrl} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                      <i className="ti ti-brand-tiktok"></i>
                    </a>
                  )}
                  {telegramUrl && (
                    <a href={telegramUrl} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#24A1DE', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                      <i className="ti ti-brand-telegram"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChurchProfileClient
        initialChurch={church}
        isEditing={isOwner}
        twitterUrl={twitterUrl}
        tiktokUrl={tiktokUrl}
        telegramUrl={telegramUrl}
        initialBranchesCount={branchesCount}
      />

      <div className="wrap" style={{ marginTop: '40px' }}>
        <VisitorBanner churchId={church.id} services={church.church_services || []} />
      </div>

    </main>
    </>
  );
}
