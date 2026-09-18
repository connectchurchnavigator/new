import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase-admin";

export interface FeaturedConfig {
  churchIds: string[];
  pastorIds: string[];
  worshipLeaderIds: string[];
  eventIds: string[];
}

export const DEFAULT_FEATURED: FeaturedConfig = {
  churchIds: [],
  pastorIds: [],
  worshipLeaderIds: [],
  eventIds: [],
};

// Local storage fallback file path in project directory
const LOCAL_FEATURED_FILE = path.join(process.cwd(), "featured_items.json");

function readLocalFeatured(): FeaturedConfig {
  try {
    if (fs.existsSync(LOCAL_FEATURED_FILE)) {
      const content = fs.readFileSync(LOCAL_FEATURED_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return {
        churchIds: Array.isArray(parsed.churchIds) ? parsed.churchIds : [],
        pastorIds: Array.isArray(parsed.pastorIds) ? parsed.pastorIds : [],
        worshipLeaderIds: Array.isArray(parsed.worshipLeaderIds) ? parsed.worshipLeaderIds : [],
        eventIds: Array.isArray(parsed.eventIds) ? parsed.eventIds : [],
      };
    }
  } catch (err) {
    console.error("Error reading local featured file:", err);
  }
  return DEFAULT_FEATURED;
}

function writeLocalFeatured(config: FeaturedConfig): boolean {
  try {
    fs.writeFileSync(LOCAL_FEATURED_FILE, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing local featured file:", err);
    return false;
  }
}

export async function getFeaturedConfig(): Promise<FeaturedConfig> {
  // 1. Try Supabase settings table
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "featured_items")
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      return {
        churchIds: Array.isArray(data.value.churchIds) ? data.value.churchIds : [],
        pastorIds: Array.isArray(data.value.pastorIds) ? data.value.pastorIds : [],
        worshipLeaderIds: Array.isArray(data.value.worshipLeaderIds) ? data.value.worshipLeaderIds : [],
        eventIds: Array.isArray(data.value.eventIds) ? data.value.eventIds : [],
      };
    }
  } catch (err) {
    // Supabase table does not exist or failed
  }

  // 2. Fallback to local persistent JSON file
  return readLocalFeatured();
}

export async function saveFeaturedConfig(config: FeaturedConfig): Promise<boolean> {
  // Always save locally first to guarantee zero failure
  const localOk = writeLocalFeatured(config);

  // Then attempt to persist to Supabase settings if table exists
  try {
    const supabase = createAdminClient();
    await supabase
      .from("settings")
      .upsert(
        { key: "featured_items", value: config },
        { onConflict: "key" }
      );
  } catch (err) {
    // Non-fatal if table doesn't exist
  }

  return localOk;
}
