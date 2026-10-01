import { renderEmailLayout } from "../layout";
import { APP_BASE_URL } from "../config";

export interface VisitorWelcomeEmailProps {
  visitorName: string;
  visitorEmail: string;
  churchName: string;
  churchSlug?: string;
  churchAddress?: string;
  serviceName?: string;
  serviceDay?: string;
  serviceTime?: string;
  pastorName?: string;
}

/**
 * Branded Welcome Email sent to a registered visitor
 * Triggered from Dashboard -> Visitor Insights -> "Send welcome"
 */
export function buildVisitorWelcomeEmail(props: VisitorWelcomeEmailProps) {
  const {
    visitorName,
    visitorEmail,
    churchName,
    churchSlug,
    churchAddress,
    serviceName,
    serviceDay,
    serviceTime,
    pastorName,
  } = props;

  const churchUrl = churchSlug ? `${APP_BASE_URL}/church/${churchSlug}` : APP_BASE_URL;

  const serviceDetails = [
    serviceName,
    serviceDay,
    serviceTime ? `at ${serviceTime}` : "",
  ].filter(Boolean).join(" • ");

  const contentHtml = `
    <p style="margin: 0 0 16px; font-size: 15px;">
      Dear <strong>${visitorName || "Friend"}</strong>,
    </p>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #334155;">
      Welcome! We are truly glad to receive you at <strong>${churchName}</strong>. Whether you are searching for a new spiritual home or visiting for the first time, our doors and hearts are open to welcome you with warm fellowship.
    </p>

    <!-- Visit & Service Card -->
    <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 10px; font-size: 13px; color: #64748b; font-weight: 700; width: 110px;">Church:</td>
          <td style="padding-bottom: 10px; font-size: 15px; color: #0f172a; font-weight: 800;">${churchName}</td>
        </tr>
        ${
          serviceDetails
            ? `<tr>
                <td style="padding-bottom: 10px; font-size: 13px; color: #64748b; font-weight: 700;">Service:</td>
                <td style="padding-bottom: 10px; font-size: 14px; color: #0f172a; font-weight: 600;">
                  📅 ${serviceDetails}
                </td>
              </tr>`
            : `<tr>
                <td style="padding-bottom: 10px; font-size: 13px; color: #64748b; font-weight: 700;">Service Times:</td>
                <td style="padding-bottom: 10px; font-size: 14px; color: #0f172a; font-weight: 600;">
                  Check service schedule on our page
                </td>
              </tr>`
        }
        ${
          churchAddress
            ? `<tr>
                <td style="padding-bottom: 10px; font-size: 13px; color: #64748b; font-weight: 700;">Location:</td>
                <td style="padding-bottom: 10px; font-size: 14px; color: #0f172a; line-height: 1.4;">
                  📍 ${churchAddress}
                </td>
              </tr>`
            : ""
        }
        ${
          pastorName
            ? `<tr>
                <td style="font-size: 13px; color: #64748b; font-weight: 700;">Lead Pastor:</td>
                <td style="font-size: 14px; color: #7c3aed; font-weight: 700;">
                  ${pastorName}
                </td>
              </tr>`
            : ""
        }
      </table>
    </div>

    <p style="margin: 0 0 16px; font-size: 14.5px; line-height: 1.6; color: #475569;">
      Our welcome team will be there to greet you, answer any questions, and ensure you have an inspiring and uplifted worship experience.
    </p>

    <p style="margin: 0 0 20px; font-size: 14.5px; line-height: 1.6; color: #475569;">
      Have a great and blessed day, and see you soon!
    </p>

    <div style="margin-top: 20px; padding-top: 14px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #64748b;">
      Warm regards,<br>
      <strong style="color: #0f172a;">The Leadership &amp; Welcome Team</strong><br>
      ${churchName}
    </div>
  `;

  const html = renderEmailLayout({
    title: `Welcome to ${churchName}!`,
    previewText: `Glad to receive you at ${churchName}! Check service and visit details.`,
    badge: {
      text: "Visitor Welcome",
      bg: "#f3e8ff",
      color: "#7c3aed",
    },
    contentHtml,
    cta: {
      text: "View Church & Directions",
      url: churchUrl,
      bg: "#7c3aed",
    },
  });

  return {
    subject: `Welcome to ${churchName}! We're glad to have you 🙏`,
    html,
  };
}
