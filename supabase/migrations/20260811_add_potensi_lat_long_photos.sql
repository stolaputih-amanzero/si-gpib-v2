-- Migration: 20260811_add_potensi_lat_long_photos.sql
-- Description: Add latitude, longitude, updated_by to t_potensi_wilayah and create t_lampiran_potensi table with RLS policies

BEGIN;

ALTER TABLE t_potensi_wilayah ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8);
ALTER TABLE t_potensi_wilayah ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);
ALTER TABLE t_potensi_wilayah ADD COLUMN IF NOT EXISTS updated_by VARCHAR(150);

CREATE TABLE IF NOT EXISTS t_lampiran_potensi (
    id_lampiran VARCHAR(30) PRIMARY KEY,
    id_potensi VARCHAR(30) REFERENCES t_potensi_wilayah(id_potensi) ON DELETE CASCADE,
    nama_file VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    tipe_file VARCHAR(50),
    ukuran_file NUMERIC(10, 2),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS setup
ALTER TABLE t_lampiran_potensi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_lampiran_potensi" ON t_lampiran_potensi;
DROP POLICY IF EXISTS "Allow insert for t_lampiran_potensi" ON t_lampiran_potensi;
DROP POLICY IF EXISTS "Allow update for t_lampiran_potensi" ON t_lampiran_potensi;
DROP POLICY IF EXISTS "Allow delete for t_lampiran_potensi" ON t_lampiran_potensi;

CREATE POLICY "Allow read for t_lampiran_potensi" ON t_lampiran_potensi FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_lampiran_potensi" ON t_lampiran_potensi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_lampiran_potensi" ON t_lampiran_potensi FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_lampiran_potensi" ON t_lampiran_potensi FOR DELETE USING (true);

COMMIT;
