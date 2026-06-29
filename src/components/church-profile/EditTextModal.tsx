"use client";

import React, { useState } from "react";

interface EditTextModalProps {
  title: string;
  initialText: string;
  onClose: () => void;
  onSave: (text: string) => void;
}

export default function EditTextModal({ title, initialText, onClose, onSave }: EditTextModalProps) {
  const [text, setText] = useState(initialText);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "600px", borderRadius: "16px", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", border: "none", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            rows={10} 
            style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid var(--line)", outline: "none", fontSize: "14.5px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" }} 
            placeholder="Type here..."
          />
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--line)", background: "#fff", borderRadius: "0 0 16px 16px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={() => onSave(text)} style={{ padding: "10px 24px", borderRadius: "12px", fontSize: "14.5px", fontWeight: 700, background: "var(--purple)", color: "#fff", border: "none", cursor: "pointer" }}>
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
