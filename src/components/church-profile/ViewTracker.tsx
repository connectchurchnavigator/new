'use client'

import { useEffect, useRef } from 'react';
import { trackProfileView } from '@/app/actions/trackView';

export default function ViewTracker({ churchId }: { churchId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    
    // Simple referrer logic
    let source = 'Unknown';
    if (document.referrer) {
      if (document.referrer.includes('google') || document.referrer.includes('bing') || document.referrer.includes('yahoo')) {
        source = 'Search';
      } else if (document.referrer.includes('facebook') || document.referrer.includes('instagram') || document.referrer.includes('twitter') || document.referrer.includes('t.co')) {
        source = 'Social media';
      } else {
        source = 'Shared links';
      }
    }
    
    // Override if they came from directory search
    const params = new URLSearchParams(window.location.search);
    if (params.get('ref') === 'directory') {
      source = 'Ekklesia directory';
    } else if (!document.referrer && !params.get('ref')) {
      source = 'Shared links'; // Fallback for direct traffic
    }
    
    trackProfileView(churchId, source);
  }, [churchId]);

  return null;
}
