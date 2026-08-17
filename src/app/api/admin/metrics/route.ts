import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch counts and records in parallel
    const [
      churchesRes,
      pastorsRes,
      eventsRes,
      usersRes,
      recentChurchesRes,
      recentPastorsRes,
      recentEventsRes,
    ] = await Promise.all([
      supabase.from("churches").select("id, is_verified, status", { count: "exact" }),
      supabase.from("pastors").select("id, is_verified, is_published", { count: "exact" }),
      supabase.from("events").select("id, status", { count: "exact" }),
      supabase.from("organizations").select("id", { count: "exact" }),
      supabase
        .from("churches")
        .select("id, name, slug, city, denomination, is_verified, status, created_at, cover_url, logo_url")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("pastors")
        .select("id, full_name, slug, title, city, is_verified, is_published, created_at, avatar_url")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("events")
        .select("id, title, slug, starts_at, city, price_label, status, created_at")
        .order("starts_at", { ascending: true })
        .limit(10),
    ]);

    const totalChurches = churchesRes.count || 0;
    const verifiedChurches = (churchesRes.data || []).filter((c) => c.is_verified).length;
    const totalPastors = pastorsRes.count || 0;
    const verifiedPastors = (pastorsRes.data || []).filter((p) => p.is_verified).length;
    const totalEvents = eventsRes.count || 0;
    const totalUsers = usersRes.count || 0;

    return NextResponse.json({
      metrics: {
        totalChurches,
        verifiedChurches,
        totalPastors,
        verifiedPastors,
        totalEvents,
        totalUsers,
      },
      recentChurches: recentChurchesRes.data || [],
      recentPastors: recentPastorsRes.data || [],
      recentEvents: recentEventsRes.data || [],
    });
  } catch (error: any) {
    console.error("Superadmin metrics error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load superadmin metrics" }, { status: 500 });
  }
}
