"use client";

import React, { useState } from 'react';
import { sendEmailAction } from '@/app/actions/sendEmail';
import EditContactModal from './EditContactModal';

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
    whatsapp?: string | null;
    linkedin?: string | null;
    spotify?: string | null;
    website?: string | null;
  };
  church?: any;
  isEditing?: boolean;
  onChurchChange?: (church: any) => void;
};

export default function ContactSection({ churchName, email, phone, address, socials, church, isEditing, onChurchChange }: ContactSectionProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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
        (e.target as HTMLFormElement)?.reset();
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Get in touch</h2>
            {isEditing && (
              <button
                onClick={() => setShowEditModal(true)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#f8fafc',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--ink)'
                }}
                title="Edit contact and location details"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
            )}
          </div>

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

            {socials && Object.values(socials).some(Boolean) && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '12px' }}>
                  Connect With Us
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {socials.facebook && (
                    <a
                      href={socials.facebook.startsWith('http') ? socials.facebook : `https://${socials.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: '0 4px 12px rgba(24, 119, 242, 0.25)', transition: 'transform 0.15s ease' }}
                      title="Facebook"
                    >
                      <i className="ti ti-brand-facebook"></i>
                    </a>
                  )}
                  {socials.instagram && (
                    <a
                      href={socials.instagram.startsWith('http') ? socials.instagram : `https://${socials.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: '0 4px 12px rgba(225, 48, 108, 0.25)', transition: 'transform 0.15s ease' }}
                      title="Instagram"
                    >
                      <i className="ti ti-brand-instagram"></i>
                    </a>
                  )}
                  {socials.youtube && (
                    <a
                      href={socials.youtube.startsWith('http') ? socials.youtube : `https://${socials.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.25)', transition: 'transform 0.15s ease' }}
                      title="YouTube"
                    >
                      <i className="ti ti-brand-youtube"></i>
                    </a>
                  )}
                  {socials.twitter && (
                    <a
                      href={socials.twitter.startsWith('http') ? socials.twitter : `https://${socials.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', transition: 'transform 0.15s ease' }}
                      title="X / Twitter"
                    >
                      <i className="ti ti-brand-x"></i>
                    </a>
                  )}
                  {socials.linkedin && (
                    <a
                      href={socials.linkedin.startsWith('http') ? socials.linkedin : `https://${socials.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: '0 4px 12px rgba(10, 102, 194, 0.25)', transition: 'transform 0.15s ease' }}
                      title="LinkedIn"
                    >
                      <i className="ti ti-brand-linkedin"></i>
                    </a>
                  )}
                  {socials.tiktok && (
                    <a
                      href={socials.tiktok.startsWith('http') ? socials.tiktok : `https://${socials.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', transition: 'transform 0.15s ease' }}
                      title="TikTok"
                    >
                      <i className="ti ti-brand-tiktok"></i>
                    </a>
                  )}
                  {socials.whatsapp && (
                    <a
                      href={socials.whatsapp.startsWith('http') ? socials.whatsapp : `https://wa.me/${socials.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)', transition: 'transform 0.15s ease' }}
                      title="WhatsApp"
                    >
                      <i className="ti ti-brand-whatsapp"></i>
                    </a>
                  )}
                  {socials.spotify && (
                    <a
                      href={socials.spotify.startsWith('http') ? socials.spotify : `https://${socials.spotify}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#1db954', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: '0 4px 12px rgba(29, 185, 84, 0.25)', transition: 'transform 0.15s ease' }}
                      title="Spotify"
                    >
                      <i className="ti ti-brand-spotify"></i>
                    </a>
                  )}
                  {socials.telegram && (
                    <a
                      href={socials.telegram.startsWith('http') ? socials.telegram : `https://${socials.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#24A1DE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: '0 4px 12px rgba(36, 161, 222, 0.25)', transition: 'transform 0.15s ease' }}
                      title="Telegram"
                    >
                      <i className="ti ti-brand-telegram"></i>
                    </a>
                  )}
                  {socials.website && (
                    <a
                      href={socials.website.startsWith('http') ? socials.website : `https://${socials.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #f43f5e 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)', transition: 'transform 0.15s ease' }}
                      title="Website"
                    >
                      <i className="ti ti-world"></i>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && church && (
        <EditContactModal
          initialContact={{
            address: church.address_line || "",
            country: church.country || "GB",
            city: church.city || "",
            latitude: church.latitude,
            longitude: church.longitude,
            phone: church.phone || "",
            email: church.email || "",
            facebook: church.social_facebook || church.facebook || "",
            instagram: church.social_instagram || church.instagram || "",
            youtube: (church.social_youtube || church.youtube || "").split('|||')[0] || "",
            twitter: church.social_twitter || church.twitter || (() => {
              const yt = church.social_youtube || church.youtube || "";
              const match = yt.match(/\|\|\|twitter:(.*?)(?:\|\|\||$)/);
              return match ? match[1] : "";
            })(),
            tiktok: church.social_tiktok || church.tiktok || (() => {
              const yt = church.social_youtube || church.youtube || "";
              const match = yt.match(/\|\|\|tiktok:(.*?)(?:\|\|\||$)/);
              return match ? match[1] : "";
            })(),
            telegram: church.social_telegram || church.telegram || (() => {
              const yt = church.social_youtube || church.youtube || "";
              const match = yt.match(/\|\|\|telegram:(.*?)(?:\|\|\||$)/);
              return match ? match[1] : "";
            })()
          }}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => {
            const updated = {
              ...church,
              address_line: data.address,
              city: data.city || church.city,
              country: data.country || church.country,
              latitude: data.latitude ?? church.latitude,
              longitude: data.longitude ?? church.longitude,
              phone: data.phone,
              email: data.email,
              facebook: data.facebook,
              instagram: data.instagram,
              youtube: data.youtube,
              social_facebook: data.facebook,
              social_instagram: data.instagram,
              social_youtube: data.youtube,
              social_twitter: data.twitter,
              social_tiktok: data.tiktok,
              social_telegram: data.telegram
            };
            onChurchChange?.(updated);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}
