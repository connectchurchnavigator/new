"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INITIAL_TAXONOMIES, TaxonomyStore } from "@/lib/taxonomies";
import BulkUploadModal from "@/components/admin/BulkUploadModal";

interface AdminClientProps {
  initialChurches: any[];
  initialPastors: any[];
  initialEvents: any[];
  initialUsers: any[];
  metrics: {
    totalChurches: number;
    verifiedChurches: number;
    totalPastors: number;
    verifiedPastors: number;
    totalEvents: number;
    totalUsers: number;
  };
}

export default function AdminClient({
  initialChurches,
  initialPastors,
  initialEvents,
  initialUsers,
  metrics,
}: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "churches" | "pastors" | "events" | "taxonomies" | "users">("overview");

  // Bulk upload modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Data lists
  const [churches, setChurches] = useState<any[]>(initialChurches);
  const [pastors, setPastors] = useState<any[]>(initialPastors);
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [usersList, setUsersList] = useState<any[]>(initialUsers);

  // User Role update handler
  const handleUserRoleChange = async (userId: string, newRole: "super_admin" | "listing_manager" | "visitor") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  user_metadata: { ...u.user_metadata, role: newRole },
                  app_metadata: { ...u.app_metadata, role: newRole },
                }
              : u
          )
        );
      } else {
        alert("Failed to update user role.");
      }
    } catch (err) {
      alert("Error updating user role.");
    }
  };

  // Search queries
  const [churchSearch, setChurchSearch] = useState("");
  const [pastorSearch, setPastorSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Taxonomies State
  const [taxonomies, setTaxonomies] = useState<TaxonomyStore>(INITIAL_TAXONOMIES);
  const [activeTaxCategory, setActiveTaxCategory] = useState<keyof TaxonomyStore>("denominations");
  const [newTaxItem, setNewTaxItem] = useState("");
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isSavingTax, setIsSavingTax] = useState(false);
  const [taxSaveSuccess, setTaxSaveSuccess] = useState(false);

  // Load custom taxonomies from server
  useEffect(() => {
    fetch("/api/admin/taxonomies")
      .then((res) => res.json())
      .then((data) => {
        if (data.taxonomies) {
          setTaxonomies(data.taxonomies);
        }
      })
      .catch(() => {});
  }, []);

  // 1. Toggle Church Verification
  const handleToggleChurchVerification = async (churchId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/churches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchId, is_verified: !currentStatus }),
      });
      if (res.ok) {
        setChurches((prev) =>
          prev.map((c) => (c.id === churchId ? { ...c, is_verified: !currentStatus } : c))
        );
      }
    } catch (err) {
      alert("Failed to update verification status");
    }
  };

  // 2. Toggle Church Publish Status
  const handleToggleChurchStatus = async (churchId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/churches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchId, status: nextStatus }),
      });
      if (res.ok) {
        setChurches((prev) =>
          prev.map((c) => (c.id === churchId ? { ...c, status: nextStatus } : c))
        );
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // 3. Delete Church
  const handleDeleteChurch = async (churchId: string, churchName: string) => {
    if (!confirm(`Are you sure you want to delete "${churchName}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/churches?churchId=${churchId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setChurches((prev) => prev.filter((c) => c.id !== churchId));
      }
    } catch (err) {
      alert("Failed to delete church");
    }
  };

  // 4. Toggle Pastor Verification
  const handleTogglePastorVerification = async (pastorId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/pastors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pastorId, is_verified: !currentStatus }),
      });
      if (res.ok) {
        setPastors((prev) =>
          prev.map((p) => (p.id === pastorId ? { ...p, is_verified: !currentStatus } : p))
        );
      }
    } catch (err) {
      alert("Failed to update verification status");
    }
  };

  // 5. Taxonomy Operations
  const handleAddTaxItem = () => {
    if (!newTaxItem.trim()) return;
    const item = newTaxItem.trim();
    if (taxonomies[activeTaxCategory].includes(item)) {
      alert("This item already exists in this category.");
      return;
    }
    const updated = {
      ...taxonomies,
      [activeTaxCategory]: [...taxonomies[activeTaxCategory], item],
    };
    setTaxonomies(updated);
    setNewTaxItem("");
    saveTaxonomiesToServer(updated);
  };

  const handleSaveEditTaxItem = (index: number) => {
    if (!editingValue.trim()) return;
    const updatedList = [...taxonomies[activeTaxCategory]];
    updatedList[index] = editingValue.trim();
    const updated = {
      ...taxonomies,
      [activeTaxCategory]: updatedList,
    };
    setTaxonomies(updated);
    setEditingItemIndex(null);
    setEditingValue("");
    saveTaxonomiesToServer(updated);
  };

  const handleDeleteTaxItem = (index: number) => {
    const item = taxonomies[activeTaxCategory][index];
    if (!confirm(`Delete "${item}" from ${activeTaxCategory}?`)) return;
    const updatedList = taxonomies[activeTaxCategory].filter((_, i) => i !== index);
    const updated = {
      ...taxonomies,
      [activeTaxCategory]: updatedList,
    };
    setTaxonomies(updated);
    saveTaxonomiesToServer(updated);
  };

  const saveTaxonomiesToServer = async (updated: TaxonomyStore) => {
    setIsSavingTax(true);
    try {
      await fetch("/api/admin/taxonomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxonomies: updated }),
      });
      setTaxSaveSuccess(true);
      setTimeout(() => setTaxSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingTax(false);
    }
  };

  // Filtered churches
  const filteredChurches = churches.filter((c) => {
    const q = churchSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.denomination?.toLowerCase().includes(q)
    );
  });

  // Filtered pastors
  const filteredPastors = pastors.filter((p) => {
    const q = pastorSearch.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q)
    );
  });

  // Filtered events
  const filteredEvents = events.filter((e) => {
    const q = eventSearch.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.city?.toLowerCase().includes(q) ||
      e.venue_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "inherit" }}>
      {/* ── SIDEBAR ──────────────────────────────────────────────────────────── */}
      <aside style={{
        width: "260px",
        background: "#0f172a",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid #1e293b",
        padding: "24px 16px",
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
      }}>
        <div>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 10px 24px", borderBottom: "1px solid #1e293b" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg, #f43f5e, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
              ✝
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>ChurchNavigator</div>
              <span style={{ fontSize: "11px", color: "#f43f5e", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>Super Admin</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "13.5px",
                fontWeight: 700,
                border: "none",
                background: activeTab === "overview" ? "rgba(124, 58, 237, 0.25)" : "transparent",
                color: activeTab === "overview" ? "#c084fc" : "#94a3b8",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
              }}
            >
              <i className="ti ti-dashboard" style={{ fontSize: "18px" }}></i>
              Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab("churches")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "13.5px",
                fontWeight: 700,
                border: "none",
                background: activeTab === "churches" ? "rgba(124, 58, 237, 0.25)" : "transparent",
                color: activeTab === "churches" ? "#c084fc" : "#94a3b8",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <i className="ti ti-building-church" style={{ fontSize: "18px" }}></i>
                Churches
              </div>
              <span style={{ fontSize: "11px", background: "#1e293b", padding: "2px 8px", borderRadius: "10px", color: "#cbd5e1" }}>{metrics.totalChurches}</span>
            </button>

            <button
              onClick={() => setActiveTab("pastors")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "13.5px",
                fontWeight: 700,
                border: "none",
                background: activeTab === "pastors" ? "rgba(124, 58, 237, 0.25)" : "transparent",
                color: activeTab === "pastors" ? "#c084fc" : "#94a3b8",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <i className="ti ti-user-star" style={{ fontSize: "18px" }}></i>
                Pastors & Leaders
              </div>
              <span style={{ fontSize: "11px", background: "#1e293b", padding: "2px 8px", borderRadius: "10px", color: "#cbd5e1" }}>{metrics.totalPastors}</span>
            </button>

            <button
              onClick={() => setActiveTab("events")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "13.5px",
                fontWeight: 700,
                border: "none",
                background: activeTab === "events" ? "rgba(124, 58, 237, 0.25)" : "transparent",
                color: activeTab === "events" ? "#c084fc" : "#94a3b8",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <i className="ti ti-calendar-event" style={{ fontSize: "18px" }}></i>
                Events & Conferences
              </div>
              <span style={{ fontSize: "11px", background: "#1e293b", padding: "2px 8px", borderRadius: "10px", color: "#cbd5e1" }}>{metrics.totalEvents}</span>
            </button>

            <button
              onClick={() => setActiveTab("taxonomies")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "13.5px",
                fontWeight: 700,
                border: "none",
                background: activeTab === "taxonomies" ? "rgba(124, 58, 237, 0.25)" : "transparent",
                color: activeTab === "taxonomies" ? "#c084fc" : "#94a3b8",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <i className="ti ti-category" style={{ fontSize: "18px" }}></i>
              Taxonomies Manager
            </button>

            <button
              onClick={() => setActiveTab("users")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "13.5px",
                fontWeight: 700,
                border: "none",
                background: activeTab === "users" ? "rgba(124, 58, 237, 0.25)" : "transparent",
                color: activeTab === "users" ? "#c084fc" : "#94a3b8",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <i className="ti ti-users" style={{ fontSize: "18px" }}></i>
                Registered Users
              </div>
              <span style={{ fontSize: "11px", background: "#1e293b", padding: "2px 8px", borderRadius: "10px", color: "#cbd5e1" }}>{metrics.totalUsers}</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            href="/"
            style={{
              color: "#94a3b8",
              textDecoration: "none",
              fontSize: "12.5px",
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="ti ti-home"></i> Back to Main Site
          </Link>
        </div>
      </aside>


      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        
        {/* Top Title Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              {activeTab === "overview" && "Super Admin Command Center"}
              {activeTab === "churches" && "Churches Directory & Verification"}
              {activeTab === "pastors" && "Pastors & Ministers Directory"}
              {activeTab === "events" && "Events & Gatherings Moderation"}
              {activeTab === "taxonomies" && "Taxonomies & Category Manager"}
              {activeTab === "users" && "Registered Users & Accounts"}
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
              Manage verified listings, categories, and platform content in one place.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              style={{
                background: "linear-gradient(135deg, #16a34a, #059669)",
                color: "#ffffff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.28)",
              }}
            >
              <i className="ti ti-file-spreadsheet" style={{ fontSize: "16px" }}></i>
              Bulk Upload (Excel / CSV)
            </button>
          </div>
        </div>


        {/* ── 1. OVERVIEW TAB ──────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "36px" }}>
              
              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>Total Churches</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="ti ti-building-church" style={{ fontSize: "18px" }}></i>
                  </div>
                </div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a" }}>{metrics.totalChurches}</div>
                <div style={{ fontSize: "12.5px", color: "#16a34a", fontWeight: 700, marginTop: "4px" }}>
                  ✓ {metrics.verifiedChurches} Verified Churches
                </div>
              </div>

              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>Pastors / Leaders</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fff1f2", color: "#f43f5e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="ti ti-user-star" style={{ fontSize: "18px" }}></i>
                  </div>
                </div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a" }}>{metrics.totalPastors}</div>
                <div style={{ fontSize: "12.5px", color: "#16a34a", fontWeight: 700, marginTop: "4px" }}>
                  ✓ {metrics.verifiedPastors} Verified Ministers
                </div>
              </div>

              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>Events & Conferences</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="ti ti-calendar-event" style={{ fontSize: "18px" }}></i>
                  </div>
                </div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a" }}>{metrics.totalEvents}</div>
                <div style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 600, marginTop: "4px" }}>
                  Active platform gatherings
                </div>
              </div>

              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1.5px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>Registered Accounts</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0f9ff", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="ti ti-users" style={{ fontSize: "18px" }}></i>
                  </div>
                </div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a" }}>{metrics.totalUsers}</div>
                <div style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 600, marginTop: "4px" }}>
                  Church organizations
                </div>
              </div>

            </div>

            {/* Recent Churches Quick Table */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "24px", marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Recent Churches Added</h3>
                <button onClick={() => setActiveTab("churches")} style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                  View All &rarr;
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9", textAlign: "left", color: "#64748b", fontWeight: 700 }}>
                      <th style={{ padding: "10px 14px" }}>Church Name</th>
                      <th style={{ padding: "10px 14px" }}>Location</th>
                      <th style={{ padding: "10px 14px" }}>Denomination</th>
                      <th style={{ padding: "10px 14px" }}>Verification</th>
                      <th style={{ padding: "10px 14px" }}>Status</th>
                      <th style={{ padding: "10px 14px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {churches.slice(0, 5).map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>
                          <Link href={`/church/${c.slug}`} target="_blank" style={{ color: "inherit", textDecoration: "none" }}>
                            {c.name}
                          </Link>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#64748b" }}>{c.city || "—"}</td>
                        <td style={{ padding: "12px 14px", color: "#475569" }}>{c.denomination?.split("|||")[0] || "—"}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            onClick={() => handleToggleChurchVerification(c.id, Boolean(c.is_verified))}
                            style={{
                              border: "none",
                              borderRadius: "8px",
                              padding: "4px 10px",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              cursor: "pointer",
                              background: c.is_verified ? "#f0fdf4" : "#f1f5f9",
                              color: c.is_verified ? "#16a34a" : "#64748b",
                            }}
                          >
                            {c.is_verified ? "✓ Verified" : "+ Verify"}
                          </button>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: "11.5px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: c.status === "published" ? "#f0fdf4" : "#fffbeb", color: c.status === "published" ? "#16a34a" : "#d97706" }}>
                            {c.status || "published"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <Link href={`/church/${c.slug}`} target="_blank" style={{ fontSize: "12.5px", color: "#7c3aed", fontWeight: 700, textDecoration: "none", marginRight: "12px" }}>
                            View
                          </Link>
                          <Link href={`/church/${c.slug}?owner=true`} target="_blank" style={{ fontSize: "12.5px", color: "#0284c7", fontWeight: 700, textDecoration: "none" }}>
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ── 2. CHURCHES TAB ──────────────────────────────────────────────── */}
        {activeTab === "churches" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "24px" }}>
            {/* Search Input */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "16px" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                <i className="ti ti-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                <input
                  type="text"
                  placeholder="Search by church name, city, denomination..."
                  value={churchSearch}
                  onChange={(e) => setChurchSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#64748b" }}>
                Showing {filteredChurches.length} churches
              </div>
            </div>

            {/* Churches Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #e2e8f0", textAlign: "left", color: "#64748b", fontWeight: 800 }}>
                    <th style={{ padding: "12px 14px" }}>Church</th>
                    <th style={{ padding: "12px 14px" }}>Location</th>
                    <th style={{ padding: "12px 14px" }}>Denomination</th>
                    <th style={{ padding: "12px 14px" }}>Verification Badge</th>
                    <th style={{ padding: "12px 14px" }}>Visibility</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChurches.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#7c3aed" }}>
                            {c.name ? c.name.slice(0, 2).toUpperCase() : "CH"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>{c.name}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>slug: /{c.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px", color: "#475569" }}>{c.city || c.address_line || "—"}</td>
                      <td style={{ padding: "14px", color: "#475569" }}>{c.denomination?.split("|||")[0] || "—"}</td>
                      <td style={{ padding: "14px" }}>
                        <button
                          onClick={() => handleToggleChurchVerification(c.id, Boolean(c.is_verified))}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            background: c.is_verified ? "#f0fdf4" : "#f8fafc",
                            color: c.is_verified ? "#16a34a" : "#64748b",
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: c.is_verified ? "#bbf7d0" : "#e2e8f0",
                          }}
                        >
                          {c.is_verified ? "✓ Verified" : "+ Not Verified"}
                        </button>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <button
                          onClick={() => handleToggleChurchStatus(c.id, c.status || "published")}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            background: c.status === "published" ? "#f0fdf4" : "#fffbeb",
                            color: c.status === "published" ? "#16a34a" : "#d97706",
                          }}
                        >
                          {c.status === "published" ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <Link href={`/church/${c.slug}`} target="_blank" style={{ fontSize: "13px", color: "#7c3aed", fontWeight: 700, textDecoration: "none", marginRight: "12px" }}>
                          View
                        </Link>
                        <Link href={`/church/${c.slug}?owner=true`} target="_blank" style={{ fontSize: "13px", color: "#0284c7", fontWeight: 700, textDecoration: "none", marginRight: "12px" }}>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteChurch(c.id, c.name)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#e11d48",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ── 3. PASTORS TAB ───────────────────────────────────────────────── */}
        {activeTab === "pastors" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                <i className="ti ti-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                <input
                  type="text"
                  placeholder="Search pastors by name, title, city..."
                  value={pastorSearch}
                  onChange={(e) => setPastorSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#64748b" }}>
                Showing {filteredPastors.length} ministers
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #e2e8f0", textAlign: "left", color: "#64748b", fontWeight: 800 }}>
                    <th style={{ padding: "12px 14px" }}>Pastor / Minister</th>
                    <th style={{ padding: "12px 14px" }}>Title & Role</th>
                    <th style={{ padding: "12px 14px" }}>Location</th>
                    <th style={{ padding: "12px 14px" }}>Verification</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPastors.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {p.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.avatar_url} alt={p.full_name} style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                              {p.full_name?.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>{p.full_name}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>slug: /{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px", color: "#7c3aed", fontWeight: 700 }}>{p.title || "Minister"}</td>
                      <td style={{ padding: "14px", color: "#475569" }}>{p.city || p.country || "—"}</td>
                      <td style={{ padding: "14px" }}>
                        <button
                          onClick={() => handleTogglePastorVerification(p.id, Boolean(p.is_verified))}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            background: p.is_verified ? "#f0fdf4" : "#f8fafc",
                            color: p.is_verified ? "#16a34a" : "#64748b",
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: p.is_verified ? "#bbf7d0" : "#e2e8f0",
                          }}
                        >
                          {p.is_verified ? "✓ Verified" : "+ Not Verified"}
                        </button>
                      </td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <Link href={`/pastor/${p.slug}`} target="_blank" style={{ fontSize: "13px", color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>
                          View Profile &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ── 4. EVENTS TAB ────────────────────────────────────────────────── */}
        {activeTab === "events" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                <i className="ti ti-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                <input
                  type="text"
                  placeholder="Search events by title, city, venue..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#64748b" }}>
                Showing {filteredEvents.length} events
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #e2e8f0", textAlign: "left", color: "#64748b", fontWeight: 800 }}>
                    <th style={{ padding: "12px 14px" }}>Event Title</th>
                    <th style={{ padding: "12px 14px" }}>Date & Time</th>
                    <th style={{ padding: "12px 14px" }}>Location / Venue</th>
                    <th style={{ padding: "12px 14px" }}>Price</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((ev) => (
                    <tr key={ev.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px", fontWeight: 800, color: "#0f172a" }}>{ev.title}</td>
                      <td style={{ padding: "14px", color: "#e11d48", fontWeight: 700 }}>
                        {ev.starts_at ? new Date(ev.starts_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td style={{ padding: "14px", color: "#475569" }}>{ev.venue_name || ev.city || "—"}</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: 800, background: "#f5f3ff", color: "#7c3aed", padding: "3px 8px", borderRadius: "6px" }}>
                          {ev.price_label || "Free"}
                        </span>
                      </td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <Link href={`/events/${ev.slug}`} target="_blank" style={{ fontSize: "13px", color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>
                          View Event &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ── 5. TAXONOMIES MANAGER TAB ────────────────────────────────────── */}
        {activeTab === "taxonomies" && (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px" }}>
            
            {/* Category Selector Tabs */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "16px", display: "flex", flexDirection: "column", gap: "6px", height: "fit-content" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", padding: "8px 10px" }}>
                Taxonomy Categories
              </div>

              {[
                { id: "denominations", label: "Denominations", icon: "ti-cross", count: taxonomies.denominations.length },
                { id: "worshipStyles", label: "Worship Styles", icon: "ti-music", count: taxonomies.worshipStyles.length },
                { id: "ministries", label: "Ministries", icon: "ti-heart-handshake", count: taxonomies.ministries.length },
                { id: "facilities", label: "Facilities", icon: "ti-building", count: taxonomies.facilities.length },
                { id: "languages", label: "Languages", icon: "ti-world", count: taxonomies.languages.length },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTaxCategory(cat.id as any);
                    setEditingItemIndex(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    border: "none",
                    background: activeTaxCategory === cat.id ? "#f5f3ff" : "transparent",
                    color: activeTaxCategory === cat.id ? "#7c3aed" : "#475569",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className={`ti ${cat.icon}`}></i>
                    {cat.label}
                  </div>
                  <span style={{ fontSize: "11px", background: activeTaxCategory === cat.id ? "#e9d5ff" : "#f1f5f9", padding: "2px 7px", borderRadius: "8px" }}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Items Editor Box */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "28px" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "19px", fontWeight: 900, color: "#0f172a", margin: 0, textTransform: "capitalize" }}>
                    {activeTaxCategory.replace(/([A-Z])/g, " $1")}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "3px 0 0" }}>
                    Add, edit or remove items in this taxonomy. Changes reflect globally across filters and forms.
                  </p>
                </div>

                {taxSaveSuccess && (
                  <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "4px 12px", borderRadius: "8px" }}>
                    ✓ Saved to Server
                  </span>
                )}
              </div>

              {/* Add New Item Input */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                <input
                  type="text"
                  placeholder={`Add new ${activeTaxCategory.slice(0, -1)}...`}
                  value={newTaxItem}
                  onChange={(e) => setNewTaxItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTaxItem();
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleAddTaxItem}
                  style={{
                    background: "#7c3aed",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "10px 20px",
                    fontWeight: 800,
                    fontSize: "13.5px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <i className="ti ti-plus"></i> Add Item
                </button>
              </div>

              {/* List of items */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                {taxonomies[activeTaxCategory].map((item, index) => {
                  const isEditing = editingItemIndex === index;

                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        border: "1.5px solid #f1f5f9",
                        background: isEditing ? "#faf5ff" : "#f8fafc",
                        gap: "8px",
                      }}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEditTaxItem(index);
                          }}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1.5px solid #c084fc",
                            fontSize: "13px",
                            outline: "none",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e293b" }}>
                          {item}
                        </span>
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEditTaxItem(index)}
                              style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingItemIndex(null)}
                              style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingItemIndex(index);
                                setEditingValue(item);
                              }}
                              title="Edit Item"
                              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
                            >
                              <i className="ti ti-edit" style={{ fontSize: "15px" }}></i>
                            </button>
                            <button
                              onClick={() => handleDeleteTaxItem(index)}
                              title="Delete Item"
                              style={{ background: "none", border: "none", color: "#f43f5e", cursor: "pointer", padding: "4px" }}
                            >
                              <i className="ti ti-trash" style={{ fontSize: "15px" }}></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

        {/* ── 6. USERS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "24px" }}>
            {/* Search & Summary Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                <i className="ti ti-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#64748b" }}>
                {usersList.filter((u) => {
                  const q = userSearch.toLowerCase();
                  return !q || u.email?.toLowerCase().includes(q) || u.user_metadata?.full_name?.toLowerCase().includes(q);
                }).length} users registered
              </div>
            </div>

            {/* Users Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #e2e8f0", textAlign: "left", color: "#64748b", fontWeight: 800 }}>
                    <th style={{ padding: "12px 14px" }}>User</th>
                    <th style={{ padding: "12px 14px" }}>Email</th>
                    <th style={{ padding: "12px 14px" }}>Sign-in Method</th>
                    <th style={{ padding: "12px 14px" }}>User Role</th>
                    <th style={{ padding: "12px 14px" }}>Email Verified</th>
                    <th style={{ padding: "12px 14px" }}>Joined</th>
                    <th style={{ padding: "12px 14px" }}>Last Sign-in</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList
                    .filter((u) => {
                      const q = userSearch.toLowerCase();
                      return !q || u.email?.toLowerCase().includes(q) || u.user_metadata?.full_name?.toLowerCase().includes(q);
                    })
                    .map((u) => {
                      const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "—";
                      const avatar = u.user_metadata?.avatar_url || u.user_metadata?.picture || null;
                      const providers: string[] = u.app_metadata?.providers || (u.app_metadata?.provider ? [u.app_metadata.provider] : ["email"]);
                      const isGoogle = providers.includes("google");
                      const isEmailPass = providers.includes("email") || providers.includes("password");
                      const userRole = u.user_metadata?.role || u.app_metadata?.role || "listing_manager";

                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          {/* Avatar + Name */}
                          <td style={{ padding: "14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatar} alt={name} style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px" }}>
                                  {name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span style={{ fontWeight: 700, color: "#0f172a" }}>{name}</span>
                            </div>
                          </td>

                          {/* Email */}
                          <td style={{ padding: "14px", color: "#475569" }}>{u.email || "—"}</td>

                          {/* Sign-in Provider Badges */}
                          <td style={{ padding: "14px" }}>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {isGoogle && (
                                <span style={{ fontSize: "11.5px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                                  🔵 Google
                                </span>
                              )}
                              {isEmailPass && (
                                <span style={{ fontSize: "11.5px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" }}>
                                  ✉️ Email
                                </span>
                              )}
                              {!isGoogle && !isEmailPass && providers.map((p) => (
                                <span key={p} style={{ fontSize: "11.5px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", background: "#f5f3ff", color: "#7c3aed" }}>
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Role Selector */}
                          <td style={{ padding: "14px" }}>
                            <select
                              value={userRole}
                              onChange={(e) => handleUserRoleChange(u.id, e.target.value as any)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "8px",
                                border: "1.5px solid #e2e8f0",
                                fontSize: "12px",
                                fontWeight: 800,
                                background: userRole === "super_admin" ? "#fdf2f8" : userRole === "listing_manager" ? "#f5f3ff" : "#f8fafc",
                                color: userRole === "super_admin" ? "#be185d" : userRole === "listing_manager" ? "#7c3aed" : "#64748b",
                                cursor: "pointer",
                                outline: "none",
                              }}
                            >
                              <option value="listing_manager">Listing Manager</option>
                              <option value="super_admin">Super Admin</option>
                              <option value="visitor">Visitor</option>
                            </select>
                          </td>

                          {/* Email Verified */}
                          <td style={{ padding: "14px" }}>
                            <span style={{ fontSize: "11.5px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", background: u.email_confirmed_at ? "#f0fdf4" : "#fff7ed", color: u.email_confirmed_at ? "#16a34a" : "#c2410c" }}>
                              {u.email_confirmed_at ? "✓ Verified" : "Pending"}
                            </span>
                          </td>

                          {/* Joined Date */}
                          <td style={{ padding: "14px", color: "#64748b", fontSize: "13px" }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>

                          {/* Last Sign-in */}
                          <td style={{ padding: "14px", color: "#94a3b8", fontSize: "13px" }}>
                            {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Never"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {usersList.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8", fontSize: "14px" }}>
                  No users found.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={(type, inserted) => {
          if (type === "churches") {
            setChurches((prev) => [...inserted, ...prev]);
          } else if (type === "pastors") {
            setPastors((prev) => [...inserted, ...prev]);
          } else if (type === "events") {
            setEvents((prev) => [...inserted, ...prev]);
          }
        }}
      />
    </div>
  );
}
