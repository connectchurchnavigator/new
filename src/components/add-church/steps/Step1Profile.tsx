import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "@/context/FormContext";
import SharedAddressField from "./SharedAddressField";
import { useTaxonomies } from "@/hooks/useTaxonomies";

interface Step1ProfileProps {
  onNext: () => void;
}

const COUNTRIES = [
  ["GB", "United Kingdom"],
  ["AL", "Albania"], ["DZ", "Algeria"], ["AO", "Angola"], ["AR", "Argentina"], ["AM", "Armenia"],
  ["AU", "Australia"], ["AT", "Austria"], ["BD", "Bangladesh"], ["BB", "Barbados"], ["BY", "Belarus"],
  ["BE", "Belgium"], ["BW", "Botswana"], ["BR", "Brazil"], ["BG", "Bulgaria"], ["CM", "Cameroon"],
  ["CA", "Canada"], ["CL", "Chile"], ["CN", "China"], ["CO", "Colombia"], ["CI", "Côte d'Ivoire"],
  ["HR", "Croatia"], ["CY", "Cyprus"], ["CZ", "Czechia"], ["DK", "Denmark"], ["CD", "DR Congo"],
  ["EC", "Ecuador"], ["EG", "Egypt"], ["EE", "Estonia"], ["ET", "Ethiopia"], ["FI", "Finland"],
  ["FR", "France"], ["GM", "Gambia"], ["GE", "Georgia"], ["DE", "Germany"], ["GH", "Ghana"],
  ["GR", "Greece"], ["GT", "Guatemala"], ["HK", "Hong Kong"], ["HU", "Hungary"], ["IS", "Iceland"],
  ["IN", "India"], ["ID", "Indonesia"], ["IE", "Ireland"], ["IL", "Israel"], ["IT", "Italy"],
  ["JM", "Jamaica"], ["JP", "Japan"], ["KE", "Kenya"], ["KW", "Kuwait"], ["LV", "Latvia"],
  ["LR", "Liberia"], ["LT", "Lithuania"], ["LU", "Luxembourg"], ["MW", "Malawi"], ["MY", "Malaysia"],
  ["MT", "Malta"], ["MX", "Mexico"], ["MD", "Moldova"], ["MA", "Morocco"], ["MZ", "Mozambique"],
  ["NA", "Namibia"], ["NP", "Nepal"], ["NL", "Netherlands"], ["NZ", "New Zealand"], ["NG", "Nigeria"],
  ["NO", "Norway"], ["PK", "Pakistan"], ["PE", "Peru"], ["PH", "Philippines"], ["PL", "Poland"],
  ["PT", "Portugal"], ["QA", "Qatar"], ["RO", "Romania"], ["RU", "Russia"], ["RW", "Rwanda"],
  ["SA", "Saudi Arabia"], ["SN", "Senegal"], ["RS", "Serbia"], ["SL", "Sierra Leone"], ["SG", "Singapore"],
  ["SK", "Slovakia"], ["SI", "Slovenia"], ["ZA", "South Africa"], ["KR", "South Korea"], ["ES", "Spain"],
  ["LK", "Sri Lanka"], ["SE", "Sweden"], ["CH", "Switzerland"], ["TW", "Taiwan"], ["TZ", "Tanzania"],
  ["TH", "Thailand"], ["TT", "Trinidad & Tobago"], ["TR", "Turkey"], ["UG", "Uganda"], ["UA", "Ukraine"],
  ["AE", "United Arab Emirates"], ["US", "United States"], ["VE", "Venezuela"], ["VN", "Vietnam"],
  ["ZM", "Zambia"], ["ZW", "Zimbabwe"]
];

function flagEmoji(code: string) {
  return [...code.toUpperCase()].map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
}

export default function Step1Profile({ onNext }: Step1ProfileProps) {
  const { formData, updateFormData } = useFormContext();
  const taxonomies = useTaxonomies();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNoPredictions, setHasNoPredictions] = useState(false);
  
  // Searchable Denomination state
  const [isDenomOpen, setIsDenomOpen] = useState(false);
  const [denomSearch, setDenomSearch] = useState("");
  const denomRef = useRef<HTMLDivElement>(null);

  const sortedDenominations = React.useMemo(() => {
    return [...taxonomies.denominations].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [taxonomies.denominations]);
  
  const countryRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (denomRef.current && !denomRef.current.contains(event.target as Node)) {
        setIsDenomOpen(false);
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
    if (!formData.address?.trim()) newErrors.address = "Please pin point your address on the map";
    if (!formData.addressDetails?.trim()) newErrors.addressDetails = "Full address is required";

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
    if (formData.addressDetails?.trim()) {
      updateFormData({ address: formData.addressDetails.trim() });
    }
    onNext();
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
            <label>Church name <span style={{ color: "#ef4444", fontWeight: 800 }}>*</span></label>
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
            <div ref={denomRef} style={{ position: "relative" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Select or search denomination..."
                  value={isDenomOpen ? denomSearch : (formData.denomination || "")}
                  onChange={(e) => {
                    setDenomSearch(e.target.value);
                    if (!isDenomOpen) setIsDenomOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (denomSearch.trim()) {
                        updateFormData({ denomination: denomSearch.trim() });
                        setIsDenomOpen(false);
                      }
                    }
                  }}
                  onFocus={() => {
                    setDenomSearch(formData.denomination || "");
                    setIsDenomOpen(true);
                  }}
                  style={{
                    width: "100%",
                    paddingRight: "36px",
                    cursor: "pointer",
                    textOverflow: "ellipsis"
                  }}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setIsDenomOpen(!isDenomOpen)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--cn-gray)"
                  }}
                >
                  <i className={`ti ${isDenomOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: "14px" }}></i>
                </button>
              </div>

              {isDenomOpen && (
                <div
                  className="autocomplete-dropdown"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    maxHeight: "240px",
                    overflowY: "auto",
                    background: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                    zIndex: 1000,
                    padding: "4px 0"
                  }}
                >
                  <div
                    onClick={() => {
                      updateFormData({ denomination: "" });
                      setDenomSearch("");
                      setIsDenomOpen(false);
                    }}
                    className="autocomplete-item"
                    style={{
                      padding: "9px 14px",
                      cursor: "pointer",
                      fontSize: "13.5px",
                      color: "var(--cn-gray)",
                      borderBottom: "1px solid #f1f5f9"
                    }}
                  >
                    Clear selection
                  </div>
                  {(() => {
                    const filtered = sortedDenominations.filter(d => !denomSearch.trim() || d.toLowerCase().includes(denomSearch.toLowerCase()));
                    const trimmedSearch = denomSearch.trim();
                    const exactMatch = sortedDenominations.some(d => d.toLowerCase() === trimmedSearch.toLowerCase());

                    return (
                      <>
                        {filtered.length === 0 ? (
                          <div style={{ padding: "12px 14px", fontSize: "13px", color: "var(--cn-gray)" }}>
                            No denomination found
                          </div>
                        ) : (
                          filtered.map((d) => {
                            const isSelected = formData.denomination === d;
                            return (
                              <div
                                key={d}
                                onClick={() => {
                                  updateFormData({ denomination: d });
                                  setDenomSearch(d);
                                  setIsDenomOpen(false);
                                }}
                                className="autocomplete-item"
                                style={{
                                  padding: "9px 14px",
                                  cursor: "pointer",
                                  fontSize: "13.5px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  background: isSelected ? "#f3e8ff" : "transparent",
                                  color: isSelected ? "#7e22ce" : "var(--cn-ink)",
                                  fontWeight: isSelected ? 600 : 400
                                }}
                              >
                                <span>{d}</span>
                                {isSelected && <i className="ti ti-check" style={{ fontSize: "14px", color: "#7e22ce" }}></i>}
                              </div>
                            );
                          })
                        )}

                        {trimmedSearch && !exactMatch && (
                          <div
                            onClick={() => {
                              updateFormData({ denomination: trimmedSearch });
                              setDenomSearch(trimmedSearch);
                              setIsDenomOpen(false);
                            }}
                            className="autocomplete-item"
                            style={{
                              padding: "10px 14px",
                              cursor: "pointer",
                              fontSize: "13.5px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              borderTop: "1px solid #e2e8f0",
                              background: "#faf5ff",
                              color: "#7e22ce",
                              fontWeight: 700
                            }}
                          >
                            <i className="ti ti-plus" style={{ fontSize: "14px" }}></i>
                            <span>Add &quot;{trimmedSearch}&quot; as denomination</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
          <div>
            <label>Established Year</label>
            <input
              id="f-establishedYear"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1998"
              maxLength={4}
              value={formData.establishedYear || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                updateFormData({ establishedYear: val });
              }}
            />
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

        <SharedAddressField 
          idPrefix="main"
          country={formData.country || ""}
          address={formData.address || ""}
          addressDetails={formData.addressDetails || ""}
          latitude={formData.latitude}
          longitude={formData.longitude}
          onUpdateCountry={(val) => {
            updateFormData({ country: val });
            if (errors.country) setErrors({ ...errors, country: "" });
          }}
          onUpdateAddress={(val) => {
            updateFormData({ address: val });
            if (errors.address) setErrors({ ...errors, address: "" });
          }}
          onUpdateAddressDetails={(val) => {
            updateFormData({ addressDetails: val });
            if (errors.addressDetails) setErrors({ ...errors, addressDetails: "" });
          }}
          onUpdateCoordinates={(lat, lng) => {
            updateFormData({ latitude: lat, longitude: lng });
          }}
          errors={errors}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={handleNext} className="btn-primary">
          Next — Contact <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
        </button>
      </div>
    </div>
  );
}
