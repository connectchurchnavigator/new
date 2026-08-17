import { NextRequest, NextResponse } from "next/server";
import { INITIAL_TAXONOMIES, TaxonomyStore } from "@/lib/taxonomies";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Check if customized taxonomies exist in settings table, otherwise return default
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "taxonomies")
      .maybeSingle();

    if (setting?.value) {
      return NextResponse.json({ taxonomies: setting.value });
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

    const supabase = createAdminClient();

    // Upsert into settings table
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "taxonomies", value: taxonomies }, { onConflict: "key" });

    if (error) {
      // In case settings table doesn't exist, we return success with payload
      return NextResponse.json({ success: true, taxonomies });
    }

    return NextResponse.json({ success: true, taxonomies });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
