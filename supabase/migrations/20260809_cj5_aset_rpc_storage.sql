-- ==============================================================================
-- Migration: CJ-5 Aset Offline-First (Storage, Lampiran Constraint, and Atomic RPCs)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. K-1: ALTER TABLE t_lampiran_aset (Safe Constraint Addition)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_lampiran_aset_parent'
  ) THEN
    ALTER TABLE t_lampiran_aset
      ADD CONSTRAINT chk_lampiran_aset_parent
      CHECK (
        (id_tanah IS NOT NULL)::int +
        (id_bangunan IS NOT NULL)::int +
        (id_aset_b IS NOT NULL)::int = 1
      ) NOT VALID;
  END IF;
END $$;

-- Validasi Constraint (akan gagal dan memberitahu jika ada data legacy cacat)
ALTER TABLE t_lampiran_aset VALIDATE CONSTRAINT chk_lampiran_aset_parent;


-- ------------------------------------------------------------------------------
-- 2. Storage Bucket & Policies (N-1)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assets', 
    'assets', 
    TRUE,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Baca publik
DROP POLICY IF EXISTS "assets_public_read" ON storage.objects;
CREATE POLICY "assets_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Tulis: authenticated + ekstensi diizinkan + max 10MB
DROP POLICY IF EXISTS "assets_authenticated_write" ON storage.objects;
CREATE POLICY "assets_authenticated_write"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'assets'
);

-- Upsert butuh UPDATE (path deterministik → overwrite idempoten)
DROP POLICY IF EXISTS "assets_authenticated_update" ON storage.objects;
CREATE POLICY "assets_authenticated_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'assets'
);

-- Hapus: hanya super_user
DROP POLICY IF EXISTS "assets_delete_super_user" ON storage.objects;
CREATE POLICY "assets_delete_super_user"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'assets' AND (auth.jwt()->>'role') = 'super_user');


-- ------------------------------------------------------------------------------
-- 3. Atomic RPCs (RBAC + Idempotency + Insert)
-- Path Lampiran Konvensi: assets/{id_pos}/{jenis}/{id_aset}/{requestId}-{indeks}.{ext}
-- ------------------------------------------------------------------------------

-- A. Aset Tanah
CREATE OR REPLACE FUNCTION create_aset_tanah_atomic(
  p_id_tanah      VARCHAR,
  p_id_pos        VARCHAR,
  p_id_pendeta    VARCHAR,
  p_user_id       UUID,
  p_request_id    VARCHAR,
  p_luas_m2       NUMERIC,
  p_thn_perolehan INT,
  p_status_hukum  VARCHAR,
  p_kondisi       VARCHAR,
  p_potensi_sda   VARCHAR,
  p_latitude      NUMERIC,
  p_longitude     NUMERIC,
  p_keterangan    TEXT,
  p_foto          JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Defense-in-depth RBAC
  IF NOT EXISTS (SELECT 1 FROM t_penugasan_pendeta
                 WHERE id_pendeta = p_id_pendeta AND id_pos = p_id_pos
                   AND status_tugas = 'Aktif' AND tgl_selesai IS NULL)
  THEN
    RAISE EXCEPTION 'RBAC_VIOLATION: penugasan aktif tidak ditemukan';
  END IF;

  -- 2. Idempotency double-lock
  IF EXISTS (SELECT 1 FROM sys_transaction_logs
             WHERE request_id::text = p_request_id AND user_id = p_user_id)
  THEN RETURN;
  END IF;

  -- 3. Insert aset tanah
  INSERT INTO t_aset_tanah (id_tanah, id_pos, luas_m2, thn_perolehan, status_hukum,
    kondisi, potensi_sda, latitude, longitude, keterangan)
  VALUES (p_id_tanah, p_id_pos, p_luas_m2, p_thn_perolehan, p_status_hukum,
    p_kondisi, p_potensi_sda, p_latitude, p_longitude, p_keterangan);

  -- 4. Insert foto utama sebagai lampiran
  IF p_foto IS NOT NULL THEN
    INSERT INTO t_lampiran_aset (id_lampiran, id_tanah, nama_file, file_path, tipe_file, ukuran_file)
    VALUES (p_foto->>'id_lampiran', p_id_tanah, p_foto->>'nama_file',
            p_foto->>'file_path', p_foto->>'tipe_file', (p_foto->>'ukuran_file')::NUMERIC);
  END IF;

  -- 5. Idempotency record (N-5)
  INSERT INTO sys_transaction_logs (request_id, user_id, operation_type, table_name, record_id, payload_summary, created_at)
  VALUES (p_request_id::uuid, p_user_id, 'insert', 't_aset_tanah', p_id_tanah,
          jsonb_build_object('id_pos', p_id_pos, 'luas_m2', p_luas_m2), NOW());
END;
$$;

REVOKE ALL ON FUNCTION create_aset_tanah_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_aset_tanah_atomic TO authenticated;


-- B. Aset Bangunan
CREATE OR REPLACE FUNCTION create_aset_bangunan_atomic(
  p_id_bangunan   VARCHAR,
  p_id_pos        VARCHAR,
  p_id_pendeta    VARCHAR,
  p_user_id       UUID,
  p_request_id    VARCHAR,
  p_nama_bangunan VARCHAR,
  p_fungsi        VARCHAR,
  p_thn_berdiri   INT,
  p_kondisi       VARCHAR,
  p_latitude      NUMERIC,
  p_longitude     NUMERIC,
  p_keterangan    TEXT,
  p_foto          JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Defense-in-depth RBAC
  IF NOT EXISTS (SELECT 1 FROM t_penugasan_pendeta
                 WHERE id_pendeta = p_id_pendeta AND id_pos = p_id_pos
                   AND status_tugas = 'Aktif' AND tgl_selesai IS NULL)
  THEN
    RAISE EXCEPTION 'RBAC_VIOLATION: penugasan aktif tidak ditemukan';
  END IF;

  -- 2. Idempotency double-lock
  IF EXISTS (SELECT 1 FROM sys_transaction_logs
             WHERE request_id::text = p_request_id AND user_id = p_user_id)
  THEN RETURN;
  END IF;

  -- 3. Insert aset bangunan
  INSERT INTO t_aset_bangunan (id_bangunan, id_pos, nama_bangunan, fungsi, thn_berdiri,
    kondisi, latitude, longitude, keterangan)
  VALUES (p_id_bangunan, p_id_pos, p_nama_bangunan, p_fungsi, p_thn_berdiri,
    p_kondisi, p_latitude, p_longitude, p_keterangan);

  -- 4. Insert foto utama sebagai lampiran
  IF p_foto IS NOT NULL THEN
    INSERT INTO t_lampiran_aset (id_lampiran, id_bangunan, nama_file, file_path, tipe_file, ukuran_file)
    VALUES (p_foto->>'id_lampiran', p_id_bangunan, p_foto->>'nama_file',
            p_foto->>'file_path', p_foto->>'tipe_file', (p_foto->>'ukuran_file')::NUMERIC);
  END IF;

  -- 5. Idempotency record (N-5)
  INSERT INTO sys_transaction_logs (request_id, user_id, operation_type, table_name, record_id, payload_summary, created_at)
  VALUES (p_request_id::uuid, p_user_id, 'insert', 't_aset_bangunan', p_id_bangunan,
          jsonb_build_object('id_pos', p_id_pos, 'nama_bangunan', p_nama_bangunan), NOW());
END;
$$;

REVOKE ALL ON FUNCTION create_aset_bangunan_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_aset_bangunan_atomic TO authenticated;


-- C. Aset Bergerak
CREATE OR REPLACE FUNCTION create_aset_bergerak_atomic(
  p_id_aset_b     VARCHAR,
  p_id_pos        VARCHAR,
  p_id_pendeta    VARCHAR,
  p_user_id       UUID,
  p_request_id    VARCHAR,
  p_jenis         VARCHAR,
  p_merk_tipe     VARCHAR,
  p_thn_perolehan INT,
  p_no_polisi     VARCHAR,
  p_tgl_pajak     DATE,
  p_kondisi       VARCHAR,
  p_latitude      NUMERIC,
  p_longitude     NUMERIC,
  p_keterangan    TEXT,
  p_foto          JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Defense-in-depth RBAC
  IF NOT EXISTS (SELECT 1 FROM t_penugasan_pendeta
                 WHERE id_pendeta = p_id_pendeta AND id_pos = p_id_pos
                   AND status_tugas = 'Aktif' AND tgl_selesai IS NULL)
  THEN
    RAISE EXCEPTION 'RBAC_VIOLATION: penugasan aktif tidak ditemukan';
  END IF;

  -- 2. Idempotency double-lock
  IF EXISTS (SELECT 1 FROM sys_transaction_logs
             WHERE request_id::text = p_request_id AND user_id = p_user_id)
  THEN RETURN;
  END IF;

  -- 3. Insert aset bergerak
  INSERT INTO t_aset_bergerak (id_aset_b, id_pos, jenis, merk_tipe, thn_perolehan,
    no_polisi, tgl_pajak, kondisi, latitude, longitude, keterangan)
  VALUES (p_id_aset_b, p_id_pos, p_jenis, p_merk_tipe, p_thn_perolehan,
    p_no_polisi, p_tgl_pajak, p_kondisi, p_latitude, p_longitude, p_keterangan);

  -- 4. Insert foto utama sebagai lampiran
  IF p_foto IS NOT NULL THEN
    INSERT INTO t_lampiran_aset (id_lampiran, id_aset_b, nama_file, file_path, tipe_file, ukuran_file)
    VALUES (p_foto->>'id_lampiran', p_id_aset_b, p_foto->>'nama_file',
            p_foto->>'file_path', p_foto->>'tipe_file', (p_foto->>'ukuran_file')::NUMERIC);
  END IF;

  -- 5. Idempotency record (N-5)
  INSERT INTO sys_transaction_logs (request_id, user_id, operation_type, table_name, record_id, payload_summary, created_at)
  VALUES (p_request_id::uuid, p_user_id, 'insert', 't_aset_bergerak', p_id_aset_b,
          jsonb_build_object('id_pos', p_id_pos, 'jenis', p_jenis), NOW());
END;
$$;

REVOKE ALL ON FUNCTION create_aset_bergerak_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_aset_bergerak_atomic TO authenticated;
