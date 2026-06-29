"use client";

import React, { useState } from 'react';
import type { ChurchService } from '@/lib/types';
import { registerVisitor } from '@/app/actions/registerVisitor';

export default function RegisterVisitModal({ churchId, services, onClose }: { churchId: string, services: ChurchService[], onClose: () => void }) {
  const [isFirstTime, setIsFirstTime] = useState(true);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState(services && services.length > 0 ? services[0].id : 'Not sure yet');
  const [hearAbout, setHearAbout] = useState('Friend');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!firstName || !email) {
      setError("First name and email are required.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await registerVisitor({
        church_id: churchId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        city,
        is_first_time: isFirstTime,
        service,
        hear_about: hearAbout
      });
      
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(res.error || "Something went wrong.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(20,20,43,.78)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "400px", background: "#fff", borderRadius: "20px", boxShadow: "0 28px 60px -20px rgba(20,20,43,.28)", display: "flex", flexDirection: "column", overflow: "hidden", alignItems: "center", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#f3e8ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "16px" }}>
            <i className="ti ti-check"></i>
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Seat Saved!</h3>
          <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.5" }}>Thank you for registering your visit. We look forward to seeing you!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(20,20,43,.78)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "520px", background: "#fff", borderRadius: "20px", boxShadow: "0 28px 60px -20px rgba(20,20,43,.28)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="ti ti-user-plus" style={{ fontSize: "20px", color: "#7c3aed" }}></i>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>Register your visit</span>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
            <i className="ti ti-x" style={{ fontSize: "16px" }}></i>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh", overflowY: "auto" }}>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5", margin: 0, marginBottom: "4px" }}>
            Welcome! Tell us a little about you and we'll save you a seat and connect you with a host. Takes 30 seconds.
          </p>

          {error && (
            <div style={{ padding: "12px 16px", background: "#fef2f2", color: "#ef4444", borderRadius: "10px", fontSize: "13px", fontWeight: 600 }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>First name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} type="text" placeholder="First name" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Last name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} type="text" placeholder="Last name" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@email.com" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Phone <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+44 ..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>City / area <span style={{ color: "#94a3b8", fontWeight: 500 }}>(helps us connect you locally)</span></label>
            <input value={city} onChange={e => setCity(e.target.value)} type="text" placeholder="e.g. Hackney, London" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Is this your first visit?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button 
                onClick={() => setIsFirstTime(true)}
                style={{ padding: "10px", borderRadius: "10px", border: isFirstTime ? "1px solid #a855f7" : "1px solid #e2e8f0", background: isFirstTime ? "#f3e8ff" : "#fff", color: isFirstTime ? "#7c3aed" : "#334155", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
              >
                First time <span style={{ fontSize: "16px" }}>👋</span>
              </button>
              <button 
                onClick={() => setIsFirstTime(false)}
                style={{ padding: "10px", borderRadius: "10px", border: !isFirstTime ? "1px solid #a855f7" : "1px solid #e2e8f0", background: !isFirstTime ? "#f3e8ff" : "#fff", color: !isFirstTime ? "#7c3aed" : "#334155", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}
              >
                Been before
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Which service?</label>
              <select value={service} onChange={e => setService(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", fontFamily: "inherit", backgroundColor: "#fff", cursor: "pointer" }}>
                {services && services.map((s) => (
                  <option key={s.id} value={s.id}>{s.day}{s.start_time ? ` ${s.start_time}` : ''}</option>
                ))}
                <option value="Not sure yet">Not sure yet</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>How did you hear?</label>
              <select value={hearAbout} onChange={e => setHearAbout(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", fontFamily: "inherit", backgroundColor: "#fff", cursor: "pointer" }}>
                <option>Friend</option>
                <option>Google</option>
                <option>Instagram</option>
                <option>Facebook</option>
                <option>Walk-in</option>
                <option>Event</option>
                <option>Invited</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", padding: "16px 24px", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
          <button onClick={onClose} disabled={isLoading} style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", background: "#fff", border: "1px solid #e2e8f0", padding: "12px 32px", borderRadius: "12px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, transition: "all 0.2s" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #a855f7, #7c3aed)", border: "none", padding: "12px 32px", borderRadius: "12px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1, boxShadow: "0 10px 24px -8px rgba(124,58,237,.55)", transition: "all 0.2s" }}>
            {isLoading ? "Saving..." : "Register my visit"}
          </button>
        </div>

      </div>
    </div>
  );
}
