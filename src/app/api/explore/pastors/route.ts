import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const revalidate = 60; // Cache on CDN / edge for 60s

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: pastors, error } = await supabase
      .from("pastors")
      .select("*, church:churches(name, slug, latitude, longitude, city, denomination), tags:pastor_tags(*), languages:pastor_languages(language), education:pastor_education(*)")
      .eq("is_published", true)
      .order("is_verified", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(pastors || [], {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch pastors" }, { status: 500 });
  }
}
