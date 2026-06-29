"use client";

import React, { useState } from 'react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }, 1500);
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
                <input type="text" placeholder="Your name" required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" placeholder="you@email.com" required />
              </div>
            </div>
            
            <div className="field">
              <label>Subject</label>
              <input type="text" placeholder="What's this about?" required />
            </div>
            
            <div className="field">
              <label>Message</label>
              <textarea placeholder="Write your message..." required></textarea>
            </div>
            
            <button type="submit" className={`send ${sent ? 'sent' : ''}`} disabled={sending}>
              {sending ? (
                'Sending...'
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
          <p className="sub">Reach the church office directly.</p>

          <div className="touch-card">
            {address && (
              <div className="cl">
                <div className="ic i-purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div className="lbl">Address</div>
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

            <div className="cl">
              <div className="ic" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6v6l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div className="lbl">Office Hours</div>
                <div className="val">Mon–Fri, 9:00 AM – 5:00 PM</div>
              </div>
            </div>
          </div>

          <div className="socials">
            {socials?.facebook && (
              <a href={socials.facebook} target="_blank" rel="noreferrer" className="soc" style={{ background: '#1877f2' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
            {socials?.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" className="soc" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
            {socials?.youtube && (
              <a href={socials.youtube} target="_blank" rel="noreferrer" className="soc" style={{ background: '#ff0000' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            )}
            {socials?.twitter && (
              <a href={socials.twitter} target="_blank" rel="noreferrer" className="soc" style={{ background: '#000' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
              </a>
            )}
            {socials?.tiktok && (
              <a href={socials.tiktok} target="_blank" rel="noreferrer" className="soc" style={{ background: '#000' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
            )}
            {socials?.telegram && (
              <a href={socials.telegram} target="_blank" rel="noreferrer" className="soc" style={{ background: '#24A1DE' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l-4 4 6 6 4-16-18 7 4 2 2 6 3-4"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
