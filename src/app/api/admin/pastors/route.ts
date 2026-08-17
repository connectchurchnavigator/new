import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { pastorId, is_verified, is_published } = body;

    if (!pastorId) {
      return NextResponse.json({ error: "Missing pastorId" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (typeof is_verified === "boolean") updatePayload.is_verified = is_verified;
    if (typeof is_published === "boolean") updatePayload.is_published = is_published;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("pastors")
      .update(updatePayload)
      .eq("id", pastorId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, pastor: data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
