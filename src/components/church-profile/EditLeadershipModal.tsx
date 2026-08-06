"use client";

import React, { useState } from "react";

interface EditLeadershipModalProps {
  initialLeader?: {
    name?: string;
    role?: string;
    bio?: string;
    photo_url?: string;
  };
  onClose: () => void;
  onSave: (leader: { name: string; role: string; bio: string; photo_url?: string }) => void;
}

export default function EditLeadershipModal({ initialLeader, onClose, onSave }: EditLeadershipModalProps) {
  const [name, setName] = useState(initialLeader?.name || "");
  const [role, setRole] = useState(initialLeader?.role || "");
  const [bio, setBio] = useState(initialLeader?.bio || "");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialLeader?.photo_url);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      photo_url: photoUrl
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "20px", width: "100%", maxWidth: "500px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "18px" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Edit Leadership</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Pastor Photo */}
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>Pastor Photo</label>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {photoUrl ? (
              <img src={photoUrl} alt="Pastor" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #7c3aed" }} />
            ) : (
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            )}
            <label style={{ padding: "8px 16px", background: "#f3e8ff", color: "#7e22ce", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              {photoUrl ? "Change Photo" : "Upload Photo"}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
            </label>
          </div>
        </div>

        {/* Pastor Name */}
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>Pastor Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Pastor James Okafor"
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }} 
          />
        </div>

        {/* Pastor Role */}
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>Role / Title</label>
          <input 
            type="text" 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            placeholder="e.g. Senior Pastor"
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }} 
          />
        </div>

        {/* Brief Intro */}
        <div>
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>Brief Intro</label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            placeholder="Brief intro about pastor..."
            style={{ width: "100%", minHeight: "90px", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", resize: "vertical" }} 
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: "#7c3aed", color: "white", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
