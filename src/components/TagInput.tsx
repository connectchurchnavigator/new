'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  allOptions?: string[];
  colorClass?: string;
  labelPrefix?: string;
}

/**
 * Modern chip/tag input matching Church onboarding format:
 * 1. Suggestions on TOP (quick picks with purple checkmark when selected)
 * 2. Search / text input box in the MIDDLE (with search icon & interactive A-Z dropdown list)
 * 3. Selected items on the BOTTOM (solid purple pills with × to remove)
 */
export function TagInput({ 
  value, 
  onChange, 
  placeholder = "Type and press Enter...", 
  suggestions = [],
  allOptions,
  labelPrefix = "SELECTED"
}: TagInputProps) {
  const [draft, setDraft] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pool of all selectable options for the dropdown list (sorted A-Z with natural number sorting)
  const sortedDropdownOptions = useMemo(() => {
    const rawList = allOptions && allOptions.length > 0 ? allOptions : suggestions;
    const unique = Array.from(new Set(rawList.filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [allOptions, suggestions]);

  // Filtered list based on draft search
  const filteredOptions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return sortedDropdownOptions;
    const starts = sortedDropdownOptions.filter((item) => item.toLowerCase().startsWith(q));
    const contains = sortedDropdownOptions.filter((item) => !item.toLowerCase().startsWith(q) && item.toLowerCase().includes(q));
    return [...starts, ...contains];
  }, [sortedDropdownOptions, draft]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const trimmedDraft = draft.trim();
  const exactMatch = sortedDropdownOptions.some(
    (item) => item.toLowerCase() === trimmedDraft.toLowerCase()
  );

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

      {/* 2. Search / Input Box in the MIDDLE with dropdown */}
      <div style={{ position: "relative" }} ref={containerRef}>
        <i
          className="ti ti-search"
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "15px",
            color: "var(--cn-gray)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        ></i>
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (trimmedDraft) {
                addTag(trimmedDraft);
                setIsOpen(false);
              }
            }
          }}
          placeholder={placeholder}
          style={{
            paddingLeft: "40px",
            paddingRight: "14px",
            fontSize: "13.5px",
            height: "44px",
            borderRadius: "12px",
            border: isOpen ? "1.5px solid #7e22ce" : "1.5px solid var(--cn-border)",
            width: "100%",
            outline: "none",
            backgroundColor: "#fff",
          }}
          autoComplete="off"
        />

        {/* Dropdown list appearing on click / focus / type */}
        {isOpen && (
          <div
            style={{
              display: "block",
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              maxHeight: "220px",
              overflowY: "auto",
              background: "#fff",
              border: "1.5px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
              zIndex: 1000,
              padding: "4px 0",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: "13px", color: "var(--cn-gray)" }}>
                No match for &quot;{draft}&quot;
              </div>
            ) : (
              filteredOptions.slice(0, 100).map((opt) => {
                const isSelected = value.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => {
                      toggleTag(opt);
                      setDraft('');
                    }}
                    style={{
                      padding: "10px 14px",
                      cursor: "pointer",
                      fontSize: "13.5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isSelected ? "#f3e8ff" : "transparent",
                      color: isSelected ? "#7e22ce" : "var(--cn-ink)",
                      fontWeight: isSelected ? 600 : 400,
                      borderBottom: "1px solid #f8fafc",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span>{opt}</span>
                    {isSelected && <i className="ti ti-check" style={{ fontSize: "14px", color: "#7e22ce" }}></i>}
                  </div>
                );
              })
            )}

            {/* Custom Option Adder when user types something not in the list */}
            {trimmedDraft && !exactMatch && (
              <div
                onClick={() => {
                  addTag(trimmedDraft);
                  setIsOpen(false);
                }}
                style={{
                  padding: "11px 14px",
                  cursor: "pointer",
                  fontSize: "13.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderTop: "1px solid #e2e8f0",
                  background: "#faf5ff",
                  color: "#7e22ce",
                  fontWeight: 700,
                }}
              >
                <i className="ti ti-plus" style={{ fontSize: "14px" }}></i>
                <span>Add &quot;{trimmedDraft}&quot;</span>
              </div>
            )}
          </div>
        )}
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
