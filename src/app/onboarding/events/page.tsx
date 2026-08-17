"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import SharedAddressField from "@/components/add-church/steps/SharedAddressField";
import { ImageUpload } from "@/components/ImageUpload";
import RichTextEditor from "@/components/RichTextEditor";

interface HostOption {
  id: string;
  type: "church" | "pastor";
  name: string;
  subtitle: string;
  avatar?: string;
}

interface ScheduleSession {
  time_label: string;
  title: string;
  description: string;
  speaker_name: string;
}

interface SpeakerItem {
  name: string;
  photo_url: string;
  designation: string;
  affiliation: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface TicketTier {
  name: string;
  description: string;
  price: string;
  capacity: string;
  booking_url: string;
}

interface EventDateSlot {
  date: string;
  starts_time: string;
  ends_time: string;
}

interface EventFormState {
  id?: string;
  title: string;
  type: string;
  custom_type: string;
  host_type: "church" | "pastor" | "individual" | "";
  host_id: string;
  custom_host_name: string;
  mode: "Offline" | "Online" | "Hybrid" | "";
  livestream_url: string;
  description: string;

  venue_name: string;
  address: string;
  city: string;
  postcode: string;
  latitude?: number;
  longitude?: number;

  dates: EventDateSlot[];

  capacity: string;

  has_free_parking: boolean;
  near_metro_station: boolean;
  near_bus_station: boolean;
  step_free_access: boolean;
  creche_available: boolean;
  has_other_amenity: boolean;
  custom_amenity: string;
  custom_amenities: string[];

  sessions: ScheduleSession[];
  speakers: SpeakerItem[];
  faqs: FAQItem[];
  tickets: TicketTier[];

  cover_url: string;
  gallery_urls: string[];
}

const EVENT_TYPES = [
  "Conference",
  "Summit",
  "Camp",
  "Crusade",
  "Service",
  "Others"
];

const INITIAL_FORM: EventFormState = {
  title: "",
  type: "",
  custom_type: "",
  host_type: "",
  host_id: "",
  custom_host_name: "",
  mode: "",
  livestream_url: "",
  description: "",

  venue_name: "",
  address: "",
  city: "",
  postcode: "",

  dates: [
    { date: new Date().toISOString().split("T")[0], starts_time: "", ends_time: "" }
  ],

  capacity: "500",

  has_free_parking: false,
  near_metro_station: false,
  near_bus_station: false,
  step_free_access: false,
  creche_available: false,
  has_other_amenity: false,
  custom_amenity: "",
  custom_amenities: [],

  sessions: [],
  speakers: [],
  faqs: [],
  tickets: [
    { name: "Free RSVP", description: "General Admission", price: "Free", capacity: "200", booking_url: "" },
    { name: "Paid", description: "Standard Admission", price: "200", capacity: "100", booking_url: "" }
  ],

  cover_url: "",
  gallery_urls: []
};

function parseTimeString(v: string) {
  v = v.trim();
  if (!v) return null;
  if (/^noon$/i.test(v)) return { h: 12, m: "00", ampm: "PM", ambiguous: false };
  if (/^midnight$/i.test(v)) return { h: 12, m: "00", ampm: "AM", ambiguous: false };
  
  let rawStr = v;
  const noColonMatch = v.match(/^(\d{3,4})\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (noColonMatch) {
    const digits = noColonMatch[1];
    let hStr = digits.length === 3 ? digits.substring(0, 1) : digits.substring(0, 2);
    let mStr = digits.length === 3 ? digits.substring(1) : digits.substring(2);
    rawStr = `${hStr}:${mStr}${noColonMatch[2] || ''}`;
  }

  const match = rawStr.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
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

interface EventTimeInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

function EventTimeInput({ value, onChange, placeholder }: EventTimeInputProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);
  const [parsedTime, setParsedTime] = useState<any>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

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
    setHighlightedIndex(0);
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

    if (parsed && !parsed.ambiguous) {
      const formatted = formatTime(parsed);
      onChange(formatted);
      setIsOpen(false);
    } else if (parsed && parsed.ambiguous) {
      setIsOpen(true);
    } else {
      setIsOpen(true);
      onChange(val);
    }
  };

  const selectOption = (formattedTime: string) => {
    setInputValue(formattedTime);
    onChange(formattedTime);
    setIsOpen(false);
    setError(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !parsedTime || !parsedTime.ambiguous) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev === 0 ? 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev === 1 ? 0 : 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosenAmPm = highlightedIndex === 0 ? "AM" : "PM";
      selectOption(formatTime({ ...parsedTime, ampm: chosenAmPm }));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (inputValue) {
            const parsed = parseTimeString(inputValue);
            if (parsed && parsed.ambiguous) {
              setIsOpen(true);
              setHighlightedIndex(0);
            }
          }
        }}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 200);
        }}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "10px",
          border: error ? "1.5px solid #ef4444" : value ? "1.5px solid #16a34a" : "1.5px solid #cbd5e1",
          backgroundColor: error ? "#fef2f2" : value ? "#f0fdf4" : "#fff",
          fontSize: "13.5px",
          outline: "none",
          transition: "all 0.2s"
        }}
      />
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          minWidth: "190px",
          background: "#fff",
          border: "1.5px solid #7c3aed",
          borderRadius: "10px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          zIndex: 50,
          overflow: "hidden"
        }}>
          {error ? (
            <div style={{ padding: "10px 12px", fontSize: "12px", color: "#64748b" }}>
              Invalid time format <br />
              <span style={{ color: "#94a3b8", fontSize: "11px" }}>e.g. 10am, 10:30am or 2pm</span>
            </div>
          ) : parsedTime ? (
            parsedTime.ambiguous ? (
              <div>
                <div
                  onMouseDown={() => selectOption(formatTime({ ...parsedTime, ampm: "AM" }))}
                  onMouseEnter={() => setHighlightedIndex(0)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid #f1f5f9",
                    background: highlightedIndex === 0 ? "#f5f3ff" : "#fff",
                    color: highlightedIndex === 0 ? "#6d28d9" : "#0f172a"
                  }}
                >
                  <i className="ti ti-clock" style={{ fontSize: "14px", color: "#7c3aed" }}></i>
                  <span>{formatTime({ ...parsedTime, ampm: "AM" })}</span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", color: "#64748b", fontWeight: 400 }}>Morning</span>
                </div>
                <div
                  onMouseDown={() => selectOption(formatTime({ ...parsedTime, ampm: "PM" }))}
                  onMouseEnter={() => setHighlightedIndex(1)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    background: highlightedIndex === 1 ? "#f5f3ff" : "#fff",
                    color: highlightedIndex === 1 ? "#6d28d9" : "#0f172a"
                  }}
                >
                  <i className="ti ti-clock" style={{ fontSize: "14px", color: "#7c3aed" }}></i>
                  <span>{formatTime({ ...parsedTime, ampm: "PM" })}</span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", color: "#64748b", fontWeight: 400 }}>Evening</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: "9px 12px", fontSize: "12px", color: "#7c3aed", fontWeight: 600 }}>
                → {formatTime(parsedTime)}
              </div>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}

const STEPS = [
  { id: 1, label: "Basics & Host", icon: "ti-info-circle" },
  { id: 2, label: "Date, Schedule & Speakers", icon: "ti-calendar-event" },
  { id: 3, label: "Ticket Pricing, FAQs & Media", icon: "ti-ticket" }
];

function EventsOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const editSlug = searchParams.get("slug");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EventFormState>(INITIAL_FORM);
  const [hostOptions, setHostOptions] = useState<HostOption[]>([]);
  const [loadingHosts, setLoadingHosts] = useState(true);

  // Restore form state from draft in sessionStorage (for new events) or load from SQL API (for editing)
  useEffect(() => {
    async function loadEventData() {
      const queryParam = editId ? `id=${encodeURIComponent(editId)}` : (editSlug ? `slug=${encodeURIComponent(editSlug)}` : null);
      if (queryParam) {
        try {
          const res = await fetch(`/api/events?${queryParam}`);
          const data = await res.json();
          if (res.ok && data.event) {
            const ev = data.event;
            
            const rawTickets = ev.event_tickets || [];
            const parsedTickets = rawTickets.length > 0 ? rawTickets.map((t: any) => ({
              name: t.name || "",
              description: t.description || t.subtext || "",
              price: typeof t.price_pence === "number" ? (t.price_pence === 0 ? "Free" : (t.price_pence / 100).toString()) : (t.price ? t.price.toString() : "Free"),
              capacity: (t.quantity !== null && t.quantity !== undefined) ? t.quantity.toString() : (t.capacity ? t.capacity.toString() : ""),
              booking_url: t.booking_url || t.bookingUrl || ""
            })) : INITIAL_FORM.tickets;

            const parsedSessions = (ev.event_sessions || []).map((s: any) => ({
              time_label: s.time_label || "",
              title: s.title || "",
              description: s.description || "",
              speaker_name: s.speaker_name || ""
            }));

            const parsedSpeakers = (ev.event_speakers || []).map((sp: any) => ({
              name: sp.name || "",
              photo_url: sp.photo_url || "",
              designation: sp.designation || sp.role || "",
              affiliation: sp.affiliation || ""
            }));

            const parsedFaqs = (ev.event_faqs || []).map((f: any) => ({
              question: f.question || "",
              answer: f.answer || ""
            }));

            const startDate = ev.starts_at ? new Date(ev.starts_at) : new Date();

            setForm({
              id: ev.id,
              title: ev.title || "",
              type: ev.type || "Conference",
              custom_type: ev.custom_type || "",
              host_type: ev.host_church_id ? "church" : (ev.host_pastor_id ? "pastor" : (ev.custom_host_name ? "individual" : "")),
              host_id: ev.host_church_id || ev.host_pastor_id || "",
              custom_host_name: ev.custom_host_name || "",
              mode: ev.mode || "Offline",
              livestream_url: ev.livestream_url || "",
              description: ev.description || "",
              venue_name: ev.venue_name || "",
              address: ev.address || "",
              city: ev.city || "",
              postcode: ev.postcode || "",
              latitude: ev.latitude,
              longitude: ev.longitude,
              dates: [{
                date: startDate.toISOString().split("T")[0],
                starts_time: startDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
                ends_time: ev.ends_at ? new Date(ev.ends_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : ""
              }],
              capacity: ev.capacity ? ev.capacity.toString() : "",
              has_free_parking: Boolean(ev.has_free_parking),
              near_metro_station: Boolean(ev.near_metro_station),
              near_bus_station: Boolean(ev.near_bus_station),
              step_free_access: Boolean(ev.step_free_access),
              creche_available: Boolean(ev.creche_available),
              has_other_amenity: false,
              custom_amenity: "",
              custom_amenities: [],
              sessions: parsedSessions,
              speakers: parsedSpeakers,
              faqs: parsedFaqs,
              tickets: parsedTickets,
              cover_url: ev.cover_url || "",
              gallery_urls: ev.gallery_urls || []
            });

            if (ev.host_church) setSelectedHostName(ev.host_church.name);
            else if (ev.host_pastor) setSelectedHostName(ev.host_pastor.full_name);
            else if (ev.custom_host_name) setSelectedHostName(ev.custom_host_name);
            return;
          }
        } catch (err) {
          console.error("Failed to load event for editing", err);
        }
      }

      // If not editing an existing ID, restore from local draft if present
      try {
        const savedDraft = sessionStorage.getItem("event_form_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === "object") {
            setForm(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }

    loadEventData();
  }, [editId, editSlug]);

  // Save draft to sessionStorage on form updates
  useEffect(() => {
    if (!editId && !editSlug) {
      try {
        sessionStorage.setItem("event_form_draft", JSON.stringify(form));
      } catch (e) {
        console.error("Failed to save draft", e);
      }
    }
  }, [form, editId, editSlug]);

  // Host Search Dropdown States & Ref
  const hostDropdownRef = useRef<HTMLDivElement>(null);
  const [hostSearchQuery, setHostSearchQuery] = useState("");
  const [isHostDropdownOpen, setIsHostDropdownOpen] = useState(false);
  const [selectedHostName, setSelectedHostName] = useState("");

  const [isEditingCustomType, setIsEditingCustomType] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [publishStepIndex, setPublishStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddDateSlot = () => {
    setForm(prev => ({
      ...prev,
      dates: [
        ...prev.dates,
        { date: new Date().toISOString().split("T")[0], starts_time: "", ends_time: "" }
      ]
    }));
  };

  const handleRemoveDateSlot = (index: number) => {
    setForm(prev => ({
      ...prev,
      dates: prev.dates.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateDateSlot = (index: number, field: keyof EventDateSlot, value: string) => {
    setForm(prev => {
      const updated = [...prev.dates];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, dates: updated };
    });
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (hostDropdownRef.current && !hostDropdownRef.current.contains(event.target as Node)) {
        setIsHostDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function fetchHosts() {
      try {
        const res = await fetch("/api/hosts");
        const data = await res.json();
        if (data.hosts && Array.isArray(data.hosts)) {
          setHostOptions(data.hosts);
          if (!editId && !editSlug) {
            // Do not pre-select default host; let user select explicitly
            setForm(prev => ({
              ...prev,
              host_type: "",
              host_id: ""
            }));
            setSelectedHostName("");
          }
        }
      } catch (err) {
        console.error("Failed to load hosts", err);
      } finally {
        setLoadingHosts(false);
      }
    }
    fetchHosts();
  }, []);

  const update = (key: keyof EventFormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleAddCustomAmenity = () => {
    const val = form.custom_amenity.trim();
    if (!val) return;
    setForm(prev => ({
      ...prev,
      custom_amenities: [...(prev.custom_amenities || []), val],
      custom_amenity: ""
    }));
  };

  const handleRemoveCustomAmenity = (index: number) => {
    setForm(prev => ({
      ...prev,
      custom_amenities: (prev.custom_amenities || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddSession = () => {
    setForm(prev => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        { time_label: "", title: "", description: "", speaker_name: "" }
      ]
    }));
  };

  const handleRemoveSession = (index: number) => {
    setForm(prev => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSession = (index: number, field: keyof ScheduleSession, val: string) => {
    setForm(prev => {
      const updated = [...prev.sessions];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, sessions: updated };
    });
  };

  const handleAddSpeaker = () => {
    setForm(prev => ({
      ...prev,
      speakers: [
        ...prev.speakers,
        { name: "", photo_url: "", designation: "", affiliation: "" }
      ]
    }));
  };

  const handleRemoveSpeaker = (index: number) => {
    setForm(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSpeaker = (index: number, field: keyof SpeakerItem, val: string) => {
    setForm(prev => {
      const updated = [...prev.speakers];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, speakers: updated };
    });
  };

  const handleAddTicket = () => {
    setForm(prev => ({
      ...prev,
      tickets: [
        ...prev.tickets,
        { name: "Ticket Tier", description: "Admission detail", price: "0", capacity: "100", booking_url: "" }
      ]
    }));
  };

  const handleRemoveTicket = (index: number) => {
    setForm(prev => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateTicket = (index: number, field: keyof TicketTier, val: string) => {
    setForm(prev => {
      const updated = [...prev.tickets];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, tickets: updated };
    });
  };

  const handleAddFAQ = () => {
    setForm(prev => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        { question: "", answer: "" }
      ]
    }));
  };

  const handleRemoveFAQ = (index: number) => {
    setForm(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateFAQ = (index: number, field: keyof FAQItem, val: string) => {
    setForm(prev => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, faqs: updated };
    });
  };

  const handlePublish = async () => {
    setPublishing(true);
    setErrorMsg("");

    const publishSteps = [
      "Securing event location & venue parameters...",
      "Configuring live stream & format settings...",
      "Syncing schedule timetable & guest speaker roster...",
      "Finalizing ticket tiers & pricing options...",
      "Linking event to host Church/Pastor profile..."
    ];

    for (let i = 0; i < publishSteps.length; i++) {
      setPublishStepIndex(i);
      await new Promise(r => setTimeout(r, 450));
    }

    try {
      const firstSlot = form.dates[0] || { date: new Date().toISOString().split("T")[0], starts_time: "", ends_time: "" };
      const lastSlot = form.dates[form.dates.length - 1] || firstSlot;
      const startTimeStr = firstSlot.starts_time ? firstSlot.starts_time : "10:00 AM";
      const endTimeStr = lastSlot.ends_time ? lastSlot.ends_time : "1:00 PM";
      const starts_at = new Date(`${firstSlot.date} ${startTimeStr}`).toISOString();
      const ends_at = new Date(`${lastSlot.date} ${endTimeStr}`).toISOString();


      const payload = {
        ...(form.id ? { id: form.id } : {}),
        title: form.title || "Kingdom Gathering Event",
        type: form.type,
        custom_type: form.custom_type,
        host_type: form.host_type,
        host_id: form.host_id,
        custom_host_name: form.custom_host_name,
        mode: form.mode,
        livestream_url: form.livestream_url,
        description: form.description,
        venue_name: form.venue_name,
        address: form.address,
        city: form.city,
        postcode: form.postcode,
        latitude: form.latitude,
        longitude: form.longitude,
        starts_at,
        ends_at,
        capacity: form.tickets.reduce((acc, t) => acc + (parseInt(t.capacity) || 0), 0),
        has_free_parking: form.has_free_parking,
        near_metro_station: form.near_metro_station,
        near_bus_station: form.near_bus_station,
        step_free_access: form.step_free_access,
        creche_available: form.creche_available,
        sessions: form.sessions,
        speakers: form.speakers,
        tickets: form.tickets,
        faqs: form.faqs,
        cover_url: form.cover_url,
        gallery_urls: form.gallery_urls
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success && data.slug) {
        try {
          sessionStorage.removeItem("event_form_draft");
        } catch (e) {}
        router.push(`/events/${data.slug}?id=${data.event_id}`);
      } else {
        throw new Error(data.error || "Failed to publish event.");
      }

    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while publishing.");
      setPublishing(false);
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", position: "relative" }}>
      <TopNav />

      {/* PUBLISHING LOADING OVERLAY */}
      {publishing && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          padding: "24px"
        }}>
          <div style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            border: "4px solid rgba(255,255,255,0.2)",
            borderTopColor: "#a855f7",
            animation: "spin 0.8s linear infinite",
            marginBottom: "24px"
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.02em" }}>
            Publishing Your Event
          </div>
          <div style={{ fontSize: "15px", color: "#cbd5e1", maxWidth: "480px", textAlign: "center", minHeight: "48px" }}>
            {[
              "Securing event location & venue parameters...",
              "Configuring live stream & format settings...",
              "Syncing schedule timetable & guest speaker roster...",
              "Finalizing ticket tiers & pricing options...",
              "Linking event to host Church/Pastor profile..."
            ][publishStepIndex]}
          </div>
        </div>
      )}

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "32px 24px 70px", position: "relative", zIndex: 1 }}>
        
        {/* FORM WIZARD HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="brand-mark" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <i className="ti ti-calendar-event" style={{ fontSize: "18px", color: "#fff" }}></i>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>Add Event Profile</div>
              <div style={{ fontSize: "12.5px", color: "var(--cn-gray)" }}>Conferences, summits, crusades, services & retreats</div>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => router.push("/add-listing")}>
            <i className="ti ti-x" style={{ fontSize: "14px" }}></i> Exit
          </button>
        </div>

        {/* STEP PROGRESS BAR */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", flexWrap: "wrap" }}>
          {STEPS.map((s) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 18px",
                  borderRadius: "20px",
                  border: active ? "none" : done ? "1.5px solid #f472b6" : "1.5px solid #e2e8f0",
                  background: active ? "linear-gradient(135deg, #e11d48, #7c3aed)" : done ? "#fff1f2" : "#ffffff",
                  color: active ? "#ffffff" : done ? "#be123c" : "#64748b",
                  fontSize: "13px",
                  fontWeight: active || done ? 700 : 500,
                  cursor: "pointer",
                  boxShadow: active ? "0 4px 14px rgba(225, 29, 72, 0.3)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <i className={`ti ${done ? "ti-check" : s.icon}`} style={{ fontSize: "15px" }}></i>
                {s.label}
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <div style={{ padding: "14px 18px", background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: "12px", color: "#b91c1c", fontSize: "14px", marginBottom: "24px" }}>
            <i className="ti ti-alert-triangle" style={{ marginRight: "8px" }}></i> {errorMsg}
          </div>
        )}

        {/* STEP 1: BASICS & HOST */}
        {step === 1 && (
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "20px", padding: "32px", boxShadow: "0 10px 30px rgba(15,23,42,0.03)" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>
              1. Event Basics & Host Information
            </div>

            {/* 1. Event Name */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Event Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Kingdom Power Conference 2025"
                style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "14px", outline: "none" }}
              />
            </div>

            {/* 2. Event Type */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                Event Type <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: (form.type === "Others" && (isEditingCustomType || !form.custom_type.trim())) ? "12px" : "0" }}>
                {EVENT_TYPES.map((t) => {
                  const sel = form.type === t;
                  let displayLabel = t;
                  if (t === "Others" && form.type === "Others" && form.custom_type.trim() && !isEditingCustomType) {
                    displayLabel = form.custom_type.trim();
                  }

                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        update("type", t);
                        if (t === "Others") {
                          setIsEditingCustomType(prev => (form.custom_type.trim() ? !prev : true));
                        } else {
                          setIsEditingCustomType(false);
                        }
                      }}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "20px",
                        border: sel ? "none" : "1.5px solid #e2e8f0",
                        background: sel ? "linear-gradient(135deg, #e11d48, #7c3aed)" : "#ffffff",
                        color: sel ? "#ffffff" : "#475569",
                        fontWeight: sel ? 700 : 500,
                        fontSize: "13px",
                        cursor: "pointer",
                        boxShadow: sel ? "0 4px 14px rgba(225, 29, 72, 0.3)" : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      {displayLabel}
                    </button>
                  );
                })}
              </div>

              {/* If "Others" is selected and user is typing/editing custom type */}
              {form.type === "Others" && (isEditingCustomType || !form.custom_type.trim()) && (
                <div style={{ marginTop: "10px" }}>
                  <input
                    type="text"
                    value={form.custom_type}
                    autoFocus
                    onChange={(e) => update("custom_type", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (form.custom_type.trim()) {
                          setIsEditingCustomType(false);
                        }
                      }
                    }}
                    placeholder="Type custom event type (e.g. Retreat, Worship Night) and press Enter..."
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1.5px solid #e11d48", fontSize: "13.5px", outline: "none", background: "#fff1f2" }}
                  />
                </div>
              )}
            </div>



            {/* 3. Hosted By */}
            <div style={{ marginBottom: "24px", position: "relative" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Hosted By <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "10px" }}>
                Select whether this event is hosted by a registered Church, Pastor profile, or Individual / Ministry.
              </div>

              {/* Host Category Selector Pills */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                {[
                  { id: "church", label: "Church", icon: "ti-building-church", desc: "Listed Church" },
                  { id: "pastor", label: "Pastor", icon: "ti-user", desc: "Pastors & Leaders" },
                  { id: "individual", label: "Others", icon: "ti-users", desc: "Custom / Unlisted Host" },
                ].map((cat) => {
                  const active = form.host_type === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        update("host_type", cat.id as any);
                        update("host_id", "");
                        setSelectedHostName("");
                        setHostSearchQuery("");
                        setIsHostDropdownOpen(false);
                      }}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: "14px",
                        border: active ? "none" : "1.5px solid #e2e8f0",
                        background: active ? "linear-gradient(135deg, #e11d48, #7c3aed)" : "#ffffff",
                        color: active ? "#ffffff" : "#475569",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: active ? "0 4px 14px rgba(225, 29, 72, 0.25)" : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "14px" }}>
                        <i className={`ti ${cat.icon}`} style={{ fontSize: "18px", color: active ? "#ffffff" : "#94a3b8" }}></i>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: "11px", color: active ? "rgba(255,255,255,0.85)" : "#94a3b8", marginTop: "2px" }}>
                        {cat.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* SEARCH & FILTER DROPDOWN FOR CHURCH OR PASTOR */}
              {(form.host_type === "church" || form.host_type === "pastor") && (
                <div ref={hostDropdownRef} style={{ position: "relative" }}>
                  {(() => {
                    const selectedHost = hostOptions.find(h => h.id === form.host_id && h.type === form.host_type);
                    return (
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        {selectedHostName && !isHostDropdownOpen ? (
                          selectedHost?.avatar ? (
                            <img
                              src={selectedHost.avatar}
                              alt={selectedHost.name}
                              style={{
                                position: "absolute",
                                left: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "28px",
                                height: "28px",
                                borderRadius: "8px",
                                objectFit: "cover",
                                border: "1px solid #e2e8f0",
                                zIndex: 2
                              }}
                            />
                          ) : (
                            <div style={{
                              position: "absolute",
                              left: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "13px",
                              fontWeight: 800,
                              zIndex: 2
                            }}>
                              <i className={`ti ${form.host_type === "church" ? "ti-building-church" : "ti-user"}`}></i>
                            </div>
                          )
                        ) : (
                          <i className="ti ti-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "18px" }}></i>
                        )}

                        <input
                          type="text"
                          value={isHostDropdownOpen ? hostSearchQuery : (selectedHostName || hostSearchQuery)}
                          onFocus={() => setIsHostDropdownOpen(true)}
                          onChange={(e) => {
                            setHostSearchQuery(e.target.value);
                            setIsHostDropdownOpen(true);
                          }}
                          placeholder={`Type to search listed ${form.host_type === "church" ? "churches" : "pastors"}...`}
                          style={{
                            width: "100%",
                            padding: (selectedHostName && !isHostDropdownOpen) ? "12px 14px 12px 46px" : "12px 14px 12px 42px",
                            borderRadius: "12px",
                            border: isHostDropdownOpen ? "2px solid #7c3aed" : "1.5px solid #cbd5e1",
                            fontSize: "14px",
                            fontWeight: (selectedHostName && !isHostDropdownOpen) ? 700 : 400,
                            color: (selectedHostName && !isHostDropdownOpen) ? "#0f172a" : "#334155",
                            outline: "none",
                            background: "#fff"
                          }}
                        />
                        {selectedHostName && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHostName("");
                              setHostSearchQuery("");
                              update("host_id", "");
                              setIsHostDropdownOpen(true);
                            }}
                            style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", border: "none", background: "none", cursor: "pointer" }}
                          >
                            <i className="ti ti-x" style={{ fontSize: "16px" }}></i>
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* LIVE FILTERED DROPDOWN */}
                  {isHostDropdownOpen && (
                    <div style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      maxHeight: "240px",
                      overflowY: "auto",
                      background: "#fff",
                      border: "1.5px solid #7c3aed",
                      borderRadius: "14px",
                      boxShadow: "0 15px 35px rgba(124, 58, 237, 0.15)",
                      zIndex: 50,
                      padding: "6px"
                    }}>
                      {loadingHosts ? (
                        <div style={{ padding: "12px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                          Loading...
                        </div>
                      ) : (
                        (() => {
                          const filtered = hostOptions
                            .filter(h => h.type === form.host_type)
                            .filter(h => h.name.toLowerCase().includes(hostSearchQuery.toLowerCase()) || h.subtitle.toLowerCase().includes(hostSearchQuery.toLowerCase()));

                          if (filtered.length === 0) {
                            return (
                              <div style={{ padding: "12px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                                No matching {form.host_type === "church" ? "churches" : "pastors"} found.
                                <div
                                  style={{ fontSize: "12px", color: "#7c3aed", marginTop: "4px", cursor: "pointer", fontWeight: 700 }}
                                  onClick={() => {
                                    update("host_type", "individual" as any);
                                    update("custom_host_name", hostSearchQuery);
                                    setIsHostDropdownOpen(false);
                                  }}
                                >
                                  + Add as Custom / Individual Host "{hostSearchQuery}"
                                </div>
                              </div>
                            );
                          }

                          return filtered.map((h) => (
                            <div
                              key={`${h.type}:${h.id}`}
                              onClick={() => {
                                update("host_id", h.id);
                                setSelectedHostName(h.name);
                                setHostSearchQuery(h.name);
                                setIsHostDropdownOpen(false);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                transition: "background 0.15s",
                                background: form.host_id === h.id ? "#f5f3ff" : "transparent"
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = form.host_id === h.id ? "#f5f3ff" : "transparent")}
                            >
                              {h.avatar ? (
                                <img
                                  src={h.avatar}
                                  alt={h.name}
                                  style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "10px",
                                    objectFit: "cover",
                                    flexShrink: 0,
                                    border: "1px solid #e2e8f0"
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "10px",
                                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: "13px",
                                  flexShrink: 0
                                }}>
                                  <i className={`ti ${h.type === "church" ? "ti-building-church" : "ti-user"}`}></i>
                                </div>
                              )}
                              <div>
                                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>{h.name}</div>
                                <div style={{ fontSize: "11.5px", color: "#64748b" }}>{h.subtitle}</div>
                              </div>
                            </div>
                          ));
                        })()
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* INPUT FIELD FOR INDIVIDUAL / OTHER */}
              {form.host_type === "individual" && (
                <div>
                  <input
                    type="text"
                    value={form.custom_host_name}
                    onChange={(e) => update("custom_host_name", e.target.value)}
                    placeholder="Enter host name or organization (e.g. John Doe, Kingdom Youth Alliance)..."
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1.5px solid #7c3aed",
                      fontSize: "14px",
                      outline: "none",
                      background: "#fcfaff"
                    }}
                  />
                </div>
              )}
            </div>

            {/* 8. Type: Online, Offline, Hybrid */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                Event Format Mode
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                {(["Online", "Offline", "Hybrid"] as const).map((m) => {
                  const sel = form.mode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => update("mode", m)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "12px",
                        border: sel ? "2px solid #7c3aed" : "1.5px solid #e2e8f0",
                        background: sel ? "#f5f3ff" : "#fff",
                        color: sel ? "#6d28d9" : "#475569",
                        fontWeight: sel ? 700 : 500,
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      {m === "Offline" && <i className="ti ti-map-pin" style={{ marginRight: "6px" }}></i>}
                      {m === "Online" && <i className="ti ti-video" style={{ marginRight: "6px" }}></i>}
                      {m === "Hybrid" && <i className="ti ti-[#7c3aed] ti-building-broadcast-tower" style={{ marginRight: "6px" }}></i>}
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LOCATION DETAILS (Venue Name, Country, Find your address) */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
                Event Location & Venue Details
              </label>

              {form.mode !== "Online" && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={form.venue_name}
                    onChange={(e) => update("venue_name", e.target.value)}
                    placeholder="e.g. Liberty House Auditorium"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "14px", outline: "none" }}
                  />
                </div>
              )}

              <SharedAddressField
                country="United Kingdom"
                address={form.address}
                latitude={form.latitude}
                longitude={form.longitude}
                onUpdateCountry={() => {}}
                onUpdateAddress={(val: string) => update("address", val)}
                onUpdateCity={(val: string) => update("city", val)}
                onUpdateCoordinates={(lat: number | undefined, lng: number | undefined) => {
                  update("latitude", lat);
                  update("longitude", lng);
                }}
                idPrefix="event_addr"
              />

              {/* VENUE FACILITIES & ACCESSIBILITY (Offline & Hybrid only) */}
              {form.mode !== "Online" && (
                <div style={{ marginTop: "24px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
                    Venue Facilities & Accessibility
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      { key: "has_free_parking", label: "Free parking on site", icon: "ti-parking" },
                      { key: "near_metro_station", label: "Near to Railway Station", icon: "ti-train" },
                      { key: "near_bus_station", label: "Near to Bus Station", icon: "ti-bus" },
                      { key: "step_free_access", label: "Step-free access", icon: "ti-disabled" },
                      { key: "creche_available", label: "Crèche available", icon: "ti-baby-carriage" },
                      { key: "has_other_amenity", label: "Others", icon: "ti-dots" }
                    ].map((item) => {
                      const checked = (form as any)[item.key];
                      return (
                        <label
                          key={item.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            border: checked ? "1.5px solid #7c3aed" : "1.5px solid #e2e8f0",
                            background: checked ? "#f5f3ff" : "#fff",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => update(item.key as any, e.target.checked)}
                            style={{ accentColor: "#7c3aed", width: "16px", height: "16px" }}
                          />
                          <i className={`ti ${item.icon}`} style={{ color: checked ? "#7c3aed" : "#64748b", fontSize: "16px" }}></i>
                          <span style={{ fontSize: "13px", fontWeight: checked ? 700 : 500, color: checked ? "#6d28d9" : "#334155" }}>
                            {item.label}
                          </span>
                        </label>
                      );
                    })}

                    {/* DYNAMICALLY ADDED CUSTOM AMENITIES PILLS */}
                    {(form.custom_amenities || []).map((cItem, cIdx) => (
                      <div
                        key={cIdx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: "1.5px solid #7c3aed",
                          background: "#f5f3ff"
                        }}
                      >
                        <i className="ti ti-check" style={{ color: "#7c3aed", fontSize: "16px", fontWeight: "bold" }}></i>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#6d28d9", flex: 1 }}>
                          {cItem}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomAmenity(cIdx)}
                          style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", padding: "2px 4px" }}
                          title="Remove Facility"
                        >
                          <i className="ti ti-x" style={{ fontSize: "16px" }}></i>
                        </button>
                      </div>
                    ))}
                  </div>

                  {form.has_other_amenity && (
                    <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={form.custom_amenity}
                        onChange={(e) => update("custom_amenity", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomAmenity();
                          }
                        }}
                        placeholder="Type facility (e.g. Air Conditioning, Hearing Loop) and press Enter..."
                        style={{
                          flex: 1,
                          padding: "12px 14px",
                          borderRadius: "12px",
                          border: "1.5px solid #7c3aed",
                          fontSize: "13.5px",
                          outline: "none",
                          background: "#fcfaff"
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAmenity}
                        className="btn-primary"
                        style={{ padding: "0 20px", borderRadius: "12px", fontSize: "13.5px" }}
                      >
                        + Add
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 6. Live Streaming Link */}
            {(form.mode === "Online" || form.mode === "Hybrid") && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Live Streaming Link (YouTube / Vimeo / Zoom)
                </label>
                <input
                  type="url"
                  value={form.livestream_url}
                  onChange={(e) => update("livestream_url", e.target.value)}
                  placeholder="https://youtube.com/live/your-event-stream"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1.5px solid #cbd5e1", fontSize: "14px", outline: "none" }}
                />
              </div>
            )}

            {/* 7. About Event (Rich Text Description) */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                About Event (Description)
              </label>
              <RichTextEditor
                value={form.description}
                onChange={(val) => update("description", val)}
                placeholder="What's the event about, who's it for, and what can attendees expect..."
                minHeight="150px"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn-primary"
              style={{ width: "100%", padding: "14px", fontSize: "15px", borderRadius: "12px", justifyContent: "center" }}
            >
              Continue to Date, Time & Amenities →
            </button>
          </div>
        )}

        {/* STEP 2: DATE, SCHEDULE & SPEAKERS */}
        {step === 2 && (
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "20px", padding: "32px", boxShadow: "0 10px 30px rgba(15,23,42,0.03)" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>
              2. Date, Schedule Timetable & Speakers
            </div>

            {/* MULTIPLE EVENT DATES & TIMES (+ ADD DATE BUTTON) */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>Event Date & Session Times</div>
                  <div style={{ fontSize: "12.5px", color: "#64748b" }}>Specify date and start/end times. Add multiple dates for multi-day events.</div>
                </div>
                <button
                  type="button"
                  onClick={handleAddDateSlot}
                  style={{ fontSize: "12.5px", padding: "6px 16px", border: "none", color: "#ffffff", background: "linear-gradient(135deg, #e11d48, #7c3aed)", borderRadius: "20px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(225,29,72,0.2)" }}
                >
                  <i className="ti ti-plus" style={{ marginRight: "4px" }}></i> Add Date
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {form.dates.map((dSlot, idx) => (
                  <div key={idx} style={{ padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flex: 1.2 }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>Date</label>
                      <input
                        type="date"
                        value={dSlot.date}
                        onChange={(e) => handleUpdateDateSlot(idx, "date", e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>Start Time</label>
                      <EventTimeInput
                        value={dSlot.starts_time}
                        onChange={(val) => handleUpdateDateSlot(idx, "starts_time", val)}
                        placeholder="e.g. 10am"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>End Time</label>
                      <EventTimeInput
                        value={dSlot.ends_time}
                        onChange={(val) => handleUpdateDateSlot(idx, "ends_time", val)}
                        placeholder="e.g. 1pm"
                      />
                    </div>
                    {form.dates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDateSlot(idx)}
                        style={{ marginTop: "18px", color: "#ef4444", border: "none", background: "none", cursor: "pointer", padding: "6px" }}
                        title="Remove Date Slot"
                      >
                        <i className="ti ti-trash" style={{ fontSize: "18px" }}></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 9. Schedule: Time, Heading, Subtext, Guest Name */}
            <div style={{ marginBottom: "36px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>Schedule Timetable</div>
                  <div style={{ fontSize: "12.5px", color: "#64748b" }}>Add event sessions with time, title, description, and minister.</div>
                </div>
                <button
                  type="button"
                  onClick={handleAddSession}
                  style={{ fontSize: "12.5px", padding: "6px 16px", border: "none", color: "#ffffff", background: "linear-gradient(135deg, #e11d48, #7c3aed)", borderRadius: "20px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(225,29,72,0.2)" }}
                >
                  <i className="ti ti-plus"></i> Add Session
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {form.sessions.map((sess, idx) => (
                  <div key={idx} style={{ padding: "16px", borderRadius: "14px", background: "#f8fafc", border: "1.5px solid #e2e8f0", position: "relative" }}>
                    <button
                      onClick={() => handleRemoveSession(idx)}
                      style={{ position: "absolute", top: "12px", right: "12px", color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}
                    >
                      <i className="ti ti-trash" style={{ fontSize: "16px" }}></i>
                    </button>
                    {/* Row 1: Time | Guest Name / Speaker */}
                    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}>Time</label>
                        <EventTimeInput
                          value={sess.time_label}
                          onChange={(val) => handleUpdateSession(idx, "time_label", val)}
                          placeholder="e.g. 9:30 AM"
                        />
                      </div>
                      <div style={{ paddingRight: "28px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}>Guest Name / Speaker</label>
                        <input
                          type="text"
                          value={sess.speaker_name}
                          onChange={(e) => handleUpdateSession(idx, "speaker_name", e.target.value)}
                          placeholder="e.g. Pastor James Okafor"
                          style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none" }}
                        />
                      </div>
                    </div>

                    {/* Row 2: Session Heading */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}>Session Heading</label>
                      <input
                        type="text"
                        value={sess.title}
                        onChange={(e) => handleUpdateSession(idx, "title", e.target.value)}
                        placeholder="Opening session — Kingdom Authority"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none" }}
                      />
                    </div>

                    {/* Row 3: Description */}
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}>Description</label>
                      <input
                        type="text"
                        value={sess.description}
                        onChange={(e) => handleUpdateSession(idx, "description", e.target.value)}
                        placeholder="Welcome coffee & worship team"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 10. Speakers & Ministers */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>Speakers & Keynote Ministers</div>
                  <div style={{ fontSize: "12.5px", color: "#64748b" }}>Add speakers, photo, designation, and university/church affiliation.</div>
                </div>
                <button
                  type="button"
                  onClick={handleAddSpeaker}
                  className="btn-secondary"
                  style={{ fontSize: "12.5px", padding: "6px 12px", borderColor: "#7c3aed", color: "#7c3aed" }}
                >
                  <i className="ti ti-plus"></i> Add Speaker
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {form.speakers.map((sp, idx) => (
                  <div key={idx} style={{ padding: "16px", borderRadius: "14px", background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                    {/* Row 1: Speaker Name, Designation, Affiliation & Delete */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 40px", gap: "10px", alignItems: "center" }}>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}>Speaker Name</label>
                        <input
                          type="text"
                          value={sp.name}
                          onChange={(e) => handleUpdateSpeaker(idx, "name", e.target.value)}
                          placeholder="Dr. Faith Asante"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}>Designation</label>
                        <input
                          type="text"
                          value={sp.designation}
                          onChange={(e) => handleUpdateSpeaker(idx, "designation", e.target.value)}
                          placeholder="International Evangelist"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}>University / Church / Org</label>
                        <input
                          type="text"
                          value={sp.affiliation}
                          onChange={(e) => handleUpdateSpeaker(idx, "affiliation", e.target.value)}
                          placeholder="Oxford University / Grace Cathedral"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff" }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpeaker(idx)}
                        style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer", marginTop: "18px" }}
                        title="Remove Speaker"
                      >
                        <i className="ti ti-trash" style={{ fontSize: "18px" }}></i>
                      </button>
                    </div>

                    {/* Row 2: Speaker Photo (Upload or Link) */}
                    <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #cbd5e1" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <i className="ti ti-camera" style={{ color: "#7c3aed", fontSize: "13px" }}></i> Speaker Photo (Upload Photo or Paste URL)
                      </label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {/* Avatar Circle Preview */}
                        <div style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: sp.photo_url ? `url(${sp.photo_url}) center/cover no-repeat` : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                          border: "2px solid #fff",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b"
                        }}>
                          {!sp.photo_url && <i className="ti ti-user" style={{ fontSize: "20px" }}></i>}
                        </div>

                        {/* Photo URL Input */}
                        <input
                          type="url"
                          value={sp.photo_url || ""}
                          onChange={(e) => handleUpdateSpeaker(idx, "photo_url", e.target.value)}
                          placeholder="Paste image URL (e.g. https://.../photo.jpg)..."
                          style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff" }}
                        />

                        {/* File Upload Button */}
                        <label
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            background: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            color: "#475569",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            flexShrink: 0
                          }}
                        >
                          <i className="ti ti-upload"></i> Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("kind", "avatar");
                                const res = await fetch("/api/upload", { method: "POST", body: formData });
                                const data = await res.json();
                                if (data.url) {
                                  handleUpdateSpeaker(idx, "photo_url", data.url);
                                }
                              } catch (err) {
                                console.error("Failed to upload speaker photo", err);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>





            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ padding: "12px 20px" }}>
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="btn-primary" style={{ flex: 1, padding: "12px", justifyContent: "center" }}>
                Continue to FAQs & Tickets →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FAQS, TICKETS & MEDIA */}
        {step === 3 && (
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "20px", padding: "32px", boxShadow: "0 10px 30px rgba(15,23,42,0.03)" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>
              3. Ticket Pricing Tiers, FAQs & Media
            </div>

            {/* TICKETS TABLE (Type | Price | # Seats | Link) */}
            <div style={{ marginBottom: "36px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>Ticket Pricing & Seat Allocations</div>
                  <div style={{ fontSize: "12.5px", color: "#64748b" }}>Specify ticket type, price, seat capacity, and booking link.</div>
                </div>
                <button
                  type="button"
                  onClick={handleAddTicket}
                  style={{ fontSize: "12.5px", padding: "6px 16px", border: "none", color: "#ffffff", background: "linear-gradient(135deg, #e11d48, #7c3aed)", borderRadius: "20px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(225,29,72,0.2)" }}
                >
                  <i className="ti ti-plus"></i> Add Ticket Tier
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {form.tickets.map((t, idx) => (
                  <div key={idx} style={{ padding: "16px", borderRadius: "14px", background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 100px 100px 1.5fr 40px", gap: "10px", alignItems: "center" }}>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}>Type</label>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => handleUpdateTicket(idx, "name", e.target.value)}
                          placeholder="Free RSVP / Paid"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff", fontWeight: 700 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}>Price</label>
                        <input
                          type="text"
                          value={t.price}
                          onChange={(e) => handleUpdateTicket(idx, "price", e.target.value)}
                          placeholder="Free or 200"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}># Seats</label>
                        <input
                          type="number"
                          value={t.capacity}
                          onChange={(e) => handleUpdateTicket(idx, "capacity", e.target.value)}
                          placeholder="200"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px", display: "block" }}>Link</label>
                        <input
                          type="url"
                          value={t.booking_url || ""}
                          onChange={(e) => handleUpdateTicket(idx, "booking_url", e.target.value)}
                          placeholder="https://booking-link.com"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff" }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTicket(idx)}
                        style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer", marginTop: "18px" }}
                        title="Remove Ticket Tier"
                      >
                        <i className="ti ti-trash" style={{ fontSize: "18px" }}></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 12. FAQs */}
            <div style={{ marginBottom: "36px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>Frequently Asked Questions (FAQs)</div>
                  <div style={{ fontSize: "12.5px", color: "#64748b" }}>Address attendee questions regarding seating, parking, dress code, etc.</div>
                </div>
                <button
                  type="button"
                  onClick={handleAddFAQ}
                  style={{ fontSize: "12.5px", padding: "6px 16px", border: "none", color: "#ffffff", background: "linear-gradient(135deg, #e11d48, #7c3aed)", borderRadius: "20px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(225,29,72,0.2)" }}
                >
                  <i className="ti ti-plus"></i> Add FAQ
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {form.faqs.map((f, idx) => (
                  <div key={idx} style={{ padding: "16px", borderRadius: "14px", background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                      <input
                        type="text"
                        value={f.question}
                        onChange={(e) => handleUpdateFAQ(idx, "question", e.target.value)}
                        placeholder="Question (e.g. Are children allowed?)"
                        style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none", fontWeight: 700, background: "#fff" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFAQ(idx)}
                        style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer", padding: "8px" }}
                        title="Remove FAQ"
                      >
                        <i className="ti ti-trash" style={{ fontSize: "18px" }}></i>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={f.answer}
                      onChange={(e) => handleUpdateFAQ(idx, "answer", e.target.value)}
                      placeholder="Answer..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none", background: "#fff" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 11. Images: Cover Photo & Gallery Photos */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
                Cover Photo & Header Banner
              </label>
              <ImageUpload
                kind="cover"
                label="Upload Event Cover Photo"
                currentUrl={form.cover_url}
                onUploaded={(url: string) => update("cover_url", url)}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                Event Gallery Photos
              </label>
              <div style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "12px" }}>
                Upload photos from past events, venue setup, or promotional graphics.
              </div>
              <ImageUpload
                kind="gallery"
                label="Add Gallery Photos"
                multiple={true}
                onUploaded={(url: string) => {
                  setForm(prev => ({
                    ...prev,
                    gallery_urls: [...(prev.gallery_urls || []), url]
                  }));
                }}
                onMultipleUploaded={(urls: string[]) => {
                  setForm(prev => ({
                    ...prev,
                    gallery_urls: [...(prev.gallery_urls || []), ...urls]
                  }));
                }}
              />
              {form.gallery_urls && form.gallery_urls.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "12px" }}>
                  {form.gallery_urls.map((gUrl, idx) => (
                    <div key={idx} style={{ position: "relative", aspectRatio: "4/3", borderRadius: "10px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gUrl} alt={`Gallery ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => {
                          setForm(prev => ({
                            ...prev,
                            gallery_urls: (prev.gallery_urls || []).filter((_, i) => i !== idx)
                          }));
                        }}
                        style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(239, 68, 68, 0.9)", color: "#fff", border: "none", width: "22px", height: "22px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Remove Image"
                      >
                        <i className="ti ti-x" style={{ fontSize: "13px" }}></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
              <button onClick={() => setStep(2)} className="btn-secondary" style={{ padding: "14px 24px", fontSize: "15px" }}>
                ← Back
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: "14px",
                  fontSize: "15px",
                  borderRadius: "12px",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #e11d48, #7c3aed)",
                  border: "none",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(225, 29, 72, 0.3)",
                  cursor: publishing ? "not-allowed" : "pointer"
                }}
              >
                {publishing ? (
                  <>
                    <i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite", marginRight: "8px" }}></i>
                    {form.id ? "Saving Changes..." : "Publishing Event..."}
                  </>
                ) : (
                  <>
                    <i className={form.id ? "ti ti-check" : "ti ti-rocket"} style={{ marginRight: "8px" }}></i>
                    {form.id ? "Save Changes" : "Publish Event Live"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventsOnboardingPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Inter, sans-serif", color: "#6b7280" }}>Loading event form...</div>}>
      <EventsOnboardingContent />
    </Suspense>
  );
}
