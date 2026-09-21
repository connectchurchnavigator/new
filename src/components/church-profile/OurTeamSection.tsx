"use client";

import React, { useState } from "react";
import AddTeamModal from "./AddTeamModal";

interface OurTeamSectionProps {
  isEditing?: boolean;
  initialTeams?: any[];
  onChurchChange?: (c: any) => void;
  church?: any;
}

// Helper to normalize teams from either DB format or form state
export function normalizeTeam(team: any) {
  if (!team) return team;

  let parsedMetadata: any = {};
  let cleanAbout = team.about || "";

  if (typeof team.about === "string" && team.about.trim().startsWith("{")) {
    try {
      parsedMetadata = JSON.parse(team.about);
      cleanAbout = parsedMetadata.about || "";
    } catch {
      // Keep as regular string
    }
  }

  const teamMembers = (
    team.teamMembers ||
    (team.church_team_members || []).map((m: any) => ({
      name: m.name || "",
      role: m.role || "",
      photo: m.photo_url || m.photo || "",
    }))
  ).map((m: any) => ({
    name: m.name || "",
    role: m.role || "",
    photo: m.photo || m.photo_url || "",
  }));

  return {
    ...team,
    name: team.name || "",
    type: team.type || parsedMetadata.type || "",
    tagline: team.tagline || parsedMetadata.tagline || "",
    about: cleanAbout,
    whatWeDo: team.whatWeDo || parsedMetadata.whatWeDo || "",
    impact: team.impact || parsedMetadata.impact || "",
    whenWeServe: team.whenWeServe || parsedMetadata.whenWeServe || "",
    leaderName: team.leaderName || parsedMetadata.leaderName || "",
    leaderRole: team.leaderRole || parsedMetadata.leaderRole || "",
    leaderPhoto: team.leaderPhoto || parsedMetadata.leaderPhoto || "",
    coverUrl: team.coverUrl || team.cover_url || "",
    youtubeUrl: team.youtubeUrl || team.youtube_url || "",
    gallery: Array.isArray(team.gallery)
      ? team.gallery
      : Array.isArray(parsedMetadata.gallery)
      ? parsedMetadata.gallery
      : [],
    teamMembers,
  };
}

export default function OurTeamSection({
  isEditing,
  initialTeams = [],
  onChurchChange,
  church,
}: OurTeamSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingTeamIndex, setEditingTeamIndex] = useState<number | null>(null);
  const [viewingTeam, setViewingTeam] = useState<any | null>(null);
  const [teams, setTeams] = useState<any[]>(() =>
    (initialTeams || []).map(normalizeTeam)
  );

  // Keep teams state in sync if initialTeams changes externally
  React.useEffect(() => {
    if (initialTeams) {
      setTeams(initialTeams.map(normalizeTeam));
    }
  }, [initialTeams]);

  if (!isEditing && teams.length === 0) {
    return (
      <div
        className="panel"
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          color: "#334155",
          fontSize: "16px",
        }}
      >
        No team members listed yet.
      </div>
    );
  }

  const handleSave = (updatedTeams: any[]) => {
    const normalized = updatedTeams.map(normalizeTeam);
    setTeams(normalized);
    if (onChurchChange && church) {
      onChurchChange({ ...church, church_teams: normalized });
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {teams.map((rawTeam, idx) => {
          const team = normalizeTeam(rawTeam);
          const allPhotos = (team.leaderPhoto ? [team.leaderPhoto] : [])
            .concat((team.teamMembers || []).map((m: any) => m.photo))
            .filter(Boolean);
          const displayPhotos = allPhotos.slice(0, 4);
          const extraCount = allPhotos.length - 4;
          const memberCount = (team.teamMembers?.length || 0) + (team.leaderName || team.leaderPhoto ? 1 : 0);

          return (
            <div
              key={team.id || idx}
              style={{
                position: "relative",
                width: "100%",
                borderRadius: "20px",
                overflow: "hidden",
                background: team.coverUrl
                  ? `url(${team.coverUrl}) center/cover`
                  : "var(--purple)",
                color: "#fff",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {/* Dark overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 50%, rgba(15,23,42,0.6) 100%)",
                  zIndex: 1,
                }}
              ></div>

              {/* Content */}
              <div style={{ position: "relative", zIndex: 2, padding: "32px" }}>
                {/* Header: Avatars & Badges */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {displayPhotos.length > 0 ? (
                      <>
                        {displayPhotos.map((photo: string, i: number) => (
                          <div
                            key={i}
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: `url(${photo}) center/cover`,
                              border: "2.5px solid #0f172a",
                              marginLeft: i > 0 ? "-12px" : "0",
                              position: "relative",
                              zIndex: 10 - i,
                              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                            }}
                          ></div>
                        ))}
                        {extraCount > 0 && (
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.2)",
                              backdropFilter: "blur(4px)",
                              border: "2.5px solid #0f172a",
                              marginLeft: "-12px",
                              position: "relative",
                              zIndex: 5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "14px",
                            }}
                          >
                            +{extraCount}
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {isEditing && (
                      <button
                        onClick={() => {
                          setEditingTeamIndex(idx);
                          setShowModal(true);
                        }}
                        title="Edit team"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "#fff",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "var(--ink)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          transition: "transform 0.15s ease",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                    )}
                    {team.type && (
                      <span
                        style={{
                          background: "var(--purple)",
                          color: "#fff",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "13.5px",
                          fontWeight: 800,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {team.type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body: Info */}
                <div style={{ maxWidth: "650px" }}>
                  <h3
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      margin: "0 0 4px 0",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {team.name}
                  </h3>

                  <div
                    style={{
                      fontSize: "14.5px",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.75)",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>
                      {memberCount > 0 ? `${memberCount} member${memberCount > 1 ? "s" : ""}` : "Team members"}
                    </span>
                    {team.leaderName && (
                      <>
                        <span>•</span>
                        <span>Led by {team.leaderName}</span>
                      </>
                    )}
                  </div>

                  {team.tagline && (
                    <div
                      style={{
                        fontSize: "15px",
                        fontStyle: "italic",
                        color: "rgba(255,255,255,0.88)",
                        marginBottom: "12px",
                      }}
                    >
                      "{team.tagline}"
                    </div>
                  )}

                  {team.about && (
                    <p
                      style={{
                        fontSize: "15px",
                        lineHeight: "1.6",
                        color: "rgba(255,255,255,0.9)",
                        margin: "0 0 24px 0",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {team.about}
                    </p>
                  )}
                </div>

                {/* Footer: CTAs */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div>
                    {team.youtubeUrl && (
                      <a
                        href={team.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(4px)",
                          padding: "8px 16px",
                          borderRadius: "24px",
                          color: "#fff",
                          textDecoration: "none",
                          fontWeight: 700,
                          fontSize: "13.5px",
                          border: "1px solid rgba(255,255,255,0.25)",
                          transition: "background 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                        }
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5 3l14 9-14 9V3z"></path>
                        </svg>
                        Watch video
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => setViewingTeam(team)}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      padding: "8px 18px",
                      borderRadius: "24px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "var(--ink)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                      e.currentTarget.style.color = "#fff";
                    }}
                  >
                    View team{" "}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {isEditing && (
          <button
            id="tour-add-team-btn"
            onClick={() => {
              setEditingTeamIndex(null);
              setShowModal(true);
            }}
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
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--purple)")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ink-soft)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--ink)" }}>
                Add a team
              </div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
                Create a new ministry team
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Edit/Add Modal */}
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

      {/* View Team Details Modal */}
      {viewingTeam && (
        <ViewTeamModal
          team={viewingTeam}
          onClose={() => setViewingTeam(null)}
          onEdit={() => {
            const idx = teams.findIndex(
              (t) => t.id === viewingTeam.id || t.name === viewingTeam.name
            );
            setViewingTeam(null);
            setEditingTeamIndex(idx >= 0 ? idx : null);
            setShowModal(true);
          }}
          isEditing={Boolean(isEditing)}
        />
      )}
    </>
  );
}

/**
 * Modal to display full team details when clicking "View team"
 */
function ViewTeamModal({
  team,
  onClose,
  onEdit,
  isEditing,
}: {
  team: any;
  onClose: () => void;
  onEdit: () => void;
  isEditing: boolean;
}) {
  const whatWeDoList = (team.whatWeDo || "")
    .split("\n")
    .map((s: string) => s.trim())
    .filter(Boolean);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.85)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {/* Banner with cover */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "180px",
            background: team.coverUrl
              ? `url(${team.coverUrl}) center/cover`
              : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            display: "flex",
            alignItems: "flex-end",
            padding: "24px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.3) 100%)",
            }}
          ></div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Banner Title */}
          <div style={{ position: "relative", zIndex: 2, color: "#fff" }}>
            {team.type && (
              <span
                style={{
                  display: "inline-block",
                  background: "var(--purple)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderRadius: "16px",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {team.type}
              </span>
            )}
            <h2
              style={{
                fontSize: "30px",
                fontWeight: 800,
                margin: 0,
                letterSpacing: "-0.02em",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {team.name}
            </h2>
            {team.tagline && (
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.9)",
                  fontStyle: "italic",
                }}
              >
                "{team.tagline}"
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* About */}
          {team.about && (
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--muted)",
                  margin: "0 0 8px 0",
                }}
              >
                About the Team
              </h4>
              <p
                style={{
                  fontSize: "15.5px",
                  lineHeight: "1.65",
                  color: "#334155",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {team.about}
              </p>
            </div>
          )}

          {/* Team Leader */}
          {(team.leaderName || team.leaderPhoto) && (
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--muted)",
                  margin: "0 0 12px 0",
                }}
              >
                Team Leader
              </h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  background: "#f8fafc",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: team.leaderPhoto
                      ? `url(${team.leaderPhoto}) center/cover`
                      : "#e2e8f0",
                    border: "2px solid #cbd5e1",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!team.leaderPhoto && (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                    {team.leaderName || "Ministry Leader"}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--purple)", fontWeight: 700 }}>
                    {team.leaderRole || "Team Director / Lead"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          {team.teamMembers && team.teamMembers.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--muted)",
                    margin: 0,
                  }}
                >
                  Team Members
                </h4>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                  {team.teamMembers.length} member{team.teamMembers.length > 1 ? "s" : ""}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "14px",
                }}
              >
                {team.teamMembers.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      background: "#f8fafc",
                      padding: "14px 10px",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: m.photo ? `url(${m.photo}) center/cover` : "#cbd5e1",
                        border: "2px solid #e2e8f0",
                        marginBottom: "8px",
                      }}
                    ></div>
                    <div
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "#0f172a",
                        lineHeight: "1.3",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.name || `Member ${idx + 1}`}
                    </div>
                    {m.role && (
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "#64748b",
                          marginTop: "2px",
                        }}
                      >
                        {m.role}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What We Do */}
          {whatWeDoList.length > 0 && (
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--muted)",
                  margin: "0 0 10px 0",
                }}
              >
                What We Do
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "15px",
                  color: "#334155",
                  lineHeight: "1.5",
                }}
              >
                {whatWeDoList.map((item: string, idx: number) => (
                  <li key={idx} style={{ paddingLeft: "4px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ministry Impact */}
          {team.impact && (
            <div
              style={{
                background: "#faf5ff",
                border: "1px solid #e9d5ff",
                borderRadius: "14px",
                padding: "16px 20px",
              }}
            >
              <h4
                style={{
                  fontSize: "13.5px",
                  fontWeight: 800,
                  color: "#7e22ce",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Heart & Ministry Impact
              </h4>
              <p
                style={{
                  fontSize: "15px",
                  color: "#581c87",
                  margin: 0,
                  lineHeight: "1.6",
                }}
              >
                {team.impact}
              </p>
            </div>
          )}

          {/* When We Serve */}
          {team.whenWeServe && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                background: "#f1f5f9",
                padding: "14px 18px",
                borderRadius: "12px",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#475569"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginTop: "2px", flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#475569" }}>
                  When We Serve & Rehearse
                </div>
                <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                  {team.whenWeServe}
                </div>
              </div>
            </div>
          )}

          {/* Gallery */}
          {team.gallery && team.gallery.length > 0 && (
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--muted)",
                  margin: "0 0 12px 0",
                }}
              >
                Gallery In Action
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "12px",
                }}
              >
                {team.gallery.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      height: "100px",
                      borderRadius: "12px",
                      background: `url(${img}) center/cover`,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    }}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {team.youtubeUrl && (
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--muted)",
                  margin: "0 0 12px 0",
                }}
              >
                Team Video
              </h4>
              <a
                href={team.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "14.5px",
                  textDecoration: "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z"></path>
                </svg>
                Watch on YouTube
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isEditing ? (
            <button
              onClick={onEdit}
              style={{
                padding: "10px 18px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 700,
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "var(--ink)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Edit this team
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              fontSize: "14.5px",
              fontWeight: 700,
              background: "#0f172a",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
