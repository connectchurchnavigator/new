"use client";

import React, { useState } from "react";
import Gallery from "./Gallery";
import EditTextModal from "./EditTextModal";
import EditTagsModal from "./EditTagsModal";
import EditGalleryModal from "./EditGalleryModal"; // We will create this

interface ProfileContentProps {
  initialChurch: any;
  isEditing: boolean;
  onChurchChange?: (church: any) => void;
}

export default function ProfileContent({ initialChurch, isEditing, onChurchChange }: ProfileContentProps) {
  const [church, setChurch] = useState(initialChurch);

  // Proxy setChurch so parent stays in sync
  const updateChurch = (updated: any) => {
    setChurch(updated);
    onChurchChange?.(updated);
  };
  
  const [editingField, setEditingField] = useState<string | null>(null);

  const renderEditButton = (field: string) => {
    if (!isEditing) return null;
    return (
      <button 
        onClick={() => setEditingField(field)}
        style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f8fafc", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", padding: 0 }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
      </button>
    );
  };

  return (
    <div id="tab-profile">
      {(church.about || isEditing) && (
        <div className="sec" style={{ marginBottom: "40px" }}>
          <div className="sec-head" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span className="ic c-purple" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "white", padding: "6px", borderRadius: "8px", display: "flex" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1-6.3-4.6L5.7 21 8 14 2 9.4h7.6z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/></svg></span>
            <h2 style={{ fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", margin: 0 }}>About this church</h2>
            {renderEditButton("about")}
          </div>
          <div className="panel" style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", fontSize: "16px", lineHeight: "1.7", color: "#334155" }}>
            {church.about ? (
              <div dangerouslySetInnerHTML={{ __html: church.about.replace(/\n/g, "<br/>") }}></div>
            ) : (
              <div style={{ color: "var(--muted)", fontStyle: "italic" }}>No description provided.</div>
            )}
          </div>
        </div>
      )}

      {((church.ministries && church.ministries.length > 0) || isEditing) && (
        <div className="sec" style={{ marginBottom: "40px" }}>
          <div className="sec-head" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span className="ic c-amber" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "white", padding: "6px", borderRadius: "8px", display: "flex" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2a5 5 0 0 0-5 5c0 3 5 8 5 8s5-5 5-8a5 5 0 0 0-5-5zM5 21h14" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <h2 style={{ fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", margin: 0 }}>Ministries & Outreach</h2>
            {renderEditButton("ministries")}
          </div>
          {church.ministries && church.ministries.length > 0 ? (
            <div className="tagrow" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {church.ministries.map((min: string, i: number) => (
                <span key={i} style={{ background: "#fef3c7", padding: "6px 14px", borderRadius: "8px", fontSize: "13.5px", fontWeight: 600, color: "#b45309" }}>{min}</span>
              ))}
            </div>
          ) : (
             <div style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "15px" }}>No ministries listed.</div>
          )}
        </div>
      )}

      {((church.languages && church.languages.length > 0) || isEditing) && (
        <div className="sec" style={{ marginBottom: "40px" }}>
          <div className="sec-head" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span className="ic c-purple" style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "white", padding: "6px", borderRadius: "8px", display: "flex" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 8h14M5 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2M5 8v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M9 12h6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <h2 style={{ fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", margin: 0 }}>Languages spoken</h2>
            {renderEditButton("languages")}
          </div>
          {church.languages && church.languages.length > 0 ? (
            <div className="tagrow" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {church.languages.map((lang: string, i: number) => (
                <span key={i} style={{ background: "#f3e8ff", padding: "6px 14px", borderRadius: "8px", fontSize: "13.5px", fontWeight: 600, color: "#7e22ce" }}>{lang}</span>
              ))}
            </div>
          ) : (
            <div style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "15px" }}>No languages listed.</div>
          )}
        </div>
      )}

      {((church.facilities && church.facilities.length > 0) || isEditing) && (
        <div className="sec" style={{ marginBottom: "40px" }}>
          <div className="sec-head" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span className="ic c-green" style={{ background: "linear-gradient(135deg, #059669, #10b981)", color: "white", padding: "6px", borderRadius: "8px", display: "flex" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 21V9l9-6 9 6v12M9 21v-6h6v6" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/></svg></span>
            <h2 style={{ fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", margin: 0 }}>Facilities</h2>
            {renderEditButton("facilities")}
          </div>
          {church.facilities && church.facilities.length > 0 ? (
            <div className="tagrow" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {church.facilities.map((fac: string, i: number) => (
                <span key={i} style={{ background: "#d1fae5", padding: "6px 14px", borderRadius: "8px", fontSize: "13.5px", fontWeight: 600, color: "#047857" }}>{fac}</span>
              ))}
            </div>
          ) : (
            <div style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "15px" }}>No facilities listed.</div>
          )}
        </div>
      )}

      {/* Gallery Section */}
      {(isEditing || (church.gallery && church.gallery.length > 0)) && (
        <div style={{ marginTop: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", margin: 0 }}>Gallery</h2>
            {renderEditButton("gallery")}
          </div>
          {church.gallery && church.gallery.length > 0 ? (
            <Gallery images={church.gallery} />
          ) : (
            <div className="panel" style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px dashed #cbd5e1", color: "var(--muted)", fontSize: "15px", textAlign: "center" }}>
              No gallery images added yet. Click the edit icon to add some.
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {editingField === "about" && (
        <EditTextModal 
          title="Edit About" 
          initialText={church.about || ""} 
          onClose={() => setEditingField(null)} 
          onSave={(text) => { setChurch({ ...church, about: text }); onChurchChange?.({ ...church, about: text }); setEditingField(null); }} 
        />
      )}

      {editingField === "ministries" && (
        <EditTagsModal 
          title="Edit Ministries" 
          initialTags={church.ministries || []} 
          onClose={() => setEditingField(null)} 
          onSave={(tags) => { setChurch({ ...church, ministries: tags }); onChurchChange?.({ ...church, ministries: tags }); setEditingField(null); }} 
        />
      )}

      {editingField === "languages" && (
        <EditTagsModal 
          title="Edit Languages" 
          initialTags={church.languages || []} 
          onClose={() => setEditingField(null)} 
          onSave={(tags) => { setChurch({ ...church, languages: tags }); onChurchChange?.({ ...church, languages: tags }); setEditingField(null); }} 
        />
      )}

      {editingField === "facilities" && (
        <EditTagsModal 
          title="Edit Facilities" 
          initialTags={church.facilities || []} 
          onClose={() => setEditingField(null)} 
          onSave={(tags) => { setChurch({ ...church, facilities: tags }); onChurchChange?.({ ...church, facilities: tags }); setEditingField(null); }} 
        />
      )}

      {editingField === "gallery" && (
        <EditGalleryModal 
          initialGallery={church.gallery || []}
          onClose={() => setEditingField(null)}
          onSave={(gallery) => { setChurch({ ...church, gallery }); onChurchChange?.({ ...church, gallery }); setEditingField(null); }}
        />
      )}
    </div>
  );
}
