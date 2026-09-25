import { renderEmailLayout } from "../layout";
import { APP_BASE_URL } from "../config";

export interface EnquiryNotificationProps {
  recipientName: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject?: string;
  message: string;
  entityName: string; // Church name, Pastor name, etc.
  entityType: "pastor" | "church" | "event" | "worship_leader";
  dashboardUrl?: string;
}

/**
 * 1. Email sent to Church / Pastor / Organizer when a visitor sends an enquiry
 */
export function buildEnquiryReceivedEmail(props: EnquiryNotificationProps) {
  const {
    recipientName,
    senderName,
    senderEmail,
    senderPhone,
    subject = "New Enquiry Received",
    message,
    entityName,
    entityType,
    dashboardUrl = `${APP_BASE_URL}/dashboard?section=enquiries`,
  } = props;

  const contentHtml = `
    <p style="margin: 0 0 16px;">
      Hello <strong>${recipientName}</strong>,
    </p>
    <p style="margin: 0 0 20px;">
      You have received a new contact enquiry regarding <strong>${entityName}</strong> on ChurchNavigator.
    </p>

    <!-- Message Summary Card -->
    <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 22px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700; width: 110px;">From:</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a; font-weight: 800;">${senderName}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700;">Email:</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a;">
            <a href="mailto:${senderEmail}" style="color: #7c3aed; text-decoration: none; font-weight: 700;">${senderEmail}</a>
          </td>
        </tr>
        ${
          senderPhone
            ? `<tr>
                <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700;">Phone:</td>
                <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a; font-weight: 600;">${senderPhone}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700;">Regarding:</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a; font-weight: 600;">${entityName} (${entityType})</td>
        </tr>
      </table>

      <!-- Actual Note / Message -->
      <div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed #cbd5e1;">
        <div style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Message Content:</div>
        <div style="background-color: #ffffff; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">
"${message}"
        </div>
      </div>
    </div>

    <p style="margin: 0; font-size: 13px; color: #64748b;">
      You can reply directly to <a href="mailto:${senderEmail}" style="color: #7c3aed; font-weight: 700;">${senderEmail}</a> or manage all your incoming visitor leads inside your ChurchNavigator dashboard.
    </p>
  `;

  const html = renderEmailLayout({
    title: "New Enquiry Received",
    previewText: `${senderName} sent an enquiry regarding ${entityName}`,
    badge: {
      text: "Incoming Message",
      bg: "#fef3c7",
      color: "#b45309",
    },
    contentHtml,
    cta: {
      text: "View & Reply in Dashboard",
      url: dashboardUrl,
      bg: "#7c3aed",
    },
  });

  return {
    subject: `[ChurchNavigator] New Enquiry from ${senderName} - ${entityName}`,
    html,
  };
}

export interface EnquiryReceiptProps {
  senderName: string;
  entityName: string;
  message: string;
}

/**
 * 2. Instant confirmation receipt sent to the visitor
 */
export function buildEnquiryReceiptEmail(props: EnquiryReceiptProps) {
  const { senderName, entityName, message } = props;

  const contentHtml = `
    <p style="margin: 0 0 16px;">
      Hi <strong>${senderName}</strong>,
    </p>
    <p style="margin: 0 0 18px;">
      Thank you for contacting <strong>${entityName}</strong> through ChurchNavigator. We've forwarded your message directly to their leadership team.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Your Message Summary:</div>
      <div style="font-size: 13.5px; color: #334155; line-height: 1.5; font-style: italic;">
        "${message}"
      </div>
    </div>

    <p style="margin: 0 0 12px; font-size: 13.5px; color: #475569;">
      Someone from the ministry team will get back to you shortly via the email address you provided.
    </p>
    <p style="margin: 0; font-size: 13.5px; color: #475569;">
      In the meantime, feel free to explore upcoming events, sermon archives, and community updates on ChurchNavigator.
    </p>
  `;

  const html = renderEmailLayout({
    title: "We've Received Your Enquiry",
    previewText: `Your message to ${entityName} has been delivered.`,
    badge: {
      text: "Message Sent",
      bg: "#ecfdf5",
      color: "#059669",
    },
    contentHtml,
    cta: {
      text: "Explore More on ChurchNavigator",
      url: APP_BASE_URL,
      bg: "#059669",
    },
  });

  return {
    subject: `Enquiry Received: ${entityName} on ChurchNavigator`,
    html,
  };
}
