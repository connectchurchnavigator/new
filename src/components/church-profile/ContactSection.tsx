"use client";

import React, { useState } from 'react';
import { sendEmailAction } from '@/app/actions/sendEmail';

type ContactSectionProps = {
  churchName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  socials?: {
    facebook?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    twitter?: string | null;
    tiktok?: string | null;
    telegram?: string | null;
  };
};

export default function ContactSection({ churchName, email, phone, address, socials }: ContactSectionProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    formData.append("targetEmail", email || "");
    formData.append("churchName", churchName || "");

    try {
      const result = await sendEmailAction(formData);
      if (result.success) {
        setSent(true);
        setTimeout(() => setSent(false), 4000);
        e.currentTarget.reset();
      } else {
        setError(result.error || "Failed to send email");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact">
      <div className="contact-grid">
        {/* Left column - Form */}
        <div>
          <h2>Send a message</h2>
          <p className="sub">Have a question, a prayer request, or planning your first visit? We'd love to hear from you.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field">
                <label>Name</label>
                <input type="text" name="name" placeholder="Your name" required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" name="email" placeholder="you@email.com" required />
              </div>
            </div>
            
            <div className="field">
              <label>Subject</label>
              <input type="text" name="subject" placeholder="What's this about?" required />
            </div>
            
            <div className="field">
              <label>Message</label>
              <textarea name="message" placeholder="Write your message..." required></textarea>
            </div>
            
            {error && (
              <div style={{ color: "#e11d48", fontSize: "14px", marginBottom: "16px", fontWeight: 500 }}>
                {error}
              </div>
            )}
            
            <button type="submit" className={`send ${sent ? 'sent' : ''}`} disabled={sending} style={{ cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.75 : 1 }}>
              {sending ? (
                <>
                  <i className="ti ti-loader-2" style={{ fontSize: "16px", animation: "spin 1s linear infinite" }}></i>
                  Sending message...
                </>
              ) : sent ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Message Sent!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Send message
                </>
              )}
            </button>
          </form>

          {email && (
            <div className="form-email">
              Prefer email? Write us at <a href={`mailto:${email}`} style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 700 }}>{email}</a>
            </div>
          )}
        </div>

        {/* Right column - Info */}
        <div>
          <h2>Get in touch</h2>

          <div className="touch-card">
            {address && (
              <div className="cl">
                <div className="ic i-purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div className="lbl">Location</div>
                  <div className="val">{address}</div>
                </div>
              </div>
            )}

            {phone && (
              <div className="cl">
                <div className="ic i-green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div className="lbl">Phone</div>
                  <div className="val">{phone}</div>
                </div>
              </div>
            )}

            {email && (
              <div className="cl">
                <div className="ic i-blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 6l-10 7L2 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div className="lbl">Email</div>
                  <div className="val">{email}</div>
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}
