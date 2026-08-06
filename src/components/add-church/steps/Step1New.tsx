import React, { useState } from "react";
import { useFormContext } from "@/context/FormContext";
import SharedAddressField from "./SharedAddressField";

interface Step1NewProps {
  onNext: () => void;
}

const SOCIAL_RULES: { [key: string]: { rx: RegExp, others: RegExp, name: string, ex: string } } = {
  facebook: { rx: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|fb\.me)\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'Facebook', ex: 'facebook.com/yourchurch' },
  instagram: { rx: /(^@[A-Za-z0-9._]{2,30}$)|^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(facebook\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'Instagram', ex: 'instagram.com/yourchurch or @handle' },
  youtube: { rx: /^(https?:\/\/)?(www\.)?(youtube\.com\/[A-Za-z0-9@._\-\/?=&%]+|youtu\.be\/[A-Za-z0-9\-]+)$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'YouTube', ex: 'youtube.com/@yourchurch' },
  twitter: { rx: /(^@[A-Za-z0-9_]{1,15}$)|^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|tiktok\.com|t\.me)/i, name: 'X / Twitter', ex: 'twitter.com/yourchurch or @handle' },
  tiktok: { rx: /(^@[A-Za-z0-9_.-]{2,24}$)|^(https?:\/\/)?(www\.)?tiktok\.com\/@[A-Za-z0-9_.-]+\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|t\.me)/i, name: 'TikTok', ex: 'tiktok.com/@yourchurch or @handle' },
  telegram: { rx: /^(https?:\/\/)?(www\.)?t\.me\/[A-Za-z0-9_]{5,32}\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com)/i, name: 'Telegram', ex: 't.me/yourchurch' },
  linkedin: { rx: /^(https?:\/\/)?(www\.)?linkedin\.com\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(facebook\.com|instagram\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'LinkedIn', ex: 'linkedin.com/company/yourchurch' }
};

const prettyPlatform = (domain: string) => {
  const map: { [key: string]: string } = { 'facebook.com': 'Facebook', 'instagram.com': 'Instagram', 'linkedin.com': 'LinkedIn', 'youtube.com': 'YouTube', 'youtu.be': 'YouTube', 'twitter.com': 'Twitter / X', 'x.com': 'Twitter / X', 'tiktok.com': 'TikTok', 't.me': 'Telegram' };
  return map[domain.toLowerCase()] || domain;
};

const validateSocialUrl = (field: string, value: string): string => {
  let v = value.trim();
  if (/^https?:\/\/(www\.)?(facebook|instagram|youtube|twitter|x|tiktok|linkedin)\.com\/?$/i.test(v) || v === "https://t.me/") {
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

export default function Step1New({ onNext }: Step1NewProps) {
  const { formData, updateFormData } = useFormContext();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [verified, setVerified] = useState<{ [key: string]: boolean }>({});
  const [slugStatus, setSlugStatus] = useState<{ loading: boolean; available: boolean | null }>({ loading: false, available: null });

  // Debounced check for URL slug availability against /api/churches/check-slug
  React.useEffect(() => {
    const slug = formData.customSlug?.trim();
    if (!slug) {
      setSlugStatus({ loading: false, available: null });
      return;
    }

    setSlugStatus({ loading: true, available: null });
    const timer = setTimeout(() => {
      fetch(`/api/churches/check-slug?slug=${encodeURIComponent(slug)}`)
        .then(res => res.json())
        .then(data => {
          setSlugStatus({ loading: false, available: data.available });
        })
        .catch(() => {
          setSlugStatus({ loading: false, available: null });
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.customSlug]);

  // Whenever country or coordinates change, update timezone dynamically
  React.useEffect(() => {
    if (!formData.latitude || !formData.longitude) {
      // If address/country changed or edit button clicked, reset timezone
      updateFormData({ timezone: "" });
      return;
    }

    // Fetch timezone based on selected lat/long using open-meteo timezone API
    let isMounted = true;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${formData.latitude}&longitude=${formData.longitude}&current_weather=true&timezone=auto`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data && data.timezone) {
          const tzName = data.timezone;
          const utcOffsetSec = data.utc_offset_seconds || 0;
          const offsetMinutes = Math.floor(utcOffsetSec / 60);
          const sign = offsetMinutes >= 0 ? "+" : "-";
          const absMinutes = Math.abs(offsetMinutes);
          const hours = Math.floor(absMinutes / 60);
          const minutes = absMinutes % 60;
          const formattedOffset = `UTC${sign}${hours}${minutes > 0 ? `:${minutes < 10 ? '0' : ''}${minutes}` : ''}`;
          updateFormData({ timezone: `${tzName} (${formattedOffset})` });
        }
      })
      .catch(() => {
        if (!isMounted) return;
        // Fallback to browser timezone if API fails
        try {
          const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const now = new Date();
          const offsetMinutes = -now.getTimezoneOffset();
          const sign = offsetMinutes >= 0 ? "+" : "-";
          const absMinutes = Math.abs(offsetMinutes);
          const hours = Math.floor(absMinutes / 60);
          const minutes = absMinutes % 60;
          const formattedOffset = `UTC${sign}${hours}${minutes > 0 ? `:${minutes < 10 ? '0' : ''}${minutes}` : ''}`;
          updateFormData({ timezone: `${tzName} (${formattedOffset})` });
        } catch (e) {}
      });

    return () => { isMounted = false; };
  }, [formData.latitude, formData.longitude, formData.country, formData.address]);

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
    }

    setErrors(prev => ({ ...prev, [field]: errorMsg }));
    setVerified(prev => ({ ...prev, [field]: isVerified }));
  };

  const handleNext = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) newErrors.name = "Church name is required";
    if (!formData.country?.trim()) newErrors.country = "Country is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";

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

  const getInputStyle = (field: string) => {
    if (errors[field]) return { border: "1.5px solid red", backgroundColor: "#fef2f2" };
    if (verified[field]) return { border: "1.5px solid #16a34a", backgroundColor: "#f0fdf4" };
    return {};
  };

  return (
    <div className="step-content slide-up">
      {/* CHURCH PROFILE */}
      <div className="scard" style={{ overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "var(--cn-grad)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-user" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Church Info</div>
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

      {/* ADDRESS & TIMEZONE */}
      <div className="scard" style={{ overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#fb7185,#f43f5e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-map-pin" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Location & Timezone</div>
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
          onUpdateCity={(val) => {
            updateFormData({ city: val });
          }}
          onUpdateCoordinates={(lat, lng) => {
            updateFormData({ latitude: lat, longitude: lng });
          }}
          errors={errors}
        />

        <div style={{ marginTop: "18px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            Operating Timezone
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "12px" }}>
              Auto-detected
            </span>
          </label>
          <input 
            readOnly
            placeholder="Select/type your address to auto-detect timezone..."
            value={formData.timezone || ""} 
            style={{ backgroundColor: "#f8fafc", color: "var(--cn-ink)", fontWeight: 600, cursor: "not-allowed" }}
          />
        </div>
      </div>

      {/* CONTACT INFO */}
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#60a5fa,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-phone" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Contact Information</div>
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

        <div>
          <label>WhatsApp / Phone</label>
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
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={handleNext} className="btn-primary">
          Next — Service Times <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
        </button>
      </div>
    </div>
  );
}
