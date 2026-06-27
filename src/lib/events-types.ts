// Event types — shared across the events module.

export type EventType = 'Conference' | 'Service' | 'Crusade' | 'Camp' | 'Summit' | 'Concert' | 'Other';
export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface EventHostChurch { id: string; slug: string; name: string; city: string | null; denomination: string | null; }
export interface EventHostPastor { id: string; slug: string; full_name: string; title: string | null; city: string | null; }

export interface EventRow {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  description: string | null;
  host_church_id: string | null;
  host_pastor_id: string | null;
  starts_at: string;
  ends_at: string | null;
  timezone: string | null;
  venue_name: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_url: string | null;
  cover_gradient: string | null;
  is_free: boolean;
  price_label: string | null;
  capacity: number | null;
  is_hybrid: boolean;
  livestream_url: string | null;
  tags: string[];
  status: EventStatus;
  view_count: number;
  created_at: string;
}

export interface EventSession { id: string; event_id: string; time_label: string; title: string; description: string | null; speaker_name: string | null; sort_order: number; }
export interface EventSpeaker { id: string; event_id: string; name: string; role: string | null; photo_url: string | null; pastor_id: string | null; sort_order: number; }
export interface EventTicket { id: string; event_id: string; name: string; description: string | null; price_pence: number; quantity: number | null; sort_order: number; }

export interface EventCard extends EventRow {
  church?: EventHostChurch | null;
  pastor?: EventHostPastor | null;
  registration_count?: number;
}

export interface EventFull extends EventCard {
  sessions: EventSession[];
  speakers: EventSpeaker[];
  tickets: EventTicket[];
}
