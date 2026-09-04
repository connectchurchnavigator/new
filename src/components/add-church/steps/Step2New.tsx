import React, { useState, useEffect } from "react";
import { useFormContext } from "@/context/FormContext";

function parseTimeString(v: string) {
  v = v.trim();
  if (!v) return null;
  if (/^noon$/i.test(v)) return { h: 12, m: "00", ampm: "PM", ambiguous: false };
  if (/^midnight$/i.test(v)) return { h: 12, m: "00", ampm: "AM", ambiguous: false };
  
  let rawStr = v;
  const noColonMatch = v.match(/^(\d{3,4})\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (noColonMatch) {
    const digits = noColonMatch[1];
    let hStr = digits.length === 3 ? digits.substring(0, 1) : digits.substring(0, 2);
    let mStr = digits.length === 3 ? digits.substring(1) : digits.substring(2);
    rawStr = `${hStr}:${mStr}${noColonMatch[2] || ''}`;
  }

  const match = rawStr.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (!match) return null;
  let h = parseInt(match[1]);
  let m = match[2] || "00";
  let explicitAmPm = match[3] ? match[3].replace(/\./g, "").toUpperCase() : null;
  if (h > 23 || parseInt(m) > 59) return null;
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
    setError(!parsed);

    if (parsed && !parsed.ambiguous) {
      const formatted = formatTime(parsed);
      onChange(formatted);
      setIsOpen(false);
    } else if (parsed && parsed.ambiguous) {
      setIsOpen(true);
    } else {
      setIsOpen(true);
      onChange(val);
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
          fontSize: "13px",
          padding: "10px 12px",
          border: error ? "1.5px solid red" : value ? "1.5px solid #16a34a" : "1.5px solid var(--cn-border)",
          backgroundColor: error ? "#fef2f2" : value ? "#f0fdf4" : ""
        }}
      />
      {isOpen && (
        <div className="autocomplete-dropdown" style={{ display: "block", minWidth: "190px" }}>
          {error ? (
            <div style={{ padding: "10px 14px", fontSize: "12px", color: "var(--cn-gray)" }}>
              Invalid time format <br />
              <span style={{ color: "#6b7280", fontSize: "11px", fontWeight: 400 }}>— try 10am or 10:30am</span>
            </div>
          ) : parsedTime ? (
            parsedTime.ambiguous ? (
              <div>
                <div
                  onMouseDown={() => selectOption(formatTime({ ...parsedTime, ampm: "AM" }))}
                  onMouseEnter={() => setHighlightedIndex(0)}
                  className="autocomplete-item"
                  style={{ alignItems: "center", background: highlightedIndex === 0 ? "#f5f3ff" : "#fff", whiteSpace: "nowrap" }}
                >
                  <i className="ti ti-clock" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)" }}>
                    {formatTime({ ...parsedTime, ampm: "AM" })}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--cn-gray)" }}>Morning</span>
                </div>
                <div
                  onMouseDown={() => selectOption(formatTime({ ...parsedTime, ampm: "PM" }))}
                  onMouseEnter={() => setHighlightedIndex(1)}
                  className="autocomplete-item"
                  style={{ alignItems: "center", background: highlightedIndex === 1 ? "#f5f3ff" : "#fff", whiteSpace: "nowrap" }}
                >
                  <i className="ti ti-clock" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)" }}>
                    {formatTime({ ...parsedTime, ampm: "PM" })}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--cn-gray)" }}>Evening</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: "9px 12px", fontSize: "12px", color: "var(--cn-purple-dark)", fontWeight: 600, textAlign: "left" }}>
                → {formatTime(parsedTime)}
              </div>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}

interface Step2NewProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Step2New({ onNext, onBack }: Step2NewProps) {
  const { formData, updateFormData } = useFormContext();
  const [services, setServices] = useState<any[]>(formData.services?.length ? formData.services : [
    { id: 1, day: "Sunday", name: "", from: "", to: "", format: "inperson" }
  ]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (formData.services && Array.isArray(formData.services) && formData.services.length > 0) {
      setServices(formData.services);
    }
  }, [formData.services]);

  const updateServiceField = (id: number, field: string, value: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleFormat = (id: number, format: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, format } : s));
  };

  const addService = () => {
    setServices(prev => [
      ...prev, 
      { id: Date.now(), day: "Sunday", name: "", from: "", to: "", format: "inperson" }
    ]);
  };

  const removeService = (id: number) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleNext = () => {
    const filledServices = services.filter(s => s.name?.trim() || s.from?.trim() || s.to?.trim());

    if (filledServices.length === 0) {
      setError("Please add at least one service time.");
      return;
    }

    const invalidService = filledServices.find(s => {
      if (!s.name?.trim() || !s.from?.trim()) return true;
      
      const fromVal = s.from?.trim();
      const toVal = s.to?.trim();
      if (fromVal && !parseTimeString(fromVal)) return true;
      if (toVal && !parseTimeString(toVal)) return true;
      return false;
    });

    if (invalidService) {
      setError("Please complete all service fields (Name and From time are required, e.g. 10am)");
      return;
    }

    setError("");
    updateFormData({
      services: filledServices,
    });
    onNext();
  };

  return (
    <div className="step-content slide-up">
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-clock" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Service times</div>
        </div>

        <div>
          {services.map((svc) => (
            <div key={svc.id} style={{ border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "14px", marginBottom: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.1fr 1fr 1fr 40px", gap: "10px", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", marginBottom: "5px" }}>DAY</div>
                  <select value={svc.day} onChange={(e) => updateServiceField(svc.id, "day", e.target.value)}>
                    <option>Sunday</option><option>Monday</option><option>Tuesday</option>
                    <option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", marginBottom: "5px" }}>SERVICE NAME</div>
                  <input 
                    placeholder="e.g. Main Service" 
                    style={{ 
                      fontSize: "13px", 
                      padding: "10px 12px",
                      border: (!svc.name && svc.from && !error) ? "1.5px solid red" : svc.name ? "1.5px solid #16a34a" : "1.5px solid var(--cn-border)",
                      backgroundColor: (!svc.name && svc.from && !error) ? "#fef2f2" : svc.name ? "#f0fdf4" : ""
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
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", marginBottom: "5px" }}>FROM</div>
                  <TimeInput 
                    value={svc.from || ""} 
                    onChange={(val) => updateServiceField(svc.id, "from", val)} 
                    placeholder="e.g. 10am, 11:30" 
                  />
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", marginBottom: "5px" }}>TO</div>
                  <TimeInput 
                    value={svc.to || ""} 
                    onChange={(val) => updateServiceField(svc.id, "to", val)} 
                    placeholder="e.g. 1pm, 13:00" 
                  />
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "transparent", marginBottom: "5px" }}>.</div>
                  <button 
                    onClick={() => removeService(svc.id)}
                    style={{ width: "38px", height: "38px", background: "#fff", border: "1.5px solid var(--cn-border)", color: "#be123c", borderRadius: "10px", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <i className="ti ti-trash" style={{ fontSize: "14px" }}></i>
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--cn-border)" }}>
                <div style={{ fontSize: "12px", color: "var(--cn-gray)", fontWeight: 600 }}>Format:</div>
                <button 
                  onClick={() => toggleFormat(svc.id, 'inperson')} 
                  className={`format-btn ${svc.format === 'inperson' ? 'on' : ''}`} 
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "9px", background: svc.format === 'inperson' ? "#f5f3ff" : "#fff", border: `1.5px solid ${svc.format === 'inperson' ? "var(--cn-purple)" : "var(--cn-border)"}`, color: svc.format === 'inperson' ? "var(--cn-purple-dark)" : "var(--cn-gray)", fontSize: "12px", fontWeight: svc.format === 'inperson' ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
                >
                  <i className="ti ti-building-church" style={{ fontSize: "13px" }}></i> In-Person
                </button>
                <button 
                  onClick={() => toggleFormat(svc.id, 'online')} 
                  className={`format-btn ${svc.format === 'online' ? 'on' : ''}`} 
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "9px", background: svc.format === 'online' ? "#f5f3ff" : "#fff", border: `1.5px solid ${svc.format === 'online' ? "var(--cn-purple)" : "var(--cn-border)"}`, color: svc.format === 'online' ? "var(--cn-purple-dark)" : "var(--cn-gray)", fontSize: "12px", fontWeight: svc.format === 'online' ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
                >
                  <i className="ti ti-wifi" style={{ fontSize: "13px" }}></i> Online
                </button>
                <button 
                  onClick={() => toggleFormat(svc.id, 'hybrid')} 
                  className={`format-btn ${svc.format === 'hybrid' ? 'on' : ''}`} 
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "9px", background: svc.format === 'hybrid' ? "#f5f3ff" : "#fff", border: `1.5px solid ${svc.format === 'hybrid' ? "var(--cn-purple)" : "var(--cn-border)"}`, color: svc.format === 'hybrid' ? "var(--cn-purple-dark)" : "var(--cn-gray)", fontSize: "12px", fontWeight: svc.format === 'hybrid' ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
                >
                  <i className="ti ti-building-community" style={{ fontSize: "13px" }}></i> Hybrid
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={addService} 
          style={{ width: "100%", background: "#f5f3ff", border: "1.5px dashed #c4b5fd", borderRadius: "12px", padding: "11px", fontSize: "13px", color: "var(--cn-purple-dark)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontWeight: 600 }}
        >
          <i className="ti ti-plus" style={{ fontSize: "14px" }}></i> Add another service time
        </button>

        {error && (
          <div style={{ color: "red", fontSize: "12px", marginTop: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
            <span>{error}</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={onBack} className="btn-secondary">
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i>
        </button>
        <button onClick={handleNext} className="btn-primary">
          Next — Media & Details <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
        </button>
      </div>
    </div>
  );
}
