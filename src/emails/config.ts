import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender address:
// While domain is unverified on Resend, Resend requires 'onboarding@resend.dev'
// Once your domain (e.g. churchnavigator.com) is verified, set RESEND_FROM_EMAIL in .env.local
export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "ChurchNavigator <onboarding@resend.dev>";

export const ADMIN_NOTIFICATION_EMAIL =
  process.env.SUPER_ADMIN_EMAILS?.split(",")[0]?.trim() || "zinxs4@gmail.com";

export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
