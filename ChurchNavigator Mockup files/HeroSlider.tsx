'use client';

import { Children, cloneElement, isValidElement, useEffect, useState } from 'react';

interface HeroSliderProps {
  slideCount: number;
  children: React.ReactNode;
}

/**
 * Wraps the hero's slide stack. Each direct child is expected to
 * accept an `isActive: boolean` prop (see HeroSlide below) which it
 * uses to fade itself in/out. Auto-advances every 4.5s; dots and the
 * "n / total" counter are clickable/interactive.
 */
export function HeroSliderProvider({ slideCount, children }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slideCount), 4500);
    return () => clearInterval(timer);
  }, [slideCount]);

  return (
    <div style={{ position: 'relative', height: 420, overflow: 'hidden', background: '#111' }}>
      {Children.map(children, (child, i) =>
        isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ isActive?: boolean }>, { isActive: i === current })
          : child
      )}

      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          zIndex: 10,
          background: 'rgba(0,0,0,.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,.15)',
          borderRadius: 10,
          padding: '4px 11px',
          fontSize: 12,
          fontWeight: 700,
          color: '#fff',
        }}
      >
        {current + 1} / {slideCount}
      </div>

      <div style={{ position: 'absolute', bottom: 14, right: 24, display: 'flex', gap: 5, zIndex: 10 }}>
        {Array.from({ length: slideCount }).map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 20 : 5,
              height: 5,
              borderRadius: 3,
              background: i === current ? '#fff' : 'rgba(255,255,255,.4)',
              cursor: 'pointer',
              transition: 'all .3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface HeroSlideProps {
  isActive?: boolean;
  children: React.ReactNode;
}

/**
 * A single slide. Receives `isActive` from HeroSliderProvider above.
 * Always rendered (not unmounted) so its opacity transition can run.
 */
export function HeroSlide({ isActive, children }: HeroSlideProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: isActive ? 1 : 0,
        zIndex: isActive ? 2 : 1,
        transition: 'opacity .7s',
      }}
    >
      {children}
    </div>
  );
}
