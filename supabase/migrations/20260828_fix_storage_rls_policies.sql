-- Migration: 20260828_fix_storage_rls_policies.sql
-- Description: Enable permissive storage policies for pos-pelkes-images bucket

BEGIN;

-- Ensure bucket exists and is set to public
INSERT INTO storage.buckets (id, name, public)
VALUES ('pos-pelkes-images', 'pos-pelkes-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop any existing restrictive policies on pos-pelkes-images bucket
DROP POLICY IF EXISTS "Public Select pos-pelkes-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert pos-pelkes-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update pos-pelkes-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete pos-pelkes-images" ON storage.objects;

-- Create permissive policies for storage.objects on pos-pelkes-images bucket
CREATE POLICY "Public Select pos-pelkes-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'pos-pelkes-images');

CREATE POLICY "Public Insert pos-pelkes-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pos-pelkes-images');

CREATE POLICY "Public Update pos-pelkes-images"
ON storage.objects FOR UPDATE
WITH CHECK (bucket_id = 'pos-pelkes-images');

CREATE POLICY "Public Delete pos-pelkes-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'pos-pelkes-images');

COMMIT;
