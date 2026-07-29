-- Migration: 20260816_set_user_role_to_pendeta.sql
-- Description: Update existing users with role 'User' or 'user' to 'pendeta' and default handle_new_user trigger to 'pendeta'

BEGIN;

-- 1. Update existing public.users where role is 'User' or 'user'
UPDATE public.users
SET role = 'pendeta',
    updated_at = NOW()
WHERE LOWER(role) = 'user';

-- 2. Update handle_new_user trigger function to default new users to 'pendeta'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
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
            updated_at = NOW();
            
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO public.t_log_aktivitas (id_log, id_user, aktor, aksi, objek_type, objek_id, keterangan)
        VALUES (
            'LOG-' || (extract(epoch from now()) * 1000)::bigint::text || '-' || floor(random() * 1000)::text,
            NULL, 
            'Sistem', 
            'ERROR', 
            'users', 
            NEW.id::text, 
            'Gagal sinkronisasi auth.users ke public.users: ' || SQLERRM
        );
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
