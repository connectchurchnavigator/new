"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import SharedAddressField from "@/components/add-church/steps/SharedAddressField";

interface EditCoverModalProps {
  church: any;
}

export default function EditCoverModal({ church }: EditCoverModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Parse established year from denomination serialization if present
  let initialDenom = church.denomination || "";
  let initialEstYear = "";
  if (initialDenom.includes('|||est:')) {
    const parts = initialDenom.split('|||est:');
    initialDenom = parts[0];
    initialEstYear = parts[1] || "";
  } else if (church.established_year) {
    initialEstYear = String(church.established_year);
  }

  const [name, setName] = useState(church.name || "");
  const [denomination, setDenomination] = useState(initialDenom);
  const [establishedYear, setEstablishedYear] = useState(initialEstYear);
  const [address, setAddress] = useState(church.address_line || "");
  const [city, setCity] = useState(church.city || "");
  const [country, setCountry] = useState(church.country || "GB");
  const [latitude, setLatitude] = useState<number | undefined>(church.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(church.longitude);

  const [logo, setLogo] = useState<string | null>(church.logo_url || null);
  const [covers, setCovers] = useState<string[]>(church.cover_urls || (church.cover_url ? [church.cover_url] : []));
  const [coverUrlInput, setCoverUrlInput] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Serialize established year with denomination to preserve it cleanly in Supabase
      const fullDenomination = establishedYear.trim()
        ? `${denomination.trim()}|||est:${establishedYear.trim()}`
        : denomination.trim();

      const res = await fetch(`/api/churches/${church.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          denomination: fullDenomination,
          address_line: address,
          city,
          country,
          latitude,
          longitude,
          logo_url: logo,
          cover_urls: covers,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to update church");
      }
      router.refresh();
      handleClose();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save changes: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  const denominationOptions = [
    "Pentecostal",
    "Baptist",
    "Catholic",
    "Anglican",
    "Non-Denominational",
    "Methodist",
    "Orthodox",
    "Presbyterian",
    "Seventh-day Adventist",
    "Lutheran",
    "Charismatic",
    "Evangelical",
    "Assemblies of God",
    "Redeemed Christian Church of God (RCCG)",
    "Living Faith Church (Winners Chapel)",
    "Christ Embassy",
    "Church of England",
    "Apostolic",
    "Independent",
    "Other"
  ];

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(6px)", padding: "20px" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "680px", borderRadius: "24px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--cn-border)", position: "sticky", top: 0, background: "#fff", zIndex: 10, borderRadius: "24px 24px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="ti ti-pencil" style={{ fontSize: "20px", color: "var(--cn-purple)" }}></i>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>Edit church profile & cover</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "3px 8px", borderRadius: "12px" }}>OWNER</span>
          </div>
          <button onClick={handleClose} style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--cn-gray)" }}>
            <i className="ti ti-x" style={{ fontSize: "16px" }}></i>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Church Basics */}
          <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
              General Information
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                Church Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grace Cathedral International"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--cn-border)", outline: "none", fontSize: "14px", background: "#fff" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                  Denomination
                </label>
                <select
                  value={denomination}
                  onChange={(e) => setDenomination(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid var(--cn-border)",
                    outline: "none",
                    fontSize: "14px",
                    background: "#fff",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <option value="">Select Denomination</option>
                  {denomination && !denominationOptions.includes(denomination) && (
                    <option value={denomination}>{denomination}</option>
                  )}
                  {denominationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                  Established Year
                </label>
                <input
                  value={establishedYear}
                  onChange={(e) => setEstablishedYear(e.target.value)}
                  placeholder="e.g. 1995"
                  maxLength={4}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--cn-border)", outline: "none", fontSize: "14px", background: "#fff" }}
                />
              </div>
            </div>
          </div>

          {/* Location along with map (Same as in Step 1) */}
          <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: "14px" }}>
              Location & Map Pin
            </div>
            <SharedAddressField
              idPrefix="edit-cover-modal"
              country={country || "GB"}
              address={address || ""}
              latitude={latitude}
              longitude={longitude}
              onUpdateCountry={(val) => setCountry(val)}
              onUpdateAddress={(val) => setAddress(val)}
              onUpdateCity={(val) => setCity(val)}
              onUpdateCoordinates={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
          </div>

          {/* Logo */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "12px" }}>Church logo</div>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "70px", height: "70px", borderRadius: "16px", background: logo ? `url(${logo}) center/cover` : "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "24px", flexShrink: 0 }}>
                {!logo && (name ? name.substring(0, 2).toUpperCase() : "CH")}
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
    </div>,
    document.body
  );
}
