-- Migration: 20260829_add_performance_indexes.sql
-- Description: Add database performance indexes for fast queries and smooth navigation

BEGIN;

-- Indexes for m_pos_pelkes
CREATE INDEX IF NOT EXISTS idx_m_pos_pelkes_id_induk ON public.m_pos_pelkes(id_induk);
CREATE INDEX IF NOT EXISTS idx_m_pos_pelkes_kategori ON public.m_pos_pelkes(kategori);
CREATE INDEX IF NOT EXISTS idx_m_pos_pelkes_created_at ON public.m_pos_pelkes(created_at DESC);

-- Indexes for m_jemaat_induk
CREATE INDEX IF NOT EXISTS idx_m_jemaat_induk_id_mupel ON public.m_jemaat_induk(id_mupel);
CREATE INDEX IF NOT EXISTS idx_m_jemaat_induk_id_kmj ON public.m_jemaat_induk(id_kmj);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_id_mupel ON public.users(id_mupel);
CREATE INDEX IF NOT EXISTS idx_users_id_induk ON public.users(id_induk);
CREATE INDEX IF NOT EXISTS idx_users_id_pos ON public.users(id_pos);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Indexes for t_histori_perubahan_status
CREATE INDEX IF NOT EXISTS idx_t_histori_id_pos ON public.t_histori_perubahan_status(id_pos);
CREATE INDEX IF NOT EXISTS idx_t_histori_id_induk_baru ON public.t_histori_perubahan_status(id_induk_baru);

-- Indexes for t_jadwal_ibadah
CREATE INDEX IF NOT EXISTS idx_t_jadwal_ibadah_id_pos ON public.t_jadwal_ibadah(id_pos);

-- Indexes for t_demografi_pelkat
CREATE INDEX IF NOT EXISTS idx_t_demografi_pelkat_id_pos ON public.t_demografi_pelkat(id_pos);

COMMIT;
