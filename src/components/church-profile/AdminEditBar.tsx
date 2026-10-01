"use client";

import React, { useState, useEffect } from "react";

interface AdminEditBarProps {
  churchName: string;
  churchId: string;
  getChurchState: () => any; // callback to get current church state from parent
  currentChurch?: any;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function AdminEditBar({ churchName, churchId, getChurchState, currentChurch }: AdminEditBarProps) {
  const [visible, setVisible] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [initialSnapshot] = useState<string>(() => {
    try {
      const state = currentChurch || getChurchState?.();
      return JSON.stringify(state || {});
    } catch {
      return "";
    }
  });

  const [hasEdits, setHasEdits] = useState(false);

  useEffect(() => {
    try {
      const current = currentChurch || getChurchState?.();
      const currentStr = JSON.stringify(current || {});
      setHasEdits(initialSnapshot !== "" && currentStr !== initialSnapshot);
    } catch {
      setHasEdits(false);
    }
  }, [currentChurch, initialSnapshot, getChurchState]);

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
          leaders: church.leaders ?? [],
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error ?? "Save failed");
      }
      setSaveStatus("saved");
      setHasEdits(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      setSaveStatus("error");
      setErrorMsg(err.message ?? "Something went wrong");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  const handleUndo = () => {
    if (!hasEdits) return;
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
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      {/* Undo */}
      <button
        type="button"
        onClick={handleUndo}
        title={hasEdits ? "Reload to undo all unsaved changes" : "No recent edits to undo"}
        disabled={!hasEdits || saveStatus === "saving"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: hasEdits ? "#f1f5f9" : "#f8fafc",
          border: hasEdits ? "1.5px solid #cbd5e1" : "1px solid #e2e8f0",
          color: hasEdits ? "#475569" : "#94a3b8",
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: (!hasEdits || saveStatus === "saving") ? "not-allowed" : "pointer",
          opacity: (!hasEdits || saveStatus === "saving") ? 0.45 : 1,
          transition: "all 0.15s ease",
          boxShadow: hasEdits ? "0 1px 3px rgba(0,0,0,0.05)" : "none"
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" /><path d="M3 13a9 9 0 1 0 2.6-6.36L3 9" />
        </svg>
        Undo
      </button>

      {/* Save changes */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saveStatus === "saving"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background:
            saveStatus === "saved"  ? "#16a34a" :
            saveStatus === "error"  ? "#dc2626" :
            saveStatus === "saving" ? "#6d28d9" : "#7c3aed",
          border: "none",
          color: "#ffffff",
          padding: "6px 16px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
          boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
          transition: "all 0.15s ease",
          minWidth: "120px",
          justifyContent: "center",
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
        {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? (errorMsg || "Error") : "Save changes"}
      </button>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
