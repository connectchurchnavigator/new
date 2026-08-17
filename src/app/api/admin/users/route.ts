import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role } = body as { userId: string; role: "super_admin" | "listing_manager" | "visitor" };

    if (!userId || !role || !["super_admin", "listing_manager", "visitor"].includes(role)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Update user metadata in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role },
      app_metadata: { role },
    });

    if (authError) {
      console.warn("Could not update auth user_metadata:", authError.message);
    }

    // 2. Upsert into public.profiles table (if migration applied)
    await supabase.from("profiles").upsert(
      { id: userId, role, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );

    return NextResponse.json({ success: true, userId, role });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
