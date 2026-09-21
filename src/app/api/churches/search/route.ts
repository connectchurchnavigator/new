import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const city = searchParams.get("city")?.trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10), 20);

    if (!q && !city) {
      return NextResponse.json([]);
    }

    const supabase = createAdminClient();
    let query = supabase
      .from("churches")
      .select("id, name, slug, city, postcode, denomination, logo_url, cover_url, is_verified, address_line")
      .eq("status", "published")
      .limit(limit);

    if (q) {
      // Search in name, city, denomination, or postcode
      query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,denomination.ilike.%${q}%,postcode.ilike.%${q}%`);
    }

    if (city) {
      query = query.ilike("city", `%${city}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
