import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const revalidate = 60; // Cache on CDN / edge for 60s

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: worshipLeaders, error } = await supabase
      .from("worship_leaders")
      .select("*, tags:worship_leader_tags(*)")
      .eq("is_published", true)
      .order("is_verified", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(worshipLeaders || [], {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch worship leaders" }, { status: 500 });
  }
}
