-- Migration: Atomic mutation RPC with Unified Identity Sync & SK Attachment
-- File: 20260805_mutasi_pendeta_with_identity_sync.sql

-- 1. Tambahkan kolom file_sk pada tabel riwayat mutasi jika belum ada
ALTER TABLE public.t_riwayat_mutasi_pendeta 
ADD COLUMN IF NOT EXISTS file_sk VARCHAR(500);

-- 2. Drop fungsi lama untuk menghindari overloaded signature
DROP FUNCTION IF EXISTS public.mutasi_pendeta(VARCHAR, VARCHAR, TEXT);

-- 3. Buat ulang fungsi RPC mutasi_pendeta dengan 5 parameter
CREATE OR REPLACE FUNCTION public.mutasi_pendeta(
    p_id_pendeta VARCHAR,
    p_id_induk_baru VARCHAR,
    p_alasan TEXT,
    p_jenis_mutasi VARCHAR DEFAULT 'MUTASI',
    p_file_sk VARCHAR DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_id_induk_lama VARCHAR;
    v_id_mupel_baru VARCHAR;
    v_is_kmj BOOLEAN;
    v_is_pj BOOLEAN;
    v_user_id UUID;
    v_aktor_name VARCHAR;
BEGIN
    -- 1. Dapatkan info pendeta saat ini
    SELECT id_induk, is_kmj, is_pj 
    INTO v_id_induk_lama, v_is_kmj, v_is_pj
    FROM public.m_pendeta 
    WHERE id_pendeta = p_id_pendeta;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pendeta tidak ditemukan: %', p_id_pendeta;
    END IF;

    -- 2. Validasi Jemaat Induk tujuan
    IF NOT EXISTS (SELECT 1 FROM public.m_jemaat_induk WHERE id_induk = p_id_induk_baru) THEN
        RAISE EXCEPTION 'Jemaat tujuan tidak ditemukan: %', p_id_induk_baru;
    END IF;

    -- 3. Ambil id_mupel Jemaat Induk baru untuk sinkronisasi akun
    SELECT id_mupel INTO v_id_mupel_baru
    FROM public.m_jemaat_induk 
    WHERE id_induk = p_id_induk_baru;

    -- 4. Jika pendeta ini KMJ di jemaat lama, kosongkan id_kmj di jemaat lama
    IF v_is_kmj THEN
        UPDATE public.m_jemaat_induk 
        SET id_kmj = NULL, updated_at = NOW()
        WHERE id_induk = v_id_induk_lama AND id_kmj = p_id_pendeta;
    END IF;

    -- 5. Reset flag is_kmj dan is_pj pada m_pendeta
    UPDATE public.m_pendeta 
    SET 
        id_induk = p_id_induk_baru,
        is_kmj = FALSE,
        is_pj = FALSE,
        updated_at = NOW()
    WHERE id_pendeta = p_id_pendeta;

    -- 6. Tutup penugasan PJ di jemaat lama (jika ada)
    UPDATE public.t_pj_jemaat 
    SET 
        tanggal_selesai = CURRENT_DATE,
        status = 'Selesai',
        updated_at = NOW()
    WHERE id_pendeta = p_id_pendeta AND (tanggal_selesai IS NULL OR status = 'Aktif');

    -- 7. Tutup penugasan ke Pos Pelkes di tempat lama (jika ada)
    UPDATE public.t_penugasan_pendeta 
    SET 
        tgl_selesai = CURRENT_DATE,
        status_tugas = 'Selesai',
        updated_at = NOW()
    WHERE id_pendeta = p_id_pendeta AND (tgl_selesai IS NULL OR status_tugas = 'Aktif');

    -- 8. UNIFIED IDENTITY SYNC: Update tabel users jika pendeta memiliki akun aktif
    SELECT id INTO v_user_id 
    FROM public.users 
    WHERE id_pendeta = p_id_pendeta;

    IF v_user_id IS NOT NULL THEN
        UPDATE public.users 
        SET 
            id_induk = p_id_induk_baru,
            id_mupel = v_id_mupel_baru,
            role = 'user',
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    -- 9. Catat riwayat mutasi lengkap dengan lampiran SK
    INSERT INTO public.t_riwayat_mutasi_pendeta (
        id_riwayat,
        id_pendeta,
        id_induk_lama,
        id_induk_baru,
        tgl_mutasi,
        jenis_mutasi,
        alasan,
        file_sk
    ) VALUES (
        'MUT-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-' || floor(random() * 1000)::TEXT,
        p_id_pendeta,
        v_id_induk_lama,
        p_id_induk_baru,
        CURRENT_DATE,
        p_jenis_mutasi,
        p_alasan,
        p_file_sk
    );

    -- 10. Audit Log dengan nama aktor pengguna Auth aktif
    SELECT COALESCE(no_telepon, email, 'Admin System') INTO v_aktor_name
    FROM public.users 
    WHERE id = auth.uid();

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 't_log_aktivitas') THEN
        INSERT INTO public.t_log_aktivitas (
            id_log,
            waktu,
            aktor,
            aksi,
            objek_type,
            objek_id,
            keterangan
        ) VALUES (
            'LOG-' || floor(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT || '-' || floor(random() * 1000)::TEXT,
            NOW(),
            COALESCE(v_aktor_name, 'System'),
            'MUTASI_PENDETA',
            'pendeta',
            p_id_pendeta,
            'Mutasi dari ' || COALESCE(v_id_induk_lama, '-') || ' ke ' || p_id_induk_baru || ' (' || p_jenis_mutasi || ')'
        );
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.mutasi_pendeta TO authenticated;
GRANT EXECUTE ON FUNCTION public.mutasi_pendeta TO service_role;
