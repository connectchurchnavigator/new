// Mirrors the Supabase schema in supabase/migrations/001_pastors_schema.sql

export type AvailabilityStatus = 'available' | 'limited' | 'unavailable';
export type TagCategory = 'preaching' | 'ministry_area' | 'available_for';
export type EnquiryStatus = 'new' | 'read' | 'responded' | 'archived';

export interface Pastor {
  id: string;
  slug: string;

  full_name: string;
  title: string | null;
  initials: string | null;
  avatar_url: string | null;
  cover_photo_urls: string[];

  church_id: string | null;
  church_name_cache: string | null;

  city: string | null;
  country: string;

  bio: string | null;
  vision_statement: string | null;
  years_in_ministry: number | null;
  churches_planted: number | null;
  nations_reached: number | null;
  books_published: number | null;
  events_spoken: number | null;

  phone: string | null;
  email: string | null;
  website_url: string | null;

  facebook_url: string | null;
  facebook_followers: number | null;
  instagram_url: string | null;
  instagram_followers: number | null;
  youtube_url: string | null;
  youtube_subscribers: number | null;
  twitter_url: string | null;
  twitter_followers: number | null;
  whatsapp_url: string | null;

  travel_range: string | null;
  lead_time: string | null;
  availability_status: AvailabilityStatus;
  availability_note: string | null;

  is_verified: boolean;
  is_published: boolean;
  view_count: number;

  created_at: string;
  updated_at: string;
}

export interface PastorLanguage {
  pastor_id: string;
  language: string;
}

export interface PastorTag {
  id: string;
  pastor_id: string;
  category: TagCategory;
  label: string;
}

export interface PastorEducation {
  id: string;
  pastor_id: string;
  degree: string;
  institution: string;
  year_range: string | null;
  detail: string | null;
  sort_order: number;
}

export interface PastorTimelineEntry {
  id: string;
  pastor_id: string;
  year: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface PastorSermon {
  id: string;
  pastor_id: string;
  title: string;
  series: string | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  duration_min: number | null;
  views: number;
  likes: number;
  published_at: string | null;
  sort_order: number;
}

export interface PastorEvent {
  id: string;
  pastor_id: string;
  title: string;
  event_date: string;
  location: string | null;
  start_time: string | null;
  tags: string[];
  registration_url: string | null;
  sort_order: number;
}

export interface PastorGalleryImage {
  id: string;
  pastor_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export interface PastorAffiliation {
  id: string;
  pastor_id: string;
  organisation: string;
  role: string | null;
  sort_order: number;
}

export interface PastorAward {
  id: string;
  pastor_id: string;
  title: string;
  issuer: string | null;
  sort_order: number;
}

export interface PastorReview {
  id: string;
  pastor_id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface PastorEnquiry {
  id: string;
  pastor_id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  event_type: string | null;
  status: EnquiryStatus;
  created_at: string;
}

/**
 * Full nested shape returned by GET /api/pastors/[slug] — everything
 * the profile page needs in a single request.
 */
export interface PastorProfile extends Pastor {
  languages: string[];
  tags: PastorTag[];
  education: PastorEducation[];
  timeline: PastorTimelineEntry[];
  sermons: PastorSermon[];
  events: PastorEvent[];
  gallery: PastorGalleryImage[];
  affiliations: PastorAffiliation[];
  awards: PastorAward[];
  reviews: PastorReview[];
  average_rating: number | null;
}
