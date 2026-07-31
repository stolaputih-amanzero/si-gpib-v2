-- Migration: 20260821_ensure_super_user_role.sql
-- Description: Ensure stolaputih and superadmin accounts are explicitly assigned role 'super_user' in users table

BEGIN;

UPDATE public.users
SET 
  role = 'super_user',
  updated_at = NOW()
WHERE 
  email ILIKE '%stolaputih%'
  OR email ILIKE '%superadmin%'
  OR role = 'superuser';

COMMIT;
