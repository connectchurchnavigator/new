import React, { useState } from "react";
import { useFormContext } from "@/context/FormContext";

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

  const toggleChip = (chip: string) => {
    setActiveChips(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
    if (error) setError("");
  };

  const addCustomMinistry = () => {
    if (!customMinistry.trim()) return;
    setCustomMinistriesList(prev => [...prev, customMinistry.trim()]);
    setCustomMinistry("");
    if (error) setError("");
  };

  const removeCustomMinistry = (min: string) => {
    setCustomMinistriesList(prev => prev.filter(m => m !== min));
  };

  const handleNext = () => {
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
                  <select defaultValue={svc.day}>
                    <option>Sunday</option><option>Monday</option><option>Tuesday</option>
                    <option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", marginBottom: "5px" }}>SERVICE NAME</div>
                  <input placeholder="e.g. Main Service" style={{ fontSize: "13px", padding: "10px 12px" }} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", marginBottom: "5px" }}>FROM</div>
                  <input placeholder="e.g. 10am, 11:30" style={{ fontSize: "13px", padding: "10px 12px" }} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", marginBottom: "5px" }}>TO</div>
                  <input placeholder="e.g. 1pm, 13:00" style={{ fontSize: "13px", padding: "10px 12px" }} />
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
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Service times & Ministry</div>
        </div>



        <label id="f-ministry">Ministry & Departments</label>
        <div style={{ fontSize: "13px", color: "var(--cn-gray)", marginBottom: "14px" }}>
          What ministries does your church offer?
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "16px" }}>
          {["Youth Ministry", "Children's Church", "Worship Team", "Ushering", "Technical / Media", "Prayer & Intercession", "Evangelism", "Women's Ministry", "Men's Ministry", "Young Adults", "Marriage & Family"].map(min => (
            <div 
              key={min} 
              className={`chip ${activeChips.includes(min) ? "on" : ""} ${error && activeChips.length === 0 && customMinistriesList.length === 0 ? "error-border" : ""}`} 
              onClick={() => toggleChip(min)}
              style={{ cursor: "pointer", border: error && activeChips.length === 0 && customMinistriesList.length === 0 ? "1.5px solid red" : "" }}
            >
              {min}
            </div>
          ))}
          {customMinistriesList.map(min => (
            <div key={min} className="chip on" style={{ cursor: "pointer" }} onClick={() => removeCustomMinistry(min)}>
              {min} <i className="ti ti-x" style={{ fontSize: "12px", marginLeft: "4px" }}></i>
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
            <div style={{ background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", marginBottom: "9px", display: "flex", alignItems: "center", gap: "5px" }}>
                <i className="ti ti-users" style={{ fontSize: "13px" }}></i> FAMILY
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {["Crèche / Nursery", "Junior Church", "Teen Ministry", "Parent & Toddler", "Seniors Ministry", "Singles Ministry"].map(min => (
                  <div key={min} className={`chip ${activeChips.includes(min) ? "on" : ""}`} onClick={() => toggleChip(min)} style={{ display: "flex", cursor: "pointer" }}>{min}</div>
                ))}
              </div>
            </div>
            <div style={{ background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", marginBottom: "9px", display: "flex", alignItems: "center", gap: "5px" }}>
                <i className="ti ti-heart-handshake" style={{ fontSize: "13px" }}></i> COMMUNITY
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {["Food Bank", "Community Café", "Prison Ministry", "Street Ministry"].map(min => (
                  <div key={min} className={`chip ${activeChips.includes(min) ? "on" : ""}`} onClick={() => toggleChip(min)} style={{ display: "flex", cursor: "pointer" }}>{min}</div>
                ))}
              </div>
            </div>
            <div style={{ background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", marginBottom: "9px", display: "flex", alignItems: "center", gap: "5px" }}>
                <i className="ti ti-music" style={{ fontSize: "13px" }}></i> WORSHIP & ARTS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {["Praise & Worship", "Dance Ministry", "Drama & Theatre", "Choir"].map(min => (
                  <div key={min} className={`chip ${activeChips.includes(min) ? "on" : ""}`} onClick={() => toggleChip(min)} style={{ display: "flex", cursor: "pointer" }}>{min}</div>
                ))}
              </div>
            </div>
            <div style={{ background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", marginBottom: "9px", display: "flex", alignItems: "center", gap: "5px" }}>
                <i className="ti ti-world" style={{ fontSize: "13px" }}></i> MISSIONS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {["Global Missions", "Church Planting", "Evangelism Team", "Local Outreach"].map(min => (
                  <div key={min} className={`chip ${activeChips.includes(min) ? "on" : ""}`} onClick={() => toggleChip(min)} style={{ display: "flex", cursor: "pointer" }}>{min}</div>
                ))}
              </div>
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
