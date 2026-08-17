import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Super Admin Command Center | ChurchNavigator",
  description: "Manage churches, verified badges, pastors, events, taxonomies, and user roles.",
};

export const revalidate = 0; // Dynamic SSR

export default async function AdminPage() {
  // 1. Verify User Authentication & Super Admin Role Guard
  const serverSupabase = await createServerSupabaseClient();
  const { data: { user } } = await serverSupabase.auth.getUser();

  // Allow override via environment variable if defined, or check user metadata/role
  const adminEmails = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = user?.email?.toLowerCase() || "";
  const isSuperAdminByEmail = adminEmails.length > 0 ? adminEmails.includes(userEmail) : false;
  const isSuperAdminByRole = user?.user_metadata?.role === "super_admin" || user?.app_metadata?.role === "super_admin";

  // If user is logged in but NOT a super admin (and admin emails list is defined or role is missing), grant access if dev or admin
  // For production security: If user is not logged in, redirect to login.
  if (!user) {
    redirect("/login?next=/admin");
  }

  // If role check fails and explicit admin email list exists, deny access
  if (adminEmails.length > 0 && !isSuperAdminByEmail && !isSuperAdminByRole) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "sans-serif" }}>
        <div style={{ background: "#ffffff", padding: "40px", borderRadius: "20px", border: "1.5px solid #fecdd3", maxWidth: "450px", textAlign: "center", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "28px" }}>
            🔒
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", margin: "0 0 8px" }}>Access Restricted</h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px", lineHeight: 1.5 }}>
            You are logged in as <strong>{user.email}</strong>, but your account does not have Super Admin privileges to access this command center.
          </p>
          <a href="/" style={{ background: "#7c3aed", color: "#ffffff", textDecoration: "none", padding: "10px 20px", borderRadius: "12px", fontSize: "13.5px", fontWeight: 800, display: "inline-block" }}>
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();

  // Fetch all churches, pastors, events, and auth users in parallel
  const [churchesRes, pastorsRes, eventsRes, usersRes] = await Promise.all([
    supabase
      .from("churches")
      .select("id, name, slug, city, address_line, denomination, is_verified, status, created_at, cover_url, logo_url")
      .order("created_at", { ascending: false }),
    supabase
      .from("pastors")
      .select("id, full_name, slug, title, city, country, is_verified, is_published, created_at, avatar_url")
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select("id, title, slug, starts_at, city, venue_name, price_label, status, created_at")
      .order("starts_at", { ascending: true }),
    // Fetch signed-up users from Supabase Auth (admin API)
    supabase.auth.admin.listUsers({ perPage: 500 }),
  ]);

  const churches = churchesRes.data || [];
  const pastors = pastorsRes.data || [];
  const events = eventsRes.data || [];
  const users = usersRes.data?.users || [];

  const metrics = {
    totalChurches: churches.length,
    verifiedChurches: churches.filter((c) => c.is_verified).length,
    totalPastors: pastors.length,
    verifiedPastors: pastors.filter((p) => p.is_verified).length,
    totalEvents: events.length,
    totalUsers: users.length,
  };

  return (
    <AdminClient
      initialChurches={churches}
      initialPastors={pastors}
      initialEvents={events}
      initialUsers={users}
      metrics={metrics}
    />
  );
}
