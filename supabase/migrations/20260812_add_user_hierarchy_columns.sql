-- Migration: 20260812_add_user_hierarchy_columns.sql
-- Description: Add missing columns id_induk, id_pos, and nama_lengkap to public.users table for cascading auth selection

BEGIN;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_induk VARCHAR(20) REFERENCES m_jemaat_induk(id_induk);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(150);

COMMIT;
