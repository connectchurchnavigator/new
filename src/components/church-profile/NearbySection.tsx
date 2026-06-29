import React from 'react';

export default function NearbySection() {
  return (
    <div className="wrap nearby">
      <div className="nearby-head">
        <h2>Churches nearby</h2>
        <a className="card-foot" style={{ border: 'none', padding: 0, cursor: 'pointer' }}>
          <span className="go" style={{ color: 'var(--purple)', fontWeight: 700, fontSize: '14px' }}>View all →</span>
        </a>
      </div>
      <div className="nearby-grid">
        {/* Placeholder cards to match mockup aesthetic */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ height: '140px', background: '#e2e8f0' }}></div>
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Grace Covenant</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>London, UK</p>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ height: '140px', background: '#e2e8f0' }}></div>
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>City Light Assembly</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>London, UK</p>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ height: '140px', background: '#e2e8f0' }}></div>
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Hope Chapel</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>London, UK</p>
          </div>
        </div>
      </div>
    </div>
  );
}
