"use client";

import React, { useState, useRef } from "react";
import StatsBar from "./StatsBar";
import ClientTabs from "./ClientTabs";
import OurTeamSection from "./OurTeamSection";
import BranchesSection from "./BranchesSection";
import ProfileContent from "./ProfileContent";
import SidebarContent from "./SidebarContent";
import AdminEditBar from "./AdminEditBar";
import HeroHeader from "./HeroHeader";
import VisitorBanner from "./VisitorBanner";
import ContactSection from "./ContactSection";
import NearbySection from "./NearbySection";
import GuidedTourModal from "./GuidedTourModal";

interface ChurchProfileClientProps {
  initialChurch: any;
  isEditing: boolean;
  twitterUrl?: string | null;
  tiktokUrl?: string | null;
  telegramUrl?: string | null;
  initialBranchesCount: number;
  initialNearbyChurches?: any[];
}

export default function ChurchProfileClient({
  initialChurch,
  isEditing,
  twitterUrl,
  tiktokUrl,
  telegramUrl,
  initialBranchesCount,
  initialNearbyChurches = [],
}: ChurchProfileClientProps) {
  // ── Single source of truth for all church data ──────────────
  const [church, setChurch] = useState(initialChurch);
  const [nearbyChurches, setNearbyChurches] = useState(initialNearbyChurches);
  const [showTour, setShowTour] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  React.useEffect(() => {
    if (church.city) {
      fetch(`/api/churches?city=${encodeURIComponent(church.city)}&limit=6`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const filtered = data.filter((c: any) => c.id !== church.id).slice(0, 3);
            if (filtered.length > 0) {
              setNearbyChurches(filtered);
            }
          }
        })
        .catch(() => {});
    }
  }, [church.city, church.id]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isTourParam = urlParams.get("tour") === "first_time";
      const isLocalStorageTour = localStorage.getItem(`first_time_tour_${initialChurch.slug}`) === 'true';
      if (isTourParam || isLocalStorageTour) {
        setShowTour(true);
      }
    }
  }, [initialChurch.slug]);

  // Ref so AdminEditBar can read the latest state without stale closure
  const churchRef = useRef(church);
  const updateChurch = (updated: any) => {
    churchRef.current = updated;
    setChurch(updated);
  };

  // ── Derived live counts for StatsBar ────────────────────────
  const toArray = (val: any): string[] =>
    Array.isArray(val) ? val
    : typeof val === "string" && val ? val.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const ministries    = toArray(church.ministries);
  const languages     = toArray(church.languages);
  const facilities    = toArray(church.facilities);
  const worshipStyles = toArray(church.worship_styles);
  const servicesCount = Array.isArray(church.church_services) ? church.church_services.length : 0;

  return (
    <>
      {/* Admin save strip — only rendered for owners */}
      {isEditing && (
        <AdminEditBar
          churchName={church.name}
          churchId={church.id}
          getChurchState={() => churchRef.current}
        />
      )}

      {/* Live Hero Header */}
      <HeroHeader 
        church={church}
        isOwner={isEditing}
        realDenomination={church.denomination?.split('|||est:')[0] || church.denomination}
        establishedYear={church.denomination?.includes('|||est:') ? church.denomination.split('|||est:')[1] : null}
        liveStreamUrl={null}
        coverUrls={church.cover_url ? (church.cover_url.includes('|||') ? church.cover_url.split('|||') : [church.cover_url]) : []}
      />

      {/* Visitor Banner directly below Hero Cover */}
      <div className="wrap" style={{ marginTop: '20px' }}>
        <VisitorBanner churchId={church.id} services={church.church_services || []} />
      </div>

      {/* Stats bar — live */}
      <div className="wrap" id="tour-stats-bar">
        <StatsBar
          ministriesCount={ministries.length}
          worshipStylesCount={worshipStyles.length}
          languagesCount={languages.length}
          servicesCount={servicesCount}
          branchesCount={church.branches?.length || 0}
          facilitiesCount={facilities.length}
        />
      </div>

      {/* Main content grid */}
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", marginTop: "40px" }}>
        <div className="main-col">
          <ClientTabs
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t)}
            counts={{ team: church.church_teams?.length || 0, branches: church.branches?.length || 0, events: 0 }}
            teamContent={
              <OurTeamSection 
                isEditing={isEditing} 
                initialTeams={church.church_teams || []} 
                onChurchChange={updateChurch} 
                church={church}
              />
            }
            branchesContent={
              <BranchesSection 
                isEditing={isEditing} 
                initialBranches={church.branches || []} 
                onChurchChange={updateChurch} 
                church={church}
              />
            }
            profileContent={
              <ProfileContent
                initialChurch={church}
                isEditing={isEditing}
                onChurchChange={updateChurch}
              />
            }
          />
        </div>

        <div id="tour-sidebar-contact">
          <SidebarContent
            initialChurch={church}
            isEditing={isEditing}
            onChurchChange={updateChurch}
          />
        </div>
      </div>

      {/* Live Contact & Get in Touch Section */}
      <div className="wrap" style={{ marginTop: "40px" }}>
        <ContactSection 
          churchName={church.name}
          email={church.email}
          phone={church.phone}
          address={church.address_line}
          socials={{
            facebook: church.social_facebook || church.facebook,
            instagram: church.social_instagram || church.instagram,
            youtube: church.social_youtube || church.youtube,
            twitter: church.social_twitter || church.twitter,
            tiktok: church.social_tiktok || church.tiktok,
            telegram: church.social_telegram || church.telegram
          }}
        />
      </div>

      {/* Dynamic Nearby Churches Section */}
      <NearbySection churches={nearbyChurches} />

      {/* Floating Bottom-Left Tour Trigger Button */}
      <button
        onClick={() => setShowTour(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 9999,
          background: "linear-gradient(135deg, #7c3aed, #9333ea)",
          color: "#fff",
          border: "none",
          borderRadius: "30px",
          padding: "12px 20px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "transform 0.2s, box-shadow 0.2s"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Take interactive profile tour"
      >
        <i className="ti ti-map" style={{ fontSize: "18px" }}></i>
        <span>Take Guided Tour</span>
      </button>

      {showTour && (
        <GuidedTourModal
          onFinish={() => {
            setShowTour(false);
            if (typeof window !== "undefined") {
              localStorage.removeItem(`first_time_tour_${initialChurch.slug}`);
            }
          }}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}
    </>
  );
}
