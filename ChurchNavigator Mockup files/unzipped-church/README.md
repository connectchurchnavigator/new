# Ekklesia — CHURCH (front end + back end)
VERIFIED: npm install && npm run build passes (tsc clean, next build = all 7 routes).
- ekklesia-app-frontend/ : home+search, onboarding, church dashboard, public listing, login
- ekklesia-backend/      : SQL migrations, data layer, address routes
- mockups/               : directory/search, dashboard, onboarding, visitor-tracking templates
- docs/                  : handoff + setup
RUN: cd ekklesia-app-frontend → npm install → cp .env.example .env.local (Supabase keys) → run SQL in ../ekklesia-backend/supabase → npm run dev
