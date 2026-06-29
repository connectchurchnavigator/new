# Ekklesia — EVENTS (linked to churches AND pastors)
Real code (TS parses clean; SQL balanced). NOT build-verified — needs the UNIFIED
database (church + pastor schemas in one Supabase). Payments are RSVP-only.
- ekklesia-events/ : 003_events.sql (events/sessions/speakers/tickets/registrations + RLS),
                     data layer, /events directory+search, rich /events/[slug] page,
                     register panel, /events/create. host_church_id + host_pastor_id.
- mockups/         : events module + rich event page templates.
See ekklesia-events/README.md for wire-up + the church/pastor link details.
