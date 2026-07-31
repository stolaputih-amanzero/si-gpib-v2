-- Migration: 20260826_fix_jemaat_induk_fk_constraints.sql
-- Description: Update FK constraint t_histori_perubahan_status_id_induk_baru_fkey to ON DELETE SET NULL

BEGIN;

ALTER TABLE public.t_histori_perubahan_status
DROP CONSTRAINT IF EXISTS t_histori_perubahan_status_id_induk_baru_fkey;

ALTER TABLE public.t_histori_perubahan_status
ADD CONSTRAINT t_histori_perubahan_status_id_induk_baru_fkey
FOREIGN KEY (id_induk_baru) REFERENCES public.m_jemaat_induk(id_induk)
ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
