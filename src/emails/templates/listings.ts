import { renderEmailLayout } from "../layout";
import { APP_BASE_URL } from "../config";

export interface ListingSubmittedProps {
  userName: string;
  userEmail: string;
  listingName: string;
  listingType: "Church" | "Pastor" | "Worship Leader" | "Event";
  city?: string;
  submittedAt?: string;
}

/**
 * 1. Admin Alert: New Listing Submitted for Review (Matches Client Mockup #3 / #5)
 */
export function buildAdminNewListingAlertEmail(props: ListingSubmittedProps) {
  const {
    userName,
    userEmail,
    listingName,
    listingType,
    city = "Location not provided",
    submittedAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  } = props;

  const contentHtml = `
    <p style="margin: 0 0 16px;">
      A new listing has been submitted on ChurchNavigator and is waiting for review.
    </p>

    <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700; width: 120px;">Listing Name:</td>
          <td style="padding-bottom: 8px; font-size: 14.5px; color: #0f172a; font-weight: 800;">${listingName}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700;">Type:</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a; font-weight: 600;">${listingType}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700;">Location:</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a;">${city}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; font-weight: 700;">Submitted By:</td>
          <td style="padding-bottom: 8px; font-size: 14px; color: #0f172a;">${userName} (${userEmail})</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b; font-weight: 700;">Date:</td>
          <td style="font-size: 14px; color: #0f172a;">${submittedAt}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; font-size: 13px; color: #64748b;">
      Click the button below to review details, assign verified status, and publish to the live directory.
    </p>
  `;

  const html = renderEmailLayout({
    title: `New ${listingType} Listing Submitted`,
    previewText: `New listing for ${listingName} submitted by ${userName}`,
    badge: {
      text: "Needs Review",
      bg: "#dbeafe",
      color: "#1d4ed8",
    },
    contentHtml,
    cta: {
      text: "Review in Admin Center",
      url: `${APP_BASE_URL}/admin`,
      bg: "#2563eb",
    },
  });

  return {
    subject: `[Admin Alert] New ${listingType} Submitted: ${listingName}`,
    html,
  };
}

export interface ListingApprovedProps {
  ownerName: string;
  listingName: string;
  listingType: string;
  publicUrl: string;
}

/**
 * 2. Creator Alert: Listing is Approved & Live (Matches Client Mockup #4 / #11)
 */
export function buildListingApprovedEmail(props: ListingApprovedProps) {
  const { ownerName, listingName, listingType, publicUrl } = props;

  const contentHtml = `
    <p style="margin: 0 0 16px;">
      Hello <strong>${ownerName}</strong>,
    </p>
    <p style="margin: 0 0 20px; font-size: 15px; color: #1e293b;">
      Great news! Your <strong>${listingType}</strong> profile for <strong>${listingName}</strong> has been reviewed, approved, and is now live on ChurchNavigator!
    </p>

    <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
      <div style="font-size: 16px; font-weight: 800; color: #166534; margin-bottom: 4px;">
        ${listingName} is Live
      </div>
      <div style="font-size: 13px; color: #15803d;">
        Believers and visitors can now discover your services, events, and ministry contacts.
      </div>
    </div>

    <p style="margin: 0 0 14px; font-size: 13.5px; color: #64748b;">
      You can manage updates, add events, and track visitor analytics directly from your personal ChurchNavigator Dashboard.
    </p>
  `;

  const html = renderEmailLayout({
    title: "Your Listing is Live!",
    previewText: `Congratulations! ${listingName} is now published on ChurchNavigator.`,
    badge: {
      text: "Approved & Live",
      bg: "#dcfce7",
      color: "#15803d",
    },
    contentHtml,
    cta: {
      text: "View Live Listing",
      url: publicUrl,
      bg: "#16a34a",
    },
    secondaryCta: {
      text: "Open Dashboard",
      url: `${APP_BASE_URL}/dashboard`,
    },
  });

  return {
    subject: `Your listing for ${listingName} is now live on ChurchNavigator!`,
    html,
  };
}
