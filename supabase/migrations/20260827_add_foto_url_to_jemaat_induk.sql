-- Migration: 20260827_add_foto_url_to_jemaat_induk.sql
-- Description: Add foto_url column to m_jemaat_induk table

BEGIN;

ALTER TABLE public.m_jemaat_induk
ADD COLUMN IF NOT EXISTS foto_url TEXT;

COMMIT;
