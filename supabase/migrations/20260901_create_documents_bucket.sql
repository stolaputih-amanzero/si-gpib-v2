-- Migration: Create Documents Bucket
-- Description: Buat bucket documents untuk menyimpan SK dan dokumen lainnya

BEGIN;

-- Insert bucket baru ke tabel storage.buckets jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents', 
    'documents', 
    true, 
    10485760, -- 10MB limit max
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Hapus policy lama jika ada untuk mencegah duplikasi
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Super users can delete documents" ON storage.objects;

-- Policy 1: Semua orang (bahkan anonim) bisa melihat dokumen di bucket ini karena public
CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Policy 2: Authenticated user bisa upload ke bucket ini
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy 3: Super users dan uploader bisa update/delete file
CREATE POLICY "Users can manage their uploaded documents"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documents' AND (
  auth.uid() = owner OR 
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_user'
));

COMMIT;
