import { z } from 'zod';

/**
 * Validates the payload sent from the Pastor onboarding wizard to
 * POST /api/pastors. Mirrors the wizard's steps:
 *   1. Basics       -> name, title, church, city
 *   2. Contact       -> phone, email, website, socials
 *   3. Ministry       -> bio, vision, preaching/ministry/available-for tags
 *   4. Languages       -> languages[]
 *   5. Availability     -> travel range, lead time, status
 *   6. Media              -> avatar, cover photos
 */

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(''))
  .transform((v) => (v === '' ? undefined : v));

const optionalString = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(''))
  .transform((v) => (v === '' ? undefined : v));

export const pastorOnboardingSchema = z.object({
  // Step 1 — Basics
  full_name: z.string().trim().min(3, 'Full name must be at least 3 characters').max(120),
  title: optionalString,
  church_id: z.string().uuid().optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  church_name_cache: optionalString,
  city: optionalString,
  country: z.string().trim().max(80).default('United Kingdom'),

  // Step 2 — Contact
  phone: optionalString,
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')).transform((v) => (v === '' ? undefined : v)),
  website_url: optionalUrl,
  facebook_url: optionalUrl,
  instagram_url: optionalUrl,
  youtube_url: optionalUrl,
  twitter_url: optionalUrl,
  whatsapp_url: optionalUrl,

  // Step 3 — Ministry
  bio: optionalString,
  vision_statement: optionalString,
  years_in_ministry: z.coerce.number().int().min(0).max(100).optional(),
  churches_planted: z.coerce.number().int().min(0).max(500).optional(),
  nations_reached: z.coerce.number().int().min(0).max(300).optional(),
  preaching_tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  ministry_area_tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  available_for_tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),

  // Step 4 — Languages
  languages: z.array(z.string().trim().min(1).max(40)).min(1, 'Add at least one language').max(15),

  // Step 5 — Availability
  travel_range: optionalString,
  lead_time: optionalString,
  availability_status: z.enum(['available', 'limited', 'unavailable']).default('available'),
  availability_note: optionalString,

  // Step 6 — Media (URLs after upload to Supabase Storage; the wizard
  // uploads files client-side first, then sends back the public URLs)
  avatar_url: optionalUrl,
  cover_photo_urls: z.array(z.string().trim().max(500)).max(6).default([]),
});

export type PastorOnboardingInput = z.input<typeof pastorOnboardingSchema>;
export type PastorOnboardingPayload = z.output<typeof pastorOnboardingSchema>;

/**
 * Validates a single enquiry ("Send Enquiry" button) submission.
 */
export const pastorEnquirySchema = z.object({
  pastor_id: z.string().uuid(),
  sender_name: z.string().trim().min(2).max(120),
  sender_email: z.string().trim().email('Enter a valid email address'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
  event_type: optionalString,
});

export type PastorEnquiryPayload = z.output<typeof pastorEnquirySchema>;
