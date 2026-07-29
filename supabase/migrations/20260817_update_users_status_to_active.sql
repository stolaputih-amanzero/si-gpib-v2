-- Migration: 20260817_update_users_status_to_active.sql
-- Description: Update status values from 'Aktif' to 'Active' in public.users table and set default column value to 'Active'

BEGIN;

ALTER TABLE public.users ALTER COLUMN status SET DEFAULT 'Active';

UPDATE public.users
SET status = 'Active',
    updated_at = NOW()
WHERE status = 'Aktif';

-- Update trigger handle_new_user to use 'Active'
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
