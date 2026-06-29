"use client";

import React, { useState } from "react";

const PRESET_OPTIONS: Record<string, { label: string; icon: string }[]> = {
  ministries: [
    { label: "Youth Ministry", icon: "👦" },
    { label: "Children's Church", icon: "🧒" },
    { label: "Food Bank", icon: "🍞" },
    { label: "Bible Study", icon: "📖" },
    { label: "Outreach", icon: "🤝" },
    { label: "Women's Ministry", icon: "👩" },
    { label: "Men's Ministry", icon: "👨" },
    { label: "Prayer Group", icon: "🙏" },
    { label: "Worship Team", icon: "🎵" },
    { label: "Marriage Ministry", icon: "💍" },
    { label: "Campus Ministry", icon: "🎓" },
    { label: "Missions", icon: "✈️" },
    { label: "Community Service", icon: "🏘️" },
    { label: "Small Groups", icon: "👥" },
    { label: "Counseling", icon: "💬" },
    { label: "Evangelism", icon: "📢" },
  ],
  languages: [
    { label: "English", icon: "🇬🇧" },
    { label: "Spanish", icon: "🇪🇸" },
    { label: "French", icon: "🇫🇷" },
    { label: "Portuguese", icon: "🇵🇹" },
    { label: "Swahili", icon: "🌍" },
    { label: "Yoruba", icon: "🌍" },
    { label: "Igbo", icon: "🌍" },
    { label: "Hausa", icon: "🌍" },
    { label: "German", icon: "🇩🇪" },
    { label: "Arabic", icon: "🇸🇦" },
    { label: "Hindi", icon: "🇮🇳" },
    { label: "Chinese", icon: "🇨🇳" },
    { label: "Korean", icon: "🇰🇷" },
    { label: "Tagalog", icon: "🇵🇭" },
    { label: "Romanian", icon: "🇷🇴" },
    { label: "Polish", icon: "🇵🇱" },
  ],
  facilities: [
    { label: "Parking", icon: "🚗" },
    { label: "Wheelchair Access", icon: "♿" },
    { label: "Nursery", icon: "🍼" },
    { label: "Café", icon: "☕" },
    { label: "Wi-Fi", icon: "📶" },
    { label: "Live Stream", icon: "📡" },
    { label: "Bookshop", icon: "📚" },
    { label: "Prayer Room", icon: "🕊️" },
    { label: "Conference Rooms", icon: "🏢" },
    { label: "Sound System", icon: "🎤" },
    { label: "Kids Play Area", icon: "🛝" },
    { label: "Air Conditioning", icon: "❄️" },
  ],
  default: [],
};

interface EditTagsModalProps {
  title: string;
  initialTags: string[];
  onClose: () => void;
  onSave: (tags: string[]) => void;
}

export default function EditTagsModal({ title, initialTags, onClose, onSave }: EditTagsModalProps) {
  // Figure out which preset list to use
  const key = title.toLowerCase().includes("ministr") ? "ministries"
    : title.toLowerCase().includes("lang") ? "languages"
    : title.toLowerCase().includes("facilit") ? "facilities"
    : "default";

  const presets = PRESET_OPTIONS[key] || [];

  const [selected, setSelected] = useState<string[]>(initialTags);
  const [customInput, setCustomInput] = useState("");

  const toggle = (label: string) => {
    setSelected(prev =>
      prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]
    );
  };

  const addCustom = () => {
    const val = customInput.trim();
    if (val && !selected.includes(val)) {
      setSelected(prev => [...prev, val]);
    }
    setCustomInput("");
  };

  const removeTag = (label: string) => {
    setSelected(prev => prev.filter(t => t !== label));
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", padding: "16px" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "620px", borderRadius: "20px", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", color: "#64748b" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>

          {/* Selected tags at top */}
          {selected.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Selected</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {selected.map(tag => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#7c3aed", color: "#fff", padding: "7px 14px", borderRadius: "30px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }} onClick={() => removeTag(tag)}>
                    {tag}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </span>
                ))}
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginTop: "16px" }} />
            </div>
          )}

          {/* Preset chips */}
          {presets.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Browse all categories to discover more</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {presets.filter(p => !selected.includes(p.label)).map(p => (
                  <span
                    key={p.label}
                    onClick={() => toggle(p.label)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#334155", padding: "7px 14px", borderRadius: "30px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#7c3aed"; (e.currentTarget as HTMLElement).style.color = "#7c3aed"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.color = "#334155"; }}
                  >
                    <span>{p.icon}</span> {p.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom input */}
          <div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
                placeholder={`Don't see yours? Type a custom ${key === "default" ? "item" : key.slice(0, -1)} — e.g. ${key === "ministries" ? "Prison Ministry" : key === "languages" ? "Twi" : "Recording Studio"}`}
                style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "#0f172a" }}
              />
              <button
                onClick={addCustom}
                style={{ padding: "12px 20px", borderRadius: "12px", background: "#7c3aed", color: "#fff", border: "none", fontWeight: 800, fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                + Add
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #e2e8f0", background: "#fff", borderRadius: "0 0 20px 20px" }}>
          <button onClick={onClose} style={{ padding: "11px 22px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={() => onSave(selected)} style={{ padding: "11px 26px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer" }}>
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
