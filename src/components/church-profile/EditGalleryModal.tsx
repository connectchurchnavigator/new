"use client";

import React, { useState, useRef } from "react";

interface EditGalleryModalProps {
  initialGallery: string[];
  onClose: () => void;
  onSave: (gallery: string[]) => void;
}

export default function EditGalleryModal({ initialGallery, onClose, onSave }: EditGalleryModalProps) {
  const [gallery, setGallery] = useState<string[]>(initialGallery || []);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGallery([...gallery, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const addUrl = () => {
    if (urlInput.trim()) {
      setGallery([...gallery, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    setGallery(newGallery);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "600px", maxHeight: "90vh", borderRadius: "16px", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>Edit Gallery</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", border: "none", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {gallery.map((img, idx) => (
              <div key={idx} style={{ position: "relative", width: "100px", height: "100px", borderRadius: "12px", overflow: "hidden" }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => removeImage(idx)} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Add Image</label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input type="file" accept="image/*" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} style={{ padding: "10px 16px", borderRadius: "10px", background: "#f8fafc", border: "1px solid var(--line)", color: "var(--ink)", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                Upload File
              </button>
              <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 700 }}>OR</span>
              <div style={{ display: "flex", flex: 1, gap: "8px" }}>
                <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Paste image URL..." style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14px" }} />
                <button onClick={addUrl} style={{ padding: "10px 16px", borderRadius: "10px", background: "var(--ink)", color: "#fff", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Add</button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--line)", background: "#fff", borderRadius: "0 0 16px 16px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(gallery)} style={{ padding: "10px 24px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, background: "var(--purple)", color: "#fff", border: "none", cursor: "pointer" }}>Save</button>
        </div>
      </div>
    </div>
  );
}
