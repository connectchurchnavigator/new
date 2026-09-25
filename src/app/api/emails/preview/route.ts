import { NextRequest, NextResponse } from "next/server";
import {
  buildEnquiryReceivedEmail,
  buildEnquiryReceiptEmail,
} from "@/emails/templates/enquiries";
import {
  buildAdminNewListingAlertEmail,
  buildListingApprovedEmail,
} from "@/emails/templates/listings";
import {
  buildEventRegistrationConfirmationEmail,
  buildWelcomeEmail,
} from "@/emails/templates/events";
import { resend, DEFAULT_FROM_EMAIL, ADMIN_NOTIFICATION_EMAIL } from "@/emails/config";

export const dynamic = "force-dynamic";

/**
 * GET /api/emails/preview?template=enquiry_received
 * Allows interactive previewing of all built emails in the browser!
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const template = searchParams.get("template") || "catalog";

  switch (template) {
    case "enquiry_received": {
      const email = buildEnquiryReceivedEmail({
        recipientName: "Pastor John Doe",
        senderName: "Sarah Jenkins",
        senderEmail: "sarah.jenkins@example.com",
        senderPhone: "+1 (555) 234-5678",
        message: "Hello, I recently relocated to the city and would love to learn more about your Sunday morning youth services and fellowship groups. Do you offer transportation or mid-week prayer?",
        entityName: "Grace Cathedral International",
        entityType: "church",
      });
      return new NextResponse(email.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    case "enquiry_receipt": {
      const email = buildEnquiryReceiptEmail({
        senderName: "Sarah Jenkins",
        entityName: "Grace Cathedral International",
        message: "Hello, I recently relocated to the city and would love to learn more about your Sunday morning youth services...",
      });
      return new NextResponse(email.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    case "admin_new_listing": {
      const email = buildAdminNewListingAlertEmail({
        userName: "Michael Johnson",
        userEmail: "michael@faithcentre.org",
        listingName: "Faith Centre Community Church",
        listingType: "Church",
        city: "Dallas, TX",
      });
      return new NextResponse(email.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    case "listing_approved": {
      const email = buildListingApprovedEmail({
        ownerName: "Michael Johnson",
        listingName: "Faith Centre Community Church",
        listingType: "Church",
        publicUrl: "http://localhost:3000/church/faith-centre",
      });
      return new NextResponse(email.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    case "event_registration": {
      const email = buildEventRegistrationConfirmationEmail({
        attendeeName: "David Miller",
        eventName: "Night of Worship & Revival 2026",
        eventDate: "Friday, Oct 12, 2026",
        eventTime: "7:00 PM - 10:00 PM",
        venueName: "Main Sanctuary Auditorium",
        address: "450 Grace Way, Austin, TX",
        ticketCount: 2,
        ticketReference: "CN-REVIVAL-8942",
        eventUrl: "http://localhost:3000/events/revival-night-2026",
      });
      return new NextResponse(email.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    case "welcome": {
      const email = buildWelcomeEmail({
        userName: "David Miller",
        email: "david.miller@example.com",
      });
      return new NextResponse(email.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Default Catalog Hub
    default: {
      const catalogHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ChurchNavigator Email Catalog Preview</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { font-size: 26px; font-weight: 900; margin-bottom: 6px; }
          p { color: #94a3b8; font-size: 14px; margin-bottom: 28px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 30px; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 20px; text-decoration: none; color: inherit; transition: all 0.15s; }
          .card:hover { border-color: #7c3aed; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.3); }
          .tag { font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; display: inline-block; margin-bottom: 8px; }
          .card h3 { font-size: 16px; margin: 0 0 6px; color: #ffffff; }
          .card p { font-size: 12.5px; color: #94a3b8; margin: 0; }
          .test-form { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; margin-top: 30px; }
          input, button { padding: 10px 14px; border-radius: 8px; font-size: 13.5px; }
          input { background: #0f172a; border: 1px solid #475569; color: #ffffff; width: 300px; }
          button { background: #7c3aed; color: white; border: none; font-weight: 700; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✉️ ChurchNavigator Email Catalog</h1>
          <p>Click any template below to view the full responsive email rendering in your browser:</p>
          
          <div class="grid">
            <a href="/api/emails/preview?template=enquiry_received" class="card" target="_blank">
              <span class="tag" style="background: #fef3c7; color: #b45309;">Priority 1 • Incoming</span>
              <h3>1. Enquiry Received</h3>
              <p>Sent to Pastor / Church when someone submits the contact form.</p>
            </a>

            <a href="/api/emails/preview?template=enquiry_receipt" class="card" target="_blank">
              <span class="tag" style="background: #ecfdf5; color: #059669;">Priority 1 • Receipt</span>
              <h3>2. Enquiry Visitor Receipt</h3>
              <p>Instant confirmation receipt sent to the visitor.</p>
            </a>

            <a href="/api/emails/preview?template=admin_new_listing" class="card" target="_blank">
              <span class="tag" style="background: #dbeafe; color: #1d4ed8;">Priority 2 • Alert</span>
              <h3>3. New Listing Submitted</h3>
              <p>Alert to Super Admin that a new church or pastor needs review.</p>
            </a>

            <a href="/api/emails/preview?template=listing_approved" class="card" target="_blank">
              <span class="tag" style="background: #dcfce7; color: #15803d;">Priority 2 • Celebration</span>
              <h3>4. Listing Approved & Live</h3>
              <p>Notification to creator that their church/pastor profile is approved.</p>
            </a>

            <a href="/api/emails/preview?template=event_registration" class="card" target="_blank">
              <span class="tag" style="background: #f3e8ff; color: #7c3aed;">Priority 3 • Event</span>
              <h3>5. Event Registration Pass</h3>
              <p>Confirmation and ticket reference for event attendees.</p>
            </a>

            <a href="/api/emails/preview?template=welcome" class="card" target="_blank">
              <span class="tag" style="background: #e0e7ff; color: #4338ca;">Priority 4 • Account</span>
              <h3>6. Welcome to Platform</h3>
              <p>Sent to new members upon registering an account.</p>
            </a>
          </div>

          <div class="test-form">
            <h3 style="margin-top:0; font-size:16px;">🚀 Dispatch Live Test to Your Inbox</h3>
            <p style="margin-bottom:14px; font-size:13px; color:#cbd5e1;">Test delivering a live template right now using your authenticated Resend API key:</p>
            <form method="POST" action="/api/emails/preview" style="display:flex; gap:10px; flex-wrap:wrap;">
              <select name="template" style="background:#0f172a; color:#fff; border:1px solid #475569; padding:10px 14px; border-radius:8px;">
                <option value="enquiry_received">Enquiry Received (Pastor Notification)</option>
                <option value="enquiry_receipt">Enquiry Receipt (Visitor)</option>
                <option value="listing_approved">Listing Approved & Live</option>
                <option value="event_registration">Event Registration Pass</option>
              </select>
              <input type="email" name="to" placeholder="Enter your email (e.g. zinxs4@gmail.com)" required />
              <button type="submit">Send Test Email via Resend</button>
            </form>
          </div>
        </div>
      </body>
      </html>
      `;
      return new NextResponse(catalogHtml, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  }
}

/**
 * POST /api/emails/preview
 * Dispatch a live test email directly to a specified inbox
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const to = formData.get("to") as string;
    const template = (formData.get("template") as string) || "enquiry_received";

    if (!to) {
      return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });
    }

    let emailData: { subject: string; html: string };

    if (template === "enquiry_received") {
      emailData = buildEnquiryReceivedEmail({
        recipientName: "Pastor John Doe",
        senderName: "Sarah Jenkins",
        senderEmail: "sarah.jenkins@example.com",
        senderPhone: "+1 (555) 234-5678",
        message: "Hello, I recently relocated to the city and would love to learn more about your Sunday morning youth services and fellowship groups.",
        entityName: "Grace Cathedral International",
        entityType: "church",
      });
    } else if (template === "listing_approved") {
      emailData = buildListingApprovedEmail({
        ownerName: "Michael Johnson",
        listingName: "Faith Centre Community Church",
        listingType: "Church",
        publicUrl: "http://localhost:3000/church/faith-centre",
      });
    } else if (template === "event_registration") {
      emailData = buildEventRegistrationConfirmationEmail({
        attendeeName: "David Miller",
        eventName: "Night of Worship & Revival 2026",
        eventDate: "Friday, Oct 12, 2026",
        venueName: "Main Sanctuary Auditorium",
        eventUrl: "http://localhost:3000/events/revival-night-2026",
      });
    } else {
      emailData = buildEnquiryReceiptEmail({
        senderName: "Sarah Jenkins",
        entityName: "Grace Cathedral International",
        message: "Hello, I recently relocated to the city and would love to learn more about your Sunday morning services.",
      });
    }

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject: emailData.subject,
      html: emailData.html,
    });

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return new NextResponse(`
      <html>
        <body style="font-family:sans-serif; text-align:center; padding: 50px; background:#f8fafc;">
          <div style="background:#fff; max-width:450px; margin:0 auto; padding:30px; border-radius:16px; border:1px solid #bbf7d0;">
            <h2 style="color:#16a34a; margin:0 0 10px;">✅ Test Email Dispatched!</h2>
            <p style="color:#475569; font-size:14px; margin-bottom:20px;">
              Email successfully queued to <strong>${to}</strong> with ID:<br/>
              <code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px;">${data?.id}</code>
            </p>
            <a href="/api/emails/preview" style="color:#7c3aed; text-decoration:none; font-weight:700;">← Back to Email Catalog</a>
          </div>
        </body>
      </html>
    `, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
