import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "@/context/FormContext";

interface Step1ProfileProps {
  onNext: () => void;
}

const COUNTRIES = [
  ["GB", "United Kingdom"], ["US", "United States"], ["NG", "Nigeria"], ["GH", "Ghana"], ["KE", "Kenya"],
  ["ZA", "South Africa"], ["CA", "Canada"], ["AU", "Australia"], ["IE", "Ireland"], ["IN", "India"],
  ["PK", "Pakistan"], ["BD", "Bangladesh"], ["LK", "Sri Lanka"], ["PH", "Philippines"], ["JM", "Jamaica"],
  ["TT", "Trinidad & Tobago"], ["BB", "Barbados"], ["NZ", "New Zealand"], ["FR", "France"], ["DE", "Germany"],
  ["NL", "Netherlands"], ["ES", "Spain"], ["PT", "Portugal"], ["IT", "Italy"], ["BE", "Belgium"],
  ["CH", "Switzerland"], ["AT", "Austria"], ["SE", "Sweden"], ["NO", "Norway"], ["DK", "Denmark"],
  ["FI", "Finland"], ["PL", "Poland"], ["RO", "Romania"], ["UA", "Ukraine"], ["GR", "Greece"],
  ["HU", "Hungary"], ["CZ", "Czechia"], ["LT", "Lithuania"], ["LV", "Latvia"], ["BG", "Bulgaria"],
  ["HR", "Croatia"], ["RS", "Serbia"], ["AL", "Albania"], ["BR", "Brazil"], ["MX", "Mexico"],
  ["AR", "Argentina"], ["CO", "Colombia"], ["CL", "Chile"], ["PE", "Peru"], ["EC", "Ecuador"],
  ["VE", "Venezuela"], ["GT", "Guatemala"], ["CN", "China"], ["HK", "Hong Kong"], ["TW", "Taiwan"],
  ["KR", "South Korea"], ["JP", "Japan"], ["VN", "Vietnam"], ["TH", "Thailand"], ["MY", "Malaysia"],
  ["SG", "Singapore"], ["ID", "Indonesia"], ["NP", "Nepal"], ["AE", "United Arab Emirates"], ["SA", "Saudi Arabia"],
  ["QA", "Qatar"], ["KW", "Kuwait"], ["IL", "Israel"], ["TR", "Turkey"], ["EG", "Egypt"],
  ["MA", "Morocco"], ["DZ", "Algeria"], ["ET", "Ethiopia"], ["UG", "Uganda"], ["TZ", "Tanzania"],
  ["RW", "Rwanda"], ["ZW", "Zimbabwe"], ["ZM", "Zambia"], ["CM", "Cameroon"], ["CI", "Côte d'Ivoire"],
  ["SN", "Senegal"], ["AO", "Angola"], ["MZ", "Mozambique"], ["BW", "Botswana"], ["MW", "Malawi"],
  ["NA", "Namibia"], ["SL", "Sierra Leone"], ["LR", "Liberia"], ["GM", "Gambia"], ["CD", "DR Congo"],
  ["RU", "Russia"], ["BY", "Belarus"], ["MD", "Moldova"], ["GE", "Georgia"], ["AM", "Armenia"],
  ["MT", "Malta"], ["CY", "Cyprus"], ["LU", "Luxembourg"], ["IS", "Iceland"], ["EE", "Estonia"],
  ["SK", "Slovakia"], ["SI", "Slovenia"]
];

function flagEmoji(code: string) {
  return [...code.toUpperCase()].map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
}

export default function Step1Profile({ onNext }: Step1ProfileProps) {
  const { formData, updateFormData } = useFormContext();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNoPredictions, setHasNoPredictions] = useState(false);
  
  const countryRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (addressRef.current && !addressRef.current.contains(event.target as Node)) {
        (window as any).addressPredictions = [];
        setHasNoPredictions(false);
        setErrors(prev => ({ ...prev, _trigger: Math.random().toString() }));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) newErrors.name = "Church name is required";
    if (!formData.country?.trim()) newErrors.country = "Country is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorId = Object.keys(newErrors)[0];
      setTimeout(() => {
        const el = document.getElementById(`f-${firstErrorId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }
    
    setErrors({});
    onNext();
  };

  const handleUseTypedAddress = () => {
    updateFormData({
      latitude: 0.0001,
      longitude: 0.0001
    });
    (window as any).addressPredictions = [];
    setHasNoPredictions(false);
    setErrors(prev => ({ ...prev, _trigger: Math.random().toString() }));
  };

  const filteredCountries = COUNTRIES.filter(c => c[1].toLowerCase().includes((formData.country || '').toLowerCase())).slice(0, 50);

  const selectCountry = (name: string) => {
    updateFormData({ country: name });
    setShowDropdown(false);
    if (errors.country) setErrors({ ...errors, country: "" });
  };

  return (
    <div className="step-content slide-up">
      <div className="scard" style={{ overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "var(--cn-grad)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-user" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Profile</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          <div>
            <label>Church name <span className="req-badge">REQUIRED</span></label>
            <input 
              id="f-name"
              placeholder="e.g. Liberty Connections" 
              value={formData.name || ""}
              onChange={(e) => {
                updateFormData({ name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              style={{ border: errors.name ? "1.5px solid red" : "" }}
            />
            {errors.name && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.name}</div>}
          </div>
          <div>
            <label>Denomination</label>
            <select
              value={formData.denomination || ""}
              onChange={(e) => updateFormData({ denomination: e.target.value })}
            >
              <option value="">Select denomination</option>
              <option value="Pentecostal">Pentecostal</option>
              <option value="Baptist">Baptist</option>
              <option value="Catholic">Catholic</option>
              <option value="Anglican">Anglican</option>
              <option value="Methodist">Methodist</option>
              <option value="Non-Denominational">Non-Denominational</option>
              <option value="Orthodox">Orthodox</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="scard" style={{ overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#fb7185,#f43f5e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-map-pin" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Address</div>
        </div>

        <label>Country <span className="req-badge">REQUIRED</span></label>
        <div id="f-country" style={{ position: "relative", marginBottom: "18px" }} ref={countryRef}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "20px", zIndex: 2 }}>🌍</span>
          <input 
            placeholder="Select your country" 
            style={{ paddingLeft: "44px", border: errors.country ? "1.5px solid red" : "" }} 
            value={formData.country || ""}
            onChange={(e) => {
              updateFormData({ country: e.target.value });
              setShowDropdown(true);
              if (errors.country) setErrors({ ...errors, country: "" });
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && (
            <div className="autocomplete-dropdown" style={{ display: "block", position: "absolute", width: "100%", top: "100%", zIndex: 10, background: "#fff", border: "1.5px solid var(--cn-border)", borderRadius: "12px", marginTop: "4px", maxHeight: "200px", overflowY: "auto", boxShadow: "0 10px 25px rgba(15,15,26,0.08)" }}>
              {filteredCountries.length === 0 ? (
                <div style={{ padding: "12px 14px", fontSize: "12px", color: "var(--cn-gray)" }}>No matching country</div>
              ) : (
                filteredCountries.map(c => (
                  <div 
                    key={c[0]} 
                    className="autocomplete-item" 
                    style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", transition: "background 0.2s" }}
                    onClick={() => selectCountry(c[1])}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--cn-surface)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>{flagEmoji(c[0])}</span>
                    <div style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "var(--cn-ink)" }}>{c[1]}</div>
                  </div>
                ))
              )}
            </div>
          )}
          {errors.country && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.country}</div>}
        </div>

        <label>Find your address <span className="req-badge">REQUIRED</span></label>
        {!formData.latitude ? (
          <div id="f-address" style={{ position: "relative", marginBottom: "6px" }} ref={addressRef}>
            <i className="ti ti-search" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--cn-gray-light)", zIndex: 2 }}></i>
            <input 
              placeholder="Type your street and number…" 
              style={{ paddingLeft: "42px", border: errors.address ? "1.5px solid red" : "" }} 
              value={formData.address || ""}
              onChange={(e) => {
                updateFormData({ address: e.target.value });
                if (errors.address) setErrors({ ...errors, address: "" });
                
                // Simple debounce for Nominatim API
                clearTimeout((window as any).addrTimeout);
                if (e.target.value.length > 3 && formData.country) {
                  (window as any).addrTimeout = setTimeout(async () => {
                    try {
                      const cc = COUNTRIES.find(c => c[1] === formData.country)?.[0] || "";
                      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(e.target.value)}&countrycodes=${cc}&limit=5`);
                      const data = await res.json();
                      (window as any).addressPredictions = data;
                      setHasNoPredictions(data.length === 0);
                      setErrors(prev => ({ ...prev, _trigger: Math.random().toString() }));
                    } catch (err) {
                      setHasNoPredictions(true);
                    }
                  }, 500);
                } else {
                  (window as any).addressPredictions = [];
                  setHasNoPredictions(false);
                  setErrors(prev => ({ ...prev, _trigger: Math.random().toString() }));
                }
              }}
            />
            
            {((window as any).addressPredictions && (window as any).addressPredictions.length > 0 && formData.address) ? (
              <div className="autocomplete-dropdown" style={{ display: "block", position: "absolute", width: "100%", top: "100%", zIndex: 10, background: "#fff", border: "1.5px solid var(--cn-border)", borderRadius: "12px", marginTop: "4px", boxShadow: "0 10px 25px rgba(15,15,26,0.08)", maxHeight: "200px", overflowY: "auto" }}>
                {(window as any).addressPredictions.map((p: any, i: number) => (
                  <div 
                    key={i} 
                    style={{ padding: "11px 14px", display: "flex", alignItems: "center", cursor: "pointer", borderBottom: "1px solid #f1f0f5" }}
                    onClick={() => {
                      updateFormData({ 
                        address: p.display_name,
                        latitude: parseFloat(p.lat),
                        longitude: parseFloat(p.lon)
                      });
                      (window as any).addressPredictions = [];
                      setHasNoPredictions(false);
                      setErrors(prev => ({ ...prev, _trigger: Math.random().toString() }));
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--cn-surface)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: "12px" }}>
                      <i className="ti ti-map-pin" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--cn-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.display_name.split(',')[0]}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--cn-gray)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.display_name.split(',').slice(1).join(',').trim()}
                      </div>
                    </div>
                    <i className="ti ti-arrow-right" style={{ fontSize: "14px", color: "var(--cn-gray-light)", flexShrink: 0 }}></i>
                  </div>
                ))}
              </div>
            ) : hasNoPredictions && formData.address ? (
              <div className="autocomplete-dropdown" style={{ display: "block", position: "absolute", width: "100%", top: "100%", zIndex: 10, background: "#fff", border: "1.5px solid var(--cn-border)", borderRadius: "12px", marginTop: "4px", boxShadow: "0 10px 25px rgba(15,15,26,0.08)", padding: "14px 16px" }}>
                <div style={{ fontSize: "12.5px", color: "var(--cn-gray)", display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
                  <i className="ti ti-map-pin" style={{ fontSize: "16px", color: "var(--cn-gray-light)", marginTop: "1px" }}></i>
                  <span>We couldn't verify this exact address. You can continue with the address you typed — we'll save it as entered.</span>
                </div>
                <button 
                  onClick={handleUseTypedAddress}
                  style={{ fontSize: "12.5px", fontWeight: 700, color: "#fff", background: "var(--cn-purple)", border: "none", padding: "9px 16px", borderRadius: "9px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <i className="ti ti-check" style={{ fontSize: "14px" }}></i> Use the address I typed
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ marginBottom: "18px" }}>
            {formData.latitude === 0.0001 ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "12px", padding: "12px 14px", marginBottom: "18px", position: "relative" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: "15px", color: "#d97706", flexShrink: 0, marginTop: "1px" }}></i>
                <div style={{ fontSize: "12.5px", color: "#92400e", fontWeight: 600 }}>
                  <strong>Saved as you entered it</strong> (not auto-verified): {formData.address}
                </div>
                <button 
                  onClick={() => updateFormData({ latitude: undefined, longitude: undefined, address: "" })}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer", color: "#d97706" }}
                  title="Change address"
                >
                  <i className="ti ti-pencil" style={{ fontSize: "14px" }}></i>
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "12px", padding: "12px 14px", marginBottom: "18px", position: "relative" }}>
                  <i className="ti ti-circle-check-filled" style={{ fontSize: "15px", color: "#16a34a", flexShrink: 0, marginTop: "1px" }}></i>
                  <div style={{ fontSize: "12.5px", color: "#15803d", fontWeight: 600 }}>{formData.address}</div>
                  <button 
                    onClick={() => updateFormData({ latitude: undefined, longitude: undefined, address: "" })}
                    style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer", color: "#16a34a" }}
                    title="Change address"
                  >
                    <i className="ti ti-pencil" style={{ fontSize: "14px" }}></i>
                  </button>
                </div>
                
                <div>
                  <label style={{ marginBottom: "9px", display: "block", fontSize: "12px", fontWeight: 700, color: "var(--cn-ink)" }}>Confirm the pin is on your building</label>
                  <div style={{ width: "100%", height: "200px", borderRadius: "12px", overflow: "hidden", border: "1.5px solid var(--cn-border)" }}>
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight={0} 
                      marginWidth={0} 
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.longitude! - 0.005},${formData.latitude! - 0.005},${formData.longitude! + 0.005},${formData.latitude! + 0.005}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
                    ></iframe>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        {errors.address && !formData.latitude ? (
           <div style={{ color: "red", fontSize: "12px", marginBottom: "14px" }}>{errors.address}</div>
        ) : !formData.latitude ? (
          <div style={{ fontSize: "11.5px", color: "var(--cn-gray-light)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "5px" }}>
            <i className="ti ti-info-circle" style={{ fontSize: "12px" }}></i>
            Just type your street and number — we validate it and store the rest for you.
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={handleNext} className="btn-primary">
          Next — Contact <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
        </button>
      </div>
    </div>
  );
}
