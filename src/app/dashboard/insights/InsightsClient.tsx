'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/Assets/logo (1).png';

interface InsightsClientProps {
  churchName: string;
  stats: { total: number; new_this_month: number; returning_rate: number; at_risk: number } | null;
  funnel: { stage: string; count: number }[];
  sources: { source: string; count: number }[];
  visitors: any[];
}

const STAGES = [
  { k: 'discovery', l: 'Viewed profile', c: '#7c3aed' },
  { k: 'first', l: 'Clicked contact', c: '#8b5cf6' },
  { k: 'returning', l: 'Enquired', c: '#a855f7' },
  { k: 'engaged', l: 'Visited / checked in', c: '#ec4899' },
  { k: 'member', l: 'Returned', c: '#f43f5e' },
  { k: 'leader', l: 'Joined', c: '#16a34a' },
];

const SOURCE_COLORS: Record<string, string> = {
  'Search': '#7c3aed',
  'Ekklesia directory': '#f43f5e',
  'Shared links': '#2dd4bf',
  'Social media': '#f59e0b',
  'QR / in person': '#6366f1',
  'Unknown': '#94a3b8'
};

const STAGE_STYLE: Record<string, string[]> = {
  discovery: ['#f5f3ff', '#6d28d9'],
  first: ['#ede9fe', '#7c3aed'],
  returning: ['#fce7f3', '#be185d'],
  engaged: ['#dcfce7', '#15803d'],
  member: ['#fef3c7', '#b45309'],
  leader: ['#dcfce7', '#15803d'],
};

const AV_GRADIENTS = [
  'linear-gradient(135deg, #ec4899, #a855f7)',
  'linear-gradient(135deg, #34d399, #16a34a)',
  'linear-gradient(135deg, #2dd4bf, #0891b2)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #6366f1, #4f46e5)',
];

function getAvatarBg(name: string) {
  if (!name || name === 'Anonymous visitor') return 'linear-gradient(135deg, #94a3b8, #64748b)';
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AV_GRADIENTS[sum % AV_GRADIENTS.length];
}

function timeAgo(dateString?: string) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 172800) return 'Yesterday';
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} days ago`;
}

function getFollowUp(stage: string) {
  switch (stage) {
    case 'first': return <span className="followup">Send welcome &rarr;</span>;
    case 'returning': return <span className="followup">Reply to enquiry &rarr;</span>;
    case 'engaged': return <span className="followup">Invite to connect group &rarr;</span>;
    case 'member': return <span className="followup">Follow up call &rarr;</span>;
    case 'leader': return <span style={{ color: 'var(--cn-gray-light)' }}>&mdash;</span>;
    case 'discovery':
    default: return <span style={{ color: 'var(--cn-gray-light)' }}>&mdash;</span>;
  }
}

export default function InsightsClient({ churchName, stats, funnel, sources, visitors }: InsightsClientProps) {
  console.log("InsightsClient rendered. Funnel:", funnel, "Sources:", sources);
  const [range, setRange] = useState('30d');

  const total = stats?.total || 0;
  const newThisMonth = stats?.new_this_month || 0;
  const returningRate = stats?.returning_rate || 0;
  const atRisk = stats?.at_risk || 0;

  // Process Funnel
  const maxFunnel = funnel.length > 0 ? Math.max(...funnel.map(f => f.count)) : 0;
  const funnelData = STAGES.map(s => {
    const found = funnel.find(f => f.stage === s.k);
    return { ...s, count: found ? found.count : 0 };
  });

  // Process Sources
  const totalSources = sources.reduce((sum, s) => sum + s.count, 0);

  return (
    <>
      <div className="top">
        <Link href="/dashboard" className="brand" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src={logoImg} alt="Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        </Link>
        <span className="crumb">{churchName} &middot; Dashboard</span>
        <div className="seg">
          <button className={range === '7d' ? 'on' : ''} onClick={() => setRange('7d')}>7 days</button>
          <button className={range === '30d' ? 'on' : ''} onClick={() => setRange('30d')}>30 days</button>
          <button className={range === '90d' ? 'on' : ''} onClick={() => setRange('90d')}>90 days</button>
        </div>
      </div>

      <div className="content">
        <h1>Visitor insights</h1>
        <div className="sub">See who's discovering your church and where they are in their journey — so you can follow up at the right moment.</div>

        <div className="cards">
          <div className="scard">
            <div className="ic" style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}><i className="ti ti-users"></i></div>
            <div className="v">{total.toLocaleString()}</div>
            <div className="l">Total visitors</div>
            <div className="tr"><i className="ti ti-arrow-up-right"></i> +12% vs last period</div>
          </div>
          <div className="scard">
            <div className="ic" style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)' }}><i className="ti ti-user-plus"></i></div>
            <div className="v">{newThisMonth.toLocaleString()}</div>
            <div className="l">New this period</div>
            <div className="tr"><i className="ti ti-arrow-up-right"></i> +{newThisMonth} this week</div>
          </div>
          <div className="scard">
            <div className="ic" style={{ background: 'linear-gradient(135deg,#2dd4bf,#0891b2)' }}><i className="ti ti-map-pin-check"></i></div>
            <div className="v">{funnel.find(f => f.stage === 'engaged')?.count || 0}</div>
            <div className="l">Visited / checked in</div>
            <div className="tr"><i className="ti ti-arrow-up-right"></i> +{(funnel.find(f => f.stage === 'engaged')?.count || 0)} this week</div>
          </div>
          <div className="scard">
            <div className="ic" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}><i className="ti ti-trending-up"></i></div>
            <div className="v">{total > 0 ? (((funnel.find(f => f.stage === 'leader')?.count || 0) / total) * 100).toFixed(1) : '0'}%</div>
            <div className="l">Visitor &rarr; member</div>
            <div className="tr"><i className="ti ti-arrow-up-right"></i> {(funnel.find(f => f.stage === 'leader')?.count || 0)} joined</div>
          </div>
        </div>

        <div className="grid2">
          <div className="panel">
            <div className="ph"><h3>Visitor journey funnel</h3><span className="hint">how many move from one stage to the next</span></div>
            <div className="funnel">
              {funnelData.map((s, i) => {
                const pct = maxFunnel > 0 ? Math.round((s.count / maxFunnel) * 100) : 0;
                const prevCount = i > 0 ? funnelData[i - 1].count : 0;
                const drop = i > 0 && prevCount > 0 ? Math.round((s.count / prevCount) * 100) : (i > 0 && s.count > 0 ? 100 : 0);
                return (
                  <div className="fstage" key={s.k}>
                    <span className="lbl">{s.l}</span>
                    <div className="fbar" style={{ width: `${Math.max(pct, 8)}%`, background: s.c }}>{s.count.toLocaleString()}</div>
                    <span className="pct">{i > 0 && prevCount > 0 ? `${drop}% kept` : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="panel">
            <div className="ph"><h3>How they found you</h3></div>
            <div>
              {sources.length > 0 ? sources.map(s => {
                const c = SOURCE_COLORS[s.source] || '#94a3b8';
                const pc = totalSources > 0 ? Math.round((s.count / totalSources) * 100) : 0;
                let iconClass = 'ti-point-filled';
                if (s.source === 'Search') iconClass = 'ti-search';
                else if (s.source === 'Ekklesia directory') iconClass = 'ti-list-search';
                else if (s.source === 'Shared links') iconClass = 'ti-link';
                else if (s.source === 'Social media') iconClass = 'ti-brand-instagram';
                else if (s.source === 'QR / in person') iconClass = 'ti-qrcode';
                
                return (
                  <div className="src" key={s.source}>
                    <span className="nm"><i style={{ background: c }} className={`ti ${iconClass}`}></i> {s.source || 'Unknown'}</span>
                    <div className="bar"><i style={{ width: `${pc}%`, background: c }}></i></div>
                    <span className="pc">{pc}%</span>
                  </div>
                );
              }) : <p className="muted" style={{ fontSize: 13 }}>No source data yet.</p>}
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="ph">
            <h3>Recent visitors</h3>
            <button className="followup" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600 }}><i className="ti ti-download"></i> Export CSV</button>
          </div>
          <table className="tbl">
            <thead>
              <tr><th style={{ textTransform: 'uppercase' }}>Visitor</th><th style={{ textTransform: 'uppercase' }}>Found via</th><th style={{ textTransform: 'uppercase' }}>Stage</th><th style={{ textTransform: 'uppercase' }}>Last Seen</th><th style={{ textTransform: 'uppercase' }}>Follow-up</th></tr>
            </thead>
            <tbody>
              {visitors.length > 0 ? visitors.map(v => {
                const ss = STAGE_STYLE[v.stage] || ['#f3f4f6', '#6b7280'];
                const av = getAvatarBg(v.name);
                const initials = v.name ? v.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() : '?';
                const stageLabel = STAGES.find(s => s.k === v.stage)?.l || v.stage;
                
                return (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="av" style={{ background: av }}>{v.name && v.name !== 'Anonymous visitor' ? initials : <i className="ti ti-user"></i>}</div>
                        <div>
                          <b style={{ display: 'block', fontSize: '14px' }}>{v.name || 'Anonymous visitor'}</b>
                          {(v.email || v.phone || v.city) && (
                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                              {[v.email, v.phone, v.city].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--cn-gray)' }}>{v.source || 'Unknown'}</td>
                    <td><span className="stage-pill" style={{ background: ss[0], color: ss[1] }}>{stageLabel.toLowerCase()}</span></td>
                    <td style={{ color: 'var(--cn-gray)' }}>{timeAgo(v.last_seen || v.created_at)}</td>
                    <td>{getFollowUp(v.stage)}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--cn-gray)' }}>No visitors recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
