-- Migration: Add updated_by column to t_demografi_pelkat
-- Description: Stores the user (email/phone/name) who performed the last demografi update.

ALTER TABLE t_demografi_pelkat ADD COLUMN IF NOT EXISTS updated_by VARCHAR(150);
