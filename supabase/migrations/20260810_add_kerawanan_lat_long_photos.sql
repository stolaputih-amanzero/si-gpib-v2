-- Migration: 20260810_add_kerawanan_lat_long_photos.sql
-- Description: Add latitude, longitude, updated_by to t_kerawanan_wilayah and create t_lampiran_kerawanan table with RLS policies

BEGIN;

ALTER TABLE t_kerawanan_wilayah ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8);
ALTER TABLE t_kerawanan_wilayah ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);
ALTER TABLE t_kerawanan_wilayah ADD COLUMN IF NOT EXISTS updated_by VARCHAR(150);

CREATE TABLE IF NOT EXISTS t_lampiran_kerawanan (
    id_lampiran VARCHAR(30) PRIMARY KEY,
    id_risiko VARCHAR(30) REFERENCES t_kerawanan_wilayah(id_risiko) ON DELETE CASCADE,
    nama_file VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    tipe_file VARCHAR(50),
    ukuran_file NUMERIC(10, 2),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS setup
ALTER TABLE t_lampiran_kerawanan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_lampiran_kerawanan" ON t_lampiran_kerawanan;
DROP POLICY IF EXISTS "Allow insert for t_lampiran_kerawanan" ON t_lampiran_kerawanan;
DROP POLICY IF EXISTS "Allow update for t_lampiran_kerawanan" ON t_lampiran_kerawanan;
DROP POLICY IF EXISTS "Allow delete for t_lampiran_kerawanan" ON t_lampiran_kerawanan;

CREATE POLICY "Allow read for t_lampiran_kerawanan" ON t_lampiran_kerawanan FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_lampiran_kerawanan" ON t_lampiran_kerawanan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_lampiran_kerawanan" ON t_lampiran_kerawanan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_lampiran_kerawanan" ON t_lampiran_kerawanan FOR DELETE USING (true);

COMMIT;
