'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TagInput } from '@/components/TagInput';
import { ImageUpload } from '@/components/ImageUpload';

interface FormState {
  full_name: string;
  title: string;
  church_name_cache: string;
  city: string;
  country: string;

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

const COMMON_LANGUAGES = ['English', 'Yoruba', 'Spanish', 'French', 'Portuguese', 'Twi', 'Igbo', 'Swahili'];
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
  languages: [],
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
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral to-purple flex items-center justify-center">
              <i className="ti ti-user text-base text-white" />
            </div>
            <div className="text-xl font-extrabold text-ink">Ekklesia — Add Pastor Profile</div>
          </div>
        </div>

        {/* Step bar */}
        <div className="flex items-center gap-4 mb-7">
          <div className="flex-1 flex items-start justify-center gap-0">
            {STEPS.map((s, i) => {
              const state = step === s.id ? 'active' : stepState(s.id);
              const cls = state === 'active' ? 'active' : state === 'done' ? 'done' : 'pending';
              return (
                <div key={s.id} className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center">
                    <button
                      onClick={() => goToStep(s.id)}
                      className={`w-[46px] h-[46px] rounded-2xl flex items-center justify-center transition-all ${
                        cls === 'active'
                          ? 'bg-gradient-to-br from-coral to-purple shadow-lg'
                          : cls === 'done'
                          ? 'bg-green-600'
                          : 'bg-white border-[1.5px] border-border'
                      }`}
                    >
                      <i
                        className={`ti ${cls === 'done' ? 'ti-check' : s.icon} text-lg`}
                        style={{ color: cls === 'pending' ? '#9ca3af' : '#fff' }}
                      />
                    </button>
                    {i < STEPS.length - 1 && <div className="h-0.5 w-10 bg-border mx-1" />}
                  </div>
                  <div className={`text-[11px] font-bold ${cls === 'active' ? 'text-purple' : cls === 'done' ? 'text-green-600' : 'text-gray-light'}`}>
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[13px] text-gray font-semibold flex-shrink-0">
            Step {step} of {STEPS.length}
          </div>
        </div>

        {/* AI hint */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-[1.5px] border-purple-100 rounded-2xl p-4 mb-6 flex gap-3 items-start">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral to-purple flex items-center justify-center flex-shrink-0">
            <i className="ti ti-sparkles text-base text-white" />
          </div>
          <div className="text-sm text-ink pt-0.5">{AI_HINTS[step]}</div>
        </div>

        {/* Step content */}
        {step === 1 && (
          <Card>
            <Field label="Full name" required>
              <input
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                placeholder="e.g. Pastor James Okafor"
                className="input"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Title">
                <select value={form.title} onChange={(e) => update('title', e.target.value)} className="input">
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
              <Field label="City">
                <input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Ilford, London" className="input" />
              </Field>
            </div>
            <Field label="Home church">
              <input
                value={form.church_name_cache}
                onChange={(e) => update('church_name_cache', e.target.value)}
                placeholder="e.g. Liberty Christian Connections"
                className="input"
              />
            </Field>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="pastor@church.co.uk"
                  className="input"
                />
              </Field>
              <Field label="Phone / WhatsApp">
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="07700 900123" className="input" />
              </Field>
            </div>
            <Field label="Website">
              <input value={form.website_url} onChange={(e) => update('website_url', e.target.value)} placeholder="https://..." className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Facebook">
                <input value={form.facebook_url} onChange={(e) => update('facebook_url', e.target.value)} placeholder="https://facebook.com/..." className="input" />
              </Field>
              <Field label="Instagram">
                <input value={form.instagram_url} onChange={(e) => update('instagram_url', e.target.value)} placeholder="https://instagram.com/..." className="input" />
              </Field>
              <Field label="YouTube">
                <input value={form.youtube_url} onChange={(e) => update('youtube_url', e.target.value)} placeholder="https://youtube.com/..." className="input" />
              </Field>
              <Field label="X / Twitter">
                <input value={form.twitter_url} onChange={(e) => update('twitter_url', e.target.value)} placeholder="https://x.com/..." className="input" />
              </Field>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <Field label="Biography">
              <textarea
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                rows={5}
                placeholder="Tell people about your ministry journey, calling, and what you're known for..."
                className="input resize-none"
              />
            </Field>
            <Field label="Vision statement">
              <textarea
                value={form.vision_statement}
                onChange={(e) => update('vision_statement', e.target.value)}
                rows={2}
                placeholder='"To raise a generation of..."'
                className="input resize-none"
              />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Years in ministry">
                <input type="number" value={form.years_in_ministry} onChange={(e) => update('years_in_ministry', e.target.value)} className="input" />
              </Field>
              <Field label="Churches planted">
                <input type="number" value={form.churches_planted} onChange={(e) => update('churches_planted', e.target.value)} className="input" />
              </Field>
              <Field label="Nations reached">
                <input type="number" value={form.nations_reached} onChange={(e) => update('nations_reached', e.target.value)} className="input" />
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
          </Card>
        )}

        {step === 4 && (
          <Card>
            <Field label="Languages you minister in" required>
              <TagInput value={form.languages} onChange={(v) => update('languages', v)} placeholder="Type a language and press Enter..." suggestions={COMMON_LANGUAGES} colorClass="chip-purple" />
            </Field>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Travel range">
                <select value={form.travel_range} onChange={(e) => update('travel_range', e.target.value)} className="input">
                  <option>Local only</option>
                  <option>UK only</option>
                  <option>Europe</option>
                  <option>International</option>
                </select>
              </Field>
              <Field label="Lead time">
                <select value={form.lead_time} onChange={(e) => update('lead_time', e.target.value)} className="input">
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
                className="input"
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
                className="input"
              />
            </Field>
          </Card>
        )}

        {step === 6 && (
          <Card>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <ImageUpload kind="avatar" label="Profile photo" onUploaded={(url) => update('avatar_url', url)} currentUrl={form.avatar_url} />
              <ImageUpload
                kind="cover"
                label="Cover photo"
                onUploaded={(url) => update('cover_photo_urls', [...form.cover_photo_urls.filter((u) => u !== url), url])}
                currentUrl={form.cover_photo_urls[0]}
              />
            </div>
            {submitError && <p className="text-sm text-red-600 mb-3">{submitError}</p>}
          </Card>
        )}

        {/* Nav buttons */}
        <div className="flex gap-2.5 justify-end">
          {step > 1 && (
            <button onClick={() => goToStep(step - 1)} className="btn-secondary">
              <i className="ti ti-arrow-left text-sm" />
            </button>
          )}
          {step < STEPS.length ? (
            <button onClick={() => goToStep(step + 1)} className="btn-primary">
              Next <i className="ti ti-arrow-right text-base" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary disabled:opacity-60">
              {submitting ? 'Publishing…' : 'Publish profile'} <i className="ti ti-check text-base" />
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          background: #fff;
        }
        .input:focus {
          border-color: var(--purple);
        }
        .btn-primary {
          background: var(--purple);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .btn-secondary {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 10px 18px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border-[1.5px] border-border rounded-[20px] p-7 mb-5">{children}</div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] font-bold text-ink mb-1.5">
        {label} {required && <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full ml-1">REQUIRED</span>}
      </label>
      {children}
    </div>
  );
}
