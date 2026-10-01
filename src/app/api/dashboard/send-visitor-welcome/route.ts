import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendVisitorWelcomeEmail } from "@/emails";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, churchId, email: directEmail, name: directName } = body;

    const sb = createAdminClient();

    let visitorName = directName || "";
    let visitorEmail = directEmail || "";
    let churchIdToUse = churchId;

    // 1. Fetch visitor details if visitorId is provided
    if (visitorId) {
      const { data: v, error: vErr } = await sb
        .from("visitors")
        .select("*")
        .eq("id", visitorId)
        .single();

      if (vErr || !v) {
        return NextResponse.json({ success: false, error: "Visitor not found" }, { status: 404 });
      }

      visitorName = v.name || visitorName;
      visitorEmail = v.email || visitorEmail;
      churchIdToUse = v.church_id || churchIdToUse;
    }

    if (!visitorEmail || !visitorEmail.includes("@")) {
      return NextResponse.json({ success: false, error: "Visitor email is required or invalid" }, { status: 400 });
    }

    // 2. Fetch Church details (name, slug, address, pastor)
    let churchName = "Our Church";
    let churchSlug = "";
    let churchAddress = "";
    let pastorName = "";

    if (churchIdToUse) {
      const { data: c } = await sb
        .from("churches")
        .select("name, slug, address_line, city, pastor_name")
        .eq("id", churchIdToUse)
        .single();

      if (c) {
        churchName = c.name || churchName;
        churchSlug = c.slug || "";
        churchAddress = [c.address_line, c.city].filter(Boolean).join(", ");
        pastorName = c.pastor_name || "";
      }
    }

    // 3. Check for specific check_in service details (e.g. Wednesday Bible Study 7:00 PM)
    let serviceName = "";
    let serviceDay = "";
    let serviceTime = "";

    if (visitorId) {
      const { data: checkIns } = await sb
        .from("check_ins")
        .select("*, church_services(*)")
        .eq("visitor_id", visitorId)
        .order("checked_in_at", { ascending: false })
        .limit(1);

      const latestCheckin = checkIns?.[0];
      if (latestCheckin?.church_services) {
        const svc = latestCheckin.church_services;
        serviceName = svc.name || "";
        serviceDay = svc.day || "";
        serviceTime = [svc.start_time, svc.end_time ? `- ${svc.end_time}` : ""].filter(Boolean).join(" ");
      }
    }

    // 4. Send the welcome email
    const emailResult = await sendVisitorWelcomeEmail(visitorEmail, {
      visitorName,
      visitorEmail,
      churchName,
      churchSlug,
      churchAddress,
      serviceName,
      serviceDay,
      serviceTime,
      pastorName,
    });

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: typeof emailResult.error === "string" ? emailResult.error : (emailResult.error as any)?.message || "Failed to deliver email"
      }, { status: 500 });
    }

    // 5. Update visitor record (increment emails_sent, record last_sent timestamp)
    if (visitorId) {
      await sb
        .from("visitors")
        .update({
          emails_sent: (sb as any).raw ? (sb as any).raw("COALESCE(emails_sent, 0) + 1") : undefined,
          last_seen: new Date().toISOString()
        })
        .eq("id", visitorId);
    }

    return NextResponse.json({
      success: true,
      message: `Welcome email sent successfully to ${visitorEmail}`,
      visitorEmail,
    });
  } catch (err: any) {
    console.error("send-visitor-welcome error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
