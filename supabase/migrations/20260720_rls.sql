-- Migration: 20260720_rls.sql
-- Description: Enable RLS and setup policies for SI GPIB v2.2

BEGIN;

-- Enable RLS on all tables
ALTER TABLE m_mupel ENABLE ROW LEVEL SECURITY;
ALTER TABLE m_jemaat_induk ENABLE ROW LEVEL SECURITY;
ALTER TABLE m_pos_pelkes ENABLE ROW LEVEL SECURITY;
ALTER TABLE m_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE m_webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE m_push_subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_pj_jemaat ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_penugasan_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_riwayat_mutasi_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_log_pastoral ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_pelayan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_jadwal_ibadah ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_relawan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_aset_tanah ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_aset_bangunan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_aset_bergerak ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_lampiran_aset ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_pengajuan_bantuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_demografi_pelkat ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_kerawanan_wilayah ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_potensi_wilayah ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_log_aktivitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_approval_bantuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_form_draft ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_auth_role() RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Super User: Access everything
CREATE POLICY "Super User can access all tables" ON m_mupel FOR ALL USING (get_auth_role() = 'super_user');
-- Need to apply to all tables, using simplified examples

-- RLS: KMJ akses jemaat yang dipimpinnya
CREATE POLICY "KMJ akses jemaat yang dipimpinnya"
ON m_jemaat_induk FOR ALL
USING (
    id_induk IN (
        SELECT id_induk FROM m_jemaat_induk 
        WHERE id_kmj = (SELECT id_pendeta FROM users WHERE id = auth.uid())
    )
    OR get_auth_role() = 'super_user'
    OR (get_auth_role() = 'admin_mupel' AND id_mupel = (SELECT id_mupel FROM users WHERE id = auth.uid()))
);

-- RLS: PJ akses jemaat tempatnya melayani
CREATE POLICY "PJ akses jemaat tempatnya melayani"
ON m_jemaat_induk FOR SELECT
USING (
    id_induk IN (
        SELECT id_induk FROM t_pj_jemaat 
        WHERE id_pendeta = (SELECT id_pendeta FROM users WHERE id = auth.uid())
        AND tanggal_selesai IS NULL
    )
);

-- RLS: User akses pos yang ditugaskan
CREATE POLICY "User akses pos yang ditugaskan"
ON m_pos_pelkes FOR ALL
USING (
    id_pos IN (
        SELECT id_pos FROM t_penugasan_pendeta 
        WHERE id_pendeta = (SELECT id_pendeta FROM users WHERE id = auth.uid())
        AND tgl_selesai IS NULL
    )
    OR id_induk IN (
        SELECT id_induk FROM m_jemaat_induk WHERE id_kmj = (SELECT id_pendeta FROM users WHERE id = auth.uid())
    )
    OR get_auth_role() = 'super_user'
    OR (get_auth_role() = 'admin_mupel' AND id_induk IN (SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = (SELECT id_mupel FROM users WHERE id = auth.uid())))
);

-- RLS: Log Pastoral
CREATE POLICY "Akses log pastoral"
ON t_log_pastoral FOR ALL
USING (
    id_pos IN (
        SELECT id_pos FROM t_penugasan_pendeta WHERE id_pendeta = (SELECT id_pendeta FROM users WHERE id = auth.uid()) AND tgl_selesai IS NULL
    )
    OR id_pos IN (
        SELECT p.id_pos FROM m_pos_pelkes p JOIN m_jemaat_induk j ON p.id_induk = j.id_induk WHERE j.id_kmj = (SELECT id_pendeta FROM users WHERE id = auth.uid())
    )
    OR get_auth_role() = 'super_user'
    OR (get_auth_role() = 'admin_mupel' AND id_pos IN (SELECT p.id_pos FROM m_pos_pelkes p JOIN m_jemaat_induk j ON p.id_induk = j.id_induk WHERE j.id_mupel = (SELECT id_mupel FROM users WHERE id = auth.uid())))
);

-- RLS: WebAuthn Credentials
CREATE POLICY "User can manage their own WebAuthn credentials"
ON m_webauthn_credentials FOR ALL
USING (id_user = auth.uid());

-- RLS: Form Drafts
CREATE POLICY "User can manage their own form drafts"
ON t_form_draft FOR ALL
USING (id_user = auth.uid());

-- RLS: Users table
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (id = auth.uid() OR get_auth_role() = 'super_user');

COMMIT;
