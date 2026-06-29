"use client";

import React, { useState } from "react";
import AddBranchModal from "./AddBranchModal";

interface BranchesSectionProps {
  isEditing?: boolean;
  initialBranches?: any[];
  onChurchChange?: (c: any) => void;
  church?: any;
}

export default function BranchesSection({ isEditing, initialBranches = [], onChurchChange, church }: BranchesSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingBranchIndex, setEditingBranchIndex] = useState<number | null>(null);
  const [branches, setBranches] = useState<any[]>(initialBranches);

  if (!isEditing && branches.length === 0) {
    return (
      <div className="panel" style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", color: "#334155", fontSize: "16px" }}>
        No branches listed yet.
      </div>
    );
  }

  const handleSave = (updatedBranches: any[]) => {
    setBranches(updatedBranches);
    if (onChurchChange && church) {
      onChurchChange({ ...church, branches: updatedBranches });
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "B";
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
      
      {branches.map((branch, idx) => {
        return (
          <div key={idx} style={{ 
            position: "relative",
            width: "100%",
            minHeight: "260px",
            borderRadius: "20px", 
            overflow: "hidden",
            background: branch.coverUrl ? `url(${branch.coverUrl}) center/cover` : "#8b5cf6",
            color: "#fff",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "24px"
          }}>
            {/* Dark overlay if image */}
            {branch.coverUrl && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.8) 100%)",
                zIndex: 1
              }}></div>
            )}

            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
              
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ 
                  width: "48px", height: "48px", borderRadius: "12px", 
                  background: branch.dpUrl ? `url(${branch.dpUrl}) center/cover` : "rgba(255,255,255,0.2)", 
                  border: "1px solid rgba(255,255,255,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "16px"
                }}>
                  {!branch.dpUrl && getInitials(branch.name)}
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {isEditing && (
                    <button onClick={() => { setEditingBranchIndex(idx); setShowModal(true); }} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", padding: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                  )}
                  {branch.denomination && (
                    <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
                      {branch.denomination}
                    </span>
                  )}
                </div>
              </div>

              {/* Center Info */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", marginTop: "24px", marginBottom: "24px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.01em", lineHeight: "1.2" }}>{branch.name}</h3>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", fontWeight: 500, lineHeight: "1.4" }}>{branch.address}</div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(branch.address || branch.name)}`} target="_blank" rel="noreferrer" style={{ background: "#fff", color: "#8b5cf6", padding: "8px 16px", borderRadius: "24px", fontSize: "13.5px", fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Directions
                </a>
              </div>

            </div>
          </div>
        );
      })}

      {isEditing && (
          <button 
            onClick={() => { setEditingBranchIndex(null); setShowModal(true); }}
            style={{ 
              width: "100%", 
              minHeight: "260px",
              background: "var(--bg-soft)", 
              border: "2px dashed var(--line)", 
              borderRadius: "20px", 
              padding: "40px 20px", 
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
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--ink)" }}>Add a branch</div>
              <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>List another church location</div>
            </div>
          </button>
        )}
      </div>

      {showModal && (
        <AddBranchModal 
          initialData={editingBranchIndex !== null ? branches[editingBranchIndex] : undefined}
          onClose={() => setShowModal(false)} 
          onDelete={() => {
            if (editingBranchIndex !== null) {
              const newBranches = [...branches];
              newBranches.splice(editingBranchIndex, 1);
              handleSave(newBranches);
            }
            setShowModal(false);
          }}
          onSave={(data) => {
            if (editingBranchIndex !== null) {
              const newBranches = [...branches];
              newBranches[editingBranchIndex] = data;
              handleSave(newBranches);
            } else {
              handleSave([...branches, data]);
            }
            setShowModal(false);
          }} 
        />
      )}
    </>
  );
}
