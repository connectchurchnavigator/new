import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { INITIAL_TAXONOMIES, TaxonomyStore } from "@/lib/taxonomies";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const LOCAL_TAXONOMIES_FILE = path.join(process.cwd(), "taxonomies.json");

function readLocalTaxonomies(): TaxonomyStore | null {
  try {
    if (fs.existsSync(LOCAL_TAXONOMIES_FILE)) {
      const content = fs.readFileSync(LOCAL_TAXONOMIES_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        return {
          denominations: Array.isArray(parsed.denominations) ? parsed.denominations : INITIAL_TAXONOMIES.denominations,
          worshipStyles: Array.isArray(parsed.worshipStyles) ? parsed.worshipStyles : INITIAL_TAXONOMIES.worshipStyles,
          ministries: Array.isArray(parsed.ministries) ? parsed.ministries : INITIAL_TAXONOMIES.ministries,
          facilities: Array.isArray(parsed.facilities) ? parsed.facilities : INITIAL_TAXONOMIES.facilities,
          languages: Array.isArray(parsed.languages) ? parsed.languages : INITIAL_TAXONOMIES.languages,
          ministryExperience: Array.isArray(parsed.ministryExperience) ? parsed.ministryExperience : (INITIAL_TAXONOMIES.ministryExperience || []),
          skills: Array.isArray(parsed.skills) ? parsed.skills : (INITIAL_TAXONOMIES.skills || []),
          rolesInterested: Array.isArray(parsed.rolesInterested) ? parsed.rolesInterested : (INITIAL_TAXONOMIES.rolesInterested || []),
          training: Array.isArray(parsed.training) ? parsed.training : (INITIAL_TAXONOMIES.training || []),

        };
      }
    }
  } catch (err) {
    console.error("Error reading local taxonomies file:", err);
  }
  return null;
}

function writeLocalTaxonomies(tax: TaxonomyStore): boolean {
  try {
    fs.writeFileSync(LOCAL_TAXONOMIES_FILE, JSON.stringify(tax, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing local taxonomies file:", err);
    return false;
  }
}

export async function GET() {
  try {
    // 1. Check if customized taxonomies exist in Supabase settings table first
    try {
      const supabase = createAdminClient();
      const { data: setting, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "taxonomies")
        .maybeSingle();

      if (!error && setting?.value && typeof setting.value === "object") {
        // Cache to local file as backup
        writeLocalTaxonomies(setting.value as TaxonomyStore);
        return NextResponse.json({ taxonomies: setting.value });
      }
    } catch (e) {
      // Supabase connection or table error, fallback to local file
    }

    // 2. Fallback to local persistent file
    const localData = readLocalTaxonomies();
    if (localData) {
      return NextResponse.json({ taxonomies: localData });
    }

    return NextResponse.json({ taxonomies: INITIAL_TAXONOMIES });
  } catch (error: any) {
    return NextResponse.json({ taxonomies: INITIAL_TAXONOMIES });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taxonomies } = body as { taxonomies: TaxonomyStore };

    if (!taxonomies) {
      return NextResponse.json({ error: "Invalid taxonomies payload" }, { status: 400 });
    }

    // 1. Always write locally so persistence works immediately and 100% reliably
    writeLocalTaxonomies(taxonomies);

    // 2. Also try Supabase settings table if present
    try {
      const supabase = createAdminClient();
      await supabase
        .from("settings")
        .upsert({ key: "taxonomies", value: taxonomies }, { onConflict: "key" });
    } catch (e) {
      // Ignore if settings table does not exist
    }

    return NextResponse.json({ success: true, taxonomies });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

