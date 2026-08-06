"use client";

import React from "react";
import Link from "next/link";
import HeroCarousel from "./HeroCarousel";
import ShareButton from "./ShareButton";

interface HeroHeaderProps {
  church: any;
  isOwner: boolean;
  realDenomination: string | null;
  establishedYear: string | null;
  liveStreamUrl: string | null;
  coverUrls: string[];
}

export default function HeroHeader({
  church,
  isOwner,
  realDenomination,
  establishedYear,
  liveStreamUrl,
  coverUrls
}: HeroHeaderProps) {
  const instagram = church.social_instagram || church.instagram;
  const facebook = church.social_facebook || church.facebook;

  let youtube = church.social_youtube || church.youtube;
  if (youtube && youtube.includes("|||")) {
    youtube = youtube.split("|||")[0];
  }

  let twitter = church.social_twitter || church.twitter;
  if (!twitter && church.youtube && church.youtube.includes("|||twitter:")) {
    twitter = church.youtube.match(/\|\|\|twitter:(.*?)(?:\|\|\||$)/)?.[1];
  }

  let tiktok = church.social_tiktok || church.tiktok;
  if (!tiktok && church.youtube && church.youtube.includes("|||tiktok:")) {
    tiktok = church.youtube.match(/\|\|\|tiktok:(.*?)(?:\|\|\||$)/)?.[1];
  }

  let telegram = church.social_telegram || church.telegram;
  if (!telegram && church.youtube && church.youtube.includes("|||telegram:")) {
    telegram = church.youtube.match(/\|\|\|telegram:(.*?)(?:\|\|\||$)/)?.[1];
  }

  return (
    <div className="wrap" id="tour-hero-banner" style={{ paddingTop: '14px' }}>
      <div className="hero" id="hero" style={{ borderRadius: '24px', position: 'relative', overflow: 'hidden', minHeight: '460px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px' }}>
        
        <HeroCarousel coverUrls={coverUrls} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', border: '3px solid #fff', background: church.logo_url ? `url(${church.logo_url}) center/cover` : 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: 800 }}>
            {!church.logo_url && church.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
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
            {(church.city || church.country) && (
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="ti ti-map-pin"></i> {church.city || church.country}
              </span>
            )}
            {establishedYear && (
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                Est. {establishedYear}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px', flexWrap: 'wrap', gap: '16px' }}>
            <div id="tour-hero-info" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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

            {/* Live Reactive Social Links Icons */}
            <div id="tour-hero-socials" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {instagram && (
                  <a href={instagram} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e1306c', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                    <i className="ti ti-brand-instagram"></i>
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877f2', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                    <i className="ti ti-brand-facebook"></i>
                  </a>
                )}
                {youtube && (
                  <a href={youtube} target="_blank" rel="noreferrer" className="s-icon yt" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                    <i className="ti ti-brand-youtube"></i>
                  </a>
                )}
                {twitter && (
                  <a href={twitter} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                    <i className="ti ti-brand-x"></i>
                  </a>
                )}
                {tiktok && (
                  <a href={tiktok} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                    <i className="ti ti-brand-tiktok"></i>
                  </a>
                )}
                {telegram && (
                  <a href={telegram} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#24A1DE', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                    <i className="ti ti-brand-telegram"></i>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
