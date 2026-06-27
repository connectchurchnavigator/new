import React, { useState } from "react";
import { useFormContext } from "@/context/FormContext";

interface Step2ContactProps {
  onNext: () => void;
  onBack: () => void;
}

const validateSocialUrl = (field: string, value: string): string => {
  if (!value.trim()) return "";

  // Default prefixes that are populated on focus
  const prefixes: { [key: string]: string } = {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    twitter: "https://twitter.com/",
    tiktok: "https://tiktok.com/@"
  };

  const prefix = prefixes[field];
  
  // If the user hasn't typed anything beyond the prefix, or has cleared it, don't show error yet
  if (value === prefix || value === "https://" || value === "http://") {
    return "";
  }

  // Basic URL structure check
  let isValidUrl = false;
  try {
    const url = new URL(value);
    isValidUrl = url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    isValidUrl = false;
  }

  const platformName = {
    facebook: "Facebook",
    instagram: "Instagram",
    youtube: "YouTube",
    twitter: "X / Twitter",
    tiktok: "TikTok"
  }[field] || field;

  const example = {
    facebook: "facebook.com/yourchurch",
    instagram: "instagram.com/yourchurch",
    youtube: "youtube.com/c/yourchurch",
    twitter: "twitter.com/yourchurch",
    tiktok: "tiktok.com/@yourchurch"
  }[field] || "";

  if (!isValidUrl) {
    return `Enter a valid ${platformName} link (e.g. ${example}).`;
  }

  const lowerVal = value.toLowerCase();
  if (field === "facebook" && !lowerVal.includes("facebook.com")) {
    return `Enter a valid Facebook link (e.g. facebook.com/yourchurch).`;
  }
  if (field === "instagram" && !lowerVal.includes("instagram.com")) {
    return `Enter a valid Instagram link (e.g. instagram.com/yourchurch).`;
  }
  if (field === "youtube" && !lowerVal.includes("youtube.com") && !lowerVal.includes("youtu.be")) {
    return `Enter a valid YouTube link (e.g. youtube.com/c/yourchurch).`;
  }
  if (field === "twitter" && !lowerVal.includes("twitter.com") && !lowerVal.includes("x.com")) {
    return `Enter a valid X / Twitter link (e.g. twitter.com/yourchurch).`;
  }
  if (field === "tiktok" && !lowerVal.includes("tiktok.com")) {
    return `Enter a valid TikTok link (e.g. tiktok.com/@yourchurch).`;
  }

  // Enforce that there is something after the domain/prefix
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/^\/|\/$/g, '');
    if (!path || path === '@') {
      return `Enter a valid ${platformName} link (e.g. ${example}).`;
    }
  } catch (_) {
    return `Enter a valid ${platformName} link (e.g. ${example}).`;
  }

  return "";
};

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

  const validateField = (field: string, value: string) => {
    let errorMsg = "";
    
    if (field === "email") {
      if (!value.trim()) {
        errorMsg = "Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMsg = "Please enter a valid email address";
        }
      }
    } else if (field === "phone") {
      if (value && value.replace(/[^0-9]/g, '').length < 9) {
        errorMsg = "Phone number must be at least 9 digits";
      }
    } else if (["facebook", "instagram", "youtube", "twitter", "tiktok"].includes(field)) {
      errorMsg = validateSocialUrl(field, value);
    }

    setErrors(prev => ({
      ...prev,
      [field]: errorMsg
    }));
  };

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

    // Validate social fields on submit
    const socialFields = ["facebook", "instagram", "youtube", "twitter", "tiktok"];
    socialFields.forEach(field => {
      const val = formData[field] || "";
      const err = validateSocialUrl(field, val);
      if (err) {
        newErrors[field] = err;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorId = Object.keys(newErrors)[0];
      setTimeout(() => {
        const el = document.getElementById(`f-${firstErrorId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
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
              validateField("email", e.target.value);
            }}
            style={{ 
              border: errors.email ? "1.5px solid red" : "",
              backgroundColor: errors.email ? "#fef2f2" : "" 
            }}
            autoComplete="email" 
          />
          {errors.email && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
              <span>{errors.email}</span>
            </div>
          )}
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
              validateField("phone", val);
            }}
            style={{ 
              border: errors.phone ? "1.5px solid red" : "",
              backgroundColor: errors.phone ? "#fef2f2" : "" 
            }}
          />
          {errors.phone && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
              <span>{errors.phone}</span>
            </div>
          )}
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
              id="f-facebook"
              placeholder="facebook.com/yourchurch" 
              value={formData.facebook || ""}
              onFocus={() => { if (!formData.facebook) updateFormData({ facebook: "https://facebook.com/" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ facebook: val });
                validateField("facebook", val);
              }}
              style={{ 
                border: errors.facebook ? "1.5px solid red" : "",
                backgroundColor: errors.facebook ? "#fef2f2" : "" 
              }}
            />
            {errors.facebook && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                <span>{errors.facebook}</span>
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#e1306c", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-instagram" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> Instagram
            </label>
            <input 
              id="f-instagram"
              placeholder="instagram.com/yourchurch or @handle" 
              value={formData.instagram || ""}
              onFocus={() => { if (!formData.instagram) updateFormData({ instagram: "https://instagram.com/" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ instagram: val });
                validateField("instagram", val);
              }}
              style={{ 
                border: errors.instagram ? "1.5px solid red" : "",
                backgroundColor: errors.instagram ? "#fef2f2" : "" 
              }}
            />
            {errors.instagram && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                <span>{errors.instagram}</span>
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#ff0000", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-youtube" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> YouTube
            </label>
            <input 
              id="f-youtube"
              placeholder="youtube.com/c/yourchurch" 
              value={formData.youtube || ""}
              onFocus={() => { if (!formData.youtube) updateFormData({ youtube: "https://youtube.com/" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ youtube: val });
                validateField("youtube", val);
              }}
              style={{ 
                border: errors.youtube ? "1.5px solid red" : "",
                backgroundColor: errors.youtube ? "#fef2f2" : "" 
              }}
            />
            {errors.youtube && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                <span>{errors.youtube}</span>
              </div>
            )}
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
              id="f-twitter"
              placeholder="@yourchurch" 
              value={formData.twitter || ""}
              onFocus={() => { if (!formData.twitter) updateFormData({ twitter: "https://twitter.com/" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ twitter: val });
                validateField("twitter", val);
              }}
              style={{ 
                border: errors.twitter ? "1.5px solid red" : "",
                backgroundColor: errors.twitter ? "#fef2f2" : "" 
              }}
            />
            {errors.twitter && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                <span>{errors.twitter}</span>
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-tiktok" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> TikTok
            </label>
            <input 
              id="f-tiktok"
              placeholder="@yourchurch" 
              value={formData.tiktok || ""}
              onFocus={() => { if (!formData.tiktok) updateFormData({ tiktok: "https://tiktok.com/@" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ tiktok: val });
                validateField("tiktok", val);
              }}
              style={{ 
                border: errors.tiktok ? "1.5px solid red" : "",
                backgroundColor: errors.tiktok ? "#fef2f2" : "" 
              }}
            />
            {errors.tiktok && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                <span>{errors.tiktok}</span>
              </div>
            )}
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
