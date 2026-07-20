-- Migration: 20260722_storage_bucket.sql
-- Description: Buat bucket pos-pelkes-images dan RLS policies

BEGIN;

-- Insert bucket baru ke tabel storage.buckets jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pos-pelkes-images', 
    'pos-pelkes-images', 
    true, 
    5242880, -- 5MB limit max, though we compress to <1MB on client
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- storage.objects RLS sudah aktif secara default di Supabase, jadi tidak perlu ALTER TABLE.

-- Hapus policy lama jika ada untuk mencegah duplikasi
DROP POLICY IF EXISTS "Public can view pos-pelkes-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to pos-pelkes-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploaded images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploaded images" ON storage.objects;

-- Policy 1: Semua orang (bahkan anonim) bisa melihat gambar di bucket ini karena public
CREATE POLICY "Public can view pos-pelkes-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'pos-pelkes-images');

-- Policy 2: Authenticated user bisa upload ke bucket ini
CREATE POLICY "Users can upload to pos-pelkes-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pos-pelkes-images');

-- Policy 3: Authenticated user bisa update file di bucket ini
CREATE POLICY "Users can update their uploaded images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pos-pelkes-images' AND auth.uid() = owner);

-- Policy 4: Authenticated user bisa delete file di bucket ini
CREATE POLICY "Users can delete their uploaded images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pos-pelkes-images' AND auth.uid() = owner);

COMMIT;
