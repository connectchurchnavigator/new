"use client";

import React, { useState, useRef } from "react";

interface AddTeamModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
  initialData?: any;
}

export default function AddTeamModal({ onClose, onSave, onDelete, initialData }: AddTeamModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "",
    tagline: initialData?.tagline || "",
    about: initialData?.about || "",
    whatWeDo: initialData?.whatWeDo || "",
    impact: initialData?.impact || "",
    whenWeServe: initialData?.whenWeServe || "",
    leaderName: initialData?.leaderName || "",
    leaderRole: initialData?.leaderRole || "",
    youtubeUrl: initialData?.youtubeUrl || ""
  });

  const [coverUrl, setCoverUrl] = useState<string>(initialData?.coverUrl || "");
  const [coverUrlInput, setCoverUrlInput] = useState("");
  
  const [leaderPhoto, setLeaderPhoto] = useState<string>(initialData?.leaderPhoto || "");
  const [teamMembers, setTeamMembers] = useState<{photo: string, name: string}[]>(initialData?.teamMembers || []);
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  const coverInputRef = useRef<HTMLInputElement>(null);
  const leaderInputRef = useRef<HTMLInputElement>(null);
  const memberInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoad: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLoad(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "600px", maxHeight: "90vh", borderRadius: "16px", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>{initialData ? "Edit team" : "Add team"}</h2>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#d97706", background: "#fef3c7", padding: "4px 8px", borderRadius: "20px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Owner</span>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", border: "none", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Team name</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Worship Team" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Ministry type</label>
              <input name="type" value={formData.type} onChange={handleChange} placeholder="e.g. Worship" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Tagline <span style={{ color: "var(--muted)", fontWeight: 500 }}>· one line</span></label>
            <input name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Leading our church into the presence of God..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Cover image</label>
            {coverUrl && (
              <div style={{ width: "140px", height: "80px", borderRadius: "10px", background: `url(${coverUrl}) center/cover`, border: "1px solid var(--line)", marginBottom: "12px", position: "relative" }}>
                <button onClick={() => setCoverUrl("")} style={{ position: "absolute", top: "-6px", right: "-6px", background: "#0f172a", color: "#fff", border: "none", width: "20px", height: "20px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>×</button>
              </div>
            )}
            {!coverUrl && (
              <>
                <input type="file" accept="image/*" style={{ display: "none" }} ref={coverInputRef} onChange={(e) => handleFileUpload(e, setCoverUrl)} />
                <button onClick={() => coverInputRef.current?.click()} style={{ background: "#f8fafc", color: "var(--ink)", border: "1px solid var(--line)", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                  + Upload cover
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>or paste URL</span>
                  <input value={coverUrlInput} onChange={(e) => setCoverUrlInput(e.target.value)} placeholder="https://..." style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", outline: "none", fontSize: "13px" }} />
                  <button onClick={() => { if(coverUrlInput) { setCoverUrl(coverUrlInput); setCoverUrlInput(""); } }} style={{ background: "#f3e8ff", color: "var(--purple)", border: "1px solid #e9d5ff", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Set</button>
                </div>
              </>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>About this team</label>
            <textarea name="about" value={formData.about} onChange={handleChange} placeholder="What this team is about..." style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px", minHeight: "80px", resize: "vertical" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>What we do <span style={{ color: "var(--muted)", fontWeight: 500 }}>· one activity per line</span></label>
            <textarea name="whatWeDo" value={formData.whatWeDo} onChange={handleChange} placeholder="Lead Sunday services&#10;Midweek rehearsals&#10;Mentor new members" style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px", minHeight: "80px", resize: "vertical" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>What this ministry promotes <span style={{ color: "var(--muted)", fontWeight: 500 }}>· the heart / impact</span></label>
            <textarea name="impact" value={formData.impact} onChange={handleChange} placeholder="The mission and impact of this team..." style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px", minHeight: "80px", resize: "vertical" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>When we serve</label>
            <input name="whenWeServe" value={formData.whenWeServe} onChange={handleChange} placeholder="Rehearsals — Thursdays 7-9 PM · Sundays from 9 AM" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "12px" }}>Team leader</label>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: leaderPhoto ? `url(${leaderPhoto}) center/cover` : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--line)", flexShrink: 0 }}>
                {!leaderPhoto && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
              </div>
              <input name="leaderName" value={formData.leaderName} onChange={handleChange} placeholder="Leader name" style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
              <input name="leaderRole" value={formData.leaderRole} onChange={handleChange} placeholder="Role (e.g. Worship Director)" style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
            </div>
            <input type="file" accept="image/*" style={{ display: "none" }} ref={leaderInputRef} onChange={(e) => handleFileUpload(e, setLeaderPhoto)} />
            <button onClick={() => leaderInputRef.current?.click()} style={{ background: "#f3e8ff", color: "var(--purple)", border: "1px solid #e9d5ff", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", borderStyle: "solid" }}>
              Upload leader photo
            </button>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "4px" }}>Team members <span style={{ color: "var(--muted)", fontWeight: 500 }}>· photos & names</span></label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px", marginTop: "12px" }}>
              {teamMembers.map((m, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "8px", borderRadius: "10px", border: "1px solid var(--line)" }}>
                  <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", background: `url(${m.photo}) center/cover`, border: "1px solid var(--line)", flexShrink: 0 }}></div>
                  <input 
                    value={m.name} 
                    onChange={(e) => {
                      const newMembers = [...teamMembers];
                      newMembers[idx].name = e.target.value;
                      setTeamMembers(newMembers);
                    }} 
                    placeholder="Member name" 
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", outline: "none", fontSize: "13.5px", background: "#fff" }} 
                  />
                  <button onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== idx))} style={{ background: "#fee2e2", color: "#ef4444", border: "none", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: "bold" }}>×</button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" style={{ display: "none" }} ref={memberInputRef} onChange={(e) => handleFileUpload(e, (b64) => setTeamMembers([...teamMembers, { photo: b64, name: "" }]))} />
            <button onClick={() => memberInputRef.current?.click()} style={{ background: "#f8fafc", color: "var(--ink)", border: "1px solid var(--line)", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", borderStyle: "solid" }}>
              + Add member photo
            </button>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "4px" }}>Gallery <span style={{ color: "var(--muted)", fontWeight: 500 }}>· in action</span></label>
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap", marginTop: "12px" }}>
              {gallery.map((c, idx) => (
                <div key={idx} style={{ position: "relative", width: "100px", height: "64px", borderRadius: "12px", background: `url(${c}) center/cover`, border: "1px solid var(--line)" }}>
                  <button onClick={() => setGallery(gallery.filter((_, i) => i !== idx))} style={{ position: "absolute", top: "-6px", right: "-6px", background: "#0f172a", color: "#fff", border: "none", width: "20px", height: "20px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>×</button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" style={{ display: "none" }} ref={galleryInputRef} onChange={(e) => handleFileUpload(e, (b64) => setGallery([...gallery, b64]))} />
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => galleryInputRef.current?.click()} style={{ background: "#f8fafc", color: "var(--ink)", border: "1px solid var(--line)", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", borderStyle: "solid" }}>
                + Add gallery image
              </button>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>or paste URL</span>
              <input value={galleryUrlInput} onChange={(e) => setGalleryUrlInput(e.target.value)} placeholder="https://..." style={{ flex: 1, minWidth: "150px", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", outline: "none", fontSize: "13px" }} />
              <button onClick={() => { if(galleryUrlInput) { setGallery([...gallery, galleryUrlInput]); setGalleryUrlInput(""); } }} style={{ background: "#f3e8ff", color: "var(--purple)", border: "1px solid #e9d5ff", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Add</button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Team video <span style={{ color: "var(--muted)", fontWeight: 500 }}>· YouTube URL</span></label>
            <input name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", background: "#fff", borderRadius: "0 0 16px 16px" }}>
          {onDelete ? (
            <button onClick={onDelete} style={{ padding: "10px 20px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", cursor: "pointer" }}>
              Delete
            </button>
          ) : <div></div>}
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={() => onSave({ ...formData, coverUrl, leaderPhoto, teamMembers, gallery })} style={{ padding: "10px 24px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, background: "var(--purple)", color: "#fff", border: "none", cursor: "pointer" }}>
              Save team
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
