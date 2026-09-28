import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { churchId, is_verified, status } = body;

    if (!churchId) {
      return NextResponse.json({ error: "Missing churchId" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (typeof is_verified === "boolean") updatePayload.is_verified = is_verified;
    if (status) updatePayload.status = status;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("churches")
      .update(updatePayload)
      .eq("id", churchId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, church: data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");

    if (!churchId) {
      return NextResponse.json({ error: "Missing churchId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Clean up dependent child rows before deleting the church
    await Promise.allSettled([
      supabase.from("church_services").delete().eq("church_id", churchId),
      supabase.from("leaders").delete().eq("church_id", churchId),
      supabase.from("teams").delete().eq("church_id", churchId),
      supabase.from("visitors").delete().eq("church_id", churchId),
      supabase.from("check_ins").delete().eq("church_id", churchId),
      supabase.from("listing_views").delete().eq("church_id", churchId),
      supabase.from("branches").delete().eq("church_id", churchId),
      supabase.from("church_teams").delete().eq("church_id", churchId),
      // Disassociate pastors if linked without cascading
      supabase.from("pastors").update({ church_id: null }).eq("church_id", churchId),
      // Delete events hosted by this church
      supabase.from("events").delete().eq("host_church_id", churchId),
    ]);

    const { error } = await supabase
      .from("churches")
      .delete()
      .eq("id", churchId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
