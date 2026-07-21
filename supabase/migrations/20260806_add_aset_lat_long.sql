-- Migration: Add specific latitude & longitude columns to asset tables
-- Allows storing physical location coordinates per asset (which may differ from Pos Pelkes / Gereja HQ)

ALTER TABLE t_aset_tanah ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE t_aset_tanah ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

ALTER TABLE t_aset_bangunan ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE t_aset_bangunan ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

ALTER TABLE t_aset_bergerak ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE t_aset_bergerak ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);
