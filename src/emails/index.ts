import { resend, DEFAULT_FROM_EMAIL, ADMIN_NOTIFICATION_EMAIL } from "./config";
import {
  buildEnquiryReceivedEmail,
  buildEnquiryReceiptEmail,
  EnquiryNotificationProps,
  EnquiryReceiptProps,
} from "./templates/enquiries";
import {
  buildAdminNewListingAlertEmail,
  buildListingApprovedEmail,
  ListingSubmittedProps,
  ListingApprovedProps,
} from "./templates/listings";
import {
  buildEventRegistrationConfirmationEmail,
  buildWelcomeEmail,
  EventRegistrationProps,
  WelcomeUserProps,
} from "./templates/events";

/**
 * Send an Enquiry Email notification to the Church / Pastor / Organizer
 */
export async function sendEnquiryNotificationEmail(to: string, props: EnquiryNotificationProps) {
  try {
    const { subject, html } = buildEnquiryReceivedEmail(props);
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject,
      html,
      replyTo: props.senderEmail,
    });

    if (error) {
      console.error("[Email] Failed to send enquiry notification:", error);
      return { success: false, error };
    }
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email] Error dispatching enquiry notification:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send an Enquiry confirmation receipt to the visitor
 */
export async function sendEnquiryReceiptEmail(to: string, props: EnquiryReceiptProps) {
  try {
    const { subject, html } = buildEnquiryReceiptEmail(props);
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Failed to send enquiry receipt:", error);
      return { success: false, error };
    }
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email] Error dispatching enquiry receipt:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send New Listing Alert to Platform Super Admin
 */
export async function sendAdminNewListingAlertEmail(props: ListingSubmittedProps) {
  try {
    const { subject, html } = buildAdminNewListingAlertEmail(props);
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Failed to send admin listing alert:", error);
      return { success: false, error };
    }
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email] Error dispatching admin listing alert:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Listing Approved Notification to Creator
 */
export async function sendListingApprovedEmail(to: string, props: ListingApprovedProps) {
  try {
    const { subject, html } = buildListingApprovedEmail(props);
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Failed to send listing approved email:", error);
      return { success: false, error };
    }
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email] Error dispatching listing approved email:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Event Registration Confirmation to Attendee
 */
export async function sendEventRegistrationConfirmationEmail(to: string, props: EventRegistrationProps) {
  try {
    const { subject, html } = buildEventRegistrationConfirmationEmail(props);
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Failed to send event registration confirmation:", error);
      return { success: false, error };
    }
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email] Error dispatching event registration email:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Welcome Email to New User
 */
export async function sendWelcomeEmail(to: string, props: WelcomeUserProps) {
  try {
    const { subject, html } = buildWelcomeEmail(props);
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Failed to send welcome email:", error);
      return { success: false, error };
    }
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email] Error dispatching welcome email:", err);
    return { success: false, error: err.message };
  }
}
