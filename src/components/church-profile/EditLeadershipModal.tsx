"use client";

import React, { useState } from "react";

interface EditLeadershipModalProps {
  initialLeader?: {
    name?: string;
    role?: string;
    bio?: string;
    photo_url?: string;
    pastor_link?: string;
    pastorLink?: string;
  };
  onClose: () => void;
  onSave: (leader: { name: string; role: string; bio: string; photo_url?: string; pastor_link?: string }) => void;
}

export default function EditLeadershipModal({ initialLeader, onClose, onSave }: EditLeadershipModalProps) {
  const [name, setName] = useState(initialLeader?.name || "");
  const [role, setRole] = useState(initialLeader?.role || "");
  const [bio, setBio] = useState(initialLeader?.bio || "");
  const [pastorLink, setPastorLink] = useState(initialLeader?.pastor_link || initialLeader?.pastorLink || "");
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
      photo_url: photoUrl,
      pastor_link: pastorLink.trim()
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "20px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "18px" }}>
        
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
              <img src={photoUrl} alt="Pastor" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", objectPosition: "top", border: "2px solid #7c3aed" }} />
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

        {/* Role / Title */}
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

        {/* ChurchNavigator Link (Pastor Redirect Link) */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#334155", margin: 0 }}>
              ChurchNavigator Link (Redirect URL)
            </label>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Optional</span>
          </div>
          <div style={{ position: "relative" }}>
            <input 
              type="text" 
              value={pastorLink} 
              onChange={(e) => setPastorLink(e.target.value)} 
              placeholder="e.g. church-navigator.com/pastor/emmanuel-adeyemi or /pastor/emmanuel-adeyemi"
              style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13.5px" }} 
            />
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#7c3aed" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <p style={{ margin: "5px 0 0", fontSize: "11.5px", color: "#64748b", lineHeight: 1.4 }}>
            Manually enter the pastor's ChurchNavigator profile link or slug so their profile is directly connected to this church.
          </p>
        </div>

        {/* Brief Intro */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#334155", margin: 0 }}>Brief Intro</label>
            <span style={{ fontSize: "11px", color: "#7c3aed", fontWeight: 600 }}>Click sample to fill</span>
          </div>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            placeholder="Brief intro about pastor..."
            style={{ width: "100%", minHeight: "90px", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13.5px", lineHeight: "1.5", resize: "vertical" }} 
          />

          {/* Quick-fill samples */}
          <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {(() => {
              const nameToUse = name.trim()
                ? (/^pastor/i.test(name.trim()) ? name.trim() : `Pastor ${name.trim()}`)
                : "our pastor";

              return [
                { label: "Sample 1", text: `${nameToUse} serves with a passion for clear biblical teaching, authentic worship, and community outreach. Dedicated to mentoring leaders and nurturing spiritual growth, leadership guides our church family with a heart focused on faith, love, and empowering believers of all ages.` },
                { label: "Sample 2", text: `With over 15 years in gospel ministry, ${nameToUse} is devoted to sharing the transformative love of Christ, building strong families, and fostering a warm, welcoming church home where everyone can experience God's grace.` },
                { label: "Sample 3", text: `Guided by a commitment to compassionate pastoral care and discipleship, ${nameToUse} serves our congregation with humility, wisdom, and prayer, passionately walking alongside individuals in their faith journey.` },
                { label: "Sample 4", text: `${nameToUse} has a deep heart for evangelism, local service, and raising up the next generation. Dedicated to equipping the church to live out the Great Commission, leadership inspires believers to serve with faith and purpose.` },
                { label: "Sample 5", text: `Focusing on biblical truth and servant leadership, ${nameToUse} strives to create a Christ-centered community where believers grow together in grace, support one another in love, and impact our surrounding city for the Kingdom.` },
              ].map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setBio(s.text)}
                  style={{
                    padding: "4px 8px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {s.label}
                </button>
              ));
            })()}
          </div>
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
