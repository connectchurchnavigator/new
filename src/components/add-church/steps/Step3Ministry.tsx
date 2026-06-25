import React, { useState, useEffect } from "react";
import { useFormContext } from "@/context/FormContext";

function parseTimeString(v: string) {
  v = v.trim();
  if (!v) return null;
  if (/^noon$/i.test(v)) return { h: 12, m: "00", ampm: "PM", ambiguous: false };
  if (/^midnight$/i.test(v)) return { h: 12, m: "00", ampm: "AM", ambiguous: false };
  const match = v.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
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
    setIsOpen(true);

    if (parsed && !parsed.ambiguous) {
      onChange(formatTime(parsed));
    }
  };

  const handleFocus = () => {
    if (inputValue.trim()) {
      const parsed = parseTimeString(inputValue);
      setParsedTime(parsed);
      setError(!parsed);
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      const v = inputValue.trim();
      if (v) {
        const parsed = parseTimeString(v);
        if (parsed) {
          setError(false);
          const finalVal = formatTime(parsed);
          setInputValue(finalVal);
          onChange(finalVal);
        } else {
          setError(true);
          onChange("");
        }
      } else {
        setError(false);
        onChange("");
      }
    }, 200);
  };

  const selectOption = (optVal: string) => {
    setInputValue(optVal);
    setError(false);
    setIsOpen(false);
    onChange(optVal);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        placeholder={placeholder}
        className={error ? "error" : inputValue && !error ? "verified" : ""}
        style={{
          fontSize: "13px",
          padding: "10px 12px"
        }}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {isOpen && (
        <div className="autocomplete-dropdown">
          {error ? (
            <div style={{ padding: "10px 12px", color: "#ef4444", fontSize: "12px", fontWeight: 500, lineHeight: "1.4", textAlign: "left" }}>
              Couldn't read that time <br />
              <span style={{ color: "#6b7280", fontSize: "11px", fontWeight: 400 }}>— try 10am or 10:30am</span>
            </div>
          ) : parsedTime ? (
            parsedTime.ambiguous ? (
              <div>
                <div
                  onMouseDown={() => selectOption(formatTime({ ...parsedTime, ampm: "AM" }))}
                  className="autocomplete-item"
                  style={{ alignItems: "center" }}
                >
                  <i className="ti ti-clock" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)" }}>
                    {formatTime({ ...parsedTime, ampm: "AM" })}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--cn-gray)" }}>Morning</span>
                </div>
                <div
                  onMouseDown={() => selectOption(formatTime({ ...parsedTime, ampm: "PM" }))}
                  className="autocomplete-item"
                  style={{ alignItems: "center" }}
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

interface Step3MinistryProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Ministry({ onNext, onBack }: Step3MinistryProps) {
  const { formData, updateFormData } = useFormContext();
  const [services, setServices] = useState<any[]>(formData.services?.length ? formData.services : [
    { id: 1, day: "Sunday", name: "", from: "", to: "", format: "inperson" }
  ]);
  const [showCategories, setShowCategories] = useState(false);
  const [activeChips, setActiveChips] = useState<string[]>(formData.ministries?.length ? formData.ministries : ["Youth Ministry", "Children's Church"]);
  const [customMinistry, setCustomMinistry] = useState("");
  const [customMinistriesList, setCustomMinistriesList] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [customMinMsg, setCustomMinMsg] = useState<{ text: string; type: "success" | "warning" | "" }>({ text: "", type: "" });

  const toggleChip = (chip: string) => {
    setActiveChips(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
    if (error) setError("");
  };

  const addCustomMinistry = () => {
    const val = customMinistry.replace(/\s+/g, ' ').trim().replace(/(^|\s)(\w)/g, (m, p, c) => p + c.toUpperCase());
    if (val.length < 2) {
      setCustomMinMsg({ text: "Type a ministry name to add it.", type: "warning" });
      return;
    }

    const ALL_EXISTING_CHIPS = [
      "Youth Ministry", "Children's Church", "Worship Team", "Ushering", "Technical / Media", 
      "Prayer & Intercession", "Evangelism", "Women's Ministry", "Men's Ministry", "Young Adults", "Marriage & Family",
      "Crèche / Nursery", "Junior Church", "Teen Ministry", "Parent & Toddler", "Seniors Ministry", "Singles Ministry",
      "Food Bank", "Community Café", "Prison Ministry", "Street Ministry",
      "Praise & Worship", "Dance Ministry", "Drama & Theatre", "Choir",
      "Global Missions", "Church Planting", "Evangelism Team", "Local Outreach"
    ];

    const foundStandard = ALL_EXISTING_CHIPS.find(c => c.toLowerCase() === val.toLowerCase());
    
    if (foundStandard) {
      if (!activeChips.includes(foundStandard)) {
        setActiveChips(prev => [...prev, foundStandard]);
      }
      setCustomMinMsg({ text: `“${foundStandard}” already exists — selected it for you.`, type: "success" });
      setCustomMinistry("");
      if (error) setError("");
      setTimeout(() => {
        setCustomMinMsg(prev => prev.text.includes(foundStandard) ? { text: "", type: "" } : prev);
      }, 2500);
      return;
    }

    if (customMinistriesList.some(m => m.toLowerCase() === val.toLowerCase())) {
      setCustomMinMsg({ text: `“${val}” already exists in your ministries.`, type: "success" });
      setCustomMinistry("");
      return;
    }

    setCustomMinistriesList(prev => [...prev, val]);
    setCustomMinMsg({ text: `Added “${val}” to your ministries.`, type: "success" });
    setCustomMinistry("");
    if (error) setError("");

    setTimeout(() => {
      setCustomMinMsg(prev => prev.text.includes(val) ? { text: "", type: "" } : prev);
    }, 2500);
  };

  const removeCustomMinistry = (min: string) => {
    setCustomMinistriesList(prev => prev.filter(m => m !== min));
  };

  const updateServiceField = (id: number, field: string, value: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleNext = () => {
    // Validate service times: if either from or to is entered, they must be parseable
    const invalidService = services.find(s => {
      const fromVal = s.from?.trim();
      const toVal = s.to?.trim();
      if (fromVal && !parseTimeString(fromVal)) return true;
      if (toVal && !parseTimeString(toVal)) return true;
      return false;
    });

    if (invalidService) {
      setError("Please enter valid service times (e.g. 10am or 10:30am)");
      return;
    }

    if (activeChips.length === 0 && customMinistriesList.length === 0) {
      setError("Please select or add at least one ministry");
      setTimeout(() => {
        const el = document.getElementById("f-ministry");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }
    setError("");
    updateFormData({
      services: services,
      ministries: [...activeChips, ...customMinistriesList]
    });
    onNext();
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
                    style={{ fontSize: "13px", padding: "10px 12px" }} 
                    value={svc.name || ""} 
                    onChange={(e) => updateServiceField(svc.id, "name", e.target.value)}
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
      </div>

      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#fb7185,#be123c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-heart-handshake" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Ministries & outreach</div>
        </div>

        {formData.denomination && (
          <div className="ai-bubble" style={{ marginBottom: "16px" }}>
            <div className="ai-icon"><i className="ti ti-sparkles" style={{ fontSize: "15px", color: "#fff" }}></i></div>
            <div style={{ fontSize: "13px", color: "var(--cn-ink)", paddingTop: "3px" }}>
              Based on <strong>{formData.denomination}</strong> denomination — we've pre-selected the most common ministries for you
            </div>
          </div>
        )}

        <div id="ministry-chips" style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "14px" }}>
          {[
            { name: "Youth Ministry", icon: "ti-users" },
            { name: "Children's Church", icon: "ti-baby-carriage" },
            { name: "Food Bank", icon: "ti-bread" },
            { name: "Bible Study", icon: "ti-book" },
            { name: "Outreach", icon: "ti-heart-handshake" },
            { name: "Women's Ministry", icon: "ti-woman" },
            { name: "Men's Ministry", icon: "ti-man" },
            { name: "Prayer Group", icon: "ti-pray" }
          ].map(pick => {
            const isActive = activeChips.includes(pick.name);
            return (
              <div 
                key={pick.name} 
                className={`chip ${isActive ? "on" : ""} ${error && activeChips.length === 0 && customMinistriesList.length === 0 ? "error-border" : ""}`} 
                onClick={() => toggleChip(pick.name)}
                style={{ display: "inline-flex", cursor: "pointer", border: error && activeChips.length === 0 && customMinistriesList.length === 0 ? "1.5px solid red" : "" }}
              >
                <i className={`ti ${pick.icon}`} style={{ fontSize: "12px" }}></i> {pick.name}
              </div>
            );
          })}
          {customMinistriesList.map(min => (
            <div key={min} className="chip on" style={{ cursor: "pointer" }} onClick={() => removeCustomMinistry(min)}>
              <i className="ti ti-plus" style={{ fontSize: "12px" }}></i> {min}
            </div>
          ))}
        </div>

        <button 
          onClick={() => setShowCategories(!showCategories)} 
          style={{ background: "none", border: "none", color: "var(--cn-purple)", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", padding: 0, marginBottom: "14px", fontWeight: 600 }}
        >
          <i className="ti ti-grid-3x3" style={{ fontSize: "14px" }}></i> Browse all categories to discover more
        </button>

        {showCategories && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px", animation: "slideUp 0.3s ease" }}>
            
            {/* FAMILY */}
            <div style={{ background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", marginBottom: "9px", display: "flex", alignItems: "center", gap: "5px" }}>
                <i className="ti ti-users" style={{ fontSize: "13px" }}></i> FAMILY
              </div>
              {["Crèche / Nursery", "Junior Church", "Teen Ministry", "Parent & Toddler"].map(min => {
                const isActive = activeChips.includes(min);
                return (
                  <div 
                    key={min} 
                    className={`chip ${isActive ? "on" : ""}`} 
                    onClick={() => toggleChip(min)} 
                    style={{ display: "flex", margin: "3px 0", width: "100%" }}
                  >
                    {min}
                  </div>
                );
              })}
            </div>

            {/* COMMUNITY */}
            <div style={{ background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", marginBottom: "9px", display: "flex", alignItems: "center", gap: "5px" }}>
                <i className="ti ti-heart-handshake" style={{ fontSize: "13px" }}></i> COMMUNITY
              </div>
              {["Food Bank", "Community Café", "Prison Ministry", "Street Ministry"].map(min => {
                const isActive = activeChips.includes(min);
                return (
                  <div 
                    key={min} 
                    className={`chip ${isActive ? "on" : ""}`} 
                    onClick={() => toggleChip(min)} 
                    style={{ display: "flex", margin: "3px 0", width: "100%" }}
                  >
                    {min}
                  </div>
                );
              })}
            </div>

            {/* WORSHIP & ARTS */}
            <div style={{ background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", marginBottom: "9px", display: "flex", alignItems: "center", gap: "5px" }}>
                <i className="ti ti-music" style={{ fontSize: "13px" }}></i> WORSHIP & ARTS
              </div>
              {["Praise & Worship", "Dance Ministry", "Drama & Theatre", "Choir"].map(min => {
                const isActive = activeChips.includes(min);
                return (
                  <div 
                    key={min} 
                    className={`chip ${isActive ? "on" : ""}`} 
                    onClick={() => toggleChip(min)} 
                    style={{ display: "flex", margin: "3px 0", width: "100%" }}
                  >
                    {min}
                  </div>
                );
              })}
            </div>

            {/* MISSIONS */}
            <div style={{ background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", marginBottom: "9px", display: "flex", alignItems: "center", gap: "5px" }}>
                <i className="ti ti-world" style={{ fontSize: "13px" }}></i> MISSIONS
              </div>
              {["Global Missions", "Church Planting", "Evangelism Team", "Local Outreach"].map(min => {
                const isActive = activeChips.includes(min);
                return (
                  <div 
                    key={min} 
                    className={`chip ${isActive ? "on" : ""}`} 
                    onClick={() => toggleChip(min)} 
                    style={{ display: "flex", margin: "3px 0", width: "100%" }}
                  >
                    {min}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        <div style={{ display: "flex", gap: "9px", marginBottom: "16px" }}>
          <input 
            placeholder="Don't see yours? Type a custom ministry — e.g. Prison Ministry" 
            style={{ fontSize: "13px", flex: 1, border: error && activeChips.length === 0 && customMinistriesList.length === 0 ? "1.5px solid red" : "" }} 
            value={customMinistry}
            onChange={(e) => setCustomMinistry(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCustomMinistry() }}
          />
          <button 
            onClick={addCustomMinistry}
            style={{ flexShrink: 0, fontSize: "13px", fontWeight: 700, color: "#fff", background: "var(--cn-purple)", border: "none", padding: "0 18px", borderRadius: "11px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <i className="ti ti-plus" style={{ fontSize: "15px" }}></i> Add
          </button>
        </div>

        {customMinMsg.text && (
          <div 
            style={{ 
              color: customMinMsg.type === "success" ? "#16a34a" : "#d97706", 
              fontSize: "13px", 
              fontWeight: 600,
              display: "flex", 
              alignItems: "center", 
              gap: "6px",
              marginBottom: "14px",
              marginTop: "-8px"
            }}
          >
            <i className={customMinMsg.type === "success" ? "ti ti-circle-check-filled" : "ti ti-alert-triangle"} style={{ fontSize: "15px" }}></i>
            {customMinMsg.text}
          </div>
        )}
        
        {error && <div style={{ color: "red", fontSize: "12px", marginBottom: "12px" }}>{error}</div>}

        <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "14px", padding: "14px 16px", display: "flex", gap: "9px", alignItems: "flex-start" }}>
          <i className="ti ti-eye" style={{ fontSize: "16px", color: "#d97706", flexShrink: 0, marginTop: "1px" }}></i>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", marginBottom: "3px" }}>More details = more visibility</div>
            <div style={{ fontSize: "12px", color: "#78350f", lineHeight: 1.6 }}>Listings with service times, ministries and languages get <strong>4× more profile visits</strong> than incomplete listings.</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={onBack} className="btn-secondary">
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i>
        </button>
        <button onClick={handleNext} className="btn-primary">
          Next — Languages <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
        </button>
      </div>
    </div>
  );
}
