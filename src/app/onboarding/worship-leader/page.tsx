"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import StepBarWL from "@/components/onboarding/worship-leader/StepBarWL";
import SharedAddressField from "@/components/add-church/steps/SharedAddressField";
import { TagInput } from "@/components/TagInput";

const ALL_LANGUAGES = [
  'English','Spanish','French','Portuguese','German','Italian','Dutch','Polish','Romanian','Hungarian',
  'Czech','Slovak','Bulgarian','Serbian','Croatian','Bosnian','Slovenian','Macedonian','Montenegrin','Albanian',
  'Greek','Turkish','Russian','Ukrainian','Belarusian','Lithuanian','Latvian','Estonian','Finnish','Swedish',
  'Norwegian','Danish','Icelandic','Irish','Welsh','Scottish Gaelic','Manx','Cornish','Breton','Catalan',
  'Basque','Galician','Luxembourgish','Frisian','Maltese','Romani','Yiddish','Ladino','Sorbian','Yoruba',
  'Igbo','Hausa','Twi','Ga','Ewe','Fante','Akan','Fula','Wolof','Mandinka',
  'Bambara','Mossi','Krio','Mende','Temne','Kanuri','Tiv','Edo','Efik','Ibibio',
  'Nupe','Kpelle','Dan','Amharic','Tigrinya','Tigre','Oromo','Somali','Afar','Harari',
  'Sidamo','Swahili','Lingala','Kikongo','Tshiluba','Kinyarwanda','Kirundi','Luganda','Runyankole','Acholi',
  'Lango','Ateso','Chichewa','Bemba','Tonga','Lozi','Nyanja','Shona','Ndebele','Zulu',
  'Xhosa','Swazi','Sesotho','Setswana','Sepedi','Tsonga','Venda','Afrikaans','Sango','Berber',
  'Tamazight','Tashelhit','Kabyle','Malagasy','Comorian','Arabic','Hebrew','Aramaic','Kurdish','Sorani',
  'Kurmanji','Farsi','Dari','Pashto','Balochi','Brahui','Luri','Persian','Azerbaijani','Armenian',
  'Georgian','Turkmen','Uzbek','Kazakh','Kyrgyz','Tajik','Uyghur','Mongolian','Tibetan','Dzongkha',
  'Urdu','Punjabi','Saraiki','Sindhi','Gujarati','Marathi','Konkani','Hindi','Bhojpuri','Maithili',
  'Awadhi','Rajasthani','Bengali','Sylheti','Chittagonian','Assamese','Odia','Tamil','Telugu','Kannada',
  'Malayalam','Tulu','Sinhala','Nepali','Newari','Santali','Kashmiri','Dogri','Manipuri','Mizo',
  'Khasi','Bodo','Garo','Naga','Dhivehi','Mandarin','Cantonese','Hakka','Hokkien','Teochew',
  'Shanghainese','Korean','Japanese','Vietnamese','Thai','Lao','Khmer','Burmese','Shan','Karen',
  'Mon','Chin','Kachin','Rohingya','Hmong','Mien','Tagalog','Cebuano','Ilocano','Hiligaynon',
  'Waray','Bikol','Kapampangan','Pangasinan','Maranao','Chavacano','Indonesian','Javanese','Sundanese','Balinese',
  'Minangkabau','Buginese','Madurese','Acehnese','Batak','Malay','Tetum','Maori','Samoan','Tongan',
  'Fijian','Hawaiian','Tahitian','Bislama','Tok Pisin','Hiri Motu','Chamorro','Marshallese','Palauan','Gilbertese',
  'Nauruan','Quechua','Aymara','Guarani','Nahuatl','Maya','Mapudungun','Haitian Creole','Papiamento','Jamaican Patois',
  'Trinidadian Creole','Cape Verdean Creole','Sranan Tongo','Garifuna','Belizean Creole'
];

export default function WorshipLeaderOnboardingPage({ initialEditSlug }: { initialEditSlug?: string }) {
  const router = useRouter();
  const isEditMode = !!initialEditSlug;

  // Multi-step state: 1 = Basics & Contact, 2 = Sound & Availability, 3 = Media & Links, 4 = Review & Publish
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState("");
  const [loadingEditData, setLoadingEditData] = useState<boolean>(isEditMode);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [currentPublishStep, setCurrentPublishStep] = useState(0);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // ---------------- STEP 1: BASICS & CONTACT ----------------
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [yearsLeading, setYearsLeading] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [coverPreview, setCoverPreview] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ---------------- STEP 2: SOUND & AVAILABILITY ----------------
  const [styles, setStyles] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [availableFor, setAvailableFor] = useState<string[]>([]);
  const [feeModel, setFeeModel] = useState<string[]>([]);
  const [travelRange, setTravelRange] = useState("UK-wide");
  const [leadTime, setLeadTime] = useState("2 weeks preferred");

  // Direct Contact & Digital Presence (matching pastor step 3)
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  const [contactErrors, setContactErrors] = useState<{ [key: string]: string }>({});
  const [contactVerified, setContactVerified] = useState<{ [key: string]: boolean }>({});

  // Options & Custom entries
  const [styleOptions, setStyleOptions] = useState<string[]>([
    "Contemporary", "Gospel", "Afro-Gospel", "Hymns", "Acoustic", "Prophetic", "Spontaneous"
  ]);
  const [instrumentOptions, setInstrumentOptions] = useState<string[]>([
    "Vocals", "Piano", "Acoustic guitar", "Electric guitar", "Bass", "Drums", "Keys"
  ]);
  const [availableOptions, setAvailableOptions] = useState<string[]>([
    "Sundays", "Events & conferences", "Worship nights", "Recordings", "Online / livestream", "Dep / cover"
  ]);
  const [feeOptions, setFeeOptions] = useState<string[]>([
    "Love offering", "Fixed fee", "Fee on request", "Expenses only"
  ]);

  // Custom addition states
  const [customStyle, setCustomStyle] = useState("");
  const [customInstrument, setCustomInstrument] = useState("");
  const [customAvailable, setCustomAvailable] = useState("");
  const [customFee, setCustomFee] = useState("");

  // Languages search & selection state (matching church onboarding Step4Languages)
  const [langSearchQuery, setLangSearchQuery] = useState("");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langContainerRef = useRef<HTMLDivElement>(null);
  const quickPickLanguages = ["English", "Spanish", "French", "Portuguese", "German", "Mandarin", "Arabic", "Hindi"];

  // Click outside listener for language dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langContainerRef.current && !langContainerRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch existing leader data when in edit mode
  useEffect(() => {
    if (!initialEditSlug) return;
    let isCancelled = false;

    async function loadLeader() {
      try {
        setLoadingEditData(true);
        const res = await fetch(`/api/worship-leaders/${initialEditSlug}`);
        if (!res.ok) throw new Error("Could not find worship leader profile");
        const json = await res.json();
        const leader = json.leader;
        if (!leader || isCancelled) return;

        // Step 1 basics
        setDisplayName(leader.display_name || "");
        setTagline(leader.tagline || "");
        setCountry(leader.country || "United Kingdom");
        setCity(leader.city || "");
        setYearsLeading(leader.years_leading ? String(leader.years_leading) : "");
        setBio(leader.bio || "");
        if (leader.avatar_url) setAvatarPreview(leader.avatar_url);
        if (leader.cover_photo_urls && leader.cover_photo_urls[0]) {
          setCoverPreview(leader.cover_photo_urls[0]);
        }
        if (leader.cover_photo_urls && leader.cover_photo_urls.length > 1) {
          setExistingPhotos(leader.cover_photo_urls.slice(1));
        }

        // Location & address details
        let parsedFromLoc = false;
        if (leader.website_url) {
          const locMatch = leader.website_url.match(/(?:^|\n)loc:([^\n]+)/);
          if (locMatch && locMatch[1]) {
            try {
              const locData = JSON.parse(decodeURIComponent(locMatch[1]));
              if (locData.address) setAddress(locData.address);
              if (locData.addressDetails) setAddressDetails(locData.addressDetails);
              if (locData.area) setArea(locData.area);
              if (locData.postcode) setPostcode(locData.postcode);
              if (locData.latitude) setLatitude(locData.latitude);
              if (locData.longitude) setLongitude(locData.longitude);
              if (locData.country) setCountry(locData.country);
              parsedFromLoc = true;
            } catch (e) {
              console.error("Failed to parse loc metadata:", e);
            }
          }
        }

        if (!parsedFromLoc) {
          if (leader.postcode) {
            setPostcode(leader.postcode);
          } else if (leader.city || leader.address) {
            // Extract UK postcode if embedded in city or address string
            const combined = `${leader.city || ""} ${leader.address || ""}`;
            const match = combined.match(/[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}/i);
            if (match) {
              setPostcode(match[0].toUpperCase());
            }
          }
          if (leader.address) {
            setAddress(leader.address);
          } else if (leader.city) {
            setAddress(leader.city);
          }
          if (leader.area) setArea(leader.area);
          if (leader.address_details) setAddressDetails(leader.address_details);
          if (leader.latitude) setLatitude(leader.latitude);
          if (leader.longitude) setLongitude(leader.longitude);
        }

        // Audio and Video urls
        if (leader.song_url) setExistingSongUrl(leader.song_url);
        if (leader.video_url) setExistingVideoUrl(leader.video_url);

        // Step 2 tags & availability
        const tags: any[] = leader.tags || [];
        const sTags = tags.filter(t => t.category === "style").map(t => t.label);
        const iTags = tags.filter(t => t.category === "instrument").map(t => t.label);
        const lTags = tags.filter(t => t.category === "language").map(t => t.label);
        const aTags = tags.filter(t => t.category === "available_for").map(t => t.label);
        const fTags = tags.filter(t => t.category === "fee_model").map(t => t.label);

        if (sTags.length) setStyles(sTags);
        if (iTags.length) setInstruments(iTags);
        if (lTags.length) setLanguages(lTags);
        if (aTags.length) setAvailableFor(aTags);
        if (fTags.length) setFeeModel(fTags);
        if (leader.travel_range) setTravelRange(leader.travel_range);
        if (leader.lead_time) setLeadTime(leader.lead_time);

        // Direct contact & links
        if (leader.email) {
          setEmail(leader.email);
          setContactVerified(prev => ({ ...prev, email: true }));
        }
        if (leader.phone) {
          setPhone(leader.phone);
          setContactVerified(prev => ({ ...prev, phone: true }));
        }
        if (leader.facebook_url) {
          setFacebookUrl(leader.facebook_url);
          setContactVerified(prev => ({ ...prev, facebook_url: true }));
        }
        if (leader.twitter_url) {
          setTwitterUrl(leader.twitter_url);
          setContactVerified(prev => ({ ...prev, twitter_url: true }));
        }
        if (leader.linkedin_url) {
          setLinkedinUrl(leader.linkedin_url);
        }
        if (leader.tiktok_url) {
          setTiktokUrl(leader.tiktok_url);
        }

        if (leader.youtube_url) setYoutubeUrl(leader.youtube_url);
        if (leader.spotify_url) setSpotifyUrl(leader.spotify_url);
        if (leader.instagram_url) setInstagramUrl(leader.instagram_url);
        if (leader.website_url) {
          const rawLines = leader.website_url.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
          const customWebs: string[] = [];
          const loadedYoutube: string[] = [];
          const loadedSpotify: string[] = [];
          for (const l of rawLines) {
            if (l.startsWith("loc:")) {
              continue; // Internal location metadata
            } else if (l.startsWith("mailto:")) {
              setEmail(l.replace(/^mailto:/i, ""));
              setContactVerified(prev => ({ ...prev, email: true }));
            } else if (l.startsWith("tel:")) {
              setPhone(l.replace(/^tel:/i, ""));
              setContactVerified(prev => ({ ...prev, phone: true }));
            } else if (l.includes("facebook.com") || l.includes("fb.com")) {
              setFacebookUrl(l);
              setContactVerified(prev => ({ ...prev, facebook_url: true }));
            } else if (l.includes("twitter.com") || l.includes("x.com")) {
              setTwitterUrl(l);
              setContactVerified(prev => ({ ...prev, twitter_url: true }));
            } else if (l.includes("linkedin.com")) {
              setLinkedinUrl(l);
            } else if (l.includes("tiktok.com")) {
              setTiktokUrl(l);
            } else if (l.includes("instagram.com")) {
              setInstagramUrl(l);
            } else if (l.includes("youtube.com") || l.includes("youtu.be")) {
              if (!leader.youtube_url) {
                setYoutubeUrl(l);
              } else if (l !== leader.youtube_url && !loadedYoutube.includes(l)) {
                loadedYoutube.push(l);
              }
            } else if (l.includes("spotify.com")) {
              if (!leader.spotify_url) {
                setSpotifyUrl(l);
              } else if (l !== leader.spotify_url && !loadedSpotify.includes(l)) {
                loadedSpotify.push(l);
              }
            } else {
              customWebs.push(l);
            }
          }
          if (loadedYoutube.length > 0) setYoutubeUrls(loadedYoutube);
          if (loadedSpotify.length > 0) setExtraSpotifyUrls(loadedSpotify);
          if (customWebs.length > 0) {
            setWebsiteUrl(customWebs[0]);
            setLinks(customWebs);
          }
        }
      } catch (e: any) {
        console.error("Error loading worship leader for edit:", e);
        setToastMsg("⚠️ Failed to load existing profile: " + e.message);
      } finally {
        if (!isCancelled) setLoadingEditData(false);
      }
    }

    loadLeader();
    return () => {
      isCancelled = true;
    };
  }, [initialEditSlug]);

  // ---------------- STEP 3: MEDIA & SAMPLE RECORDINGS ----------------
  const [songFiles, setSongFiles] = useState<{ file: File; name: string }[]>([]);
  const [videoFiles, setVideoFiles] = useState<{ file: File; name: string }[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [existingSongUrl, setExistingSongUrl] = useState<string>("");
  const [existingVideoUrl, setExistingVideoUrl] = useState<string>("");
  const [spotifyUrl, setSpotifyUrl] = useState<string>("");
  const [extraSpotifyUrls, setExtraSpotifyUrls] = useState<string[]>([]);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([""]);

  const toggleChip = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAvatarPreview("");
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCoverPreview("");
    setCoverFile(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
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

    setContactErrors(prev => ({ ...prev, [field]: errorMsg }));
    setContactVerified(prev => ({ ...prev, [field]: isVerified }));
  };

  const getContactInputStyle = (field: string) => {
    if (contactErrors[field]) return { border: "1.5px solid red", backgroundColor: "#fef2f2" };
    if (contactVerified[field]) return { border: "1.5px solid #16a34a", backgroundColor: "#f0fdf4" };
    return {};
  };

  // Helper for adding custom items to any category
  const addCustomItem = (
    val: string,
    setVal: (v: string) => void,
    options: string[],
    setOptions: React.Dispatch<React.SetStateAction<string[]>>,
    selectedList: string[],
    setSelectedList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = val.trim().replace(/\s+/g, ' ').replace(/(^|\s)(\w)/g, (m, p, c) => p + c.toUpperCase());
    if (!trimmed) return;

    if (!options.includes(trimmed)) {
      setOptions(prev => [...prev, trimmed]);
    }
    if (!selectedList.includes(trimmed)) {
      setSelectedList(prev => [...prev, trimmed]);
    }
    setVal("");
  };

  const getYouTubeEmbedUrl = (url?: string | null): string | null => {
    if (!url) return null;
    try {
      const trimmed = url.trim();
      if (trimmed.includes('youtube.com/watch')) {
        const v = new URL(trimmed).searchParams.get('v');
        return v ? `https://www.youtube.com/embed/${v}` : null;
      }
      if (trimmed.includes('youtu.be/')) {
        const id = trimmed.split('youtu.be/')[1]?.split('?')[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (trimmed.includes('youtube.com/embed/')) {
        return trimmed;
      }
    } catch {
      return null;
    }
    return null;
  };

  const getSpotifyEmbedUrl = (url?: string | null): string | null => {
    if (!url) return null;
    try {
      const trimmed = url.trim();
      if (trimmed.includes('spotify.com/embed/')) {
        return trimmed;
      }
      if (trimmed.includes('open.spotify.com/')) {
        const path = trimmed.split('open.spotify.com/')[1]?.split('?')[0];
        if (path && (path.startsWith('track/') || path.startsWith('album/') || path.startsWith('playlist/') || path.startsWith('artist/'))) {
          return `https://open.spotify.com/embed/${path}`;
        }
      }
      if (trimmed.includes('spotify.com/')) {
        return trimmed.replace('spotify.com/', 'spotify.com/embed/');
      }
    } catch {
      return null;
    }
    return null;
  };

  const getFilteredLanguages = () => {
    const q = langSearchQuery.trim().toLowerCase();
    if (!q) return ALL_LANGUAGES;
    const starts = ALL_LANGUAGES.filter(l => l.toLowerCase().startsWith(q));
    const contains = ALL_LANGUAGES.filter(l => !l.toLowerCase().startsWith(q) && l.toLowerCase().includes(q));
    return [...starts, ...contains];
  };

  const addLinkInput = () => {
    setLinks(prev => [...prev, ""]);
  };

  const updateLink = (index: number, value: string) => {
    setLinks(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const removeLink = (index: number) => {
    setLinks(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.length === 0 ? [""] : filtered;
    });
  };

  // Sample data loader matching Church Listing format
  const handleLoadSampleData = () => {
    if (currentStep === 1) {
      setDisplayName("David Okonkwo");
      setTagline("Contemporary & Afro-Gospel Worship Leader, Songwriter & Producer");
      setCountry("United Kingdom");
      setCity("London");
      setArea("Mayfair");
      setPostcode("W1J 7NT");
      setAddress("Westminster, London, UK");
      setAddressDetails("Flat 12, Victoria Mansions");
      setLatitude(51.4995);
      setLongitude(-0.1338);
      setYearsLeading("12");
      setBio("David is a passionate worship leader and songwriter with over 12 years of leading congregations in deep, spirit-led atmospheres of worship across the UK and internationally.");
      setAvatarPreview("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80");
      setCoverPreview("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop");
      setToastMsg("✨ Sample basics & bio loaded for Step 1!");
    } else if (currentStep === 2) {
      setStyles(["Contemporary", "Gospel", "Afro-Gospel", "Acoustic"]);
      setInstruments(["Vocals", "Acoustic guitar", "Piano"]);
      setLanguages(["English", "Yoruba"]);
      setAvailableFor(["Sundays", "Events & conferences", "Worship nights"]);
      setFeeModel(["Fixed fee", "Love offering"]);
      setTravelRange("UK-wide");
      setLeadTime("2 weeks preferred");
      setEmail("david.okonkwo@worshipministry.co.uk");
      setPhone("07700 900123");
      setWebsiteUrl("https://davidokonkwoministries.org");
      setFacebookUrl("https://facebook.com/davidokonkwoworship");
      setInstagramUrl("https://instagram.com/davidokonkwo_live");
      setYoutubeUrl("https://youtube.com/@davidokonkwo_worship");
      setTwitterUrl("https://x.com/davidokonkwo");
      setLinkedinUrl("https://linkedin.com/in/davidokonkwo");
      setTiktokUrl("https://tiktok.com/@davidokonkwolive");
      setContactErrors({});
      setContactVerified({
        email: true,
        phone: true,
        website_url: true,
        facebook_url: true,
        instagram_url: true,
        youtube_url: true,
        twitter_url: true,
        linkedin_url: true,
        tiktok_url: true,
      });
      setToastMsg("✨ Sample sound, availability & direct contact loaded for Step 2!");
    } else if (currentStep === 3) {
      setYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      setSpotifyUrl("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT");
      setToastMsg("✨ Sample live video & Spotify recordings loaded for Step 3!");
    } else {
      // Step 4 (Review): populate everything
      setDisplayName("David Okonkwo");
      setTagline("Contemporary & Afro-Gospel Worship Leader, Songwriter & Producer");
      setCountry("United Kingdom");
      setCity("London");
      setArea("Mayfair");
      setPostcode("W1J 7NT");
      setAddress("Westminster, London, UK");
      setAddressDetails("Flat 12, Victoria Mansions");
      setYearsLeading("12");
      setBio("David is a passionate worship leader and songwriter with over 12 years of leading congregations across the UK.");
      setAvatarPreview("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80");
      setCoverPreview("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop");
      setStyles(["Contemporary", "Gospel", "Afro-Gospel"]);
      setInstruments(["Vocals", "Acoustic guitar", "Piano"]);
      setLanguages(["English", "Yoruba"]);
      setAvailableFor(["Sundays", "Events & conferences", "Worship nights"]);
      setFeeModel(["Fixed fee", "Love offering"]);
      setTravelRange("UK-wide");
      setLeadTime("2 weeks preferred");
      setEmail("david.okonkwo@worshipministry.co.uk");
      setPhone("07700 900123");
      setWebsiteUrl("https://davidokonkwoministries.org");
      setFacebookUrl("https://facebook.com/davidokonkwoworship");
      setInstagramUrl("https://instagram.com/davidokonkwo_live");
      setYoutubeUrl("https://youtube.com/@davidokonkwo_worship");
      setTwitterUrl("https://x.com/davidokonkwo");
      setLinkedinUrl("https://linkedin.com/in/davidokonkwo");
      setTiktokUrl("https://tiktok.com/@davidokonkwolive");
      setSpotifyUrl("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT");
      setToastMsg("✨ Full sample worship leader profile loaded!");
    }

    setTimeout(() => setToastMsg(""), 4500);
  };

  // Step 1 Next validation
  const handleStep1Next = () => {
    const errors: { [key: string]: string } = {};
    if (!displayName.trim()) {
      errors.displayName = "Display name is required.";
    } else if (displayName.trim().length < 3) {
      errors.displayName = "Display name must be at least 3 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const targetId = firstErrorKey === "displayName" ? "field-displayName" : `f-${firstErrorKey}`;
      const firstErrorEl = document.getElementById(targetId);
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setFieldErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Next validation
  const handleStep2Next = () => {
    const errors: { [key: string]: string } = {};
    if (styles.length === 0) {
      errors.styles = "Please select at least 1 musical style.";
    }
    if (instruments.length === 0) {
      errors.instruments = "Please select at least 1 instrument or Vocals.";
    }

    // Direct Contact Validation (matching pastor step 3)
    const newContactErrors: { [key: string]: string } = {};
    if (!email.trim()) {
      newContactErrors.email = "Official Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newContactErrors.email = "Please enter a valid email address";
    }

    if (phone.trim() && phone.replace(/[^0-9]/g, '').length < 9) {
      newContactErrors.phone = "Phone number must be at least 9 digits";
    }

    const socialCheckList: { field: string; value: string }[] = [
      { field: "facebook_url", value: facebookUrl },
      { field: "instagram_url", value: instagramUrl },
      { field: "youtube_url", value: youtubeUrl },
      { field: "twitter_url", value: twitterUrl },
      { field: "website_url", value: websiteUrl },
    ];

    socialCheckList.forEach(({ field, value }) => {
      const v = value.trim();
      if (v && SOCIAL_RULES[field]) {
        const R = SOCIAL_RULES[field];
        const wrong = R.others.exec(v);
        if (wrong) {
          newContactErrors[field] = `That looks like a different platform link — please put your ${R.name} link here.`;
        } else if (!R.rx.test(v)) {
          newContactErrors[field] = `Enter a valid ${R.name} link (e.g. ${R.ex}).`;
        }
      }
    });

    if (Object.keys(newContactErrors).length > 0) {
      setContactErrors(newContactErrors);
      errors.contact = "Please check direct contact & social media errors.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (newContactErrors.email) {
        const el = document.getElementById("field-email");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setFieldErrors({});
    setContactErrors({});
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3 Next validation
  const handleStep3Next = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Publish Handler
  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    setCurrentPublishStep(0);

    const stepInterval = setInterval(() => {
      setCurrentPublishStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    let finalAvatarUrl = avatarPreview.startsWith("http") && !avatarPreview.startsWith("blob") ? avatarPreview : "";
    let finalSongUrl = existingSongUrl || "";
    let finalVideoUrl = existingVideoUrl || "";
    const finalPhotoUrls: string[] = [...existingPhotos];

    const uploadFile = async (file: File, kind: string) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          return data.url;
        }
      } catch (e) {
        console.error(`${kind} upload failed`, e);
      }
      return null;
    };

    if (avatarFile) {
      const uploaded = await uploadFile(avatarFile, "avatar");
      if (uploaded) finalAvatarUrl = uploaded;
    }
    for (const song of songFiles) {
      const url = await uploadFile(song.file, "song");
      if (url) finalSongUrl = url;
    }
    for (const vid of videoFiles) {
      const url = await uploadFile(vid.file, "video");
      if (url) finalVideoUrl = url;
    }
    let finalCoverUrl = coverPreview.startsWith("http") && !coverPreview.startsWith("blob") ? coverPreview : "";
    if (coverFile) {
      const uploaded = await uploadFile(coverFile, "cover");
      if (uploaded) finalCoverUrl = uploaded;
    }
    if (finalCoverUrl) {
      finalPhotoUrls.unshift(finalCoverUrl);
    }

    for (const photo of photoFiles) {
      const url = await uploadFile(photo, "gallery");
      if (url) finalPhotoUrls.push(url);
    }


    const validLinks = links
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => (l.startsWith("http://") || l.startsWith("https://") ? l : `https://${l}`));

    const finalSpotify = spotifyUrl.trim() 
      ? (spotifyUrl.trim().startsWith("http") ? spotifyUrl.trim() : `https://${spotifyUrl.trim()}`) 
      : (validLinks.find(l => l.includes("spotify")) || undefined);

    const finalYoutube = youtubeUrl.trim() 
      ? (youtubeUrl.trim().startsWith("http") ? youtubeUrl.trim() : `https://${youtubeUrl.trim()}`) 
      : (validLinks.find(l => l.includes("youtube") || l.includes("youtu.be")) || undefined);

    const finalInstagram = instagramUrl.trim() 
      ? (instagramUrl.trim().startsWith("http") ? instagramUrl.trim() : `https://${instagramUrl.trim()}`) 
      : (validLinks.find(l => l.includes("instagram")) || undefined);

    const validYoutubeUrls = youtubeUrls
      .map(u => u.trim())
      .filter(Boolean)
      .map(u => (u.startsWith("http") ? u : `https://${u}`))
      .filter(u => u !== finalYoutube);

    const validExtraSpotifyUrls = extraSpotifyUrls
      .map(u => u.trim())
      .filter(Boolean)
      .map(u => (u.startsWith("http") ? u : `https://${u}`))
      .filter(u => u !== finalSpotify);

    const otherLinks = validLinks.filter(l => !l.includes("spotify") && !l.includes("youtube") && !l.includes("youtu.be") && !l.includes("instagram"));

    // Serialize address & map coordinates so returning to edit perfectly restores every single field
    const locMeta = `loc:${encodeURIComponent(JSON.stringify({
      address: address.trim(),
      addressDetails: addressDetails.trim(),
      area: area.trim(),
      postcode: postcode.trim(),
      city: city.trim(),
      country: country.trim(),
      latitude,
      longitude,
    }))}`;

    const bundledSiteLinks: string[] = [];
    if (websiteUrl.trim()) {
      bundledSiteLinks.push(websiteUrl.trim().startsWith("http") ? websiteUrl.trim() : `https://${websiteUrl.trim()}`);
    }
    bundledSiteLinks.push(...validYoutubeUrls);
    bundledSiteLinks.push(...validExtraSpotifyUrls);
    bundledSiteLinks.push(...otherLinks);
    bundledSiteLinks.push(locMeta);

    const finalWebsite = bundledSiteLinks.length > 0 ? Array.from(new Set(bundledSiteLinks)).join("\n") : undefined;

    const payload = {
      display_name: displayName.trim(),
      tagline: tagline.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || "United Kingdom",
      years_leading: parseInt(yearsLeading) || 0,
      bio: bio.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      styles,
      instruments,
      languages,
      available_for: availableFor,
      fee_model: feeModel,
      travel_range: travelRange,
      lead_time: leadTime,
      avatar_url: finalAvatarUrl || undefined,
      song_url: finalSongUrl || undefined,
      video_url: finalVideoUrl || undefined,
      cover_photo_urls: finalPhotoUrls,
      spotify_url: finalSpotify,
      youtube_url: finalYoutube,
      instagram_url: finalInstagram,
      facebook_url: facebookUrl.trim() || undefined,
      twitter_url: twitterUrl.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      tiktok_url: tiktokUrl.trim() || undefined,
      website_url: finalWebsite,
    };

    try {
      const endpoint = initialEditSlug ? `/api/worship-leaders/${initialEditSlug}` : "/api/worship-leaders";
      const method = initialEditSlug ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${initialEditSlug ? "update" : "create"} worship leader profile`);
      }

      setCurrentPublishStep(4);
      clearInterval(stepInterval);
      router.push(`/worship-leader/${initialEditSlug || data.slug}?owner=true`);
    } catch (err: any) {
      clearInterval(stepInterval);
      setSubmitError(err.message || "An unexpected error occurred while publishing.");
      setSubmitting(false);
    }
  };

  // Profile strength calculation for Review Step
  const strengthFields = [
    { label: "Display name", pts: 15, done: !!displayName.trim() },
    { label: "City & Location", pts: 15, done: !!city.trim() },
    { label: "Profile photo", pts: 10, done: !!avatarPreview },
    { label: "Cover photo", pts: 10, done: !!coverPreview },
    { label: "Musical styles", pts: 15, done: styles.length > 0 },
    { label: "Instruments", pts: 10, done: instruments.length > 0 },
    { label: "Languages", pts: 10, done: languages.length > 0 },
    { label: "Availability", pts: 5, done: availableFor.length > 0 },
    { label: "Bio / About", pts: 5, done: !!bio.trim() },
    { label: "Audio / Video or Links", pts: 5, done: Boolean(
      songFiles.length > 0 ||
      videoFiles.length > 0 ||
      (spotifyUrl && spotifyUrl.trim()) ||
      (youtubeUrl && youtubeUrl.trim()) ||
      (websiteUrl && websiteUrl.trim()) ||
      (existingSongUrl && existingSongUrl.trim()) ||
      (existingVideoUrl && existingVideoUrl.trim()) ||
      links.some(l => !!l.trim())
    ) },
  ];
  const totalPoints = strengthFields.reduce((sum, f) => sum + f.pts, 0);
  const earnedPoints = strengthFields.filter(f => f.done).reduce((sum, f) => sum + f.pts, 0);
  const scorePercent = Math.round((earnedPoints / totalPoints) * 100);

  const filteredLanguages = getFilteredLanguages();

  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative" }}>
      <TopNav />

      {/* Top Header matching Church Listing Format */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="brand-mark" style={{ background: "linear-gradient(135deg, #f43f5e, #7c3aed)" }}>
              <i className="ti ti-microphone-2" style={{ fontSize: "18px", color: "#fff" }}></i>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>
                {isEditMode ? "Edit Worship Leader Profile" : "Add Worship Leader Profile"}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--cn-gray)" }}>
                {currentStep === 4 ? (isEditMode ? "Review & Save" : "Review & Publish") : `Step ${currentStep} of 3`}
              </div>
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
              title={`Pre-fill Step ${currentStep} with sample worship leader details`}
            >
              <i className="ti ti-sparkles" style={{ fontSize: "16px", color: "#9333ea" }}></i>
              Load Sample Data
            </button>
            <button className="btn-secondary" onClick={() => router.push("/add-listing")}>
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
            marginBottom: "20px",
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

        {/* Step Bar (Church Listing StepBar style) */}
        <div style={{ marginBottom: "44px" }}>
          <StepBarWL 
            currentStep={currentStep} 
            onStepClick={(s) => {
              if (s < currentStep || currentStep === 4) setCurrentStep(s);
            }} 
          />
        </div>

        {/* ================= STEP 1: BASICS & LOCATION ================= */}
        {currentStep === 1 && (
          <div className="step-content slide-up">
            {/* PROFILE BASICS CARD */}
            <div className="scard">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #a855f7, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-user" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Profile Basics</div>
              </div>

              {/* Photos: Cover Photo Banner & Avatar / Headshot */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px", marginBottom: "26px", alignItems: "start" }}>
                {/* 1. Cover Photo / Hero Banner */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--cn-ink)" }}>
                      Cover Photo / Hero Banner
                    </div>
                    {coverPreview && (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: "10px" }}>
                        Uploaded
                      </span>
                    )}
                  </div>

                  <div style={{ position: "relative" }}>
                    <label
                      className="cover-upload-box"
                      style={{
                        height: "120px",
                        width: "100%",
                        borderRadius: "16px",
                        background: coverPreview
                          ? `url('${coverPreview}') center/cover`
                          : "linear-gradient(135deg, rgba(244,63,94,.08), rgba(124,58,237,.08))",
                        border: "2px dashed #cbd5e1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        color: "#7c3aed",
                        cursor: "pointer",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                        position: "relative",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleCoverChange}
                      />
                      {!coverPreview && (
                        <>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                            <i className="ti ti-photo-up"></i>
                          </div>
                          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--cn-ink)" }}>
                            Upload Cover Photo
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--cn-gray)" }}>
                            Wide banner photo for your hero header
                          </span>
                        </>
                      )}

                      {/* Hover Overlay when cover is present */}
                      {coverPreview && (
                        <div
                          className="cover-overlay"
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgba(15, 23, 42, 0.65)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: 700,
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                          }}
                        >
                          <i className="ti ti-photo-edit" style={{ fontSize: "22px" }}></i>
                          <span>Change Cover Photo</span>
                        </div>
                      )}
                    </label>

                    {/* Remove '×' button on top-right */}
                    {coverPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        title="Remove cover photo"
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#ef4444",
                          color: "#fff",
                          border: "2px solid #fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: 800,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                          zIndex: 10,
                          transition: "transform 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        <i className="ti ti-x"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Profile Photo / Headshot */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--cn-ink)" }}>
                      Profile Photo / Headshot
                    </div>
                    {avatarPreview && (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: "10px" }}>
                        Uploaded
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ position: "relative" }}>
                      <label 
                        className="avatar-upload-box"
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "20px",
                          background: avatarPreview ? `url('${avatarPreview}') center/cover` : "linear-gradient(135deg, rgba(244,63,94,.08), rgba(124,58,237,.08))",
                          border: "2px dashed #cbd5e1",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          color: "#7c3aed",
                          cursor: "pointer",
                          overflow: "hidden",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                          position: "relative",
                          transition: "all 0.2s"
                        }}
                      >
                        <input 
                          ref={avatarInputRef}
                          type="file" 
                          accept="image/*" 
                          style={{ display: "none" }} 
                          onChange={handleAvatarChange} 
                        />
                        {!avatarPreview && (
                          <>
                            <i className="ti ti-camera-plus" style={{ fontSize: "24px" }}></i>
                            <span style={{ fontSize: "11px", fontWeight: 700 }}>Upload DP</span>
                          </>
                        )}

                        {/* Hover Overlay when image is uploaded */}
                        {avatarPreview && (
                          <div 
                            className="avatar-overlay"
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: "rgba(15, 23, 42, 0.65)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "2px",
                              color: "#fff",
                              fontSize: "11px",
                              fontWeight: 700,
                              opacity: 0,
                              transition: "opacity 0.2s ease",
                            }}
                          >
                            <i className="ti ti-camera" style={{ fontSize: "20px" }}></i>
                            <span>Change</span>
                          </div>
                        )}
                      </label>

                      {/* Remove '×' button on top-right */}
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          title="Remove profile picture"
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "#ef4444",
                            color: "#fff",
                            border: "2px solid #fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: 800,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                            zIndex: 10,
                            transition: "transform 0.15s ease"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                          <i className="ti ti-x"></i>
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: "12px", color: "var(--cn-gray)", lineHeight: 1.4 }}>
                      Square headshot or portrait photo for your avatar badge across directories.
                    </div>
                  </div>
                </div>
              </div>


              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "16px" }}>
                <div>
                  <label>
                    Display Name <span style={{ color: "#ef4444", fontWeight: 800 }}>*</span>
                  </label>
                  <input
                    id="field-displayName"
                    placeholder="e.g. David Okonkwo"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (fieldErrors.displayName) setFieldErrors(prev => ({ ...prev, displayName: "" }));
                    }}
                    style={{ border: fieldErrors.displayName ? "1.5px solid red" : "" }}
                  />
                  {fieldErrors.displayName && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.displayName}</div>
                  )}
                </div>

                <div>
                  <label>Years of Ministry Experience</label>
                  <input
                    type="number"
                    placeholder="e.g. 8"
                    value={yearsLeading}
                    onChange={(e) => setYearsLeading(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label>Professional Tagline</label>
                <input
                  placeholder="e.g. Worship leader, songwriter & recording artist"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div>
                <label>Short Bio & Ministry Calling</label>
                <textarea
                  rows={4}
                  placeholder="Tell churches about your heart for worship, ministry background, and vision..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>

            {/* LOCATION CARD: FULL ADDRESS SEARCH FIRST, FOLLOWED BY CITY & COUNTRY (AUTOFILLED) */}
            <div className="scard" style={{ overflow: "visible" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #fb7185, #f43f5e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-map-pin" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Location & Base City</div>
              </div>

              {/* Full Address search & pin on map comes first */}
              <div style={{ marginBottom: "18px" }}>
                <SharedAddressField
                  idPrefix="wl"
                  country={country}
                  address={address}
                  latitude={latitude}
                  longitude={longitude}
                  onUpdateCountry={(c) => {
                    if (c) setCountry(c);
                  }}
                  onUpdateAddress={setAddress}
                  onUpdateCity={(c) => {
                    if (c) {
                      setCity(c);
                    }
                  }}
                  onLocationSelected={(details) => {
                    if (details.city) {
                      setCity(details.city);
                    }
                    if (details.area) {
                      setArea(details.area);
                    }
                    if (details.postcode) {
                      setPostcode(details.postcode);
                    }
                    if (details.country) {
                      setCountry(details.country);
                    }
                  }}
                  onUpdateCoordinates={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button onClick={handleStep1Next} className="btn-primary">
                Next — Sound & Availability <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SOUND & AVAILABILITY ================= */}
        {currentStep === 2 && (
          <div className="step-content slide-up" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* Thematic Card 1: Your Sound & Style */}
            <Card
              title="Your Sound & Style"
              subtitle="Highlight your musical genres, vocal role, and instruments played"
              icon="ti-music"
              iconBg="linear-gradient(135deg, #f43f5e, #db2777)"
              badge="Sound & Style"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <Field label="Musical Styles" required>
                  <TagInput
                    value={styles}
                    onChange={(v) => {
                      setStyles(v);
                      if (fieldErrors.styles) setFieldErrors(prev => ({ ...prev, styles: '' }));
                    }}
                    placeholder="Type a style (e.g. Contemporary, Afro-Gospel) and press Enter..."
                    suggestions={styleOptions}
                    labelPrefix="SELECTED STYLES"
                  />
                  {fieldErrors.styles && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "6px" }}>{fieldErrors.styles}</div>
                  )}
                </Field>

                {/* Subtle Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, #f1f1f5, #e5e5eb, #f1f1f5)", margin: "4px 0" }}></div>

                <Field label="Instruments & Vocals" required>
                  <TagInput
                    value={instruments}
                    onChange={(v) => {
                      setInstruments(v);
                      if (fieldErrors.instruments) setFieldErrors(prev => ({ ...prev, instruments: '' }));
                    }}
                    placeholder="Type an instrument (e.g. Vocals, Acoustic guitar, Piano) and press Enter..."
                    suggestions={instrumentOptions}
                    labelPrefix="SELECTED INSTRUMENTS & VOCALS"
                  />
                  {fieldErrors.instruments && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "6px" }}>{fieldErrors.instruments}</div>
                  )}
                </Field>
              </div>
            </Card>

            {/* Thematic Card 2: Languages Spoken / Leading Worship */}
            <Card
              title="Languages Spoken"
              subtitle="Select languages services are held in or interpreted into"
              icon="ti-language"
              iconBg="linear-gradient(135deg, #a78bfa, #7c3aed)"
              badge="Languages"
            >
              <Field label="Languages you lead worship in">
                <TagInput
                  value={languages}
                  onChange={(v) => {
                    setLanguages(v);
                    if (fieldErrors.languages) setFieldErrors(prev => ({ ...prev, languages: '' }));
                  }}
                  placeholder="Search or type 250+ languages (e.g. Yoruba, Swahili, Spanish) and press Enter..."
                  suggestions={quickPickLanguages}
                  labelPrefix="SELECTED LANGUAGES"
                />
              </Field>
            </Card>

            {/* Thematic Card 3: Availability & Booking Details */}
            <Card
              title="Availability & Booking Details"
              subtitle="Define what events you can minister at, your travel radius, and honorarium preferences"
              icon="ti-calendar-check"
              iconBg="linear-gradient(135deg, #2dd4bf, #0891b2)"
              badge="Booking"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <Field label="Available For Engagements">
                  <TagInput
                    value={availableFor}
                    onChange={(v) => setAvailableFor(v)}
                    placeholder="Type event type (e.g. Sundays, Worship nights, Conferences) and press Enter..."
                    suggestions={availableOptions}
                    labelPrefix="SELECTED AVAILABLE FOR"
                  />
                </Field>

                {/* Subtle Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, #f1f1f5, #e5e5eb, #f1f1f5)", margin: "4px 0" }}></div>

                {/* Travel & Notice row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "7px", display: "block" }}>
                      Travel Range
                    </label>
                    <select value={travelRange} onChange={(e) => setTravelRange(e.target.value)}>
                      <option>My city only</option>
                      <option>Within 1 hour</option>
                      <option>UK-wide</option>
                      <option>International</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "7px", display: "block" }}>
                      Notice / Lead Time
                    </label>
                    <select value={leadTime} onChange={(e) => setLeadTime(e.target.value)}>
                      <option>Any notice</option>
                      <option>2 weeks preferred</option>
                      <option>1 month+</option>
                    </select>
                  </div>
                </div>

                {/* Subtle Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, #f1f1f5, #e5e5eb, #f1f1f5)", margin: "4px 0" }}></div>

                {/* Fee Model using TagInput format */}
                <Field label="Honorarium / Fee Preference">
                  <TagInput
                    value={feeModel}
                    onChange={(v) => setFeeModel(v)}
                    placeholder="Type honorarium preference (e.g. Love offering, Fixed fee) and press Enter..."
                    suggestions={feeOptions}
                    labelPrefix="SELECTED PREFERENCES"
                  />
                </Field>
              </div>
            </Card>

            {/* Thematic Card 4: Direct Contact & Digital Presence (Same as Pastor Step 3) */}
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
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          validateSocialField('email', e.target.value);
                        }}
                        style={{ ...getContactInputStyle('email'), paddingLeft: "42px" }}
                        placeholder="pastor@church.co.uk"
                      />
                      <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--cn-purple)", pointerEvents: "none" }}>
                        <i className="ti ti-mail" style={{ fontSize: "17px" }}></i>
                      </div>
                    </div>
                    {contactErrors.email && (
                      <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                        <span>{contactErrors.email}</span>
                      </div>
                    )}
                  </Field>

                  <Field label="Phone / WhatsApp Contact">
                    <div style={{ position: "relative" }}>
                      <input
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d\s\+\-\(\)]/g, '');
                          setPhone(val);
                          validateSocialField('phone', val);
                        }}
                        style={{ ...getContactInputStyle('phone'), paddingLeft: "42px" }}
                        placeholder="07700 900123"
                      />
                      <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#16a34a", pointerEvents: "none" }}>
                        <i className="ti ti-brand-whatsapp" style={{ fontSize: "18px" }}></i>
                      </div>
                    </div>
                    {contactErrors.phone && (
                      <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                        <span>{contactErrors.phone}</span>
                      </div>
                    )}
                  </Field>
                </div>

                <Field label="Personal Website / Blog">
                  <div style={{ position: "relative" }}>
                    <input
                      value={websiteUrl}
                      onChange={(e) => {
                        setWebsiteUrl(e.target.value);
                        validateSocialField('website_url', e.target.value);
                      }}
                      style={{ ...getContactInputStyle('website_url'), paddingLeft: "42px" }}
                      placeholder="https://yourwebsite.com"
                    />
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--cn-purple)", pointerEvents: "none" }}>
                      <i className="ti ti-world" style={{ fontSize: "17px" }}></i>
                    </div>
                  </div>
                  {contactErrors.website_url && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i>
                      <span>{contactErrors.website_url}</span>
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
                        value={facebookUrl}
                        onFocus={() => { if (!facebookUrl) setFacebookUrl('https://facebook.com/'); }}
                        onChange={(e) => {
                          setFacebookUrl(e.target.value);
                          validateSocialField('facebook_url', e.target.value);
                        }}
                        style={getContactInputStyle('facebook_url')}
                        placeholder="facebook.com/yourprofile"
                      />
                      {contactErrors.facebook_url && <p style={{ color: "red", fontSize: "11.5px", marginTop: "4px" }}>{contactErrors.facebook_url}</p>}
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>Instagram</label>
                      <input
                        value={instagramUrl}
                        onFocus={() => { if (!instagramUrl) setInstagramUrl('https://instagram.com/'); }}
                        onChange={(e) => {
                          setInstagramUrl(e.target.value);
                          validateSocialField('instagram_url', e.target.value);
                        }}
                        style={getContactInputStyle('instagram_url')}
                        placeholder="instagram.com/yourhandle or @handle"
                      />
                      {contactErrors.instagram_url && <p style={{ color: "red", fontSize: "11.5px", marginTop: "4px" }}>{contactErrors.instagram_url}</p>}
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>YouTube</label>
                      <input
                        value={youtubeUrl}
                        onFocus={() => { if (!youtubeUrl) setYoutubeUrl('https://youtube.com/'); }}
                        onChange={(e) => {
                          setYoutubeUrl(e.target.value);
                          validateSocialField('youtube_url', e.target.value);
                        }}
                        style={getContactInputStyle('youtube_url')}
                        placeholder="youtube.com/@yourchannel"
                      />
                      {contactErrors.youtube_url && <p style={{ color: "red", fontSize: "11.5px", marginTop: "4px" }}>{contactErrors.youtube_url}</p>}
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>X / Twitter</label>
                      <input
                        value={twitterUrl}
                        onFocus={() => { if (!twitterUrl) setTwitterUrl('https://twitter.com/'); }}
                        onChange={(e) => {
                          setTwitterUrl(e.target.value);
                          validateSocialField('twitter_url', e.target.value);
                        }}
                        style={getContactInputStyle('twitter_url')}
                        placeholder="twitter.com/yourhandle or @handle"
                      />
                      {contactErrors.twitter_url && <p style={{ color: "red", fontSize: "11.5px", marginTop: "4px" }}>{contactErrors.twitter_url}</p>}
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>LinkedIn</label>
                      <input
                        value={linkedinUrl}
                        onFocus={() => { if (!linkedinUrl) setLinkedinUrl('https://linkedin.com/in/'); }}
                        onChange={(e) => {
                          setLinkedinUrl(e.target.value);
                          validateSocialField('linkedin_url', e.target.value);
                        }}
                        style={getContactInputStyle('linkedin_url')}
                        placeholder="linkedin.com/in/yourprofile"
                      />
                      {contactErrors.linkedin_url && <p style={{ color: "red", fontSize: "11.5px", marginTop: "4px" }}>{contactErrors.linkedin_url}</p>}
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-gray)" }}>TikTok</label>
                      <input
                        value={tiktokUrl}
                        onFocus={() => { if (!tiktokUrl) setTiktokUrl('https://tiktok.com/@'); }}
                        onChange={(e) => {
                          setTiktokUrl(e.target.value);
                          validateSocialField('tiktok_url', e.target.value);
                        }}
                        style={getContactInputStyle('tiktok_url')}
                        placeholder="tiktok.com/@yourhandle"
                      />
                      {contactErrors.tiktok_url && <p style={{ color: "red", fontSize: "11.5px", marginTop: "4px" }}>{contactErrors.tiktok_url}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Back
              </button>
              <button onClick={handleStep2Next} className="btn-primary">
                Next — Media & Recordings <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: MEDIA & SAMPLE RECORDINGS ================= */}
        {currentStep === 3 && (
          <div className="step-content slide-up" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Card 1: Featured Worship Video / Stream */}
            <Card
              icon="ti-video"
              iconBg="linear-gradient(135deg, #ef4444, #dc2626)"
              title="Live Worship Video / Featured Stream"
              subtitle="Add a YouTube video link of you leading worship live, acoustic sessions, or ministry services."
            >
              <Field
                label="YouTube Video or Stream URL"
                hint="Supports full YouTube watch URLs or youtu.be shortlinks."
              >
                <div style={{ position: "relative" }}>
                  <input
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    style={{
                      paddingLeft: "42px",
                      borderColor: youtubeUrl ? (getYouTubeEmbedUrl(youtubeUrl) ? "#10b981" : "#f59e0b") : "var(--cn-border)",
                    }}
                  />
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#ef4444", fontSize: "19px" }}>
                    <i className="ti ti-brand-youtube"></i>
                  </span>
                  {youtubeUrl && (
                    <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>
                      {getYouTubeEmbedUrl(youtubeUrl) ? (
                        <i className="ti ti-circle-check-filled" style={{ color: "#10b981" }} title="Valid YouTube video"></i>
                      ) : (
                        <i className="ti ti-alert-triangle" style={{ color: "#f59e0b" }} title="Please enter a valid YouTube watch/stream URL"></i>
                      )}
                    </span>
                  )}
                </div>
              </Field>

              {/* YouTube Live Embed Preview */}
              {youtubeUrl && getYouTubeEmbedUrl(youtubeUrl) && (
                <div style={{ marginTop: "14px", background: "#f8fafc", borderRadius: "14px", padding: "12px", border: "1px solid var(--cn-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#16a34a", marginBottom: "8px" }}>
                    <i className="ti ti-circle-check-filled"></i> Video embed preview is active
                  </div>
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "10px", background: "#000" }}>
                    <iframe
                      src={getYouTubeEmbedUrl(youtubeUrl) || ""}
                      title="YouTube Preview"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Additional YouTube Video / Stream Links */}
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--cn-border)", paddingTop: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", margin: 0 }}>
                    Additional YouTube Videos or Live Streams
                  </label>
                  <button
                    type="button"
                    onClick={() => setYoutubeUrls(prev => [...prev, ""])}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <i className="ti ti-plus"></i> Add Another Video
                  </button>
                </div>

                {youtubeUrls.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {youtubeUrls.map((yt, idx) => {
                      const embed = getYouTubeEmbedUrl(yt);
                      return (
                        <div key={`extra-yt-${idx}`} style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#fafafa", padding: "10px", borderRadius: "12px", border: "1px solid var(--cn-border)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ position: "relative", flex: 1 }}>
                              <input
                                placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                                value={yt}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setYoutubeUrls(prev => {
                                    const copy = [...prev];
                                    copy[idx] = val;
                                    return copy;
                                  });
                                }}
                                style={{ width: "100%", paddingLeft: "36px", borderColor: yt ? (embed ? "#10b981" : "#f59e0b") : "var(--cn-border)" }}
                              />
                              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#ef4444", fontSize: "16px" }}>
                                <i className="ti ti-brand-youtube"></i>
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setYoutubeUrls(prev => prev.filter((_, i) => i !== idx))}
                              style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              title="Remove video link"
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
                          {yt && embed && (
                            <div style={{ position: "relative", paddingBottom: "45%", height: 0, overflow: "hidden", borderRadius: "8px", background: "#000" }}>
                              <iframe
                                src={embed}
                                title={`YouTube Preview ${idx + 1}`}
                                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Direct Video File Upload */}
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--cn-border)", paddingTop: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--cn-ink)", display: "block", marginBottom: "6px" }}>
                  Or upload direct video clip (MP4, WebM)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "8px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "var(--cn-ink)" }}>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files).map(f => ({ file: f, name: f.name }));
                          setVideoFiles(prev => [...prev, ...newFiles]);
                        }
                      }}
                    />
                    <i className="ti ti-upload" style={{ color: "#db2777" }}></i> Select Video Files
                  </label>
                  {videoFiles.length > 0 && (
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#9d174d", background: "#fdf2f8", padding: "4px 10px", borderRadius: "12px", border: "1px solid #fbcfe8" }}>
                      {videoFiles.length} video file{videoFiles.length > 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
                {videoFiles.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                    {videoFiles.map((v, idx) => (
                      <span key={`vid-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fdf2f8", border: "1px solid #fbcfe8", color: "#9d174d", fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "14px" }}>
                        <i className="ti ti-video"></i>
                        <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                        <button type="button" onClick={() => setVideoFiles(prev => prev.filter((_, i) => i !== idx))} style={{ border: "none", background: "none", color: "#9d174d", cursor: "pointer", fontWeight: 800 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Card 2: Music & Audio Recordings (Spotify & Audio Files) */}
            <Card
              icon="ti-music"
              iconBg="linear-gradient(135deg, #10b981, #059669)"
              title="Music & Streaming Recordings"
              subtitle="Link your Spotify tracks, EP, or albums, and upload direct audio demos so churches can hear your vocal timbre."
            >
              <Field
                label="Primary Spotify Song, Album or Artist Link"
                hint="Paste a link to your track (e.g. open.spotify.com/track/...) or artist profile for instant church playback."
              >
                <div style={{ position: "relative" }}>
                  <input
                    placeholder="e.g. https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    style={{
                      paddingLeft: "42px",
                      borderColor: spotifyUrl ? (getSpotifyEmbedUrl(spotifyUrl) ? "#10b981" : "var(--cn-border)") : "var(--cn-border)",
                    }}
                  />
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#10b981", fontSize: "19px" }}>
                    <i className="ti ti-brand-spotify"></i>
                  </span>
                  {spotifyUrl && (
                    <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>
                      {getSpotifyEmbedUrl(spotifyUrl) ? (
                        <i className="ti ti-circle-check-filled" style={{ color: "#10b981" }} title="Spotify player will embed"></i>
                      ) : (
                        <i className="ti ti-circle-check" style={{ color: "#10b981" }} title="Valid Spotify Link"></i>
                      )}
                    </span>
                  )}
                </div>
              </Field>

              {/* Spotify Live Embed Preview */}
              {spotifyUrl && getSpotifyEmbedUrl(spotifyUrl) && (
                <div style={{ marginTop: "14px", background: "#f8fafc", borderRadius: "14px", padding: "12px", border: "1px solid var(--cn-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#10b981", marginBottom: "8px" }}>
                    <i className="ti ti-brand-spotify"></i> Spotify Player Preview
                  </div>
                  <div style={{ borderRadius: "12px", overflow: "hidden" }}>
                    <iframe
                      src={getSpotifyEmbedUrl(spotifyUrl) || ""}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Additional Spotify Links */}
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--cn-border)", paddingTop: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", margin: 0 }}>
                    Additional Spotify Songs / Albums / Playlists
                  </label>
                  <button
                    type="button"
                    onClick={() => setExtraSpotifyUrls(prev => [...prev, ""])}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#ecfdf5",
                      color: "#059669",
                      border: "1px solid #a7f3d0",
                      borderRadius: "8px",
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <i className="ti ti-plus"></i> Add Another Track
                  </button>
                </div>

                {extraSpotifyUrls.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {extraSpotifyUrls.map((sp, idx) => {
                      const embed = getSpotifyEmbedUrl(sp);
                      return (
                        <div key={`extra-sp-${idx}`} style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#f8fafc", padding: "10px", borderRadius: "12px", border: "1px solid var(--cn-border)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ position: "relative", flex: 1 }}>
                              <input
                                placeholder="https://open.spotify.com/track/..."
                                value={sp}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExtraSpotifyUrls(prev => {
                                    const copy = [...prev];
                                    copy[idx] = val;
                                    return copy;
                                  });
                                }}
                                style={{ width: "100%", paddingLeft: "36px", borderColor: sp ? (embed ? "#10b981" : "var(--cn-border)") : "var(--cn-border)" }}
                              />
                              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#10b981", fontSize: "16px" }}>
                                <i className="ti ti-brand-spotify"></i>
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExtraSpotifyUrls(prev => prev.filter((_, i) => i !== idx))}
                              style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              title="Remove link"
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
                          {sp && embed && (
                            <div style={{ borderRadius: "10px", overflow: "hidden" }}>
                              <iframe
                                src={embed}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Direct Audio Files Upload */}
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--cn-border)", paddingTop: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--cn-ink)", display: "block", marginBottom: "6px" }}>
                  Upload Audio Demo Tracks (MP3, WAV, M4A)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "8px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "var(--cn-ink)" }}>
                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files).map(f => ({ file: f, name: f.name }));
                          setSongFiles(prev => [...prev, ...newFiles]);
                        }
                      }}
                    />
                    <i className="ti ti-music" style={{ color: "#0891b2" }}></i> Select Audio Tracks
                  </label>
                  {songFiles.length > 0 && (
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#065f46", background: "#ecfdf5", padding: "4px 10px", borderRadius: "12px", border: "1px solid #a7f3d0" }}>
                      {songFiles.length} song{songFiles.length > 1 ? "s" : ""} added
                    </span>
                  )}
                </div>
                {songFiles.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                    {songFiles.map((s, idx) => (
                      <span key={`song-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "14px" }}>
                        <i className="ti ti-headphones"></i>
                        <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                        <button type="button" onClick={() => setSongFiles(prev => prev.filter((_, i) => i !== idx))} style={{ border: "none", background: "none", color: "#065f46", cursor: "pointer", fontWeight: 800 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Card 3: Additional Streaming & Music Links */}
            <Card
              icon="ti-link"
              iconBg="linear-gradient(135deg, #a855f7, #7c3aed)"
              title="Additional Music & Platform Links"
              subtitle="Add links to Soundcloud, Bandcamp, Apple Music, or other ministry profiles where church teams can hear more."
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", margin: 0 }}>
                    Additional Music Links (Apple Music, SoundCloud, Bandcamp, etc.)
                  </label>
                  <button
                    type="button"
                    onClick={addLinkInput}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#f1f5f9",
                      color: "var(--cn-ink)",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <i className="ti ti-plus"></i> Add Link
                  </button>
                </div>

                {links.length === 0 ? (
                  <div style={{ fontSize: "12.5px", color: "var(--cn-gray)", fontStyle: "italic", background: "#f8fafc", border: "1px dashed var(--cn-border)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                    No extra music links added yet. Click &quot;Add Link&quot; if you have SoundCloud, Bandcamp, or Apple Music pages.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {links.map((linkVal, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <input
                            placeholder="https://soundcloud.com/..."
                            value={linkVal}
                            onChange={(e) => updateLink(idx, e.target.value)}
                            style={{ width: "100%", paddingLeft: "36px" }}
                          />
                          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--cn-gray)", fontSize: "15px" }}>
                            <i className="ti ti-link"></i>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLink(idx)}
                          style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Card 4: Ministry Photo Gallery */}
            <Card
              icon="ti-photo"
              iconBg="linear-gradient(135deg, #3b82f6, #2563eb)"
              title="Worship Ministry Photo Gallery"
              subtitle="Photos of you leading at conferences, Sunday services, or acoustic sessions. These appear in the media gallery on your public listing."
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "8px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "var(--cn-ink)" }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setPhotoFiles(prev => [...prev, ...newFiles]);
                      }
                    }}
                  />
                  <i className="ti ti-photo-plus" style={{ color: "#2563eb" }}></i> Select Gallery Photos
                </label>
                {(existingPhotos.length > 0 || photoFiles.length > 0) && (
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", padding: "4px 10px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                    {existingPhotos.length + photoFiles.length} photo{existingPhotos.length + photoFiles.length > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>

              {(existingPhotos.length > 0 || photoFiles.length > 0) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {existingPhotos.map((url, idx) => (
                    <div key={`existing-pic-${idx}`} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", border: "1.5px solid var(--cn-border)" }}>
                      <img src={url} alt={`Gallery photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => setExistingPhotos(prev => prev.filter((_, i) => i !== idx))}
                        style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {photoFiles.map((p, idx) => (
                    <div key={`pic-${idx}`} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", border: "1.5px solid var(--cn-border)" }}>
                      <img src={URL.createObjectURL(p)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => setPhotoFiles(prev => prev.filter((_, i) => i !== idx))}
                        style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button onClick={() => setCurrentStep(2)} className="btn-secondary">
                <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Back
              </button>
              <button onClick={handleStep3Next} className="btn-primary">
                Review & Publish <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & PUBLISH ================= */}
        {currentStep === 4 && (
          <div className="step-content slide-up">
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px", alignItems: "start" }}>
              {/* LEFT: COMPREHENSIVE DATA BREAKDOWN & PREVIEW */}
              <div className="scard" style={{ padding: 0, overflow: "hidden" }}>
                {/* Header Banner */}
                <div 
                  style={{ 
                    height: "140px", 
                    background: coverPreview ? `url('${coverPreview}') center/cover` : "linear-gradient(135deg, #2e1065, #7c3aed 60%, #be185d)", 
                    position: "relative" 
                  }}
                >
                  <div 
                    style={{
                      position: "absolute",
                      left: "24px",
                      bottom: "-32px",
                      width: "76px",
                      height: "76px",
                      borderRadius: "22px",
                      background: avatarPreview ? `url('${avatarPreview}') center/cover` : "linear-gradient(135deg, #f43f5e, #7c3aed)",
                      border: "3px solid #ffffff",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "28px"
                    }}
                  >
                    {!avatarPreview && <i className="ti ti-user"></i>}
                  </div>
                </div>

                <div style={{ padding: "42px 24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--cn-ink)", margin: 0 }}>
                      {displayName || "Your Name"}
                    </h3>
                    <i className="ti ti-rosette-discount-check-filled" style={{ color: "#16a34a", fontSize: "18px" }}></i>
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--cn-gray)", marginBottom: "12px", fontWeight: 500 }}>
                    {tagline || "Worship Leader & Songwriter"}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--cn-gray)", marginBottom: "18px", flexWrap: "wrap" }}>
                    <i className="ti ti-map-pin" style={{ color: "#e11d48", fontSize: "16px" }}></i>
                    <span style={{ fontWeight: 600 }}>{city || "City not set"}</span>
                    {area && <span>• {area}</span>}
                    {postcode && <span>• {postcode}</span>}
                    {country && <span>• {country}</span>}
                    {addressDetails && <span style={{ color: "#94a3b8" }}>({addressDetails})</span>}
                  </div>

                  {/* Section: Basic Details */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Profile Basics
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                      <div>
                        <span style={{ color: "var(--cn-gray)" }}>Experience:</span>{" "}
                        <strong style={{ color: "var(--cn-ink)" }}>{yearsLeading ? `${yearsLeading} years leading` : "Not specified"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--cn-gray)" }}>Base:</span>{" "}
                        <strong style={{ color: "var(--cn-ink)" }}>{[city, area, country].filter(Boolean).join(', ') || country}</strong>
                      </div>
                      {postcode && (
                        <div>
                          <span style={{ color: "var(--cn-gray)" }}>Postcode:</span>{" "}
                          <strong style={{ color: "var(--cn-ink)" }}>{postcode}</strong>
                        </div>
                      )}
                      {address && (
                        <div style={{ gridColumn: "span 2", fontSize: "12.5px", color: "var(--cn-gray)" }}>
                          <i className="ti ti-map" style={{ marginRight: "4px" }}></i>
                          <span>Full Address: {address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Sound & Style */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Musical Styles & Vocals ({styles.length + instruments.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                      {styles.length > 0 ? (
                        styles.map(s => (
                          <span key={s} style={{ fontSize: "11.5px", fontWeight: 700, color: "#6b21a8", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "4px 10px", borderRadius: "16px" }}>
                            {s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>No styles selected</span>
                      )}
                      {instruments.map(i => (
                        <span key={i} style={{ fontSize: "11.5px", fontWeight: 600, color: "#0f172a", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "16px" }}>
                          🎵 {i}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Section: Languages */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Languages Led In ({languages.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {languages.length > 0 ? (
                        languages.map(l => (
                          <span key={l} style={{ fontSize: "11.5px", fontWeight: 700, color: "#1e3a8a", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "16px" }}>
                            🗣️ {l}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>None selected</span>
                      )}
                    </div>
                  </div>

                  {/* Section: Availability & Fee Preferences */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Booking, Travel & Honorarium
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", marginBottom: "10px" }}>
                      <div>
                        <span style={{ color: "var(--cn-gray)" }}>Travel Range:</span>{" "}
                        <strong style={{ color: "var(--cn-ink)" }}>{travelRange}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--cn-gray)" }}>Lead Time:</span>{" "}
                        <strong style={{ color: "var(--cn-ink)" }}>{leadTime}</strong>
                      </div>
                    </div>

                    {/* Available for events */}
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "var(--cn-gray)", display: "block", marginBottom: "4px" }}>Available For:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {availableFor.length > 0 ? (
                          availableFor.map(a => (
                            <span key={a} style={{ fontSize: "11px", fontWeight: 600, color: "#065f46", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "3px 9px", borderRadius: "14px" }}>
                              ✓ {a}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>No specific occasions selected</span>
                        )}
                      </div>
                    </div>

                    {/* Honorarium / Fee */}
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--cn-gray)", display: "block", marginBottom: "4px" }}>Honorarium / Fee:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {feeModel.length > 0 ? (
                          feeModel.map(f => (
                            <span key={f} style={{ fontSize: "11px", fontWeight: 600, color: "#854d0e", background: "#fefce8", border: "1px solid #fef08a", padding: "3px 9px", borderRadius: "14px" }}>
                              🏷️ {f}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>Open to dialogue / not specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Direct Contact & Social Channels */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Direct Contact & Digital Presence
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px", marginBottom: "10px" }}>
                      <div>
                        <span style={{ color: "var(--cn-gray)" }}>Official Email:</span>{" "}
                        <strong style={{ color: "var(--cn-ink)" }}>{email || <span style={{ color: "#ef4444" }}>Not specified</span>}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--cn-gray)" }}>Phone / WhatsApp:</span>{" "}
                        <strong style={{ color: "var(--cn-ink)" }}>{phone || "Not specified"}</strong>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "12px" }}>
                      {websiteUrl && (
                        <span style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", padding: "3px 9px", borderRadius: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <i className="ti ti-world"></i> {websiteUrl}
                        </span>
                      )}
                      {facebookUrl && (
                        <span style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", padding: "3px 9px", borderRadius: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <i className="ti ti-brand-facebook"></i> Facebook
                        </span>
                      )}
                      {instagramUrl && (
                        <span style={{ background: "#fdf2f8", border: "1px solid #fbcfe8", color: "#db2777", padding: "3px 9px", borderRadius: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <i className="ti ti-brand-instagram"></i> Instagram
                        </span>
                      )}
                      {youtubeUrl && (
                        <span style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "3px 9px", borderRadius: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <i className="ti ti-brand-youtube"></i> YouTube
                        </span>
                      )}
                      {twitterUrl && (
                        <span style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0f172a", padding: "3px 9px", borderRadius: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <i className="ti ti-brand-x"></i> X
                        </span>
                      )}
                      {linkedinUrl && (
                        <span style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#0284c7", padding: "3px 9px", borderRadius: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <i className="ti ti-brand-linkedin"></i> LinkedIn
                        </span>
                      )}
                      {tiktokUrl && (
                        <span style={{ background: "#0f172a", color: "#fff", padding: "3px 9px", borderRadius: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <i className="ti ti-brand-tiktok"></i> TikTok
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Section: Media & Uploads */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Audio & Media Files
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "12.5px" }}>
                      {spotifyUrl && (
                        <span style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#059669", padding: "4px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <i className="ti ti-brand-spotify"></i> Spotify Player
                        </span>
                      )}
                      {(songFiles.length > 0 || existingSongUrl) && (
                        <span style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "4px 10px", borderRadius: "12px", fontWeight: 700 }}>
                          🎵 {songFiles.length + (existingSongUrl ? 1 : 0)} Audio demo{(songFiles.length + (existingSongUrl ? 1 : 0)) > 1 ? "s" : ""}
                        </span>
                      )}
                      {(videoFiles.length > 0 || existingVideoUrl) && (
                        <span style={{ background: "#fdf2f8", border: "1px solid #fbcfe8", color: "#9d174d", padding: "4px 10px", borderRadius: "12px", fontWeight: 700 }}>
                          🎬 {videoFiles.length + (existingVideoUrl ? 1 : 0)} Video clip{(videoFiles.length + (existingVideoUrl ? 1 : 0)) > 1 ? "s" : ""}
                        </span>
                      )}
                      {(photoFiles.length > 0 || existingPhotos.length > 0) && (
                        <span style={{ background: "#f3e8ff", border: "1px solid #e9d5ff", color: "#6b21a8", padding: "4px 10px", borderRadius: "12px", fontWeight: 700 }}>
                          📸 {photoFiles.length + existingPhotos.length} Gallery photo{(photoFiles.length + existingPhotos.length) > 1 ? "s" : ""}
                        </span>
                      )}
                      {youtubeUrls.filter(u => !!u.trim()).map((u, i) => (
                        <span key={`rev-yt-${i}`} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "4px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <i className="ti ti-brand-youtube"></i> Video {i + 2}
                        </span>
                      ))}
                      {extraSpotifyUrls.filter(u => !!u.trim()).map((u, i) => (
                        <span key={`rev-sp-${i}`} style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#059669", padding: "4px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <i className="ti ti-brand-spotify"></i> Track {i + 2}
                        </span>
                      ))}
                      {links.filter(l => !!l.trim()).map((l, i) => (
                        <span key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", padding: "4px 10px", borderRadius: "12px", fontWeight: 600, fontSize: "12px" }}>
                          🔗 {l}
                        </span>
                      ))}
                      {!spotifyUrl && !existingSongUrl && !existingVideoUrl && songFiles.length === 0 && photoFiles.length === 0 && existingPhotos.length === 0 && links.filter(l => !!l.trim()).length === 0 && youtubeUrls.filter(u => !!u.trim()).length === 0 && extraSpotifyUrls.filter(u => !!u.trim()).length === 0 && (
                        <span style={{ color: "var(--cn-gray-light)", fontSize: "12px" }}>No additional audio files or media links</span>
                      )}
                    </div>

                    {/* Link URLs preview */}
                    {(youtubeUrl || spotifyUrl || instagramUrl || websiteUrl || links.filter(l => !!l.trim()).length > 0 || youtubeUrls.filter(u => !!u.trim()).length > 0 || extraSpotifyUrls.filter(u => !!u.trim()).length > 0) && (
                      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "5px", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--cn-border)" }}>
                        {youtubeUrl && (
                          <div style={{ fontSize: "12px", color: "#dc2626", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="ti ti-brand-youtube"></i>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{youtubeUrl} (Primary Video)</span>
                          </div>
                        )}
                        {youtubeUrls.filter(u => !!u.trim()).map((u, idx) => (
                          <div key={`y-prev-${idx}`} style={{ fontSize: "12px", color: "#dc2626", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="ti ti-brand-youtube"></i>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u}</span>
                          </div>
                        ))}
                        {spotifyUrl && (
                          <div style={{ fontSize: "12px", color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="ti ti-brand-spotify"></i>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{spotifyUrl} (Primary Spotify)</span>
                          </div>
                        )}
                        {extraSpotifyUrls.filter(u => !!u.trim()).map((u, idx) => (
                          <div key={`s-prev-${idx}`} style={{ fontSize: "12px", color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="ti ti-brand-spotify"></i>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u}</span>
                          </div>
                        ))}
                        {instagramUrl && (
                          <div style={{ fontSize: "12px", color: "#db2777", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="ti ti-brand-instagram"></i>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{instagramUrl}</span>
                          </div>
                        )}
                        {websiteUrl && (
                          <div style={{ fontSize: "12px", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="ti ti-world"></i>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{websiteUrl}</span>
                          </div>
                        )}
                        {links.filter(l => !!l.trim()).map((l, idx) => (
                          <div key={idx} style={{ fontSize: "12px", color: "var(--cn-purple)", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="ti ti-link"></i>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section: Bio */}
                  {bio && (
                    <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "6px" }}>
                        About & Ministry Calling
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
                        {bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: PROFILE STRENGTH & PUBLISH ACTIONS */}
              <div>
                {/* Profile Strength Card */}
                <div className="scard" style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--cn-ink)" }}>Profile Completeness</span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: scorePercent >= 80 ? "#16a34a" : "#d97706" }}>
                      {scorePercent}%
                    </span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "4px", background: "#f1f5f9", overflow: "hidden", marginBottom: "14px" }}>
                    <div style={{ height: "100%", width: `${scorePercent}%`, background: "linear-gradient(90deg, #f43f5e, #7c3aed)", transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--cn-gray)", lineHeight: 1.4, marginBottom: "14px" }}>
                    {scorePercent === 100 ? "🌟 Your profile is complete and optimized for church discovery!" : "Profiles with photo, musical styles, and media receive up to 4× more enquiries."}
                  </div>

                  {/* Breakdown checklist */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {strengthFields.map((f, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ color: f.done ? "var(--cn-ink)" : "var(--cn-gray-light)" }}>{f.label}</span>
                        {f.done ? (
                          <i className="ti ti-circle-check-filled" style={{ color: "#16a34a", fontSize: "14px" }}></i>
                        ) : (
                          <i className="ti ti-circle" style={{ color: "#cbd5e1", fontSize: "14px" }}></i>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publish Button & Action */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: "100%", padding: "14px 20px", fontSize: "15px", marginBottom: "12px" }}
                >
                  <i className={isEditMode ? "ti ti-check" : "ti ti-rocket"} style={{ fontSize: "18px" }}></i>
                  {submitting
                    ? (isEditMode ? "Saving Changes..." : "Publishing Profile...")
                    : (isEditMode ? "Save Changes" : "Publish Worship Leader Profile")}
                </button>

                {submitError && (
                  <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "12px", padding: "12px", color: "#991b1b", fontSize: "12.5px", marginBottom: "14px", display: "flex", gap: "8px" }}>
                    <i className="ti ti-alert-circle" style={{ fontSize: "16px", color: "#ef4444", flexShrink: 0 }}></i>
                    <div>{submitError}</div>
                  </div>
                )}
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
              <i className={`ti ${icon || 'ti-microphone-2'}`} style={{ fontSize: "20px", color: "#fff" }}></i>
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

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "7px" }}>
        <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)", margin: 0, display: "block" }}>
          {label} {required && <span style={{ color: "#ef4444", fontWeight: 800 }}>*</span>}
        </label>
        {hint && (
          <span style={{ fontSize: "11.5px", color: "var(--cn-gray)", fontWeight: 500 }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

