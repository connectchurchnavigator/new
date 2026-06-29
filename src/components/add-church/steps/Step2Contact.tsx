import React, { useState } from "react";
import { useFormContext } from "@/context/FormContext";

interface Step2ContactProps {
  onNext: () => void;
  onBack: () => void;
}

const SOCIAL_RULES: { [key: string]: { rx: RegExp, others: RegExp, name: string, ex: string } } = {
  facebook: { rx: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|fb\.me)\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'Facebook', ex: 'facebook.com/yourchurch' },
  instagram: { rx: /(^@[A-Za-z0-9._]{2,30}$)|^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(facebook\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'Instagram', ex: 'instagram.com/yourchurch or @handle' },
  youtube: { rx: /^(https?:\/\/)?(www\.)?(youtube\.com\/[A-Za-z0-9@._\-\/?=&%]+|youtu\.be\/[A-Za-z0-9\-]+)$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'YouTube', ex: 'youtube.com/@yourchurch' },
  twitter: { rx: /(^@[A-Za-z0-9_]{1,15}$)|^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|tiktok\.com|t\.me)/i, name: 'X / Twitter', ex: 'twitter.com/yourchurch or @handle' },
  tiktok: { rx: /(^@[A-Za-z0-9_.-]{2,24}$)|^(https?:\/\/)?(www\.)?tiktok\.com\/@[A-Za-z0-9_.-]+\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|t\.me)/i, name: 'TikTok', ex: 'tiktok.com/@yourchurch or @handle' },
  telegram: { rx: /^(https?:\/\/)?(www\.)?t\.me\/[A-Za-z0-9_]{5,32}\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com)/i, name: 'Telegram', ex: 't.me/yourchurch' }
};

const prettyPlatform = (domain: string) => {
  const map: { [key: string]: string } = { 'facebook.com': 'Facebook', 'instagram.com': 'Instagram', 'linkedin.com': 'LinkedIn', 'youtube.com': 'YouTube', 'youtu.be': 'YouTube', 'twitter.com': 'Twitter / X', 'x.com': 'Twitter / X', 'tiktok.com': 'TikTok', 't.me': 'Telegram' };
  return map[domain.toLowerCase()] || domain;
};

const validateSocialUrl = (field: string, value: string): string => {
  let v = value.trim();
  if (/^https?:\/\/(www\.)?(facebook|instagram|youtube|twitter|x|tiktok)\.com\/?$/i.test(v) || v === "https://t.me/") {
    return "";
  }
  if (!v) return "";

  const R = SOCIAL_RULES[field];
  if (!R) return "";

  const wrong = R.others.exec(v);
  if (wrong) {
    return `That looks like a ${prettyPlatform(wrong[0])} link — please put your ${R.name} link here.`;
  }
  
  const ok = R.rx.test(v);
  if (!ok) {
    return `Enter a valid ${R.name} link (e.g. ${R.ex}).`;
  }
  
  return "";
};

export default function Step2Contact({ onNext, onBack }: Step2ContactProps) {
  const { formData, updateFormData } = useFormContext();
  const [selectedCountry, setSelectedCountry] = useState("GB");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [verified, setVerified] = useState<{ [key: string]: boolean }>({});

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
    let isVerified = false;
    
    if (field === "email") {
      if (!value.trim()) {
        errorMsg = "Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMsg = "Please enter a valid email address";
        } else {
          isVerified = true;
        }
      }
    } else if (field === "phone") {
      if (value && value.replace(/[^0-9]/g, '').length < 9) {
        errorMsg = "Phone number must be at least 9 digits";
      } else if (value) {
        isVerified = true;
      }
    } else if (["facebook", "instagram", "youtube", "twitter", "tiktok", "telegram"].includes(field)) {
      errorMsg = validateSocialUrl(field, value);
      let v = value.trim();
      const isEmptyOrBare = !v || /^https?:\/\/(www\.)?(facebook|instagram|youtube|twitter|x|tiktok)\.com\/?$/i.test(v) || v === "https://t.me/";
      if (!errorMsg && !isEmptyOrBare) {
        isVerified = true;
      }
    }

    setErrors(prev => ({ ...prev, [field]: errorMsg }));
    setVerified(prev => ({ ...prev, [field]: isVerified }));
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

    const socialFields = ["facebook", "instagram", "youtube", "twitter", "tiktok", "telegram"];
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

  const getInputStyle = (field: string) => {
    if (errors[field]) return { border: "1.5px solid red", backgroundColor: "#fef2f2" };
    if (verified[field]) return { border: "1.5px solid #16a34a", backgroundColor: "#f0fdf4" };
    return {};
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
            style={getInputStyle("email")}
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
            style={getInputStyle("phone")}
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
              style={getInputStyle("facebook")}
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
              style={getInputStyle("instagram")}
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
              style={getInputStyle("youtube")}
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
              style={getInputStyle("twitter")}
            />
            {errors.twitter && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                <span>{errors.twitter}</span>
              </div>
            )}
          </div>
          
          {(selectedCountry === 'NG' || selectedCountry === 'GH') ? (
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#26a5e4", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-brand-telegram" style={{ fontSize: "11px", color: "#fff" }}></i>
                </span> Telegram
              </label>
              <input 
                id="f-telegram"
                placeholder="t.me/yourchurch" 
                value={formData.telegram || ""}
                onFocus={() => { if (!formData.telegram) updateFormData({ telegram: "https://t.me/" }); }}
                onChange={(e) => {
                  const val = e.target.value;
                  updateFormData({ telegram: val });
                  validateField("telegram", val);
                }}
                style={getInputStyle("telegram")}
              />
              {errors.telegram && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                  <span>{errors.telegram}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#e91e8c", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
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
                style={getInputStyle("tiktok")}
              />
              {errors.tiktok && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                  <span>{errors.tiktok}</span>
                </div>
              )}
            </div>
          )}
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
