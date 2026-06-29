"use client";

import React, { useState, useRef } from "react";
import SharedAddressField from "../add-church/steps/SharedAddressField";

interface AddBranchModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
  initialData?: any;
}

export default function AddBranchModal({ onClose, onSave, onDelete, initialData }: AddBranchModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    address: initialData?.address || "",
    country: initialData?.country || "GB",
    latitude: initialData?.latitude || undefined,
    longitude: initialData?.longitude || undefined,
    denomination: initialData?.denomination || "Non-Denominational"
  });

  const [coverUrl, setCoverUrl] = useState<string>(initialData?.coverUrl || "");
  const [dpUrl, setDpUrl] = useState<string>(initialData?.dpUrl || "");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const dpInputRef = useRef<HTMLInputElement>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "600px", maxHeight: "90vh", borderRadius: "16px", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>{initialData ? "Edit branch" : "Add branch"}</h2>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#d97706", background: "#fef3c7", padding: "4px 8px", borderRadius: "20px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Owner</span>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", border: "none", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Cover image</label>
            <div style={{ 
              width: "100%", height: "140px", borderRadius: "12px", 
              background: coverUrl ? `url(${coverUrl}) center/cover` : "#f8fafc",
              border: coverUrl ? "none" : "2px dashed var(--line)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative"
            }} onClick={() => coverInputRef.current?.click()}>
              {!coverUrl && <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--muted)" }}>Click to upload cover</span>}
              {coverUrl && <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.5)", color: "#fff", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>Change</div>}
            </div>
            <input type="file" accept="image/*" style={{ display: "none" }} ref={coverInputRef} onChange={(e) => handleFileUpload(e, setCoverUrl)} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>DP (Display Picture)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ 
                width: "80px", height: "80px", borderRadius: "16px", 
                background: dpUrl ? `url(${dpUrl}) center/cover` : "#f8fafc",
                border: dpUrl ? "none" : "2px dashed var(--line)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                {!dpUrl && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
              </div>
              <div>
                <input type="file" accept="image/*" style={{ display: "none" }} ref={dpInputRef} onChange={(e) => handleFileUpload(e, setDpUrl)} />
                <button onClick={() => dpInputRef.current?.click()} style={{ background: "#f8fafc", color: "var(--ink)", border: "1px solid var(--line)", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", borderStyle: "solid" }}>
                  Upload DP
                </button>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Branch name</label>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Grace Covenant — Hackney" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
          </div>

          <div style={{ position: "relative", zIndex: 100 }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Address</label>
            <SharedAddressField 
              country={formData.country}
              address={formData.address}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onUpdateCountry={(val) => setFormData(p => ({ ...p, country: val }))}
              onUpdateAddress={(val) => setFormData(p => ({ ...p, address: val }))}
              onUpdateCoordinates={(lat, lng) => setFormData(p => ({ ...p, latitude: lat, longitude: lng }))}
              idPrefix="branch_"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Denomination</label>
            <select name="denomination" value={formData.denomination} onChange={handleChange as any} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px", background: "#fff", cursor: "pointer", appearance: "none" }}>
              <option value="Non-Denominational">Non-Denominational</option>
              <option value="Baptist">Baptist</option>
              <option value="Pentecostal">Pentecostal</option>
              <option value="Catholic">Catholic</option>
              <option value="Methodist">Methodist</option>
              <option value="Presbyterian">Presbyterian</option>
              <option value="Anglican / Episcopal">Anglican / Episcopal</option>
              <option value="Assemblies of God">Assemblies of God</option>
              <option value="Church of God">Church of God</option>
              <option value="Other">Other</option>
            </select>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", background: "#fff", borderRadius: "0 0 16px 16px" }}>
          <div>
            {initialData && onDelete && (
              isConfirmingDelete ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", marginRight: "4px" }}>Are you sure?</span>
                  <button onClick={onDelete} style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "13.5px", fontWeight: 700, border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer" }}>Yes, delete</button>
                  <button onClick={() => setIsConfirmingDelete(false)} style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "13.5px", fontWeight: 700, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", cursor: "pointer" }}>No, cancel</button>
                </div>
              ) : (
                <button onClick={() => setIsConfirmingDelete(true)} style={{ padding: "10px 16px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer" }}>
                  Delete
                </button>
              )
            )}
          </div>
          {!isConfirmingDelete && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => onSave({ ...formData, coverUrl, dpUrl })} style={{ padding: "10px 24px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, background: "var(--purple)", color: "#fff", border: "none", cursor: "pointer" }}>
                Save branch
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
