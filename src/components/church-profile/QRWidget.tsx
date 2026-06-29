"use client";

import React, { useState, useEffect } from 'react';

type QRWidgetProps = {
  churchName: string;
};

export default function QRWidget({ churchName }: QRWidgetProps) {
  const [showQR, setShowQR] = useState(false);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  return (
    <div className="scard" style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: '#0f172a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>QR scan & share</h4>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Open this profile on any phone</div>
          </div>
        </div>
        <button 
          onClick={() => setShowQR(!showQR)}
          style={{ background: '#a855f7', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.2s' }}
        >
          {showQR ? 'Hide QR' : 'Get QR'}
        </button>
      </div>

      {showQR && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pageUrl)}&margin=0`} 
            alt="QR Code" 
            style={{ width: '180px', height: '180px', borderRadius: '8px', marginBottom: '16px' }}
          />
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textAlign: 'center', maxWidth: '240px', lineHeight: '1.5' }}>
            Scan to open {churchName} on any device
          </div>
        </div>
      )}
    </div>
  );
}
