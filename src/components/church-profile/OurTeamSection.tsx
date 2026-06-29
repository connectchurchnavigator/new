"use client";

import React, { useState } from "react";
import AddTeamModal from "./AddTeamModal";

interface OurTeamSectionProps {
  isEditing?: boolean;
  initialTeams?: any[];
  onChurchChange?: (c: any) => void;
  church?: any;
}

export default function OurTeamSection({ isEditing, initialTeams = [], onChurchChange, church }: OurTeamSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingTeamIndex, setEditingTeamIndex] = useState<number | null>(null);
  const [teams, setTeams] = useState<any[]>(initialTeams);

  if (!isEditing && teams.length === 0) {
    return (
      <div className="panel" style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", color: "#334155", fontSize: "16px" }}>
        No team members listed yet.
      </div>
    );
  }

  const handleSave = (updatedTeams: any[]) => {
    setTeams(updatedTeams);
    if (onChurchChange && church) {
      onChurchChange({ ...church, church_teams: updatedTeams });
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {teams.map((team, idx) => {
        const allPhotos = (team.leaderPhoto ? [team.leaderPhoto] : []).concat(
          (team.teamMembers || []).map((m: any) => m.photo)
        ).filter(Boolean);
        const displayPhotos = allPhotos.slice(0, 4);
        const extraCount = allPhotos.length - 4;

        return (
          <div key={idx} style={{ 
            position: "relative",
            width: "100%", 
            borderRadius: "20px", 
            overflow: "hidden",
            background: team.coverUrl ? `url(${team.coverUrl}) center/cover` : "var(--purple)",
            color: "#fff",
            boxShadow: "var(--shadow-md)"
          }}>
            {/* Dark overlay */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.8) 50%, rgba(15,23,42,0.4) 100%)",
              zIndex: 1
            }}></div>

            {/* Content */}
            <div style={{ position: "relative", zIndex: 2, padding: "32px" }}>
              
              {/* Header: Avatars & Badges */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {displayPhotos.map((photo, i) => (
                    <div key={i} style={{ 
                      width: "48px", height: "48px", borderRadius: "50%", 
                      background: `url(${photo}) center/cover`, 
                      border: "2px solid #1e293b",
                      marginLeft: i > 0 ? "-12px" : "0",
                      position: "relative",
                      zIndex: 10 - i
                    }}></div>
                  ))}
                  {extraCount > 0 && (
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "50%", 
                      background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)",
                      border: "2px solid #1e293b",
                      marginLeft: "-12px",
                      position: "relative",
                      zIndex: 5,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "14px"
                    }}>
                      +{extraCount}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {isEditing && (
                    <button onClick={() => { setEditingTeamIndex(idx); setShowModal(true); }} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                  )}
                  {team.type && (
                    <span style={{ background: "var(--purple)", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontSize: "14px", fontWeight: 800 }}>
                      {team.type}
                    </span>
                  )}
                </div>
              </div>

              {/* Body: Info */}
              <div style={{ maxWidth: "600px" }}>
                <h3 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>{team.name}</h3>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: "16px" }}>{allPhotos.length} members</div>
                {team.about && (
                  <p style={{ fontSize: "16px", lineHeight: "1.6", color: "rgba(255,255,255,0.9)", margin: "0 0 32px 0" }}>
                    {team.about}
                  </p>
                )}
              </div>

              {/* Footer: CTAs */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  {team.youtubeUrl && (
                    <a href={team.youtubeUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", padding: "10px 20px", borderRadius: "24px", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "14.5px", border: "1px solid rgba(255,255,255,0.2)", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"} onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"></path></svg>
                      Watch video
                    </a>
                  )}
                </div>
                <button style={{ background: "none", border: "none", color: "#fff", fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  View team <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>

            </div>
          </div>
        );
      })}

      {isEditing && (
          <button 
            onClick={() => { setEditingTeamIndex(null); setShowModal(true); }}
            style={{ 
              width: "100%", 
              background: "var(--bg-soft)", 
              border: "2px dashed var(--line)", 
              borderRadius: "20px", 
              padding: "50px 20px", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "12px", 
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--purple)"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--line)"}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--ink)" }}>Add a team</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>Create a new ministry team</div>
            </div>
          </button>
        )}
      </div>

      {showModal && (
        <AddTeamModal 
          initialData={editingTeamIndex !== null ? teams[editingTeamIndex] : undefined}
          onClose={() => setShowModal(false)} 
          onSave={(data) => {
            if (editingTeamIndex !== null) {
              const newTeams = [...teams];
              newTeams[editingTeamIndex] = data;
              handleSave(newTeams);
            } else {
              handleSave([...teams, data]);
            }
            setShowModal(false);
          }}
          onDelete={() => {
            if (editingTeamIndex !== null) {
              const newTeams = teams.filter((_, i) => i !== editingTeamIndex);
              handleSave(newTeams);
            }
            setShowModal(false);
          }} 
        />
      )}
    </>
  );
}
