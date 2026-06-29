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
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <i className="ti ti-check text-2xl text-green-600" />
                </div>
                <div className="text-lg font-extrabold text-ink mb-1">Enquiry sent</div>
                <p className="text-sm text-gray">
                  {pastorFirstName} typically responds within 24 hours. We&apos;ll be in touch via email.
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    setStatus('idle');
                  }}
                  className="mt-5 bg-purple text-white rounded-full px-5 py-2 text-sm font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="text-lg font-extrabold text-ink mb-1">Contact {pastorFirstName}</div>
                <p className="text-sm text-gray mb-4">Tell them a bit about your event or enquiry.</p>

                <label className="block text-xs font-bold text-ink mb-1">Your name</label>
                <input
                  name="sender_name"
                  required
                  minLength={2}
                  className="w-full border-[1.5px] border-border rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-purple"
                  placeholder="Jane Smith"
                />

                <label className="block text-xs font-bold text-ink mb-1">Email</label>
                <input
                  name="sender_email"
                  type="email"
                  required
                  className="w-full border-[1.5px] border-border rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-purple"
                  placeholder="jane@church.org"
                />

                <label className="block text-xs font-bold text-ink mb-1">Event type (optional)</label>
                <input
                  name="event_type"
                  className="w-full border-[1.5px] border-border rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-purple"
                  placeholder="Conference, Sunday service, retreat..."
                />

                <label className="block text-xs font-bold text-ink mb-1">Message</label>
                <textarea
                  name="message"
                  required
                  minLength={10}
                  rows={4}
                  className="w-full border-[1.5px] border-border rounded-xl px-3 py-2 text-sm mb-2 outline-none focus:border-purple resize-none"
                  placeholder="Tell us about your event, dates, and what you'd like to invite them for..."
                />

                {status === 'error' && <p className="text-xs text-red-600 mb-3">{errorMsg}</p>}

                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 border-[1.5px] border-border rounded-full py-2.5 text-sm font-bold text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="flex-1 bg-purple text-white rounded-full py-2.5 text-sm font-bold disabled:opacity-60"
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
