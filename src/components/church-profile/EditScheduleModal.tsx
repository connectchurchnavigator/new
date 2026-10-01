"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

function parseTimeString(v: string) {
  v = (v || "").trim();
  if (!v) return null;
  if (/^noon$/i.test(v)) return { h: 12, m: "00", ampm: "PM", ambiguous: false };
  if (/^midnight$/i.test(v)) return { h: 12, m: "00", ampm: "AM", ambiguous: false };
  
  let rawStr = v;
  // Match pure digits or digits with am/pm: e.g. "111", "1111", "111am"
  const digitsMatch = v.match(/^(\d{1,4})\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (digitsMatch) {
    const digits = digitsMatch[1];
    const modifier = digitsMatch[2] || '';
    if (digits.length === 1 || digits.length === 2) {
      // "1" -> "1:00", "11" -> "11:00"
      rawStr = `${digits}:00${modifier}`;
    } else if (digits.length === 3) {
      // e.g. "111" -> "1:11"
      const hStr = digits.substring(0, 1);
      const mStr = digits.substring(1);
      rawStr = `${hStr}:${mStr}${modifier}`;
    } else if (digits.length === 4) {
      // e.g. "1111" -> "11:11"
      const hStr = digits.substring(0, 2);
      const mStr = digits.substring(2);
      rawStr = `${hStr}:${mStr}${modifier}`;
    }
  }

  const match = rawStr.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  let m = match[2] || "00";
  let explicitAmPm = match[3] ? match[3].replace(/\./g, "").toUpperCase() : null;
  if (h > 23 || parseInt(m, 10) > 59) return null;
  let ampm: string, ambiguous: boolean;
  if (explicitAmPm) {
    ampm = explicitAmPm;
    if (h > 12) return null;
    if (h === 0) h = 12;
    ambiguous = false;
  } else if (h > 12) {
    ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    ambiguous = false;
  } else {
    ampm = h >= 8 && h <= 12 ? "AM" : "PM";
    ambiguous = true;
  }
  return { h, m: m.padStart(2, "0"), ampm, ambiguous };
}

function formatTime(p: { h: number; m: string; ampm: string }) {
  return `${p.h}:${p.m} ${p.ampm}`;
}

interface TimeInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

function TimeInput({ value, onChange, placeholder }: TimeInputProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);
  const [parsedTime, setParsedTime] = useState<any>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  useEffect(() => {
    setInputValue(value || "");
    if (!value) {
      setError(false);
      setParsedTime(null);
    } else {
      const parsed = parseTimeString(value);
      setError(!parsed);
    }
  }, [value]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    setHighlightedIndex(0);
    if (!val.trim()) {
      setIsOpen(false);
      setError(false);
      setParsedTime(null);
      onChange("");
      return;
    }

    const parsed = parseTimeString(val);
    setParsedTime(parsed);

    if (!parsed) {
      setError(true);
      setIsOpen(true);
      onChange("");
    } else if (!parsed.ambiguous) {
      setError(false);
      const formatted = formatTime(parsed);
      onChange(formatted);
      setIsOpen(false);
    } else {
      setError(true);
      setIsOpen(true);
      onChange("");
    }
  };

  const selectOption = (formattedTime: string) => {
    setInputValue(formattedTime);
    onChange(formattedTime);
    setIsOpen(false);
    setError(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !parsedTime || !parsedTime.ambiguous) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev === 0 ? 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev === 1 ? 0 : 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosenAmPm = highlightedIndex === 0 ? "AM" : "PM";
      selectOption(formatTime({ ...parsedTime, ampm: chosenAmPm }));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const isValid = Boolean(value && !error);
  const isInvalid = Boolean(inputValue.trim() && (error || !isValid));

  return (
    <div style={{ position: "relative" }}>
      <input
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (inputValue) {
            const parsed = parseTimeString(inputValue);
            if (parsed && parsed.ambiguous) {
              setIsOpen(true);
              setHighlightedIndex(0);
            }
          }
        }}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 200);
        }}
        placeholder={placeholder}
        style={{
          width: "100%",
          fontSize: "13px",
          padding: "10px 12px",
          borderRadius: "10px",
          outline: "none",
          border: isInvalid ? "1.5px solid #ef4444" : isValid ? "1.5px solid #16a34a" : "1.5px solid #cbd5e1",
          backgroundColor: isInvalid ? "#fef2f2" : isValid ? "#f0fdf4" : "#fff",
          transition: "all 0.15s ease"
        }}
      />
      {isOpen && (
        <div 
          className="autocomplete-dropdown" 
          style={{ 
            position: "absolute", 
            top: "calc(100% + 4px)", 
            left: 0, 
            zIndex: 9999, 
            background: "#fff", 
            borderRadius: "10px", 
            border: "1px solid #e2e8f0", 
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)", 
            minWidth: "190px", 
            display: "block", 
            overflow: "hidden" 
          }}
        >
          {parsedTime && parsedTime.ambiguous ? (
            <div>
              <div
                onMouseDown={() => selectOption(formatTime({ ...parsedTime, ampm: "AM" }))}
                onMouseEnter={() => setHighlightedIndex(0)}
                className="autocomplete-item"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "9px 12px", 
                  gap: "8px", 
                  background: highlightedIndex === 0 ? "#f5f3ff" : "#fff", 
                  cursor: "pointer", 
                  whiteSpace: "nowrap" 
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  {formatTime({ ...parsedTime, ampm: "AM" })}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "#64748b" }}>Morning</span>
              </div>
              <div
                onMouseDown={() => selectOption(formatTime({ ...parsedTime, ampm: "PM" }))}
                onMouseEnter={() => setHighlightedIndex(1)}
                className="autocomplete-item"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "9px 12px", 
                  gap: "8px", 
                  background: highlightedIndex === 1 ? "#f5f3ff" : "#fff", 
                  cursor: "pointer", 
                  whiteSpace: "nowrap" 
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  {formatTime({ ...parsedTime, ampm: "PM" })}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "#64748b" }}>Evening</span>
              </div>
            </div>
          ) : parsedTime && !parsedTime.ambiguous ? (
            <div style={{ padding: "9px 12px", fontSize: "12px", color: "#7e22ce", fontWeight: 600, textAlign: "left" }}>
              → {formatTime(parsedTime)}
            </div>
          ) : error ? (
            <div style={{ padding: "10px 14px", fontSize: "12px", color: "#ef4444" }}>
              Invalid time format <br />
              <span style={{ color: "#6b7280", fontSize: "11px", fontWeight: 400 }}>— try 10am or 10:30am</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

interface EditScheduleModalProps {
  initialSchedule: any[];
  onClose: () => void;
  onSave: (schedule: any[]) => void;
}

export default function EditScheduleModal({ initialSchedule, onClose, onSave }: EditScheduleModalProps) {
  const [services, setServices] = useState<any[]>(() => {
    if (initialSchedule && Array.isArray(initialSchedule) && initialSchedule.length > 0) {
      return initialSchedule.map((svc, i) => {
        let fmt = (svc.format || "inperson").toLowerCase();
        if (fmt === "in-person") fmt = "inperson";
        return {
          id: svc.id || i + 1,
          day: svc.day || "Sunday",
          name: svc.name || "",
          from: svc.from || svc.start_time || "",
          to: svc.to || svc.end_time || "",
          format: fmt
        };
      });
    }
    return [
      { id: 1, day: "Sunday", name: "", from: "", to: "", format: "inperson" }
    ];
  });

  const [error, setError] = useState<string>("");

  const updateServiceField = (id: any, field: string, value: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleFormat = (id: any, format: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, format } : s));
  };

  const addService = () => {
    const isAnyRowIncompleteOrInvalid = services.some(s => {
      if (!s.name?.trim() || !s.from?.trim() || !s.to?.trim()) return true;
      if (!parseTimeString(s.from)) return true;
      if (!parseTimeString(s.to)) return true;
      return false;
    });

    if (isAnyRowIncompleteOrInvalid) {
      setError("Please complete all fields for existing service times before adding a new one.");
      return;
    }

    setError("");
    setServices(prev => [
      ...prev, 
      { id: Date.now(), day: "Sunday", name: "", from: "", to: "", format: "inperson" }
    ]);
  };

  const removeService = (id: any) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = () => {
    const filledServices = services.filter(s => s.name?.trim() || s.from?.trim() || s.to?.trim());

    if (filledServices.length === 0) {
      setError("Please add at least one service time.");
      return;
    }

    const invalidService = filledServices.find(s => {
      if (!s.name?.trim() || !s.from?.trim() || !s.to?.trim()) return true;
      
      const fromVal = s.from?.trim();
      const toVal = s.to?.trim();
      if (fromVal && !parseTimeString(fromVal)) return true;
      if (toVal && !parseTimeString(toVal)) return true;
      return false;
    });

    if (invalidService) {
      setError("Please complete all service fields (Name, From, and To times are required).");
      return;
    }

    setError("");
    
    // Map to canonical format for database and church state
    const formattedSchedule = filledServices.map((svc, i) => {
      const fromParsed = parseTimeString(svc.from);
      const toParsed = parseTimeString(svc.to);
      const fromFormatted = fromParsed ? formatTime(fromParsed) : svc.from;
      const toFormatted = toParsed ? formatTime(toParsed) : svc.to;
      const fmtLabel = svc.format === "online" ? "Online" : svc.format === "hybrid" ? "Hybrid" : "In-Person";

      return {
        ...svc,
        start_time: fromFormatted,
        end_time: toFormatted,
        from: fromFormatted,
        to: toFormatted,
        format: fmtLabel,
        display_order: i
      };
    });

    onSave(formattedSchedule);
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.75)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
        padding: "20px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "#fff"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "11px",
                background: "linear-gradient(135deg, #34d399, #059669)",
                color: "#fff",
                display: "grid",
                placeItems: "center"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
                Edit Schedule
              </h2>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Manage your regular service days and times</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              border: "none",
              cursor: "pointer"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Schedule Rows (Same layout as Step 2) */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            {services.map((svc) => (
              <div 
                key={svc.id} 
                style={{ 
                  border: "1.5px solid #e2e8f0", 
                  borderRadius: "14px", 
                  padding: "16px", 
                  marginBottom: "14px",
                  background: "#ffffff"
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1.35fr 1fr 1fr 40px", gap: "10px", alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "5px" }}>DAY</div>
                    <select 
                      value={svc.day} 
                      onChange={(e) => updateServiceField(svc.id, "day", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 10px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13px",
                        fontWeight: 600,
                        background: "#fff",
                        outline: "none"
                      }}
                    >
                      <option>Sunday</option><option>Monday</option><option>Tuesday</option>
                      <option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "5px" }}>SERVICE NAME</div>
                    <input 
                      placeholder="e.g. Main Service" 
                      style={{ 
                        fontSize: "13px", 
                        padding: "10px 12px",
                        borderRadius: "10px",
                        outline: "none",
                        width: "100%",
                        border: (!svc.name && svc.from && !error) ? "1.5px solid #ef4444" : svc.name ? "1.5px solid #16a34a" : "1.5px solid #cbd5e1",
                        backgroundColor: (!svc.name && svc.from && !error) ? "#fef2f2" : svc.name ? "#f0fdf4" : "#fff"
                      }} 
                      value={svc.name || ""} 
                      onChange={(e) => updateServiceField(svc.id, "name", e.target.value)}
                      onBlur={(e) => {
                        const val = e.target.value.replace(/\s+/g, ' ').trim().replace(/(^|\s)(\w)/g, (m: string, p: string, c: string) => p + c.toUpperCase());
                        updateServiceField(svc.id, "name", val);
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "5px" }}>FROM</div>
                    <TimeInput 
                      value={svc.from || ""} 
                      onChange={(val) => updateServiceField(svc.id, "from", val)} 
                      placeholder="e.g. 10am, 11:30" 
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "5px" }}>TO</div>
                    <TimeInput 
                      value={svc.to || ""} 
                      onChange={(val) => updateServiceField(svc.id, "to", val)} 
                      placeholder="e.g. 1pm, 13:00" 
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "transparent", marginBottom: "5px" }}>.</div>
                    <button 
                      type="button"
                      onClick={() => removeService(svc.id)}
                      title="Delete service"
                      style={{ 
                        width: "38px", 
                        height: "38px", 
                        background: "#fff", 
                        border: "1.5px solid #cbd5e1", 
                        color: "#be123c", 
                        borderRadius: "10px", 
                        padding: 0, 
                        cursor: "pointer", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Format buttons matching Step 2 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Format:</div>
                  <button 
                    type="button"
                    onClick={() => toggleFormat(svc.id, 'inperson')} 
                    style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "5px", 
                      padding: "6px 12px", 
                      borderRadius: "9px", 
                      background: svc.format === 'inperson' ? "#f5f3ff" : "#fff", 
                      border: `1.5px solid ${svc.format === 'inperson' ? "#7c3aed" : "#cbd5e1"}`, 
                      color: svc.format === 'inperson' ? "#6d28d9" : "#64748b", 
                      fontSize: "12px", 
                      fontWeight: svc.format === 'inperson' ? 700 : 500, 
                      cursor: "pointer", 
                      transition: "all 0.15s" 
                    }}
                  >
                    ⛪ In-Person
                  </button>
                  <button 
                    type="button"
                    onClick={() => toggleFormat(svc.id, 'online')} 
                    style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "5px", 
                      padding: "6px 12px", 
                      borderRadius: "9px", 
                      background: svc.format === 'online' ? "#f5f3ff" : "#fff", 
                      border: `1.5px solid ${svc.format === 'online' ? "#7c3aed" : "#cbd5e1"}`, 
                      color: svc.format === 'online' ? "#6d28d9" : "#64748b", 
                      fontSize: "12px", 
                      fontWeight: svc.format === 'online' ? 700 : 500, 
                      cursor: "pointer", 
                      transition: "all 0.15s" 
                    }}
                  >
                    📶 Online
                  </button>
                  <button 
                    type="button"
                    onClick={() => toggleFormat(svc.id, 'hybrid')} 
                    style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "5px", 
                      padding: "6px 12px", 
                      borderRadius: "9px", 
                      background: svc.format === 'hybrid' ? "#f5f3ff" : "#fff", 
                      border: `1.5px solid ${svc.format === 'hybrid' ? "#7c3aed" : "#cbd5e1"}`, 
                      color: svc.format === 'hybrid' ? "#6d28d9" : "#64748b", 
                      fontSize: "12px", 
                      fontWeight: svc.format === 'hybrid' ? 700 : 500, 
                      cursor: "pointer", 
                      transition: "all 0.15s" 
                    }}
                  >
                    🏛️ Hybrid
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="button"
            onClick={addService} 
            style={{ 
              width: "100%", 
              background: "#f5f3ff", 
              border: "1.5px dashed #c4b5fd", 
              borderRadius: "12px", 
              padding: "11px", 
              fontSize: "13px", 
              color: "#6d28d9", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "6px", 
              fontWeight: 700,
              transition: "all 0.15s ease" 
            }}
          >
            + Add another service time
          </button>

          {error && (
            <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", background: "#fef2f2", padding: "8px 12px", borderRadius: "8px", border: "1px solid #fee2e2" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            borderTop: "1px solid #e2e8f0",
            background: "#fff",
            borderRadius: "0 0 20px 20px"
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              fontSize: "13.5px",
              fontWeight: 700,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#475569",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              fontSize: "13.5px",
              fontWeight: 700,
              background: "#7c3aed",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
