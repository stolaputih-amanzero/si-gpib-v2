-- Migration: Add dokumen_url column to t_kompetensi_pendeta table
ALTER TABLE t_kompetensi_pendeta ADD COLUMN IF NOT EXISTS dokumen_url text;
