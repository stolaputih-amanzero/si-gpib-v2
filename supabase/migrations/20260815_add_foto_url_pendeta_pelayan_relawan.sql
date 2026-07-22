-- Migration: 20260815_add_foto_url_pendeta_pelayan_relawan.sql
-- Description: Add foto_url column to m_pendeta, t_pelayan, and t_relawan for profile photos

BEGIN;

-- 1. Add foto_url column to m_pendeta
ALTER TABLE m_pendeta
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 2. Add foto_url column to t_pelayan
ALTER TABLE t_pelayan
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 3. Add foto_url column to t_relawan
ALTER TABLE t_relawan
ADD COLUMN IF NOT EXISTS foto_url TEXT;

COMMIT;
