"use client";

import React, { useState } from 'react';

type GalleryProps = {
  images?: string[];
};

export default function Gallery({ images = [] }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fallback images if the user hasn't uploaded any gallery images yet
  const displayImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?auto=format&fit=crop&q=80&w=1000', // Stained glass / church interior
    'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=800',  // Bible
    'https://images.unsplash.com/photo-1470229722913-7c090be5bc3a?auto=format&fit=crop&q=80&w=800',  // Worship / concert
    'https://images.unsplash.com/photo-1548625361-ec7286ce3e0b?auto=format&fit=crop&q=80&w=800',  // Architecture
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',  // People / choir
  ];

  return (
    <div className="sec" style={{ marginBottom: '40px' }}>
      <div className="sec-head" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span className="ic" style={{ background: '#f43f5e', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8.5" cy="8.5" r="1.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 15l-5-5L5 22" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <h2 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0 }}>Gallery</h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 200px)',
        gap: '16px'
      }}>
        {displayImages.slice(0, 5).map((img, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedImage(img)}
            style={{
              gridColumn: i === 0 ? 'span 2' : 'span 1',
              gridRow: i === 0 ? 'span 2' : 'span 1',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <img 
              src={img} 
              alt="Gallery item" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={selectedImage} 
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }} 
            alt="Enlarged gallery view"
          />
          <button 
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '30px',
              right: '30px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
