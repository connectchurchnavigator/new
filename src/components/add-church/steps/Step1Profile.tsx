import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "@/context/FormContext";
import SharedAddressField from "./SharedAddressField";

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

        <SharedAddressField 
          idPrefix="main"
          country={formData.country || ""}
          address={formData.address || ""}
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
