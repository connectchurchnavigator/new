import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = (searchParams.get("category") || searchParams.get("type") || "church").trim().toLowerCase();
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 20);

    if (!q) {
      return NextResponse.json([]);
    }

    const supabase = createAdminClient();

    if (category === "pastor" || category === "pastors") {
      const { data, error } = await supabase
        .from("pastors")
        .select("id, slug, full_name, title, avatar_url, city, denomination, is_verified, church:churches(name, city, denomination)")
        .eq("is_published", true)
        .or(`full_name.ilike.%${q}%,title.ilike.%${q}%,city.ilike.%${q}%,denomination.ilike.%${q}%`)
        .limit(limit);

      if (error) throw error;
      const formatted = (data || []).map((p: any) => ({
        id: p.id,
        name: p.full_name,
        subtext: p.title || (Array.isArray(p.church) ? p.church[0]?.name : p.church?.name) || "Pastor / Minister",
        slug: p.slug ? `/pastor/${p.slug}` : `/explore?type=pastors&q=${encodeURIComponent(p.full_name)}`,
        city: p.city || (Array.isArray(p.church) ? p.church[0]?.city : p.church?.city) || null,
        denomination: p.denomination || (Array.isArray(p.church) ? p.church[0]?.denomination : p.church?.denomination) || null,
        thumb_url: p.avatar_url,
        is_verified: p.is_verified,
        category: "pastor",
      }));
      return NextResponse.json(formatted);
    }

    if (category === "event" || category === "events") {
      const { data, error } = await supabase
        .from("events")
        .select("id, slug, title, type, cover_url, city, venue_name, starts_at, host_church:churches(name)")
        .eq("status", "published")
        .or(`title.ilike.%${q}%,city.ilike.%${q}%,venue_name.ilike.%${q}%`)
        .limit(limit);

      if (error) throw error;
      const formatted = (data || []).map((e: any) => ({
        id: e.id,
        name: e.title,
        subtext: e.venue_name || (Array.isArray(e.host_church) ? e.host_church[0]?.name : e.host_church?.name) || e.type || "Event",
        slug: e.slug ? `/events/${e.slug}` : `/explore?type=events&q=${encodeURIComponent(e.title)}`,
        city: e.city || null,
        denomination: null,
        thumb_url: e.cover_url,
        is_verified: false,
        category: "event",
      }));
      return NextResponse.json(formatted);
    }

    if (
      category === "worshipleader" ||
      category === "worshipleaders" ||
      category === "worship_leader" ||
      category === "worship_leaders" ||
      category === "worship-leader"
    ) {
      const { data, error } = await supabase
        .from("worship_leaders")
        .select("id, slug, display_name, tagline, avatar_url, city, is_verified")
        .eq("is_published", true)
        .or(`display_name.ilike.%${q}%,tagline.ilike.%${q}%,city.ilike.%${q}%`)
        .limit(limit);

      if (error) throw error;
      const formatted = (data || []).map((w: any) => ({
        id: w.id,
        name: w.display_name,
        subtext: w.tagline || "Worship Leader",
        slug: w.slug ? `/worship-leader/${w.slug}` : `/explore?type=worship_leaders&q=${encodeURIComponent(w.display_name)}`,
        city: w.city || null,
        denomination: null,
        thumb_url: w.avatar_url,
        is_verified: w.is_verified,
        category: "worship_leader",
      }));
      return NextResponse.json(formatted);
    }

    // Default: church
    const { data, error } = await supabase
      .from("churches")
      .select("id, name, slug, city, postcode, denomination, logo_url, cover_url, is_verified, address_line")
      .eq("status", "published")
      .or(`name.ilike.%${q}%,city.ilike.%${q}%,denomination.ilike.%${q}%,postcode.ilike.%${q}%`)
      .limit(limit);

    if (error) throw error;
    const formatted = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      subtext: c.denomination || c.city || "Church",
      slug: c.slug ? `/church/${c.slug}` : `/explore?type=churches&q=${encodeURIComponent(c.name)}`,
      city: c.city || null,
      denomination: c.denomination || null,
      thumb_url: c.logo_url || c.cover_url,
      is_verified: c.is_verified,
      category: "church",
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
