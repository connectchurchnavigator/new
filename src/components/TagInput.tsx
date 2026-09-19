'use client';

import React, { useState } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  colorClass?: string;
  labelPrefix?: string;
}

/**
 * Modern chip/tag input matching Church onboarding format:
 * 1. Suggestions on TOP (quick picks with purple checkmark when selected)
 * 2. Search / text input box in the MIDDLE (with search icon)
 * 3. Selected items on the BOTTOM (solid purple pills with × to remove)
 */
export function TagInput({ 
  value, 
  onChange, 
  placeholder = "Type and press Enter...", 
  suggestions = [],
  labelPrefix = "SELECTED"
}: TagInputProps) {
  const [draft, setDraft] = useState('');

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || value.includes(clean)) return;
    onChange([...value, clean]);
    setDraft('');
  }

  function toggleTag(tag: string) {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      {/* 1. Suggestions on TOP (Popular / Quick Picks) */}
      {suggestions.length > 0 && (
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {suggestions.map((item) => {
              const isSel = value.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleTag(item)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    border: isSel ? "1.5px solid #7e22ce" : "1.5px solid var(--cn-border)",
                    background: isSel ? "#f3e8ff" : "#fff",
                    color: isSel ? "#7e22ce" : "var(--cn-ink)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isSel && <i className="ti ti-check" style={{ fontSize: "13px", color: "#7e22ce" }}></i>}
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Search / Input Box in the MIDDLE */}
      <div style={{ position: "relative" }}>
        <i
          className="ti ti-search"
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "15px",
            color: "var(--cn-gray)",
          }}
        ></i>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(draft);
            }
          }}
          placeholder={placeholder}
          style={{
            paddingLeft: "40px",
            fontSize: "13.5px",
            height: "44px",
            borderRadius: "12px",
            border: "1.5px solid var(--cn-border)",
            width: "100%",
            outline: "none",
            backgroundColor: "#fff",
          }}
        />
      </div>

      {/* 3. Selected items at the BOTTOM */}
      {value.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--cn-gray)",
              letterSpacing: "0.05em",
              marginBottom: "8px",
            }}
          >
            {labelPrefix} ({value.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {value.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#7e22ce",
                  color: "#fff",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  boxShadow: "0 2px 6px rgba(126, 34, 206, 0.2)",
                }}
              >
                {tag}
                <i
                  className="ti ti-x"
                  onClick={() => removeTag(tag)}
                  style={{ cursor: "pointer", fontSize: "12px", opacity: 0.85 }}
                ></i>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
