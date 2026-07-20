-- 1. Add foto_url column to t_log_pastoral
ALTER TABLE t_log_pastoral
ADD COLUMN foto_url TEXT;

-- 2. Create Storage Bucket for Pastoral Logs
INSERT INTO storage.buckets (id, name, public)
VALUES ('log-pastoral-images', 'log-pastoral-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS Policies for the new Storage Bucket
-- Allow anyone to read images (public)
CREATE POLICY "Allow public read access to log-pastoral-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'log-pastoral-images');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload to log-pastoral-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'log-pastoral-images');

-- Allow users to update their own uploads
CREATE POLICY "Allow authenticated users to update their own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'log-pastoral-images' AND auth.uid() = owner);

-- Allow users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'log-pastoral-images' AND auth.uid() = owner);
