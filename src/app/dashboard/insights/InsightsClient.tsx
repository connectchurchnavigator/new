'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import logoImg from '@/Assets/logo (1).png';

interface ChurchOption {
  id: string;
  name: string;
  slug: string;
}

interface InsightsClientProps {
  churchName: string;
  churchId: string;
  availableChurches?: ChurchOption[];
  stats: { total: number; new_this_month: number; returning_rate: number; at_risk: number } | null;
  funnel: { stage: string; count: number }[];
  sources: { source: string; count: number }[];
  visitors: any[];
  embedded?: boolean;
  onSelectChurch?: (churchId: string) => void;
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

export default function InsightsClient({
  churchName: initialChurchName,
  churchId: initialChurchId,
  availableChurches = [],
  stats: initialStats,
  funnel: initialFunnel,
  sources: initialSources,
  visitors: initialVisitors,
  embedded = false,
  onSelectChurch,
}: InsightsClientProps) {
  const router = useRouter();
  const [currentChurchId, setCurrentChurchId] = useState(initialChurchId);
  const [range, setRange] = useState('30d');

  // Live state when switching churches
  const [stats, setStats] = useState(initialStats);
  const [funnel, setFunnel] = useState(initialFunnel);
  const [sources, setSources] = useState(initialSources);
  const [visitors, setVisitors] = useState(initialVisitors);
  const [isLoadingChurch, setIsLoadingChurch] = useState(false);

  // Sync if initial props change
  React.useEffect(() => {
    setCurrentChurchId(initialChurchId);
    setStats(initialStats);
    setFunnel(initialFunnel);
    setSources(initialSources);
    setVisitors(initialVisitors);
  }, [initialChurchId, initialStats, initialFunnel, initialSources, initialVisitors]);

  const activeChurchName = availableChurches.find(c => c.id === currentChurchId)?.name || initialChurchName;

  const handleChurchChange = async (newChurchId: string) => {
    setCurrentChurchId(newChurchId);
    if (onSelectChurch) {
      onSelectChurch(newChurchId);
    }

    if (!embedded) {
      router.push(`/dashboard/insights?church_id=${newChurchId}`);
      return;
    }

    // Client-side fetch for embedded mode without full page reload
    setIsLoadingChurch(true);
    try {
      const { createClient } = await import('@/lib/supabase-browser');
      const { getVisitorStats, getVisitorFunnel, getVisitorSources, getVisitors } = await import('@/lib/api');
      const sb = createClient();
      const [stRes, fnRes, scRes, vtRes] = await Promise.all([
        getVisitorStats(sb, newChurchId).catch(() => null),
        getVisitorFunnel(sb, newChurchId).catch(() => []),
        getVisitorSources(sb, newChurchId).catch(() => []),
        getVisitors(sb, newChurchId).catch(() => []),
      ]);
      setStats(stRes);
      setFunnel(fnRes || []);
      setSources(scRes || []);
      setVisitors(vtRes || []);
    } catch (e) {
      console.error('Error fetching church insights:', e);
    } finally {
      setIsLoadingChurch(false);
    }
  };

  const total = stats?.total || visitors.length;
  const newThisMonth = stats?.new_this_month || visitors.filter(v => v.stage === 'first').length;

  // Process Funnel
  const maxFunnel = funnel.length > 0 ? Math.max(...funnel.map(f => f.count)) : 0;
  const funnelData = STAGES.map(s => {
    const found = funnel.find(f => f.stage === s.k);
    return { ...s, count: found ? found.count : 0 };
  });

  // Process Sources
  const totalSources = sources.reduce((sum, s) => sum + s.count, 0);

  const exportToCSV = () => {
    if (!visitors || visitors.length === 0) return;
    
    const headers = ['Name', 'Email', 'Phone', 'City', 'Source', 'Stage', 'Last Seen', 'Date Registered'];
    
    const rows = visitors.map(v => {
      const stageLabel = STAGES.find(s => s.k === v.stage)?.l || v.stage || '';
      return [
        v.name || 'Anonymous visitor',
        v.email || '',
        v.phone || '',
        v.city || '',
        v.source || 'Unknown',
        stageLabel,
        v.last_seen || '',
        v.created_at || ''
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeChurchName ? activeChurchName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'church'}_visitors.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {!embedded && (
        <div className="top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/dashboard" className="brand" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Image src={logoImg} alt="Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            </Link>
            
            {availableChurches.length > 1 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <select
                  value={currentChurchId}
                  onChange={(e) => handleChurchChange(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {availableChurches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="crumb">&middot; Dashboard</span>
              </div>
            ) : (
              <span className="crumb">{activeChurchName} &middot; Dashboard</span>
            )}
          </div>

          <div className="seg">
            <button className={range === '7d' ? 'on' : ''} onClick={() => setRange('7d')}>7 days</button>
            <button className={range === '30d' ? 'on' : ''} onClick={() => setRange('30d')}>30 days</button>
            <button className={range === '90d' ? 'on' : ''} onClick={() => setRange('90d')}>90 days</button>
          </div>
        </div>
      )}

      <div className="content" style={embedded ? { padding: '0 0 40px 0', maxWidth: '100%', margin: 0 } : undefined}>
        {embedded && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#64748b' }}>Select Church:</span>
              {availableChurches.length > 0 ? (
                <select
                  value={currentChurchId}
                  onChange={(e) => handleChurchChange(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: '220px',
                  }}
                >
                  {availableChurches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span style={{ color: '#7c3aed', fontWeight: 800, fontSize: '14px' }}>{activeChurchName}</span>
              )}
              {isLoadingChurch && (
                <span style={{ fontSize: '12px', color: '#9333ea', fontWeight: 600 }}>Loading insights...</span>
              )}
            </div>
            <div className="seg" style={{ marginLeft: 0 }}>
              <button className={range === '7d' ? 'on' : ''} onClick={() => setRange('7d')}>7 days</button>
              <button className={range === '30d' ? 'on' : ''} onClick={() => setRange('30d')}>30 days</button>
              <button className={range === '90d' ? 'on' : ''} onClick={() => setRange('90d')}>90 days</button>
            </div>
          </div>
        )}
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
            <button onClick={exportToCSV} className="followup" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600 }}><i className="ti ti-download"></i> Export CSV</button>
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
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--cn-gray)', padding: '24px 16px' }}>No visitors recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
