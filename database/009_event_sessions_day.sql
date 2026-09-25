-- Migration: Add day_number and session_date to event_sessions for multi-day events
ALTER TABLE public.event_sessions
  ADD COLUMN IF NOT EXISTS day_number integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS session_date text;

-- Add index on event_id, day_number
CREATE INDEX IF NOT EXISTS idx_event_sessions_day ON public.event_sessions(event_id, day_number);
