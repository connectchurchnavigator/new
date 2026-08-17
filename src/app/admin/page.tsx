import React from "react";
import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Super Admin Command Center | ChurchNavigator",
  description: "Manage churches, verified badges, pastors, events, and taxonomies.",
};

export const revalidate = 0; // Dynamic SSR

export default async function AdminPage() {
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
