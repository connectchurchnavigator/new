import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const leaderId = body.worshipLeaderId || body.leaderId || body.id;

    if (!leaderId) {
      return NextResponse.json({ error: "Missing worshipLeaderId" }, { status: 400 });
    }

    const { is_verified, is_published } = body;
    const updatePayload: Record<string, any> = {};
    if (typeof is_verified === "boolean") updatePayload.is_verified = is_verified;
    if (typeof is_published === "boolean") updatePayload.is_published = is_published;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("worship_leaders")
      .update(updatePayload)
      .eq("id", leaderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, worshipLeader: data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const worshipLeaderId = searchParams.get("worshipLeaderId");

    if (!worshipLeaderId) {
      return NextResponse.json({ error: "Missing worshipLeaderId" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("worship_leaders")
      .delete()
      .eq("id", worshipLeaderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

