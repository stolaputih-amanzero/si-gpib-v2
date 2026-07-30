-- Migration: 20260731_fix_pendeta_role_pj.sql
-- Description: Update Pdt. Ben Bianco Pattinama, S.Si-Teol. role to PJ (is_kmj = false, is_pj = true)

BEGIN;

-- 1. Update m_pendeta table (is_kmj = false, is_pj = true)
UPDATE public.m_pendeta
SET 
  is_kmj = FALSE,
  is_pj = TRUE,
  updated_at = NOW()
WHERE 
  nama_lengkap ILIKE '%Ben Bianco%'
  OR email ILIKE '%benbianco%'
  OR email ILIKE '%stolaputih%';

-- 2. Update users table role if set to kmj
UPDATE public.users
SET 
  role = 'pj',
  updated_at = NOW()
WHERE 
  (email ILIKE '%benbianco%' OR email ILIKE '%stolaputih%')
  AND role = 'kmj';

COMMIT;
