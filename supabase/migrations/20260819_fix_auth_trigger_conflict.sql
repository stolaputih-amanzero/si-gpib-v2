-- Migration: 20260819_fix_auth_trigger_conflict.sql
-- Description: Fix handle_new_user trigger to handle existing emails in public.users without unique constraint violation

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Check if email already exists in public.users
    IF NEW.email IS NOT NULL AND EXISTS (SELECT 1 FROM public.users WHERE LOWER(email) = LOWER(NEW.email)) THEN
        UPDATE public.users
        SET id = NEW.id,
            no_telepon = COALESCE(NEW.raw_user_meta_data->>'phone', no_telepon),
            role = COALESCE(NEW.raw_user_meta_data->>'role', role, 'pendeta'),
            status = 'Active',
            updated_at = NOW()
        WHERE LOWER(email) = LOWER(NEW.email);
    ELSE
        -- 2. Insert new user or update by id on conflict
        INSERT INTO public.users (id, email, no_telepon, role, status)
        VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'phone',
            COALESCE(NEW.raw_user_meta_data->>'role', 'pendeta'),
            'Active'
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            no_telepon = EXCLUDED.no_telepon,
            role = COALESCE(NEW.raw_user_meta_data->>'role', public.users.role),
            status = 'Active',
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent trigger failure from aborting GoTrue auth transactions
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
