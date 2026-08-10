-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('assets', 'assets', false),
  ('documents', 'documents', false),
  ('pastoral', 'pastoral', false),
  ('territory', 'territory', false),
  ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for 'assets' bucket
CREATE POLICY "Users can upload assets in their scope"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
);

CREATE POLICY "Users can view assets in their scope"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'assets'
  AND (
    (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
    OR auth.jwt()->>'role' = 'super_user'
    OR (auth.jwt()->>'role' = 'admin_mupel' AND (storage.foldername(name))[1] IN (
      SELECT id_pos FROM m_pos_pelkes WHERE id_induk IN (SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = (auth.jwt()->>'id_mupel')::text)
    ))
  )
);

CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
);

-- RLS Policies for 'documents' bucket
CREATE POLICY "Users can upload documents in their scope"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (
    ((storage.foldername(name))[1] IN ('kompetensi', 'keluarga') AND (storage.foldername(name))[2] = auth.jwt()->>'id_person')
    OR
    ((storage.foldername(name))[1] = 'legalitas' AND (storage.foldername(name))[2] = auth.jwt()->>'id_pos')
  )
);

CREATE POLICY "Users can view documents in their scope"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    ((storage.foldername(name))[1] IN ('kompetensi', 'keluarga') AND (storage.foldername(name))[2] = auth.jwt()->>'id_person')
    OR ((storage.foldername(name))[1] = 'legalitas' AND (storage.foldername(name))[2] = auth.jwt()->>'id_pos')
    OR auth.jwt()->>'role' = 'super_user'
    OR (auth.jwt()->>'role' = 'admin_mupel' AND (storage.foldername(name))[2] IN (
      SELECT id_pos FROM m_pos_pelkes WHERE id_induk IN (SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = (auth.jwt()->>'id_mupel')::text)
    ))
  )
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    ((storage.foldername(name))[1] IN ('kompetensi', 'keluarga') AND (storage.foldername(name))[2] = auth.jwt()->>'id_person')
    OR
    ((storage.foldername(name))[1] = 'legalitas' AND (storage.foldername(name))[2] = auth.jwt()->>'id_pos')
  )
);

-- RLS Policies for 'pastoral' bucket
CREATE POLICY "Users can upload pastoral photos in their scope"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'pastoral'
  AND (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
);

CREATE POLICY "Users can view pastoral photos in their scope"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'pastoral'
  AND (
    (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
    OR auth.jwt()->>'role' = 'super_user'
    OR (auth.jwt()->>'role' = 'admin_mupel' AND (storage.foldername(name))[1] IN (
      SELECT id_pos FROM m_pos_pelkes WHERE id_induk IN (SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = (auth.jwt()->>'id_mupel')::text)
    ))
  )
);

CREATE POLICY "Users can delete their own pastoral photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'pastoral'
  AND (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
);

-- RLS Policies for 'territory' bucket
CREATE POLICY "Users can upload territory photos in their scope"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'territory'
  AND (storage.foldername(name))[2] = auth.jwt()->>'id_pos'
);

CREATE POLICY "Users can view territory photos in their scope"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'territory'
  AND (
    (storage.foldername(name))[2] = auth.jwt()->>'id_pos'
    OR auth.jwt()->>'role' = 'super_user'
    OR (auth.jwt()->>'role' = 'admin_mupel' AND (storage.foldername(name))[2] IN (
      SELECT id_pos FROM m_pos_pelkes WHERE id_induk IN (SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = (auth.jwt()->>'id_mupel')::text)
    ))
  )
);

CREATE POLICY "Users can delete their own territory photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'territory'
  AND (storage.foldername(name))[2] = auth.jwt()->>'id_pos'
);

-- RLS Policies for 'avatars' bucket
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (
    ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    ((storage.foldername(name))[1] = 'pendeta' AND (storage.foldername(name))[2] = auth.jwt()->>'id_person')
  )
);

CREATE POLICY "Avatars are publicly viewable for application rendering"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    ((storage.foldername(name))[1] = 'pendeta' AND (storage.foldername(name))[2] = auth.jwt()->>'id_person')
  )
);
