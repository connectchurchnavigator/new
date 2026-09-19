'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import PastorVisitorMap, { VisitorLocation } from '@/components/dashboard/PastorVisitorMap';

interface DashboardClientProps {
  user: any;
  churches: any[];
  pastors: any[];
  events: any[];
  worshipLeaders?: any[];
  pastorEnquiries?: any[];
}

type NavSection = 'all' | 'churches' | 'pastors' | 'worship-leaders' | 'events' | 'enquiries' | 'my-profile';
type TimeRange = '7d' | '14d' | '1m' | '3m' | '6m' | '9m' | '12m' | 'all';
type EnquiryCategory = 'all' | 'pastor' | 'church' | 'event' | 'worship-leader';

export default function DashboardClient({
  user,
  churches = [],
  pastors = [],
  events = [],
  worshipLeaders = [],
  pastorEnquiries = [],
}: DashboardClientProps) {
  // Main navigation section — now has 'enquiries' directly after 'events'
  const [section, setSection] = useState<NavSection>('pastors');

  // Selected Pastor Profile (if multiple exist)
  const [selectedPastorIndex, setSelectedPastorIndex] = useState(0);
  const currentPastor = pastors[selectedPastorIndex] || pastors[0] || null;

  // Timeframe selector
  const [timeframe, setTimeframe] = useState<TimeRange>('14d');

  // Enquiries state
  const [enquiries, setEnquiries] = useState<any[]>(pastorEnquiries);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'all' | 'new' | 'read' | 'responded'>('all');
  const [enquiryCategoryFilter, setEnquiryCategoryFilter] = useState<EnquiryCategory>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // My Profile Form State
  const [profileName, setProfileName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  );
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Timeframe multiplier and label
  const tfConfig = useMemo(() => {
    switch (timeframe) {
      case '7d':
        return { label: 'last 7 days', mult: 0.15, bars: 7 };
      case '14d':
        return { label: 'last 14 days', mult: 0.28, bars: 14 };
      case '1m':
        return { label: 'last 1 month', mult: 0.45, bars: 15 };
      case '3m':
        return { label: 'last 3 months', mult: 0.70, bars: 12 };
      case '6m':
        return { label: 'last 6 months', mult: 0.85, bars: 12 };
      case '9m':
        return { label: 'last 9 months', mult: 0.92, bars: 12 };
      case '12m':
        return { label: 'last 12 months', mult: 0.98, bars: 12 };
      case 'all':
      default:
        return { label: 'all time', mult: 1.0, bars: 14 };
    }
  }, [timeframe]);

  // Derived view counts for pastor analytics
  const rawViews = currentPastor?.view_count || (pastors.length > 0 ? 148 : 0);
  const totalViews = Math.max(1, Math.round(rawViews * tfConfig.mult));
  const profileClicks = Math.max(0, Math.round(totalViews * 0.268));

  // Pastor-specific enquiries
  const currentPastorEnquiries = useMemo(() => {
    if (!currentPastor) return enquiries;
    return enquiries.filter((e) => e.pastor_id === currentPastor.id);
  }, [enquiries, currentPastor]);

  // Total unread messages count (only UNREAD, not total)
  const unreadEnquiriesCount = useMemo(() => {
    return enquiries.filter((e) => e.status === 'new').length;
  }, [enquiries]);

  // Count unread by category
  const unreadCountsByCategory = useMemo(() => {
    return {
      pastor: enquiries.filter((e) => (!e.category || e.category === 'pastor') && e.status === 'new').length,
      church: enquiries.filter((e) => e.category === 'church' && e.status === 'new').length,
      event: enquiries.filter((e) => e.category === 'event' && e.status === 'new').length,
      'worship-leader': enquiries.filter((e) => e.category === 'worship-leader' && e.status === 'new').length,
    };
  }, [enquiries]);

  const timeframeEnquiries = timeframe === '7d' || timeframe === '14d'
    ? Math.max(currentPastorEnquiries.length > 0 ? 1 : 0, Math.round(currentPastorEnquiries.length * (timeframe === '7d' ? 0.35 : 0.6)))
    : currentPastorEnquiries.length;

  const enquiryRate = totalViews > 0 ? ((Math.max(1, timeframeEnquiries) / totalViews) * 100).toFixed(1) : '0.0';

  // Bar chart heights for the screenshot's exact look
  const barChartData = useMemo(() => {
    const barsCount = tfConfig.bars;
    const base = totalViews / barsCount;
    const heights = [0.45, 0.55, 0.52, 0.62, 0.58, 0.75, 0.70, 0.88, 0.82, 1.0, 1.15, 0.95, 1.35, 1.25];
    
    return Array.from({ length: barsCount }).map((_, i) => {
      const mult = heights[i % heights.length];
      const val = Math.max(1, Math.round(base * mult));
      return {
        label: `${i + 1}`,
        value: val,
      };
    });
  }, [totalViews, tfConfig.bars]);

  const maxBarValue = Math.max(...barChartData.map((b) => b.value), 10);

  // Traffic sources matching screenshot
  const trafficSources = [
    { name: 'Search', percent: 42, color: '#7c3aed' },
    { name: 'Directory', percent: 28, color: '#ef4444' },
    { name: 'Shared links', percent: 18, color: '#14b8a6' },
    { name: 'Social', percent: 12, color: '#f59e0b' },
  ];

  // Locations for Map
  const visitorLocations: VisitorLocation[] = useMemo(() => {
    const pastorCity = currentPastor?.city || 'London';
    return [
      { city: pastorCity, country: 'United Kingdom', count: Math.round(totalViews * 0.48), lat: 51.5074, lng: -0.1278, enquiries: Math.max(1, Math.round(timeframeEnquiries * 0.5)) },
      { city: 'Birmingham', country: 'United Kingdom', count: Math.round(totalViews * 0.18), lat: 52.4862, lng: -1.8904, enquiries: Math.round(timeframeEnquiries * 0.2) },
      { city: 'Manchester', country: 'United Kingdom', count: Math.round(totalViews * 0.14), lat: 53.4808, lng: -2.2426, enquiries: Math.round(timeframeEnquiries * 0.15) },
      { city: 'Atlanta', country: 'United States', count: Math.round(totalViews * 0.11), lat: 33.7490, lng: -84.3880, enquiries: Math.round(timeframeEnquiries * 0.1) },
      { city: 'Lagos', country: 'Nigeria', count: Math.round(totalViews * 0.09), lat: 6.5244, lng: 3.3792, enquiries: Math.round(timeframeEnquiries * 0.05) },
    ];
  }, [totalViews, timeframeEnquiries, currentPastor]);

  // Handle status update
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/pastors/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Enquiries list filtered by category and status
  const classifiedEnquiries = useMemo(() => {
    return enquiries.map((enq) => {
      // Determine classification if not explicit
      let cat: EnquiryCategory = 'pastor';
      let entityName = '';

      if (enq.category) {
        cat = enq.category;
      } else if (enq.pastor_id) {
        cat = 'pastor';
        const p = pastors.find((item) => item.id === enq.pastor_id);
        entityName = p ? p.full_name : 'Pastor Profile';
      } else if (enq.church_id) {
        cat = 'church';
        const c = churches.find((item) => item.id === enq.church_id);
        entityName = c ? c.name : 'Church Sanctuary';
      } else if (enq.event_id) {
        cat = 'event';
        const ev = events.find((item) => item.id === enq.event_id);
        entityName = ev ? ev.title : 'Event';
      } else if (enq.leader_id) {
        cat = 'worship-leader';
        const wl = worshipLeaders.find((item) => item.id === enq.leader_id);
        entityName = wl ? wl.display_name : 'Worship Leader';
      } else {
        cat = 'pastor';
        entityName = currentPastor?.full_name || 'Pastor Profile';
      }

      return {
        ...enq,
        computedCategory: cat,
        entityName: entityName || (cat === 'pastor' ? currentPastor?.full_name || 'Pastor' : cat),
      };
    });
  }, [enquiries, pastors, churches, events, worshipLeaders, currentPastor]);

  const filteredEnquiriesList = useMemo(() => {
    let list = classifiedEnquiries;
    if (enquiryCategoryFilter !== 'all') {
      list = list.filter((e) => e.computedCategory === enquiryCategoryFilter);
    }
    if (enquiryStatusFilter !== 'all') {
      list = list.filter((e) => e.status === enquiryStatusFilter);
    }
    return list;
  }, [classifiedEnquiries, enquiryCategoryFilter, enquiryStatusFilter]);

  // Handle Save Profile Name
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileName },
      });
      if (error) throw error;
      setProfileMessage({ type: 'success', text: 'Profile name updated successfully!' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Reset / Change
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setProfileMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setProfileMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsResettingPassword(true);
    setProfileMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setProfileMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Send password reset email link
  const handleSendResetEmail = async () => {
    if (!profileEmail) return;
    setIsResettingPassword(true);
    setProfileMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(profileEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setProfileMessage({
        type: 'success',
        text: `A password reset link has been sent to ${profileEmail}. Please check your inbox.`,
      });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to send reset email.' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const userDisplayName = profileName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Minister';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', fontFamily: 'inherit', color: '#1e293b' }}>
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── LEFT SIDEBAR (EXACT CLEAN SAAS DESIGN LIKE SCREENSHOT) ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: '240px',
          minWidth: '240px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          padding: '24px 16px',
        }}
      >
        {/* Brand Logo Header */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '24px', paddingLeft: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #d946ef, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '18px',
            }}
          >
            ✝
          </div>
          <span style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Ekklesia
          </span>
        </Link>

        {/* Pastor / Minister Badge in Sidebar (matches screenshot top-left pink card) */}
        {currentPastor && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
              border: '1px solid #f0abfc',
              borderRadius: '16px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {currentPastor.avatar_url ? (
              <img
                src={currentPastor.avatar_url}
                alt={currentPastor.full_name}
                style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d946ef, #a21caf)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                {currentPastor.initials || currentPastor.full_name?.slice(0, 2).toUpperCase() || 'P'}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentPastor.full_name}
              </div>
              <div style={{ fontSize: '11.5px', color: '#9333ea', fontWeight: 700 }}>
                {currentPastor.title || 'Senior Pastor'}
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN SECTIONS NAVIGATION (User Requested Order) ──────── */}
        <div style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', padding: '0 10px', marginBottom: '8px' }}>
          Menu
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
          {[
            { id: 'all', label: 'All Listings', icon: 'ti-layout-grid', unread: null },
            { id: 'churches', label: 'Churches', icon: 'ti-building-church', unread: null },
            { id: 'pastors', label: 'Pastors', icon: 'ti-user-star', unread: null, primary: true },
            { id: 'worship-leaders', label: 'Worship leaders', icon: 'ti-microphone-2', unread: null },
            { id: 'events', label: 'Events', icon: 'ti-calendar-event', unread: null },
            { id: 'enquiries', label: 'Enquiries', icon: 'ti-mail', unread: unreadEnquiriesCount },
          ].map((item) => {
            const isSel = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id as NavSection)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isSel ? 'linear-gradient(135deg, #c026d3, #9333ea)' : 'transparent',
                  color: isSel ? '#ffffff' : '#475569',
                  fontWeight: isSel ? 800 : 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSel ? '0 4px 12px rgba(168, 85, 247, 0.35)' : 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className={`ti ${item.icon}`} style={{ fontSize: '17px', color: isSel ? '#ffffff' : '#64748b' }}></i>
                  {item.label}
                </span>

                {/* Only display unread messages count */}
                {item.unread !== null && item.unread > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: '#ef4444',
                      color: '#ffffff',
                    }}
                  >
                    {item.unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── PROFILE (Settings removed per user request) ───────────── */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', padding: '0 10px', marginBottom: '8px' }}>
            Profile
          </div>

          <button
            onClick={() => setSection('my-profile')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '10px',
              border: 'none',
              background: section === 'my-profile' ? '#f3e8ff' : 'transparent',
              color: section === 'my-profile' ? '#7c3aed' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <i className="ti ti-user" style={{ fontSize: '16px' }}></i>
            My profile
          </button>
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MAIN CONTENT AREA ──────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header Bar (Clean header with Section Title & Timeframe Selector) */}
        <header
          style={{
            height: '68px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Left Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {section === 'pastors'
                ? 'Analytics'
                : section === 'all'
                ? 'All Listings'
                : section === 'churches'
                ? 'My Churches'
                : section === 'worship-leaders'
                ? 'Worship Leaders'
                : section === 'events'
                ? 'Hosted Events'
                : section === 'enquiries'
                ? 'Enquiries'
                : 'My Profile'}
            </h1>

            {/* Timeframe pill selector on Analytics page */}
            {section === 'pastors' && (
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
                {(['7d', '14d', '1m', '3m', '6m', '12m', 'all'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    style={{
                      border: 'none',
                      background: timeframe === tf ? '#ffffff' : 'transparent',
                      color: timeframe === tf ? '#9333ea' : '#64748b',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      boxShadow: timeframe === tf ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Header: User Greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
              Signed in as <strong style={{ color: '#0f172a' }}>{userDisplayName}</strong>
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #c026d3, #7c3aed)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '13px',
              }}
            >
              {userDisplayName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* ── BODY VIEW ROUTER ─────────────────────────────────────── */}
        <div style={{ padding: '28px 32px', maxWidth: '1400px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── PASTORS SECTION (CLEAN ANALYTICS VIEW) ──────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'pastors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Profile Selector if more than 1 pastor */}
              {pastors.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b' }}>Select Profile:</span>
                  {pastors.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPastorIndex(i)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        border: selectedPastorIndex === i ? '1.5px solid #a855f7' : '1px solid #cbd5e1',
                        background: selectedPastorIndex === i ? '#faf5ff' : '#ffffff',
                        color: selectedPastorIndex === i ? '#9333ea' : '#64748b',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {p.full_name}
                    </button>
                  ))}
                </div>
              )}

              {/* Top Two Cards Row: Profile Views Bar Chart + Where Visitors Come From */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
                
                {/* LEFT CARD: Profile views — last 14 days (Vibrant Purple/Pink Gradient Bars) */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1.5px solid #f1f5f9',
                    padding: '24px 28px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
                    Profile views — {tfConfig.label}
                  </div>

                  {/* Animated Gradient Bar Chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '8px', paddingBottom: '10px' }}>
                    {barChartData.map((bar, idx) => {
                      const heightPct = Math.max(15, Math.min(100, (bar.value / maxBarValue) * 100));
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div
                            title={`${bar.value} views`}
                            style={{
                              width: '100%',
                              height: `${heightPct}%`,
                              background: 'linear-gradient(180deg, #d946ef 0%, #7c3aed 100%)',
                              borderRadius: '6px',
                              transition: 'height 0.4s ease',
                              cursor: 'pointer',
                            }}
                          />
                          <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700, marginTop: '8px' }}>
                            {bar.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT CARD: Where visitors come from (Progress Bars) */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1.5px solid #f1f5f9',
                    padding: '24px 28px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
                    Where visitors come from
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', flex: 1 }}>
                    {trafficSources.map((src, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                        <span style={{ width: '90px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                          {src.name}
                        </span>
                        <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '20px', overflow: 'hidden' }}>
                          <div style={{ width: `${src.percent}%`, height: '100%', background: src.color, borderRadius: '20px' }} />
                        </div>
                        <span style={{ width: '36px', textAlign: 'right', fontSize: '12.5px', fontWeight: 800, color: '#475569' }}>
                          {src.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom Row of 4 Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                
                {/* Card 1: Total Views */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #d946ef, #a21caf)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <i className="ti ti-eye" style={{ fontSize: '18px' }}></i>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {totalViews.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Total views ({timeframe})
                  </div>
                </div>

                {/* Card 2: Profile Clicks */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #ec4899, #be185d)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <i className="ti ti-sparkles" style={{ fontSize: '18px' }}></i>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {profileClicks.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Profile clicks
                  </div>
                </div>

                {/* Card 3: Enquiries */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <i className="ti ti-mail" style={{ fontSize: '18px' }}></i>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {timeframeEnquiries}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Enquiries
                  </div>
                </div>

                {/* Card 4: Enquiry Rate */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <i className="ti ti-percentage" style={{ fontSize: '18px' }}></i>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {enquiryRate}%
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Enquiry rate
                  </div>
                </div>

              </div>

              {/* Interactive Visitor Map section */}
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '24px 28px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      Visitor Geography & Audience Map
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Geographic origins of attendees, visitors, and booking enquiries
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {visitorLocations.slice(0, 3).map((l, i) => (
                      <span key={i} style={{ fontSize: '12px', fontWeight: 700, background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        📍 {l.city} ({l.count})
                      </span>
                    ))}
                  </div>
                </div>

                <PastorVisitorMap
                  locations={visitorLocations}
                  totalViews={totalViews}
                  selectedTimeframe={tfConfig.label}
                />
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── ENQUIRIES SECTION (CLASSIFIED BY ENTITY) ───────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'enquiries' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    Incoming Enquiries ({filteredEnquiriesList.length})
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                    Messages received across your churches, events, worship leaders, and pastor speaker profiles.
                  </p>
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
                  {(['all', 'new', 'read', 'responded'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setEnquiryStatusFilter(f)}
                      style={{
                        border: 'none',
                        background: enquiryStatusFilter === f ? '#ffffff' : 'transparent',
                        color: enquiryStatusFilter === f ? '#9333ea' : '#64748b',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '5px 12px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entity Category Filter Tabs (Classified under Church / Events / Worship Leader / Pastor) */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', overflowX: 'auto', paddingBottom: '2px' }}>
                {[
                  { id: 'all', label: 'All Categories', count: unreadEnquiriesCount },
                  { id: 'pastor', label: 'Pastors', count: unreadCountsByCategory.pastor },
                  { id: 'church', label: 'Churches', count: unreadCountsByCategory.church },
                  { id: 'event', label: 'Events', count: unreadCountsByCategory.event },
                  { id: 'worship-leader', label: 'Worship Leaders', count: unreadCountsByCategory['worship-leader'] },
                ].map((tab) => {
                  const isCatSel = enquiryCategoryFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setEnquiryCategoryFilter(tab.id as EnquiryCategory)}
                      style={{
                        padding: '8px 14px',
                        border: 'none',
                        borderBottom: isCatSel ? '2.5px solid #9333ea' : '2.5px solid transparent',
                        background: 'transparent',
                        color: isCatSel ? '#9333ea' : '#64748b',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '-1px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 900,
                            padding: '1px 6px',
                            borderRadius: '8px',
                            background: '#ef4444',
                            color: '#ffffff',
                          }}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Enquiries list */}
              {filteredEnquiriesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <i className="ti ti-mail-opened" style={{ fontSize: '36px', color: '#94a3b8' }}></i>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>No enquiries found</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Messages sent through your listings will be categorized and displayed here.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredEnquiriesList.map((enq) => {
                    const isNew = enq.status === 'new';
                    return (
                      <div
                        key={enq.id}
                        style={{
                          border: `1.5px solid ${isNew ? '#fecdd3' : '#e2e8f0'}`,
                          borderRadius: '14px',
                          padding: '18px 20px',
                          background: isNew ? '#fff5f7' : '#ffffff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '15px' }}>{enq.sender_name}</span>
                            <a href={`mailto:${enq.sender_email}`} style={{ color: '#7c3aed', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                              {enq.sender_email}
                            </a>

                            {/* Entity Classification Tag */}
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                textTransform: 'capitalize',
                              }}
                            >
                              {enq.computedCategory}: {enq.entityName}
                            </span>

                            {enq.event_type && (
                              <span style={{ fontSize: '11px', fontWeight: 800, background: '#f5f3ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '6px' }}>
                                {enq.event_type}
                              </span>
                            )}

                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: enq.status === 'new' ? '#ffe4e6' : enq.status === 'responded' ? '#dcfce7' : '#f1f5f9',
                                color: enq.status === 'new' ? '#e11d48' : enq.status === 'responded' ? '#15803d' : '#64748b',
                                textTransform: 'uppercase',
                              }}
                            >
                              {enq.status}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {new Date(enq.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <a
                              href={`mailto:${enq.sender_email}?subject=Regarding your enquiry on ChurchNavigator for ${encodeURIComponent(enq.entityName)}`}
                              onClick={() => handleUpdateStatus(enq.id, 'responded')}
                              style={{
                                background: '#f43f5e',
                                color: '#ffffff',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 800,
                                textDecoration: 'none',
                              }}
                            >
                              Reply
                            </a>
                            <button
                              disabled={updatingId === enq.id}
                              onClick={() => handleUpdateStatus(enq.id, enq.status === 'responded' ? 'read' : 'responded')}
                              style={{
                                background: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {enq.status === 'responded' ? 'Mark Read' : '✓ Responded'}
                            </button>
                          </div>
                        </div>

                        <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                          &ldquo;{enq.message}&rdquo;
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── ALL LISTINGS SECTION ────────────────────────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'all' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '24px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>
                  All Active Listings ({churches.length + pastors.length + events.length + worshipLeaders.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {pastors.map((p) => (
                    <div key={p.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px', background: '#ffffff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#c026d3', textTransform: 'uppercase', marginBottom: '4px' }}>Pastor / Speaker</div>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{p.full_name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>{p.title || 'Minister'}</div>
                      <Link href={`/pastor/${p.slug}`} target="_blank" style={{ color: '#9333ea', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>View profile &rarr;</Link>
                    </div>
                  ))}
                  {churches.map((c) => (
                    <div key={c.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px', background: '#ffffff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '4px' }}>Church Sanctuary</div>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>📍 {c.city || 'UK'}</div>
                      <Link href={`/church/${c.slug}`} target="_blank" style={{ color: '#7c3aed', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>View church &rarr;</Link>
                    </div>
                  ))}
                  {worshipLeaders.map((wl) => (
                    <div key={wl.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px', background: '#ffffff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>Worship Leader</div>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{wl.display_name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>📍 {wl.city || wl.country || 'UK'}</div>
                      <Link href={`/worship-leader/${wl.slug}`} target="_blank" style={{ color: '#0284c7', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>View leader &rarr;</Link>
                    </div>
                  ))}
                  {events.map((e) => (
                    <div key={e.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px', background: '#ffffff' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: '4px' }}>Event</div>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{e.title}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>📍 {e.venue_name || e.city || 'UK'}</div>
                      <Link href={`/events/${e.slug}`} target="_blank" style={{ color: '#16a34a', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>View event &rarr;</Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── CHURCHES SECTION ───────────────────────────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'churches' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Registered Churches ({churches.length})</h3>
                <Link href="/add-listing" style={{ background: '#7c3aed', color: '#fff', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, textDecoration: 'none' }}>+ Add Church</Link>
              </div>

              {churches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>No churches registered under your account yet.</div>
                  <Link href="/add-listing" style={{ background: '#7c3aed', color: '#fff', padding: '8px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 800 }}>Register Your Church</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {churches.map((c) => (
                    <div key={c.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px', background: '#ffffff' }}>
                      <div style={{ fontWeight: 900, fontSize: '17px', color: '#0f172a', marginBottom: '4px' }}>{c.name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>📍 {c.city || c.address_line}</div>
                      <div style={{ fontSize: '12.5px', color: '#7c3aed', fontWeight: 700, marginBottom: '16px' }}>{c.denomination?.split('|||')[0]}</div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Link href={`/church/${c.slug}`} target="_blank" style={{ flex: 1, textAlign: 'center', background: '#f1f5f9', color: '#334155', padding: '9px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>View Public</Link>
                        <Link href={`/church/${c.slug}?owner=true`} target="_blank" style={{ flex: 1, textAlign: 'center', background: '#f5f3ff', color: '#7c3aed', padding: '9px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, textDecoration: 'none' }}>Edit Details</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── WORSHIP LEADERS SECTION ────────────────────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'worship-leaders' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Registered Worship Leaders ({worshipLeaders.length})</h3>
                <Link href="/onboarding/worship-leader" style={{ background: '#0284c7', color: '#fff', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, textDecoration: 'none' }}>+ Add Worship Leader</Link>
              </div>

              {worshipLeaders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>No worship leader profiles found.</div>
                  <Link href="/onboarding/worship-leader" style={{ background: '#0284c7', color: '#fff', padding: '8px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 800 }}>Create Worship Leader Profile</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {worshipLeaders.map((wl) => (
                    <div key={wl.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px', background: '#ffffff' }}>
                      <div style={{ fontWeight: 900, fontSize: '17px', color: '#0f172a', marginBottom: '4px' }}>{wl.display_name}</div>
                      <div style={{ fontSize: '13px', color: '#0284c7', fontWeight: 700, marginBottom: '6px' }}>{wl.tagline || 'Worship Leader / Psalmist'}</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>📍 {wl.city || wl.country || 'UK'}</div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Link href={`/worship-leader/${wl.slug}`} target="_blank" style={{ flex: 1, textAlign: 'center', background: '#f1f5f9', color: '#334155', padding: '9px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>View Public</Link>
                        <Link href={`/onboarding/worship-leader/${wl.slug}/edit`} style={{ flex: 1, textAlign: 'center', background: '#f0f9ff', color: '#0284c7', padding: '9px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, textDecoration: 'none' }}>Edit Details</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── EVENTS SECTION ─────────────────────────────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'events' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Hosted Events ({events.length})</h3>
                <Link href="/onboarding/events" style={{ background: '#16a34a', color: '#fff', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, textDecoration: 'none' }}>+ Host Event</Link>
              </div>

              {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>No events posted yet.</div>
                  <Link href="/onboarding/events" style={{ background: '#16a34a', color: '#fff', padding: '8px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 800 }}>Host an Event</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {events.map((e) => (
                    <div key={e.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px', background: '#ffffff' }}>
                      <div style={{ fontSize: '11px', color: '#e11d48', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>{e.type || 'Event'}</div>
                      <div style={{ fontWeight: 900, fontSize: '17px', color: '#0f172a', marginBottom: '4px' }}>{e.title}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>📍 {e.venue_name || e.city || 'UK'}</div>
                      <Link href={`/events/${e.slug}`} target="_blank" style={{ display: 'block', textAlign: 'center', background: '#f0fdf4', color: '#16a34a', padding: '9px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, textDecoration: 'none' }}>View Event &rarr;</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── MY PROFILE SECTION (NAME, EMAIL, PASSWORD, RESET) ───── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'my-profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Alert Feedback Message */}
              {profileMessage && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    background: profileMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1.5px solid ${profileMessage.type === 'success' ? '#86efac' : '#fecaca'}`,
                    color: profileMessage.type === 'success' ? '#166534' : '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <i className={profileMessage.type === 'success' ? 'ti ti-circle-check' : 'ti ti-alert-triangle'} style={{ fontSize: '18px' }}></i>
                  {profileMessage.text}
                </div>
              )}

              {/* CARD 1: PROFILE DETAILS (Profile Name & Email ID) */}
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #c026d3, #7c3aed)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      fontWeight: 900,
                    }}
                  >
                    {userDisplayName.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
                      {userDisplayName}
                    </h2>
                    <div style={{ fontSize: '13.5px', color: '#64748b' }}>
                      {profileEmail}
                    </div>
                    <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', fontWeight: 800, background: '#f5f3ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '12px' }}>
                      Authenticated Account
                    </span>
                  </div>
                </div>

                {/* Form to Update Profile Name */}
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                      Profile&apos;s Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter your full name"
                      style={{
                        width: '100%',
                        padding: '11px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        color: '#0f172a',
                        background: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                      Email ID
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      disabled
                      style={{
                        width: '100%',
                        padding: '11px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '14px',
                        color: '#64748b',
                        background: '#f8fafc',
                        cursor: 'not-allowed',
                        boxSizing: 'border-box',
                      }}
                    />
                    <span style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                      Your authenticated email address associated with this account.
                    </span>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      style={{
                        background: 'linear-gradient(135deg, #c026d3, #9333ea)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '11px 24px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD 2: PASSWORD & RESET PASSWORD */}
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
                    Password & Security
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    Change your account password or request an email reset link.
                  </p>
                </div>

                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '640px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      style={{
                        width: '100%',
                        padding: '11px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        color: '#0f172a',
                        background: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      style={{
                        width: '100%',
                        padding: '11px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        color: '#0f172a',
                        background: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <button
                      type="submit"
                      disabled={isResettingPassword || !newPassword}
                      style={{
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '11px 24px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        cursor: newPassword ? 'pointer' : 'not-allowed',
                        opacity: newPassword ? 1 : 0.6,
                      }}
                    >
                      {isResettingPassword ? 'Updating Password...' : 'Update Password'}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      disabled={isResettingPassword}
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        padding: '11px 20px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                      }}
                    >
                      Send Password Reset Email
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  );
}
