"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface EditCoverModalProps {
  church: any;
}

export default function EditCoverModal({ church }: EditCoverModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const [logo, setLogo] = useState<string | null>(church.logo_url || null);
  const [covers, setCovers] = useState<string[]>(church.cover_urls || (church.cover_url ? [church.cover_url] : []));
  const [gallery, setGallery] = useState<string[]>(church.gallery_images || []);
  const [liveStreamUrl, setLiveStreamUrl] = useState(church.live_stream_url || "");
  
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    router.push(`/church/${church.slug}?owner=true`, { scroll: false });
  };

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

  const handleAddCoverUrl = () => {
    if (coverUrlInput.trim()) {
      setCovers([...covers, coverUrlInput.trim()]);
      setCoverUrlInput("");
    }
  };

  const handleAddGalleryUrl = () => {
    if (galleryUrlInput.trim()) {
      setGallery([...gallery, galleryUrlInput.trim()]);
      setGalleryUrlInput("");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/churches/${church.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo_url: logo,
          cover_urls: covers,
          gallery_images: gallery,
          live_stream_url: liveStreamUrl,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to update church");
      }
      router.refresh(); // Refresh the page to reflect changes
      handleClose();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save changes: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.8)", padding: "20px" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "600px", borderRadius: "24px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--cn-border)", position: "sticky", top: 0, background: "#fff", zIndex: 10, borderRadius: "24px 24px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="ti ti-pencil" style={{ fontSize: "20px", color: "var(--cn-purple)" }}></i>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>Edit cover</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "3px 8px", borderRadius: "12px" }}>OWNER</span>
          </div>
          <button onClick={handleClose} style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--cn-gray)" }}>
            <i className="ti ti-x" style={{ fontSize: "16px" }}></i>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "30px" }}>
          
          {/* Logo */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "12px" }}>Church logo</div>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "70px", height: "70px", borderRadius: "16px", background: logo ? `url(${logo}) center/cover` : "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "24px", flexShrink: 0 }}>
                {!logo && church.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <input type="file" accept="image/*" style={{ display: "none" }} ref={logoInputRef} onChange={(e) => handleFileUpload(e, setLogo)} />
                <button onClick={() => logoInputRef.current?.click()} style={{ background: "#f3e8ff", color: "var(--cn-purple)", border: "1px solid #e9d5ff", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginBottom: "6px" }}>
                  Upload logo
                </button>
                <div style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>Square image works best (PNG/JPG).</div>
              </div>
            </div>
          </div>

          {/* Cover Images */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "4px" }}>Cover images <span style={{ color: "var(--cn-gray-light)", fontWeight: 500 }}>· hero slider</span></div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap", marginTop: "12px" }}>
              {covers.map((c, idx) => (
                <div key={idx} style={{ position: "relative", width: "100px", height: "64px", borderRadius: "12px", background: `url(${c}) center/cover`, border: "1px solid var(--cn-border)" }}>
                  <button onClick={() => setCovers(covers.filter((_, i) => i !== idx))} style={{ position: "absolute", top: "-6px", right: "-6px", background: "#0f172a", color: "#fff", border: "none", width: "20px", height: "20px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>×</button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" style={{ display: "none" }} ref={coverInputRef} onChange={(e) => handleFileUpload(e, (b64) => setCovers([...covers, b64]))} />
            <button onClick={() => coverInputRef.current?.click()} style={{ background: "#f8fafc", color: "var(--cn-ink)", border: "1px solid var(--cn-border)", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              + Upload cover image
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>or paste URL</span>
              <input value={coverUrlInput} onChange={(e) => setCoverUrlInput(e.target.value)} placeholder="https://..." style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--cn-border)", outline: "none", fontSize: "13px" }} />
              <button onClick={handleAddCoverUrl} style={{ background: "#f3e8ff", color: "var(--cn-purple)", border: "1px solid #e9d5ff", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Add</button>
            </div>
          </div>

          {/* Watch Live URL */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "8px" }}>Watch live <span style={{ color: "var(--cn-gray-light)", fontWeight: 500 }}>· YouTube URL</span></div>
            <input 
              value={liveStreamUrl} 
              onChange={(e) => setLiveStreamUrl(e.target.value)} 
              placeholder="https://www.youtube.com/watch?v=..." 
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--cn-border)", outline: "none", fontSize: "14px" }} 
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--cn-border)", display: "flex", justifyContent: "flex-end", gap: "12px", position: "sticky", bottom: 0, background: "#fff", borderRadius: "0 0 24px 24px" }}>
          <button onClick={handleClose} style={{ background: "#fff", border: "1px solid var(--cn-border)", padding: "10px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", color: "var(--cn-ink)" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving} style={{ background: "#a855f7", border: "none", padding: "10px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", color: "#fff", opacity: isSaving ? 0.7 : 1 }}>
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
