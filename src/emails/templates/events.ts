import { renderEmailLayout } from "../layout";
import { APP_BASE_URL } from "../config";

export interface EventRegistrationProps {
  attendeeName: string;
  eventName: string;
  eventDate: string;
  eventTime?: string;
  venueName: string;
  address?: string;
  ticketCount?: number;
  ticketReference?: string;
  eventUrl: string;
}

/**
 * 1. Event Registration / Ticket Confirmation (Matches Client Event Mockup #2)
 */
export function buildEventRegistrationConfirmationEmail(props: EventRegistrationProps) {
  const {
    attendeeName,
    eventName,
    eventDate,
    eventTime = "All Day / Check schedule",
    venueName,
    address,
    ticketCount = 1,
    ticketReference = "CN-" + Math.floor(100000 + Math.random() * 900000),
    eventUrl,
  } = props;

  const contentHtml = `
    <p style="margin: 0 0 16px;">
      Hi <strong>${attendeeName}</strong>,
    </p>
    <p style="margin: 0 0 20px;">
      You're registered for <strong>${eventName}</strong>! We're excited to have you join. Below are your event & pass details:
    </p>

    <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700; width: 110px;">Event:</td>
          <td style="padding-bottom: 8px; font-size: 15px; color: #0f172a; font-weight: 800;">${eventName}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700;">Date:</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a; font-weight: 600;">📅 ${eventDate}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700;">Time:</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a;">⏰ ${eventTime}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700;">Venue:</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a;">📍 ${venueName} ${address ? `(${address})` : ""}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700;">Tickets:</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a; font-weight: 700;">${ticketCount} Pass${ticketCount > 1 ? "es" : ""}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b; font-weight: 700;">Confirmation:</td>
          <td style="font-size: 13.5px; color: #7c3aed; font-weight: 800; font-family: monospace;">${ticketReference}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 13px; color: #64748b;">
      Please arrive 15 minutes before start time. If you have questions for the host, you can find contact info on the event page.
    </p>
  `;

  const html = renderEmailLayout({
    title: "You're Registered!",
    previewText: `Registration confirmed for ${eventName}`,
    badge: {
      text: "Registration Confirmed",
      bg: "#f3e8ff",
      color: "#7c3aed",
    },
    contentHtml,
    cta: {
      text: "View Event Details",
      url: eventUrl,
      bg: "#7c3aed",
    },
  });

  return {
    subject: `You're registered for ${eventName} 🎉`,
    html,
  };
}

export interface WelcomeUserProps {
  userName: string;
  email: string;
}

/**
 * 2. Welcome to Platform (Matches Client Mockup #1)
 */
export function buildWelcomeEmail(props: WelcomeUserProps) {
  const { userName, email } = props;

  const contentHtml = `
    <p style="margin: 0 0 16px;">
      Welcome <strong>${userName}</strong>,
    </p>
    <p style="margin: 0 0 20px;">
      Thank you for joining ChurchNavigator! You are now part of a growing community dedicated to connecting believers with churches, pastors, worship leaders, and faith events.
    </p>

    <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px;">Your Account:</div>
      <div style="font-size: 15px; font-weight: 800; color: #0f172a;">${email}</div>
    </div>

    <p style="margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #0f172a;">What you can do next:</p>
    <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 13.5px; color: #475569; line-height: 1.6;">
      <li>Discover churches and service times near you</li>
      <li>Follow your favorite pastors and worship ministries</li>
      <li>List your church or ministry on the global directory</li>
      <li>Publish conferences, workshops, and worship sessions</li>
    </ul>
  `;

  const html = renderEmailLayout({
    title: "Welcome to ChurchNavigator!",
    previewText: "Your account is ready. Discover churches, pastors, and events.",
    badge: {
      text: "Welcome",
      bg: "#e0e7ff",
      color: "#4338ca",
    },
    contentHtml,
    cta: {
      text: "Go to My Dashboard",
      url: `${APP_BASE_URL}/dashboard`,
      bg: "#4f46e5",
    },
  });

  return {
    subject: "Welcome to ChurchNavigator! ⛪",
    html,
  };
}
