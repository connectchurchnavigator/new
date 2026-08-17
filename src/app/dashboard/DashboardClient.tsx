'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/components/layout/TopNav';

interface DashboardClientProps {
  user: any;
  churches: any[];
  pastors: any[];
  events: any[];
}

export default function DashboardClient({
  user,
  churches,
  pastors,
  events,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'churches' | 'pastors' | 'events'>('overview');

  const totalListings = churches.length + pastors.length + events.length;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "inherit" }}>
      <TopNav />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        
        {/* Header Banner */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          borderRadius: "24px",
          padding: "36px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "32px",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2)",
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#a855f7", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>
              Listing Manager Portal
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
              Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0] || "Minister"} 👋
            </h1>
            <p style={{ fontSize: "14.5px", color: "#94a3b8", margin: "6px 0 0" }}>
              Manage your registered churches, speaker profiles, and hosted events from one central hub.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/add-listing"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                color: "#ffffff",
                padding: "10px 18px",
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "13.5px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
              }}
            >
              <i className="ti ti-plus"></i> Add Church
            </Link>
            <Link
              href="/onboarding/pastor"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "10px 18px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "13.5px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="ti ti-user-plus"></i> Add Pastor Profile
            </Link>
            <Link
              href="/onboarding/events"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "10px 18px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "13.5px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className="ti ti-calendar-plus"></i> Host Event
            </Link>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          
          <div style={{ background: "#ffffff", padding: "22px 24px", borderRadius: "20px", border: "1.5px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>My Churches</span>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-building-church" style={{ fontSize: "18px" }}></i>
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a" }}>{churches.length}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Registered sanctuaries</div>
          </div>

          <div style={{ background: "#ffffff", padding: "22px 24px", borderRadius: "20px", border: "1.5px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>My Pastor Profiles</span>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#fff1f2", color: "#f43f5e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-user-star" style={{ fontSize: "18px" }}></i>
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a" }}>{pastors.length}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Minister speaker profiles</div>
          </div>

          <div style={{ background: "#ffffff", padding: "22px 24px", borderRadius: "20px", border: "1.5px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>My Hosted Events</span>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-calendar-event" style={{ fontSize: "18px" }}></i>
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a" }}>{events.length}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Conferences & worship nights</div>
          </div>

          <div style={{ background: "#ffffff", padding: "22px 24px", borderRadius: "20px", border: "1.5px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>Total Active Listings</span>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#f0f9ff", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-layers-intersect" style={{ fontSize: "18px" }}></i>
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a" }}>{totalListings}</div>
            <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700, marginTop: "4px" }}>Live on ChurchNavigator</div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #e2e8f0", marginBottom: "28px" }}>
          {[
            { id: "overview", label: "Overview", icon: "ti-layout-grid" },
            { id: "churches", label: `My Churches (${churches.length})`, icon: "ti-building-church" },
            { id: "pastors", label: `My Pastor Profiles (${pastors.length})`, icon: "ti-user-star" },
            { id: "events", label: `My Events (${events.length})`, icon: "ti-calendar-event" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "12px 20px",
                border: "none",
                borderBottom: activeTab === tab.id ? "3px solid #7c3aed" : "3px solid transparent",
                background: "transparent",
                color: activeTab === tab.id ? "#7c3aed" : "#64748b",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "-2px",
              }}
            >
              <i className={`ti ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── 1. OVERVIEW TAB ───────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* My Churches Section */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>My Registered Churches</h3>
                <Link href="/add-listing" style={{ color: "#7c3aed", fontWeight: 800, fontSize: "13px", textDecoration: "none" }}>+ Add New Church</Link>
              </div>

              {churches.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
                  <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "12px" }}>You haven&apos;t registered any churches yet.</div>
                  <Link href="/add-listing" style={{ background: "#7c3aed", color: "#fff", padding: "8px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>Register Your Church</Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                  {churches.map((c) => (
                    <div key={c.id} style={{ border: "1.5px solid #f1f5f9", borderRadius: "16px", padding: "18px", background: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{c.name}</h4>
                          {c.is_verified && <span style={{ fontSize: "11px", fontWeight: 800, color: "#16a34a", background: "#f0fdf4", padding: "2px 8px", borderRadius: "6px" }}>✓ Verified</span>}
                        </div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>📍 {c.city || c.address_line || "UK"}</div>
                        <div style={{ fontSize: "12.5px", color: "#7c3aed", fontWeight: 700 }}>{c.denomination?.split("|||")[0] || "Non-Denominational"}</div>
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        <Link href={`/church/${c.slug}`} target="_blank" style={{ flex: 1, textAlign: "center", background: "#f1f5f9", color: "#334155", padding: "8px", borderRadius: "10px", fontSize: "12.5px", fontWeight: 700, textDecoration: "none" }}>
                          View Live Page
                        </Link>
                        <Link href={`/church/${c.slug}?owner=true`} target="_blank" style={{ flex: 1, textAlign: "center", background: "#f5f3ff", color: "#7c3aed", padding: "8px", borderRadius: "10px", fontSize: "12.5px", fontWeight: 800, textDecoration: "none" }}>
                          Edit Listing
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Pastor Profiles Section */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>My Pastor & Speaker Profiles</h3>
                <Link href="/onboarding/pastor" style={{ color: "#f43f5e", fontWeight: 800, fontSize: "13px", textDecoration: "none" }}>+ Add Pastor Profile</Link>
              </div>

              {pastors.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
                  <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "12px" }}>No pastor or speaker profiles created yet.</div>
                  <Link href="/onboarding/pastor" style={{ background: "#f43f5e", color: "#fff", padding: "8px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>Create Speaker Profile</Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                  {pastors.map((p) => (
                    <div key={p.id} style={{ border: "1.5px solid #f1f5f9", borderRadius: "16px", padding: "18px", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #f43f5e, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                          {p.full_name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "15px" }}>{p.full_name}</div>
                          <div style={{ fontSize: "12.5px", color: "#f43f5e", fontWeight: 700 }}>{p.title || "Minister"}</div>
                        </div>
                      </div>

                      <Link href={`/pastor/${p.slug}`} target="_blank" style={{ background: "#fff1f2", color: "#f43f5e", padding: "8px 14px", borderRadius: "10px", fontSize: "12.5px", fontWeight: 800, textDecoration: "none" }}>
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Hosted Events Section */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>My Hosted Events</h3>
                <Link href="/onboarding/events" style={{ color: "#16a34a", fontWeight: 800, fontSize: "13px", textDecoration: "none" }}>+ Host New Event</Link>
              </div>

              {events.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
                  <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "12px" }}>No upcoming events posted.</div>
                  <Link href="/onboarding/events" style={{ background: "#16a34a", color: "#fff", padding: "8px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>Host an Event</Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                  {events.map((e) => (
                    <div key={e.id} style={{ border: "1.5px solid #f1f5f9", borderRadius: "16px", padding: "18px", background: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "#e11d48", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>{e.type || "Event"}</div>
                        <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>{e.title}</h4>
                        <div style={{ fontSize: "13px", color: "#64748b" }}>📍 {e.city || e.venue_name || "UK"}</div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: "12px", fontWeight: 800, background: "#f0fdf4", color: "#16a34a", padding: "3px 8px", borderRadius: "6px" }}>{e.price_label || "Free"}</span>
                        <Link href={`/events/${e.slug}`} target="_blank" style={{ color: "#16a34a", fontWeight: 800, fontSize: "12.5px", textDecoration: "none" }}>View Event &rarr;</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── 2. CHURCHES TAB ─────────────────────────────────────────────── */}
        {activeTab === "churches" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0 }}>Registered Church Sanctuaries</h3>
              <Link href="/add-listing" style={{ background: "#7c3aed", color: "#fff", padding: "10px 18px", borderRadius: "12px", textDecoration: "none", fontSize: "13.5px", fontWeight: 800 }}>+ Add Church</Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {churches.map((c) => (
                <div key={c.id} style={{ border: "1.5px solid #e2e8f0", borderRadius: "18px", padding: "20px", background: "#ffffff" }}>
                  <div style={{ fontWeight: 900, fontSize: "17px", color: "#0f172a", marginBottom: "6px" }}>{c.name}</div>
                  <div style={{ fontSize: "13.5px", color: "#64748b", marginBottom: "4px" }}>📍 {c.city || c.address_line}</div>
                  <div style={{ fontSize: "13px", color: "#7c3aed", fontWeight: 700, marginBottom: "16px" }}>{c.denomination?.split("|||")[0]}</div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link href={`/church/${c.slug}`} target="_blank" style={{ flex: 1, textAlign: "center", background: "#f1f5f9", color: "#334155", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>View Public</Link>
                    <Link href={`/church/${c.slug}?owner=true`} target="_blank" style={{ flex: 1, textAlign: "center", background: "#f5f3ff", color: "#7c3aed", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 800, textDecoration: "none" }}>Edit Details</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. PASTORS TAB ──────────────────────────────────────────────── */}
        {activeTab === "pastors" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0 }}>Registered Pastors & Speakers</h3>
              <Link href="/onboarding/pastor" style={{ background: "#f43f5e", color: "#fff", padding: "10px 18px", borderRadius: "12px", textDecoration: "none", fontSize: "13.5px", fontWeight: 800 }}>+ Add Pastor Profile</Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {pastors.map((p) => (
                <div key={p.id} style={{ border: "1.5px solid #e2e8f0", borderRadius: "18px", padding: "20px", background: "#ffffff" }}>
                  <div style={{ fontWeight: 900, fontSize: "17px", color: "#0f172a", marginBottom: "4px" }}>{p.full_name}</div>
                  <div style={{ fontSize: "13.5px", color: "#f43f5e", fontWeight: 700, marginBottom: "16px" }}>{p.title || "Minister"}</div>
                  <Link href={`/pastor/${p.slug}`} target="_blank" style={{ display: "block", textAlign: "center", background: "#fff1f2", color: "#f43f5e", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 800, textDecoration: "none" }}>View Pastor Profile &rarr;</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. EVENTS TAB ───────────────────────────────────────────────── */}
        {activeTab === "events" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0 }}>Hosted Events & Gatherings</h3>
              <Link href="/onboarding/events" style={{ background: "#16a34a", color: "#fff", padding: "10px 18px", borderRadius: "12px", textDecoration: "none", fontSize: "13.5px", fontWeight: 800 }}>+ Host Event</Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {events.map((e) => (
                <div key={e.id} style={{ border: "1.5px solid #e2e8f0", borderRadius: "18px", padding: "20px", background: "#ffffff" }}>
                  <div style={{ fontWeight: 900, fontSize: "17px", color: "#0f172a", marginBottom: "4px" }}>{e.title}</div>
                  <div style={{ fontSize: "13.5px", color: "#64748b", marginBottom: "16px" }}>📍 {e.venue_name || e.city || "UK"}</div>
                  <Link href={`/events/${e.slug}`} target="_blank" style={{ display: "block", textAlign: "center", background: "#f0fdf4", color: "#16a34a", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 800, textDecoration: "none" }}>View Event Listing &rarr;</Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
