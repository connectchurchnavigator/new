"use client";

import React, { useState } from "react";
import SharedAddressField from "@/components/add-church/steps/SharedAddressField";

interface EditContactModalProps {
  initialContact: {
    address: string;
    phone: string;
    email: string;
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
    tiktok: string;
    telegram: string;
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  onClose: () => void;
  onSave: (contact: any) => void;
}

export default function EditContactModal({ initialContact, onClose, onSave }: EditContactModalProps) {
  const [formData, setFormData] = useState({
    ...initialContact,
    country: initialContact.country || "GB",
    city: initialContact.city || "",
    latitude: initialContact.latitude,
    longitude: initialContact.longitude,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", padding: "20px" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "680px", maxHeight: "90vh", borderRadius: "20px", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>Edit Contact & Location</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", border: "none", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Rich Shared Location Component (Country, Find Address, Interactive Map with Draggable Pin, Auto Timezone) */}
          <div>
            <SharedAddressField
              idPrefix="edit-contact-modal"
              country={formData.country || "GB"}
              address={formData.address || ""}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onUpdateCountry={(val) => setFormData((prev) => ({ ...prev, country: val }))}
              onUpdateAddress={(val) => setFormData((prev) => ({ ...prev, address: val }))}
              onUpdateCity={(val) => setFormData((prev) => ({ ...prev, city: val }))}
              onUpdateCoordinates={(lat, lng) => setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
            />
          </div>

          {/* Phone & Email */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Phone</label>
              <input name="phone" value={formData.phone || ""} onChange={handleChange} placeholder="+1 (555) 000-0000" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
            </div>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>Email</label>
              <input name="email" value={formData.email || ""} onChange={handleChange} placeholder="info@church.org" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 style={{ fontSize: "13px", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: "8px", marginBottom: "14px" }}>Social Links</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>Facebook</label>
                  <input name="facebook" value={formData.facebook || ""} onChange={handleChange} placeholder="https://facebook.com/..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
                </div>
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>Instagram</label>
                  <input name="instagram" value={formData.instagram || ""} onChange={handleChange} placeholder="https://instagram.com/..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>YouTube</label>
                  <input name="youtube" value={formData.youtube || ""} onChange={handleChange} placeholder="https://youtube.com/..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
                </div>
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>Twitter</label>
                  <input name="twitter" value={formData.twitter || ""} onChange={handleChange} placeholder="https://x.com/..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>TikTok</label>
                  <input name="tiktok" value={formData.tiktok || ""} onChange={handleChange} placeholder="https://tiktok.com/@..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
                </div>
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>Telegram</label>
                  <input name="telegram" value={formData.telegram || ""} onChange={handleChange} placeholder="https://t.me/..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px" }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--line)", background: "#fff", borderRadius: "0 0 20px 20px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(formData)} style={{ padding: "10px 24px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, background: "var(--purple)", color: "#fff", border: "none", cursor: "pointer" }}>Save</button>
        </div>
      </div>
    </div>
  );
}
