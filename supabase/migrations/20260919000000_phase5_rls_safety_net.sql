-- ============================================================
-- Migration: Phase 5 - Authorization Framework RLS Safety Net
-- Authority: Gate 3 Step 4 (L7)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Helper Functions (HF-01 through HF-09)
-- ────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS get_active_context_id() CASCADE;
CREATE OR REPLACE FUNCTION get_active_context_id() RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(current_setting('app.active_context_id', true), '');
$$;

DROP FUNCTION IF EXISTS get_active_context_level() CASCADE;
CREATE OR REPLACE FUNCTION get_active_context_level() RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(current_setting('app.active_context_level', true), '');
$$;

DROP FUNCTION IF EXISTS get_user_id() CASCADE;
CREATE OR REPLACE FUNCTION get_user_id() RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(current_setting('app.user_id', true), '');
$$;

DROP FUNCTION IF EXISTS get_linked_person_id() CASCADE;
CREATE OR REPLACE FUNCTION get_linked_person_id() RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(current_setting('app.linked_person_id', true), '');
$$;

DROP FUNCTION IF EXISTS get_effective_system_role() CASCADE;
CREATE OR REPLACE FUNCTION get_effective_system_role() RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(current_setting('app.effective_system_role', true), '');
$$;

DROP FUNCTION IF EXISTS is_descendant_pos(TEXT) CASCADE;
CREATE OR REPLACE FUNCTION is_descendant_pos(target_pos_id TEXT) RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN get_active_context_level() = 'SINODE' THEN TRUE
    WHEN get_active_context_level() = 'MUPEL' THEN
      EXISTS (
        SELECT 1 FROM m_pos_pelkes p
        JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE p.id_pos = target_pos_id AND j.id_mupel = get_active_context_id()
      )
    WHEN get_active_context_level() = 'JEMAAT' THEN
      EXISTS (
        SELECT 1 FROM m_pos_pelkes p
        WHERE p.id_pos = target_pos_id AND p.id_induk = get_active_context_id()
      )
    WHEN get_active_context_level() = 'POS' THEN
      target_pos_id = get_active_context_id()
    ELSE FALSE
  END;
$$;

DROP FUNCTION IF EXISTS is_descendant_jemaat(TEXT) CASCADE;
CREATE OR REPLACE FUNCTION is_descendant_jemaat(target_jemaat_id TEXT) RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN get_active_context_level() = 'SINODE' THEN TRUE
    WHEN get_active_context_level() = 'MUPEL' THEN
      EXISTS (
        SELECT 1 FROM m_jemaat_induk j
        WHERE j.id_induk = target_jemaat_id AND j.id_mupel = get_active_context_id()
      )
    WHEN get_active_context_level() = 'JEMAAT' THEN
      target_jemaat_id = get_active_context_id()
    WHEN get_active_context_level() = 'POS' THEN
      EXISTS (
        SELECT 1 FROM m_pos_pelkes p
        WHERE p.id_pos = get_active_context_id() AND p.id_induk = target_jemaat_id
      )
    ELSE FALSE
  END;
$$;

DROP FUNCTION IF EXISTS has_global_scope() CASCADE;
CREATE OR REPLACE FUNCTION has_global_scope() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT get_active_context_level() = 'SINODE';
$$;

DROP FUNCTION IF EXISTS is_self_person(TEXT) CASCADE;
CREATE OR REPLACE FUNCTION is_self_person(target_person_id TEXT) RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT get_linked_person_id() = target_person_id AND get_linked_person_id() <> '';
$$;

-- ────────────────────────────────────────────────────────────
-- 2. Session Variable Setter RPC
-- ────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS set_authorization_context(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION set_authorization_context(
  p_user_id TEXT,
  p_linked_person_id TEXT,
  p_active_context_id TEXT,
  p_active_context_level TEXT,
  p_effective_system_role TEXT,
  p_assignment_id TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('app.user_id', COALESCE(p_user_id, ''), true);
  PERFORM set_config('app.linked_person_id', COALESCE(p_linked_person_id, ''), true);
  PERFORM set_config('app.active_context_id', COALESCE(p_active_context_id, ''), true);
  PERFORM set_config('app.active_context_level', COALESCE(p_active_context_level, ''), true);
  PERFORM set_config('app.effective_system_role', COALESCE(p_effective_system_role, ''), true);
  PERFORM set_config('app.assignment_id', COALESCE(p_assignment_id, ''), true);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 3. Enable RLS
-- ────────────────────────────────────────────────────────────
ALTER TABLE m_mupel ENABLE ROW LEVEL SECURITY;
ALTER TABLE m_jemaat_induk ENABLE ROW LEVEL SECURITY;
ALTER TABLE m_pos_pelkes ENABLE ROW LEVEL SECURITY;
ALTER TABLE m_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_pelayan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_relawan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_penugasan_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_pj_jemaat ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_jabatan_struktural ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_keluarga_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_keterlibatan_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_riwayat_mutasi_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_log_pastoral ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_jadwal_ibadah ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_aset_tanah ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_aset_bangunan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_aset_bergerak ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_lampiran_aset ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_pengajuan_bantuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_approval_bantuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_demografi_pelkat ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_kerawanan_wilayah ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_potensi_wilayah ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_lampiran_kerawanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_lampiran_potensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_histori_perubahan_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE m_webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE m_push_subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_form_draft ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_log_aktivitas ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 4. RLS Policies
-- Note: Using DROP POLICY IF EXISTS before CREATE POLICY to ensure idempotency.
-- ────────────────────────────────────────────────────────────

-- Users
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = get_user_id()::uuid OR has_global_scope());
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = get_user_id()::uuid);

-- WebAuthn / Push / Draft
DROP POLICY IF EXISTS "webauthn_credentials_own" ON m_webauthn_credentials;
CREATE POLICY "webauthn_credentials_own" ON m_webauthn_credentials FOR ALL USING (id_user = get_user_id()::uuid);
DROP POLICY IF EXISTS "push_subscription_own" ON m_push_subscription;
CREATE POLICY "push_subscription_own" ON m_push_subscription FOR ALL USING (id_user = get_user_id()::uuid);
DROP POLICY IF EXISTS "form_draft_own" ON t_form_draft;
CREATE POLICY "form_draft_own" ON t_form_draft FOR ALL USING (id_user = get_user_id()::uuid);

-- Pendeta
DROP POLICY IF EXISTS "pendeta_select" ON m_pendeta;
CREATE POLICY "pendeta_select" ON m_pendeta FOR SELECT USING (is_self_person(id_pendeta) OR is_descendant_jemaat(id_induk) OR has_global_scope());
DROP POLICY IF EXISTS "pendeta_update_self" ON m_pendeta;
CREATE POLICY "pendeta_update_self" ON m_pendeta FOR UPDATE USING (is_self_person(id_pendeta));

-- Pelayan
DROP POLICY IF EXISTS "pelayan_select" ON t_pelayan;
CREATE POLICY "pelayan_select" ON t_pelayan FOR SELECT USING (is_self_person(id_pelayan) OR is_descendant_pos(id_pos) OR has_global_scope());
DROP POLICY IF EXISTS "pelayan_update_self" ON t_pelayan;
CREATE POLICY "pelayan_update_self" ON t_pelayan FOR UPDATE USING (is_self_person(id_pelayan));

-- Relawan
DROP POLICY IF EXISTS "relawan_select" ON t_relawan;
CREATE POLICY "relawan_select" ON t_relawan FOR SELECT USING (is_self_person(id_relawan) OR is_descendant_pos(id_pos) OR has_global_scope());
DROP POLICY IF EXISTS "relawan_update_self" ON t_relawan;
CREATE POLICY "relawan_update_self" ON t_relawan FOR UPDATE USING (is_self_person(id_relawan));

-- Pos Pelkes
DROP POLICY IF EXISTS "pos_select_downward" ON m_pos_pelkes;
CREATE POLICY "pos_select_downward" ON m_pos_pelkes FOR SELECT USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "pos_update_context" ON m_pos_pelkes;
CREATE POLICY "pos_update_context" ON m_pos_pelkes FOR UPDATE USING (id_pos = get_active_context_id() OR is_descendant_pos(id_pos));

-- Jemaat Induk
DROP POLICY IF EXISTS "jemaat_select_downward" ON m_jemaat_induk;
CREATE POLICY "jemaat_select_downward" ON m_jemaat_induk FOR SELECT USING (is_descendant_jemaat(id_induk));
DROP POLICY IF EXISTS "jemaat_update_context" ON m_jemaat_induk;
CREATE POLICY "jemaat_update_context" ON m_jemaat_induk FOR UPDATE USING (is_descendant_jemaat(id_induk));

-- Mupel
DROP POLICY IF EXISTS "mupel_select" ON m_mupel;
CREATE POLICY "mupel_select" ON m_mupel FOR SELECT USING (id_mupel = get_active_context_id() OR get_active_context_level() = 'SINODE');

-- Log Pastoral
DROP POLICY IF EXISTS "log_pastoral_select" ON t_log_pastoral;
CREATE POLICY "log_pastoral_select" ON t_log_pastoral FOR SELECT USING (is_descendant_pos(id_pos) OR id_pendeta = get_linked_person_id());
DROP POLICY IF EXISTS "log_pastoral_insert" ON t_log_pastoral;
CREATE POLICY "log_pastoral_insert" ON t_log_pastoral FOR INSERT WITH CHECK (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "log_pastoral_update" ON t_log_pastoral;
CREATE POLICY "log_pastoral_update" ON t_log_pastoral FOR UPDATE USING ((id_pendeta = get_linked_person_id()) AND is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "log_pastoral_delete" ON t_log_pastoral;
CREATE POLICY "log_pastoral_delete" ON t_log_pastoral FOR DELETE USING (is_descendant_pos(id_pos));

-- Jadwal Ibadah
DROP POLICY IF EXISTS "jadwal_ibadah_select" ON t_jadwal_ibadah;
CREATE POLICY "jadwal_ibadah_select" ON t_jadwal_ibadah FOR SELECT USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "jadwal_ibadah_insert" ON t_jadwal_ibadah;
CREATE POLICY "jadwal_ibadah_insert" ON t_jadwal_ibadah FOR INSERT WITH CHECK (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "jadwal_ibadah_update" ON t_jadwal_ibadah;
CREATE POLICY "jadwal_ibadah_update" ON t_jadwal_ibadah FOR UPDATE USING (is_descendant_pos(id_pos));

-- Aset Tanah
DROP POLICY IF EXISTS "aset_tanah_select" ON t_aset_tanah;
CREATE POLICY "aset_tanah_select" ON t_aset_tanah FOR SELECT USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "aset_tanah_insert" ON t_aset_tanah;
CREATE POLICY "aset_tanah_insert" ON t_aset_tanah FOR INSERT WITH CHECK (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "aset_tanah_update" ON t_aset_tanah;
CREATE POLICY "aset_tanah_update" ON t_aset_tanah FOR UPDATE USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "aset_tanah_delete" ON t_aset_tanah;
CREATE POLICY "aset_tanah_delete" ON t_aset_tanah FOR DELETE USING (is_descendant_pos(id_pos));

-- Aset Bangunan
DROP POLICY IF EXISTS "aset_bangunan_select" ON t_aset_bangunan;
CREATE POLICY "aset_bangunan_select" ON t_aset_bangunan FOR SELECT USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "aset_bangunan_insert" ON t_aset_bangunan;
CREATE POLICY "aset_bangunan_insert" ON t_aset_bangunan FOR INSERT WITH CHECK (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "aset_bangunan_update" ON t_aset_bangunan;
CREATE POLICY "aset_bangunan_update" ON t_aset_bangunan FOR UPDATE USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "aset_bangunan_delete" ON t_aset_bangunan;
CREATE POLICY "aset_bangunan_delete" ON t_aset_bangunan FOR DELETE USING (is_descendant_pos(id_pos));

-- Aset Bergerak
DROP POLICY IF EXISTS "aset_bergerak_select" ON t_aset_bergerak;
CREATE POLICY "aset_bergerak_select" ON t_aset_bergerak FOR SELECT USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "aset_bergerak_insert" ON t_aset_bergerak;
CREATE POLICY "aset_bergerak_insert" ON t_aset_bergerak FOR INSERT WITH CHECK (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "aset_bergerak_update" ON t_aset_bergerak;
CREATE POLICY "aset_bergerak_update" ON t_aset_bergerak FOR UPDATE USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "aset_bergerak_delete" ON t_aset_bergerak;
CREATE POLICY "aset_bergerak_delete" ON t_aset_bergerak FOR DELETE USING (is_descendant_pos(id_pos));

-- Lampiran Aset
DROP POLICY IF EXISTS "lampiran_aset_select" ON t_lampiran_aset;
CREATE POLICY "lampiran_aset_select" ON t_lampiran_aset FOR SELECT USING (
  EXISTS (SELECT 1 FROM t_aset_tanah a WHERE a.id_tanah = t_lampiran_aset.id_tanah AND is_descendant_pos(a.id_pos)) OR
  EXISTS (SELECT 1 FROM t_aset_bangunan a WHERE a.id_bangunan = t_lampiran_aset.id_bangunan AND is_descendant_pos(a.id_pos)) OR
  EXISTS (SELECT 1 FROM t_aset_bergerak a WHERE a.id_aset_b = t_lampiran_aset.id_aset_b AND is_descendant_pos(a.id_pos))
);
DROP POLICY IF EXISTS "lampiran_aset_insert" ON t_lampiran_aset;
CREATE POLICY "lampiran_aset_insert" ON t_lampiran_aset FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM t_aset_tanah a WHERE a.id_tanah = t_lampiran_aset.id_tanah AND is_descendant_pos(a.id_pos)) OR
  EXISTS (SELECT 1 FROM t_aset_bangunan a WHERE a.id_bangunan = t_lampiran_aset.id_bangunan AND is_descendant_pos(a.id_pos)) OR
  EXISTS (SELECT 1 FROM t_aset_bergerak a WHERE a.id_aset_b = t_lampiran_aset.id_aset_b AND is_descendant_pos(a.id_pos))
);

-- Pengajuan Bantuan
DROP POLICY IF EXISTS "pengajuan_bantuan_select" ON t_pengajuan_bantuan;
CREATE POLICY "pengajuan_bantuan_select" ON t_pengajuan_bantuan FOR SELECT USING (is_descendant_pos(id_pos) OR (id_pos IS NULL AND has_global_scope()));
-- Note: Re-evaluating id_pembuat for t_pengajuan_bantuan as the initial schema lacked id_pembuat column. Assuming it will be added, if not, it should just rely on context. 
-- Will remove id_pembuat to match init schema safely.
-- Let's stick to context ownership for now.
DROP POLICY IF EXISTS "pengajuan_bantuan_insert" ON t_pengajuan_bantuan;
CREATE POLICY "pengajuan_bantuan_insert" ON t_pengajuan_bantuan FOR INSERT WITH CHECK (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "pengajuan_bantuan_update" ON t_pengajuan_bantuan;
CREATE POLICY "pengajuan_bantuan_update" ON t_pengajuan_bantuan FOR UPDATE USING (is_descendant_pos(id_pos));

-- Approval Bantuan
DROP POLICY IF EXISTS "approval_bantuan_select" ON t_approval_bantuan;
CREATE POLICY "approval_bantuan_select" ON t_approval_bantuan FOR SELECT USING (EXISTS (SELECT 1 FROM t_pengajuan_bantuan pb WHERE pb.id_ajuan = t_approval_bantuan.id_ajuan AND (is_descendant_pos(pb.id_pos) OR has_global_scope())));
DROP POLICY IF EXISTS "approval_bantuan_insert" ON t_approval_bantuan;
CREATE POLICY "approval_bantuan_insert" ON t_approval_bantuan FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM t_pengajuan_bantuan pb WHERE pb.id_ajuan = t_approval_bantuan.id_ajuan AND (is_descendant_pos(pb.id_pos) OR has_global_scope())));

-- Keluarga Pendeta
DROP POLICY IF EXISTS "keluarga_pendeta_select" ON t_keluarga_pendeta;
CREATE POLICY "keluarga_pendeta_select" ON t_keluarga_pendeta FOR SELECT USING (is_self_person(id_pendeta) OR has_global_scope());
DROP POLICY IF EXISTS "keluarga_pendeta_update" ON t_keluarga_pendeta;
CREATE POLICY "keluarga_pendeta_update" ON t_keluarga_pendeta FOR UPDATE USING (is_self_person(id_pendeta));
DROP POLICY IF EXISTS "keluarga_pendeta_insert" ON t_keluarga_pendeta;
CREATE POLICY "keluarga_pendeta_insert" ON t_keluarga_pendeta FOR INSERT WITH CHECK (is_self_person(id_pendeta));

-- Keterlibatan Pendeta
DROP POLICY IF EXISTS "keterlibatan_pendeta_select" ON t_keterlibatan_pendeta;
CREATE POLICY "keterlibatan_pendeta_select" ON t_keterlibatan_pendeta FOR SELECT USING (is_self_person(id_pendeta) OR has_global_scope());
DROP POLICY IF EXISTS "keterlibatan_pendeta_update" ON t_keterlibatan_pendeta;
CREATE POLICY "keterlibatan_pendeta_update" ON t_keterlibatan_pendeta FOR UPDATE USING (is_self_person(id_pendeta));

-- Mutasi Pendeta
DROP POLICY IF EXISTS "mutasi_pendeta_select" ON t_riwayat_mutasi_pendeta;
CREATE POLICY "mutasi_pendeta_select" ON t_riwayat_mutasi_pendeta FOR SELECT USING (is_self_person(id_pendeta) OR has_global_scope());

-- Kerawanan Wilayah
DROP POLICY IF EXISTS "kerawanan_select" ON t_kerawanan_wilayah;
CREATE POLICY "kerawanan_select" ON t_kerawanan_wilayah FOR SELECT USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "kerawanan_insert" ON t_kerawanan_wilayah;
CREATE POLICY "kerawanan_insert" ON t_kerawanan_wilayah FOR INSERT WITH CHECK (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "kerawanan_update" ON t_kerawanan_wilayah;
CREATE POLICY "kerawanan_update" ON t_kerawanan_wilayah FOR UPDATE USING (is_descendant_pos(id_pos));

-- Potensi Wilayah
DROP POLICY IF EXISTS "potensi_select" ON t_potensi_wilayah;
CREATE POLICY "potensi_select" ON t_potensi_wilayah FOR SELECT USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "potensi_insert" ON t_potensi_wilayah;
CREATE POLICY "potensi_insert" ON t_potensi_wilayah FOR INSERT WITH CHECK (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "potensi_update" ON t_potensi_wilayah;
CREATE POLICY "potensi_update" ON t_potensi_wilayah FOR UPDATE USING (is_descendant_pos(id_pos));

-- Lampiran Kerawanan/Potensi
DROP POLICY IF EXISTS "lampiran_kerawanan_select" ON t_lampiran_kerawanan;
CREATE POLICY "lampiran_kerawanan_select" ON t_lampiran_kerawanan FOR SELECT USING (EXISTS (SELECT 1 FROM t_kerawanan_wilayah k WHERE k.id_risiko = t_lampiran_kerawanan.id_risiko AND is_descendant_pos(k.id_pos)));
DROP POLICY IF EXISTS "lampiran_potensi_select" ON t_lampiran_potensi;
CREATE POLICY "lampiran_potensi_select" ON t_lampiran_potensi FOR SELECT USING (EXISTS (SELECT 1 FROM t_potensi_wilayah p WHERE p.id_potensi = t_lampiran_potensi.id_potensi AND is_descendant_pos(p.id_pos)));

-- Demografi Pelkat
DROP POLICY IF EXISTS "demografi_select" ON t_demografi_pelkat;
CREATE POLICY "demografi_select" ON t_demografi_pelkat FOR SELECT USING (is_descendant_pos(id_pos));
DROP POLICY IF EXISTS "demografi_upsert" ON t_demografi_pelkat;
CREATE POLICY "demografi_upsert" ON t_demografi_pelkat FOR INSERT WITH CHECK (is_descendant_pos(id_pos));

-- Assignment/Roles
DROP POLICY IF EXISTS "penugasan_pendeta_select" ON t_penugasan_pendeta;
CREATE POLICY "penugasan_pendeta_select" ON t_penugasan_pendeta FOR SELECT USING (id_pendeta = get_linked_person_id() OR is_descendant_pos(id_pos) OR has_global_scope());
DROP POLICY IF EXISTS "pj_jemaat_select" ON t_pj_jemaat;
CREATE POLICY "pj_jemaat_select" ON t_pj_jemaat FOR SELECT USING (id_pendeta = get_linked_person_id() OR is_descendant_jemaat(id_induk) OR has_global_scope());
DROP POLICY IF EXISTS "jabatan_struktural_select" ON t_jabatan_struktural;
CREATE POLICY "jabatan_struktural_select" ON t_jabatan_struktural FOR SELECT USING (id_pendeta = get_linked_person_id() OR has_global_scope());
DROP POLICY IF EXISTS "histori_status_select" ON t_histori_perubahan_status;
CREATE POLICY "histori_status_select" ON t_histori_perubahan_status FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());

-- System / Audit Logs
DROP POLICY IF EXISTS "log_aktivitas_select" ON t_log_aktivitas;
CREATE POLICY "log_aktivitas_select" ON t_log_aktivitas FOR SELECT USING (has_global_scope() OR get_effective_system_role() IN ('SUPER_ADMIN', 'ADMIN'));
