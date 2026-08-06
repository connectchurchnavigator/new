'use client';

import { useState } from 'react';

interface EnquiryFormProps {
  pastorSlug: string;
  pastorFirstName: string;
  trigger: React.ReactNode;
}

/**
 * A simple modal enquiry form. Clicking `trigger` opens it; submitting
 * posts to POST /api/pastors/[slug]/enquiries.
 */
export function EnquiryForm({ pastorSlug, pastorFirstName, trigger }: EnquiryFormProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const payload = {
      sender_name: (form.elements.namedItem('sender_name') as HTMLInputElement).value,
      sender_email: (form.elements.namedItem('sender_email') as HTMLInputElement).value,
      event_type: (form.elements.namedItem('event_type') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch(`/api/pastors/${pastorSlug}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      form.reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              border: '1px solid #f1f5f9',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxSizing: 'border-box'
            }}
          >
            {/* Header Close Button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                zIndex: 10
              }}
            >
              &times;
            </button>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <i className="ti ti-check" style={{ fontSize: '24px', color: '#059669' }} />
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Enquiry sent!</div>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  {pastorFirstName} typically responds within 24 hours. We&apos;ll be in touch via email.
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    setStatus('idle');
                  }}
                  style={{ marginTop: '24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '30px', padding: '10px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '2px', paddingRight: '24px' }}>Send enquiry to {pastorFirstName}</div>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Tell them a bit about your event or message.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Your Name</label>
                    <input
                      name="sender_name"
                      required
                      minLength={2}
                      style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      placeholder="Jane Smith"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Email Address</label>
                    <input
                      name="sender_email"
                      type="email"
                      required
                      style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      placeholder="jane@church.org"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Event Type (Optional)</label>
                    <input
                      name="event_type"
                      style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      placeholder="Conference, Sunday service, retreat..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Message</label>
                    <textarea
                      name="message"
                      required
                      minLength={10}
                      rows={3}
                      style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                      placeholder="Tell us about your event, dates, and what you'd like to invite them for..."
                    />
                  </div>
                </div>

                {status === 'error' && <p style={{ fontSize: '12px', color: '#e11d48', marginTop: '8px', fontWeight: 600 }}>{errorMsg}</p>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{ flex: 1, border: '1px solid #cbd5e1', background: '#fff', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    style={{ flex: 1, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: status === 'submitting' ? 0.6 : 1 }}
                  >
                    {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
