'use client';

import React, { useState, useEffect } from 'react';

interface GalleryPhoto {
  id: string;
  image_url: string;
  caption?: string | null;
}

export function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, photos.length]);

  if (!photos || photos.length === 0) {
    return (
      <div className="pastor-card">
        <div className="pastor-card-h">
          <div className="ic" style={{ background: '#7c3aed', color: '#fff' }}><i className="ti ti-photo"></i></div>
          <h3>Gallery</h3>
        </div>
        <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b' }}>
          No gallery photos uploaded yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pastor-card">
        <div className="pastor-card-h">
          <div className="ic" style={{ background: '#7c3aed', color: '#fff' }}><i className="ti ti-photo"></i></div>
          <h3>Gallery</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
          {photos.map((g, idx) => (
            <div
              key={g.id || idx}
              onClick={() => setSelectedIndex(idx)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                border: '1.5px solid #f1f1f5',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(124, 58, 237, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.06)';
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.image_url}
                alt={g.caption ?? ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent 60%)',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
              className="gallery-hover-overlay"
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-zoom-in" style={{ fontSize: '22px' }}></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(10, 10, 18, 0.94)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
            }}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              zIndex: 10
            }}
          >
            <i className="ti ti-x"></i>
          </button>

          {/* Photo Counter */}
          <div
            style={{
              position: 'absolute',
              top: '32px',
              left: '32px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 16px',
              borderRadius: '20px',
              backdropFilter: 'blur(8px)'
            }}
          >
            {selectedIndex + 1} / {photos.length}
          </div>

          {/* Prev Arrow */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0));
              }}
              style={{
                position: 'absolute',
                left: '24px',
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                zIndex: 10
              }}
            >
              <i className="ti ti-chevron-left"></i>
            </button>
          )}

          {/* Main Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[selectedIndex].image_url}
              alt={photos[selectedIndex].caption || 'Gallery photo'}
              style={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            />
            {photos[selectedIndex].caption && (
              <div style={{ color: '#e2e8f0', marginTop: '14px', fontSize: '15px', fontWeight: 600, textAlign: 'center' }}>
                {photos[selectedIndex].caption}
              </div>
            )}
          </div>

          {/* Next Arrow */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
              }}
              style={{
                position: 'absolute',
                right: '24px',
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                zIndex: 10
              }}
            >
              <i className="ti ti-chevron-right"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
