"use client";

import React, { useState, useEffect } from 'react';

export default function HeroCarousel({ coverUrls }: { coverUrls: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = coverUrls && coverUrls.length > 0 
    ? coverUrls 
    : ['https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2973&auto=format&fit=crop'];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <>
      {images.map((img, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `linear-gradient(to top, rgba(30, 27, 36, 1) 0%, rgba(30, 27, 36, 0.4) 50%, rgba(30, 27, 36, 0.1) 100%), url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === currentIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 0,
          }}
        />
      ))}

      {images.length > 1 && (
        <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
          <span style={{ background: 'rgba(30, 27, 36, 0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, backdropFilter: 'blur(8px)' }}>
            {currentIndex + 1}/{images.length}
          </span>
        </div>
      )}

      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', zIndex: 10, position: 'absolute', bottom: '16px', right: '40px' }}>
          {images.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: i === currentIndex ? '24px' : '8px',
                height: '8px',
                background: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                borderRadius: i === currentIndex ? '4px' : '50%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            ></div>
          ))}
        </div>
      )}
    </>
  );
}
