import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, status } = body;

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (status) updatePayload.status = status;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Clean up dependent tables if any before deleting event
    await supabase.from("event_sessions").delete().eq("event_id", eventId);
    await supabase.from("event_speakers").delete().eq("event_id", eventId);
    await supabase.from("event_tickets").delete().eq("event_id", eventId);
    await supabase.from("event_faqs").delete().eq("event_id", eventId);

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
