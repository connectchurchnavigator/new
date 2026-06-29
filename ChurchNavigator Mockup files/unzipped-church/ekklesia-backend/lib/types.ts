// ───────────────────────────────────────────────────────────────────────
// Ekklesia — shared types (match the SQL schema)
// ───────────────────────────────────────────────────────────────────────

export type ChurchStatus = 'draft' | 'published';
export type OrgRole = 'owner' | 'admin' | 'editor';
export type ServiceFormat = 'In-Person' | 'Online' | 'Hybrid';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export interface Church {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  status: ChurchStatus;
  is_hq: boolean;
  is_verified: boolean;
  denomination: string | null;
  about: string | null;

  address_line: string | null;
  city: string | null;
  area: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  country_code: string | null;
  formatted_address: string | null;
  google_place_id: string | null;
  latitude: number | null;
  longitude: number | null;

  email: string | null;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;

  cover_url: string | null;
  logo_url: string | null;
  gallery: string[];

  ministries: string[];
  facilities: string[];
  languages: string[];

  created_at: string;
  updated_at: string;
}

export interface ChurchService {
  id: string;
  church_id: string;
  day: string;
  name: string;
  start_time: string | null;
  end_time: string | null;
  format: ServiceFormat;
  language: string | null;
  livestream_url: string | null;
  display_order: number;
}

export interface Leader {
  id: string;
  church_id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
  is_lead: boolean;
  display_order: number;
}

export interface Team {
  id: string;
  church_id: string;
  name: string;
  icon: string | null;
  lead_name: string | null;
  member_count: number;
  open_to_join: boolean;
  display_order: number;
}

/** A church with its nested children — what a public listing page needs. */
export interface ChurchFull extends Church {
  church_services: ChurchService[];
  leaders: Leader[];
  teams: Team[];
}

export interface SearchParams {
  q?: string;
  city?: string;
  denomination?: string;
  ministry?: string;
  language?: string;
  limit?: number;
  offset?: number;
}
