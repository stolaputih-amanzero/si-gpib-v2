-- Migration: Add nip and nik columns to m_pendeta table
ALTER TABLE m_pendeta ADD COLUMN IF NOT EXISTS nip text;
ALTER TABLE m_pendeta ADD COLUMN IF NOT EXISTS nik text;
