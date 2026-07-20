-- Migration: 20260721_auth_trigger.sql
-- Description: Trigger untuk sinkronisasi otomatis auth.users ke public.users

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Mencoba untuk insert atau update tabel public.users
    BEGIN
        INSERT INTO public.users (id, email, no_telepon, role, status)
        VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'phone',
            COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
            'Aktif'
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            no_telepon = EXCLUDED.no_telepon,
            role = COALESCE(NEW.raw_user_meta_data->>'role', public.users.role),
            updated_at = NOW();
            
    EXCEPTION WHEN OTHERS THEN
        -- Jika terjadi error (misal duplicate email pada ID yang berbeda), catat di t_log_aktivitas
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

-- Hapus trigger jika sudah ada (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE OF email, raw_user_meta_data ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
