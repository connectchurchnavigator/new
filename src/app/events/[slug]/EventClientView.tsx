"use client";

import React, { useState, useEffect } from "react";
import TopNav from "@/components/layout/TopNav";
import Link from "next/link";

interface EventClientViewProps {
  slug: string;
}

export default function EventClientView({ slug }: EventClientViewProps) {
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<number>(0);
  const [seatQuantity, setSeatQuantity] = useState<number>(1);
  const [registeredCount, setRegisteredCount] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events?slug=${encodeURIComponent(slug)}&t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.event) {
          throw new Error("Event not found");
        }
        setEventData(data.event);
      } catch (err: any) {
        setError(err.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [slug]);

  // Countdown timer logic
  useEffect(() => {
    if (!eventData?.starts_at) return;
    const targetDate = new Date(eventData.starts_at).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, mins, secs });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [eventData?.starts_at]);

  const handleAddToCalendar = () => {
    if (!eventData) return;
    const title = encodeURIComponent(eventData.title || "Christian Event");
    const details = encodeURIComponent(eventData.description || "");
    const location = encodeURIComponent(`${eventData.venue_name || ""} ${eventData.address || ""} ${eventData.city || ""}`.trim());
    const startDate = new Date(eventData.starts_at).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = eventData.ends_at
      ? new Date(eventData.ends_at).toISOString().replace(/-|:|\.\d\d\d/g, "")
      : new Date(new Date(eventData.starts_at).getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    window.open(googleCalUrl, "_blank");
  };

  const handleDownloadQR = async () => {
    try {
      const pageUrl = typeof window !== "undefined" ? window.location.href : "";
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(pageUrl)}`;
      const res = await fetch(qrApiUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const fileSlug = (eventData?.title || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      link.download = `${fileSlug}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download QR code", err);
    }
  };

  const handleShare = async () => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventData?.title || "Event",
          text: `Check out ${eventData?.title || "this event"} on ChurchNavigator!`,
          url: pageUrl
        });
        return;
      } catch {
        // Native share closed
      }
    }
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <TopNav />
        <div style={{ maxWidth: "1080px", margin: "60px auto", textAlign: "center", color: "#64748b" }}>
          <i className="ti ti-loader-2" style={{ fontSize: "36px", animation: "spin 1s linear infinite" }}></i>
          <p style={{ marginTop: "12px", fontSize: "15px" }}>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <TopNav />
        <div style={{ maxWidth: "600px", margin: "60px auto", padding: "40px", background: "#fff", borderRadius: "20px", textAlign: "center" }}>
          <i className="ti ti-calendar-x" style={{ fontSize: "48px", color: "#ef4444" }}></i>
          <h2 style={{ fontSize: "22px", fontWeight: 800, marginTop: "12px" }}>Event Not Found</h2>
          <p style={{ color: "#64748b", marginTop: "6px" }}>The requested event could not be found or may have been removed.</p>
          <Link href="/add-listing" style={{ display: "inline-block", marginTop: "20px", padding: "10px 20px", background: "#7c3aed", color: "#fff", borderRadius: "12px", fontWeight: 700 }}>
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const hostName = eventData.host_church?.name || (eventData.host_pastor ? `${eventData.host_pastor.title ? eventData.host_pastor.title + ' ' : ''}${eventData.host_pastor.full_name}` : (eventData.custom_host_name || "Host Ministry"));
  const hostLink = eventData.host_church ? `/church/${eventData.host_church.slug}` : (eventData.host_pastor ? `/pastor/${eventData.host_pastor.slug}` : "#");

  const sessions = eventData.event_sessions || [];
  const speakers = eventData.event_speakers || [];
  const tickets = eventData.event_tickets || [];
  const faqs = eventData.event_faqs || [];
  const gallery = eventData.gallery_urls || [];

  const startDateObj = new Date(eventData.starts_at);
  const formattedDate = startDateObj.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  const formattedTime = startDateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const hasCapacityLimit = typeof eventData.capacity === "number" && eventData.capacity > 0;
  const totalCap = eventData.capacity || 0;
  const placesLeft = Math.max(0, totalCap - registeredCount);
  const fillPct = totalCap > 0 ? Math.min(100, Math.round((registeredCount / totalCap) * 100)) : 0;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f7f7fb", color: "#0f0f1a", minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <TopNav />

      {/* HERO COVER BANNER */}
      <div style={{
        position: "relative",
        minHeight: "420px",
        color: "#fff",
        background: eventData.cover_url ? `url(${eventData.cover_url}) center/cover no-repeat` : "linear-gradient(135deg, #7c3aed 0%, #f43f5e 100%)",
        overflow: "hidden"
      }}>
        {/* Colorful Gradient Overlay & Dark Shade */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 40%), linear-gradient(135deg, rgba(91,33,182,0.85), rgba(190,24,93,0.85))" }}></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,6,20,0.88) 0%, rgba(8,6,20,0.2) 100%)" }}></div>

        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "30px 22px 26px", position: "relative", zIndex: 2, minHeight: "420px", display: "flex", flexDirection: "column" }}>
          
          {/* Back to Events & Owner Edit Access */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "20px" }}>
            <Link href="/events" style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-arrow-left"></i> Events / Conferences
            </Link>

            <Link
              href={`/onboarding/events?id=${eventData.id}`}
              style={{
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#fff",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                padding: "6px 14px",
                borderRadius: "20px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                transition: "all 0.2s"
              }}
            >
              <i className="ti ti-edit" style={{ fontSize: "15px", color: "#fbbf24" }}></i> Owner Edit Access
            </Link>
          </div>

          <div style={{ marginTop: "auto" }}>
            {/* Event Type Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 13px", borderRadius: "20px", marginBottom: "14px" }}>
              <i className="ti ti-flame" style={{ color: "#fbbf24" }}></i> {eventData.custom_type || eventData.type || "Conference"}
            </div>

            {/* Event Name */}
            <h1 style={{ fontSize: "40px", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.08, maxWidth: "760px", textShadow: "0 2px 16px rgba(0,0,0,0.35)", marginBottom: "16px" }}>
              {eventData.title}
            </h1>

            {/* Event Meta Details Row: Date, Time, Location, Address, Host */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: "24px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <i className="ti ti-calendar-event" style={{ color: "#f43f5e", fontSize: "16px" }}></i> {formattedDate}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <i className="ti ti-clock" style={{ color: "#f43f5e", fontSize: "16px" }}></i> {formattedTime}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <i className="ti ti-map-pin" style={{ color: "#f43f5e", fontSize: "16px" }}></i> {eventData.venue_name || eventData.city || "Venue Location"}
                {eventData.address ? ` (${eventData.address})` : ""}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <i className="ti ti-building-church" style={{ color: "#f43f5e", fontSize: "16px" }}></i> Hosted by <Link href={hostLink} style={{ color: "#fff", fontWeight: 700, textDecoration: "underline" }}>{hostName}</Link>
              </span>
            </div>

            {/* Countdown Bottom Row */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "18px", flexWrap: "wrap", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.06em", opacity: 0.8, marginBottom: "7px" }}>STARTS IN</div>
                <div style={{ display: "flex", gap: "9px" }}>
                  <div style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", borderRadius: "12px", padding: "9px 14px", textAlign: "center", minWidth: "62px" }}>
                    <div style={{ fontSize: "23px", fontWeight: 800, lineHeight: 1 }}>{timeLeft.days}</div>
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.8, marginTop: "3px" }}>DAYS</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", borderRadius: "12px", padding: "9px 14px", textAlign: "center", minWidth: "62px" }}>
                    <div style={{ fontSize: "23px", fontWeight: 800, lineHeight: 1 }}>{timeLeft.hours}</div>
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.8, marginTop: "3px" }}>HOURS</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", borderRadius: "12px", padding: "9px 14px", textAlign: "center", minWidth: "62px" }}>
                    <div style={{ fontSize: "23px", fontWeight: 800, lineHeight: 1 }}>{timeLeft.mins}</div>
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.8, marginTop: "3px" }}>MINS</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", borderRadius: "12px", padding: "9px 14px", textAlign: "center", minWidth: "62px" }}>
                    <div style={{ fontSize: "23px", fontWeight: 800, lineHeight: 1 }}>{timeLeft.secs}</div>
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.8, marginTop: "3px" }}>SECS</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleAddToCalendar}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "13.5px", fontWeight: 700, padding: "11px 18px", borderRadius: "12px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer", transition: "all 0.2s" }}
              >
                <i className="ti ti-calendar-plus" style={{ fontSize: "16px" }}></i> Add to calendar
              </button>

              {eventData.livestream_url && (
                <a
                  href={eventData.livestream_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "13.5px", fontWeight: 700, padding: "11px 18px", borderRadius: "12px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", textDecoration: "none", transition: "all 0.2s" }}
                >
                  <i className="ti ti-brand-youtube" style={{ fontSize: "16px", color: "#ef4444" }}></i> Watch livestream
                </a>
              )}

              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "13.5px", fontWeight: 700, padding: "11px 18px", borderRadius: "12px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer", transition: "all 0.2s" }}
              >
                <i className="ti ti-qrcode" style={{ fontSize: "16px" }}></i> Get QR
              </button>

              <Link
                href={`/onboarding/events?id=${eventData.id}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "13.5px", fontWeight: 700, padding: "11px 18px", borderRadius: "12px", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(6px)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", textDecoration: "none", transition: "all 0.2s" }}
              >
                <i className="ti ti-edit" style={{ fontSize: "16px", color: "#fbbf24" }}></i> Edit Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QR CODE MODAL POPUP */}
      {showQRModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15, 15, 26, 0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", maxWidth: "380px", width: "100%", textAlign: "center", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
            <button
              onClick={() => setShowQRModal(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}
            >
              <i className="ti ti-x" style={{ fontSize: "18px" }}></i>
            </button>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f0f1a", marginBottom: "4px" }}>Event QR Code</div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>Scan to open this event page instantly</div>
            
            <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "16px", border: "1.5px solid #e2e8f0", display: "inline-block", marginBottom: "20px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}`}
                alt="Event QR Code"
                style={{ width: "200px", height: "200px", display: "block" }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={handleDownloadQR}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #e11d48, #7c3aed)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(225, 29, 72, 0.25)"
                }}
              >
                <i className="ti ti-download" style={{ fontSize: "16px" }}></i> Download
              </button>

              <button
                type="button"
                onClick={handleShare}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#f1f5f9",
                  border: "1.5px solid #cbd5e1",
                  color: "#0f0f1a",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <i className={`ti ti-${copied ? "check" : "share"}`} style={{ fontSize: "16px", color: copied ? "#10b981" : "#7c3aed" }}></i> {copied ? "Copied!" : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div style={{ maxWidth: "1080px", margin: "30px auto", padding: "0 22px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "26px" }}>
        
        {/* LEFT COLUMN: Details, Schedule, Speakers, FAQs */}
        <div>
          {/* ABOUT EVENT */}
          <div style={{ background: "#fff", border: "1px solid #e9e9ef", borderRadius: "18px", padding: "22px", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "12px", color: "#0f0f1a", letterSpacing: "-0.02em" }}>About this event</h2>
            {eventData.description ? (
              <div
                style={{ fontSize: "14px", lineHeight: 1.7, color: "#23232e" }}
                dangerouslySetInnerHTML={{ __html: eventData.description }}
              />
            ) : (
              <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#23232e" }}>
                {`Join us for ${eventData.title}, hosted by ${hostName}. A powerful gathering of believers for worship, the Word and ministry.`}
              </p>
            )}
            <div style={{ marginTop: "12px" }}>
              <span style={{ display: "inline-flex", fontSize: "11px", fontWeight: 700, padding: "4px 11px", borderRadius: "20px", background: "#f5f3ff", color: "#6d28d9", marginRight: "6px", marginTop: "6px" }}>
                {eventData.custom_type || eventData.type}
              </span>
              <span style={{ display: "inline-flex", fontSize: "11px", fontWeight: 700, padding: "4px 11px", borderRadius: "20px", background: "#f5f3ff", color: "#6d28d9", marginRight: "6px", marginTop: "6px" }}>
                {eventData.mode || "Offline"} Mode
              </span>
              {eventData.has_free_parking && (
                <span style={{ display: "inline-flex", fontSize: "11px", fontWeight: 700, padding: "4px 11px", borderRadius: "20px", background: "#f5f3ff", color: "#6d28d9", marginRight: "6px", marginTop: "6px" }}>
                  Free Parking
                </span>
              )}
            </div>
          </div>

          {/* SCHEDULE TIMETABLE */}
          {sessions.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e9e9ef", borderRadius: "18px", padding: "22px", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px", color: "#0f0f1a", letterSpacing: "-0.02em" }}>Schedule</h2>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px", fontWeight: 500 }}>{formattedDate}</div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {sessions.map((sess: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "16px", padding: "14px 0", borderBottom: i < sessions.length - 1 ? "1px solid #e9e9ef" : "none" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#6d28d9", width: "74px", flexShrink: 0 }}>
                      {sess.time_label}
                    </div>
                    <div>
                      <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f0f1a" }}>{sess.title}</div>
                      {sess.description && <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "2px" }}>{sess.description}</div>}
                      {sess.speaker_name && (
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#6d28d9", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <i className="ti ti-microphone" style={{ fontSize: "14px" }}></i> {sess.speaker_name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPEAKERS & MINISTERS */}
          {speakers.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e9e9ef", borderRadius: "18px", padding: "22px", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px", color: "#0f0f1a", letterSpacing: "-0.02em" }}>Speakers & ministers</h2>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px", fontWeight: 500 }}>Ministering across the event</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                {speakers.map((sp: any, i: number) => (
                  <div key={i} style={{ textAlign: "center", border: "1px solid #e9e9ef", borderRadius: "14px", padding: "16px 10px", background: "#fff" }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      margin: "0 auto 10px",
                      background: sp.photo_url ? `url(${sp.photo_url}) center/cover no-repeat` : "linear-gradient(135deg, #7c3aed, #f43f5e)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "21px",
                      boxShadow: "0 4px 12px rgba(124,58,237,0.15)"
                    }}>
                      {!sp.photo_url && (sp.name ? sp.name[0] : "S")}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "13.5px", color: "#0f0f1a" }}>{sp.name}</div>
                    {sp.designation && <div style={{ fontSize: "11.5px", color: "#6b7280", marginTop: "2px" }}>{sp.designation}</div>}
                    {sp.affiliation && <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "1px" }}>{sp.affiliation}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VENUE & DIRECTIONS */}
          <div style={{ background: "#fff", border: "1px solid #e9e9ef", borderRadius: "18px", padding: "22px", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px", color: "#0f0f1a", letterSpacing: "-0.02em" }}>Venue & directions</h2>
            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px", fontWeight: 500 }}>
              {eventData.venue_name ? `${eventData.venue_name}, ` : ""}{eventData.address || eventData.city || "London, UK"}
            </div>

            {/* Embedded Live Google Map or Map Placeholder */}
            {eventData.address || (eventData.latitude && eventData.longitude) || eventData.city ? (
              <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
                <iframe
                  width="100%"
                  height="220"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${eventData.latitude && eventData.longitude ? `${eventData.latitude},${eventData.longitude}` : encodeURIComponent((eventData.venue_name ? eventData.venue_name + ", " : "") + (eventData.address || eventData.city || "United Kingdom"))}&hl=en&z=14&output=embed`}
                />
                <div style={{ padding: "12px 16px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 600 }}>
                    <i className="ti ti-map-pin" style={{ color: "#7c3aed", marginRight: "6px" }}></i>
                    {eventData.address || eventData.city}
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent((eventData.venue_name ? eventData.venue_name + ", " : "") + (eventData.address || eventData.city || ""))}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "12.5px", fontWeight: 700, color: "#7c3aed", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    Open in Google Maps <i className="ti ti-external-link" style={{ fontSize: "13px" }}></i>
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(244,63,94,0.06))", borderRadius: "16px", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e4ddf7", marginBottom: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #f43f5e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(124,58,237,0.3)" }}>
                  <i className="ti ti-map-pin" style={{ fontSize: "24px" }}></i>
                </div>
              </div>
            )}

            {/* Facilities / Amenities Pills */}
            {(eventData.has_free_parking || eventData.near_metro_station || eventData.near_bus_station || eventData.step_free_access || eventData.creche_available) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {eventData.has_free_parking && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "#f5f3ff", borderRadius: "10px", fontSize: "12.5px", fontWeight: 600, color: "#6d28d9" }}>
                    <i className="ti ti-car" style={{ fontSize: "16px" }}></i> Free parking on site
                  </div>
                )}
                {(eventData.near_metro_station || eventData.near_bus_station) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "#f5f3ff", borderRadius: "10px", fontSize: "12.5px", fontWeight: 600, color: "#6d28d9" }}>
                    <i className="ti ti-train" style={{ fontSize: "16px" }}></i> Near public transport
                  </div>
                )}
                {eventData.step_free_access && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "#f5f3ff", borderRadius: "10px", fontSize: "12.5px", fontWeight: 600, color: "#6d28d9" }}>
                    <i className="ti ti-disabled" style={{ fontSize: "16px" }}></i> Step-free access
                  </div>
                )}
                {eventData.creche_available && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "#f5f3ff", borderRadius: "10px", fontSize: "12.5px", fontWeight: 600, color: "#6d28d9" }}>
                    <i className="ti ti-baby-carriage" style={{ fontSize: "16px" }}></i> Crèche available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FAQS ACCORDION */}
          {faqs.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e9e9ef", borderRadius: "18px", padding: "22px", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px", color: "#0f0f1a", letterSpacing: "-0.02em" }}>FAQ</h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {faqs.map((f: any, i: number) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid #e9e9ef" : "none", padding: "14px 0" }}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        style={{ width: "100%", textAlign: "left", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0 }}
                      >
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f0f1a" }}>{f.question}</span>
                        <i className={`ti ti-chevron-${isOpen ? "up" : "down"}`} style={{ color: "#9ca3af", fontSize: "16px" }}></i>
                      </button>
                      {isOpen && (
                        <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, marginTop: "8px" }}>
                          {f.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EVENT GALLERY PHOTOS (AFTER FAQS) */}
          {gallery.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e9e9ef", borderRadius: "18px", padding: "22px", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px", color: "#0f0f1a", letterSpacing: "-0.02em" }}>Event Gallery</h2>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px", fontWeight: 500 }}>Highlights & photos from previous gatherings</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {gallery.map((imgUrl: string, idx: number) => (
                  <div key={idx} style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "4/3", border: "1px solid #e2e8f0" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Gallery ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Registration Box & Pricing Tiers */}
        <div>
          <div style={{ background: "#fff", border: "1px solid #e9e9ef", borderRadius: "18px", padding: "22px", position: "sticky", top: "74px" }}>
            
            {/* TICKET PRICING TIERS */}
            <h4 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "12px", color: "#0f0f1a" }}>Select Ticket Category</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {tickets.length > 0 ? (
                tickets.map((t: any, i: number) => {
                  const active = selectedTicket === i;
                  const rawPence = typeof t.price_pence === "number" ? t.price_pence : (Number(t.price) ? Number(t.price) * 100 : 0);
                  const priceFormatted = rawPence === 0 ? "Free" : `£${rawPence / 100}`;
                  const bookingUrl = t.booking_url || t.bookingUrl;
                  const capacityStr = t.quantity ? `${t.quantity} seats` : (t.capacity ? `${t.capacity} seats` : "");

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedTicket(i)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        padding: "13px",
                        borderRadius: "13px",
                        border: active ? "1.5px solid #7c3aed" : "1.5px solid #e9e9ef",
                        background: active ? "#f5f3ff" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: active ? "5px solid #7c3aed" : "2px solid #cbd5e1" }} />
                          <div>
                            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f0f1a" }}>{t.name}</div>
                            {capacityStr && <div style={{ fontSize: "11px", color: "#64748b" }}>{capacityStr}</div>}
                          </div>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f0f1a" }}>
                          {priceFormatted}
                        </div>
                      </div>

                      {bookingUrl && (
                        <div style={{ fontSize: "11px", color: "#6d28d9", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", paddingLeft: "28px" }}>
                          <i className="ti ti-link" style={{ fontSize: "12px" }}></i> Direct Booking Link Available
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <>
                  <div
                    onClick={() => setSelectedTicket(0)}
                    style={{
                      padding: "12px",
                      background: selectedTicket === 0 ? "#f5f3ff" : "#fff",
                      border: selectedTicket === 0 ? "2px solid #7c3aed" : "1.5px solid #e9e9ef",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: selectedTicket === 0 ? "5px solid #7c3aed" : "2px solid #cbd5e1" }} />
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f0f1a" }}>Free RSVP</div>
                        <div style={{ fontSize: "11px", color: "#6b7280" }}>200 seats</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f0f1a" }}>Free</div>
                  </div>
                  <div
                    onClick={() => setSelectedTicket(1)}
                    style={{
                      padding: "12px",
                      background: selectedTicket === 1 ? "#f5f3ff" : "#fff",
                      border: selectedTicket === 1 ? "2px solid #7c3aed" : "1.5px solid #e9e9ef",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: selectedTicket === 1 ? "5px solid #7c3aed" : "2px solid #cbd5e1" }} />
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f0f1a" }}>Paid</div>
                        <div style={{ fontSize: "11px", color: "#6b7280" }}>100 seats</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f0f1a" }}>£200</div>
                  </div>
                </>
              )}
            </div>

            {/* SEAT QUANTITY COUNTER WIDGET */}
            <div style={{ marginBottom: "20px", padding: "12px 14px", background: "#f8fafc", borderRadius: "12px", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f0f1a" }}>Number of Seats</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Select seats to reserve</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "3px 6px" }}>
                <button
                  type="button"
                  onClick={() => setSeatQuantity(prev => Math.max(1, prev - 1))}
                  style={{ border: "none", background: "#f1f5f9", width: "26px", height: "26px", borderRadius: "6px", cursor: "pointer", fontWeight: 800, color: "#475569", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  -
                </button>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f0f1a", minWidth: "20px", textAlign: "center" }}>
                  {seatQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setSeatQuantity(prev => Math.min(10, prev + 1))}
                  style={{ border: "none", background: "#7c3aed", width: "26px", height: "26px", borderRadius: "6px", cursor: "pointer", fontWeight: 800, color: "#fff", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  +
                </button>
              </div>
            </div>

            {/* REGISTER / BOOK TICKET BUTTON */}
            <button
              onClick={() => {
                const currentTicket = tickets[selectedTicket];
                const bookingUrl = currentTicket?.booking_url || currentTicket?.bookingUrl;
                if (bookingUrl) {
                  window.open(bookingUrl, "_blank");
                } else {
                  setRegisteredCount(prev => prev + seatQuantity);
                  alert(`Thank you for registering! Reserved ${seatQuantity} seat${seatQuantity > 1 ? "s" : ""}.`);
                }
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 20px -6px rgba(225, 29, 72, 0.4)",
                marginBottom: "16px"
              }}
            >
              <i className="ti ti-ticket" style={{ marginRight: "6px" }}></i>
              {(() => {
                const cur = tickets[selectedTicket];
                if (cur && (cur.booking_url || cur.bookingUrl)) {
                  return `Book ${seatQuantity} Ticket${seatQuantity > 1 ? "s" : ""} Now →`;
                }
                const unitPricePence = cur ? (typeof cur.price_pence === "number" ? cur.price_pence : (Number(cur.price) ? Number(cur.price) * 100 : 0)) : (selectedTicket === 1 ? 20000 : 0);
                if (unitPricePence === 0) {
                  return `Register — Free (${seatQuantity} seat${seatQuantity > 1 ? "s" : ""})`;
                }
                return `Register — £${(unitPricePence / 100) * seatQuantity}`;
              })()}
            </button>


            {/* QUICK ACTIONS UNDER REGISTER BUTTON */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={handleAddToCalendar}
                style={{ flex: 1, padding: "8px 10px", borderRadius: "10px", border: "1px solid #e9e9ef", background: "#fff", fontSize: "12px", fontWeight: 700, color: "#0f0f1a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
              >
                <i className="ti ti-calendar" style={{ fontSize: "14px" }}></i> Calendar
              </button>
              <button
                type="button"
                onClick={handleShare}
                style={{ flex: 1, padding: "8px 10px", borderRadius: "10px", border: "1px solid #e9e9ef", background: "#fff", fontSize: "12px", fontWeight: 700, color: "#0f0f1a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
              >
                <i className="ti ti-share" style={{ fontSize: "14px" }}></i> Share
              </button>
              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                style={{ flex: 1, padding: "8px 10px", borderRadius: "10px", border: "1px solid #e9e9ef", background: "#fff", fontSize: "12px", fontWeight: 700, color: "#0f0f1a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
              >
                <i className="ti ti-qrcode" style={{ fontSize: "14px" }}></i> QR
              </button>
            </div>

            {/* VENUE & LOCATION QUICK INFO */}
            <div style={{ borderTop: "1px solid #e9e9ef", paddingTop: "16px", marginTop: "16px", fontSize: "13px", color: "#23232e", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="ti ti-calendar" style={{ color: "#7c3aed", fontSize: "16px" }}></i>
                <span>{formattedDate} at {formattedTime}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="ti ti-map-pin" style={{ color: "#7c3aed", fontSize: "16px" }}></i>
                <span>{eventData.venue_name ? `${eventData.venue_name}, ` : ""}{eventData.city || "London, UK"}</span>
              </div>
            </div>

          </div>

          {/* HOSTED BY CARD */}
          <div style={{ background: "#fff", border: "1px solid #e9e9ef", borderRadius: "18px", padding: "20px", marginTop: "18px" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f0f1a", marginBottom: "12px" }}>Hosted by</div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, #7c3aed, #f43f5e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px", flexShrink: 0 }}>
                {hostName ? hostName[0] : "H"}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f0f1a" }}>{hostName}</div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>{eventData.city || "United Kingdom"}</div>
              </div>
            </div>
            <Link
              href={hostLink}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                width: "100%",
                padding: "11px",
                borderRadius: "12px",
                border: "1.5px solid #e9e9ef",
                background: "#fff",
                color: "#0f0f1a",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              → View church page
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
