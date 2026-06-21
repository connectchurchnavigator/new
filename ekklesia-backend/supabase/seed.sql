-- ════════════════════════════════════════════════════════════════════════
-- EKKLESIA — seed data (demo)
-- Run AFTER you have signed up at least one user (so auth.users has a row).
-- This attaches the demo organization to your first user as the owner.
-- ════════════════════════════════════════════════════════════════════════

do $$
declare
  v_owner   uuid;
  v_org     uuid;
  v_ilford  uuid;
  v_croydon uuid;
  v_strat   uuid;
begin
  -- pick the first user as the demo owner
  select id into v_owner from auth.users order by created_at limit 1;
  if v_owner is null then
    raise exception 'No users found. Sign up a user first, then re-run seed.sql';
  end if;

  -- Clean up any existing seeded data to avoid duplicate key errors
  delete from organizations where slug = 'grace-chapel-international';

  -- organization
  insert into organizations (name, slug, owner_id)
  values ('Grace Chapel International', 'grace-chapel-international', v_owner)
  returning id into v_org;
  -- (org_add_owner_member trigger makes v_owner an owner-member automatically)

  -- ── Ilford (HQ) ──
  insert into churches (org_id, name, slug, status, is_hq, is_verified, denomination, about,
    address_line, city, postcode, country, country_code, latitude, longitude,
    email, phone, website, facebook, instagram, youtube,
    ministries, facilities, languages)
  values (v_org, 'Grace Chapel International', 'grace-chapel-ilford', 'published', true, true,
    'Pentecostal',
    'Grace Chapel International is a warm, welcoming Pentecostal community in Ilford. Whether you''re exploring faith for the first time or looking for a church to call home, you''ll find genuine community and a place to belong.',
    '322 High Road', 'Ilford', 'IG1 1QP', 'United Kingdom', 'GB', 51.5590, 0.0740,
    'hello@gracechapel.org', '+44 20 8554 1000', 'gracechapel.org',
    'facebook.com/gracechapelilford', 'instagram.com/gracechapel', 'youtube.com/@gracechapel',
    array['Youth Ministry','Children''s Church','Food Bank','Women''s Ministry','Men''s Ministry','Prayer Ministry'],
    array['Wheelchair access','Hearing loop','Free parking','Baby changing','Café','Kids area','Livestream'],
    array['English','Spanish','Telugu'])
  returning id into v_ilford;

  -- ── Croydon ──
  insert into churches (org_id, name, slug, status, is_hq, denomination, about,
    address_line, city, postcode, country, country_code,
    email, phone, ministries, facilities, languages)
  values (v_org, 'Grace Chapel — Croydon', 'grace-chapel-croydon', 'published', false,
    'Pentecostal', 'Our Croydon branch — same family, south of the river.',
    '7 High Street', 'Croydon', 'CR0 1QF', 'United Kingdom', 'GB',
    'croydon@gracechapel.org', '+44 20 8554 2000',
    array['Youth Ministry','Food Bank','Prayer Ministry'],
    array['Wheelchair access','Free parking'],
    array['English','Spanish'])
  returning id into v_croydon;

  -- ── Stratford (draft) ──
  insert into churches (org_id, name, slug, status, is_hq, denomination, about,
    address_line, city, postcode, country, country_code, languages)
  values (v_org, 'Grace Chapel — Stratford', 'grace-chapel-stratford', 'draft', false,
    'Pentecostal', 'Our newest plant in Stratford — launching soon.',
    '12 The Grove', 'Stratford', 'E15 1NS', 'United Kingdom', 'GB',
    array['English'])
  returning id into v_strat;

  -- services (Ilford)
  insert into church_services (church_id, day, name, start_time, end_time, format, display_order) values
    (v_ilford, 'Sunday',    'Main Service',         '10:30 AM', '12:30 PM', 'In-Person', 0),
    (v_ilford, 'Wednesday', 'Midweek Bible Study',  '7:00 PM',  '8:30 PM',  'Hybrid',    1);
  insert into church_services (church_id, day, name, start_time, end_time, format, display_order) values
    (v_croydon, 'Sunday', 'Sunday Celebration', '11:00 AM', '1:00 PM', 'In-Person', 0);

  -- leaders (Ilford)
  insert into leaders (church_id, name, role, bio, is_lead, display_order) values
    (v_ilford, 'Pastor David Mensah', 'Senior Pastor',    'Founded Grace Chapel in 2009 with a heart for community, discipleship and reaching the city.', true, 0),
    (v_ilford, 'Grace Okafor',        'Associate Pastor', 'Oversees pastoral care and leads the Croydon branch.', false, 1),
    (v_ilford, 'Ruth Bello',          'Worship Pastor',   'Directs praise & worship across all services and branches.', false, 2),
    (v_ilford, 'Samuel Adeyemi',      'Youth Pastor',     'Leads youth and young-adults ministry.', false, 3);
  insert into leaders (church_id, name, role, bio, is_lead, display_order) values
    (v_croydon, 'Grace Okafor', 'Branch Pastor', 'Leads the Croydon congregation.', true, 0);

  -- teams (Ilford)
  insert into teams (church_id, name, icon, lead_name, member_count, open_to_join, display_order) values
    (v_ilford, 'Praise & Worship',      'ti-microphone-2',   'Ruth Bello',      18, true,  0),
    (v_ilford, 'Media & Production',    'ti-video',          'Daniel Kim',       9, true,  1),
    (v_ilford, 'Sound & Tech',          'ti-device-speaker', 'Marcus Bailey',    6, true,  2),
    (v_ilford, 'Hospitality & Welcome', 'ti-coffee',         'Aisha Bello',     14, true,  3),
    (v_ilford, 'Kids / Sunday School',  'ti-mood-kid',       'Sofia Romano',    12, true,  4),
    (v_ilford, 'Ushering',              'ti-hand-stop',      'James Adeyemi',   11, false, 5),
    (v_ilford, 'Prayer',                'ti-heart',          'Grace Okafor',    22, false, 6),
    (v_ilford, 'Outreach & Missions',   'ti-heart-handshake','Tomasz Kowalski',  8, true,  7);

  raise notice 'Seed complete. Org % with 3 branches created for owner %.', v_org, v_owner;
end $$;
