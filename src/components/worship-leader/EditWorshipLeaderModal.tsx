"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

interface EditWorshipLeaderModalProps {
  leader: any;
}

const COMMON_STYLES = [
  "Contemporary", "Gospel", "Afro-Gospel", "Hymns", "Acoustic", "Prophetic", "Spontaneous"
];

const COMMON_INSTRUMENTS = [
  "Vocals", "Piano", "Acoustic guitar", "Electric guitar", "Bass", "Drums", "Keys"
];

const COMMON_AVAILABILITY = [
  "Sundays", "Events & conferences", "Worship nights", "Recordings", "Online / livestream", "Dep / cover"
];

const COMMON_FEES = [
  "Love offering", "Fixed fee", "Fee on request", "Expenses only"
];

export default function EditWorshipLeaderModal({ leader }: EditWorshipLeaderModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"basics" | "sound" | "media">("basics");
  const [isSaving, setIsSaving] = useState(false);

  // Basics state
  const [displayName, setDisplayName] = useState(leader.display_name || "");
  const [tagline, setTagline] = useState(leader.tagline || "");
  const [city, setCity] = useState(leader.city || "");
  const [country, setCountry] = useState(leader.country || "United Kingdom");
  const [yearsLeading, setYearsLeading] = useState(leader.years_leading ? String(leader.years_leading) : "");
  const [travelRange, setTravelRange] = useState(leader.travel_range || "UK-wide");
  const [leadTime, setLeadTime] = useState(leader.lead_time || "2 weeks preferred");
  const [bio, setBio] = useState(leader.bio || "");

  // Tags state
  const existingStyles = (leader.tags || []).filter((t: any) => t.category === "style").map((t: any) => t.label);
  const existingInstruments = (leader.tags || []).filter((t: any) => t.category === "instrument").map((t: any) => t.label);
  const existingLanguages = (leader.tags || []).filter((t: any) => t.category === "language").map((t: any) => t.label);
  const existingAvailable = (leader.tags || []).filter((t: any) => t.category === "available_for").map((t: any) => t.label);
  const existingFee = (leader.tags || []).filter((t: any) => t.category === "fee_model").map((t: any) => t.label);

  const [styles, setStyles] = useState<string[]>(existingStyles);
  const [instruments, setInstruments] = useState<string[]>(existingInstruments);
  const [languages, setLanguages] = useState<string[]>(existingLanguages);
  const [availableFor, setAvailableFor] = useState<string[]>(existingAvailable);
  const [feeModel, setFeeModel] = useState<string[]>(existingFee);

  // Custom addition states
  const [customStyle, setCustomStyle] = useState("");
  const [customInstrument, setCustomInstrument] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  // Media & links state
  const [avatar, setAvatar] = useState<string | null>(leader.avatar_url || null);
  const [covers, setCovers] = useState<string[]>(leader.cover_photo_urls || []);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [songUrl, setSongUrl] = useState(leader.song_url || "");
  const [videoUrl, setVideoUrl] = useState(leader.video_url || "");
  const [spotifyUrl, setSpotifyUrl] = useState(leader.spotify_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(leader.youtube_url || "");
  const [instagramUrl, setInstagramUrl] = useState(leader.instagram_url || "");
  const [websiteUrl, setWebsiteUrl] = useState(leader.website_url || "");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    router.push(`/worship-leader/${leader.slug}?owner=true`, { scroll: false });
  };

  const toggleTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
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
    if (!displayName.trim()) {
      alert("Display name is required");
      setActiveTab("basics");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        display_name: displayName.trim(),
        tagline: tagline.trim() || null,
        city: city.trim() || null,
        country: country.trim() || "United Kingdom",
        bio: bio.trim() || null,
        years_leading: parseInt(yearsLeading) || 0,
        travel_range: travelRange.trim() || null,
        lead_time: leadTime.trim() || null,
        avatar_url: avatar,
        cover_photo_urls: covers,
        song_url: songUrl.trim() || null,
        video_url: videoUrl.trim() || null,
        spotify_url: spotifyUrl.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        website_url: websiteUrl.trim() || null,
        styles,
        instruments,
        languages,
        available_for: availableFor,
        fee_model: feeModel,
      };

      const res = await fetch(`/api/worship-leaders/${leader.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to update worship leader profile");
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

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(6px)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: "680px",
          borderRadius: "24px",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--cn-border)",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10,
            borderRadius: "24px 24px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #a855f7, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <i className="ti ti-pencil" style={{ fontSize: "18px" }}></i>
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "var(--cn-ink)" }}>
                Edit Worship Leader Profile
              </h2>
              <div style={{ fontSize: "12px", color: "var(--cn-gray)" }}>
                Update your sound, availability, bio, and media
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <i className="ti ti-x" style={{ fontSize: "16px" }}></i>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--cn-border)", padding: "0 24px", background: "#faf5ff" }}>
          <button
            type="button"
            onClick={() => setActiveTab("basics")}
            style={{
              padding: "12px 18px",
              fontWeight: 700,
              fontSize: "13.5px",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: activeTab === "basics" ? "#7c3aed" : "#64748b",
              borderBottom: activeTab === "basics" ? "2.5px solid #7c3aed" : "2.5px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <i className="ti ti-user"></i> Basics & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sound")}
            style={{
              padding: "12px 18px",
              fontWeight: 700,
              fontSize: "13.5px",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: activeTab === "sound" ? "#7c3aed" : "#64748b",
              borderBottom: activeTab === "sound" ? "2.5px solid #7c3aed" : "2.5px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <i className="ti ti-music"></i> Sound & Booking
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            style={{
              padding: "12px 18px",
              fontWeight: 700,
              fontSize: "13.5px",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: activeTab === "media" ? "#7c3aed" : "#64748b",
              borderBottom: activeTab === "media" ? "2.5px solid #7c3aed" : "2.5px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <i className="ti ti-photo"></i> Photos & Links
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* TAB 1: BASICS */}
          {activeTab === "basics" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                  Display Name *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. David Okonkwo"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--cn-border)", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                  Professional Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Contemporary & Afro-Gospel Worship Leader"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--cn-border)", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. London"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--cn-border)", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United Kingdom"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--cn-border)", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                    Years of Leading Experience
                  </label>
                  <input
                    type="number"
                    value={yearsLeading}
                    onChange={(e) => setYearsLeading(e.target.value)}
                    placeholder="e.g. 10"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--cn-border)", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                    Travel Range
                  </label>
                  <input
                    type="text"
                    value={travelRange}
                    onChange={(e) => setTravelRange(e.target.value)}
                    placeholder="e.g. UK-wide & International"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--cn-border)", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                  Short Bio & Ministry Calling
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your story, ministry vision, and heart for worship..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--cn-border)", fontSize: "14px", resize: "vertical" }}
                />
              </div>
            </>
          )}

          {/* TAB 2: SOUND & BOOKING */}
          {activeTab === "sound" && (
            <>
              {/* Musical Styles */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>
                  Musical Styles
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                  {Array.from(new Set([...COMMON_STYLES, ...styles])).map((s) => {
                    const sel = styles.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleTag(styles, setStyles, s)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: sel ? "1.5px solid #7c3aed" : "1.5px solid #e2e8f0",
                          background: sel ? "#f3e8ff" : "#fff",
                          color: sel ? "#7c3aed" : "#475569",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {sel && <i className="ti ti-check" style={{ marginRight: "4px" }}></i>}
                        {s}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Add custom style..."
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--cn-border)", fontSize: "13px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customStyle.trim() && !styles.includes(customStyle.trim())) {
                        setStyles([...styles, customStyle.trim()]);
                        setCustomStyle("");
                      }
                    }}
                    style={{ padding: "8px 16px", borderRadius: "8px", background: "#7c3aed", color: "#fff", border: "none", fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Instruments & Vocals */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>
                  Instruments & Vocals
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                  {Array.from(new Set([...COMMON_INSTRUMENTS, ...instruments])).map((inst) => {
                    const sel = instruments.includes(inst);
                    return (
                      <button
                        key={inst}
                        type="button"
                        onClick={() => toggleTag(instruments, setInstruments, inst)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: sel ? "1.5px solid #059669" : "1.5px solid #e2e8f0",
                          background: sel ? "#ecfdf5" : "#fff",
                          color: sel ? "#059669" : "#475569",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {sel && <i className="ti ti-check" style={{ marginRight: "4px" }}></i>}
                        {inst}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Add custom instrument..."
                    value={customInstrument}
                    onChange={(e) => setCustomInstrument(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--cn-border)", fontSize: "13px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customInstrument.trim() && !instruments.includes(customInstrument.trim())) {
                        setInstruments([...instruments, customInstrument.trim()]);
                        setCustomInstrument("");
                      }
                    }}
                    style={{ padding: "8px 16px", borderRadius: "8px", background: "#059669", color: "#fff", border: "none", fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Available For & Fee Preference */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>
                    Available For
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {COMMON_AVAILABILITY.map((av) => {
                      const sel = availableFor.includes(av);
                      return (
                        <label key={av} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", color: "#334155" }}>
                          <input
                            type="checkbox"
                            checked={sel}
                            onChange={() => toggleTag(availableFor, setAvailableFor, av)}
                            style={{ accentColor: "#7c3aed" }}
                          />
                          {av}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>
                    Fee / Honorarium Model
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {COMMON_FEES.map((f) => {
                      const sel = feeModel.includes(f);
                      return (
                        <label key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", color: "#334155" }}>
                          <input
                            type="checkbox"
                            checked={sel}
                            onChange={() => toggleTag(feeModel, setFeeModel, f)}
                            style={{ accentColor: "#7c3aed" }}
                          />
                          {f}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Lead time */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px" }}>
                  Preferred Lead Time
                </label>
                <input
                  type="text"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  placeholder="e.g. 2-4 weeks preferred"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--cn-border)", fontSize: "14px" }}
                />
              </div>
            </>
          )}

          {/* TAB 3: MEDIA & LINKS */}
          {activeTab === "media" && (
            <>
              {/* Profile Photo */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>
                  Profile Photo
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "18px",
                      background: avatar ? `url('${avatar}') center/cover` : "#f3e8ff",
                      border: "2px dashed #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      color: "#7c3aed",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {!avatar && <i className="ti ti-user"></i>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileUpload(e, setAvatar)}
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      style={{ padding: "8px 16px", borderRadius: "8px", background: "#f1f5f9", border: "1px solid var(--cn-border)", fontWeight: 700, fontSize: "12.5px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <i className="ti ti-upload"></i> Upload new photo
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar(null)}
                        style={{ background: "none", border: "none", color: "#ef4444", fontSize: "12px", fontWeight: 700, cursor: "pointer", textAlign: "left" }}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Banner Photos */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>
                  Hero Cover Photos
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px", marginBottom: "10px" }}>
                  {covers.map((c, i) => (
                    <div key={i} style={{ position: "relative", height: "70px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--cn-border)" }}>
                      <img src={c} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => setCovers(covers.filter((_, idx) => idx !== i))}
                        style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", cursor: "pointer" }}
                      >
                        <i className="ti ti-x"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Paste image URL (https://...)"
                    value={coverUrlInput}
                    onChange={(e) => setCoverUrlInput(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--cn-border)", fontSize: "13px" }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCoverUrl}
                    style={{ padding: "8px 14px", borderRadius: "8px", background: "#f1f5f9", border: "1px solid var(--cn-border)", fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}
                  >
                    Add URL
                  </button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileUpload(e, (base64) => setCovers([...covers, base64]))}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    style={{ padding: "8px 14px", borderRadius: "8px", background: "#7c3aed", color: "#fff", border: "none", fontWeight: 700, fontSize: "12.5px", cursor: "pointer" }}
                  >
                    Upload
                  </button>
                </div>
              </div>

              {/* Audio & Video Media Files / Links */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>
                  Audio Track (URL or Direct Link)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <i className="ti ti-headphones" style={{ fontSize: "20px", color: "#0891b2" }}></i>
                  <input
                    type="text"
                    placeholder="https://... (mp3 or audio stream URL)"
                    value={songUrl}
                    onChange={(e) => setSongUrl(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1.5px solid var(--cn-border)", fontSize: "13px" }}
                  />
                </div>

                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>
                  Live Video / Performance (Direct Video URL)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <i className="ti ti-video" style={{ fontSize: "20px", color: "#dc2626" }}></i>
                  <input
                    type="text"
                    placeholder="https://... (mp4, video stream, or cloud link)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1.5px solid var(--cn-border)", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Streaming & Social Links */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px" }}>
                  Streaming & Social Links
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <i className="ti ti-brand-spotify" style={{ fontSize: "20px", color: "#1db954" }}></i>
                    <input
                      type="text"
                      placeholder="https://open.spotify.com/artist/..."
                      value={spotifyUrl}
                      onChange={(e) => setSpotifyUrl(e.target.value)}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--cn-border)", fontSize: "13px" }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <i className="ti ti-brand-youtube" style={{ fontSize: "20px", color: "#ef4444" }}></i>
                    <input
                      type="text"
                      placeholder="https://youtube.com/@..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--cn-border)", fontSize: "13px" }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <i className="ti ti-brand-instagram" style={{ fontSize: "20px", color: "#e1306c" }}></i>
                    <input
                      type="text"
                      placeholder="https://instagram.com/..."
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--cn-border)", fontSize: "13px" }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <i className="ti ti-world" style={{ fontSize: "20px", color: "#64748b" }}></i>
                    <input
                      type="text"
                      placeholder="https://yourwebsite.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--cn-border)", fontSize: "13px" }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "18px 24px",
            borderTop: "1px solid var(--cn-border)",
            position: "sticky",
            bottom: 0,
            background: "#fff",
            borderRadius: "0 0 24px 24px",
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: "#f1f5f9",
              border: "1px solid var(--cn-border)",
              fontWeight: 700,
              fontSize: "13.5px",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              background: "#7c3aed",
              border: "none",
              color: "#fff",
              fontWeight: 800,
              fontSize: "13.5px",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.7 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
            }}
          >
            {isSaving ? (
              <>
                <i className="ti ti-loader-2 spin"></i> Saving changes…
              </>
            ) : (
              <>
                <i className="ti ti-check"></i> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
