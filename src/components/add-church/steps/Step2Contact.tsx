import React, { useState } from "react";
import { useFormContext } from "@/context/FormContext";

interface Step2ContactProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Contact({ onNext, onBack }: Step2ContactProps) {
  const { formData, updateFormData } = useFormContext();
  const [selectedCountry, setSelectedCountry] = useState("GB");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const countries = [
    { code: "GB", label: "UK", emoji: "🇬🇧" },
    { code: "US", label: "US", emoji: "🇺🇸" },
    { code: "NG", label: "Nigeria", emoji: "🇳🇬" },
    { code: "GH", label: "Ghana", emoji: "🇬🇭" },
    { code: "ZA", label: "South Africa", emoji: "🇿🇦" },
    { code: "CA", label: "Canada", emoji: "🇨🇦" },
  ];

  const handleNext = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (formData.phone && formData.phone.replace(/[^0-9]/g, '').length < 9) {
      newErrors.phone = "Phone number must be at least 9 digits";
    }

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
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#60a5fa,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-phone" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Contact</div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label>Email <span className="req-badge">REQUIRED</span></label>
          <input 
            id="f-email"
            type="email" 
            placeholder="info@church.co.uk" 
            value={formData.email || ""}
            onChange={(e) => {
              updateFormData({ email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            style={{ border: errors.email ? "1.5px solid red" : "" }}
            autoComplete="email" 
          />
          {errors.email && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label>WhatsApp / phone</label>
          <input 
            type="tel"
            id="f-phone"
            placeholder="07700 900123 or +44..." 
            value={formData.phone || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d\s\+\-\(\)]/g, '');
              updateFormData({ phone: val });
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
            style={{ border: errors.phone ? "1.5px solid red" : "" }}
          />
          {errors.phone && <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.phone}</div>}
        </div>

        <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "12px", color: "var(--cn-gray)", fontWeight: 600 }}>Tailor social fields to:</div>
          {countries.map((c) => (
            <button 
              key={c.code}
              className={`country-btn ${selectedCountry === c.code ? "on" : ""}`} 
              onClick={() => setSelectedCountry(c.code)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#1877f2", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-facebook" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> Facebook
            </label>
            <input 
              placeholder="facebook.com/yourchurch" 
              value={formData.facebook || ""}
              onFocus={() => { if (!formData.facebook) updateFormData({ facebook: "https://facebook.com/" }); }}
              onChange={(e) => updateFormData({ facebook: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#e1306c", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-instagram" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> Instagram
            </label>
            <input 
              placeholder="instagram.com/yourchurch or @handle" 
              value={formData.instagram || ""}
              onFocus={() => { if (!formData.instagram) updateFormData({ instagram: "https://instagram.com/" }); }}
              onChange={(e) => updateFormData({ instagram: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#ff0000", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-youtube" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> YouTube
            </label>
            <input 
              placeholder="youtube.com/c/yourchurch" 
              value={formData.youtube || ""}
              onFocus={() => { if (!formData.youtube) updateFormData({ youtube: "https://youtube.com/" }); }}
              onChange={(e) => updateFormData({ youtube: e.target.value })}
            />
          </div>
        </div>

        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.05em", marginBottom: "10px" }}>
          More for <span>{countries.find(c => c.code === selectedCountry)?.label || selectedCountry}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-x" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> X / Twitter
            </label>
            <input 
              placeholder="@yourchurch" 
              value={formData.twitter || ""}
              onFocus={() => { if (!formData.twitter) updateFormData({ twitter: "https://twitter.com/" }); }}
              onChange={(e) => updateFormData({ twitter: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-tiktok" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> TikTok
            </label>
            <input 
              placeholder="@yourchurch" 
              value={formData.tiktok || ""}
              onFocus={() => { if (!formData.tiktok) updateFormData({ tiktok: "https://tiktok.com/@" }); }}
              onChange={(e) => updateFormData({ tiktok: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={onBack} className="btn-secondary">
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i>
        </button>
        <button onClick={handleNext} className="btn-primary">
          Next — Ministry <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
        </button>
      </div>
    </div>
  );
}
