'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TopNav from '@/components/layout/TopNav';
import { TagInput } from '@/components/TagInput';
import { ImageUpload } from '@/components/ImageUpload';
import SharedAddressField from '@/components/add-church/steps/SharedAddressField';
import logoImg from '@/Assets/logo (1).png';

interface FormState {
  full_name: string;
  title: string;
  church_name_cache: string;
  city: string;
  country: string;
  address?: string;
  latitude?: number;
  longitude?: number;

  phone: string;
  email: string;
  website_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  whatsapp_url: string;

  bio: string;
  vision_statement: string;
  years_in_ministry: string;
  churches_planted: string;
  nations_reached: string;
  preaching_tags: string[];
  ministry_area_tags: string[];
  available_for_tags: string[];

  languages: string[];

  travel_range: string;
  lead_time: string;
  availability_status: 'available' | 'limited' | 'unavailable';
  availability_note: string;

  avatar_url: string;
  cover_photo_urls: string[];
}

const STEPS = [
  { id: 1, label: 'Basics', icon: 'ti-user' },
  { id: 2, label: 'Contact', icon: 'ti-phone' },
  { id: 3, label: 'Ministry', icon: 'ti-heart-handshake' },
  { id: 4, label: 'Languages', icon: 'ti-language' },
  { id: 5, label: 'Availability', icon: 'ti-calendar-check' },
  { id: 6, label: 'Media', icon: 'ti-photo' },
];

const AI_HINTS: Record<number, string> = {
  1: "Let's start with the basics. Use your full title and name — it's how members and event organisers will find you.",
  2: 'Add the ways people can reach you. Only fill in what you actually use — quality over quantity.',
  3: 'Tell your story. Add tags for what you preach on, the ministry areas you lead, and what kinds of events you\'re open to.',
  4: 'Add every language you minister in — this helps churches looking for a specific language find you.',
  5: 'Let event organisers know your travel range and how much notice you typically need.',
  6: 'A great photo makes a big first impression. Upload a profile photo and a few cover images for your hero banner.',
};

const COMMON_LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'German', 'Mandarin', 'Arabic', 'Hindi'];
const PREACHING_SUGGESTIONS = ['Prophetic preaching', 'Evangelism', 'Expository teaching', 'Faith & healing', 'Leadership'];
const MINISTRY_SUGGESTIONS = ['Youth ministry', 'Community outreach', "Women's ministry", "Men's network", 'Marriage & family', 'Prison ministry'];
const AVAILABLE_FOR_SUGGESTIONS = ['Sunday services', 'Conferences', 'Revival meetings', 'Retreats', 'Weddings', 'Funerals'];

const initialState: FormState = {
  full_name: '',
  title: 'Senior Pastor',
  church_name_cache: '',
  city: '',
  country: 'United Kingdom',
  phone: '',
  email: '',
  website_url: '',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  twitter_url: '',
  whatsapp_url: '',
  bio: '',
  vision_statement: '',
  years_in_ministry: '',
  churches_planted: '',
  nations_reached: '',
  preaching_tags: [],
  ministry_area_tags: [],
  available_for_tags: [],
  languages: ['English'],
  travel_range: 'UK only',
  lead_time: '2 weeks min',
  availability_status: 'available',
  availability_note: '',
  avatar_url: '',
  cover_photo_urls: [],
};

export default function PastorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState("");

  const handleLoadSampleData = () => {
    if (step === 1) {
      setForm(prev => ({
        ...prev,
        full_name: "Pastor Emmanuel Adeyemi",
        title: "Senior Pastor",
        church_name_cache: "Kingsway International Christian Centre",
        city: "London",
        country: "United Kingdom",
        address: "Waterberry Drive, Waterlooville, PO7 7XX",
        latitude: 50.8805,
        longitude: -1.0261
      }));
      setErrors(prev => ({ ...prev, full_name: "", country: "", address: "" }));
      setVerified(prev => ({ ...prev, full_name: true, country: true, address: true }));
      setToastMsg("✨ Sample pastor profile & church details loaded for Step 1!");
    } else if (step === 2) {
      setForm(prev => ({
        ...prev,
        phone: "+44 20 8525 0000",
        email: "pastor.emmanuel@kicc.org.uk",
        website_url: "https://emmanueladeyemi.org",
        facebook_url: "https://facebook.com/pastoremmanuel",
        instagram_url: "https://instagram.com/pastoremmanuel",
        youtube_url: "https://youtube.com/@pastoremmanuel",
        twitter_url: "https://x.com/pastoremmanuel",
        whatsapp_url: "+447911123456"
      }));
      setErrors(prev => ({ ...prev, email: "", phone: "", website_url: "", facebook_url: "", instagram_url: "", youtube_url: "", twitter_url: "" }));
      setVerified(prev => ({ ...prev, email: true, phone: true, website_url: true, facebook_url: true, instagram_url: true, youtube_url: true, twitter_url: true }));
      setToastMsg("✨ Sample contact numbers & social channels loaded for Step 2!");
    } else if (step === 3) {
      setForm(prev => ({
        ...prev,
        bio: "Pastor Emmanuel Adeyemi has been serving the body of Christ for over 22 years, preaching dynamic messages of faith, purpose, and spiritual renewal. He is committed to raising kingdom leaders and transforming communities through the Gospel.",
        vision_statement: "To empower believers to walk in authentic dominion and manifest God's love in every sphere of influence.",
        years_in_ministry: "22",
        churches_planted: "8",
        nations_reached: "16",
        preaching_tags: ["Prophetic preaching", "Faith & healing", "Leadership", "Expository teaching"],
        ministry_area_tags: ["Community outreach", "Youth ministry", "Men's network", "Marriage & family"],
        available_for_tags: ["Sunday services", "Conferences", "Revival meetings", "Leadership Retreats"],
      }));
      setToastMsg("✨ Sample ministry biography, vision, and tags loaded for Step 3!");
    } else if (step === 4) {
      setForm(prev => ({
        ...prev,
        languages: ["English", "French", "Yoruba", "Spanish"]
      }));
      setToastMsg("✨ Sample spoken languages loaded for Step 4!");
    } else if (step === 5) {
      setForm(prev => ({
        ...prev,
        travel_range: "International",
        lead_time: "2-4 weeks",
        availability_status: "available",
        availability_note: "Available for international apostolic conferences and regional leadership summits with advance notice."
      }));
      setToastMsg("✨ Sample travel availability & booking note loaded for Step 5!");
    } else if (step === 6) {
      setForm(prev => ({
        ...prev,
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
        cover_photo_urls: ["https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80"],
        gallery_photo_urls: [
          "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80",
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
        ]
      }));
      setToastMsg("✨ Sample portrait & ministry media loaded for Step 6!");
    }
    setTimeout(() => setToastMsg(""), 4500);
  };

  const SOCIAL_RULES: { [key: string]: { rx: RegExp, others: RegExp, name: string, ex: string } } = {
    facebook_url: { rx: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|fb\.me)\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'Facebook', ex: 'facebook.com/yourprofile' },
    instagram_url: { rx: /(^@[A-Za-z0-9._]{2,30}$)|^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(facebook\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'Instagram', ex: 'instagram.com/yourprofile or @handle' },
    youtube_url: { rx: /^(https?:\/\/)?(www\.)?(youtube\.com\/[A-Za-z0-9@._\-\/?=&%]+|youtu\.be\/[A-Za-z0-9\-]+)$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'YouTube', ex: 'youtube.com/@yourchannel' },
    twitter_url: { rx: /(^@[A-Za-z0-9_]{1,15}$)|^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|tiktok\.com|t\.me)/i, name: 'X / Twitter', ex: 'twitter.com/yourhandle or @handle' },
    website_url: { rx: /^(https?:\/\/)?(www\.)?[A-Za-z0-9.\-]+\.[a-z]{2,}(\/.*)?$/i, others: /^$/i, name: 'Website', ex: 'https://yourwebsite.com' }
  };

  const validateSocialField = (field: string, value: string) => {
    let errorMsg = "";
    let isVerified = false;
    const v = value.trim();

    if (field === "email") {
      if (!v) {
        errorMsg = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        errorMsg = "Please enter a valid email address";
      } else {
        isVerified = true;
      }
    } else if (field === "phone") {
      if (v && v.replace(/[^0-9]/g, '').length < 9) {
        errorMsg = "Phone number must be at least 9 digits";
      } else if (v) {
        isVerified = true;
      }
    } else if (SOCIAL_RULES[field]) {
      if (v) {
        const R = SOCIAL_RULES[field];
        const wrong = R.others.exec(v);
        if (wrong) {
          errorMsg = `That looks like a different platform link — please put your ${R.name} link here.`;
        } else if (!R.rx.test(v)) {
          errorMsg = `Enter a valid ${R.name} link (e.g. ${R.ex}).`;
        } else {
          isVerified = true;
        }
      }
    }

    setErrors(prev => ({ ...prev, [field]: errorMsg }));
    setVerified(prev => ({ ...prev, [field]: isVerified }));
  };

  const getInputStyle = (field: string) => {
    if (errors[field]) return { border: "1.5px solid red", backgroundColor: "#fef2f2" };
    if (verified[field]) return { border: "1.5px solid #16a34a", backgroundColor: "#f0fdf4" };
    return {};
  };

  function validateStep(s: number): boolean {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!form.full_name || form.full_name.trim().length < 3) {
        newErrors.full_name = 'Full name must be at least 3 characters';
      }
      if (!form.country || !form.country.trim()) {
        newErrors.country = 'Country is required';
      }
      if (!form.address && !form.city) {
        newErrors.address = 'Address is required';
      }
    }

    if (s === 2) {
      if (!form.email || !form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Enter a valid email address';
      }

      if (form.phone && form.phone.replace(/[^0-9]/g, '').length < 9) {
        newErrors.phone = 'Phone number must be at least 9 digits';
      }

      Object.keys(SOCIAL_RULES).forEach(field => {
        const val = (form as any)[field] || "";
        if (val.trim()) {
          const R = SOCIAL_RULES[field];
          const wrong = R.others.exec(val.trim());
          if (wrong) {
            newErrors[field] = `That looks like a different platform link — please put your ${R.name} link here.`;
          } else if (!R.rx.test(val.trim())) {
            newErrors[field] = `Enter a valid ${R.name} link (e.g. ${R.ex}).`;
          }
        }
      });
    }

    if (s === 4) {
      if (!form.languages || form.languages.length === 0) {
        newErrors.languages = 'Add at least one language';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function goToStep(n: number) {
    setVisited((prev) => new Set(prev).add(n));
    setStep(n);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function stepState(id: number): 'done' | 'partial' | 'empty' {
    if (!visited.has(id) || id === step) return 'empty';
    if (id === 1) return form.full_name.trim().length >= 3 ? 'done' : 'empty';
    if (id === 2) return form.email || form.phone ? 'done' : 'empty';
    if (id === 3) return form.bio || form.preaching_tags.length ? 'done' : 'empty';
    if (id === 4) return form.languages.length > 0 ? 'done' : 'empty';
    if (id === 5) return form.travel_range ? 'done' : 'empty';
    if (id === 6) return form.avatar_url ? 'done' : 'empty';
    return 'empty';
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');

    const payload = {
      ...form,
      years_in_ministry: form.years_in_ministry ? Number(form.years_in_ministry) : undefined,
      churches_planted: form.churches_planted ? Number(form.churches_planted) : undefined,
      nations_reached: form.nations_reached ? Number(form.nations_reached) : undefined,
    };

    try {
      const res = await fetch('/api/pastors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.issues?.fieldErrors) {
          const errors = Object.entries(data.issues.fieldErrors)
            .map(([field, msgs]: any) => `${field.replace('_', ' ')}: ${msgs.join(', ')}`)
            .join('; ');
          throw new Error(`Validation failed - ${errors}`);
        }
        throw new Error(data.error || 'Something went wrong submitting your profile.');
      }

      router.push(`/pastor/${data.slug}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Form Wizard Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="brand-mark"><i className="ti ti-user" style={{ fontSize: "18px", color: "#fff" }}></i></div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>Add Pastor Profile</div>
              <div style={{ fontSize: "12.5px", color: "var(--cn-gray)" }}>Step {step} of {STEPS.length}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handleLoadSampleData}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "12px",
                border: "1.5px solid #a855f7",
                background: "linear-gradient(135deg, #f5f3ff, #faf5ff)",
                color: "#7e22ce",
                fontSize: "13.5px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(168, 85, 247, 0.15)",
                transition: "all 0.2s",
              }}
              title={`Pre-fill Step ${step} with sample pastor data`}
            >
              <i className="ti ti-sparkles" style={{ fontSize: "16px", color: "#9333ea" }}></i>
              Load Sample Data
            </button>
            <button className="btn-secondary" onClick={() => router.push('/add-listing')}>
              <i className="ti ti-x" style={{ fontSize: "14px" }}></i> Exit
            </button>
          </div>
        </div>

        {/* Toast confirmation message */}
        {toastMsg && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            marginBottom: "24px",
            background: "#f0fdf4",
            border: "1.5px solid #86efac",
            borderRadius: "14px",
            color: "#166534",
            fontSize: "13.5px",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(22, 101, 52, 0.08)",
            animation: "fadeIn 0.3s ease"
          }}>
            <i className="ti ti-circle-check" style={{ fontSize: "18px", color: "#16a34a" }}></i>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Step Progress Bar with Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "54px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 0, flex: 1 }}>
            {STEPS.map((s, index) => {
              const isDone = step > s.id;
              const isActive = step === s.id;
              const isPending = step < s.id;

              return (
                <React.Fragment key={s.id}>
                  <div className="step-wrap" onClick={() => { if (isDone || isActive) goToStep(s.id); }}>
                    <div className={`step-icon-outer ${isActive ? "active" : isDone ? "done" : "pending"}`}>
                      {isDone ? (
                        <i className="ti ti-check" style={{ fontSize: "20px", color: "#fff" }}></i>
                      ) : (
                        <i className={`ti ${s.icon}`} style={{ fontSize: "20px", color: isActive ? "#fff" : "var(--cn-gray-light)" }}></i>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: isActive || isDone ? 700 : 600, color: isActive ? "var(--cn-purple)" : isDone ? "var(--cn-ink)" : "var(--cn-gray-light)", position: "absolute", top: "54px", whiteSpace: "nowrap" }}>
                      {s.label}
                    </div>
                  </div>
                  
                  {/* Connector line between steps */}
                  {index < STEPS.length - 1 && (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", height: "46px" }}>
                      <div className={`step-connector ${isDone ? "done" : ""}`}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ fontSize: "13px", color: "var(--cn-gray)", fontWeight: 600, flexShrink: 0, height: "46px", display: "flex", alignItems: "center" }}>
            Step {step} of {STEPS.length}
          </div>
        </div>

        {/* Step content */}
        {step === 1 && (
          <Card title="Profile" icon="ti-user" onLoadSample={handleLoadSampleData}>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <Field label="Full name" required>
                <input
                  value={form.full_name}
                  onChange={(e) => {
                    update('full_name', e.target.value);
                    if (errors.full_name) setErrors(prev => ({ ...prev, full_name: '' }));
                  }}
                  placeholder="e.g. Pastor James Okafor"
                />
                {errors.full_name && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px", fontWeight: 600 }}>{errors.full_name}</p>}
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "18px" }}>
                <Field label="Title">
                  <select value={form.title} onChange={(e) => update('title', e.target.value)}>
                    <option>Senior Pastor</option>
                    <option>Associate Pastor</option>
                    <option>Youth Pastor</option>
                    <option>Bishop</option>
                    <option>Apostle</option>
                    <option>Prophet / Prophetess</option>
                    <option>Evangelist</option>
                    <option>Other</option>
                  </select>
                </Field>
              </div>
              <Field label="Home church">
                <input
                  value={form.church_name_cache}
                  onChange={(e) => {
                    update('church_name_cache', e.target.value);
                    if (errors.church_name_cache) setErrors(prev => ({ ...prev, church_name_cache: '' }));
                  }}
                  placeholder="e.g. Liberty Christian Connections"
                />
                {errors.church_name_cache && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px", fontWeight: 600 }}>{errors.church_name_cache}</p>}
              </Field>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card title="Address" icon="ti-map-pin">
            <SharedAddressField
              idPrefix="pastor-main"
              country={form.country || "United Kingdom"}
              address={form.address || form.city || ""}
              latitude={form.latitude}
              longitude={form.longitude}
              onUpdateCountry={(val) => {
                update('country', val);
                if (errors.country) setErrors(prev => ({ ...prev, country: '' }));
              }}
              onUpdateAddress={(val) => {
                update('address', val);
                update('city', val);
                if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
              }}
              onUpdateCoordinates={(lat, lng) => {
                setForm(f => ({ ...f, latitude: lat, longitude: lng }));
              }}
              errors={errors}
            />
          </Card>
        )}

        {step === 2 && (
          <Card title="Contact info" icon="ti-phone" onLoadSample={handleLoadSampleData}>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <Field label="Email" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      update('email', e.target.value);
                      validateSocialField('email', e.target.value);
                    }}
                    style={getInputStyle('email')}
                    placeholder="pastor@church.co.uk"
                  />
                  {errors.email && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                      <span>{errors.email}</span>
                    </div>
                  )}
                </Field>
                <Field label="Phone / WhatsApp">
                  <input
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d\s\+\-\(\)]/g, '');
                      update('phone', val);
                      validateSocialField('phone', val);
                    }}
                    style={getInputStyle('phone')}
                    placeholder="07700 900123"
                  />
                  {errors.phone && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </Field>
              </div>
              <Field label="Website">
                <input
                  value={form.website_url}
                  onChange={(e) => {
                    update('website_url', e.target.value);
                    validateSocialField('website_url', e.target.value);
                  }}
                  style={getInputStyle('website_url')}
                  placeholder="https://yourwebsite.com"
                />
                {errors.website_url && (
                  <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                    <span>{errors.website_url}</span>
                  </div>
                )}
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <Field label="Facebook">
                  <input
                    value={form.facebook_url}
                    onFocus={() => { if (!form.facebook_url) update('facebook_url', 'https://facebook.com/'); }}
                    onChange={(e) => {
                      update('facebook_url', e.target.value);
                      validateSocialField('facebook_url', e.target.value);
                    }}
                    style={getInputStyle('facebook_url')}
                    placeholder="https://facebook.com/yourprofile"
                  />
                  {errors.facebook_url && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                      <span>{errors.facebook_url}</span>
                    </div>
                  )}
                </Field>
                <Field label="Instagram">
                  <input
                    value={form.instagram_url}
                    onFocus={() => { if (!form.instagram_url) update('instagram_url', 'https://instagram.com/'); }}
                    onChange={(e) => {
                      update('instagram_url', e.target.value);
                      validateSocialField('instagram_url', e.target.value);
                    }}
                    style={getInputStyle('instagram_url')}
                    placeholder="https://instagram.com/yourprofile or @handle"
                  />
                  {errors.instagram_url && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                      <span>{errors.instagram_url}</span>
                    </div>
                  )}
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <Field label="YouTube">
                  <input
                    value={form.youtube_url}
                    onFocus={() => { if (!form.youtube_url) update('youtube_url', 'https://youtube.com/'); }}
                    onChange={(e) => {
                      update('youtube_url', e.target.value);
                      validateSocialField('youtube_url', e.target.value);
                    }}
                    style={getInputStyle('youtube_url')}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                  {errors.youtube_url && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                      <span>{errors.youtube_url}</span>
                    </div>
                  )}
                </Field>
                <Field label="X / Twitter">
                  <input
                    value={form.twitter_url}
                    onFocus={() => { if (!form.twitter_url) update('twitter_url', 'https://twitter.com/'); }}
                    onChange={(e) => {
                      update('twitter_url', e.target.value);
                      validateSocialField('twitter_url', e.target.value);
                    }}
                    style={getInputStyle('twitter_url')}
                    placeholder="https://twitter.com/yourhandle or @handle"
                  />
                  {errors.twitter_url && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                      <span>{errors.twitter_url}</span>
                    </div>
                  )}
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <Field label="LinkedIn">
                  <input
                    value={(form as any).linkedin_url || ''}
                    onFocus={() => { if (!(form as any).linkedin_url) update('linkedin_url' as any, 'https://linkedin.com/in/'); }}
                    onChange={(e) => update('linkedin_url' as any, e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </Field>
                <Field label="TikTok">
                  <input
                    value={(form as any).tiktok_url || ''}
                    onFocus={() => { if (!(form as any).tiktok_url) update('tiktok_url' as any, 'https://tiktok.com/@'); }}
                    onChange={(e) => update('tiktok_url' as any, e.target.value)}
                    placeholder="https://tiktok.com/@yourhandle"
                  />
                </Field>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card title="Ministry & Bio" icon="ti-heart-handshake" onLoadSample={handleLoadSampleData}>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <Field label="Biography">
                <textarea
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  rows={5}
                  placeholder="Tell people about your ministry journey, calling, and what you're known for..."
                  className="resize-none"
                />
              </Field>
              <Field label="Vision statement">
                <textarea
                  value={form.vision_statement}
                  onChange={(e) => update('vision_statement', e.target.value)}
                  rows={2}
                  placeholder='"To raise a generation of..."'
                  className="resize-none"
                />
              </Field>
              <Field label="Core Values (e.g. Spirit-Led Worship, Kingdom Community, Global Missions)">
                <TagInput
                  value={(form as any).core_values || []}
                  onChange={(v) => update('core_values' as any, v)}
                  placeholder="Type a core value and press Enter..."
                  suggestions={['Spirit-Led Worship', 'Kingdom Community', 'Global Missions', 'Social Transformation']}
                  colorClass="chip-purple"
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" }}>
                <Field label="Years in ministry">
                  <input type="number" value={form.years_in_ministry} onChange={(e) => {
                    update('years_in_ministry', e.target.value);
                    if (errors.years_in_ministry) setErrors(prev => ({ ...prev, years_in_ministry: '' }));
                  }} />
                  {errors.years_in_ministry && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>{errors.years_in_ministry}</p>}
                </Field>
                <Field label="Churches planted">
                  <input type="number" value={form.churches_planted} onChange={(e) => {
                    update('churches_planted', e.target.value);
                    if (errors.churches_planted) setErrors(prev => ({ ...prev, churches_planted: '' }));
                  }} />
                  {errors.churches_planted && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>{errors.churches_planted}</p>}
                </Field>
                <Field label="Nations reached">
                  <input type="number" value={form.nations_reached} onChange={(e) => {
                    update('nations_reached', e.target.value);
                    if (errors.nations_reached) setErrors(prev => ({ ...prev, nations_reached: '' }));
                  }} />
                  {errors.nations_reached && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px", fontWeight: 600 }}>{errors.nations_reached}</p>}
                </Field>
              </div>
              <Field label="Preaching specialisms">
                <TagInput value={form.preaching_tags} onChange={(v) => update('preaching_tags', v)} placeholder="Type and press Enter..." suggestions={PREACHING_SUGGESTIONS} colorClass="chip-red" />
              </Field>
              <Field label="Ministry areas">
                <TagInput value={form.ministry_area_tags} onChange={(v) => update('ministry_area_tags', v)} placeholder="Type and press Enter..." suggestions={MINISTRY_SUGGESTIONS} colorClass="chip-amber" />
              </Field>
              <Field label="Available for">
                <TagInput value={form.available_for_tags} onChange={(v) => update('available_for_tags', v)} placeholder="Type and press Enter..." suggestions={AVAILABLE_FOR_SUGGESTIONS} colorClass="chip-green" />
              </Field>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card title="Languages, Sermons & Education" icon="ti-school" onLoadSample={handleLoadSampleData}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Field label="Languages you minister in" required>
                <TagInput value={form.languages} onChange={(v) => {
                  update('languages', v);
                  if (errors.languages) setErrors(prev => ({ ...prev, languages: '' }));
                }} placeholder="Type a language and press Enter..." suggestions={COMMON_LANGUAGES} colorClass="chip-purple" />
                {errors.languages && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px", fontWeight: 600 }}>{errors.languages}</p>}
              </Field>

              {/* Multi-link Sermons */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f0f1a", marginBottom: "8px" }}>
                  Sermon &amp; Video Links
                </label>
                {(((form as any).sermon_links && (form as any).sermon_links.length > 0)
                  ? (form as any).sermon_links
                  : ['']
                ).map((link: string, idx: number) => {
                  const linksList = (form as any).sermon_links && (form as any).sermon_links.length > 0 ? [...(form as any).sermon_links] : [''];
                  return (
                    <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                      <input
                        value={link}
                        onChange={(e) => {
                          const updated = [...linksList];
                          updated[idx] = e.target.value;
                          update('sermon_links' as any, updated);
                        }}
                        placeholder="Paste YouTube, Vimeo, or podcast URL..."
                        style={{ flex: 1 }}
                      />
                      {linksList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = linksList.filter((_, i) => i !== idx);
                            update('sermon_links' as any, updated);
                          }}
                          style={{ border: "none", background: "#fee2e2", color: "#ef4444", padding: "8px 12px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }}
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    const current = (form as any).sermon_links || [''];
                    update('sermon_links' as any, [...current, '']);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1.5px dashed #a855f7", background: "#faf5ff", color: "#7e22ce", padding: "8px 16px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "4px" }}
                >
                  <i className="ti ti-plus"></i> Add another video link
                </button>
              </div>

              {/* Multi-item Education with Separate Sub-fields */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f0f1a", marginBottom: "8px" }}>
                  Education &amp; Qualifications
                </label>
                {(((form as any).education_items && (form as any).education_items.length > 0)
                  ? (form as any).education_items
                  : [{ degree: '', university: '' }]
                ).map((item: { degree: string; university: string }, idx: number) => {
                  const itemsList = (form as any).education_items && (form as any).education_items.length > 0
                    ? [...(form as any).education_items]
                    : [{ degree: '', university: '' }];
                  return (
                    <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
                      <input
                        value={item.degree || ''}
                        onChange={(e) => {
                          const updated = [...itemsList];
                          updated[idx] = { ...updated[idx], degree: e.target.value };
                          update('education_items' as any, updated);
                        }}
                        placeholder="Degree / Specialization (e.g. Doctor of Ministry)"
                        style={{ flex: 1 }}
                      />
                      <input
                        value={item.university || ''}
                        onChange={(e) => {
                          const updated = [...itemsList];
                          updated[idx] = { ...updated[idx], university: e.target.value };
                          update('education_items' as any, updated);
                        }}
                        placeholder="University / College Name"
                        style={{ flex: 1 }}
                      />
                      {itemsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = itemsList.filter((_, i) => i !== idx);
                            update('education_items' as any, updated);
                          }}
                          style={{ border: "none", background: "#fee2e2", color: "#ef4444", padding: "10px 12px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    const current = (form as any).education_items || [{ degree: '', university: '' }];
                    update('education_items' as any, [...current, { degree: '', university: '' }]);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1.5px dashed #f59e0b", background: "#fffbeb", color: "#b45309", padding: "8px 16px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "2px" }}
                >
                  <i className="ti ti-plus"></i> Add another qualification
                </button>
              </div>

              {/* Multi-item Awards with 3 Separate Fields */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f0f1a", marginBottom: "8px" }}>
                  Awards &amp; Honors
                </label>
                {(((form as any).award_items && (form as any).award_items.length > 0)
                  ? (form as any).award_items
                  : [{ title: '', issuer: '', year: '' }]
                ).map((item: { title: string; issuer: string; year: string }, idx: number) => {
                  const itemsList = (form as any).award_items && (form as any).award_items.length > 0
                    ? [...(form as any).award_items]
                    : [{ title: '', issuer: '', year: '' }];
                  return (
                    <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
                      <input
                        value={item.title || ''}
                        onChange={(e) => {
                          const updated = [...itemsList];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          update('award_items' as any, updated);
                        }}
                        placeholder="Award Title"
                        style={{ flex: 1.5 }}
                      />
                      <input
                        value={item.issuer || ''}
                        onChange={(e) => {
                          const updated = [...itemsList];
                          updated[idx] = { ...updated[idx], issuer: e.target.value };
                          update('award_items' as any, updated);
                        }}
                        placeholder="Who / Issuer"
                        style={{ flex: 1.2 }}
                      />
                      <input
                        value={item.year || ''}
                        onChange={(e) => {
                          const updated = [...itemsList];
                          updated[idx] = { ...updated[idx], year: e.target.value };
                          update('award_items' as any, updated);
                        }}
                        placeholder="Year"
                        style={{ width: "100px", flexShrink: 0 }}
                      />
                      {itemsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = itemsList.filter((_, i) => i !== idx);
                            update('award_items' as any, updated);
                          }}
                          style={{ border: "none", background: "#fee2e2", color: "#ef4444", padding: "10px 12px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    const current = (form as any).award_items || [{ title: '', issuer: '', year: '' }];
                    update('award_items' as any, [...current, { title: '', issuer: '', year: '' }]);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1.5px dashed #f43f5e", background: "#fff1f2", color: "#e11d48", padding: "8px 16px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "2px" }}
                >
                  <i className="ti ti-plus"></i> Add another award
                </button>
              </div>
            </div>
          </Card>
        )}

        {step === 5 && (
          <Card title="Travel & Availability" icon="ti-calendar-check" onLoadSample={handleLoadSampleData}>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <Field label="Travel range">
                  <select value={form.travel_range} onChange={(e) => update('travel_range', e.target.value)}>
                    <option>Local only</option>
                    <option>UK only</option>
                    <option>Europe</option>
                    <option>International</option>
                  </select>
                </Field>
                <Field label="Lead time">
                  <select value={form.lead_time} onChange={(e) => update('lead_time', e.target.value)}>
                    <option>1 week min</option>
                    <option>2 weeks min</option>
                    <option>1 month min</option>
                    <option>3 months min</option>
                  </select>
                </Field>
              </div>
              <Field label="Availability status">
                <select
                  value={form.availability_status}
                  onChange={(e) => update('availability_status', e.target.value as FormState['availability_status'])}
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited availability</option>
                  <option value="unavailable">Not currently available</option>
                </select>
              </Field>
              <Field label="Availability note">
                <input
                  value={form.availability_note}
                  onChange={(e) => update('availability_note', e.target.value)}
                  placeholder='e.g. "Open 2025"'
                />
              </Field>
            </div>
          </Card>
        )}

        {step === 6 && (
          <Card title="Media & Gallery Uploads" icon="ti-photo" onLoadSample={handleLoadSampleData}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ImageUpload kind="avatar" label="Profile photo" onUploaded={(url) => update('avatar_url', url)} currentUrl={form.avatar_url} />
                <ImageUpload
                  kind="cover"
                  label="Cover photo"
                  onUploaded={(url) => update('cover_photo_urls', [...form.cover_photo_urls.filter((u) => u !== url), url])}
                  currentUrl={form.cover_photo_urls[0]}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f0f1a", marginBottom: "4px" }}>
                  Ministry Gallery Photos (Multiple Images)
                </label>
                <p style={{ color: "#6b7280", fontSize: "12px", marginBottom: "12px" }}>
                  Select multiple photos at once from your ministry, conferences, book launches, and speaking events.
                </p>

                {/* Single Big Dropzone Box */}
                <div
                  onClick={() => document.getElementById('gallery-multi-upload')?.click()}
                  style={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: "16px",
                    padding: "32px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#f8fafc",
                    transition: "all 0.2s",
                    marginBottom: "16px"
                  }}
                  className="hover:border-purple hover:bg-purple/5"
                >
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", color: "#64748b" }}>
                    <i className="ti ti-cloud-upload" style={{ fontSize: "24px" }}></i>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                    Click to select multiple photos
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                    Upload PNG, JPG, or WEBP images
                  </div>
                  <input
                    id="gallery-multi-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;

                      const currentPhotos = [...((form as any).gallery_photo_urls || [])];
                      for (const file of files) {
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('kind', 'gallery');
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          if (res.ok && data.url) {
                            currentPhotos.push(data.url);
                          }
                        } catch (err) {
                          console.error('Gallery image upload failed', err);
                        }
                      }
                      update('gallery_photo_urls' as any, currentPhotos);
                    }}
                  />
                </div>

                {/* Selected Photos Preview Grid */}
                {((form as any).gallery_photo_urls || []).length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    {((form as any).gallery_photo_urls || []).map((url: string, idx: number) => (
                      <div key={idx} style={{ position: "relative", aspectRatio: "1", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Gallery ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = ((form as any).gallery_photo_urls || []).filter((_: any, i: number) => i !== idx);
                            update('gallery_photo_urls' as any, updated);
                          }}
                          style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(15, 23, 42, 0.75)", color: "#fff", border: "none", width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
                          title="Remove photo"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {submitError && <p className="text-sm text-red-600 mb-3">{submitError}</p>}
          </Card>
        )}

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
          {step > 1 && (
            <button onClick={() => goToStep(step - 1)} className="btn-secondary">
              <i className="ti ti-arrow-left" style={{ fontSize: "16px" }}></i> Back
            </button>
          )}
          {step < STEPS.length ? (
            <button onClick={() => { if (validateStep(step)) goToStep(step + 1); }} className="btn-primary">
              Next <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Publishing…' : 'Publish profile'} <i className="ti ti-check" style={{ fontSize: "16px" }}></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  title?: string;
  icon?: string;
  onLoadSample?: () => void;
  children: React.ReactNode;
}

function Card({ title, icon, onLoadSample, children }: CardProps) {
  return (
    <div className="scard" style={{ overflow: "visible", marginBottom: "20px" }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "var(--cn-grad)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={`ti ${icon || 'ti-user'}`} style={{ fontSize: "18px", color: "#fff" }}></i>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>{title}</div>
          </div>
          {onLoadSample && (
            <button
              type="button"
              onClick={onLoadSample}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 13px",
                borderRadius: "10px",
                border: "1.5px solid #d8b4fe",
                background: "#faf5ff",
                color: "#7e22ce",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <i className="ti ti-sparkles" style={{ fontSize: "14px", color: "#9333ea" }}></i>
              Load Sample Data
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label>
        {label} {required && <span className="req-badge" style={{ marginLeft: "6px" }}>REQUIRED</span>}
      </label>
      {children}
    </div>
  );
}
