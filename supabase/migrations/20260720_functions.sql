-- Migration: 20260720_functions.sql
-- Description: Additional DB functions for SI GPIB v2.2

BEGIN;

-- 1. Set KMJ (atomic)
CREATE OR REPLACE FUNCTION set_kmj(p_id_induk VARCHAR, p_id_pendeta VARCHAR) RETURNS VOID AS $$
BEGIN
    -- Remove pendeta from current KMJ role if any
    UPDATE m_pendeta SET is_kmj = FALSE WHERE is_kmj = TRUE AND id_pendeta = p_id_pendeta;
    
    -- Assign new KMJ to Jemaat
    UPDATE m_jemaat_induk SET id_kmj = p_id_pendeta, updated_at = NOW() WHERE id_induk = p_id_induk;
    
    -- Update Pendeta status
    UPDATE m_pendeta SET id_induk = p_id_induk, is_kmj = TRUE, updated_at = NOW() WHERE id_pendeta = p_id_pendeta;
    
    -- Add to Riwayat Mutasi
    INSERT INTO t_riwayat_mutasi_pendeta(id_riwayat, id_pendeta, id_induk_baru, tgl_mutasi, jenis_mutasi, alasan)
    VALUES (gen_random_uuid()::text, p_id_pendeta, p_id_induk, CURRENT_DATE, 'PENGANGKATAN_KMJ', 'Penetapan KMJ baru');
END;
$$ LANGUAGE plpgsql;

-- 2. Assign PJ (atomic)
CREATE OR REPLACE FUNCTION assign_pj(p_id_induk VARCHAR, p_id_pendeta VARCHAR) RETURNS VOID AS $$
BEGIN
    -- Insert new assignment
    INSERT INTO t_pj_jemaat (id_induk, id_pendeta, tanggal_mulai, status)
    VALUES (p_id_induk, p_id_pendeta, CURRENT_DATE, 'Aktif');
    
    -- Update Pendeta status
    UPDATE m_pendeta SET id_induk = p_id_induk, is_pj = TRUE, updated_at = NOW() WHERE id_pendeta = p_id_pendeta;
    
    -- Add to Riwayat Mutasi
    INSERT INTO t_riwayat_mutasi_pendeta(id_riwayat, id_pendeta, id_induk_baru, tgl_mutasi, jenis_mutasi, alasan)
    VALUES (gen_random_uuid()::text, p_id_pendeta, p_id_induk, CURRENT_DATE, 'PENGANGKATAN_PJ', 'Penetapan PJ baru');
END;
$$ LANGUAGE plpgsql;

-- 3. Submit Bantuan (start workflow)
CREATE OR REPLACE FUNCTION submit_bantuan(p_id_ajuan VARCHAR) RETURNS VOID AS $$
BEGIN
    -- Update status
    UPDATE t_pengajuan_bantuan 
    SET status = 'Pending_KMJ', updated_at = NOW() 
    WHERE id_ajuan = p_id_ajuan AND status = 'Draft';
    
    -- Audit trail
    INSERT INTO t_log_aktivitas (id_log, id_user, aktor, aksi, objek_type, objek_id, keterangan)
    VALUES (
        'LOG-' || (extract(epoch from now()) * 1000)::bigint::text || '-' || floor(random() * 1000)::text,
        auth.uid(),
        'User',
        'SUBMIT',
        'bantuan',
        p_id_ajuan,
        'Mengajukan permohonan bantuan'
    );
END;
$$ LANGUAGE plpgsql;

COMMIT;
