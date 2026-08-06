"use client";

import React from 'react';
import Link from 'next/link';

interface NearbySectionProps {
  churches: any[];
}

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2973&auto=format&fit=crop';

const GRADIENT_LOGOS = [
  'linear-gradient(135deg, #0d9488, #0284c7)',
  'linear-gradient(135deg, #7c3aed, #a855f7)',
  'linear-gradient(135deg, #e11d48, #f43f5e)'
];

export default function NearbySection({ churches }: NearbySectionProps) {
  if (!churches || churches.length === 0) return null;

  return (
    <div className="wrap nearby" style={{ marginTop: '40px', marginBottom: '60px' }}>
      <div className="nearby-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Churches nearby
        </h2>
        <Link href="/" style={{ color: '#7c3aed', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          View all →
        </Link>
      </div>

      <div className="nearby-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {churches.slice(0, 3).map((c, index) => {
          const initials = c.name?.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() || 'CN';
          const defaultGradient = GRADIENT_LOGOS[index % GRADIENT_LOGOS.length];
          
          const rawCover = c.cover_url ? (c.cover_url.includes('|||') ? c.cover_url.split('|||')[0] : c.cover_url) : DEFAULT_COVER;
          const coverImg = (rawCover.includes('photo-1438032005730') || rawCover.includes('1754468293')) ? DEFAULT_COVER : rawCover;
          
          let denomination = c.denomination;
          if (denomination && denomination.includes('|||est:')) {
            denomination = denomination.split('|||est:')[0];
          }

          const tags = Array.isArray(c.ministries) ? c.ministries.slice(0, 3) : typeof c.ministries === 'string' && c.ministries ? c.ministries.split(',').slice(0, 3) : ['Youth Ministry', "Children's Church", 'Food Bank'];

          return (
            <Link key={c.id} href={`/church/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div 
                style={{ 
                  background: '#fff', 
                  borderRadius: '20px', 
                  border: '1px solid #e2e8f0', 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(124, 58, 237, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
                }}
              >
                {/* Card Cover Image Header */}
                <div style={{ height: '170px', position: 'relative', background: `url(${coverImg}) center/cover` }}>
                  {/* Top Denomination Badge */}
                  {denomination && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.65)', color: '#fff', backdropFilter: 'blur(8px)', padding: '5px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700 }}>
                      {denomination}
                    </div>
                  )}

                  {/* Logo / Initials Badge */}
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '42px', height: '42px', borderRadius: '12px', background: c.logo_url ? `url(${c.logo_url}) center/cover` : defaultGradient, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                    {!c.logo_url && initials}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                      {c.name}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '13px', fontWeight: 500, marginBottom: '14px' }}>
                      <i className="ti ti-map-pin" style={{ fontSize: '14px', color: '#a855f7' }}></i>
                      <span>{[c.city, c.country].filter(Boolean).join(', ') || 'London, UK'}</span>
                    </div>

                    {/* Ministry / Feature Tags */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                      {tags.map((tag: any, idx: number) => (
                        <span key={idx} style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600 }}>
                          {typeof tag === 'string' ? tag.trim() : tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      <span style={{ color: '#f59e0b' }}>★</span> 4.8 <span style={{ color: '#94a3b8', fontWeight: 500 }}>(120)</span>
                    </div>
                    <span style={{ color: '#7c3aed', fontWeight: 700, fontSize: '13px' }}>
                      View profile →
                    </span>
                  </div>
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
