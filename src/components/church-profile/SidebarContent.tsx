"use client";

import React, { useState } from "react";
import QRWidget from "./QRWidget";
import EditScheduleModal from "./EditScheduleModal";
import EditContactModal from "./EditContactModal";

interface SidebarContentProps {
  initialChurch: any;
  isEditing: boolean;
  onChurchChange?: (church: any) => void;
}

export default function SidebarContent({ initialChurch, isEditing, onChurchChange }: SidebarContentProps) {
  const [church, setChurch] = useState(initialChurch);
  const [editingField, setEditingField] = useState<string | null>(null);

  const renderEditButton = (field: string) => {
    if (!isEditing) return null;
    return (
      <button 
        onClick={() => setEditingField(field)}
        style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f8fafc", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", padding: 0 }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
      </button>
    );
  };

  const coverUrls = church.gallery || [];
  const realYoutube = church.social_youtube || church.youtube;
  const liveStreamUrl = church.live_stream_url || church.livestream;

  return (
    <aside className="side">
      {((church.church_services && church.church_services.length > 0) || isEditing) && (
        <div className="panel sched-panel" style={{ marginBottom: "24px", padding: "24px" }}>
          <div className="sec-head" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="ic c-teal" style={{ width: "30px", height: "30px" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2"/><path d="M12 7v5l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg></span>
            <h4 style={{ fontSize: "16px", fontWeight: 800, textTransform: "capitalize", letterSpacing: "0", color: "#0f172a", margin: 0 }}>Service Schedule</h4>
            {renderEditButton("schedule")}
          </div>
          <div>
            {church.church_services && church.church_services.length > 0 ? (
              church.church_services.map((svc: any, i: number) => (
                <div key={i} className="sched-row" style={{ borderBottom: i < church.church_services.length - 1 ? "1px dashed #e2e8f0" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--ink)" }}>{svc.day}</div>
                    <div style={{ fontSize: "12.5px", color: "var(--muted)", fontWeight: 500 }}>{svc.name}</div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, color: "var(--ink)", border: "1px solid var(--line)" }}>
                    {svc.start_time} {svc.end_time ? `— ${svc.end_time}` : ""}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "14px" }}>No schedule listed.</div>
            )}
          </div>
        </div>
      )}

      {/* Watch Live */}
      {(liveStreamUrl || realYoutube) && (
        <div className="scard" style={{ background: "white", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "24px" }}>
          <div className="scard-h" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "24px 24px 16px 24px", margin: 0 }}>
            <span className="ic" style={{ background: "#fb7185", color: "white", padding: "6px", borderRadius: "8px", display: "flex" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 3l14 9-14 9V3z" fill="currentColor"/></svg>
            </span>
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Watch Live</h4>
          </div>
          <div style={{ padding: "0 24px 24px 24px" }}>
            <a href={liveStreamUrl || realYoutube || "#"} target="_blank" rel="noreferrer" style={{ display: "block", position: "relative", borderRadius: "16px", overflow: "hidden", height: "200px", textDecoration: "none" }}>
              <img src={coverUrls[0] || "https://images.unsplash.com/photo-1470229722913-7c090be5bc3a?auto=format&fit=crop&q=80&w=800"} alt="Live Stream" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 0, left: 0, background: "#e11d48", color: "white", padding: "6px 14px", borderBottomRightRadius: "16px", fontSize: "12px", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px", letterSpacing: "0.02em" }}>
                <span style={{ width: "6px", height: "6px", background: "white", borderRadius: "50%" }}></span> LIVE
              </div>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "56px", height: "56px", background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "4px" }}><path d="M5 3l14 9-14 9V3z" fill="#e11d48"/></svg>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Location & Contact */}
      <div className="scard" style={{ background: "white", padding: "0", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "24px", overflow: "hidden" }}>
        <div className="scard-h" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "24px 24px 16px 24px", margin: 0 }}>
          <span className="ic c-coral" style={{ background: "#f43f5e", color: "white", padding: "6px", borderRadius: "8px", display: "flex" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12z" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="9" r="2.5" stroke="#fff" strokeWidth="2"/></svg></span>
          <h4 style={{ fontSize: "16px", fontWeight: 800, textTransform: church.address_line || (church.latitude && church.longitude) ? "capitalize" : "uppercase", letterSpacing: "0", color: "#0f172a", margin: 0 }}>Location & Contact</h4>
          {renderEditButton("contact")}
        </div>
        
        {church.address_line || (church.latitude && church.longitude) ? (
          <div style={{ width: "100%", height: "200px", background: "#f1f5f9" }}>
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              src={`https://maps.google.com/maps?q=${church.latitude && church.longitude ? `${church.latitude},${church.longitude}` : encodeURIComponent(church.address_line + (church.city ? ", " + church.city : ""))}&hl=en&z=14&output=embed`}
            ></iframe>
          </div>
        ) : (
          <div style={{ padding: "0 24px" }}>
            <div style={{ marginBottom: "16px", color: "#334155", fontSize: "14px", lineHeight: "1.6" }}>
              <strong>Address:</strong><br/>
              {church.address_line || "Address not provided"}
            </div>
            {church.phone && (
              <div style={{ marginBottom: "16px", color: "#334155", fontSize: "14px" }}>
                <strong>Phone:</strong> <a href={`tel:${church.phone}`} style={{ color: "#9333ea", textDecoration: "none" }}>{church.phone}</a>
              </div>
            )}
            {church.email && (
              <div style={{ marginBottom: "16px", color: "#334155", fontSize: "14px" }}>
                <strong>Email:</strong> <a href={`mailto:${church.email}`} style={{ color: "#9333ea", textDecoration: "none" }}>{church.email}</a>
              </div>
            )}
          </div>
        )}

        <div style={{ padding: "16px 24px 24px 24px", display: "flex", justifyContent: "center" }}>
           <a href={`https://maps.google.com/?q=${encodeURIComponent(church.address_line + (church.city ? ", " + church.city : ""))}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "#f8fafc", border: "1px solid var(--line)", borderRadius: "12px", color: "var(--ink)", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20v-7M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2v-10z"/></svg>
             Open in Google Maps
           </a>
        </div>
      </div>

      {/* QR Widget */}
      <QRWidget churchName={church.name} />

      {/* Modals */}
      {editingField === "schedule" && (
        <EditScheduleModal 
          initialSchedule={church.church_services || []} 
          onClose={() => setEditingField(null)} 
          onSave={(schedule) => {
            const updated = { ...church, church_services: schedule };
            setChurch(updated);
            onChurchChange?.(updated);
            setEditingField(null);
          }} 
        />
      )}

      {editingField === "contact" && (
        <EditContactModal
          initialContact={{
            address: church.address_line || "",
            phone: church.phone || "",
            email: church.email || "",
            facebook: church.social_facebook || church.facebook || "",
            instagram: church.social_instagram || church.instagram || "",
            youtube: church.social_youtube || church.youtube || "",
            twitter: church.social_twitter || church.twitter || "",
            tiktok: church.social_tiktok || church.tiktok || "",
            telegram: church.social_telegram || church.telegram || ""
          }}
          onClose={() => setEditingField(null)}
          onSave={(data) => {
            const updated = {
              ...church,
              address_line: data.address,
              phone: data.phone,
              email: data.email,
              social_facebook: data.facebook,
              social_instagram: data.instagram,
              social_youtube: data.youtube,
              social_twitter: data.twitter,
              social_tiktok: data.tiktok,
              social_telegram: data.telegram
            };
            setChurch(updated);
            onChurchChange?.(updated);
            setEditingField(null);
          }}
        />
      )}
    </aside>
  );
}
