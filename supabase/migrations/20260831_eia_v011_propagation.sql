-- Migration: 20260831_eia_v011_propagation.sql
-- Description: Implement EIA v0.1.1 propagation checklist (id_pengajuan_sebelumnya & t_log_aktivitas RLS)

BEGIN;

-- 1. Tambah kolom id_pengajuan_sebelumnya di t_pengajuan_bantuan
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 't_pengajuan_bantuan' AND column_name = 'id_pengajuan_sebelumnya'
  ) THEN
    ALTER TABLE t_pengajuan_bantuan 
    ADD COLUMN id_pengajuan_sebelumnya VARCHAR(30) NULL REFERENCES t_pengajuan_bantuan(id_ajuan);
  END IF;
END $$;

-- 2. Update RLS policy untuk t_log_aktivitas
-- EIA v0.1.1: Diri sendiri + Super User + admin_mupel (scope Mupel) + kmj (scope Jemaat)

DROP POLICY IF EXISTS "Akses audit log aktivitas" ON t_log_aktivitas;
DROP POLICY IF EXISTS "User can view own audit log" ON t_log_aktivitas;

CREATE POLICY "Akses audit log aktivitas"
ON t_log_aktivitas FOR SELECT
USING (
  -- Diri sendiri
  id_user = auth.uid()
  -- Super User global
  OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
  -- Admin Mupel (dapat melihat audit log user dalam scope Mupelnya)
  OR (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin_mupel'
    AND id_user IN (
      SELECT id FROM users WHERE id_mupel = (SELECT id_mupel FROM users WHERE id = auth.uid())
    )
  )
  -- KMJ (dapat melihat audit log user dalam scope Jemaatnya)
  OR (
    (SELECT role FROM users WHERE id = auth.uid()) = 'kmj'
    AND id_user IN (
      SELECT id FROM users WHERE id_induk = (SELECT id_induk FROM users WHERE id = auth.uid())
    )
  )
);

COMMIT;
