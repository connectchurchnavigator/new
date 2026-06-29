# Ekklesia — PASTOR (front end + back end)
VERIFIED: npm install && npm run build passes — all 11 routes compile.
ekklesia-pastor-app/ = your pastor app + merged additions:
  onboarding (/onboarding/pastor), public profile (/pastor/[slug]),
  directory/search (/pastors), login (auth), dashboard (auth-guarded, real data),
  api routes, and migrations 001 + 002 (owner_id + RLS).
mockups/ = pastor profile (cover/QR/PDF) + pastor dashboard templates.
RUN: cd ekklesia-pastor-app → npm install → add .env.local (Supabase keys) → run BOTH migrations → npm run dev
