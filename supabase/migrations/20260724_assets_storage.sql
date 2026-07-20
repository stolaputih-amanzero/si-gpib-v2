-- Create "assets-images" bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets-images', 'assets-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload and delete files
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets-images');

CREATE POLICY "Authenticated users can delete assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets-images');

CREATE POLICY "Authenticated users can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets-images');

-- Allow public to read/download files
CREATE POLICY "Public can view assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets-images');
