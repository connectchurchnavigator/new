import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { slugifyName, withUniqueSuffix } from "@/lib/slug";

export const dynamic = "force-dynamic";

// Helper to lookup geocoordinates for UK postcodes or addresses
async function geocodeAddress(address: string, postcode: string, city: string) {
  const query = (postcode || `${address}, ${city}`).trim();
  if (!query) return { lat: null, lon: null };

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: { "User-Agent": "ChurchNavigatorApp/1.0 (info@churchnavigator.com)" },
      }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
  }
  return { lat: null, lon: null };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, records } = body as { type: "churches" | "pastors" | "events"; records: any[] };

    if (!type || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "Invalid payload or empty records list" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const insertedRecords: any[] = [];
    const errors: any[] = [];

    // ── 1. IMPORT CHURCHES ──────────────────────────────────────────────────────────
    if (type === "churches") {
      for (let i = 0; i < records.length; i++) {
        const r = records[i];
        const name = r.name || r.ChurchName || r.church_name || `Church ${i + 1}`;
        if (!name || !name.trim()) continue;

        try {
          // Generate unique slug
          let baseSlug = slugifyName(name) || "church";
          let slug = baseSlug;
          for (let attempt = 0; attempt < 5; attempt++) {
            const { data: existing } = await supabase.from("churches").select("id").eq("slug", slug).maybeSingle();
            if (!existing) break;
            slug = withUniqueSuffix(baseSlug);
          }

          // Parse arrays from comma-separated strings or JSON
          const parseList = (val: any): string[] => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === "string") {
              if (val.startsWith("[") && val.endsWith("]")) {
                try { return JSON.parse(val); } catch (e) {}
              }
              return val.split(",").map((s) => s.trim()).filter(Boolean);
            }
            return [];
          };

          const city = r.city || r.City || null;
          const address_line = r.address || r.Address || r.address_line || null;
          const area = r.area || r.Area || null;
          const state = r.state || r.State || r.county || null;
          const postcode = r.postcode || r.Postcode || r.zip || null;
          const country = r.country || r.Country || "United Kingdom";
          const country_code = r.country_code || r.CountryCode || "GB";
          const denomination = r.denomination || r.Denomination || null;
          const about = r.about || r.About || r.description || r.Description || null;
          
          const phone = r.phone || r.Phone || null;
          const email = r.email || r.Email || null;
          const website = r.website || r.website_url || r.Website || null;

          // Socials & Live links
          const facebook = r.facebook || r.Facebook || r.social_facebook || null;
          const instagram = r.instagram || r.Instagram || r.social_instagram || null;
          const youtube = r.youtube || r.YouTube || r.social_youtube || null;
          const twitter = r.twitter || r.Twitter || r.social_twitter || null;
          const tiktok = r.tiktok || r.TikTok || r.social_tiktok || null;
          const telegram = r.telegram || r.Telegram || r.social_telegram || null;
          const livestream = r.livestream || r.live_stream_url || r.Livestream || null;

          // Media & Branding
          const cover_url = r.cover_url || r.CoverUrl || r.cover_image || null;
          const logo_url = r.logo_url || r.LogoUrl || r.logo_image || null;
          const gallery = parseList(r.gallery || r.Gallery || r.gallery_images);

          // Categorical Taxonomies
          const worship_style = parseList(r.worship_style || r.worship_styles || r.WorshipStyle);
          const ministries = parseList(r.ministries || r.Ministries);
          const facilities = parseList(r.facilities || r.Facilities);
          const languages = parseList(r.languages || r.Languages);

          let latitude = r.latitude ? Number(r.latitude) : null;
          let longitude = r.longitude ? Number(r.longitude) : null;

          if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
            const coords = await geocodeAddress(address_line || "", postcode || "", city || "");
            latitude = coords.lat;
            longitude = coords.lon;
          }

          const churchPayload = {
            slug,
            name: name.trim(),
            about: about ? about.trim() : null,
            city: city ? city.trim() : null,
            area: area ? area.trim() : null,
            state: state ? state.trim() : null,
            address_line: address_line ? address_line.trim() : null,
            postcode: postcode ? postcode.trim() : null,
            country: country ? country.trim() : "United Kingdom",
            country_code: country_code ? country_code.trim() : "GB",
            denomination: denomination ? denomination.trim() : null,
            phone: phone ? String(phone).trim() : null,
            email: email ? String(email).trim() : null,
            website: website ? String(website).trim() : null,
            facebook,
            instagram,
            youtube,
            twitter,
            tiktok,
            telegram,
            livestream,
            cover_url,
            logo_url,
            gallery,
            worship_style,
            worship_styles: worship_style,
            ministries,
            facilities,
            languages,
            latitude,
            longitude,
            status: "published",
            is_verified: Boolean(r.is_verified || r.verified === "true" || r.verified === true),
          };

          const { data: church, error: insertError } = await supabase
            .from("churches")
            .insert(churchPayload)
            .select()
            .single();

          if (insertError) {
            errors.push({ row: i + 1, name, error: insertError.message });
          } else {
            insertedRecords.push(church);

            // Optional 1: insert service time if present in row
            const serviceDay = r.service_day || r.ServiceDay || "Sunday";
            const serviceTime = r.service_time || r.ServiceTime || r.start_time || null;
            const serviceName = r.service_name || r.ServiceName || "Sunday Celebration Service";
            const serviceEndTime = r.service_end_time || r.end_time || null;
            const serviceFormat = r.service_format || r.format || "inperson";

            if (serviceTime && church?.id) {
              await supabase.from("church_services").insert({
                church_id: church.id,
                day: serviceDay,
                name: serviceName,
                start_time: serviceTime,
                end_time: serviceEndTime,
                format: serviceFormat,
              });
            }

            // Optional 2: insert lead pastor if present in row
            const pastorName = r.pastor_name || r.lead_pastor || r.PastorName || null;
            if (pastorName && church?.id) {
              await supabase.from("leaders").insert({
                church_id: church.id,
                name: pastorName.trim(),
                role: r.pastor_title || r.PastorTitle || "Senior Pastor",
                bio: r.pastor_bio || r.PastorBio || null,
                photo_url: r.pastor_photo || r.PastorPhoto || null,
                is_lead: true,
                display_order: 1,
              });
            }
          }
        } catch (err: any) {
          errors.push({ row: i + 1, name, error: err?.message });
        }
      }
    }

    // ── 2. IMPORT PASTORS ───────────────────────────────────────────────────────────
    else if (type === "pastors") {
      for (let i = 0; i < records.length; i++) {
        const r = records[i];
        const full_name = r.name || r.full_name || r.FullName || r.PastorName;
        if (!full_name || !full_name.trim()) continue;

        try {
          let baseSlug = slugifyName(full_name) || "pastor";
          let slug = baseSlug;
          for (let attempt = 0; attempt < 5; attempt++) {
            const { data: existing } = await supabase.from("pastors").select("id").eq("slug", slug).maybeSingle();
            if (!existing) break;
            slug = withUniqueSuffix(baseSlug);
          }

          const pastorPayload = {
            slug,
            full_name: full_name.trim(),
            title: r.title || r.Title || "Pastor",
            city: r.city || r.City || null,
            country: r.country || r.Country || "United Kingdom",
            bio: r.bio || r.Bio || null,
            email: r.email || r.Email || null,
            phone: r.phone || r.Phone || null,
            church_name_cache: r.church_name || r.ChurchName || null,
            years_in_ministry: r.years_in_ministry ? Number(r.years_in_ministry) : null,
            is_verified: Boolean(r.is_verified || r.verified === "true" || r.verified === true),
            is_published: true,
          };

          const { data: pastor, error: insertError } = await supabase
            .from("pastors")
            .insert(pastorPayload)
            .select()
            .single();

          if (insertError) {
            errors.push({ row: i + 1, name: full_name, error: insertError.message });
          } else {
            insertedRecords.push(pastor);
          }
        } catch (err: any) {
          errors.push({ row: i + 1, name: full_name, error: err?.message });
        }
      }
    }

    // ── 3. IMPORT EVENTS ───────────────────────────────────────────────────────────
    else if (type === "events") {
      for (let i = 0; i < records.length; i++) {
        const r = records[i];
        const title = r.title || r.EventTitle || r.name;
        if (!title || !title.trim()) continue;

        try {
          let baseSlug = slugifyName(title) || "event";
          let slug = baseSlug;
          for (let attempt = 0; attempt < 5; attempt++) {
            const { data: existing } = await supabase.from("events").select("id").eq("slug", slug).maybeSingle();
            if (!existing) break;
            slug = withUniqueSuffix(baseSlug);
          }

          const eventPayload = {
            slug,
            title: title.trim(),
            type: r.type || r.EventType || "Conference",
            venue_name: r.venue || r.Venue || r.venue_name || null,
            city: r.city || r.City || null,
            address: r.address || r.Address || null,
            postcode: r.postcode || r.Postcode || null,
            starts_at: r.starts_at || r.start_date || new Date().toISOString(),
            ends_at: r.ends_at || r.end_date || null,
            description: r.description || r.Description || null,
            price_label: r.price_label || r.Price || (r.is_free === "true" || r.is_free === true ? "Free" : "Ticketed"),
            is_free: Boolean(r.is_free === "true" || r.is_free === true || !r.price),
            status: "published",
          };

          const { data: event, error: insertError } = await supabase
            .from("events")
            .insert(eventPayload)
            .select()
            .single();

          if (insertError) {
            errors.push({ row: i + 1, name: title, error: insertError.message });
          } else {
            insertedRecords.push(event);
          }
        } catch (err: any) {
          errors.push({ row: i + 1, name: title, error: err?.message });
        }
      }
    }

    return NextResponse.json({
      success: true,
      insertedCount: insertedRecords.length,
      errorsCount: errors.length,
      errors,
      insertedRecords,
    });
  } catch (error: any) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process bulk upload" }, { status: 500 });
  }
}
