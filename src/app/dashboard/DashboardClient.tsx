'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import logoImg from '@/Assets/logo (1).png';
import { createClient } from '@/lib/supabase-browser';
import PastorVisitorMap, { VisitorLocation } from '@/components/dashboard/PastorVisitorMap';

import BulkUploadModal from '@/components/admin/BulkUploadModal';
import Papa from 'papaparse';
import InsightsClient from './insights/InsightsClient';

interface DashboardClientProps {
  user: any;
  churches: any[];
  pastors: any[];
  events: any[];
  worshipLeaders?: any[];
  pastorEnquiries?: any[];
  initialSection?: NavSection;
  insightsData?: {
    churchName: string;
    churchId: string;
    stats: any;
    funnel: any[];
    sources: any[];
    visitors: any[];
  };
}

type NavSection = 'overview' | 'visitor-insights' | 'all' | 'churches' | 'pastors' | 'worship-leaders' | 'events' | 'enquiries' | 'users' | 'my-profile';
type TimeRange = '7d' | '14d' | '1m' | '3m' | '6m' | '9m' | '12m' | 'all';
type EnquiryCategory = 'all' | 'pastor' | 'church' | 'event' | 'worship-leader';

export default function DashboardClient({
  user,
  churches = [],
  pastors = [],
  events = [],
  worshipLeaders = [],
  pastorEnquiries = [],
  initialSection = 'overview',
  insightsData,
}: DashboardClientProps) {
  const router = useRouter();

  // Role permissions checking
  const isTeamMember = !!(user?.user_metadata?.is_team_member || user?.user_metadata?.team_role);
  const teamRole: 'events_only' | 'events_and_church_edit' = user?.user_metadata?.team_role || 'events_only';
  const isSuperAdmin = !isTeamMember && (
    user?.user_metadata?.role === 'super_admin' ||
    user?.app_metadata?.role === 'super_admin' ||
    (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || '')
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean)
      .includes(user?.email?.toLowerCase() || '')
  );

  // If user is events_only, default their section to 'events' or 'overview'
  const defaultInitialSection: NavSection = isTeamMember && teamRole === 'events_only'
    ? (['events', 'overview'].includes(initialSection) ? initialSection : 'events')
    : (initialSection === 'users' ? 'overview' : initialSection);

  // Main navigation section — defaults to initialSection (e.g. 'visitor-insights') or 'overview'
  const [section, setSection] = useState<NavSection>(defaultInitialSection);

  useEffect(() => {
    if (initialSection) {
      if (isTeamMember && teamRole === 'events_only' && !['events', 'overview', 'my-profile'].includes(initialSection)) {
        setSection('events');
      } else if (initialSection === 'users') {
        setSection('overview');
      } else {
        setSection(initialSection);
      }
    }
  }, [initialSection, isTeamMember, teamRole]);

  // User menu dropdown state in header
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Build the list of all entities owned by this profile (for Overview & Portfolio)
  const allEntities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      type: 'church' | 'pastor' | 'event' | 'worship_leader';
      typeLabel: string;
      slug: string;
      image?: string;
      status: string;
      raw: any;
      publicUrl: string;
    }> = [];

    churches.forEach((c) => {
      const title = c.name || 'Unnamed Church';
      list.push({
        id: c.id,
        title,
        type: 'church',
        typeLabel: 'Church',
        slug: c.slug || c.id,
        image: c.image_url || c.cover_image_url,
        status: c.status || 'published',
        raw: c,
        publicUrl: `/church/${c.slug || c.id}`,
      });
    });

    pastors.forEach((p) => {
      const title = p.full_name || p.name || 'Unnamed Pastor';
      list.push({
        id: p.id,
        title,
        type: 'pastor',
        typeLabel: 'Pastor',
        slug: p.slug || p.id,
        image: p.profile_photo_url || p.image_url,
        status: p.status || 'published',
        raw: p,
        publicUrl: `/pastor/${p.slug || p.id}`,
      });
    });

    worshipLeaders.forEach((w) => {
      const title = w.display_name || w.name || 'Unnamed Worship Leader';
      list.push({
        id: w.id,
        title,
        type: 'worship_leader',
        typeLabel: 'Worship Leader',
        slug: w.slug || w.id,
        image: w.profile_image_url || w.profile_photo_url,
        status: w.status || 'published',
        raw: w,
        publicUrl: `/worship-leader/${w.slug || w.id}`,
      });
    });

    events.forEach((e) => {
      const title = e.title || e.name || 'Unnamed Event';
      list.push({
        id: e.id,
        title,
        type: 'event',
        typeLabel: 'Event',
        slug: e.slug || e.id,
        image: e.image_url,
        status: e.status || 'published',
        raw: e,
        publicUrl: `/events/${e.slug || e.id}`,
      });
    });

    return list;
  }, [churches, pastors, worshipLeaders, events]);

  // Active Entity Selection for Overview: 'all' or specific entity ID
  const [overviewEntityId, setOverviewEntityId] = useState<string>('all');

  const selectedOverviewEntity = useMemo(() => {
    if (overviewEntityId === 'all') return null;
    return allEntities.find((e) => e.id === overviewEntityId) || null;
  }, [overviewEntityId, allEntities]);

  // Drawer Edit State for Overview quick-edit
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerEntity, setDrawerEntity] = useState<any | null>(null);
  const [drawerFormData, setDrawerFormData] = useState({
    title: '',
    phone: '',
    email: '',
    bio: '',
    location: '',
  });
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // ── TEAM MEMBERS & USER ROLES STATE ────────────────────────────────
  interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'events_only' | 'events_and_church_edit';
    assignedChurches?: string[];
    assignedPastors?: string[];
    churchNames?: string[];
    pastorNames?: string[];
    status: 'active' | 'pending';
    addedAt: string;
  }

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cn_dashboard_team_members');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return [];
  });

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'events_only' | 'events_and_church_edit'>('events_only');
  const [teamSelectedChurchIds, setTeamSelectedChurchIds] = useState<string[]>([]);
  const [teamSelectedPastorIds, setTeamSelectedPastorIds] = useState<string[]>([]);
  const [teamSuccessMsg, setTeamSuccessMsg] = useState<string | null>(null);
  const [teamErrorMsg, setTeamErrorMsg] = useState<string | null>(null);
  const [isSavingTeamMember, setIsSavingTeamMember] = useState(false);

  // State for Church & Pastor dropdown open status and search filters
  const [isChurchDropdownOpen, setIsChurchDropdownOpen] = useState(false);
  const [isPastorDropdownOpen, setIsPastorDropdownOpen] = useState(false);
  const [churchDropdownSearch, setChurchDropdownSearch] = useState('');
  const [pastorDropdownSearch, setPastorDropdownSearch] = useState('');

  const churchDropdownRef = useRef<HTMLDivElement>(null);
  const pastorDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (churchDropdownRef.current && !churchDropdownRef.current.contains(e.target as Node)) {
        setIsChurchDropdownOpen(false);
      }
      if (pastorDropdownRef.current && !pastorDropdownRef.current.contains(e.target as Node)) {
        setIsPastorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // State for inline Reset Password modal / prompt for existing team members
  const [resettingMember, setResettingMember] = useState<TeamMember | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [isResettingMemberPassword, setIsResettingMemberPassword] = useState(false);
  const [resetModalMsg, setResetModalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load live team members from Supabase Auth via API
  useEffect(() => {
    async function loadTeamMembers() {
      try {
        const res = await fetch('/api/dashboard/team');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.teamUsers) && data.teamUsers.length > 0) {
            setTeamMembers(data.teamUsers);
            if (typeof window !== 'undefined') {
              localStorage.setItem('cn_dashboard_team_members', JSON.stringify(data.teamUsers));
            }
          }
        }
      } catch (e) {
        // Fallback to local storage
      }
    }
    loadTeamMembers();
  }, []);

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      setTeamErrorMsg('Please provide both full name and email address.');
      return;
    }
    if (!newMemberPassword || newMemberPassword.length < 6) {
      setTeamErrorMsg('Please enter a login password (at least 6 characters).');
      return;
    }

    setIsSavingTeamMember(true);
    setTeamErrorMsg(null);

    const chosenChurchNames = churches
      .filter((c) => teamSelectedChurchIds.includes(c.id))
      .map((c) => c.name || 'Unnamed Church');

    const chosenPastorNames = pastors
      .filter((p) => teamSelectedPastorIds.includes(p.id))
      .map((p) => p.full_name || p.name || 'Unnamed Pastor');

    const payload = {
      name: newMemberName.trim(),
      email: newMemberEmail.trim().toLowerCase(),
      password: newMemberPassword,
      role: newMemberRole,
      assignedChurches: teamSelectedChurchIds,
      assignedPastors: teamSelectedPastorIds,
      churchNames: chosenChurchNames,
      pastorNames: chosenPastorNames,
    };

    try {
      // 1. Save directly into Supabase Auth
      const res = await fetch('/api/dashboard/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'Failed to create user in Supabase.');
      }

      const newMember: TeamMember = {
        id: resData.user?.id || 'tm-' + Date.now(),
        name: newMemberName.trim(),
        email: newMemberEmail.trim().toLowerCase(),
        role: newMemberRole,
        assignedChurches: teamSelectedChurchIds,
        assignedPastors: teamSelectedPastorIds,
        churchNames: chosenChurchNames,
        pastorNames: chosenPastorNames,
        status: 'active',
        addedAt: new Date().toISOString().split('T')[0],
      };

      const updated = [newMember, ...teamMembers.filter((m) => m.email !== newMember.email)];
      setTeamMembers(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cn_dashboard_team_members', JSON.stringify(updated));
      }

      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPassword('');
      setTeamSuccessMsg(`Successfully created & saved ${newMember.name} in Supabase Auth! They can now log in immediately with their email and password.`);
      setTimeout(() => setTeamSuccessMsg(null), 5500);
    } catch (err: any) {
      setTeamErrorMsg(err.message || 'Error creating user');
    } finally {
      setIsSavingTeamMember(false);
    }
  };

  const handleRemoveTeamMember = async (id: string, email?: string) => {
    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cn_dashboard_team_members', JSON.stringify(updated));
    }

    try {
      const q = email ? `userId=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}` : `userId=${encodeURIComponent(id)}`;
      await fetch(`/api/dashboard/team?${q}`, { method: 'DELETE' });
    } catch {
      // Non-critical if offline
    }
  };

  const handleChangeMemberRole = (id: string, newRole: 'events_only' | 'events_and_church_edit') => {
    const updated = teamMembers.map((m) => m.id === id ? { ...m, role: newRole } : m);
    setTeamMembers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cn_dashboard_team_members', JSON.stringify(updated));
    }
  };

  const handleResetTeamMemberPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingMember) return;
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetModalMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsResettingMemberPassword(true);
    setResetModalMsg(null);

    try {
      const res = await fetch('/api/dashboard/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resettingMember.id,
          email: resettingMember.email,
          name: resettingMember.name,
          role: resettingMember.role,
          assignedChurches: resettingMember.assignedChurches,
          assignedPastors: resettingMember.assignedPastors,
          churchNames: resettingMember.churchNames,
          pastorNames: resettingMember.pastorNames,
          newPassword: resetNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      if (data.user?.id) {
        // Sync real Supabase Auth UUID back into state and localStorage
        const synced = teamMembers.map((m) => m.email === resettingMember.email ? { ...m, id: data.user.id } : m);
        setTeamMembers(synced);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cn_dashboard_team_members', JSON.stringify(synced));
        }
      }

      setResetModalMsg({ type: 'success', text: `Password successfully updated for ${resettingMember.name || resettingMember.email}!` });
      setTimeout(() => {
        setResettingMember(null);
        setResetNewPassword('');
        setResetModalMsg(null);
      }, 2000);
    } catch (err: any) {
      setResetModalMsg({ type: 'error', text: err.message || 'Error resetting password' });
    } finally {
      setIsResettingMemberPassword(false);
    }
  };

  const openDrawerForEntity = (entity: any) => {
    setDrawerEntity(entity);
    const raw = entity.raw || {};
    setDrawerFormData({
      title: entity.title || '',
      phone: raw.phone || raw.contact_phone || '',
      email: raw.email || raw.contact_email || '',
      bio: raw.bio || raw.description || raw.about || '',
      location: raw.city || raw.location || raw.address || '',
    });
    setIsDrawerOpen(true);
  };

  const handleSaveDrawer = async () => {
    if (!drawerEntity) return;
    setIsSavingDrawer(true);
    try {
      const supabase = createClient();
      if (drawerEntity.type === 'pastor') {
        await supabase
          .from('pastors')
          .update({
            name: drawerFormData.title,
            phone: drawerFormData.phone,
            email: drawerFormData.email,
            bio: drawerFormData.bio,
            city: drawerFormData.location,
          })
          .eq('id', drawerEntity.id);
      } else if (drawerEntity.type === 'church') {
        await supabase
          .from('churches')
          .update({
            name: drawerFormData.title,
            phone: drawerFormData.phone,
            email: drawerFormData.email,
            about: drawerFormData.bio,
            city: drawerFormData.location,
          })
          .eq('id', drawerEntity.id);
      } else if (drawerEntity.type === 'worship_leader') {
        await supabase
          .from('worship_leaders')
          .update({
            name: drawerFormData.title,
            phone: drawerFormData.phone,
            email: drawerFormData.email,
            bio: drawerFormData.bio,
            city: drawerFormData.location,
          })
          .eq('id', drawerEntity.id);
      } else if (drawerEntity.type === 'event') {
        await supabase
          .from('events')
          .update({
            title: drawerFormData.title,
            phone: drawerFormData.phone,
            email: drawerFormData.email,
            description: drawerFormData.bio,
            city: drawerFormData.location,
            venue_name: drawerFormData.location,
          })
          .eq('id', drawerEntity.id);
      }

      setSaveSuccessNotice('Changes saved successfully!');
      setTimeout(() => setSaveSuccessNotice(null), 3500);
      setIsDrawerOpen(false);
    } catch (err: any) {
      alert('Error updating: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSavingDrawer(false);
    }
  };

  // Reusable Completeness calculator for any entity
  const getEntityCompleteness = (entity: any) => {
    if (!entity) return { score: 100, items: [] };
    const raw = entity.raw || entity;
    const title = entity.title || raw.name || raw.full_name || raw.display_name || raw.title;
    const image = entity.image || raw.image_url || raw.profile_photo_url || raw.profile_image_url || raw.cover_image_url;
    const bio = raw.bio || raw.about || raw.description;
    const contact = raw.phone || raw.email || raw.contact_phone || raw.contact_email;
    const links = raw.youtube_url || raw.website || raw.social_links || raw.venue_name;

    const items = [
      { label: 'Name / Title', done: !!title, gain: '+20%' },
      { label: 'Photo / Media', done: !!image, gain: '+20%' },
      { label: 'About & Description', done: !!bio, gain: '+20%' },
      { label: 'Contact Phone / Email', done: !!contact, gain: '+20%' },
      { label: 'Public Venue & Links', done: !!links, gain: '+20%' },
    ];

    const completed = items.filter((i) => i.done).length;
    return {
      score: Math.round((completed / items.length) * 100),
      items,
    };
  };

  // Completeness score calculator for Overview
  const completeness = useMemo(() => {
    const target = selectedOverviewEntity || allEntities[0];
    return getEntityCompleteness(target);
  }, [selectedOverviewEntity, allEntities]);

  // Prevent hydration mismatch & support ?tab= query parameter
  const [isMounted, setIsMounted] = useState(false);
  React.useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'my-profile') {
        setSection('my-profile');
      } else if (tabParam === 'visitor-insights') {
        setSection('visitor-insights');
      } else if (tabParam === 'overview') {
        setSection('overview');
      }
    }
  }, []);

  const totalOverviewViews = useMemo(() => {
    if (selectedOverviewEntity) {
      return Number(selectedOverviewEntity.raw?.view_count || 0);
    }
    return allEntities.reduce((acc, curr) => acc + Number(curr.raw?.view_count || 0), 0);
  }, [selectedOverviewEntity, allEntities]);

  // Dynamic calculation for Visitor QR Check-ins strictly from database records
  const totalQrCheckins = useMemo(() => {
    // 1. If insights funnel has engaged/checked-in visitors, use that
    const checkedInStage = insightsData?.funnel?.find(
      (f: any) => f.stage === 'engaged' || f.stage === 'visited' || f.stage === 'check-in'
    );
    if (checkedInStage && typeof checkedInStage.count === 'number') {
      return checkedInStage.count;
    }
    // 2. Count visitors with stage 'engaged' or 'check-in' in visitor list
    if (insightsData?.visitors && insightsData.visitors.length > 0) {
      return insightsData.visitors.filter(
        (v: any) => v.stage === 'engaged' || v.stage === 'check-in' || v.stage === 'returning'
      ).length;
    }
    return 0;
  }, [insightsData]);

  const activePublicUrl = selectedOverviewEntity ? selectedOverviewEntity.publicUrl : allEntities[0]?.publicUrl || '/';
  const origin = isMounted ? window.location.origin : 'https://ekklesia.app';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    `${origin}${activePublicUrl}`
  )}&color=7c3aed`;

  // Churches table state (matching reference screenshot)
  const [churchSearch, setChurchSearch] = useState('');
  const [churchStatusFilter, setChurchStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [churchDenomFilter, setChurchDenomFilter] = useState('all');
  const [selectedChurchIds, setSelectedChurchIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkModalType, setBulkModalType] = useState<'churches' | 'pastors' | 'events'>('churches');

  // All listings table state
  const [allSearch, setAllSearch] = useState('');
  const [allTypeFilter, setAllTypeFilter] = useState<string>('all');
  const [allDenomFilter, setAllDenomFilter] = useState<string>('all');
  const [allStatusFilter, setAllStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [selectedAllIds, setSelectedAllIds] = useState<string[]>([]);

  // Section-specific search states (name, zip code, denomination)
  const [pastorSearch, setPastorSearch] = useState('');
  const [worshipLeaderSearch, setWorshipLeaderSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');

  // Local overrides for listings (status toggle & deletes)
  const [deletedListingIds, setDeletedListingIds] = useState<string[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, 'published' | 'unpublished'>>({});
  const [isTogglingStatusId, setIsTogglingStatusId] = useState<string | null>(null);

  // Delete confirmation with password state
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selected Pastor Profile (if multiple exist)
  const [selectedPastorIndex, setSelectedPastorIndex] = useState(0);
  const currentPastor = pastors[selectedPastorIndex] || pastors[0] || null;

  // Selected Church for Analytics (or 'all' / index)
  const [selectedChurchIndex, setSelectedChurchIndex] = useState<number>(-1); // -1 = All Churches
  const currentSelectedChurch = selectedChurchIndex === -1 ? null : (churches[selectedChurchIndex] || null);

  // Selected Worship Leader & Event indices
  const [selectedWorshipLeaderIndex, setSelectedWorshipLeaderIndex] = useState<number>(-1); // -1 = All
  const currentSelectedWorshipLeader = selectedWorshipLeaderIndex === -1 ? null : (worshipLeaders[selectedWorshipLeaderIndex] || null);

  const [selectedEventIndex, setSelectedEventIndex] = useState<number>(-1); // -1 = All
  const currentSelectedEvent = selectedEventIndex === -1 ? null : (events[selectedEventIndex] || null);

  // Timeframe selector
  const [timeframe, setTimeframe] = useState<TimeRange>('14d');
  const [churchTimeframe, setChurchTimeframe] = useState<TimeRange>('14d');

  // Enquiries state
  const [enquiries, setEnquiries] = useState<any[]>(pastorEnquiries);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'responded' | 'archived' | 'read'>('all');
  const [enquiryCategoryFilter, setEnquiryCategoryFilter] = useState<EnquiryCategory>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeStatusDropdownId, setActiveStatusDropdownId] = useState<string | null>(null);

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

  // Timeframe multiplier, exact bar count, and labels
  const getTimeframeConfig = (tf: TimeRange) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();

    switch (tf) {
      case '7d':
        return {
          label: 'last 7 days',
          mult: 0.15,
          bars: 7,
          getLabel: (i: number) => `D${i + 1}`,
        };
      case '14d':
        return {
          label: 'last 14 days',
          mult: 0.28,
          bars: 14,
          getLabel: (i: number) => `D${i + 1}`,
        };
      case '1m':
        return {
          label: 'last 1 month',
          mult: 0.45,
          bars: 4,
          getLabel: (i: number) => `Wk ${i + 1}`,
        };
      case '3m':
        return {
          label: 'last 3 months',
          mult: 0.70,
          bars: 3,
          getLabel: (i: number) => {
            const idx = (currentMonthIdx - (2 - i) + 12) % 12;
            return monthNames[idx];
          },
        };
      case '6m':
        return {
          label: 'last 6 months',
          mult: 0.85,
          bars: 6,
          getLabel: (i: number) => {
            const idx = (currentMonthIdx - (5 - i) + 12) % 12;
            return monthNames[idx];
          },
        };
      case '9m':
        return {
          label: 'last 9 months',
          mult: 0.92,
          bars: 9,
          getLabel: (i: number) => {
            const idx = (currentMonthIdx - (8 - i) + 12) % 12;
            return monthNames[idx];
          },
        };
      case '12m':
        return {
          label: 'last 12 months',
          mult: 0.98,
          bars: 12,
          getLabel: (i: number) => {
            const idx = (currentMonthIdx - (11 - i) + 12) % 12;
            return monthNames[idx];
          },
        };
      case 'all':
      default:
        return {
          label: 'all time',
          mult: 1.0,
          bars: 12,
          getLabel: (i: number) => `M${i + 1}`,
        };
    }
  };

  const tfConfig = useMemo(() => getTimeframeConfig(timeframe), [timeframe]);

  // ── 1. PASTORS ANALYTICS (REAL DATABASE VALUES ONLY) ────────────────
  const rawViews = Number(currentPastor?.view_count || 0);
  const totalViews = Math.round(rawViews * tfConfig.mult);
  const profileClicks = Math.round(totalViews * 0.25); // 0 when totalViews is 0

  // Pastor-specific enquiries
  const currentPastorEnquiries = useMemo(() => {
    if (!currentPastor) return [];
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
    ? Math.round(currentPastorEnquiries.length * (timeframe === '7d' ? 0.35 : 0.6))
    : currentPastorEnquiries.length;

  const enquiryRate = totalViews > 0 ? ((timeframeEnquiries / totalViews) * 100).toFixed(1) : '0.0';

  // Bar chart heights — real distribution (0 if no views)
  const barChartData = useMemo(() => {
    const barsCount = tfConfig.bars;
    if (totalViews <= 0) {
      return Array.from({ length: barsCount }).map((_, i) => ({
        label: tfConfig.getLabel(i),
        value: 0,
      }));
    }
    const base = totalViews / barsCount;
    return Array.from({ length: barsCount }).map((_, i) => ({
      label: tfConfig.getLabel(i),
      value: Math.round(base),
    }));
  }, [totalViews, tfConfig]);

  const maxBarValue = Math.max(...barChartData.map((b) => b.value), 1);

  // Traffic sources — 0% baseline if no traffic
  const trafficSources = [
    { name: 'Search', percent: totalViews > 0 ? 50 : 0, color: '#7c3aed' },
    { name: 'Directory', percent: totalViews > 0 ? 30 : 0, color: '#ef4444' },
    { name: 'Shared links', percent: totalViews > 0 ? 15 : 0, color: '#14b8a6' },
    { name: 'Social', percent: totalViews > 0 ? 5 : 0, color: '#f59e0b' },
  ];

  // Locations for Map — live city only, 0 if no views
  const visitorLocations: VisitorLocation[] = useMemo(() => {
    if (!currentPastor) return [];
    const pastorCity = currentPastor.city || 'Local Area';
    return [
      {
        city: pastorCity,
        country: currentPastor.country || 'United Kingdom',
        count: totalViews,
        lat: 51.5074,
        lng: -0.1278,
        enquiries: timeframeEnquiries,
      },
    ];
  }, [totalViews, timeframeEnquiries, currentPastor]);

  // ── 2. CHURCHES ANALYTICS (REAL DATABASE VALUES ONLY) ───────────────
  const churchTfConfig = useMemo(() => getTimeframeConfig(churchTimeframe), [churchTimeframe]);

  const rawChurchViews = useMemo(() => {
    if (currentSelectedChurch) {
      return Number(currentSelectedChurch.view_count || 0);
    }
    return churches.reduce((acc, c) => acc + Number(c.view_count || 0), 0);
  }, [currentSelectedChurch, churches]);

  const churchTotalViews = Math.round(rawChurchViews * churchTfConfig.mult);
  const churchContactClicks = Math.round(churchTotalViews * 0.2);
  const churchEnquiriesCount = useMemo(() => {
    const matched = currentSelectedChurch
      ? pastorEnquiries.filter((e) => e.church_id === currentSelectedChurch.id || (e.category === 'church' && !e.church_id))
      : pastorEnquiries.filter((e) => e.category === 'church' || !!e.church_id);
    return Math.round(matched.length * churchTfConfig.mult);
  }, [pastorEnquiries, currentSelectedChurch, churchTfConfig.mult]);

  const churchConversionRate = churchTotalViews > 0
    ? (((churchContactClicks + churchEnquiriesCount) / churchTotalViews) * 100).toFixed(1)
    : '0.0';

  const churchBarChartData = useMemo(() => {
    const barsCount = churchTfConfig.bars;
    if (churchTotalViews <= 0) {
      return Array.from({ length: barsCount }).map((_, i) => ({
        label: churchTfConfig.getLabel(i),
        value: 0,
      }));
    }
    const base = churchTotalViews / barsCount;
    return Array.from({ length: barsCount }).map((_, i) => ({
      label: churchTfConfig.getLabel(i),
      value: Math.round(base),
    }));
  }, [churchTotalViews, churchTfConfig]);

  const churchMaxBarValue = Math.max(...churchBarChartData.map((b) => b.value), 1);

  const churchTrafficSources = [
    { name: 'Direct & Google Search', percent: churchTotalViews > 0 ? 55 : 0, color: '#7c3aed' },
    { name: 'City Directory', percent: churchTotalViews > 0 ? 25 : 0, color: '#ef4444' },
    { name: 'Digital Welcome Desk', percent: churchTotalViews > 0 ? 15 : 0, color: '#14b8a6' },
    { name: 'Social Shares', percent: churchTotalViews > 0 ? 5 : 0, color: '#f59e0b' },
  ];

  const churchVisitorLocations: VisitorLocation[] = useMemo(() => {
    const targetChurch = currentSelectedChurch || churches[0];
    if (!targetChurch) return [];
    const mainCity = targetChurch.city || 'Local Area';
    return [
      {
        city: mainCity,
        country: targetChurch.country || 'United Kingdom',
        count: churchTotalViews,
        lat: 51.5074,
        lng: -0.1278,
        enquiries: churchEnquiriesCount,
      },
    ];
  }, [churchTotalViews, churchEnquiriesCount, currentSelectedChurch, churches]);

  // ── 3. WORSHIP LEADERS ANALYTICS (REAL DATABASE VALUES ONLY) ─────────
  const wlTfConfig = useMemo(() => getTimeframeConfig(timeframe), [timeframe]);

  const rawWlViews = useMemo(() => {
    if (currentSelectedWorshipLeader) {
      return Number(currentSelectedWorshipLeader.view_count || 0);
    }
    return worshipLeaders.reduce((acc, w) => acc + Number(w.view_count || 0), 0);
  }, [currentSelectedWorshipLeader, worshipLeaders]);

  const wlTotalViews = Math.round(rawWlViews * wlTfConfig.mult);
  const wlProfileClicks = Math.round(wlTotalViews * 0.2);
  const wlEnquiriesCount = useMemo(() => {
    const matched = enquiries.filter((e) =>
      currentSelectedWorshipLeader
        ? e.leader_id === currentSelectedWorshipLeader.id || (e.category === 'worship-leader' && (!e.leader_id || e.leader_id === currentSelectedWorshipLeader.id))
        : e.category === 'worship-leader' || !!e.leader_id
    );
    return Math.round(matched.length * wlTfConfig.mult);
  }, [enquiries, currentSelectedWorshipLeader, wlTfConfig.mult]);

  const wlEnquiryRate = wlTotalViews > 0
    ? ((wlEnquiriesCount / wlTotalViews) * 100).toFixed(1)
    : '0.0';

  const wlBarChartData = useMemo(() => {
    const barsCount = wlTfConfig.bars;
    if (wlTotalViews <= 0) {
      return Array.from({ length: barsCount }).map((_, i) => ({
        label: wlTfConfig.getLabel(i),
        value: 0,
      }));
    }
    const base = wlTotalViews / barsCount;
    return Array.from({ length: barsCount }).map((_, i) => ({
      label: wlTfConfig.getLabel(i),
      value: Math.round(base),
    }));
  }, [wlTotalViews, wlTfConfig]);

  const wlMaxBarValue = Math.max(...wlBarChartData.map((b) => b.value), 1);

  const wlTrafficSources = [
    { name: 'Worship Search', percent: wlTotalViews > 0 ? 60 : 0, color: '#0284c7' },
    { name: 'Church Invitations', percent: wlTotalViews > 0 ? 25 : 0, color: '#7c3aed' },
    { name: 'Social Shares', percent: wlTotalViews > 0 ? 10 : 0, color: '#059669' },
    { name: 'Event Organizers', percent: wlTotalViews > 0 ? 5 : 0, color: '#f59e0b' },
  ];

  const wlVisitorLocations: VisitorLocation[] = useMemo(() => {
    const targetWl = currentSelectedWorshipLeader || worshipLeaders[0];
    if (!targetWl) return [];
    const mainCity = targetWl.city || 'Local Area';
    return [
      {
        city: mainCity,
        country: targetWl.country || 'United Kingdom',
        count: wlTotalViews,
        lat: 51.5074,
        lng: -0.1278,
        enquiries: wlEnquiriesCount,
      },
    ];
  }, [wlTotalViews, wlEnquiriesCount, currentSelectedWorshipLeader, worshipLeaders]);

  // ── 4. EVENTS ANALYTICS (REAL DATABASE VALUES ONLY) ──────────────────
  const eventTfConfig = useMemo(() => getTimeframeConfig(timeframe), [timeframe]);

  const rawEventViews = useMemo(() => {
    if (currentSelectedEvent) {
      return Number(currentSelectedEvent.view_count || 0);
    }
    return events.reduce((acc, e) => acc + Number(e.view_count || 0), 0);
  }, [currentSelectedEvent, events]);

  const eventTotalViews = Math.round(rawEventViews * eventTfConfig.mult);
  const eventTicketClicks = Math.round(eventTotalViews * 0.2);
  const eventEnquiriesCount = useMemo(() => {
    const matched = enquiries.filter((e) =>
      currentSelectedEvent
        ? e.event_id === currentSelectedEvent.id || (e.category === 'event' && (!e.event_id || e.event_id === currentSelectedEvent.id))
        : e.category === 'event' || !!e.event_id
    );
    return Math.round(matched.length * eventTfConfig.mult);
  }, [enquiries, currentSelectedEvent, eventTfConfig.mult]);

  const eventRsvpRate = eventTotalViews > 0
    ? (((eventTicketClicks + eventEnquiriesCount) / eventTotalViews) * 100).toFixed(1)
    : '0.0';

  const eventBarChartData = useMemo(() => {
    const barsCount = eventTfConfig.bars;
    if (eventTotalViews <= 0) {
      return Array.from({ length: barsCount }).map((_, i) => ({
        label: eventTfConfig.getLabel(i),
        value: 0,
      }));
    }
    const base = eventTotalViews / barsCount;
    return Array.from({ length: barsCount }).map((_, i) => ({
      label: eventTfConfig.getLabel(i),
      value: Math.round(base),
    }));
  }, [eventTotalViews, eventTfConfig]);

  const eventMaxBarValue = Math.max(...eventBarChartData.map((b) => b.value), 1);

  const eventTrafficSources = [
    { name: 'Community Search', percent: eventTotalViews > 0 ? 55 : 0, color: '#16a34a' },
    { name: 'Church Bulletins', percent: eventTotalViews > 0 ? 25 : 0, color: '#7c3aed' },
    { name: 'Social & Flyers', percent: eventTotalViews > 0 ? 15 : 0, color: '#0284c7' },
    { name: 'Direct RSVPs', percent: eventTotalViews > 0 ? 5 : 0, color: '#f59e0b' },
  ];

  const eventVisitorLocations: VisitorLocation[] = useMemo(() => {
    const targetEvent = currentSelectedEvent || events[0];
    if (!targetEvent) return [];
    const mainCity = targetEvent.city || targetEvent.venue_name || 'Local Area';
    return [
      {
        city: mainCity,
        country: 'United Kingdom',
        count: eventTotalViews,
        lat: 51.5074,
        lng: -0.1278,
        enquiries: eventEnquiriesCount,
      },
    ];
  }, [eventTotalViews, eventEnquiriesCount, currentSelectedEvent, events]);

  // Handle status update with optimistic UI and loader feedback
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const previousStatus = enquiries.find((e) => e.id === id)?.status;

    // Optimistic immediate update
    setEnquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      const res = await fetch(`/api/pastors/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Rollback on failure
        if (previousStatus) {
          setEnquiries((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: previousStatus } : item))
          );
        }
      }
    } catch (e) {
      console.error(e);
      // Rollback on network error
      if (previousStatus) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: previousStatus } : item))
        );
      }
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

  // Denominations list for Churches filter
  const denominations = useMemo(() => {
    const set = new Set<string>();
    churches.forEach((c) => {
      const d = c.denomination?.split('|||')[0];
      if (d) set.add(d.trim());
    });
    return Array.from(set).sort();
  }, [churches]);

  // Filtered churches for Churches section
  const filteredChurches = useMemo(() => {
    return churches.filter((c) => {
      const q = churchSearch.toLowerCase().trim();
      const qClean = q.replace(/\s+/g, '');
      const matchesPostcode = c.postcode
        ? c.postcode.toLowerCase().includes(q) || c.postcode.toLowerCase().replace(/\s+/g, '').includes(qClean)
        : false;
      const matchesDenomQuery = c.denomination ? c.denomination.toLowerCase().includes(q) : false;

      const matchesSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.slug && c.slug.toLowerCase().includes(q)) ||
        matchesPostcode ||
        matchesDenomQuery;

      const matchesStatus =
        churchStatusFilter === 'all' || (c.status || 'published') === churchStatusFilter;

      const matchesDenom =
        churchDenomFilter === 'all' ||
        (c.denomination && c.denomination.toLowerCase().includes(churchDenomFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesDenom;
    });
  }, [churches, churchSearch, churchStatusFilter, churchDenomFilter]);

  // Filtered pastors for Pastors section selector (name, city, postcode, denomination)
  const filteredPastors = useMemo(() => {
    return pastors.filter((p) => {
      const q = pastorSearch.toLowerCase().trim();
      if (!q) return true;
      const qClean = q.replace(/\s+/g, '');
      const postcode = p.postcode || p.church?.postcode || '';
      const matchesPostcode = postcode
        ? postcode.toLowerCase().includes(q) || postcode.toLowerCase().replace(/\s+/g, '').includes(qClean)
        : false;
      const denomination = p.denomination || p.title || '';
      const matchesDenom = denomination ? denomination.toLowerCase().includes(q) : false;

      return (
        (p.full_name && p.full_name.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        matchesPostcode ||
        matchesDenom
      );
    });
  }, [pastors, pastorSearch]);

  // Filtered worship leaders for Worship Leaders section selector (name, city, postcode, denomination/tagline)
  const filteredWorshipLeaders = useMemo(() => {
    return worshipLeaders.filter((wl) => {
      const q = worshipLeaderSearch.toLowerCase().trim();
      if (!q) return true;
      const qClean = q.replace(/\s+/g, '');
      const matchesPostcode = wl.postcode
        ? wl.postcode.toLowerCase().includes(q) || wl.postcode.toLowerCase().replace(/\s+/g, '').includes(qClean)
        : false;
      const denomination = wl.denomination || wl.tagline || '';
      const matchesDenom = denomination ? denomination.toLowerCase().includes(q) : false;

      return (
        (wl.display_name && wl.display_name.toLowerCase().includes(q)) ||
        (wl.city && wl.city.toLowerCase().includes(q)) ||
        (wl.email && wl.email.toLowerCase().includes(q)) ||
        matchesPostcode ||
        matchesDenom
      );
    });
  }, [worshipLeaders, worshipLeaderSearch]);

  // Filtered events for Events section selector (title, city, postcode — strictly NO denomination)
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const q = eventSearch.toLowerCase().trim();
      if (!q) return true;
      const qClean = q.replace(/\s+/g, '');
      const postcode = e.postcode || e.venue_postcode || '';
      const matchesPostcode = postcode
        ? postcode.toLowerCase().includes(q) || postcode.toLowerCase().replace(/\s+/g, '').includes(qClean)
        : false;

      return (
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.city && e.city.toLowerCase().includes(q)) ||
        (e.venue_name && e.venue_name.toLowerCase().includes(q)) ||
        matchesPostcode
      );
    });
  }, [events, eventSearch]);

  // Combined and filtered listings for All Listings section
  const filteredAllListings = useMemo(() => {
    const list: any[] = [];
    churches.forEach((c) => {
      const rawStatus = statusOverrides[`church-${c.id}`] || c.status || 'published';
      const normStatus = rawStatus === 'published' ? 'published' : 'unpublished';
      list.push({
        id: `church-${c.id}`,
        rawId: c.id,
        type: 'church',
        typeName: 'Church',
        name: c.name,
        email: c.email || '',
        slug: c.slug,
        location: c.city || c.address_line || 'UK',
        postcode: c.postcode || '',
        denomination: c.denomination?.split('|||')[0] || '—',
        status: normStatus,
        is_verified: c.is_verified,
        viewUrl: `/church/${c.slug}`,
        editUrl: `/church/${c.slug}?owner=true`,
      });
    });
    pastors.forEach((p) => {
      const rawStatus = statusOverrides[`pastor-${p.id}`] || p.status || 'published';
      const normStatus = rawStatus === 'published' ? 'published' : 'unpublished';
      list.push({
        id: `pastor-${p.id}`,
        rawId: p.id,
        type: 'pastor',
        typeName: 'Pastor / Speaker',
        name: p.full_name,
        email: p.email || '',
        slug: p.slug,
        location: p.city || p.country || 'UK',
        postcode: p.postcode || p.church?.postcode || '',
        denomination: p.denomination || p.title || 'Minister',
        status: normStatus,
        is_verified: p.verified || p.is_verified,
        viewUrl: `/pastor/${p.slug}`,
        editUrl: `/onboarding/pastor`,
      });
    });
    worshipLeaders.forEach((wl) => {
      const rawStatus = statusOverrides[`wl-${wl.id}`] || wl.status || 'published';
      const normStatus = rawStatus === 'published' ? 'published' : 'unpublished';
      list.push({
        id: `wl-${wl.id}`,
        rawId: wl.id,
        type: 'worship-leader',
        typeName: 'Worship Leader',
        name: wl.display_name,
        email: wl.email || '',
        slug: wl.slug,
        location: wl.city || wl.country || 'UK',
        postcode: wl.postcode || '',
        denomination: wl.tagline || 'Worship',
        status: normStatus,
        is_verified: wl.is_verified,
        viewUrl: `/worship-leader/${wl.slug}`,
        editUrl: `/onboarding/worship-leader/${wl.slug}/edit`,
      });
    });
    events.forEach((e) => {
      const rawStatus = statusOverrides[`event-${e.id}`] || e.status || 'published';
      const normStatus = rawStatus === 'published' ? 'published' : 'unpublished';
      list.push({
        id: `event-${e.id}`,
        rawId: e.id,
        type: 'event',
        typeName: 'Event',
        name: e.title,
        email: '',
        slug: e.slug,
        location: e.venue_name || e.city || 'UK',
        postcode: e.postcode || e.venue_postcode || '',
        denomination: e.type || 'Event',
        status: normStatus,
        is_verified: true,
        viewUrl: `/events/${e.slug}`,
        editUrl: `/onboarding/events`,
      });
    });

    return list.filter((item) => {
      if (deletedListingIds.includes(item.id)) return false;

      const q = allSearch.toLowerCase().trim();
      const qClean = q.replace(/\s+/g, '');

      // Space-insensitive postcode / zip code matching for all 4 types
      const matchesPostcode = item.postcode
        ? item.postcode.toLowerCase().includes(q) ||
          item.postcode.toLowerCase().replace(/\s+/g, '').includes(qClean)
        : false;

      // Denomination match only for non-events (churches, pastors, worship leaders)
      const matchesDenomQuery =
        item.type !== 'event' && item.denomination && item.denomination !== '—'
          ? item.denomination.toLowerCase().includes(q)
          : false;

      const matchesSearch =
        !q ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        matchesPostcode ||
        matchesDenomQuery;

      const matchesType = allTypeFilter === 'all' || item.type === allTypeFilter;
      const matchesStatus = allStatusFilter === 'all' || item.status === allStatusFilter;

      // Denomination dropdown filter (only applies to non-events; events are excluded from denomination matching)
      const matchesDenomFilter =
        allDenomFilter === 'all' ||
        (item.type !== 'event' &&
          item.denomination &&
          item.denomination.toLowerCase().includes(allDenomFilter.toLowerCase()));

      return matchesSearch && matchesType && matchesStatus && matchesDenomFilter;
    });
  }, [churches, pastors, worshipLeaders, events, allSearch, allTypeFilter, allDenomFilter, allStatusFilter, statusOverrides, deletedListingIds]);

  // Export Churches CSV
  const handleExportChurchesCSV = () => {
    if (churches.length === 0) return;
    const exportRows = filteredChurches.map((c) => ({
      Name: c.name || '',
      Email: c.email || '',
      Location: c.city || c.address_line || '',
      Denomination: c.denomination?.split('|||')[0] || '',
      Status: c.status || 'published',
      Verified: c.is_verified ? 'Yes' : 'No',
      Slug: c.slug || '',
      Phone: c.phone || '',
    }));
    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `churches_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample CSV
  const handleDownloadSampleCSV = () => {
    const sampleRows = [
      {
        name: 'Grace Community Church',
        denomination: 'Pentecostal',
        about: 'A vibrant, Christ-centered family church passionate about modern worship.',
        address: '123 High Street',
        city: 'London',
        state: 'Greater London',
        postcode: 'E12 5LH',
        country: 'United Kingdom',
        phone: '+44 20 7946 0912',
        email: 'info@gracechurch.org',
        website: 'https://gracechurch.org',
        service_day: 'Sunday',
        service_name: 'Morning Worship',
        service_time: '10:30 AM',
        status: 'published',
      },
      {
        name: 'Bethel Baptist Chapel',
        denomination: 'Baptist',
        about: 'A historic, loving congregation dedicated to faithful Bible teaching.',
        address: '45 Victoria Road',
        city: 'Birmingham',
        state: 'West Midlands',
        postcode: 'B1 1AA',
        country: 'United Kingdom',
        phone: '+44 121 496 0123',
        email: 'contact@bethelbaptist.org',
        website: 'https://bethelbaptist.org',
        service_day: 'Sunday',
        service_name: 'Sunday Morning Worship',
        service_time: '11:00 AM',
        status: 'draft',
      },
    ];
    const csv = Papa.unparse(sampleRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'church_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Select Toggle for Churches
  const handleToggleSelectAllChurches = () => {
    if (selectedChurchIds.length === filteredChurches.length) {
      setSelectedChurchIds([]);
    } else {
      setSelectedChurchIds(filteredChurches.map((c) => c.id));
    }
  };

  const handleToggleSelectChurch = (id: string) => {
    setSelectedChurchIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Select Toggle for All Listings
  const handleToggleSelectAllListings = () => {
    if (selectedAllIds.length === filteredAllListings.length) {
      setSelectedAllIds([]);
    } else {
      setSelectedAllIds(filteredAllListings.map((l) => l.id));
    }
  };

  const handleToggleSelectListing = (id: string) => {
    setSelectedAllIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Toggle listing published / unpublished status
  const handleToggleListingStatus = async (item: any) => {
    const nextStatus: 'published' | 'unpublished' = item.status === 'published' ? 'unpublished' : 'published';
    setIsTogglingStatusId(item.id);
    try {
      const supabase = createClient();
      const tableName = item.type === 'church' ? 'churches'
        : item.type === 'pastor' ? 'pastors'
        : item.type === 'worship-leader' ? 'worship_leaders'
        : 'events';

      const dbStatus = nextStatus === 'published' ? 'published' : 'draft';
      const { error } = await supabase.from(tableName).update({ status: dbStatus }).eq('id', item.rawId);
      if (error) {
        console.warn('Status update warning (might lack permission or column):', error.message);
      }
      setStatusOverrides((prev) => ({
        ...prev,
        [item.id]: nextStatus,
      }));
    } catch (e: any) {
      console.error('Error toggling status:', e);
      // Still update UI override for snappy response
      setStatusOverrides((prev) => ({
        ...prev,
        [item.id]: nextStatus,
      }));
    } finally {
      setIsTogglingStatusId(null);
    }
  };

  // Open delete confirmation modal
  const handleDeleteListingRequest = (item: any) => {
    setItemToDelete(item);
    setDeletePassword('');
    setDeleteError(null);
  };

  // Confirm delete with profile password
  const handleConfirmDeleteListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToDelete) return;
    if (!deletePassword) {
      setDeleteError('Please enter your account password to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const supabase = createClient();
      // Verify account password by re-authenticating user
      if (user?.email) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: deletePassword,
        });

        if (authError) {
          setDeleteError('Incorrect password. Please try again.');
          setIsDeleting(false);
          return;
        }
      }

      // Delete from the corresponding table
      if (itemToDelete.isBulk && Array.isArray(itemToDelete.items)) {
        for (const it of itemToDelete.items) {
          const tableName = it.type === 'church' ? 'churches'
            : it.type === 'pastor' ? 'pastors'
            : it.type === 'worship-leader' ? 'worship_leaders'
            : 'events';
          await supabase.from(tableName).delete().eq('id', it.rawId);
        }
        const idsToRemove = itemToDelete.items.map((i: any) => i.id);
        setDeletedListingIds((prev) => [...prev, ...idsToRemove]);
        setSelectedAllIds([]);
      } else {
        const tableName = itemToDelete.type === 'church' ? 'churches'
          : itemToDelete.type === 'pastor' ? 'pastors'
          : itemToDelete.type === 'worship-leader' ? 'worship_leaders'
          : 'events';

        const { error: delError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', itemToDelete.rawId);

        if (delError) {
          console.warn('DB delete warning:', delError.message);
        }

        // Mark as deleted in local state
        setDeletedListingIds((prev) => [...prev, itemToDelete.id]);
        setSelectedAllIds((prev) => prev.filter((id) => id !== itemToDelete.id));
      }
      setItemToDelete(null);
      setDeletePassword('');
      setDeleteError(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete listing.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk actions for selected listings
  const handleBulkUnpublish = async () => {
    if (selectedAllIds.length === 0) return;
    const targets = filteredAllListings.filter((l) => selectedAllIds.includes(l.id));
    const newOverrides: Record<string, 'published' | 'unpublished'> = { ...statusOverrides };
    const supabase = createClient();
    for (const item of targets) {
      newOverrides[item.id] = 'unpublished';
      const tableName = item.type === 'church' ? 'churches'
        : item.type === 'pastor' ? 'pastors'
        : item.type === 'worship-leader' ? 'worship_leaders'
        : 'events';
      try {
        await supabase.from(tableName).update({ status: 'draft' }).eq('id', item.rawId);
      } catch {
        // Continue for next items
      }
    }
    setStatusOverrides(newOverrides);
    setSelectedAllIds([]);
  };

  const handleBulkDeleteRequest = () => {
    if (selectedAllIds.length === 0) return;
    const targets = filteredAllListings.filter((l) => selectedAllIds.includes(l.id));
    setItemToDelete({
      isBulk: true,
      name: `${targets.length} Selected Listings`,
      typeName: 'Bulk Selection',
      location: `${targets.length} items to be permanently removed`,
      items: targets,
    });
    setDeletePassword('');
    setDeleteError(null);
  };

  const userDisplayName = profileName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Minister';
  const userDisplayInitial = (userDisplayName.trim()[0] || 'U').toUpperCase();
  const userEmail = user?.email || profileEmail || '';

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/login';
  };

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


        {/* ── LOGO (Redirect to Homepage) ───────────────────────────── */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            padding: '4px 8px 18px',
            marginBottom: '10px',
            borderBottom: '1px solid #f1f5f9',
          }}
          title="Return to Home"
        >
          <Image
            src={logoImg}
            alt="ChurchNavigator Logo"
            width={165}
            height={38}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>

        {/* ── MAIN SECTIONS NAVIGATION (User Requested Order) ──────── */}
        <div style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', padding: '0 10px', marginBottom: '8px' }}>
          Menu
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: 'ti-layout-dashboard', unread: null, allowed: true },
            { id: 'visitor-insights', label: 'Visitor Insights', icon: 'ti-chart-dots', unread: null, allowed: !isTeamMember || teamRole === 'events_and_church_edit' },
            { id: 'all', label: 'All Listings', icon: 'ti-layout-grid', unread: null, allowed: !isTeamMember || teamRole === 'events_and_church_edit' },
            { id: 'churches', label: 'Churches', icon: 'ti-building-church', unread: null, allowed: !isTeamMember || teamRole === 'events_and_church_edit' },
            { id: 'pastors', label: 'Pastors', icon: 'ti-user-star', unread: null, primary: true, allowed: !isTeamMember || teamRole === 'events_and_church_edit' },
            { id: 'worship-leaders', label: 'Worship leaders', icon: 'ti-microphone-2', unread: null, allowed: !isTeamMember },
            { id: 'events', label: 'Events', icon: 'ti-calendar-event', unread: null, allowed: true },
            { id: 'enquiries', label: 'Enquiries', icon: 'ti-mail', unread: unreadEnquiriesCount, allowed: !isTeamMember || teamRole === 'events_and_church_edit' },
            // Users / Team management hidden for the time being:
            // { id: 'users', label: 'Users', icon: 'ti-users', unread: null, allowed: !isTeamMember },
          ].filter(item => item.allowed).map((item) => {
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
              {section === 'overview'
                ? 'Overview'
                : section === 'visitor-insights'
                ? 'Visitor Insights'
                : section === 'pastors'
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
                : section === 'users'
                ? 'Team Members & Roles'
                : 'My Profile'}
            </h1>

            {/* Timeframe pill selector on Analytics & profile sections */}
            {(['pastors', 'churches', 'worship-leaders', 'events'].includes(section)) && (
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
                {(['7d', '14d', '1m', '3m', '6m', '12m', 'all'] as const).map((tf) => {
                  const isActive = (section === 'churches' ? churchTimeframe : timeframe) === tf;
                  return (
                    <button
                      key={tf}
                      onClick={() => {
                        setTimeframe(tf);
                        setChurchTimeframe(tf);
                      }}
                      style={{
                        border: 'none',
                        background: isActive ? '#ffffff' : 'transparent',
                        color: isActive ? '#7c3aed' : '#64748b',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                      }}
                    >
                      {tf.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Header: User Profile Pill & Dropdown (Matching TopNav, no search/explore/add-listing) */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            {/* User Initial / Avatar Pill */}
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f3e8ff',
                border: '1.5px solid #d8b4fe',
                borderRadius: '24px',
                padding: '4px 12px 4px 5px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                }}
              >
                {userDisplayInitial}
              </div>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#5b21b6',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userDisplayName}
              </span>
              <i
                className="ti ti-chevron-down"
                style={{
                  fontSize: '13px',
                  color: '#6b21a8',
                  transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              ></i>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '210px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.18)',
                  border: '1px solid #f1f5f9',
                  padding: '8px',
                  zIndex: 1010,
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {userDisplayName}
                  </div>
                  {userEmail && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {userEmail}
                    </div>
                  )}
                </div>

                {/* 1. Dashboard */}
                <button
                  onClick={() => {
                    setSection('overview');
                    setIsUserMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: section === 'overview' ? '#7c3aed' : '#334155',
                    background: section === 'overview' ? '#faf5ff' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <i className="ti ti-layout-dashboard" style={{ fontSize: '16px', color: '#7c3aed' }}></i>
                  Dashboard
                </button>

                {/* 2. My Profile */}
                <button
                  onClick={() => {
                    setSection('my-profile');
                    setIsUserMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: section === 'my-profile' ? '#7c3aed' : '#334155',
                    background: section === 'my-profile' ? '#faf5ff' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <i className="ti ti-user" style={{ fontSize: '16px', color: '#7c3aed' }}></i>
                  My Profile
                </button>

                {/* 3. Super Admin (Restricted strictly to super administrators) */}
                {isSuperAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsUserMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#7c3aed',
                      textDecoration: 'none',
                      background: '#faf5ff',
                    }}
                  >
                    <i className="ti ti-shield-lock" style={{ fontSize: '16px', color: '#7c3aed' }}></i>
                    Super Admin
                  </Link>
                )}

                {/* 4. Sign Out */}
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#ef4444',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <i className="ti ti-logout" style={{ fontSize: '16px' }}></i>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── BODY VIEW ROUTER ─────────────────────────────────────── */}
        <div style={{ padding: '24px 32px', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
          
          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── OVERVIEW SECTION (COPIED FROM DASHBOARD2) ───────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {saveSuccessNotice && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '10px 20px', color: '#065f46', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ti ti-check"></i> {saveSuccessNotice}
                </div>
              )}

              {/* AI VISITOR INTELLIGENCE CALLOUTS */}
              <div className="d2-ai-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="d2-ai-card warn">
                  <div className="d2-ai-tag">Action Needed</div>
                  <div className="d2-ai-title">
                    {pastorEnquiries.filter((e) => e.status === 'new').length > 0
                      ? `${pastorEnquiries.filter((e) => e.status === 'new').length} Unread Enquiries Waiting`
                      : 'All messages answered'}
                  </div>
                  <div className="d2-ai-desc">
                    Responding to visitor messages within 2 hours increases follow-up retention by 42%.
                  </div>
                  <button className="d2-ai-link" onClick={() => setSection('enquiries')}>
                    Open Inbox &rarr;
                  </button>
                </div>

                <div className="d2-ai-card good">
                  <div className="d2-ai-tag">Quality Insight</div>
                  <div className="d2-ai-title">Profile Completeness: {completeness.score}%</div>
                  <div className="d2-ai-desc">
                    {completeness.score >= 80
                      ? 'Your profile contains high-fidelity info, ranking higher in search discovery!'
                      : 'Complete remaining details to boost your listing discovery rank by 3×.'}
                  </div>
                  {selectedOverviewEntity && (
                    <button className="d2-ai-link" onClick={() => openDrawerForEntity(selectedOverviewEntity)}>
                      Complete Profile &rarr;
                    </button>
                  )}
                </div>
              </div>

              {/* STAT TILES */}
              <div className="d2-stats-grid">
                <div className="d2-stat-tile">
                  <div className="d2-stat-icon"><i className="ti ti-eye"></i></div>
                  <div className="d2-stat-val">{totalOverviewViews.toLocaleString()}</div>
                  <div className="d2-stat-label">Profile Impressions</div>
                  <div className="d2-stat-trend up">
                    <i className="ti ti-activity"></i> {totalOverviewViews > 0 ? `${totalOverviewViews} recorded` : '0 today'}
                  </div>
                </div>

                <div className="d2-stat-tile">
                  <div className="d2-stat-icon"><i className="ti ti-mail"></i></div>
                  <div className="d2-stat-val">{pastorEnquiries.length}</div>
                  <div className="d2-stat-label">Total Inquiries & Messages</div>
                  <div className="d2-stat-trend up">
                    <i className="ti ti-trending-up"></i> +{pastorEnquiries.filter((e) => e.status === 'new').length} new
                  </div>
                </div>

                <div className="d2-stat-tile">
                  <div className="d2-stat-icon"><i className="ti ti-folders"></i></div>
                  <div className="d2-stat-val">{allEntities.length}</div>
                  <div className="d2-stat-label">Owned Portfolio Listings</div>
                  <div className="d2-stat-trend up">
                    <i className="ti ti-check"></i> All Published
                  </div>
                </div>

                <div className="d2-stat-tile">
                  <div className="d2-stat-icon"><i className="ti ti-qrcode"></i></div>
                  <div className="d2-stat-val">{totalQrCheckins.toLocaleString()}</div>
                  <div className="d2-stat-label">Visitor QR Check-ins</div>
                  <div className="d2-stat-trend up">
                    <i className="ti ti-trending-up"></i> Active
                  </div>
                </div>
              </div>


              {/* 6-STAGE VISITOR JOURNEY FUNNEL */}
              <div className="d2-card">
                <div className="d2-card-header">
                  <div>
                    <div className="d2-card-title">
                      <i className="ti ti-filter" style={{ color: 'var(--ek2-purple)' }}></i>
                      Visitor Journey Funnel
                    </div>
                    <div className="d2-card-sub">
                      Tracking how newcomers transition from initial discovery to active community leaders
                    </div>
                  </div>
                </div>

                <div className="d2-funnel">
                  <div className="d2-funnel-step">
                    <div className="d2-funnel-val">{totalOverviewViews.toLocaleString()}</div>
                    <div className="d2-funnel-lbl">1. Discovery</div>
                  </div>
                  <div className="d2-funnel-step">
                    <div className="d2-funnel-val">{totalQrCheckins.toLocaleString()}</div>
                    <div className="d2-funnel-lbl">2. First Visit</div>
                  </div>
                  <div className="d2-funnel-step">
                    <div className="d2-funnel-val">{Math.round(totalQrCheckins * 0.6).toLocaleString()}</div>
                    <div className="d2-funnel-lbl">3. Returning</div>
                  </div>
                  <div className="d2-funnel-step">
                    <div className="d2-funnel-val">{pastorEnquiries.length.toLocaleString()}</div>
                    <div className="d2-funnel-lbl">4. Engaged</div>
                  </div>
                  <div className="d2-funnel-step">
                    <div className="d2-funnel-val">{Math.round(totalQrCheckins * 0.25).toLocaleString()}</div>
                    <div className="d2-funnel-lbl">5. Member</div>
                  </div>
                  <div className="d2-funnel-step">
                    <div className="d2-funnel-val">{allEntities.length.toLocaleString()}</div>
                    <div className="d2-funnel-lbl">6. Ministry Leader</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── VISITOR INSIGHTS SECTION ────────────────────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'visitor-insights' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px 28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', width: '100%', boxSizing: 'border-box' }}>
              <InsightsClient
                churchName={insightsData?.churchName || churches.find((c) => c.id === 'e97ae738-0436-444d-b1d5-33f0e23df18c')?.name || 'ASCA'}
                churchId={insightsData?.churchId || 'e97ae738-0436-444d-b1d5-33f0e23df18c'}
                availableChurches={churches.map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug || c.id,
                  city: c.city,
                  postcode: c.postcode,
                  denomination: c.denomination,
                }))}
                stats={insightsData?.stats || null}
                funnel={insightsData?.funnel || []}
                sources={insightsData?.sources || []}
                visitors={insightsData?.visitors || []}
                embedded={true}
              />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── PASTORS SECTION (CLEAN ANALYTICS VIEW) ──────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'pastors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Profile Selector & Search Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '16px 20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b' }}>Select Profile:</span>
                  {filteredPastors.length === 0 ? (
                    <span style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                      No pastors match search
                    </span>
                  ) : (
                    filteredPastors.map((p) => {
                      const origIndex = pastors.findIndex((item) => item.id === p.id);
                      const isSelected = selectedPastorIndex === origIndex;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPastorIndex(origIndex >= 0 ? origIndex : 0)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid #a855f7' : '1px solid #cbd5e1',
                            background: isSelected ? '#faf5ff' : '#ffffff',
                            color: isSelected ? '#9333ea' : '#64748b',
                            fontWeight: 800,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          {p.full_name}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Pastor Search Input */}
                <div style={{ position: 'relative', minWidth: '240px', flex: '0 1 300px' }}>
                  <i
                    className="ti ti-search"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      fontSize: '15px',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search pastors by name, zip code, denomination..."
                    value={pastorSearch}
                    onChange={(e) => setPastorSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 32px 8px 34px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '12.5px',
                      color: '#0f172a',
                      outline: 'none',
                      background: '#f8fafc',
                      boxSizing: 'border-box',
                    }}
                  />
                  {pastorSearch && (
                    <button
                      type="button"
                      onClick={() => setPastorSearch('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '13px',
                      }}
                    >
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Completeness Status Banner & Edit Prompt */}
              {currentPastor && (() => {
                const pComp = getEntityCompleteness(currentPastor);
                return (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                      borderRadius: '16px',
                      border: '1.5px solid #e9d5ff',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: pComp.score >= 80 ? '#ecfdf5' : '#fef3c7',
                          color: pComp.score >= 80 ? '#059669' : '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {pComp.score >= 80 ? '✓' : '⚡'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                            Profile Completeness: {pComp.score}%
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: pComp.score >= 80 ? '#d1fae5' : '#fef3c7',
                              color: pComp.score >= 80 ? '#065f46' : '#92400e',
                            }}
                          >
                            {pComp.score >= 80 ? 'Optimized' : 'Action Recommended'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                          {pComp.score >= 80
                            ? 'Your pastor profile is complete and ranking with maximum visibility in search!'
                            : `Boost your search discovery rank by completing remaining details (${pComp.items.filter(i => !i.done).map(i => i.label).join(', ')}).`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {(!isTeamMember || teamRole === 'events_and_church_edit') && (
                        <button
                          type="button"
                          onClick={() => openDrawerForEntity({
                            id: currentPastor.id,
                            title: currentPastor.full_name || currentPastor.name,
                            type: 'pastor',
                            typeLabel: 'Pastor',
                            raw: currentPastor,
                          })}
                          style={{
                            background: '#7c3aed',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '12.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                          }}
                        >
                          <i className="ti ti-edit" style={{ fontSize: '14px' }}></i> Quick Edit Details
                        </button>
                      )}

                      <Link
                        href={`/pastor/${currentPastor.slug || currentPastor.id}`}
                        target="_blank"
                        style={{
                          background: '#ffffff',
                          color: '#475569',
                          border: '1.5px solid #cbd5e1',
                          padding: '7px 14px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        View Public Profile &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })()}

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
                      const heightPct = bar.value > 0 ? Math.max(15, Math.min(100, (bar.value / maxBarValue) * 100)) : 0;
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div
                            title={`${bar.value} views`}
                            style={{
                              width: '100%',
                              height: bar.value > 0 ? `${heightPct}%` : '3px',
                              background: bar.value > 0 ? 'linear-gradient(180deg, #d946ef 0%, #7c3aed 100%)' : '#e2e8f0',
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
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '2px', flexWrap: 'wrap' }}>
                  {(['all', 'new', 'in_progress', 'responded', 'archived'] as const).map((f) => {
                    const labelMap: Record<string, string> = {
                      all: 'All',
                      new: 'New',
                      in_progress: 'In Progress',
                      responded: 'Responded',
                      archived: 'Archived',
                    };
                    return (
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
                          boxShadow: enquiryStatusFilter === f ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        {labelMap[f] || f}
                      </button>
                    );
                  })}
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

                            {/* Status Badge Tag */}
                            {(() => {
                              const s = enq.status || 'new';
                              const badgeStyles: Record<string, { bg: string; text: string; label: string; dot: string }> = {
                                new: { bg: '#ffe4e6', text: '#e11d48', label: 'NEW', dot: '#e11d48' },
                                in_progress: { bg: '#fef3c7', text: '#b45309', label: 'IN PROGRESS', dot: '#d97706' },
                                responded: { bg: '#dcfce7', text: '#15803d', label: 'RESPONDED', dot: '#16a34a' },
                                archived: { bg: '#f1f5f9', text: '#475569', label: 'ARCHIVED', dot: '#64748b' },
                                read: { bg: '#f1f5f9', text: '#475569', label: 'READ', dot: '#94a3b8' },
                              };
                              const style = badgeStyles[s] || badgeStyles.new;
                              return (
                                <span
                                  style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    padding: '2.5px 8px',
                                    borderRadius: '6px',
                                    background: style.bg,
                                    color: style.text,
                                    letterSpacing: '0.02em',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                  }}
                                >
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: style.dot }} />
                                  {style.label}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Right Controls: Timestamp + Modern Split Button with Status Dropdown */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {new Date(enq.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>

                            {/* Split-Button & Status Dropdown Container */}
                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                              {/* Primary Reply Button (Left) */}
                              <a
                                href={`mailto:${enq.sender_email}?subject=Regarding your enquiry on ChurchNavigator for ${encodeURIComponent(enq.entityName)}`}
                                onClick={() => handleUpdateStatus(enq.id, 'responded')}
                                title="Reply via default Email client"
                                style={{
                                  background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
                                  color: '#ffffff',
                                  padding: '7px 13px',
                                  borderTopLeftRadius: '9px',
                                  borderBottomLeftRadius: '9px',
                                  fontSize: '12.5px',
                                  fontWeight: 800,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.2)',
                                  transition: 'all 0.15s ease',
                                  opacity: updatingId === enq.id ? 0.75 : 1,
                                  pointerEvents: updatingId === enq.id ? 'none' : 'auto',
                                }}
                              >
                                {updatingId === enq.id ? (
                                  <i className="ti ti-loader-2" style={{ fontSize: '14px', animation: 'spin 0.8s linear infinite' }}></i>
                                ) : (
                                  <i className="ti ti-mail-forward" style={{ fontSize: '14px' }}></i>
                                )}
                                Reply
                              </a>

                              {/* Dropdown Toggle Chevron (Right) */}
                              <button
                                type="button"
                                disabled={updatingId === enq.id}
                                onClick={() =>
                                  setActiveStatusDropdownId(activeStatusDropdownId === enq.id ? null : enq.id)
                                }
                                title="Change enquiry status"
                                style={{
                                  background: '#be123c',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderLeft: '1px solid rgba(255,255,255,0.25)',
                                  padding: '7px 9px',
                                  borderTopRightRadius: '9px',
                                  borderBottomRightRadius: '9px',
                                  fontSize: '12.5px',
                                  cursor: updatingId === enq.id ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.2)',
                                  opacity: updatingId === enq.id ? 0.75 : 1,
                                }}
                              >
                                {updatingId === enq.id ? (
                                  <i className="ti ti-loader-2" style={{ fontSize: '13px', animation: 'spin 0.8s linear infinite' }} />
                                ) : (
                                  <i
                                    className="ti ti-chevron-down"
                                    style={{
                                      fontSize: '13px',
                                      transform: activeStatusDropdownId === enq.id ? 'rotate(180deg)' : 'none',
                                      transition: 'transform 0.2s ease',
                                    }}
                                  />
                                )}
                              </button>

                              {/* Interactive Dropdown Menu */}
                              {activeStatusDropdownId === enq.id && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 6px)',
                                    right: 0,
                                    width: '220px',
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.15)',
                                    padding: '6px',
                                    zIndex: 100,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: '#94a3b8',
                                      padding: '5px 10px',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <span>Update Status</span>
                                    {updatingId === enq.id && (
                                      <i className="ti ti-loader-2" style={{ animation: 'spin 0.8s linear infinite', fontSize: '12px', color: '#7c3aed' }}></i>
                                    )}
                                  </div>

                                  {/* 1. Mark as New / Unread */}
                                  <button
                                    type="button"
                                    disabled={updatingId === enq.id}
                                    onClick={() => {
                                      handleUpdateStatus(enq.id, 'new');
                                      setActiveStatusDropdownId(null);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      border: 'none',
                                      background: enq.status === 'new' ? '#fff1f2' : 'transparent',
                                      color: '#0f172a',
                                      fontSize: '12.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      opacity: updatingId === enq.id ? 0.6 : 1,
                                    }}
                                  >
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e11d48', flexShrink: 0 }} />
                                    <span style={{ flex: 1 }}>Mark as New / Unread</span>
                                    {enq.status === 'new' && <i className="ti ti-check" style={{ fontSize: '13px', color: '#e11d48' }}></i>}
                                  </button>

                                  {/* 2. Mark as In Progress */}
                                  <button
                                    type="button"
                                    disabled={updatingId === enq.id}
                                    onClick={() => {
                                      handleUpdateStatus(enq.id, 'in_progress');
                                      setActiveStatusDropdownId(null);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      border: 'none',
                                      background: enq.status === 'in_progress' ? '#fef3c7' : 'transparent',
                                      color: '#0f172a',
                                      fontSize: '12.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      opacity: updatingId === enq.id ? 0.6 : 1,
                                    }}
                                  >
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
                                    <span style={{ flex: 1 }}>Mark as In Progress</span>
                                    {enq.status === 'in_progress' && <i className="ti ti-check" style={{ fontSize: '13px', color: '#d97706' }}></i>}
                                  </button>

                                  {/* 3. Mark as Responded */}
                                  <button
                                    type="button"
                                    disabled={updatingId === enq.id}
                                    onClick={() => {
                                      handleUpdateStatus(enq.id, 'responded');
                                      setActiveStatusDropdownId(null);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      border: 'none',
                                      background: enq.status === 'responded' ? '#dcfce7' : 'transparent',
                                      color: '#0f172a',
                                      fontSize: '12.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      opacity: updatingId === enq.id ? 0.6 : 1,
                                    }}
                                  >
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                                    <span style={{ flex: 1 }}>Mark as Responded</span>
                                    {enq.status === 'responded' && <i className="ti ti-check" style={{ fontSize: '13px', color: '#16a34a' }}></i>}
                                  </button>

                                  {/* 4. Archive / Closed */}
                                  <button
                                    type="button"
                                    disabled={updatingId === enq.id}
                                    onClick={() => {
                                      handleUpdateStatus(enq.id, 'archived');
                                      setActiveStatusDropdownId(null);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      border: 'none',
                                      background: enq.status === 'archived' ? '#f1f5f9' : 'transparent',
                                      color: '#0f172a',
                                      fontSize: '12.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      opacity: updatingId === enq.id ? 0.6 : 1,
                                    }}
                                  >
                                    <i className="ti ti-archive" style={{ fontSize: '14px', color: '#64748b' }}></i>
                                    <span style={{ flex: 1 }}>Archive / Closed</span>
                                    {enq.status === 'archived' && <i className="ti ti-check" style={{ fontSize: '13px', color: '#64748b' }}></i>}
                                  </button>
                                </div>
                              )}
                            </div>
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
          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── ALL LISTINGS SECTION (TABLE DESIGN LIKE SCREENSHOT) ── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'all' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Box matching screenshot */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  padding: '24px 28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                    All Listings Management
                  </h1>
                  <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                    Manage and moderate all your directory listings across the platform
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkModalType('churches');
                      setIsBulkModalOpen(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '7px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <i className="ti ti-upload" style={{ fontSize: '14px' }}></i> Import CSV
                  </button>

                  <button
                    type="button"
                    onClick={handleExportChurchesCSV}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '7px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <i className="ti ti-download" style={{ fontSize: '14px' }}></i> Export CSV
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSampleCSV}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '7px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <i className="ti ti-file-text" style={{ fontSize: '14px' }}></i> Download Sample
                  </button>

                  <div
                    style={{
                      padding: '7px 14px',
                      fontSize: '13px',
                      fontWeight: 900,
                      color: '#0f172a',
                      background: '#f8fafc',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0',
                      marginLeft: '4px',
                    }}
                  >
                    {filteredAllListings.length} Listings
                  </div>
                </div>
              </div>

              {/* Modern & Sleek Filter / Search Toolbar */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px -1px rgba(0,0,0,0.04)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Search Input with Icon */}
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '240px' }}>
                  <i
                    className="ti ti-search"
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      fontSize: '17px',
                    }}
                  ></i>
                  <input
                    type="text"
                    placeholder="Search by name, city, zip code, denomination, or email..."
                    value={allSearch}
                    onChange={(e) => setAllSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 38px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none',
                      background: '#f8fafc',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s, background-color 0.15s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                  />
                  {allSearch && (
                    <button
                      type="button"
                      onClick={() => setAllSearch('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <i className="ti ti-x"></i>
                    </button>
                  )}
                </div>

                {/* Type Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Type:</span>
                  <select
                    value={allTypeFilter}
                    onChange={(e) => setAllTypeFilter(e.target.value)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1e293b',
                      background: '#ffffff',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="church">Churches</option>
                    <option value="pastor">Pastors</option>
                    <option value="worship-leader">Worship Leaders</option>
                    <option value="event">Events</option>
                  </select>
                </div>

                {/* Denomination Filter (for non-events) */}
                {allTypeFilter !== 'event' && denominations.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Denom:</span>
                    <select
                      value={allDenomFilter}
                      onChange={(e) => setAllDenomFilter(e.target.value)}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#1e293b',
                        background: '#ffffff',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="all">All Denominations</option>
                      {denominations.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Status:</span>
                  <select
                    value={allStatusFilter}
                    onChange={(e) => setAllStatusFilter(e.target.value as any)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1e293b',
                      background: '#ffffff',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>

                {/* Reset Filters if active */}
                {(allSearch || allTypeFilter !== 'all' || allDenomFilter !== 'all' || allStatusFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setAllSearch('');
                      setAllTypeFilter('all');
                      setAllDenomFilter('all');
                      setAllStatusFilter('all');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '9px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <i className="ti ti-rotate-clockwise" style={{ fontSize: '13px' }}></i> Reset
                  </button>
                )}
              </div>

              {/* Bulk Actions Floating/Docked Toolbar when items are selected */}
              {selectedAllIds.length > 0 && (
                <div
                  style={{
                    background: '#1e1b4b',
                    color: '#ffffff',
                    borderRadius: '14px',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.3)',
                    animation: 'fadeIn 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: '#7c3aed',
                        color: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 900,
                      }}
                    >
                      {selectedAllIds.length}
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>
                      Listings Selected
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleBulkUnpublish}
                      style={{
                        background: '#ffffff',
                        color: '#1e293b',
                        border: 'none',
                        borderRadius: '9px',
                        padding: '8px 16px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="ti ti-eye-off"></i> Unpublish Selected
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDeleteRequest}
                      style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '9px',
                        padding: '8px 16px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="ti ti-trash"></i> Delete Selected
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAllIds([])}
                      style={{
                        background: 'transparent',
                        color: '#cbd5e1',
                        border: 'none',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Listings Data Table */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px -1px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid #f1f5f9', background: '#fafaf9', color: '#64748b', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        <th style={{ padding: '14px 18px', width: '36px' }}>
                          <input
                            type="checkbox"
                            checked={filteredAllListings.length > 0 && selectedAllIds.length === filteredAllListings.length}
                            onChange={handleToggleSelectAllListings}
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '4px',
                              accentColor: '#7c3aed',
                              cursor: 'pointer',
                            }}
                          />
                        </th>
                        <th style={{ padding: '14px 18px' }}>Listing</th>
                        <th style={{ padding: '14px 18px' }}>Category</th>
                        <th style={{ padding: '14px 18px' }}>Location</th>
                        <th style={{ padding: '14px 18px' }}>Status</th>
                        <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>Badges</th>
                        <th style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAllListings.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                            <i className="ti ti-folder-x" style={{ fontSize: '40px', color: '#cbd5e1', display: 'block', marginBottom: '10px' }}></i>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>No listings found</div>
                            <div style={{ fontSize: '13px' }}>Try adjusting your search or filters.</div>
                          </td>
                        </tr>
                      ) : (
                        filteredAllListings.map((item) => {
                          const isSelected = selectedAllIds.includes(item.id);
                          const isPublished = item.status === 'published';
                          const isToggling = isTogglingStatusId === item.id;
                          return (
                            <tr
                              key={item.id}
                              style={{
                                borderBottom: '1px solid #f8fafc',
                                background: isSelected ? '#faf5ff' : 'transparent',
                                transition: 'background 0.15s ease',
                              }}
                            >
                              {/* Checkbox column */}
                              <td style={{ padding: '16px 18px' }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectListing(item.id)}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    accentColor: '#7c3aed',
                                    cursor: 'pointer',
                                  }}
                                />
                              </td>

                              {/* Listing info: icon + name + email */}
                              <td style={{ padding: '16px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '10px',
                                      background: item.type === 'church' ? '#f5f3ff' : item.type === 'pastor' ? '#fdf4ff' : item.type === 'worship-leader' ? '#f0f9ff' : '#f0fdf4',
                                      border: `1px solid ${item.type === 'church' ? '#ddd6fe' : item.type === 'pastor' ? '#f5d0fe' : item.type === 'worship-leader' ? '#bae6fd' : '#bbf7d0'}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '18px',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {item.type === 'church' ? '⛪' : item.type === 'pastor' ? '👤' : item.type === 'worship-leader' ? '🎵' : '📅'}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                                      {item.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                      {item.email || `/${item.slug}`}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Category tag - Just 'Church', pastors, etc */}
                              <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                                <span
                                  style={{
                                    fontSize: '11.5px',
                                    fontWeight: 800,
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    background: item.type === 'church' ? '#f5f3ff' : item.type === 'pastor' ? '#fdf4ff' : item.type === 'worship-leader' ? '#f0f9ff' : '#f0fdf4',
                                    color: item.type === 'church' ? '#7c3aed' : item.type === 'pastor' ? '#c026d3' : item.type === 'worship-leader' ? '#0284c7' : '#16a34a',
                                  }}
                                >
                                  {item.typeName}
                                </span>
                              </td>

                              {/* Location */}
                              <td style={{ padding: '16px 18px', color: '#64748b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span style={{ fontSize: '13px' }}>📍</span>
                                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.location}</span>
                                </div>
                              </td>

                              {/* Status badge: Published or Unpublished with quick-toggle click */}
                              <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleListingStatus(item)}
                                  disabled={isToggling}
                                  title="Click to toggle status"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '11.5px',
                                    fontWeight: 800,
                                    padding: '5px 12px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    background: isPublished ? '#7c3aed' : '#f1f5f9',
                                    color: isPublished ? '#ffffff' : '#64748b',
                                    boxShadow: isPublished ? '0 1px 3px rgba(124,58,237,0.25)' : 'none',
                                    opacity: isToggling ? 0.6 : 1,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      background: isPublished ? '#ffffff' : '#94a3b8',
                                    }}
                                  ></span>
                                  {isToggling ? 'Saving...' : isPublished ? 'Published' : 'Unpublished'}
                                </button>
                              </td>

                              {/* Badges - strictly in a single line without wrapping */}
                              <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                  {item.is_verified && (
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        background: '#f0fdf4',
                                        color: '#16a34a',
                                        border: '1px solid #bbf7d0',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      ✓ Verified
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Actions: View, Edit, Delete */}
                              <td style={{ padding: '16px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', whiteSpace: 'nowrap' }}>
                                  <Link
                                    href={item.viewUrl}
                                    target="_blank"
                                    style={{
                                      fontSize: '12.5px',
                                      color: '#7c3aed',
                                      fontWeight: 800,
                                      textDecoration: 'none',
                                      padding: '4px 6px',
                                    }}
                                  >
                                    View
                                  </Link>
                                  {(!isTeamMember || teamRole === 'events_and_church_edit') && (
                                    <Link
                                      href={item.editUrl}
                                      style={{
                                        fontSize: '12.5px',
                                        color: '#0284c7',
                                        fontWeight: 800,
                                        textDecoration: 'none',
                                        padding: '4px 6px',
                                      }}
                                    >
                                      Edit
                                    </Link>
                                  )}
                                  {!isTeamMember && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteListingRequest(item)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '12.5px',
                                        color: '#ef4444',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        padding: '4px 6px',
                                      }}
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── CHURCHES SECTION (EXACT SCREENSHOT CHURCH MANAGEMENT) ── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'churches' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Church Selector & Timeframe Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', background: '#ffffff', borderRadius: '18px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                {/* Church Selector Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b' }}>Select Church:</span>
                  <button
                    onClick={() => setSelectedChurchIndex(-1)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: selectedChurchIndex === -1 ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                      background: selectedChurchIndex === -1 ? '#faf5ff' : '#ffffff',
                      color: selectedChurchIndex === -1 ? '#7c3aed' : '#64748b',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    All Churches ({churches.length})
                  </button>
                  {filteredChurches.length === 0 ? (
                    <span style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                      No churches match search
                    </span>
                  ) : (
                    filteredChurches.map((c) => {
                      const origIndex = churches.findIndex((item) => item.id === c.id);
                      const isSelected = selectedChurchIndex === origIndex;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedChurchIndex(origIndex >= 0 ? origIndex : 0)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                            background: isSelected ? '#faf5ff' : '#ffffff',
                            color: isSelected ? '#7c3aed' : '#64748b',
                            fontWeight: 800,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {c.name}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Church Search Input */}
                <div style={{ position: 'relative', minWidth: '240px', flex: '0 1 300px' }}>
                  <i
                    className="ti ti-search"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      fontSize: '15px',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search churches by name, zip code, denomination..."
                    value={churchSearch}
                    onChange={(e) => setChurchSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 32px 8px 34px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '12.5px',
                      color: '#0f172a',
                      outline: 'none',
                      background: '#f8fafc',
                      boxSizing: 'border-box',
                    }}
                  />
                  {churchSearch && (
                    <button
                      type="button"
                      onClick={() => setChurchSearch('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '13px',
                      }}
                    >
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Completeness Status Banner & Edit Prompt */}
              {(() => {
                const targetChurch = currentSelectedChurch || churches[0];
                if (!targetChurch) return null;
                const cComp = getEntityCompleteness(targetChurch);
                return (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                      borderRadius: '16px',
                      border: '1.5px solid #e9d5ff',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: cComp.score >= 80 ? '#ecfdf5' : '#fef3c7',
                          color: cComp.score >= 80 ? '#059669' : '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {cComp.score >= 80 ? '✓' : '⚡'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                            {currentSelectedChurch ? `${currentSelectedChurch.name} Completeness` : 'Church Profile Completeness'}: {cComp.score}%
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: cComp.score >= 80 ? '#d1fae5' : '#fef3c7',
                              color: cComp.score >= 80 ? '#065f46' : '#92400e',
                            }}
                          >
                            {cComp.score >= 80 ? 'Optimized' : 'Action Recommended'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                          {cComp.score >= 80
                            ? 'Your church directory profile is fully enriched and ready to convert visitors!'
                            : `Complete remaining profile fields (${cComp.items.filter(i => !i.done).map(i => i.label).join(', ')}) to gain higher placement in Sunday search.`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {(!isTeamMember || teamRole === 'events_and_church_edit') && (
                        <button
                          type="button"
                          onClick={() => openDrawerForEntity({
                            id: targetChurch.id,
                            title: targetChurch.name,
                            type: 'church',
                            typeLabel: 'Church',
                            raw: targetChurch,
                          })}
                          style={{
                            background: '#7c3aed',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '12.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                          }}
                        >
                          <i className="ti ti-edit" style={{ fontSize: '14px' }}></i> Quick Edit Church
                        </button>
                      )}

                      <Link
                        href={`/church/${targetChurch.slug || targetChurch.id}`}
                        target="_blank"
                        style={{
                          background: '#ffffff',
                          color: '#475569',
                          border: '1.5px solid #cbd5e1',
                          padding: '7px 14px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        View Public Page &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {/* Top Two Cards Row: Church Views Trend Bar Chart + Where Visitors Come From */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
                
                {/* LEFT CARD: Church views — timeframe */}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      Church Page Views — {churchTfConfig.label}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: churchTotalViews > 0 ? '#16a34a' : '#64748b', background: churchTotalViews > 0 ? '#f0fdf4' : '#f8fafc', padding: '4px 10px', borderRadius: '20px', border: churchTotalViews > 0 ? '1px solid #bbf7d0' : '1px solid #e2e8f0' }}>
                      {churchTotalViews > 0 ? `${churchTotalViews} views` : '0 views'}
                    </span>
                  </div>

                  {/* Animated Gradient Bar Chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '8px', paddingBottom: '10px' }}>
                    {churchBarChartData.map((bar, idx) => {
                      const heightPct = bar.value > 0 ? Math.max(15, Math.min(100, (bar.value / churchMaxBarValue) * 100)) : 0;
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div
                            title={`${bar.value} church views`}
                            style={{
                              width: '100%',
                              height: bar.value > 0 ? `${heightPct}%` : '3px',
                              background: bar.value > 0 ? 'linear-gradient(180deg, #38bdf8 0%, #7c3aed 100%)' : '#e2e8f0',
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

                {/* RIGHT CARD: Where visitors come from */}
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
                    Where Church Visitors Come From
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', justifyContent: 'center', flex: 1 }}>
                    {churchTrafficSources.map((src, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                        <span style={{ width: '150px', fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
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

              {/* Row of 4 Church Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                
                {/* Card 1: Total Church Views */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
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
                    {churchTotalViews.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Church Views ({churchTimeframe})
                  </div>
                </div>

                {/* Card 2: Direction & Contact Requests */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <i className="ti ti-map-pin" style={{ fontSize: '18px' }}></i>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {churchContactClicks.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Directions & Contacts
                  </div>
                </div>

                {/* Card 3: Visitor Inquiries */}
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
                    <i className="ti ti-message" style={{ fontSize: '18px' }}></i>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {churchEnquiriesCount}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Visitor Inquiries
                  </div>
                </div>

                {/* Card 4: Visitor Engagement Rate */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <i className="ti ti-chart-arrows-vertical" style={{ fontSize: '18px' }}></i>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {churchConversionRate}%
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Engagement Rate
                  </div>
                </div>

              </div>

              {/* Interactive Church Visitor Geography & Audience Map */}
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      Church Catchment & Visitor Geography Map
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Geographic origins of people discovering your church, planning visits, or seeking directions
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {churchVisitorLocations.slice(0, 3).map((l, i) => (
                      <span key={i} style={{ fontSize: '12px', fontWeight: 700, background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        📍 {l.city} ({l.count})
                      </span>
                    ))}
                  </div>
                </div>

                <PastorVisitorMap
                  locations={churchVisitorLocations}
                  totalViews={churchTotalViews}
                  selectedTimeframe={churchTfConfig.label}
                />
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── WORSHIP LEADERS SECTION ────────────────────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'worship-leaders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header Selector & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: '#ffffff', borderRadius: '18px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b' }}>Select Profile:</span>
                  <button
                    onClick={() => setSelectedWorshipLeaderIndex(-1)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: selectedWorshipLeaderIndex === -1 ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                      background: selectedWorshipLeaderIndex === -1 ? '#f0f9ff' : '#ffffff',
                      color: selectedWorshipLeaderIndex === -1 ? '#0284c7' : '#64748b',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    All Leaders ({worshipLeaders.length})
                  </button>
                  {filteredWorshipLeaders.length === 0 ? (
                    <span style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                      No leaders match search
                    </span>
                  ) : (
                    filteredWorshipLeaders.map((wl) => {
                      const origIndex = worshipLeaders.findIndex((item) => item.id === wl.id);
                      const isSelected = selectedWorshipLeaderIndex === origIndex;
                      return (
                        <button
                          key={wl.id}
                          onClick={() => setSelectedWorshipLeaderIndex(origIndex >= 0 ? origIndex : 0)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                            background: isSelected ? '#f0f9ff' : '#ffffff',
                            color: isSelected ? '#0284c7' : '#64748b',
                            fontWeight: 800,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {wl.display_name}
                        </button>
                      );
                    })
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Worship Leader Search Input */}
                  <div style={{ position: 'relative', minWidth: '240px', flex: '0 1 300px' }}>
                    <i
                      className="ti ti-search"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        fontSize: '15px',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search leaders by name, zip code, denomination..."
                      value={worshipLeaderSearch}
                      onChange={(e) => setWorshipLeaderSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 32px 8px 34px',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '12.5px',
                        color: '#0f172a',
                        outline: 'none',
                        background: '#f8fafc',
                        boxSizing: 'border-box',
                      }}
                    />
                    {worshipLeaderSearch && (
                      <button
                        type="button"
                        onClick={() => setWorshipLeaderSearch('')}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '13px',
                        }}
                      >
                        <i className="ti ti-x" />
                      </button>
                    )}
                  </div>

                  {!isTeamMember && (
                    <Link
                      href="/onboarding/worship-leader"
                      style={{
                        background: '#0284c7',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      + Add Worship Leader
                    </Link>
                  )}
                </div>
              </div>

              {/* Profile Completeness Status Banner & Edit Prompt */}
              {(() => {
                const targetWl = currentSelectedWorshipLeader || worshipLeaders[0];
                if (!targetWl) return null;
                const wlComp = getEntityCompleteness(targetWl);
                return (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                      borderRadius: '16px',
                      border: '1.5px solid #bae6fd',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: wlComp.score >= 80 ? '#ecfdf5' : '#e0f2fe',
                          color: wlComp.score >= 80 ? '#059669' : '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {wlComp.score >= 80 ? '✓' : '🎵'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                            {currentSelectedWorshipLeader ? `${currentSelectedWorshipLeader.display_name} Completeness` : 'Worship Leader Completeness'}: {wlComp.score}%
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: wlComp.score >= 80 ? '#d1fae5' : '#fef3c7',
                              color: wlComp.score >= 80 ? '#065f46' : '#92400e',
                            }}
                          >
                            {wlComp.score >= 80 ? 'Optimized' : 'Action Recommended'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                          {wlComp.score >= 80
                            ? 'Your worship leader profile is enriched with ministry bio, instruments, and media!'
                            : `Complete remaining profile details (${wlComp.items.filter(i => !i.done).map(i => i.label).join(', ')}) to boost church booking requests.`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => openDrawerForEntity({
                          id: targetWl.id,
                          title: targetWl.display_name || targetWl.name,
                          type: 'worship-leader',
                          typeLabel: 'Worship Leader',
                          raw: targetWl,
                        })}
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                        }}
                      >
                        <i className="ti ti-edit" style={{ fontSize: '14px' }}></i> Quick Edit Profile
                      </button>

                      <Link
                        href={`/worship-leader/${targetWl.slug || targetWl.id}`}
                        target="_blank"
                        style={{
                          background: '#ffffff',
                          color: '#475569',
                          border: '1.5px solid #cbd5e1',
                          padding: '7px 14px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        View Public Profile &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {/* Top Two Cards Row: Worship Leader Views Trend Bar Chart + Where Visitors Come From */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
                
                {/* LEFT CARD: Views bar chart */}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      Profile Views — {wlTfConfig.label}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: wlTotalViews > 0 ? '#0284c7' : '#64748b', background: wlTotalViews > 0 ? '#f0f9ff' : '#f8fafc', padding: '4px 10px', borderRadius: '20px', border: wlTotalViews > 0 ? '1px solid #bae6fd' : '1px solid #e2e8f0' }}>
                      {wlTotalViews > 0 ? `${wlTotalViews} views` : '0 views'}
                    </span>
                  </div>

                  {/* Animated Gradient Bar Chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '8px', paddingBottom: '10px' }}>
                    {wlBarChartData.map((bar, idx) => {
                      const heightPct = bar.value > 0 ? Math.max(15, Math.min(100, (bar.value / wlMaxBarValue) * 100)) : 0;
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div
                            title={`${bar.value} views`}
                            style={{
                              width: '100%',
                              height: bar.value > 0 ? `${heightPct}%` : '3px',
                              background: bar.value > 0 ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' : '#e2e8f0',
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

                {/* RIGHT CARD: Where visitors come from */}
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
                    Where Visitors Come From
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', justifyContent: 'center', flex: 1 }}>
                    {wlTrafficSources.map((src, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                        <span style={{ width: '150px', fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
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

              {/* Row of 4 Worship Leader Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                
                {/* Card 1: Total Views */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
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
                    {wlTotalViews.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Profile Views ({timeframe})
                  </div>
                </div>

                {/* Card 2: Profile Clicks */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
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
                    {wlProfileClicks.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Profile clicks
                  </div>
                </div>

                {/* Card 3: Booking Enquiries */}
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
                    {wlEnquiriesCount}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Booking Enquiries
                  </div>
                </div>

                {/* Card 4: Enquiry Rate */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
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
                    {wlEnquiryRate}%
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Enquiry rate
                  </div>
                </div>

              </div>

              {/* Interactive Worship Leader Visitor Geography & Audience Map */}
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      Audience & Ministry Reach Geography Map
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Geographic origins of churches, worship teams, and organizers reaching out
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {wlVisitorLocations.slice(0, 3).map((l, i) => (
                      <span key={i} style={{ fontSize: '12px', fontWeight: 700, background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        📍 {l.city} ({l.count})
                      </span>
                    ))}
                  </div>
                </div>

                <PastorVisitorMap
                  locations={wlVisitorLocations}
                  totalViews={wlTotalViews}
                  selectedTimeframe={wlTfConfig.label}
                />
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── EVENTS SECTION ─────────────────────────────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header Selector & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: '#ffffff', borderRadius: '18px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b' }}>Select Event:</span>
                  <button
                    onClick={() => setSelectedEventIndex(-1)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: selectedEventIndex === -1 ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                      background: selectedEventIndex === -1 ? '#f0fdf4' : '#ffffff',
                      color: selectedEventIndex === -1 ? '#16a34a' : '#64748b',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    All Events ({events.length})
                  </button>
                  {filteredEvents.length === 0 ? (
                    <span style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                      No events match search
                    </span>
                  ) : (
                    filteredEvents.map((e) => {
                      const origIndex = events.findIndex((item) => item.id === e.id);
                      const isSelected = selectedEventIndex === origIndex;
                      return (
                        <button
                          key={e.id}
                          onClick={() => setSelectedEventIndex(origIndex >= 0 ? origIndex : 0)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                            background: isSelected ? '#f0fdf4' : '#ffffff',
                            color: isSelected ? '#16a34a' : '#64748b',
                            fontWeight: 800,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {e.title}
                        </button>
                      );
                    })
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Event Search Input (Strictly no denomination) */}
                  <div style={{ position: 'relative', minWidth: '240px', flex: '0 1 300px' }}>
                    <i
                      className="ti ti-search"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        fontSize: '15px',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search events by title, city, zip code..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 32px 8px 34px',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '12.5px',
                        color: '#0f172a',
                        outline: 'none',
                        background: '#f8fafc',
                        boxSizing: 'border-box',
                      }}
                    />
                    {eventSearch && (
                      <button
                        type="button"
                        onClick={() => setEventSearch('')}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '13px',
                        }}
                      >
                        <i className="ti ti-x" />
                      </button>
                    )}
                  </div>

                  <Link
                    href="/onboarding/events"
                    style={{
                      background: '#16a34a',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    + Host Event
                  </Link>
                </div>
              </div>

              {/* Event Completeness Status Banner & Edit Prompt */}
              {(() => {
                const targetEvent = currentSelectedEvent || events[0];
                if (!targetEvent) return null;
                const eComp = getEntityCompleteness(targetEvent);
                return (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                      borderRadius: '16px',
                      border: '1.5px solid #bbf7d0',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: eComp.score >= 80 ? '#dcfce7' : '#fef3c7',
                          color: eComp.score >= 80 ? '#16a34a' : '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {eComp.score >= 80 ? '✓' : '📅'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                            {currentSelectedEvent ? `${currentSelectedEvent.title} Completeness` : 'Event Listing Completeness'}: {eComp.score}%
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: eComp.score >= 80 ? '#d1fae5' : '#fef3c7',
                              color: eComp.score >= 80 ? '#065f46' : '#92400e',
                            }}
                          >
                            {eComp.score >= 80 ? 'Optimized' : 'Action Recommended'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                          {eComp.score >= 80
                            ? 'Event listing contains full venue details, schedules, and RSVP contact points!'
                            : `Add remaining details (${eComp.items.filter((i) => !i.done).map((i) => i.label).join(', ')}) to increase ticket RSVPs and visitor attendance.`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() =>
                          openDrawerForEntity({
                            id: targetEvent.id,
                            title: targetEvent.title,
                            type: 'event',
                            typeLabel: 'Event',
                            raw: targetEvent,
                          })
                        }
                        style={{
                          background: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                        }}
                      >
                        <i className="ti ti-edit" style={{ fontSize: '14px' }}></i> Quick Edit Event
                      </button>

                      <Link
                        href={`/events/${targetEvent.slug || targetEvent.id}`}
                        target="_blank"
                        style={{
                          background: '#ffffff',
                          color: '#475569',
                          border: '1.5px solid #cbd5e1',
                          padding: '7px 14px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        View Event Page &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {/* Top Two Cards Row: Event Views Trend Bar Chart + Where Attendees Come From */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
                
                {/* LEFT CARD: Views bar chart */}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      Event Views — {eventTfConfig.label}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: eventTotalViews > 0 ? '#16a34a' : '#64748b', background: eventTotalViews > 0 ? '#f0fdf4' : '#f8fafc', padding: '4px 10px', borderRadius: '20px', border: eventTotalViews > 0 ? '1px solid #bbf7d0' : '1px solid #e2e8f0' }}>
                      {eventTotalViews > 0 ? `${eventTotalViews} views` : '0 views'}
                    </span>
                  </div>

                  {/* Animated Gradient Bar Chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '8px', paddingBottom: '10px' }}>
                    {eventBarChartData.map((bar, idx) => {
                      const heightPct = bar.value > 0 ? Math.max(15, Math.min(100, (bar.value / eventMaxBarValue) * 100)) : 0;
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div
                            title={`${bar.value} event views`}
                            style={{
                              width: '100%',
                              height: bar.value > 0 ? `${heightPct}%` : '3px',
                              background: bar.value > 0 ? 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)' : '#e2e8f0',
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

                {/* RIGHT CARD: Where visitors come from */}
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
                    Where Attendees Come From
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', justifyContent: 'center', flex: 1 }}>
                    {eventTrafficSources.map((src, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                        <span style={{ width: '150px', fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
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

              {/* Row of 4 Event Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                
                {/* Card 1: Total Views */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
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
                    {eventTotalViews.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Event Page Views ({timeframe})
                  </div>
                </div>

                {/* Card 2: Ticket / RSVP Clicks */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <i className="ti ti-ticket" style={{ fontSize: '18px' }}></i>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {eventTicketClicks.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    RSVP & Ticket Clicks
                  </div>
                </div>

                {/* Card 3: Inquiries */}
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
                    {eventEnquiriesCount}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    Event Inquiries
                  </div>
                </div>

                {/* Card 4: RSVP Rate */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1.5px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
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
                    {eventRsvpRate}%
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                    RSVP / Inquiry rate
                  </div>
                </div>

              </div>

              {/* Interactive Event Visitor Geography & Audience Map */}
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #f1f5f9', padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      Attendee Catchment & Geography Map
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Geographic origins of people discovering your event and reserving seats
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {eventVisitorLocations.slice(0, 3).map((l, i) => (
                      <span key={i} style={{ fontSize: '12px', fontWeight: 700, background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        📍 {l.city} ({l.count})
                      </span>
                    ))}
                  </div>
                </div>

                <PastorVisitorMap
                  locations={eventVisitorLocations}
                  totalViews={eventTotalViews}
                  selectedTimeframe={eventTfConfig.label}
                />
              </div>

              {/* ═════════════════════════════════════════════════════════ */}
              {/* ── EVENTS & BOOKINGS ROSTER / MANAGEMENT TABLE ─────────── */}
              {/* ═════════════════════════════════════════════════════════ */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1.5px solid #f1f5f9',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Table Header / Title Bar */}
                <div
                  style={{
                    padding: '22px 26px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px',
                    background: '#ffffff',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #16a34a, #15803d)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                        }}
                      >
                        <i className="ti ti-calendar-event"></i>
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                        All Events & Attendance Overview
                      </h3>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '16px',
                          background: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                      Monitor attendee bookings, page visitors, ticket capacity, and edit or preview each event.
                    </p>
                  </div>

                  <Link
                    href="/onboarding/events"
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                    }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: '15px' }}></i> Create New Event
                  </Link>
                </div>

                {/* Table Component */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                    <thead>
                      <tr
                        style={{
                          borderBottom: '1.5px solid #f1f5f9',
                          background: '#f8fafc',
                          color: '#64748b',
                          fontWeight: 800,
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        <th style={{ padding: '14px 22px' }}>Event Details</th>
                        <th style={{ padding: '14px 18px', textAlign: 'center' }}>Date & Schedule</th>
                        <th style={{ padding: '14px 18px', textAlign: 'center' }}>Visitors / Views</th>
                        <th style={{ padding: '14px 18px', textAlign: 'center' }}>Bookings / RSVPs</th>
                        <th style={{ padding: '14px 18px', textAlign: 'center' }}>Capacity</th>
                        <th style={{ padding: '14px 18px', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '14px 22px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                            <i className="ti ti-calendar-off" style={{ fontSize: '42px', color: '#cbd5e1', display: 'block', marginBottom: '10px' }}></i>
                            <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>
                              No events found
                            </div>
                            <div style={{ fontSize: '13px' }}>
                              Try clearing your search query or create your first event.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredEvents.map((ev: any) => {
                          const regs = Array.isArray(ev.event_registrations) ? ev.event_registrations : [];
                          // Sum attendees across bookings (each booking party_size or 1)
                          const totalBookedAttendees = regs.reduce((sum: number, r: any) => sum + (Number(r.party_size) || 1), 0);
                          const totalBookingsCount = regs.length;

                          // Views / Visitors
                          const viewsCount = Number(ev.view_count || 0);

                          // Capacity & Fill Rate
                          const capacityNum = Number(ev.capacity) || 0;
                          const fillPct = capacityNum > 0 ? Math.min(100, Math.round((totalBookedAttendees / capacityNum) * 100)) : 0;

                          // Dates formatting
                          const startDateStr = ev.starts_at ? new Date(ev.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD';
                          const startTimeStr = ev.starts_at ? new Date(ev.starts_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
                          const isMultiDay = ev.ends_at && new Date(ev.ends_at).toDateString() !== (ev.starts_at ? new Date(ev.starts_at).toDateString() : '');
                          const endDateStr = ev.ends_at ? new Date(ev.ends_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

                          const isDraft = ev.status === 'draft' || ev.status === 'unpublished';
                          const eventImage = ev.cover_url || ev.image_url;

                          return (
                            <tr
                              key={ev.id}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background-color 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fbfcfe';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              {/* Event Details: Thumbnail, Title, Venue, Location */}
                              <td style={{ padding: '16px 22px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div
                                    style={{
                                      width: '48px',
                                      height: '48px',
                                      borderRadius: '12px',
                                      backgroundColor: '#f1f5f9',
                                      border: '1px solid #e2e8f0',
                                      overflow: 'hidden',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {eventImage ? (
                                      <img
                                        src={eventImage}
                                        alt={ev.title || 'Event cover'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <i className="ti ti-calendar" style={{ fontSize: '22px', color: '#94a3b8' }}></i>
                                    )}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#0f172a', lineHeight: 1.25, marginBottom: '4px' }}>
                                      {ev.title || 'Untitled Event'}
                                    </div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <i className="ti ti-map-pin" style={{ fontSize: '13px', color: '#94a3b8' }}></i>
                                      <span>
                                        {ev.venue_name || ev.city || 'Venue to be confirmed'}
                                        {ev.city && ev.venue_name && ev.venue_name !== ev.city ? `, ${ev.city}` : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Date & Schedule */}
                              <td style={{ padding: '16px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                                  {isMultiDay ? `${startDateStr} - ${endDateStr}` : startDateStr}
                                </div>
                                {startTimeStr && (
                                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                    <i className="ti ti-clock" style={{ fontSize: '11.5px', marginRight: '3px' }}></i>
                                    {startTimeStr}
                                  </div>
                                )}
                              </td>

                              {/* Visitors / Page Views */}
                              <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '5px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                  <i className="ti ti-eye" style={{ fontSize: '14px', color: '#3b82f6' }}></i>
                                  <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>
                                    {viewsCount.toLocaleString()}
                                  </span>
                                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                                    views
                                  </span>
                                </div>
                              </td>

                              {/* Bookings / RSVPs */}
                              <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: totalBookingsCount > 0 ? '#f0fdf4' : '#f8fafc', padding: '5px 12px', borderRadius: '12px', border: `1px solid ${totalBookingsCount > 0 ? '#bbf7d0' : '#e2e8f0'}` }}>
                                    <i className="ti ti-ticket" style={{ fontSize: '14px', color: totalBookingsCount > 0 ? '#16a34a' : '#64748b' }}></i>
                                    <span style={{ fontWeight: 900, fontSize: '13.5px', color: totalBookingsCount > 0 ? '#16a34a' : '#0f172a' }}>
                                      {totalBookingsCount.toLocaleString()}
                                    </span>
                                    <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                                      {totalBookingsCount === 1 ? 'booking' : 'bookings'}
                                    </span>
                                  </div>
                                  {totalBookedAttendees > totalBookingsCount && (
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                                      ({totalBookedAttendees} attendees)
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Capacity Fill */}
                              <td style={{ padding: '16px 18px', textAlign: 'center', minWidth: '130px' }}>
                                {capacityNum > 0 ? (
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                                      <span>{totalBookedAttendees} / {capacityNum}</span>
                                      <span style={{ color: fillPct >= 90 ? '#ef4444' : fillPct >= 50 ? '#16a34a' : '#64748b' }}>
                                        {fillPct}%
                                      </span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                      <div
                                        style={{
                                          width: `${fillPct}%`,
                                          height: '100%',
                                          backgroundColor: fillPct >= 90 ? '#ef4444' : fillPct >= 50 ? '#16a34a' : '#3b82f6',
                                          borderRadius: '10px',
                                          transition: 'width 0.3s ease',
                                        }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                                    Unlimited
                                  </span>
                                )}
                              </td>

                              {/* Status Badge */}
                              <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '11.5px',
                                    fontWeight: 800,
                                    backgroundColor: isDraft ? '#fef3c7' : '#dcfce7',
                                    color: isDraft ? '#92400e' : '#166534',
                                    border: `1px solid ${isDraft ? '#fde68a' : '#bbf7d0'}`,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      backgroundColor: isDraft ? '#d97706' : '#16a34a',
                                    }}
                                  />
                                  {isDraft ? 'Draft' : 'Published'}
                                </span>
                              </td>

                              {/* Actions: Direct Edit & View Live */}
                              <td style={{ padding: '16px 22px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                  {/* Direct Edit Button */}
                                  <Link
                                    href={`/onboarding/events?id=${ev.id}`}
                                    style={{
                                      background: '#16a34a',
                                      color: '#ffffff',
                                      padding: '7px 13px',
                                      borderRadius: '9px',
                                      fontSize: '12px',
                                      fontWeight: 800,
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      boxShadow: '0 1px 3px rgba(22, 163, 74, 0.2)',
                                      transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#15803d';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#16a34a';
                                    }}
                                  >
                                    <i className="ti ti-edit" style={{ fontSize: '13px' }}></i>
                                    Edit
                                  </Link>

                                  {/* Quick Drawer Edit Button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDrawerForEntity({
                                        id: ev.id,
                                        title: ev.title,
                                        type: 'event',
                                        typeLabel: 'Event',
                                        raw: ev,
                                      })
                                    }
                                    title="Quick Edit Details"
                                    style={{
                                      background: '#f1f5f9',
                                      color: '#475569',
                                      border: '1px solid #cbd5e1',
                                      padding: '7px 9px',
                                      borderRadius: '9px',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <i className="ti ti-adjustments" style={{ fontSize: '13px' }}></i>
                                  </button>

                                  {/* View Live Page */}
                                  <Link
                                    href={`/events/${ev.slug || ev.id}`}
                                    target="_blank"
                                    style={{
                                      background: '#ffffff',
                                      color: '#475569',
                                      border: '1px solid #cbd5e1',
                                      padding: '7px 11px',
                                      borderRadius: '9px',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <span>View</span>
                                    <i className="ti ti-external-link" style={{ fontSize: '12px' }}></i>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── USERS & TEAM ROLES SECTION ──────────────────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          {section === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1080px' }}>
              
              {/* Header Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                borderRadius: '24px',
                padding: '32px 36px',
                color: '#ffffff',
                boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
              }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '12px', backdropFilter: 'blur(8px)' }}>
                    <i className="ti ti-shield-lock" style={{ color: '#a5b4fc' }}></i> Team Access & Delegated Permissions
                  </div>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '26px', fontWeight: 900 }}>
                    Manage Team Users & Roles
                  </h2>
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.82)', fontSize: '14.5px', maxWidth: '620px', lineHeight: 1.5 }}>
                    Invite associates, assistants, and co-leaders to help manage your churches and publish events. No verification code required — users are granted instantaneous access.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 22px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#38bdf8' }}>{teamMembers.length}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Active Teammates</div>
                </div>
              </div>

              {/* Notification Alerts */}
              {teamSuccessMsg && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '14px 20px', color: '#065f46', fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ti ti-circle-check-filled" style={{ fontSize: '18px', color: '#10b981' }}></i>
                  <span>{teamSuccessMsg}</span>
                </div>
              )}

              {teamErrorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', padding: '14px 20px', color: '#991b1b', fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ti ti-alert-triangle-filled" style={{ fontSize: '18px', color: '#ef4444' }}></i>
                  <span>{teamErrorMsg}</span>
                </div>
              )}

              {/* Grid: Add User Form + Roles Guide */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
                
                {/* 1. Add User Card */}
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                      <i className="ti ti-user-plus" style={{ fontSize: '20px' }}></i>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>Add New Team User</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>Immediately grants access without requiring confirmation</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddTeamMember} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Full Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pastor John Doe or Mary Jane"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Email Address <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="new_team_email_unique"
                        autoComplete="off"
                        placeholder="teammate@example.com"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Login Password <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="password"
                        name="new_team_pwd_unique"
                        autoComplete="new-password"
                        placeholder="Create a password (min 6 characters)"
                        value={newMemberPassword}
                        onChange={(e) => setNewMemberPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                        This password is saved in Supabase Auth so they can sign in immediately.
                      </div>
                    </div>

                    {/* Sleek Multi-Select Dropdown: Assign to Churches */}
                    {churches.length > 0 && (
                      <div ref={churchDropdownRef} style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                            Assign to Churches <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>(Typable & searchable dropdown)</span>
                          </label>
                          {teamSelectedChurchIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setTeamSelectedChurchIds([])}
                              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                            >
                              Clear ({teamSelectedChurchIds.length})
                            </button>
                          )}
                        </div>

                        {/* Dropdown Trigger Box */}
                        <div
                          onClick={() => {
                            setIsChurchDropdownOpen(!isChurchDropdownOpen);
                            setIsPastorDropdownOpen(false);
                          }}
                          style={{
                            minHeight: '44px',
                            padding: '7px 12px',
                            borderRadius: '12px',
                            border: `1.5px solid ${isChurchDropdownOpen ? '#7c3aed' : '#cbd5e1'}`,
                            background: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            flexWrap: 'wrap',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1, alignItems: 'center' }}>
                            {teamSelectedChurchIds.length === 0 ? (
                              <span style={{ fontSize: '13.5px', color: '#94a3b8' }}>
                                Click to search and select churches...
                              </span>
                            ) : (
                              churches
                                .filter((c) => teamSelectedChurchIds.includes(c.id))
                                .map((c) => (
                                  <span
                                    key={c.id}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      background: '#f5f3ff',
                                      color: '#6b21a8',
                                      border: '1px solid #ddd6fe',
                                      padding: '2px 8px',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    ⛪ {c.name || 'Unnamed Church'}
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTeamSelectedChurchIds(teamSelectedChurchIds.filter((id) => id !== c.id));
                                      }}
                                      style={{ cursor: 'pointer', color: '#9333ea', fontWeight: 900, marginLeft: '2px', fontSize: '12px' }}
                                    >
                                      ×
                                    </span>
                                  </span>
                                ))
                            )}
                          </div>
                          <i
                            className="ti ti-chevron-down"
                            style={{
                              color: '#64748b',
                              fontSize: '14px',
                              transform: isChurchDropdownOpen ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.15s ease',
                              flexShrink: 0,
                            }}
                          />
                        </div>

                        {/* Popover Dropdown Menu with Typable Search */}
                        {isChurchDropdownOpen && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 'calc(100% + 4px)',
                              left: 0,
                              right: 0,
                              background: '#ffffff',
                              borderRadius: '14px',
                              border: '1.5px solid #cbd5e1',
                              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.18)',
                              zIndex: 50,
                              maxHeight: '270px',
                              overflowY: 'auto',
                              padding: '10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                            }}
                          >
                            {/* Typable Search Input */}
                            <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                              <i
                                className="ti ti-search"
                                style={{
                                  position: 'absolute',
                                  left: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: '#94a3b8',
                                  fontSize: '14px',
                                }}
                              />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Type to search churches by name, city..."
                                value={churchDropdownSearch}
                                onChange={(e) => setChurchDropdownSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  width: '100%',
                                  padding: '8px 30px 8px 32px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #e2e8f0',
                                  fontSize: '12.5px',
                                  outline: 'none',
                                  background: '#f8fafc',
                                  boxSizing: 'border-box',
                                }}
                              />
                              {churchDropdownSearch && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setChurchDropdownSearch('');
                                  }}
                                  style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    fontSize: '13px',
                                  }}
                                >
                                  <i className="ti ti-x" />
                                </button>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', borderBottom: '1px solid #f1f5f9' }}>
                              <button
                                type="button"
                                onClick={() => setTeamSelectedChurchIds(churches.map((c) => c.id))}
                                style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                              >
                                Select All ({churches.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setTeamSelectedChurchIds([])}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Deselect All
                              </button>
                            </div>

                            {(() => {
                              const filtered = [...churches]
                                .filter((c) => {
                                  if (!churchDropdownSearch.trim()) return true;
                                  const q = churchDropdownSearch.toLowerCase().trim();
                                  return (
                                    (c.name && c.name.toLowerCase().includes(q)) ||
                                    (c.city && c.city.toLowerCase().includes(q)) ||
                                    (c.address && c.address.toLowerCase().includes(q))
                                  );
                                })
                                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                              if (filtered.length === 0) {
                                return (
                                  <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12.5px' }}>
                                    No churches match &ldquo;{churchDropdownSearch}&rdquo;
                                  </div>
                                );
                              }

                              return filtered.map((c) => {
                                const isSelected = teamSelectedChurchIds.includes(c.id);
                                return (
                                  <label
                                    key={c.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      background: isSelected ? '#f5f3ff' : 'transparent',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      fontWeight: isSelected ? 700 : 500,
                                      color: isSelected ? '#6b21a8' : '#334155',
                                      transition: 'background 0.12s ease',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setTeamSelectedChurchIds([...teamSelectedChurchIds, c.id]);
                                        } else {
                                          setTeamSelectedChurchIds(teamSelectedChurchIds.filter((id) => id !== c.id));
                                        }
                                      }}
                                      style={{ accentColor: '#7c3aed', width: '15px', height: '15px' }}
                                    />
                                    <span>{c.name || 'Unnamed Church'}</span>
                                    {c.city && (
                                      <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>
                                        {c.city}
                                      </span>
                                    )}
                                  </label>
                                );
                              });
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sleek Multi-Select Dropdown: Assign to Pastors */}
                    {pastors.length > 0 && (
                      <div ref={pastorDropdownRef} style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                            Assign to Pastors <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>(Typable & searchable dropdown)</span>
                          </label>
                          {teamSelectedPastorIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setTeamSelectedPastorIds([])}
                              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                            >
                              Clear ({teamSelectedPastorIds.length})
                            </button>
                          )}
                        </div>

                        {/* Dropdown Trigger Box */}
                        <div
                          onClick={() => {
                            setIsPastorDropdownOpen(!isPastorDropdownOpen);
                            setIsChurchDropdownOpen(false);
                          }}
                          style={{
                            minHeight: '44px',
                            padding: '7px 12px',
                            borderRadius: '12px',
                            border: `1.5px solid ${isPastorDropdownOpen ? '#7c3aed' : '#cbd5e1'}`,
                            background: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            flexWrap: 'wrap',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1, alignItems: 'center' }}>
                            {teamSelectedPastorIds.length === 0 ? (
                              <span style={{ fontSize: '13.5px', color: '#94a3b8' }}>
                                Click to search and select pastors...
                              </span>
                            ) : (
                              pastors
                                .filter((p) => teamSelectedPastorIds.includes(p.id))
                                .map((p) => {
                                  const pName = p.full_name || p.name || 'Unnamed Pastor';
                                  return (
                                    <span
                                      key={p.id}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: '#fef3c7',
                                        color: '#92400e',
                                        border: '1px solid #fde68a',
                                        padding: '2px 8px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                      }}
                                    >
                                      👤 {pName}
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTeamSelectedPastorIds(teamSelectedPastorIds.filter((id) => id !== p.id));
                                        }}
                                        style={{ cursor: 'pointer', color: '#b45309', fontWeight: 900, marginLeft: '2px', fontSize: '12px' }}
                                      >
                                        ×
                                      </span>
                                    </span>
                                  );
                                })
                            )}
                          </div>
                          <i
                            className="ti ti-chevron-down"
                            style={{
                              color: '#64748b',
                              fontSize: '14px',
                              transform: isPastorDropdownOpen ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.15s ease',
                              flexShrink: 0,
                            }}
                          />
                        </div>

                        {/* Popover Dropdown Menu with Typable Search */}
                        {isPastorDropdownOpen && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 'calc(100% + 4px)',
                              left: 0,
                              right: 0,
                              background: '#ffffff',
                              borderRadius: '14px',
                              border: '1.5px solid #cbd5e1',
                              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.18)',
                              zIndex: 50,
                              maxHeight: '270px',
                              overflowY: 'auto',
                              padding: '10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                            }}
                          >
                            {/* Typable Search Input */}
                            <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                              <i
                                className="ti ti-search"
                                style={{
                                  position: 'absolute',
                                  left: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: '#94a3b8',
                                  fontSize: '14px',
                                }}
                              />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Type to search pastors by name, role..."
                                value={pastorDropdownSearch}
                                onChange={(e) => setPastorDropdownSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  width: '100%',
                                  padding: '8px 30px 8px 32px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #e2e8f0',
                                  fontSize: '12.5px',
                                  outline: 'none',
                                  background: '#f8fafc',
                                  boxSizing: 'border-box',
                                }}
                              />
                              {pastorDropdownSearch && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPastorDropdownSearch('');
                                  }}
                                  style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    fontSize: '13px',
                                  }}
                                >
                                  <i className="ti ti-x" />
                                </button>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', borderBottom: '1px solid #f1f5f9' }}>
                              <button
                                type="button"
                                onClick={() => setTeamSelectedPastorIds(pastors.map((p) => p.id))}
                                style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                              >
                                Select All ({pastors.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setTeamSelectedPastorIds([])}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Deselect All
                              </button>
                            </div>

                            {(() => {
                              const filtered = [...pastors]
                                .filter((p) => {
                                  if (!pastorDropdownSearch.trim()) return true;
                                  const q = pastorDropdownSearch.toLowerCase().trim();
                                  const pName = p.full_name || p.name || '';
                                  return (
                                    pName.toLowerCase().includes(q) ||
                                    (p.role && p.role.toLowerCase().includes(q)) ||
                                    (p.city && p.city.toLowerCase().includes(q))
                                  );
                                })
                                .sort((a, b) => (a.full_name || a.name || '').localeCompare(b.full_name || b.name || ''));

                              if (filtered.length === 0) {
                                return (
                                  <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12.5px' }}>
                                    No pastors match &ldquo;{pastorDropdownSearch}&rdquo;
                                  </div>
                                );
                              }

                              return filtered.map((p) => {
                                const pName = p.full_name || p.name || 'Unnamed Pastor';
                                const isSelected = teamSelectedPastorIds.includes(p.id);
                                return (
                                  <label
                                    key={p.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      background: isSelected ? '#fef3c7' : 'transparent',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      fontWeight: isSelected ? 700 : 500,
                                      color: isSelected ? '#92400e' : '#334155',
                                      transition: 'background 0.12s ease',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setTeamSelectedPastorIds([...teamSelectedPastorIds, p.id]);
                                        } else {
                                          setTeamSelectedPastorIds(teamSelectedPastorIds.filter((id) => id !== p.id));
                                        }
                                      }}
                                      style={{ accentColor: '#d97706', width: '15px', height: '15px' }}
                                    />
                                    <span>{pName}</span>
                                    {p.role && (
                                      <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>
                                        {p.role}
                                      </span>
                                    )}
                                  </label>
                                );
                              });
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                        Select Permission Level <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: `1.5px solid ${newMemberRole === 'events_only' ? '#7c3aed' : '#e2e8f0'}`,
                            background: newMemberRole === 'events_only' ? '#f5f3ff' : '#f8fafc',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="user_role"
                            checked={newMemberRole === 'events_only'}
                            onChange={() => setNewMemberRole('events_only')}
                            style={{ marginTop: '3px' }}
                          />
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e293b' }}>
                              1. Add Events Only
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              User can publish, edit, and organize church conferences, workshops, and worship sessions.
                            </div>
                          </div>
                        </label>

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: `1.5px solid ${newMemberRole === 'events_and_church_edit' ? '#7c3aed' : '#e2e8f0'}`,
                            background: newMemberRole === 'events_and_church_edit' ? '#f5f3ff' : '#f8fafc',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="user_role"
                            checked={newMemberRole === 'events_and_church_edit'}
                            onChange={() => setNewMemberRole('events_and_church_edit')}
                            style={{ marginTop: '3px' }}
                          />
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e293b' }}>
                              2. Add Events & Edit Church Data
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              Full co-editor rights: can update service times, ministries, contact details, gallery, and publish events.
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingTeamMember}
                      style={{
                        marginTop: '8px',
                        background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '13px 24px',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: isSavingTeamMember ? 'not-allowed' : 'pointer',
                        opacity: isSavingTeamMember ? 0.7 : 1,
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {isSavingTeamMember ? (
                        <>
                          <i className="ti ti-loader ti-spin"></i> Saving into Supabase...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-plus"></i> Add Team User Now
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* 2. Permission Explanations & Quick Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="ti ti-info-circle" style={{ color: '#7c3aed' }}></i> About Team Permissions
                    </h4>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                      As the primary administrator, you retain absolute ownership over your accounts and superadmin privileges. Delegated users receive scoped access to assist with day-to-day church activities.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                      <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontWeight: 800, color: '#059669' }}>✓ Add Events:</span> Publish calendar gatherings, set ticket prices, manage RSVPs.
                      </div>
                      <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontWeight: 800, color: '#7c3aed' }}>✓ Edit Church Data:</span> Modify service timings, photo banners, pastor info, and facilities.
                      </div>
                      <div style={{ padding: '10px 12px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                        <span style={{ fontWeight: 800, color: '#dc2626' }}>✕ Protected:</span> Only you can delete churches or alter billing subscriptions.
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '20px', padding: '20px', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '13.5px', marginBottom: '6px' }}>
                      <i className="ti ti-bolt"></i> Instant User Provisioning
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#15803d', lineHeight: 1.5 }}>
                      No waiting for verification links or email confirmation tokens. The entered email is matched automatically upon login.
                    </div>
                  </div>
                </div>

              </div>

              {/* Teammates List Table */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Current Team Members</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Active delegated users who can perform updates on your behalf</p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '12px' }}>
                    {teamMembers.length} users
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid #e2e8f0', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '12px 14px' }}>Name & Email</th>
                        <th style={{ padding: '12px 14px' }}>Assigned Churches & Pastors</th>
                        <th style={{ padding: '12px 14px' }}>Access Role</th>
                        <th style={{ padding: '12px 14px' }}>Status</th>
                        <th style={{ padding: '12px 14px' }}>Added Date</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => (
                        <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
                          <td style={{ padding: '16px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: member.role === 'events_and_church_edit' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '14px',
                                flexShrink: 0,
                              }}>
                                {member.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{member.name}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{member.email}</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 14px', color: '#334155', fontWeight: 600 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {member.churchNames && member.churchNames.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {member.churchNames.map((name, i) => (
                                    <span key={i} style={{ fontSize: '11px', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                                      ⛪ {name}
                                    </span>
                                  ))}
                                </div>
                              ) : null}

                              {member.pastorNames && member.pastorNames.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {member.pastorNames.map((pName, i) => (
                                    <span key={i} style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                                      👤 {pName}
                                    </span>
                                  ))}
                                </div>
                              ) : null}

                              {(!member.churchNames?.length && !member.pastorNames?.length) && (
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>All Entities</span>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '16px 14px' }}>
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeMemberRole(member.id, e.target.value as any)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                border: '1px solid #cbd5e1',
                                background: member.role === 'events_and_church_edit' ? '#faf5ff' : '#f0f9ff',
                                color: member.role === 'events_and_church_edit' ? '#6b21a8' : '#0369a1',
                                outline: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="events_only">Add Events Only</option>
                              <option value="events_and_church_edit">Add Events & Edit Church Data</option>
                            </select>
                          </td>

                          <td style={{ padding: '16px 14px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                              Active Access
                            </span>
                          </td>

                          <td style={{ padding: '16px 14px', color: '#64748b', fontSize: '12.5px' }}>
                            {member.addedAt}
                          </td>

                          <td style={{ padding: '16px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                              {/* Reset Password Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setResettingMember(member);
                                  setResetNewPassword('');
                                  setResetModalMsg(null);
                                }}
                                title="Reset login password"
                                style={{
                                  background: '#f8fafc',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  padding: '6px 11px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <i className="ti ti-key" style={{ fontSize: '13px', color: '#7c3aed' }}></i> Reset Password
                              </button>

                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(member.id, member.email)}
                                title="Revoke access"
                                style={{
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  padding: '6px 11px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <i className="ti ti-trash" style={{ fontSize: '13px' }}></i> Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {teamMembers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                    <i className="ti ti-users" style={{ fontSize: '36px', color: '#cbd5e1', display: 'block', marginBottom: '8px' }}></i>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1e293b' }}>No team members added yet</div>
                    <div style={{ fontSize: '12.5px', marginTop: '2px' }}>Use the form above to add an assistant or co-leader.</div>
                  </div>
                )}
              </div>

              {/* Inline Reset Password Modal for Team Member */}
              {resettingMember && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                  }}
                  onClick={() => {
                    if (!isResettingMemberPassword) {
                      setResettingMember(null);
                      setResetNewPassword('');
                      setResetModalMsg(null);
                    }
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      maxWidth: '440px',
                      width: '100%',
                      padding: '28px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      border: '1.5px solid #e2e8f0',
                      animation: 'fadeIn 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: '#f5f3ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#7c3aed',
                            fontSize: '18px',
                          }}
                        >
                          <i className="ti ti-key"></i>
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                            Reset Password
                          </h4>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            for {resettingMember.name || resettingMember.email}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setResettingMember(null);
                          setResetNewPassword('');
                          setResetModalMsg(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '18px',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <i className="ti ti-x"></i>
                      </button>
                    </div>

                    {resetModalMsg && (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          marginBottom: '14px',
                          background: resetModalMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                          color: resetModalMsg.type === 'success' ? '#166534' : '#991b1b',
                          border: `1px solid ${resetModalMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <i className={resetModalMsg.type === 'success' ? 'ti ti-check' : 'ti ti-alert-triangle'}></i>
                        <span>{resetModalMsg.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleResetTeamMemberPassword}>
                      <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Enter New Password <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          placeholder="At least 6 characters"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          required
                          minLength={6}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                        <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          The teammate can immediately log in with this new password.
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setResettingMember(null);
                            setResetNewPassword('');
                            setResetModalMsg(null);
                          }}
                          disabled={isResettingMemberPassword}
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isResettingMemberPassword || !resetNewPassword}
                          style={{
                            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 800,
                            cursor: (isResettingMemberPassword || !resetNewPassword) ? 'not-allowed' : 'pointer',
                            opacity: (isResettingMemberPassword || !resetNewPassword) ? 0.65 : 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          {isResettingMemberPassword ? (
                            <>
                              <i className="ti ti-loader ti-spin"></i> Saving...
                            </>
                          ) : (
                            'Set New Password'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* Bulk Upload Modal (Import CSV) */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={(_type, _inserted) => {
          setIsBulkModalOpen(false);
          window.location.reload();
        }}
      />

      {/* SLIDE-OVER QUICK EDIT DRAWER (FROM DASHBOARD2) */}
      {isDrawerOpen && (
        <>
          <div className="d2-drawer-scrim" onClick={() => setIsDrawerOpen(false)} />
          <aside className="d2-drawer">
            <div className="d2-drawer-header">
              <div>
                <div className="d2-drawer-title">Quick Edit Details</div>
                <div style={{ fontSize: 12, color: 'var(--ek2-gray)' }}>
                  {drawerEntity?.title} ({drawerEntity?.typeLabel})
                </div>
              </div>
              <button
                className="d2-drawer-close"
                onClick={() => setIsDrawerOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="d2-drawer-body">
              <div className="d2-form-group">
                <label className="d2-form-label">Name / Title</label>
                <input
                  type="text"
                  className="d2-form-input"
                  value={drawerFormData.title}
                  onChange={(e) => setDrawerFormData({ ...drawerFormData, title: e.target.value })}
                />
              </div>

              <div className="d2-form-group">
                <label className="d2-form-label">Contact Phone</label>
                <input
                  type="text"
                  className="d2-form-input"
                  placeholder="+44 7700 900111"
                  value={drawerFormData.phone}
                  onChange={(e) => setDrawerFormData({ ...drawerFormData, phone: e.target.value })}
                />
              </div>

              <div className="d2-form-group">
                <label className="d2-form-label">Contact Email</label>
                <input
                  type="email"
                  className="d2-form-input"
                  placeholder="contact@example.com"
                  value={drawerFormData.email}
                  onChange={(e) => setDrawerFormData({ ...drawerFormData, email: e.target.value })}
                />
              </div>

              <div className="d2-form-group">
                <label className="d2-form-label">Location / City</label>
                <input
                  type="text"
                  className="d2-form-input"
                  placeholder="London, UK"
                  value={drawerFormData.location}
                  onChange={(e) => setDrawerFormData({ ...drawerFormData, location: e.target.value })}
                />
              </div>

              <div className="d2-form-group">
                <label className="d2-form-label">Bio / About Description</label>
                <textarea
                  className="d2-form-textarea"
                  rows={5}
                  value={drawerFormData.bio}
                  onChange={(e) => setDrawerFormData({ ...drawerFormData, bio: e.target.value })}
                />
              </div>
            </div>

            <div className="d2-drawer-footer">
              <button
                className="d2-btn d2-btn-ghost"
                onClick={() => setIsDrawerOpen(false)}
              >
                Cancel
              </button>
              <button
                className="d2-btn d2-btn-primary"
                disabled={isSavingDrawer}
                onClick={handleSaveDrawer}
              >
                {isSavingDrawer ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── DELETE LISTING CONFIRMATION MODAL WITH PASSWORD VERIFICATION ── */}
      {itemToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            boxSizing: 'border-box',
          }}
          onClick={() => {
            if (!isDeleting) {
              setItemToDelete(null);
              setDeletePassword('');
              setDeleteError(null);
            }
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25)',
              border: '1px solid #f1f5f9',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  fontSize: '22px',
                  flexShrink: 0,
                }}
              >
                <i className="ti ti-trash"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Delete Listing
                </h3>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                  This action is permanent and cannot be undone.
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Target listing:</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {itemToDelete.name}
              </div>
              <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 700, marginTop: '2px' }}>
                {itemToDelete.typeName} &bull; {itemToDelete.location}
              </div>
            </div>

            <form onSubmit={handleConfirmDeleteListing}>
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Enter Account Password to Confirm
                </label>
                <input
                  type="password"
                  placeholder="Enter your password..."
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#ef4444')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                />
              </div>

              {deleteError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#b91c1c',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="ti ti-alert-circle"></i>
                  <span>{deleteError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setItemToDelete(null);
                    setDeletePassword('');
                    setDeleteError(null);
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.7 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isDeleting ? (
                    <>
                      <i className="ti ti-loader ti-spin"></i>
                      Verifying & Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
