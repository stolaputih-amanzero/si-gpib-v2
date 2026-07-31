-- Migration: Add foto_url column to t_keluarga_pendeta table
ALTER TABLE t_keluarga_pendeta ADD COLUMN IF NOT EXISTS foto_url text;
