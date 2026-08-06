-- ============================================================
-- 004_add_pastor_social_columns.sql
-- Run this in Supabase SQL Editor to add LinkedIn & TikTok columns
-- ============================================================

ALTER TABLE public.pastors 
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS tiktok_url text;
