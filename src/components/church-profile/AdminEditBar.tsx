"use client";

import React, { useState, useEffect } from "react";

interface AdminEditBarProps {
  churchName: string;
  churchId: string;
  getChurchState: () => any; // callback to get current church state from parent
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function AdminEditBar({ churchName, churchId, getChurchState }: AdminEditBarProps) {
  const [visible, setVisible] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMsg("");
    try {
      const church = getChurchState();
      const res = await fetch("/api/church/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchId,
          church,
          services: church.church_services ?? [],
          branches: church.branches ?? [],
          teams: church.church_teams ?? [],
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error ?? "Save failed");
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      setSaveStatus("error");
      setErrorMsg(err.message ?? "Something went wrong");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  const handleCancel = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("owner");
    window.location.href = url.toString();
  };

  const handleUndo = () => {
    window.location.reload();
  };

  const dotColor =
    saveStatus === "saved"  ? "#4ade80" :
    saveStatus === "error"  ? "#f87171" :
    saveStatus === "saving" ? "#60a5fa" : "#fbbf24";

  const dotLabel =
    saveStatus === "saved"  ? "Saved!" :
    saveStatus === "error"  ? "Error" :
    saveStatus === "saving" ? "Saving…" : "Editing";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: "48px",
          boxShadow: "0 4px 24px rgba(15,23,42,0.25)",
        }}
      >
        {/* Left — Admin badge + church name + status */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: "4px 12px",
              borderRadius: "30px",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={{ color: "#a5b4fc", fontSize: "11.5px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Admin
            </span>
          </div>

          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>|</span>

          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 600, maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {churchName}
          </span>

          {/* Status dot */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span
              style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: dotColor,
                boxShadow: `0 0 8px ${dotColor}`,
                display: "inline-block",
                animation: saveStatus === "idle" ? "pulse 2s infinite" : "none",
              }}
            />
            <span style={{ color: dotColor, fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
              {dotLabel}
            </span>
            {saveStatus === "error" && errorMsg && (
              <span style={{ color: "#fca5a5", fontSize: "11px", marginLeft: "4px" }}>({errorMsg})</span>
            )}
          </div>
        </div>

        {/* Right — Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          {/* Undo */}
          <button
            onClick={handleUndo}
            title="Reload to undo all unsaved changes"
            disabled={saveStatus === "saving"}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.8)",
              padding: "6px 14px", borderRadius: "8px",
              fontSize: "12.5px", fontWeight: 700, cursor: "pointer",
              opacity: saveStatus === "saving" ? 0.5 : 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" /><path d="M3 13a9 9 0 1 0 2.6-6.36L3 9" />
            </svg>
            Undo
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background:
                saveStatus === "saved"  ? "#16a34a" :
                saveStatus === "error"  ? "#dc2626" :
                saveStatus === "saving" ? "#5b21b6" : "#7c3aed",
              border: "none",
              color: "#fff",
              padding: "6px 18px", borderRadius: "8px",
              fontSize: "12.5px", fontWeight: 800, cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
              boxShadow: "0 2px 12px rgba(124,58,237,0.4)",
              transition: "all 0.2s",
              minWidth: "130px", justifyContent: "center",
            }}
          >
            {saveStatus === "saving" && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {saveStatus === "saved" && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {saveStatus === "error" && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            {saveStatus === "idle" && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            )}
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Retry save" : "Save changes"}
          </button>

          <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 2px" }}>|</span>

          {/* Exit */}
          <button
            onClick={handleCancel}
            title="Exit admin mode"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "transparent", border: "none",
              color: "rgba(255,255,255,0.45)",
              padding: "6px 10px", borderRadius: "8px",
              fontSize: "12.5px", fontWeight: 700, cursor: "pointer",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Exit
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin  { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
