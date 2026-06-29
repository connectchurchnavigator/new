"use client";

import React, { useState, useRef } from "react";
import StatsBar from "./StatsBar";
import ClientTabs from "./ClientTabs";
import OurTeamSection from "./OurTeamSection";
import BranchesSection from "./BranchesSection";
import ProfileContent from "./ProfileContent";
import SidebarContent from "./SidebarContent";
import AdminEditBar from "./AdminEditBar";

interface ChurchProfileClientProps {
  initialChurch: any;
  isEditing: boolean;
  twitterUrl?: string | null;
  tiktokUrl?: string | null;
  telegramUrl?: string | null;
  initialBranchesCount: number;
}

export default function ChurchProfileClient({
  initialChurch,
  isEditing,
  twitterUrl,
  tiktokUrl,
  telegramUrl,
  initialBranchesCount,
}: ChurchProfileClientProps) {
  // ── Single source of truth for all church data ──────────────
  const [church, setChurch] = useState(initialChurch);

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

      {/* Stats bar — live */}
      <div className="wrap">
        <StatsBar
          ministriesCount={ministries.length}
          worshipStylesCount={worshipStyles.length}
          languagesCount={languages.length}
          servicesCount={servicesCount}
          branchesCount={initialBranchesCount}
          facilitiesCount={facilities.length}
        />
      </div>

      {/* Main content grid */}
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", marginTop: "40px" }}>
        <div className="main-col">
          <ClientTabs
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

        <SidebarContent
          initialChurch={church}
          isEditing={isEditing}
          twitterUrl={twitterUrl}
          tiktokUrl={tiktokUrl}
          telegramUrl={telegramUrl}
          onChurchChange={updateChurch}
        />
      </div>
    </>
  );
}
