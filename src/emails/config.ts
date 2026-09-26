import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender address:
// Domain churchnavigator.com is verified on Resend
export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "ChurchNavigator <notifications@churchnavigator.com>";

export const ADMIN_NOTIFICATION_EMAIL =
  process.env.SUPER_ADMIN_EMAILS?.split(",")[0]?.trim() || "zinxs4@gmail.com";

export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
