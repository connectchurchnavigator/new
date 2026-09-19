'use client';

import React, { useEffect, useRef } from 'react';

export interface VisitorLocation {
  city: string;
  country: string;
  count: number;
  lat: number;
  lng: number;
  enquiries: number;
}

interface PastorVisitorMapProps {
  locations: VisitorLocation[];
  totalViews: number;
  selectedTimeframe: string;
}

export default function PastorVisitorMap({
  locations,
  totalViews,
  selectedTimeframe,
}: PastorVisitorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        let L: any = (window as any).L;
        if (!L) {
          L = await import('leaflet');
          if (L.default) L = L.default;
        }

        if (!isMounted || !mapContainerRef.current) return;

        // Clean up previous instance
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {}
          mapInstanceRef.current = null;
        }

        const defaultLat = locations.length > 0 ? locations[0].lat : 51.5074;
        const defaultLng = locations.length > 0 ? locations[0].lng : -0.1278;

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
        }).setView([defaultLat, defaultLng], locations.length > 1 ? 4 : 5);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Clean CartoDB Positron / OSM tiles for high-end SaaS look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 18,
          subdomains: 'abcd',
        }).addTo(map);

        mapInstanceRef.current = map;

        const group = L.featureGroup();

        locations.forEach((loc) => {
          // Custom glowing badge marker
          const isHotspot = loc.enquiries > 0;
          const markerHtml = `
            <div style="
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 38px;
              height: 38px;
            ">
              <div style="
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: ${isHotspot ? 'rgba(244, 63, 94, 0.35)' : 'rgba(124, 58, 237, 0.3)'};
                animation: map-pulse 2s infinite ease-out;
              "></div>
              <div style="
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: ${isHotspot ? 'linear-gradient(135deg, #f43f5e, #be123c)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)'};
                border: 2.5px solid #ffffff;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 11px;
                font-weight: 900;
              ">
                ${loc.count > 99 ? '99+' : loc.count}
              </div>
            </div>
          `;

          const icon = L.divIcon({
            className: 'visitor-map-marker',
            html: markerHtml,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -18],
          });

          const marker = L.marker([loc.lat, loc.lng], { icon });

          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 2px;">
              <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
                📍 ${loc.city}, ${loc.country}
              </div>
              <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 2px;">
                <span style="color: #64748b; font-weight: 600;">Profile Visits:</span>
                <span style="font-weight: 800; color: #7c3aed;">${loc.count}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 12px;">
                <span style="color: #64748b; font-weight: 600;">Direct Enquiries:</span>
                <span style="font-weight: 800; color: #f43f5e;">${loc.enquiries}</span>
              </div>
              <div style="margin-top: 8px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 4px;">
                Period: ${selectedTimeframe}
              </div>
            </div>
          `);

          marker.addTo(group);
        });

        group.addTo(map);

        if (locations.length > 1) {
          try {
            map.fitBounds(group.getBounds().pad(0.3));
          } catch (e) {}
        }
      } catch (err) {
        console.error('Error rendering visitor map:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [locations, selectedTimeframe]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '18px', overflow: 'hidden', border: '1.5px solid #e2e8f0', background: '#f8fafc' }}>
      <style jsx global>{`
        @keyframes map-pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      {/* Embedded Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 400,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '10px 16px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(15, 23, 42, 0.1)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}></span>
          Profile Visits
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }}></span>
          Enquiry Hotspots
        </div>
      </div>

      {/* Bottom stats ribbon */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '8px 16px',
          borderRadius: '10px',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span>🌍 {locations.length} Global Cities Active</span>
        <span style={{ color: '#94a3b8' }}>•</span>
        <span style={{ color: '#c084fc' }}>{totalViews.toLocaleString()} Total Impressions</span>
      </div>
    </div>
  );
}
