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
  city?: string | null;
  postcode?: string | null;
  denomination?: string | null;
}

interface SourceItem {
  source: string;
  count: number;
}

interface InsightsClientProps {
  churchName: string;
  churchId: string;
  availableChurches?: ChurchOption[];
  stats: { total: number; new_this_month: number; returning_rate: number; at_risk: number } | null;
  funnel: { stage: string; count: number }[];
  sources: { visitorSources?: SourceItem[]; trafficChannels?: SourceItem[] } | SourceItem[];
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
  'ChurchNavigator directory': '#f43f5e',
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

  // Church search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredChurches = availableChurches.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const qClean = q.replace(/\s+/g, '');
    const nameMatch = c.name?.toLowerCase().includes(q);
    const cityMatch = c.city?.toLowerCase().includes(q);
    const denomMatch = c.denomination?.toLowerCase().includes(q);
    const postcodeMatch = c.postcode
      ? c.postcode.toLowerCase().includes(q) || c.postcode.toLowerCase().replace(/\s+/g, '').includes(qClean)
      : false;
    return nameMatch || cityMatch || denomMatch || postcodeMatch;
  });

  const activeChurchName = availableChurches.find(c => c.id === currentChurchId)?.name || initialChurchName;

  const handleChurchChange = async (newChurchId: string) => {
    setCurrentChurchId(newChurchId);
    setSearchQuery('');
    setIsDropdownOpen(false);
    if (onSelectChurch) {
      onSelectChurch(newChurchId);
    }

    if (!embedded) {
      router.push(`/dashboard?section=visitor-insights&church_id=${newChurchId}`);
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

  // Process Sources (Strictly based on registered visitors)
  const visitorSourcesList = Array.isArray(sources)
    ? sources.filter(s => ['Friend', 'Social Media', 'Walk-in', 'Event', 'Online Search', 'Invited by member', 'Word of mouth'].some(k => s.source?.toLowerCase().includes(k.toLowerCase())))
    : (sources?.visitorSources || []);

  // Fallback: If no visitor sources in array, use visitor records directly
  const computedVisitorSources = visitorSourcesList.length > 0
    ? visitorSourcesList
    : (() => {
        const counts: Record<string, number> = {};
        visitors.forEach((v) => {
          const s = v.source || 'Direct / Unknown';
          counts[s] = (counts[s] || 0) + 1;
        });
        return Object.entries(counts).map(([source, count]) => ({ source, count }));
      })();

  const totalVisitorSources = computedVisitorSources.reduce((sum, s) => sum + s.count, 0);

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
                <div ref={dropdownRef} style={{ position: 'relative', minWidth: '260px' }}>
                  <div
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: isDropdownOpen ? '1.5px solid #7c3aed' : '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      cursor: 'pointer',
                      boxShadow: isDropdownOpen ? '0 0 0 3px rgba(124, 58, 237, 0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activeChurchName}
                      </span>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                        marginLeft: '8px',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {isDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                        zIndex: 100,
                        overflow: 'hidden',
                        minWidth: '280px',
                      }}
                    >
                      {/* Search box input inside dropdown */}
                      <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '6px 10px',
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                          <input
                            type="text"
                            placeholder="Search by church, zip code, denomination..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              border: 'none',
                              outline: 'none',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              color: '#0f172a',
                              width: '100%',
                              background: 'transparent',
                            }}
                          />
                          {searchQuery && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery('');
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Options List */}
                      <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '4px 0' }}>
                        {filteredChurches.length > 0 ? (
                          filteredChurches.map((c) => {
                            const isSelected = c.id === currentChurchId;
                            const details = [c.city, c.postcode, c.denomination?.split('|||')[0]].filter(Boolean).join(' • ');
                            return (
                              <div
                                key={c.id}
                                onClick={() => handleChurchChange(c.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '9px 14px',
                                  cursor: 'pointer',
                                  background: isSelected ? '#f5f3ff' : 'transparent',
                                  transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                  <span
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: isSelected ? 800 : 600,
                                      color: isSelected ? '#7c3aed' : '#1e293b',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {c.name}
                                  </span>
                                  {details && (
                                    <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {details}
                                    </span>
                                  )}
                                </div>
                                {isSelected && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: 8 }}>
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ padding: '14px', textAlign: 'center', fontSize: '12.5px', color: '#94a3b8', fontWeight: 600 }}>
                            No churches match "{searchQuery}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
            <div className="ph">
              <h3>How they found you</h3>
              <span className="hint">based on registered visitors ({totalVisitorSources} total)</span>
            </div>
            <div>
              {computedVisitorSources.length > 0 ? computedVisitorSources.map(s => {
                const c = SOURCE_COLORS[s.source] || '#8b5cf6';
                const pc = totalVisitorSources > 0 ? Math.round((s.count / totalVisitorSources) * 100) : 0;
                
                return (
                  <div className="src" key={s.source}>
                    <span className="nm"><i style={{ background: c }} className="ti ti-user-check"></i> {s.source || 'Unknown'}</span>
                    <div className="bar"><i style={{ width: `${pc}%`, background: c }}></i></div>
                    <span className="pc">{pc}% <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>({s.count})</span></span>
                  </div>
                );
              }) : <p className="muted" style={{ fontSize: 13, margin: 0 }}>No visitor acquisition data yet.</p>}
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
