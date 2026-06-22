-- ============================================================
-- Optional demo data — recreates "Pastor James Okafor" matching
-- the original static HTML prototype, so you can see the profile
-- page fully populated without filling out the onboarding wizard.
--
-- Run this AFTER 001_pastors_schema.sql, in the Supabase SQL editor.
-- Safe to re-run: it deletes any existing row with this slug first.
-- ============================================================

delete from public.pastors where slug = 'james-okafor';

with new_pastor as (
  insert into public.pastors (
    slug, full_name, title, initials,
    church_name_cache, city, country,
    bio, vision_statement,
    years_in_ministry, churches_planted, nations_reached, books_published, events_spoken,
    phone, email, website_url,
    facebook_url, facebook_followers,
    instagram_url, instagram_followers,
    youtube_url, youtube_subscribers,
    twitter_url, twitter_followers,
    travel_range, lead_time, availability_status, availability_note,
    is_verified, is_published, view_count
  ) values (
    'james-okafor', 'Pastor James Okafor', 'Senior Pastor', 'JO',
    'Liberty Christian Connections', 'Ilford, London', 'United Kingdom',
    'Pastor James Okafor is a dynamic, Spirit-filled minister with over 18 years of kingdom service. As the Senior Pastor of Liberty Christian Connections in Ilford, East London, he leads a vibrant multicultural congregation of 1,200 members drawn from over 40 nations. Known for his prophetic preaching, passionate worship and commitment to community transformation, Pastor James has ministered in over 50 nations and planted 3 churches across the UK and West Africa. He holds a Doctor of Ministry from Regent University and is the author of two widely-read books on faith and leadership.',
    'To raise a generation of Spirit-empowered believers who transform their communities, nations and the world.',
    18, 3, 50, 2, 200,
    '07700 900123', 'pastor@liberty.co.uk', 'https://pastorjames.co.uk',
    'https://facebook.com/pastorjamesokafor', 12000,
    'https://instagram.com/pastorjamesokafor', 28000,
    'https://youtube.com/@pastorjamesokafor', 85000,
    'https://x.com/pastorjokafor', 9000,
    'International', '2 weeks min', 'available', 'Open 2025',
    true, true, 4820
  )
  returning id
)
select id from new_pastor;

-- Capture the new pastor's id for the rest of this script
do $$
declare
  v_pastor_id uuid;
begin
  select id into v_pastor_id from public.pastors where slug = 'james-okafor';

  -- Languages
  insert into public.pastor_languages (pastor_id, language) values
    (v_pastor_id, 'English'),
    (v_pastor_id, 'Yoruba');

  -- Tags
  insert into public.pastor_tags (pastor_id, category, label) values
    (v_pastor_id, 'preaching', 'Prophetic preaching'),
    (v_pastor_id, 'preaching', 'Evangelism'),
    (v_pastor_id, 'preaching', 'Kingdom authority'),
    (v_pastor_id, 'preaching', 'Church planting'),
    (v_pastor_id, 'preaching', 'Faith & healing'),
    (v_pastor_id, 'ministry_area', 'Youth ministry'),
    (v_pastor_id, 'ministry_area', 'Community outreach'),
    (v_pastor_id, 'ministry_area', 'Marriage & family'),
    (v_pastor_id, 'ministry_area', 'Men''s network'),
    (v_pastor_id, 'ministry_area', 'Women''s ministry'),
    (v_pastor_id, 'ministry_area', 'Prison ministry'),
    (v_pastor_id, 'ministry_area', 'Mentorship'),
    (v_pastor_id, 'ministry_area', 'Leadership training'),
    (v_pastor_id, 'available_for', 'Sunday services'),
    (v_pastor_id, 'available_for', 'Conferences'),
    (v_pastor_id, 'available_for', 'Revival meetings'),
    (v_pastor_id, 'available_for', 'Retreats'),
    (v_pastor_id, 'available_for', 'International engagements'),
    (v_pastor_id, 'available_for', 'Leaders'' summits'),
    (v_pastor_id, 'available_for', 'Weddings'),
    (v_pastor_id, 'available_for', 'Funerals');

  -- Education
  insert into public.pastor_education (pastor_id, degree, institution, year_range, detail, sort_order) values
    (v_pastor_id, 'Doctor of Ministry (DMin)', 'Regent University, Virginia Beach', '2014 – 2017', 'Church Planting in Urban Multicultural Contexts', 1),
    (v_pastor_id, 'Master of Theology (MTh)', 'Redcliffe College, Gloucester', '2009 – 2011', 'Missiology & Cross-Cultural Ministry', 2),
    (v_pastor_id, 'Certified Life Coach', 'International Coaching Federation', '2019', 'Ministry & Leadership Coaching', 3),
    (v_pastor_id, 'Bachelor of Divinity (BD)', 'University of Nigeria, Nsukka', '1999 – 2003', 'First Class Honours', 4);

  -- Ministry journey timeline
  insert into public.pastor_timeline (pastor_id, year, title, description, icon, sort_order) values
    (v_pastor_id, '2006', 'Ordained & Founded Liberty Christian Connections', 'Ordained as a minister within RCCG and planted Liberty Christian Connections in Ilford with 12 founding members.', 'building-church', 1),
    (v_pastor_id, '2012', 'International Ministry Begins', 'First international engagement — South Africa, Zimbabwe, USA. Now reached 50+ nations.', 'globe', 2),
    (v_pastor_id, '2018', 'Community Impact Expansion', 'Launched Liberty Food Bank and Community Hub, now serving 500+ meals per month in partnership with Redbridge Council.', 'heart-handshake', 3),
    (v_pastor_id, '2020', 'Digital Ministry Launched', 'Built an online ministry presence now reaching 85K+ YouTube subscribers and 12K viewers per service globally.', 'brand-youtube', 4),
    (v_pastor_id, '2024', 'Second Book Published', '"Kingdom Authority: Walking in Your Birthright" released in 8 languages with 40,000+ copies in circulation.', 'book', 5);

  -- Sermons
  insert into public.pastor_sermons (pastor_id, title, series, youtube_url, duration_min, views, likes, published_at, sort_order) values
    (v_pastor_id, 'Walking in Your Kingdom Authority', 'Foundations of Faith Series · Week 6', 'https://youtube.com/watch?v=demo1', 58, 42000, 3200, now() - interval '3 days', 1),
    (v_pastor_id, 'The Prayer That Changes Everything', 'Prayer & Power Series · Week 3', 'https://youtube.com/watch?v=demo2', 52, 28000, 2100, now() - interval '2 weeks', 2),
    (v_pastor_id, 'Rediscovering Your God-Given Purpose', 'Identity in Christ Series · Week 1', 'https://youtube.com/watch?v=demo3', 61, 55000, 4800, now() - interval '1 month', 3);

  -- Events
  insert into public.pastor_events (pastor_id, title, event_date, location, start_time, tags, registration_url, sort_order) values
    (v_pastor_id, 'Kingdom Power Conference 2025', current_date + interval '14 days', 'Liberty House, Ilford', '10:00 AM – 8:00 PM', array['Conference', 'Free entry'], 'https://example.com/register', 1),
    (v_pastor_id, 'Ministers Leadership Summit — Lagos', current_date + interval '28 days', 'Eko Convention Centre, Lagos', '9:00 AM', array['International', 'Keynote Speaker'], null, 2),
    (v_pastor_id, 'Youth Fire Camp 2025', current_date + interval '40 days', 'Kingswood Camp, Bristol', 'Fri–Sun · Ages 14–25', array['Youth', 'Weekend retreat'], 'https://example.com/register', 3);

  -- Affiliations
  insert into public.pastor_affiliations (pastor_id, organisation, role, sort_order) values
    (v_pastor_id, 'RCCG', 'Ordained minister · Since 2006', 1),
    (v_pastor_id, 'Pentecostal Fellowship UK', 'Member · East London', 2),
    (v_pastor_id, 'ICGC', 'International partner', 3),
    (v_pastor_id, 'Evangelical Alliance UK', 'Affiliated member', 4);

  -- Awards
  insert into public.pastor_awards (pastor_id, title, issuer, sort_order) values
    (v_pastor_id, 'Community Impact Award', 'Mayor of Redbridge · 2023', 1),
    (v_pastor_id, 'Pastor of the Year Nominee', 'Ekklesia Awards · 2024', 2),
    (v_pastor_id, 'Excellence in Ministry', 'RCCG Area Award · 2022', 3);

  -- Reviews
  insert into public.pastor_reviews (pastor_id, reviewer_name, reviewer_role, rating, comment, created_at) values
    (v_pastor_id, 'Adeola Mensah', 'Pastor, Calvary Chapel Birmingham', 5, 'Pastor James ministered at our church''s 10th anniversary — his word was precise, his spirit was genuine and the entire congregation was transformed. Highly recommend for any conference or special service.', now() - interval '2 weeks'),
    (v_pastor_id, 'Rev. Ngozi Obi', 'Senior Pastor, New Covenant Manchester', 5, 'We hosted Pastor James for our annual youth conference. The young people were deeply impacted — our youth group grew by 40 new members following the event.', now() - interval '1 month'),
    (v_pastor_id, 'Dr Faith Asante', 'Women''s Ministry Leader, London', 5, 'I''ve been under Pastor James'' ministry for 6 years. The combination of scriptural integrity, pastoral care and prophetic insight is rare. A true shepherd.', now() - interval '2 months');

end $$;
