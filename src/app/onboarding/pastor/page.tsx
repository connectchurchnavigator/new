'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import TopNav from '@/components/layout/TopNav';
import { TagInput } from '@/components/TagInput';
import { ImageUpload } from '@/components/ImageUpload';
import SharedAddressField from '@/components/add-church/steps/SharedAddressField';
import logoImg from '@/Assets/logo (1).png';

export interface AssociatedChurchItem {
  image?: string;
  name: string;
  location: string;
  link: string;
}

interface FormState {
  full_name: string;
  title: string;
  church_name_cache: string;
  associated_churches: AssociatedChurchItem[];
  city: string;
  country: string;
  address?: string;
  latitude?: number;
  longitude?: number;

  phone: string;
  email: string;
  website_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  whatsapp_url: string;
  linkedin_url: string;
  tiktok_url: string;

  bio: string;
  vision_statement: string;
  years_in_ministry: string;
  churches_planted: string;
  nations_reached: string;
  events_spoken: string;
  congregation_size: string;
  preaching_tags: string[];
  ministry_area_tags: string[];
  available_for_tags: string[];
  timeline_items: { year: string; title: string; description: string }[];
  affiliation_items: { organisation: string; role: string }[];
  core_values?: string[];

  languages: string[];
  sermon_links?: string[];
  sermon_items?: { title: string; description: string; link: string }[];
  education_items?: { degree: string; university: string }[];
  award_items?: { title: string; issuer: string; year: string }[];

  travel_range: string;
  lead_time: string;
  availability_status: 'available' | 'limited' | 'unavailable';
  availability_note: string;

  avatar_url: string;
  cover_photo_urls: string[];
  gallery_photo_urls?: string[];
}

const STEPS = [
  { id: 1, label: 'Basics', icon: 'ti-user' },
  { id: 2, label: 'Ministry', icon: 'ti-heart-handshake' },
  { id: 3, label: 'Contact & Media', icon: 'ti-phone' },
];

const AI_HINTS: Record<number, string> = {
  1: "Let's start with the basics. Use your full title and name — it's how members and event organisers will find you.",
  2: "Tell your story. Add tags for what you preach on, the ministry areas you lead, and what kinds of events you're open to.",
  3: "Add your contact channels, languages, availability, sermons, and photos all in one place.",
};

const COMMON_LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'German', 'Mandarin', 'Arabic', 'Hindi'];
const PREACHING_SUGGESTIONS = ['Prophetic preaching', 'Evangelism', 'Expository teaching', 'Faith & healing', 'Leadership'];
const MINISTRY_SUGGESTIONS = ['Youth ministry', 'Community outreach', "Women's ministry", "Men's network", 'Marriage & family', 'Prison ministry'];
const AVAILABLE_FOR_SUGGESTIONS = ['Sunday services', 'Conferences', 'Revival meetings', 'Retreats', 'Weddings', 'Funerals'];

const initialState: FormState = {
  full_name: '',
  title: 'Senior Pastor',
  church_name_cache: '',
  associated_churches: [
    { image: '', name: '', location: '', link: '' }
  ],
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
  linkedin_url: '',
  tiktok_url: '',
  bio: '',
  vision_statement: '',
  years_in_ministry: '',
  churches_planted: '',
  nations_reached: '',
  events_spoken: '',
  congregation_size: '',
  preaching_tags: [],
  ministry_area_tags: [],
  available_for_tags: [],
  timeline_items: [],
  affiliation_items: [],
  core_values: [],
  languages: ['English'],
  sermon_links: [''],
  sermon_items: [{ title: '', description: '', link: '' }],
  education_items: [{ degree: '', university: '' }],
  award_items: [{ title: '', issuer: '', year: '' }],
  travel_range: 'UK only',
  lead_time: '2 weeks min',
  availability_status: 'available',
  availability_note: '',
  avatar_url: '',
  cover_photo_urls: [],
  gallery_photo_urls: [],
};

function PastorOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editSlug, setEditSlug] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('edit') || null;
    }
    return searchParams.get('edit') || null;
  });

  const [step, setStep] = useState(1);
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));
  const [form, setForm] = useState<FormState>(initialState);
  const [isEditing, setIsEditing] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!new URLSearchParams(window.location.search).get('edit');
    }
    return !!searchParams.get('edit');
  });
  const [loadingProfile, setLoadingProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!new URLSearchParams(window.location.search).get('edit');
    }
    return !!searchParams.get('edit');
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPublishStep, setCurrentPublishStep] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState("");

  // Keep edit slug synced if searchParams updates
  useEffect(() => {
    const slugFromQuery = searchParams.get('edit');
    if (slugFromQuery && slugFromQuery !== editSlug) {
      setEditSlug(slugFromQuery);
      setIsEditing(true);
    }
  }, [searchParams, editSlug]);

  // Load profile when edit param is present
  useEffect(() => {
    if (!editSlug) return;
    let isCancelled = false;

    async function fetchPastor() {
      setLoadingProfile(true);
      try {
        const res = await fetch(`/api/pastors/${editSlug}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Could not load profile');
        const data = await res.json();
        if (isCancelled) return;

        setIsEditing(true);
        setForm({
          full_name: data.full_name || '',
          title: data.title || '',
          church_name_cache: data.church_name_cache || '',
          associated_churches: Array.isArray(data.associated_churches) && data.associated_churches.length > 0
            ? data.associated_churches
            : data.church_name_cache
              ? [{ image: '', name: data.church_name_cache, location: data.city || '', link: '' }]
              : [{ image: '', name: '', location: '', link: '' }],
          city: data.city || '',
          country: data.country || 'United Kingdom',
          address: data.city ? `${data.city}, ${data.country || 'United Kingdom'}` : '',
          phone: data.phone || '',
          email: data.email || '',
          website_url: data.website_url || '',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || '',
          youtube_url: data.youtube_url || '',
          twitter_url: data.twitter_url || '',
          whatsapp_url: data.whatsapp_url || '',
          bio: data.bio || '',
          vision_statement: data.vision_statement || '',
          years_in_ministry: data.years_in_ministry ? String(data.years_in_ministry) : '',
          churches_planted: data.churches_planted ? String(data.churches_planted) : '',
          nations_reached: data.nations_reached ? String(data.nations_reached) : '',
          events_spoken: data.events_spoken ? String(data.events_spoken) : '',
          congregation_size: data.congregation_size ? String(data.congregation_size) : '',
          preaching_tags: (data.tags || []).filter((t: any) => t.category === 'preaching').map((t: any) => t.label),
          ministry_area_tags: (data.tags || []).filter((t: any) => t.category === 'ministry_area').map((t: any) => t.label),
          available_for_tags: (data.tags || []).filter((t: any) => t.category === 'available_for').map((t: any) => t.label),
          timeline_items: (data.timeline || []).map((t: any) => ({ year: t.year || '', title: t.title || '', description: t.description || '' })),
          affiliation_items: (data.affiliations || []).map((a: any) => ({ organisation: a.organisation || '', role: a.role || '' })),
          core_values: Array.isArray(data.core_values) && data.core_values.length > 0
            ? data.core_values
            : (data.tags || []).filter((t: any) => t.category === 'core_value').map((t: any) => t.label),
          linkedin_url: data.linkedin_url || '',
          tiktok_url: data.tiktok_url || '',
          languages: data.languages && data.languages.length > 0 ? data.languages : ['English'],
          sermon_links: data.sermons && data.sermons.length > 0
            ? data.sermons.map((s: any) => s.youtube_url || s.video_url || s.url || '')
            : [''],
          sermon_items: data.sermons && data.sermons.length > 0
            ? data.sermons.map((s: any) => ({
                title: s.title || '',
                description: s.series || '',
                link: s.youtube_url || s.video_url || s.url || ''
              }))
            : [{ title: '', description: '', link: '' }],
          education_items: data.education && data.education.length > 0
            ? data.education.map((e: any) => ({ degree: e.degree || '', university: e.institution || e.university || '' }))
            : [{ degree: '', university: '' }],
          award_items: data.awards && data.awards.length > 0
            ? data.awards.map((a: any) => {
                const parts = (a.issuer || '').split(' · ');
                const issuer = parts[0] || '';
                const year = a.year || (parts.length > 1 ? parts[parts.length - 1] : '');
                return { title: a.title || '', issuer, year };
              })
            : [{ title: '', issuer: '', year: '' }],
          travel_range: data.travel_range || 'UK only',
          lead_time: data.lead_time || '2 weeks min',
          availability_status: data.availability_status || 'available',
          availability_note: data.availability_note || '',
          avatar_url: data.avatar_url || '',
          cover_photo_urls: data.cover_photo_urls || [],
          gallery_photo_urls: (data.gallery || []).map((g: any) => g.image_url || g.url || '').filter(Boolean),
        });
        setToastMsg(`✨ Loaded profile for editing: ${data.full_name}`);
      } catch (e) {
        console.error('Failed to pre-fill pastor profile for editing', e);
      } finally {
        if (!isCancelled) setLoadingProfile(false);
      }
    }

    fetchPastor();
    return () => {
      isCancelled = true;
    };
  }, [editSlug]);

  const handleLoadSampleData = () => {
    if (step === 1) {
      setForm(prev => ({
        ...prev,
        full_name: "Pastor Emmanuel Adeyemi",
        title: "Senior Pastor",
        church_name_cache: "Kingsway International Christian Centre",
        associated_churches: [
          {
            image: "https://images.unsplash.com/photo-1548625361-195feee15f9b?w=400&q=80",
            name: "Kingsway International Christian Centre",
            location: "London, United Kingdom",
            link: "https://kicc.org.uk"
          },
          {
            image: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=80",
            name: "Grace City Fellowship",
            location: "Manchester, United Kingdom",
            link: "https://gracecity.org.uk"
          }
        ],
        city: "London",
        country: "United Kingdom",
        address: "Waterberry Drive, Waterlooville, PO7 7XX",
        latitude: 50.8805,
        longitude: -1.0261
      }));
      setErrors(prev => ({ ...prev, full_name: "", country: "", address: "" }));
      setVerified(prev => ({ ...prev, full_name: true, country: true, address: true }));
      setToastMsg("✨ Sample pastor profile & church details loaded for Step 1!");
    } else if (step === 2) {
      setForm(prev => ({
        ...prev,
        bio: "Pastor Emmanuel Adeyemi has been serving the body of Christ for over 22 years, preaching dynamic messages of faith, purpose, and spiritual renewal. He is committed to raising kingdom leaders and transforming communities through the Gospel.",
        vision_statement: "To empower believers to walk in authentic dominion and manifest God's love in every sphere of influence.",
        years_in_ministry: "22",
        churches_planted: "8",
        nations_reached: "16",
        events_spoken: "140",
        congregation_size: "1200",
        preaching_tags: ["Prophetic preaching", "Faith & healing", "Leadership", "Expository teaching"],
        ministry_area_tags: ["Community outreach", "Youth ministry", "Men's network", "Marriage & family"],
        available_for_tags: ["Sunday services", "Conferences", "Revival meetings", "Leadership Retreats"],
        timeline_items: [
          { year: "2006", title: "Ordained into Pastoral Ministry", description: "Ordained under the Apostolic Council after completing ministerial leadership training." },
          { year: "2012", title: "Planted London Grace Chapel", description: "Pioneered outreach in South London growing the congregation to over 400 members." },
          { year: "2018", title: "Appointed Regional Director", description: "Overseeing church planting networks and mentorship programs across Greater London." },
          { year: "2024", title: "Global Apostolic Convocation Speaker", description: "Keynote minister on transformative revival and kingdom leadership across Europe." }
        ],
        affiliation_items: [
          { organisation: "RCCG", role: "Ordained member · Since 2006" },
          { organisation: "Pentecostal Fellowship UK", role: "Member · Since 2012" },
          { organisation: "ICGC", role: "International partner" },
          { organisation: "Evangelical Alliance UK", role: "Affiliate member" }
        ],
      }));
      setToastMsg("✨ Sample ministry bio, numbers, timeline & affiliations loaded for Step 2!");
    } else if (step === 3) {
      setForm(prev => ({
        ...prev,
        phone: "+44 20 8525 0000",
        email: "pastor.emmanuel@kicc.org.uk",
        website_url: "https://emmanueladeyemi.org",
        facebook_url: "https://facebook.com/pastoremmanuel",
        instagram_url: "https://instagram.com/pastoremmanuel",
        youtube_url: "https://youtube.com/@pastoremmanuel",
        twitter_url: "https://x.com/pastoremmanuel",
        linkedin_url: "https://linkedin.com/in/pastoremmanuel",
        tiktok_url: "https://tiktok.com/@pastoremmanuel",
        sermon_items: [
          { title: "Walking in Supernatural Favor", description: "Faith & Dominion Series · Part 1", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "The Power of Persistent Prayer", description: "Kingdom Living · Part 4", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
        ],
        sermon_links: [
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        ],
        languages: ["English", "French", "Yoruba", "Spanish"],
        travel_range: "International",
        lead_time: "2-4 weeks",
        availability_status: "available",
        availability_note: "Available for international apostolic conferences and regional leadership summits with advance notice.",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
        cover_photo_urls: ["https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80"],
        gallery_photo_urls: [
          "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80",
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
        ]
      }));
      setErrors(prev => ({ ...prev, email: "", phone: "", website_url: "", facebook_url: "", instagram_url: "", youtube_url: "", twitter_url: "", languages: "" }));
      setVerified(prev => ({ ...prev, email: true, phone: true, website_url: true, facebook_url: true, instagram_url: true, youtube_url: true, twitter_url: true }));
      setToastMsg("✨ Sample contact, media, travel & languages loaded for Step 3!");
    }
    setTimeout(() => setToastMsg(""), 4500);
  };

  const SOCIAL_RULES: { [key: string]: { rx: RegExp, others: RegExp, name: string, ex: string } } = {
    facebook_url: { rx: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|fb\.me)\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'Facebook', ex: 'facebook.com/yourprofile' },
    instagram_url: { rx: /(^@[A-Za-z0-9._]{2,30}$)|^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(facebook\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'Instagram', ex: 'instagram.com/yourprofile or @handle' },
    youtube_url: { rx: /^(https?:\/\/)?(www\.)?(youtube\.com\/[A-Za-z0-9@._\-\/?=&%]+|youtu\.be\/[A-Za-z0-9\-]+)$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'YouTube', ex: 'youtube.com/@yourchannel' },
    twitter_url: { rx: /(^@[A-Za-z0-9_]{1,15}$)|^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|tiktok\.com|t\.me)/i, name: 'X / Twitter', ex: 'twitter.com/yourhandle or @handle' },
    website_url: { rx: /^(https?:\/\/)?(www\.)?[A-Za-z0-9.\-]+\.[a-z]{2,}(\/.*)?$/i, others: /^$/i, name: 'Website', ex: 'https://yourwebsite.com' }
  };

  const validateSocialField = (field: string, value: string) => {
    let errorMsg = "";
    let isVerified = false;
    const v = value.trim();

    if (field === "email") {
      if (!v) {
        errorMsg = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        errorMsg = "Please enter a valid email address";
      } else {
        isVerified = true;
      }
    } else if (field === "phone") {
      if (v && v.replace(/[^0-9]/g, '').length < 9) {
        errorMsg = "Phone number must be at least 9 digits";
      } else if (v) {
        isVerified = true;
      }
    } else if (SOCIAL_RULES[field]) {
      if (v) {
        const R = SOCIAL_RULES[field];
        const wrong = R.others.exec(v);
        if (wrong) {
          errorMsg = `That looks like a different platform link — please put your ${R.name} link here.`;
        } else if (!R.rx.test(v)) {
          errorMsg = `Enter a valid ${R.name} link (e.g. ${R.ex}).`;
        } else {
          isVerified = true;
        }
      }
    }

    setErrors(prev => ({ ...prev, [field]: errorMsg }));
    setVerified(prev => ({ ...prev, [field]: isVerified }));
  };

  const getInputStyle = (field: string) => {
    if (errors[field]) return { border: "1.5px solid red", backgroundColor: "#fef2f2" };
    if (verified[field]) return { border: "1.5px solid #16a34a", backgroundColor: "#f0fdf4" };
    return {};
  };

  const [uploadingChurchIdx, setUploadingChurchIdx] = useState<number | null>(null);

  const handleChurchImageUpload = async (file: File, index: number) => {
    setUploadingChurchIdx(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'avatar');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm(prev => {
          const next = [...prev.associated_churches];
          next[index] = { ...next[index], image: data.url };
          return { ...prev, associated_churches: next };
        });
      }
    } catch (err) {
      console.error("Church image upload failed:", err);
    } finally {
      setUploadingChurchIdx(null);
    }
  };

  const handleAddChurch = () => {
    setForm(prev => ({
      ...prev,
      associated_churches: [
        ...prev.associated_churches,
        { image: '', name: '', location: '', link: '' }
      ]
    }));
  };

  const handleRemoveChurch = (index: number) => {
    setForm(prev => {
      const next = prev.associated_churches.filter((_, i) => i !== index);
      const updated = next.length > 0 ? next : [{ image: '', name: '', location: '', link: '' }];
      return {
        ...prev,
        associated_churches: updated,
        church_name_cache: updated[0]?.name || ''
      };
    });
  };

  const handleUpdateChurch = (index: number, field: keyof AssociatedChurchItem, value: string) => {
    setForm(prev => {
      const next = [...prev.associated_churches];
      next[index] = { ...next[index], [field]: value };
      return {
        ...prev,
        associated_churches: next,
        church_name_cache: index === 0 && field === 'name' ? value : prev.church_name_cache
      };
    });
  };

  function validateStep(s: number): boolean {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!form.full_name || form.full_name.trim().length < 3) {
        newErrors.full_name = 'Full name must be at least 3 characters';
      }
      if (!form.country || !form.country.trim()) {
        newErrors.country = 'Country is required';
      }
      if (!form.address && !form.city) {
        newErrors.address = 'Address is required';
      }
    }

    if (s === 3) {
      if (!form.email || !form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Enter a valid email address';
      }

      if (form.phone && form.phone.replace(/[^0-9]/g, '').length < 9) {
        newErrors.phone = 'Phone number must be at least 9 digits';
      }

      if (!form.languages || form.languages.length === 0) {
        newErrors.languages = 'Add at least one language';
      }

      Object.keys(SOCIAL_RULES).forEach(field => {
        const val = (form as any)[field] || "";
        if (val.trim()) {
          const R = SOCIAL_RULES[field];
          const wrong = R.others.exec(val.trim());
          if (wrong) {
            newErrors[field] = `That looks like a different platform link — please put your ${R.name} link here.`;
          } else if (!R.rx.test(val.trim())) {
            newErrors[field] = `Enter a valid ${R.name} link (e.g. ${R.ex}).`;
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function goToStep(n: number) {
    setVisited((prev) => new Set(prev).add(n));
    setStep(n);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function stepState(id: number): 'done' | 'partial' | 'empty' {
    if (!visited.has(id) || id === step) return 'empty';
    if (id === 1) return form.full_name.trim().length >= 3 ? 'done' : 'empty';
    if (id === 2) return form.bio || form.preaching_tags.length ? 'done' : 'empty';
    if (id === 3) return (form.email || form.phone) && form.languages.length > 0 ? 'done' : 'empty';
    return 'empty';
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    setCurrentPublishStep(0);

    const stepInterval = setInterval(() => {
      setCurrentPublishStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1100);

    const payload = {
      ...form,
      edit_slug: editSlug || undefined,
      years_in_ministry: form.years_in_ministry ? Number(form.years_in_ministry) : undefined,
      churches_planted: form.churches_planted ? Number(form.churches_planted) : undefined,
      nations_reached: form.nations_reached ? Number(form.nations_reached) : undefined,
      events_spoken: form.events_spoken ? Number(form.events_spoken) : undefined,
      congregation_size: form.congregation_size ? Number(form.congregation_size) : undefined,
    };

    try {
      const res = await fetch('/api/pastors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        clearInterval(stepInterval);
        if (data.issues?.fieldErrors) {
          const errors = Object.entries(data.issues.fieldErrors)
            .map(([field, msgs]: any) => `${field.replace('_', ' ')}: ${msgs.join(', ')}`)
            .join('; ');
          throw new Error(`Validation failed - ${errors}`);
        }
        throw new Error(data.error || 'Something went wrong submitting your profile.');
      }

      setCurrentPublishStep(4);
      clearInterval(stepInterval);
      router.push(`/pastor/${data.slug}`);
    } catch (err) {
      clearInterval(stepInterval);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNav />
        <div className="max-w-[900px] mx-auto px-6 py-20 text-center">
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: '#fff', padding: '40px 48px', borderRadius: '24px', border: '1.5px solid #ebebf0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)' }}>
              <i className="ti ti-loader-2" style={{ fontSize: '28px', color: '#fff', animation: 'spin 1s linear infinite' }}></i>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Loading Pastor Profile...</h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>Fetching existing details for editing. Please hold on a moment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Form Wizard Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="brand-mark"><i className="ti ti-user" style={{ fontSize: "18px", color: "#fff" }}></i></div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>
                {isEditing ? 'Edit Pastor Profile' : 'Add Pastor Profile'}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--cn-gray)" }}>Step {step} of {STEPS.length}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handleLoadSampleData}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "12px",
                border: "1.5px solid #a855f7",
                background: "linear-gradient(135deg, #f5f3ff, #faf5ff)",
                color: "#7e22ce",
                fontSize: "13.5px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(168, 85, 247, 0.15)",
                transition: "all 0.2s",
              }}
              title={`Pre-fill Step ${step} with sample pastor data`}
            >
              <i className="ti ti-sparkles" style={{ fontSize: "16px", color: "#9333ea" }}></i>
              Load Sample Data
            </button>
            <button className="btn-secondary" onClick={() => router.push('/add-listing')}>
              <i className="ti ti-x" style={{ fontSize: "14px" }}></i> Exit
            </button>
          </div>
        </div>

        {/* Toast confirmation message */}
        {toastMsg && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            marginBottom: "24px",
            background: "#f0fdf4",
            border: "1.5px solid #86efac",
            borderRadius: "14px",
            color: "#166534",
            fontSize: "13.5px",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(22, 101, 52, 0.08)",
            animation: "fadeIn 0.3s ease"
          }}>
            <i className="ti ti-circle-check" style={{ fontSize: "18px", color: "#16a34a" }}></i>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Step Progress Bar with Icons - Centered exactly like Add Church */}
        <div style={{ marginBottom: "44px" }}>
          <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 0, paddingBottom: "24px" }}>
            {STEPS.map((s, index) => {
              const isDone = step > s.id;
              const isActive = step === s.id;

              return (
                <React.Fragment key={s.id}>
                  <div 
                    className="step-wrap" 
                    onClick={() => { if (isDone || isActive) goToStep(s.id); }}
                    style={{ cursor: isDone || isActive ? "pointer" : "default" }}
                  >
                    <div className={`step-icon-outer ${isActive ? "active" : isDone ? "done" : "pending"}`}>
                      {isDone ? (
                        <i className="ti ti-check" style={{ fontSize: "20px", color: "#fff" }}></i>
                      ) : (
                        <i className={`ti ${s.icon}`} style={{ fontSize: "20px", color: isActive ? "#fff" : "var(--cn-gray-light)" }}></i>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: isActive || isDone ? 700 : 600, color: isActive ? "var(--cn-purple)" : isDone ? "var(--cn-ink)" : "var(--cn-gray-light)", position: "absolute", top: "54px", whiteSpace: "nowrap" }}>
                      {s.label}
                    </div>
                  </div>
                  
                  {/* Connector line between steps */}
                  {index < STEPS.length - 1 && (
                    <div style={{ width: "140px", display: "flex", alignItems: "center", height: "46px", marginTop: "0" }}>
                      <div className={`step-connector ${step > s.id ? "done" : ""}`} style={{ width: "100%", height: "2px" }}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Loading Profile Skeleton / Spinner */}
        {loadingProfile && (
          <div style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "48px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            border: "1.5px solid #ececf2",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            marginBottom: "24px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid #e9d5ff",
              borderTopColor: "#9333ea",
              animation: "spin 0.8s linear infinite"
            }} />
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#1e1b4b" }}>
              Loading profile details...
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Retrieving existing bio, ministry milestones, qualifications and media
            </div>
            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Step content */}
        {!loadingProfile && step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Thematic Card 1: Ministry Role & Affiliation */}
            <Card
              title="Personal Identity & Calling"
              subtitle="Introduce yourself with your full title, legal/preferred name, and home ministry"
              icon="ti-user"
              badge="Core Info"
              onLoadSample={handleLoadSampleData}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "18px" }}>
                  <Field label="Ministry Title" required>
                    <select
                      value={form.title}
                      onChange={(e) => update('title', e.target.value)}
                      style={{ fontWeight: 600 }}
                    >
                      <option>Senior Pastor</option>
                      <option>Lead Pastor</option>
                      <option>Associate Pastor</option>
                      <option>Youth Pastor</option>
                      <option>Bishop</option>
                      <option>Apostle</option>
                      <option>Prophet / Prophetess</option>
                      <option>Evangelist</option>
                      <option>Reverend</option>
                      <option>Other</option>
                    </select>
                  </Field>
                  <Field label="Full Name" required>
                    <input
                      value={form.full_name}
                      onChange={(e) => {
                        update('full_name', e.target.value);
                        if (errors.full_name) setErrors(prev => ({ ...prev, full_name: '' }));
                      }}
                      placeholder="e.g. Dr. Emmanuel Adeyemi"
                      style={{ fontWeight: 600, ...(errors.full_name ? { border: "1.5px solid red", background: "#fef2f2" } : {}) }}
                    />
                    {errors.full_name && <p style={{ color: "#ef4444", fontSize: "12.5px", marginTop: "5px", fontWeight: 600 }}>{errors.full_name}</p>}
                  </Field>
                </div>

              </div>
            </Card>

            {/* Thematic Card: Associated Churches & Ministries */}
            <Card
              title="Associated Churches & Ministries"
              subtitle="Specify the church(es) or ministry branches you are currently associated with, lead, or serve"
              icon="ti-building-church"
              badge="Church Affiliations"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {form.associated_churches.map((church, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "16px",
                      borderRadius: "14px",
                      border: "1.5px solid #e2e8f0",
                      background: "#fbfbfe",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      position: "relative"
                    }}
                  >
                    {/* Header: Church Index & Delete */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#7c3aed",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                          {idx === 0 ? "Primary Church / Ministry Base" : `Associated Church #${idx + 1}`}
                        </span>
                      </div>

                      {form.associated_churches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChurch(idx)}
                          style={{
                            border: "none",
                            background: "#fee2e2",
                            color: "#ef4444",
                            padding: "4px 9px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                          title="Remove church"
                        >
                          <i className="ti ti-trash" style={{ fontSize: "13px" }}></i> Remove
                        </button>
                      )}
                    </div>

                    {/* Church Fields: Image + Info */}
                    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "16px", alignItems: "start" }}>
                      {/* Image Upload Box */}
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "6px" }}>
                          Image / Logo
                        </label>
                        <div style={{ position: "relative" }}>
                          <div
                            onClick={() => document.getElementById(`church-img-upload-${idx}`)?.click()}
                            style={{
                              width: "110px",
                              height: "105px",
                              borderRadius: "10px",
                              border: "1.5px dashed #cbd5e1",
                              background: church.image ? "#ffffff" : "#f8fafc",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              overflow: "hidden",
                              position: "relative",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {church.image ? (
                              <img
                                src={church.image}
                                alt={church.name || "Church"}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{ textAlign: "center", padding: "6px", color: "#64748b" }}>
                                <i className="ti ti-photo" style={{ fontSize: "22px", color: "#7c3aed", display: "block", marginBottom: "2px" }}></i>
                                <span style={{ fontSize: "10.5px", fontWeight: 600 }}>
                                  {uploadingChurchIdx === idx ? "Uploading..." : "Upload Image"}
                                </span>
                              </div>
                            )}
                          </div>
                          <input
                            id={`church-img-upload-${idx}`}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleChurchImageUpload(file, idx);
                            }}
                          />
                          {church.image && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateChurch(idx, 'image', '');
                              }}
                              style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                background: "rgba(15,23,42,0.75)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                fontSize: "11px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer"
                              }}
                              title="Remove image"
                            >
                              <i className="ti ti-x"></i>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Name, Location, Link Inputs */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                            Church Name {idx === 0 && <span style={{ color: "#ef4444" }}>*</span>}
                          </label>
                          <div style={{ position: "relative" }}>
                            <input
                              value={church.name}
                              onChange={(e) => handleUpdateChurch(idx, 'name', e.target.value)}
                              placeholder="e.g. Kingsway International Christian Centre"
                              style={{
                                width: "100%",
                                padding: "8px 12px 8px 36px",
                                fontSize: "13px",
                                fontWeight: 600,
                                borderRadius: "7px",
                                border: "1px solid #d1d5db",
                                outline: "none"
                              }}
                            />
                            <div style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#7c3aed", pointerEvents: "none" }}>
                              <i className="ti ti-building-church" style={{ fontSize: "16px" }}></i>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                              Location
                            </label>
                            <div style={{ position: "relative" }}>
                              <input
                                value={church.location}
                                onChange={(e) => handleUpdateChurch(idx, 'location', e.target.value)}
                                placeholder="e.g. London, UK"
                                style={{
                                  width: "100%",
                                  padding: "8px 12px 8px 34px",
                                  fontSize: "12px",
                                  borderRadius: "7px",
                                  border: "1px solid #d1d5db",
                                  outline: "none"
                                }}
                              />
                              <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }}>
                                <i className="ti ti-map-pin" style={{ fontSize: "15px" }}></i>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                              Link / Website
                            </label>
                            <div style={{ position: "relative" }}>
                              <input
                                value={church.link}
                                onChange={(e) => handleUpdateChurch(idx, 'link', e.target.value)}
                                placeholder="e.g. https://kicc.org.uk"
                                style={{
                                  width: "100%",
                                  padding: "8px 12px 8px 34px",
                                  fontSize: "12px",
                                  borderRadius: "7px",
                                  border: "1px solid #d1d5db",
                                  outline: "none"
                                }}
                              />
                              <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }}>
                                <i className="ti ti-link" style={{ fontSize: "15px" }}></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Plus button to add more church */}
                <button
                  type="button"
                  onClick={handleAddChurch}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    border: "1.5px dashed #7c3aed",
                    background: "#fdf4ff",
                    color: "#7c3aed",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    marginTop: "2px"
                  }}
                >
                  <i className="ti ti-plus" style={{ fontSize: "16px" }}></i> Add More Church
                </button>
              </div>
            </Card>

            {/* Thematic Card 2: Location & Geographic Base */}
            <Card
              title="Geographic Base & Location"
              subtitle="Where you are primarily based and minister out of"
              icon="ti-map-pin"
              badge="Required"
            >
              <SharedAddressField
                idPrefix="pastor-main"
                country={form.country || "United Kingdom"}
                address={form.address || form.city || ""}
                latitude={form.latitude}
                longitude={form.longitude}
                onUpdateCountry={(val) => {
                  update('country', val);
                  if (errors.country) setErrors(prev => ({ ...prev, country: '' }));
                }}
                onUpdateAddress={(val) => {
                  update('address', val);
                  update('city', val);
                  if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                }}
                onUpdateCoordinates={(lat, lng) => {
                  setForm(f => ({ ...f, latitude: lat, longitude: lng }));
                }}
                errors={errors}
              />
            </Card>
          </div>
        )}

        {!loadingProfile && step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Thematic Card 1: Biography & Vision Statement */}
            <Card
              title="Ministry Story & Vision"
              subtitle="Share your calling, pastoral journey, and God-given mission"
              icon="ti-book"
              badge="Storytelling"
              onLoadSample={handleLoadSampleData}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <Field label="Biography">
                  <textarea
                    value={form.bio}
                    onChange={(e) => update('bio', e.target.value)}
                    rows={5}
                    placeholder="Tell people about your ministry journey, calling, message, and who you shepherd..."
                    className="resize-none"
                    style={{ lineHeight: 1.6 }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                    <span style={{ fontSize: "12px", color: "var(--cn-gray)" }}>Tips: Mention your key milestones, spiritual fathering, or mission.</span>
                    <span style={{ fontSize: "12px", color: "var(--cn-gray-light)", fontWeight: 600 }}>{form.bio.length} chars</span>
                  </div>
                </Field>

                {/* Subtle Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, #f1f1f5, #e5e5eb, #f1f1f5)", margin: "4px 0" }}></div>

                <Field label="Vision Statement">
                  <div style={{ position: "relative" }}>
                    <textarea
                      value={form.vision_statement}
                      onChange={(e) => update('vision_statement', e.target.value)}
                      rows={2}
                      placeholder='"To empower believers to walk in authentic kingdom authority and manifest Christ..."'
                      className="resize-none"
                      style={{ paddingLeft: "42px", fontStyle: "italic", lineHeight: 1.5 }}
                    />
                    <div style={{ position: "absolute", left: "14px", top: "16px", color: "var(--cn-purple)", pointerEvents: "none" }}>
                      <i className="ti ti-quote" style={{ fontSize: "20px" }}></i>
                    </div>
                  </div>
                </Field>

                {/* Subtle Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, #f1f1f5, #e5e5eb, #f1f1f5)", margin: "4px 0" }}></div>

                <Field label="Core Values & Spiritual Tenets">
                  <TagInput
                    value={(form as any).core_values || []}
                    onChange={(v) => update('core_values' as any, v)}
                    placeholder="Type a core value (e.g. Spirit-Led Worship) and press Enter..."
                    suggestions={['Spirit-Led Worship', 'Kingdom Community', 'Global Missions', 'Social Transformation', 'Biblical Truth', 'Discipleship']}
                    labelPrefix="SELECTED CORE VALUES"
                  />
                </Field>
              </div>
            </Card>

            {/* Thematic Card 2: Ministry Footprint & Stat Counters */}
            <Card
              title="Ministry Reach & Numbers"
              subtitle="A quick snapshot of your ministry milestones over the years"
              icon="ti-chart-bar"
              badge="Milestones"
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: "#fcfaff",
                  border: "1.5px solid #ede9fe",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7c3aed" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ti ti-hourglass-empty" style={{ fontSize: "15px" }}></i>
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--cn-ink)" }}>Years in Ministry</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={form.years_in_ministry}
                    onChange={(e) => {
                      update('years_in_ministry', e.target.value);
                      if (errors.years_in_ministry) setErrors(prev => ({ ...prev, years_in_ministry: '' }));
                    }}
                    placeholder="e.g. 15"
                    style={{ fontSize: "16px", fontWeight: 700, textAlign: "center" }}
                  />
                  {errors.years_in_ministry && <p style={{ color: "#ef4444", fontSize: "11px", fontWeight: 600 }}>{errors.years_in_ministry}</p>}
                </div>

                <div style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: "#fff1f2",
                  border: "1.5px solid #ffe4e6",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e11d48" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ffe4e6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ti ti-building-church" style={{ fontSize: "15px" }}></i>
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--cn-ink)" }}>Churches Planted</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={form.churches_planted}
                    onChange={(e) => {
                      update('churches_planted', e.target.value);
                      if (errors.churches_planted) setErrors(prev => ({ ...prev, churches_planted: '' }));
                    }}
                    placeholder="e.g. 5"
                    style={{ fontSize: "16px", fontWeight: 700, textAlign: "center" }}
                  />
                  {errors.churches_planted && <p style={{ color: "#ef4444", fontSize: "11px", fontWeight: 600 }}>{errors.churches_planted}</p>}
                </div>

                <div style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: "#f0fdf4",
                  border: "1.5px solid #dcfce7",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16a34a" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ti ti-world" style={{ fontSize: "15px" }}></i>
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--cn-ink)" }}>Nations Reached</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={form.nations_reached}
                    onChange={(e) => {
                      update('nations_reached', e.target.value);
                      if (errors.nations_reached) setErrors(prev => ({ ...prev, nations_reached: '' }));
                    }}
                    placeholder="e.g. 12"
                    style={{ fontSize: "16px", fontWeight: 700, textAlign: "center" }}
                  />
                  {errors.nations_reached && <p style={{ color: "#ef4444", fontSize: "11px", fontWeight: 600 }}>{errors.nations_reached}</p>}
                </div>

                <div style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: "#fff7ed",
                  border: "1.5px solid #ffedd5",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ea580c" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ti ti-microphone" style={{ fontSize: "15px" }}></i>
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--cn-ink)" }}>Events Spoken</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={form.events_spoken}
                    onChange={(e) => {
                      update('events_spoken', e.target.value);
                      if (errors.events_spoken) setErrors(prev => ({ ...prev, events_spoken: '' }));
                    }}
                    placeholder="e.g. 200"
                    style={{ fontSize: "16px", fontWeight: 700, textAlign: "center" }}
                  />
                  {errors.events_spoken && <p style={{ color: "#ef4444", fontSize: "11px", fontWeight: 600 }}>{errors.events_spoken}</p>}
                </div>

                <div style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: "#f0fdfa",
                  border: "1.5px solid #ccfbf1",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0d9488" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="ti ti-users" style={{ fontSize: "15px" }}></i>
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--cn-ink)" }}>Congregation</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={form.congregation_size}
                    onChange={(e) => {
                      update('congregation_size', e.target.value);
                      if (errors.congregation_size) setErrors(prev => ({ ...prev, congregation_size: '' }));
                    }}
                    placeholder="e.g. 1200"
                    style={{ fontSize: "16px", fontWeight: 700, textAlign: "center" }}
                  />
                  {errors.congregation_size && <p style={{ color: "#ef4444", fontSize: "11px", fontWeight: 600 }}>{errors.congregation_size}</p>}
                </div>
              </div>
            </Card>

            {/* Thematic Card 3: Preaching & Ministry Specialisms */}
            <Card
              title="Preaching Focus & Engagement"
              subtitle="Highlight your doctrinal focus and what types of ministry events you are open to"
              icon="ti-heart-handshake"
              badge="Search Filters"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <Field label="Preaching Specialisms">
                  <TagInput
                    value={form.preaching_tags}
                    onChange={(v) => update('preaching_tags', v)}
                    placeholder="Type a specialism (e.g. Prophetic preaching) and press Enter..."
                    suggestions={PREACHING_SUGGESTIONS}
                    labelPrefix="SELECTED SPECIALISMS"
                  />
                </Field>

                {/* Subtle Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, #f1f1f5, #e5e5eb, #f1f1f5)", margin: "4px 0" }}></div>

                <Field label="Ministry Areas Led">
                  <TagInput
                    value={form.ministry_area_tags}
                    onChange={(v) => update('ministry_area_tags', v)}
                    placeholder="Type a ministry area (e.g. Youth ministry) and press Enter..."
                    suggestions={MINISTRY_SUGGESTIONS}
                    labelPrefix="SELECTED MINISTRY AREAS"
                  />
                </Field>

                {/* Subtle Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, #f1f1f5, #e5e5eb, #f1f1f5)", margin: "4px 0" }}></div>

                <Field label="Available For Engagements">
                  <TagInput
                    value={form.available_for_tags}
                    onChange={(v) => update('available_for_tags', v)}
                    placeholder="Type event type (e.g. Sunday services, Conferences) and press Enter..."
                    suggestions={AVAILABLE_FOR_SUGGESTIONS}
                    labelPrefix="SELECTED AVAILABLE FOR"
                  />
                </Field>
              </div>
            </Card>

            {/* Thematic Card 4: Ministry Journey (Timeline) */}
            <Card
              title="Ministry Journey"
              subtitle="Chronicle your ministry timeline, ordination, plant milestones, and key leadership positions"
              icon="ti-chart-line"
              iconBg="#ea580c"
              badge="Journey"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  Add significant milestones in your spiritual walking and ministry calling over the years.
                </p>

                {((form.timeline_items && form.timeline_items.length > 0)
                  ? form.timeline_items
                  : [{ year: '', title: '', description: '' }]
                ).map((item, idx) => {
                  const itemsList = form.timeline_items && form.timeline_items.length > 0
                    ? [...form.timeline_items]
                    : [{ year: '', title: '', description: '' }];

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "18px",
                        background: "#fcfaff",
                        border: "1.5px solid #ede9fe",
                        borderRadius: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ width: "120px", flexShrink: 0 }}>
                          <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#7c3aed", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Year
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            value={item.year}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                              const updated = [...itemsList];
                              updated[idx] = { ...updated[idx], year: val };
                              update('timeline_items', updated);
                            }}
                            placeholder="YYYY"
                            style={{ fontWeight: 700, textAlign: "center" }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: "220px" }}>
                          <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Milestone Title
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...itemsList];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              update('timeline_items', updated);
                            }}
                            placeholder="e.g. Ordained into Full-Time Ministry"
                            style={{ fontWeight: 600 }}
                          />
                        </div>

                        {itemsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = itemsList.filter((_, i) => i !== idx);
                              update('timeline_items', updated);
                            }}
                            style={{
                              border: "none",
                              background: "#fee2e2",
                              color: "#ef4444",
                              padding: "10px 14px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: "12px",
                              marginTop: "20px",
                              alignSelf: "flex-start"
                            }}
                            title="Remove milestone"
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        )}
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Description / Impact (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            update('timeline_items', updated);
                          }}
                          placeholder="Brief notes about the ministry milestone or expansion..."
                          style={{ fontSize: "13.5px" }}
                        />
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    const current = form.timeline_items || [];
                    update('timeline_items', [...current, { year: '', title: '', description: '' }]);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    border: "1.5px dashed #a855f7",
                    background: "#faf5ff",
                    color: "#7e22ce",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    cursor: "pointer",
                    alignSelf: "flex-start"
                  }}
                >
                  <i className="ti ti-plus"></i> Add another milestone
                </button>
              </div>
            </Card>

            {/* Thematic Card 5: Ministerial Affiliation */}
            <Card
              title="Ministerial Affiliation"
              subtitle="Denominational networks, fellowships, and international ministry partnerships"
              icon="ti-certificate"
              badge="Networks"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  List the church bodies, fellowships, and associations you belong to or partner with (e.g. RCCG, Pentecostal Fellowship UK, ICGC, Evangelical Alliance).
                </p>

                {((form.affiliation_items && form.affiliation_items.length > 0)
                  ? form.affiliation_items
                  : [{ organisation: '', role: '' }]
                ).map((item, idx) => {
                  const itemsList = form.affiliation_items && form.affiliation_items.length > 0
                    ? [...form.affiliation_items]
                    : [{ organisation: '', role: '' }];

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "16px",
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "16px",
                        display: "flex",
                        gap: "14px",
                        alignItems: "center",
                        flexWrap: "wrap"
                      }}
                    >
                      <div style={{ flex: 1.2, minWidth: "220px" }}>
                        <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Organisation / Network
                        </label>
                        <input
                          type="text"
                          value={item.organisation}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx] = { ...updated[idx], organisation: e.target.value };
                            update('affiliation_items', updated);
                          }}
                          placeholder="e.g. RCCG, Pentecostal Fellowship UK"
                          style={{ fontWeight: 700 }}
                        />
                      </div>

                      <div style={{ flex: 1.5, minWidth: "240px" }}>
                        <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Role &amp; Since (e.g. Ordained member · Since 2006)
                        </label>
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx] = { ...updated[idx], role: e.target.value };
                            update('affiliation_items', updated);
                          }}
                          placeholder="e.g. Ordained member · Since 2006 or International partner"
                        />
                      </div>

                      {itemsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = itemsList.filter((_, i) => i !== idx);
                            update('affiliation_items', updated);
                          }}
                          style={{
                            border: "none",
                            background: "#fee2e2",
                            color: "#ef4444",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "12px",
                            marginTop: "20px"
                          }}
                          title="Remove affiliation"
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    const current = form.affiliation_items || [];
                    update('affiliation_items', [...current, { organisation: '', role: '' }]);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    border: "1.5px dashed #4f46e5",
                    background: "#eef2ff",
                    color: "#4338ca",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    cursor: "pointer",
                    alignSelf: "flex-start"
                  }}
                >
                  <i className="ti ti-plus"></i> Add another affiliation
                </button>
              </div>
            </Card>
          </div>
        )}

        {!loadingProfile && step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Thematic Card 1: Direct Contact & Social Channels */}
            <Card
              title="Direct Contact & Digital Presence"
              subtitle="Provide ways for church members, guest invitation teams, and leadership to reach you"
              icon="ti-phone"
              badge="Direct Access"
              onLoadSample={handleLoadSampleData}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
                  <Field label="Official Email" required>
                    <div style={{ position: "relative" }}>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          update('email', e.target.value);
                          validateSocialField('email', e.target.value);
                        }}
                        style={{ ...getInputStyle('email'), paddingLeft: "42px" }}
                        placeholder="pastor@church.co.uk"
                      />
                      <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--cn-purple)", pointerEvents: "none" }}>
                        <i className="ti ti-mail" style={{ fontSize: "17px" }}></i>
                      </div>
                    </div>
                    {errors.email && (
                      <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </Field>

                  <Field label="Phone / WhatsApp Contact">
                    <div style={{ position: "relative" }}>
                      <input
                        value={form.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d\s\+\-\(\)]/g, '');
                          update('phone', val);
                          validateSocialField('phone', val);
                        }}
                        style={{ ...getInputStyle('phone'), paddingLeft: "42px" }}
                        placeholder="07700 900123"
                      />
                      <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#16a34a", pointerEvents: "none" }}>
                        <i className="ti ti-brand-whatsapp" style={{ fontSize: "18px" }}></i>
                      </div>
                    </div>
                    {errors.phone && (
                      <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                        <span>{errors.phone}</span>
                      </div>
                    )}
                  </Field>
                </div>

                <Field label="Personal Website / Blog">
                  <div style={{ position: "relative" }}>
                    <input
                      value={form.website_url}
                      onChange={(e) => {
                        update('website_url', e.target.value);
                        validateSocialField('website_url', e.target.value);
                      }}
                      style={{ ...getInputStyle('website_url'), paddingLeft: "42px" }}
                      placeholder="https://yourwebsite.com"
                    />
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--cn-purple)", pointerEvents: "none" }}>
                      <i className="ti ti-world" style={{ fontSize: "17px" }}></i>
                    </div>
                  </div>
                  {errors.website_url && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                      <span>{errors.website_url}</span>
                    </div>
                  )}
                </Field>

                <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "18px", marginTop: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "14px", display: "block" }}>
                    Social Media Channels
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>Facebook</label>
                      <input
                        value={form.facebook_url}
                        onFocus={() => { if (!form.facebook_url) update('facebook_url', 'https://facebook.com/'); }}
                        onChange={(e) => {
                          update('facebook_url', e.target.value);
                          validateSocialField('facebook_url', e.target.value);
                        }}
                        style={getInputStyle('facebook_url')}
                        placeholder="facebook.com/yourprofile"
                      />
                      {errors.facebook_url && <p style={{ color: "red", fontSize: "11.5px", marginTop: "4px" }}>{errors.facebook_url}</p>}
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>Instagram</label>
                      <input
                        value={form.instagram_url}
                        onFocus={() => { if (!form.instagram_url) update('instagram_url', 'https://instagram.com/'); }}
                        onChange={(e) => {
                          update('instagram_url', e.target.value);
                          validateSocialField('instagram_url', e.target.value);
                        }}
                        style={getInputStyle('instagram_url')}
                        placeholder="instagram.com/yourhandle or @handle"
                      />
                      {errors.instagram_url && <p style={{ color: "red", fontSize: "11.5px", marginTop: "4px" }}>{errors.instagram_url}</p>}
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>YouTube</label>
                      <input
                        value={form.youtube_url}
                        onFocus={() => { if (!form.youtube_url) update('youtube_url', 'https://youtube.com/'); }}
                        onChange={(e) => {
                          update('youtube_url', e.target.value);
                          validateSocialField('youtube_url', e.target.value);
                        }}
                        style={getInputStyle('youtube_url')}
                        placeholder="youtube.com/@yourchannel"
                      />
                      {errors.youtube_url && <p style={{ color: "red", fontSize: "11.5px", marginTop: "4px" }}>{errors.youtube_url}</p>}
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>X / Twitter</label>
                      <input
                        value={form.twitter_url}
                        onFocus={() => { if (!form.twitter_url) update('twitter_url', 'https://twitter.com/'); }}
                        onChange={(e) => {
                          update('twitter_url', e.target.value);
                          validateSocialField('twitter_url', e.target.value);
                        }}
                        style={getInputStyle('twitter_url')}
                        placeholder="twitter.com/yourhandle or @handle"
                      />
                      {errors.twitter_url && <p style={{ color: "red", fontSize: "11.5px", marginTop: "4px" }}>{errors.twitter_url}</p>}
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>LinkedIn</label>
                      <input
                        value={(form as any).linkedin_url || ''}
                        onFocus={() => { if (!(form as any).linkedin_url) update('linkedin_url' as any, 'https://linkedin.com/in/'); }}
                        onChange={(e) => update('linkedin_url' as any, e.target.value)}
                        placeholder="linkedin.com/in/yourprofile"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>TikTok</label>
                      <input
                        value={(form as any).tiktok_url || ''}
                        onFocus={() => { if (!(form as any).tiktok_url) update('tiktok_url' as any, 'https://tiktok.com/@'); }}
                        onChange={(e) => update('tiktok_url' as any, e.target.value)}
                        placeholder="tiktok.com/@yourhandle"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>


            {/* Section 2: Languages, Sermons & Education */}
            <Card title="Languages, Sermons & Education" icon="ti-school">
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <Field label="Languages you minister in" required>
                  <TagInput
                    value={form.languages}
                    onChange={(v) => {
                      update('languages', v);
                      if (errors.languages) setErrors(prev => ({ ...prev, languages: '' }));
                    }}
                    placeholder="Search or type language and press Enter..."
                    suggestions={COMMON_LANGUAGES}
                    labelPrefix="SELECTED LANGUAGES"
                  />
                  {errors.languages && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px", fontWeight: 600 }}>{errors.languages}</p>}
                </Field>

                {/* Subtle Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, #f1f1f5, #e5e5eb, #f1f1f5)", margin: "4px 0" }}></div>

                {/* Multi-item Sermons & Messages */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f0f1a", marginBottom: "4px" }}>
                    Sermons &amp; Messages
                  </label>
                  <p style={{ fontSize: "12px", color: "var(--cn-gray)", marginBottom: "12px" }}>
                    Add messages, teachings, or series. Each entry appears in your profile’s Sermons tab with a Watch button.
                  </p>
                  {(((form as any).sermon_items && (form as any).sermon_items.length > 0)
                    ? (form as any).sermon_items
                    : [{ title: '', description: '', link: '' }]
                  ).map((item: { title: string; description: string; link: string }, idx: number) => {
                    const itemsList = (form as any).sermon_items && (form as any).sermon_items.length > 0
                      ? [...(form as any).sermon_items]
                      : [{ title: '', description: '', link: '' }];
                    return (
                      <div
                        key={idx}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "14px",
                          padding: "14px",
                          marginBottom: "12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: 800, color: "#7c3aed", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="ti ti-player-play-filled" style={{ fontSize: "13px" }}></i>
                            Message #{idx + 1}
                          </span>
                          {itemsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = itemsList.filter((_, i) => i !== idx);
                                update('sermon_items' as any, updated);
                                update('sermon_links' as any, updated.map((s: any) => s.link || ''));
                              }}
                              style={{ border: "none", background: "#fee2e2", color: "#ef4444", padding: "4px 10px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "11.5px" }}
                            >
                              <i className="ti ti-trash"></i> Remove
                            </button>
                          )}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                              Heading / Title *
                            </label>
                            <input
                              value={item.title || ''}
                              onChange={(e) => {
                                const updated = [...itemsList];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                update('sermon_items' as any, updated);
                              }}
                              placeholder="e.g. Walking in Supernatural Favor"
                              style={{ width: "100%", background: "#fff" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                              Description / Series
                            </label>
                            <input
                              value={item.description || ''}
                              onChange={(e) => {
                                const updated = [...itemsList];
                                updated[idx] = { ...updated[idx], description: e.target.value };
                                update('sermon_items' as any, updated);
                              }}
                              placeholder="e.g. Faith & Victory Series · 3 Parts"
                              style={{ width: "100%", background: "#fff" }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                            Video URL (YouTube, Vimeo, or Video Link)
                          </label>
                          <input
                            value={item.link || ''}
                            onChange={(e) => {
                              const updated = [...itemsList];
                              updated[idx] = { ...updated[idx], link: e.target.value };
                              update('sermon_items' as any, updated);
                              update('sermon_links' as any, updated.map((s: any) => s.link || ''));
                            }}
                            placeholder="https://www.youtube.com/watch?v=..."
                            style={{ width: "100%", background: "#fff" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      const current = (form as any).sermon_items && (form as any).sermon_items.length > 0
                        ? (form as any).sermon_items
                        : [{ title: '', description: '', link: '' }];
                      const updated = [...current, { title: '', description: '', link: '' }];
                      update('sermon_items' as any, updated);
                      update('sermon_links' as any, updated.map((s: any) => s.link || ''));
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1.5px dashed #a855f7", background: "#faf5ff", color: "#7e22ce", padding: "8px 16px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "4px" }}
                  >
                    <i className="ti ti-plus"></i> Add another message
                  </button>
                </div>

                {/* Subtle Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, #f1f1f5, #e5e5eb, #f1f1f5)", margin: "4px 0" }}></div>

                {/* Multi-item Education with Separate Sub-fields */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f0f1a", marginBottom: "8px" }}>
                    Education &amp; Qualifications
                  </label>
                  {(((form as any).education_items && (form as any).education_items.length > 0)
                    ? (form as any).education_items
                    : [{ degree: '', university: '' }]
                  ).map((item: { degree: string; university: string }, idx: number) => {
                    const itemsList = (form as any).education_items && (form as any).education_items.length > 0
                      ? [...(form as any).education_items]
                      : [{ degree: '', university: '' }];
                    return (
                      <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
                        <input
                          value={item.degree || ''}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx] = { ...updated[idx], degree: e.target.value };
                            update('education_items' as any, updated);
                          }}
                          placeholder="Degree / Specialization (e.g. Doctor of Ministry)"
                          style={{ flex: 1 }}
                        />
                        <input
                          value={item.university || ''}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx] = { ...updated[idx], university: e.target.value };
                            update('education_items' as any, updated);
                          }}
                          placeholder="University / College Name"
                          style={{ flex: 1 }}
                        />
                        {itemsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = itemsList.filter((_, i) => i !== idx);
                              update('education_items' as any, updated);
                            }}
                            style={{ border: "none", background: "#fee2e2", color: "#ef4444", padding: "10px 12px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      const current = (form as any).education_items || [{ degree: '', university: '' }];
                      update('education_items' as any, [...current, { degree: '', university: '' }]);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1.5px dashed #f59e0b", background: "#fffbeb", color: "#b45309", padding: "8px 16px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "2px" }}
                  >
                    <i className="ti ti-plus"></i> Add another qualification
                  </button>
                </div>

                {/* Subtle Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, #f1f1f5, #e5e5eb, #f1f1f5)", margin: "4px 0" }}></div>

                {/* Multi-item Awards with 3 Separate Fields */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f0f1a", marginBottom: "8px" }}>
                    Awards &amp; Honors
                  </label>
                  {(((form as any).award_items && (form as any).award_items.length > 0)
                    ? (form as any).award_items
                    : [{ title: '', issuer: '', year: '' }]
                  ).map((item: { title: string; issuer: string; year: string }, idx: number) => {
                    const itemsList = (form as any).award_items && (form as any).award_items.length > 0
                      ? [...(form as any).award_items]
                      : [{ title: '', issuer: '', year: '' }];
                    return (
                      <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
                        <input
                          value={item.title || ''}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            update('award_items' as any, updated);
                          }}
                          placeholder="Award Title"
                          style={{ flex: 1.5 }}
                        />
                        <input
                          value={item.issuer || ''}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx] = { ...updated[idx], issuer: e.target.value };
                            update('award_items' as any, updated);
                          }}
                          placeholder="Who / Issuer"
                          style={{ flex: 1.2 }}
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={item.year || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            const updated = [...itemsList];
                            updated[idx] = { ...updated[idx], year: val };
                            update('award_items' as any, updated);
                          }}
                          placeholder="YYYY"
                          style={{ width: "95px", flexShrink: 0, textAlign: "center" }}
                        />
                        {itemsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = itemsList.filter((_, i) => i !== idx);
                              update('award_items' as any, updated);
                            }}
                            style={{ border: "none", background: "#fee2e2", color: "#ef4444", padding: "10px 12px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      const current = (form as any).award_items || [{ title: '', issuer: '', year: '' }];
                      update('award_items' as any, [...current, { title: '', issuer: '', year: '' }]);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1.5px dashed #f43f5e", background: "#fff1f2", color: "#e11d48", padding: "8px 16px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "2px" }}
                  >
                    <i className="ti ti-plus"></i> Add another award
                  </button>
                </div>
              </div>
            </Card>

            {/* Section 3: Travel & Availability */}
            <Card
              title="Travel & Availability"
              subtitle="Let visiting hosts know your geographical reach and advance notice needs"
              icon="ti-calendar-check"
              badge="Scheduling"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
                  <Field label="Travel Range">
                    <select value={form.travel_range} onChange={(e) => update('travel_range', e.target.value)}>
                      <option>Local only</option>
                      <option>UK only</option>
                      <option>Europe</option>
                      <option>International</option>
                    </select>
                  </Field>
                  <Field label="Minimum Lead Time">
                    <select value={form.lead_time} onChange={(e) => update('lead_time', e.target.value)}>
                      <option>1 week min</option>
                      <option>2 weeks min</option>
                      <option>1 month min</option>
                      <option>3 months min</option>
                    </select>
                  </Field>
                </div>
                <Field label="Current Availability Status">
                  <select
                    value={form.availability_status}
                    onChange={(e) => update('availability_status', e.target.value as FormState['availability_status'])}
                  >
                    <option value="available">🟢 Available for Bookings & Invitations</option>
                    <option value="limited">🟡 Limited Availability (Selective Dates)</option>
                    <option value="unavailable">🔴 Not Currently Available</option>
                  </select>
                </Field>
                <Field label="Availability Note / Specific Restrictions">
                  <input
                    value={form.availability_note}
                    onChange={(e) => update('availability_note', e.target.value)}
                    placeholder='e.g. "Available for conferences and weekend revivals only"'
                  />
                </Field>
              </div>
            </Card>

            {/* Section 4: Media & Gallery Uploads */}
            <Card
              title="Profile & Ministry Media"
              subtitle="High-definition visuals build immediate trust with congregations and organizers"
              icon="ti-photo"
              badge="Visuals"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
                  <ImageUpload kind="avatar" label="Profile Photo (Portrait)" onUploaded={(url) => update('avatar_url', url)} currentUrl={form.avatar_url} />
                  <ImageUpload
                    kind="cover"
                    label="Cover Banner (Landscape)"
                    onUploaded={(url) => update('cover_photo_urls', [...form.cover_photo_urls.filter((u) => u !== url), url])}
                    currentUrl={form.cover_photo_urls[0]}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f0f1a", marginBottom: "4px" }}>
                    Ministry Gallery Photos (Multiple Images)
                  </label>
                  <p style={{ color: "#6b7280", fontSize: "12px", marginBottom: "12px" }}>
                    Select photos from your sermons, conferences, church services, and book launches.
                  </p>

                  {/* Single Big Dropzone Box */}
                  <div
                    onClick={() => document.getElementById('gallery-multi-upload')?.click()}
                    style={{
                      border: "2px dashed #cbd5e1",
                      borderRadius: "16px",
                      padding: "32px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "#f8fafc",
                      transition: "all 0.2s",
                      marginBottom: "16px"
                    }}
                    className="hover:border-purple hover:bg-purple/5"
                  >
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", color: "#64748b" }}>
                      <i className="ti ti-cloud-upload" style={{ fontSize: "24px" }}></i>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                      Click to select multiple photos
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                      Upload PNG, JPG, or WEBP images
                    </div>
                    <input
                      id="gallery-multi-upload"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;

                        const currentPhotos = [...((form as any).gallery_photo_urls || [])];
                        for (const file of files) {
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('kind', 'gallery');
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const data = await res.json();
                            if (res.ok && data.url) {
                              currentPhotos.push(data.url);
                            }
                          } catch (err) {
                            console.error('Gallery image upload failed', err);
                          }
                        }
                        update('gallery_photo_urls' as any, currentPhotos);
                      }}
                    />
                  </div>

                  {/* Selected Photos Preview Grid */}
                  {((form as any).gallery_photo_urls || []).length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "12px" }}>
                      {((form as any).gallery_photo_urls || []).map((url: string, idx: number) => (
                        <div key={idx} style={{ position: "relative", aspectRatio: "1", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Gallery ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = ((form as any).gallery_photo_urls || []).filter((_: any, i: number) => i !== idx);
                              update('gallery_photo_urls' as any, updated);
                            }}
                            style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(15, 23, 42, 0.75)", color: "#fff", border: "none", width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
                            title="Remove photo"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {submitError && <p className="text-sm text-red-600 mb-3">{submitError}</p>}
            </Card>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "28px" }}>
          {step > 1 && (
            <button onClick={() => goToStep(step - 1)} className="btn-secondary" disabled={submitting}>
              <i className="ti ti-arrow-left" style={{ fontSize: "16px" }}></i> Back
            </button>
          )}
          {step < STEPS.length ? (
            <button onClick={() => { if (validateStep(step)) goToStep(step + 1); }} className="btn-primary">
              Next Step <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? (
                <>
                  <i className="ti ti-loader-2" style={{ fontSize: "16px", animation: "spin 1s linear infinite" }}></i>
                  {isEditing ? 'Updating Profile…' : 'Processing Profile…'}
                </>
              ) : (
                <>
                  {isEditing ? 'Save & Update Profile' : 'Publish Pastor Profile'} <i className="ti ti-check" style={{ fontSize: "16px" }}></i>
                </>
              )}
            </button>
          )}
        </div>

        {/* Publishing Modal Overlay */}
        {submitting && (
          <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15,23,42,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ background: "white", borderRadius: "24px", padding: "36px 32px", maxWidth: "480px", width: "100%", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)", animation: "slideUp 0.3s ease" }}>
              
              {/* Animated Header Icon */}
              <div style={{ width: "64px", height: "64px", margin: "0 auto 20px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px -5px rgba(124,58,237,0.4)" }}>
                <i className="ti ti-loader-2" style={{ fontSize: "30px", color: "#fff", animation: "spin 1.2s linear infinite" }}></i>
              </div>

              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                {isEditing ? 'Updating Pastor Profile...' : 'Processing Your Pastor Profile...'}
              </h3>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 24px" }}>
                Please keep this page open. We are updating your information and applying the latest changes.
              </p>

              {/* Step Checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", background: "#f8fafc", padding: "18px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                {[
                  { title: "Verifying credentials & contact info", icon: "ti-user-check" },
                  { title: "Saving bio, ministry tags & languages", icon: "ti-heart-handshake" },
                  { title: "Processing sermons, education & awards", icon: "ti-certificate" },
                  { title: "Optimizing profile & gallery media", icon: "ti-photo" },
                  { title: "Finalizing public pastor profile...", icon: "ti-sparkles" },
                ].map((sItem, idx) => {
                  const isDone = currentPublishStep > idx;
                  const isCurrent = currentPublishStep === idx;
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", fontWeight: isCurrent || isDone ? 700 : 500, color: isDone ? "#15803d" : isCurrent ? "#7c3aed" : "#94a3b8", transition: "all 0.3s" }}>
                      <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: isDone ? "#dcfce7" : isCurrent ? "#f3e8ff" : "#f1f5f9", border: `1.5px solid ${isDone ? "#86efac" : isCurrent ? "#c084fc" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isDone ? (
                          <i className="ti ti-check" style={{ fontSize: "13px", color: "#16a34a" }}></i>
                        ) : isCurrent ? (
                          <i className="ti ti-loader-2" style={{ fontSize: "13px", color: "#7c3aed", animation: "spin 1s linear infinite" }}></i>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>{idx + 1}</span>
                        )}
                      </div>
                      <span>{sItem.title}</span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  iconBg?: string;
  badge?: string;
  onLoadSample?: () => void;
  children: React.ReactNode;
}

function Card({ title, subtitle, icon, iconBg, badge, onLoadSample, children }: CardProps) {
  return (
    <div className="scard" style={{
      background: "#fff",
      border: "1.5px solid #ebebf0",
      borderRadius: "20px",
      padding: "28px",
      boxShadow: "0 4px 20px -2px rgba(15,15,26,0.05)",
      overflow: "visible",
      transition: "all 0.2s ease"
    }}>
      {title && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: iconBg || "linear-gradient(135deg, #7c3aed, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: iconBg ? "0 4px 12px rgba(0,0,0,0.15)" : "0 4px 12px rgba(124, 58, 237, 0.25)",
              flexShrink: 0
            }}>
              <i className={`ti ${icon || 'ti-user'}`} style={{ fontSize: "20px", color: "#fff" }}></i>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>{title}</div>
                {badge && (
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#7c3aed",
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                    borderRadius: "20px",
                    padding: "2px 8px"
                  }}>
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <div style={{ fontSize: "12.5px", color: "var(--cn-gray)", marginTop: "3px" }}>{subtitle}</div>
              )}
            </div>
          </div>
          {onLoadSample && (
            <button
              type="button"
              onClick={onLoadSample}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "10px",
                border: "1.5px solid #d8b4fe",
                background: "#faf5ff",
                color: "#7e22ce",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <i className="ti ti-sparkles" style={{ fontSize: "14px", color: "#9333ea" }}></i>
              Load Sample Data
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "7px", display: "block" }}>
        {label} {required && <span style={{ color: "#ef4444", fontWeight: 800 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function PastorOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-loader-2" style={{ fontSize: '24px', color: '#fff', animation: 'spin 1s linear infinite' }}></i>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>Loading profile...</p>
        </div>
      </div>
    }>
      <PastorOnboardingContent />
    </Suspense>
  );
}
