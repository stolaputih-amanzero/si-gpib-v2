-- Migration: Add nama_bangunan column to t_aset_bangunan table
ALTER TABLE t_aset_bangunan ADD COLUMN IF NOT EXISTS nama_bangunan VARCHAR(150);
