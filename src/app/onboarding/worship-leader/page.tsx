"use client";

import React, { useState } from "react";
import TopNav from "@/components/layout/TopNav";
import { useRouter } from "next/navigation";

export default function WorshipLeaderOnboardingPage() {
  const router = useRouter();

  // State for form submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // State for form fields
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [yearsLeading, setYearsLeading] = useState("");
  const [bio, setBio] = useState("");
  const [travelRange, setTravelRange] = useState("UK-wide");
  const [leadTime, setLeadTime] = useState("2 weeks preferred");

  // State for chips
  const [styles, setStyles] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [availableFor, setAvailableFor] = useState<string[]>([]);
  const [feeModel, setFeeModel] = useState<string[]>([]);

  // State for avatar preview
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // State for media inputs
  const [songFileName, setSongFileName] = useState("");
  const [songFile, setSongFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [photosCount, setPhotosCount] = useState(0);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const toggleChip = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const styleOptions = ["Contemporary", "Gospel", "Afro-Gospel", "Hymns", "Acoustic", "Prophetic", "Spontaneous"];
  const instrumentOptions = ["Vocals", "Piano", "Acoustic guitar", "Electric guitar", "Bass", "Drums", "Keys"];
  const languageOptions = ["English", "Yoruba", "Igbo", "Spanish", "Twi", "French"];
  const availableOptions = ["Sundays", "Events & conferences", "Worship nights", "Recordings", "Online / livestream", "Dep / cover"];
  const feeOptions = ["Love offering", "Fixed fee", "Fee on request", "Expenses only"];

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    let finalAvatarUrl = "";
    let finalSongUrl = "";
    let finalVideoUrl = "";
    const finalPhotoUrls: string[] = [];

    // Helper function for uploading
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
      finalAvatarUrl = await uploadFile(avatarFile, "avatar") || "";
    }
    if (songFile) {
      finalSongUrl = await uploadFile(songFile, "song") || "";
    }
    if (videoFile) {
      finalVideoUrl = await uploadFile(videoFile, "video") || "";
    }
    for (const photo of photoFiles) {
      const url = await uploadFile(photo, "gallery");
      if (url) finalPhotoUrls.push(url);
    }

    const payload = {
      display_name: displayName,
      tagline,
      city: location,
      years_leading: parseInt(yearsLeading) || 0,
      bio,
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
      cover_photo_urls: finalPhotoUrls
    };

    try {
      const res = await fetch("/api/worship-leaders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create profile");
      }

      router.push(`/worship-leader/${data.slug}`);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --grad: linear-gradient(135deg, #f43f5e, #7c3aed);
          --grad-soft: linear-gradient(135deg, rgba(244,63,94,.1), rgba(124,58,237,.1));
          --purple: #7c3aed;
          --purple-d: #6d28d9;
          --coral: #f43f5e;
          --ink: #0f0f1a;
          --gray: #6b7280;
          --gray-l: #9ca3af;
          --border: #e9e9ef;
          --surface: #f5f3ff;
          --bg: #f7f7fb;
        }
        .wl-page {
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
        }
        .wl-wrap { max-width: 1040px; margin: 0 auto; padding: 0 22px; }
        .wl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-size: 13.5px; font-weight: 700; padding: 11px 16px; border-radius: 12px; cursor: pointer; border: none; }
        .wl-btn-primary { background: var(--grad); color: #fff; }
        .wl-btn-ghost { background: #fff; border: 1.5px solid var(--border); color: var(--ink); }
        .wl-hero { background: linear-gradient(135deg, #2e1065, #6d28d9 60%, #be185d); color: #fff; padding: 30px 0 24px; }
        .wl-hero h1 { font-size: 28px; font-weight: 900; letter-spacing: -.02em; margin: 0; }
        .wl-hero p { font-size: 14px; color: rgba(255,255,255,.82); margin-top: 6px; }
        .wl-steps { display: flex; gap: 8px; margin-top: 18px; flex-wrap: wrap; }
        .wl-step { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; color: rgba(255,255,255,.75); background: rgba(255,255,255,.1); padding: 7px 13px; border-radius: 20px; }
        .wl-step.on { background: #fff; color: var(--purple-d); }
        .wl-step .n { width: 18px; height: 18px; border-radius: 50%; background: rgba(255,255,255,.25); display: flex; align-items: center; justify-content: center; font-size: 11px; }
        .wl-step.on .n { background: var(--grad); color: #fff; }
        .wl-cols { display: grid; grid-template-columns: 1.55fr 1fr; gap: 24px; align-items: start; padding: 24px 0 70px; }
        .wl-card { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 22px; margin-bottom: 18px; }
        .wl-card-h { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .wl-card-h .ic { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; }
        .wl-card-h h3 { font-size: 15px; font-weight: 800; margin: 0; }
        .wl-field { margin-bottom: 15px; }
        .wl-field label { display: block; font-size: 12.5px; font-weight: 800; color: var(--gray); text-transform: uppercase; letter-spacing: .03em; margin-bottom: 7px; }
        .wl-field input, .wl-field select, .wl-field textarea { width: 100%; font-size: 14px; padding: 11px 13px; border: 1.5px solid var(--border); border-radius: 11px; outline: none; font-family: inherit; }
        .wl-field input:focus, .wl-field textarea:focus, .wl-field select:focus { border-color: var(--purple); }
        .wl-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .wl-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .wl-chip { font-size: 13px; font-weight: 700; padding: 8px 14px; border-radius: 22px; border: 1.5px solid var(--border); background: #fff; color: var(--ink); cursor: pointer; }
        .wl-chip.on { background: var(--grad); color: #fff; border-color: transparent; }
        .wl-avatar-up { display: flex; align-items: center; gap: 14px; }
        .wl-avatar-up .av { width: 72px; height: 72px; border-radius: 20px; background: var(--grad-soft); border: 1.5px dashed var(--border); display: flex; align-items: center; justify-content: center; color: var(--purple-d); font-size: 26px; cursor: pointer; }
        .wl-up-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .wl-up { display: flex; flex-direction: column; align-items: center; gap: 7px; border: 1.5px dashed var(--border); border-radius: 13px; padding: 16px; cursor: pointer; text-align: center; }
        .wl-up:hover { border-color: var(--purple); background: var(--surface); }
        .wl-up .uic { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; }
        .wl-up .t { font-weight: 700; font-size: 12.5px; } .wl-up .d { font-size: 11px; color: var(--gray); }
        .wl-hint { font-size: 12px; color: var(--gray); margin-top: 6px; }
        .wl-side { position: sticky; top: 74px; }
        .wl-pv-label { font-size: 12px; font-weight: 800; color: var(--gray); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .wl-pv { background: #fff; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-bottom: 16px; }
        .wl-pv-cover { height: 96px; background: linear-gradient(135deg, #4c1d95, #be185d); position: relative; }
        .wl-pv-av { position: absolute; left: 16px; bottom: -24px; width: 56px; height: 56px; border-radius: 16px; background: var(--grad); border: 3px solid #fff; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; }
        .wl-pv-body { padding: 32px 16px 16px; }
        .wl-pv-name { font-size: 17px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
        .wl-pv-tag { font-size: 12.5px; color: var(--gray); margin-top: 2px; }
        .wl-pv-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .wl-pv-chip { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; background: var(--surface); color: var(--purple-d); }
        .wl-pv-meta { display: flex; gap: 12px; margin-top: 11px; font-size: 12px; color: var(--gray); }
        .wl-tips { background: var(--surface); border: 1px solid #e4ddf7; border-radius: 14px; padding: 16px; }
        .wl-tips h4 { font-size: 13px; font-weight: 800; margin-bottom: 8px; margin-top: 0; }
        .wl-tips ul { padding-left: 16px; margin: 0; }
        .wl-tips li { font-size: 12.5px; color: #4b3b6b; margin: 5px 0; line-height: 1.5; }
        @media(max-width:880px){.wl-cols{grid-template-columns:1fr;}.wl-side{position:static;}.wl-row2,.wl-up-grid{grid-template-columns:1fr;}}
      `}</style>

      <div className="wl-page">
        <TopNav />
        <div className="wl-hero">
          <div className="wl-wrap">
            <h1>Create your worship leader profile</h1>
            <p>List yourself, share your music, and get booked by churches and events across the UK.</p>
            <div className="wl-steps">
              <div className="wl-step on"><span className="n">1</span> Basics</div>
              <div className="wl-step on"><span className="n">2</span> Your sound</div>
              <div className="wl-step on"><span className="n">3</span> Availability</div>
              <div className="wl-step on"><span className="n">4</span> Media</div>
              <div className="wl-step"><span className="n">5</span> Publish</div>
            </div>
          </div>
        </div>

        <div className="wl-wrap wl-cols">
          {/* FORM */}
          <div>
            <div className="wl-card">
              <div className="wl-card-h"><div className="ic" style={{background: "linear-gradient(135deg,#a855f7,#7c3aed)"}}><i className="ti ti-user"></i></div><h3>The basics</h3></div>
              <div className="wl-avatar-up" style={{marginBottom: "16px"}}>
                <label className="av" style={{ background: avatarPreview ? `url('${avatarPreview}') center/cover` : 'var(--grad-soft)', overflow: 'hidden' }}>
                  <input type="file" accept="image/*" style={{display: "none"}} onChange={handleAvatarChange} />
                  {!avatarPreview && <i className="ti ti-camera-plus"></i>}
                </label>
                <div><div style={{fontWeight: 700, fontSize: "13.5px"}}>Profile photo</div><div className="wl-hint" style={{marginTop: "2px"}}>A clear headshot or on-stage shot works best.</div></div>
              </div>
              <div className="wl-field"><label>Display name</label><input placeholder="e.g. David Okonkwo" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
              <div className="wl-field"><label>Tagline</label><input placeholder="e.g. Worship leader, songwriter & recording artist" value={tagline} onChange={(e) => setTagline(e.target.value)} /></div>
              <div className="wl-row2">
                <div className="wl-field"><label>City / area</label><input placeholder="Start typing your area…" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
                <div className="wl-field"><label>Years leading</label><input type="number" placeholder="e.g. 12" value={yearsLeading} onChange={(e) => setYearsLeading(e.target.value)} /></div>
              </div>
              <div className="wl-field" style={{marginBottom: 0}}><label>Short bio</label><textarea rows={3} placeholder="A couple of sentences about your ministry and sound…" value={bio} onChange={(e) => setBio(e.target.value)}></textarea></div>
            </div>

            <div className="wl-card">
              <div className="wl-card-h"><div className="ic" style={{background: "linear-gradient(135deg,#f43f5e,#db2777)"}}><i className="ti ti-music"></i></div><h3>Your sound</h3></div>
              <div className="wl-field"><label>Musical style (pick any)</label><div className="wl-chips">
                {styleOptions.map(s => (
                  <button key={s} className={`wl-chip ${styles.includes(s) ? 'on' : ''}`} onClick={() => toggleChip(styles, setStyles, s)}>{s}</button>
                ))}
              </div></div>
              <div className="wl-field"><label>Instruments you play</label><div className="wl-chips">
                {instrumentOptions.map(i => (
                  <button key={i} className={`wl-chip ${instruments.includes(i) ? 'on' : ''}`} onClick={() => toggleChip(instruments, setInstruments, i)}>{i}</button>
                ))}
              </div></div>
              <div className="wl-field" style={{marginBottom: 0}}><label>Languages you lead in</label><div className="wl-chips">
                {languageOptions.map(l => (
                  <button key={l} className={`wl-chip ${languages.includes(l) ? 'on' : ''}`} onClick={() => toggleChip(languages, setLanguages, l)}>{l}</button>
                ))}
              </div></div>
            </div>

            <div className="wl-card">
              <div className="wl-card-h"><div className="ic" style={{background: "linear-gradient(135deg,#2dd4bf,#0891b2)"}}><i className="ti ti-calendar-check"></i></div><h3>Availability & booking</h3></div>
              <div className="wl-field"><label>Available for</label><div className="wl-chips">
                {availableOptions.map(a => (
                  <button key={a} className={`wl-chip ${availableFor.includes(a) ? 'on' : ''}`} onClick={() => toggleChip(availableFor, setAvailableFor, a)}>{a}</button>
                ))}
              </div></div>
              <div className="wl-row2">
                <div className="wl-field"><label>Travel range</label>
                  <select value={travelRange} onChange={(e) => setTravelRange(e.target.value)}>
                    <option>My city only</option>
                    <option>Within 1 hour</option>
                    <option>UK-wide</option>
                    <option>International</option>
                  </select>
                </div>
                <div className="wl-field"><label>Lead time</label>
                  <select value={leadTime} onChange={(e) => setLeadTime(e.target.value)}>
                    <option>Any notice</option>
                    <option>2 weeks preferred</option>
                    <option>1 month+</option>
                  </select>
                </div>
              </div>
              <div className="wl-field" style={{marginBottom: 0}}><label>Fee model</label><div className="wl-chips">
                {feeOptions.map(f => (
                  <button key={f} className={`wl-chip ${feeModel.includes(f) ? 'on' : ''}`} onClick={() => toggleChip(feeModel, setFeeModel, f)}>{f}</button>
                ))}
              </div></div>
            </div>

            <div className="wl-card">
              <div className="wl-card-h"><div className="ic" style={{background: "linear-gradient(135deg,#f59e0b,#d97706)"}}><i className="ti ti-player-play"></i></div><h3>Your media</h3></div>
              <div className="wl-up-grid" style={{marginBottom: "14px"}}>
                <label className="wl-up">
                  <input type="file" accept="audio/*" style={{display: "none"}} onChange={(e) => { 
                    if(e.target.files && e.target.files[0]) {
                      setSongFileName(e.target.files[0].name);
                      setSongFile(e.target.files[0]);
                    } 
                  }} />
                  <div className="uic" style={{background: songFileName ? "#10b981" : "linear-gradient(135deg,#2dd4bf,#0891b2)"}}>
                    <i className={songFileName ? "ti ti-check" : "ti ti-music-plus"}></i>
                  </div>
                  <div className="t">{songFileName ? "Song added" : "Add a song"}</div>
                  <div className="d">{songFileName || "MP3 / WAV"}</div>
                </label>
                <label className="wl-up">
                  <input type="file" accept="video/*" style={{display: "none"}} onChange={(e) => { 
                    if(e.target.files && e.target.files[0]) {
                      setVideoFileName(e.target.files[0].name);
                      setVideoFile(e.target.files[0]);
                    } 
                  }} />
                  <div className="uic" style={{background: videoFileName ? "#10b981" : "linear-gradient(135deg,#f43f5e,#db2777)"}}>
                    <i className={videoFileName ? "ti ti-check" : "ti ti-video-plus"}></i>
                  </div>
                  <div className="t">{videoFileName ? "Video added" : "Add a video"}</div>
                  <div className="d">{videoFileName || "File or link"}</div>
                </label>
                <label className="wl-up">
                  <input type="file" accept="image/*" multiple style={{display: "none"}} onChange={(e) => { 
                    if(e.target.files) {
                      setPhotosCount(e.target.files.length);
                      setPhotoFiles(Array.from(e.target.files));
                    } 
                  }} />
                  <div className="uic" style={{background: photosCount > 0 ? "#10b981" : "linear-gradient(135deg,#a855f7,#7c3aed)"}}>
                    <i className={photosCount > 0 ? "ti ti-check" : "ti ti-photo-plus"}></i>
                  </div>
                  <div className="t">{photosCount > 0 ? `${photosCount} photos` : "Add photos"}</div>
                  <div className="d">{photosCount > 0 ? "Added to gallery" : "Gallery"}</div>
                </label>
              </div>
              <div className="wl-field" style={{marginBottom: 0}}><label>Or paste links (Spotify, YouTube, Instagram, website)</label><input placeholder="https://open.spotify.com/artist/…" /></div>
            </div>
          </div>

          {/* PREVIEW SIDEBAR */}
          <div className="wl-side">
            <div className="wl-pv-label"><i className="ti ti-eye"></i> Live preview</div>
            <div className="wl-pv">
              <div className="wl-pv-cover">
                <div className="wl-pv-av" style={{ background: avatarPreview ? `url('${avatarPreview}') center/cover` : 'var(--grad)', overflow: 'hidden' }}>
                  {!avatarPreview && (
                    <img src={`https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=200&auto=format&fit=crop`} alt="Dynamic fallback avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                </div>
              </div>
              <div className="wl-pv-body">
                <div className="wl-pv-name">{displayName || "Your Name"} <span style={{color: "#16a34a", fontSize: "13px"}}><i className="ti ti-rosette-discount-check-filled"></i></span></div>
                <div className="wl-pv-tag">{tagline || "Your tagline will appear here"}</div>
                <div className="wl-pv-chips">
                  {styles.length > 0 ? styles.map(s => <span key={s} className="wl-pv-chip">{s}</span>) : <span className="wl-pv-chip" style={{ opacity: 0.5 }}>Musical Style</span>}
                  {instruments.length > 0 ? instruments.map(i => <span key={i} className="wl-pv-chip">{i}</span>) : <span className="wl-pv-chip" style={{ opacity: 0.5 }}>Instruments</span>}
                </div>
                <div className="wl-pv-meta"><span><i className="ti ti-map-pin"></i> {location || "Your City"}</span><span><i className="ti ti-plane"></i> UK-wide</span></div>
              </div>
            </div>
            <button className="wl-btn wl-btn-primary" style={{width: "100%", marginBottom: "10px"}} onClick={handleSubmit} disabled={submitting}>
              <i className="ti ti-rocket"></i> {submitting ? "Publishing..." : "Publish profile"}
            </button>
            {submitError && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px", textAlign: "center" }}>{submitError}</div>}
            <button className="wl-btn wl-btn-ghost" style={{width: "100%", marginBottom: "16px"}}><i className="ti ti-device-floppy"></i> Save as draft</button>
            <div className="wl-tips">
              <h4>💡 Get booked faster</h4>
              <ul>
                <li>Add at least one song and one video — profiles with media get 4× more enquiries.</li>
                <li>Set your availability so churches know when to reach out.</li>
                <li>Get verified to earn the ✓ badge and rank higher in search.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
