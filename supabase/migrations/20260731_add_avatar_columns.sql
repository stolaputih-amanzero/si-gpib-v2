-- Migration: 20260731_add_avatar_columns.sql
-- Description: Add avatar_url, foto_url, nama_lengkap, no_hp columns to users & m_pendeta

BEGIN;

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(150),
  ADD COLUMN IF NOT EXISTS no_hp VARCHAR(30),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS foto_url TEXT;

ALTER TABLE public.m_pendeta 
  ADD COLUMN IF NOT EXISTS foto_url TEXT;

COMMIT;
