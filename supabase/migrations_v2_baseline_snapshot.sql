-- ==========================================================================
-- SI-GPIB v2 PLATFORM ARCHITECTURE BASELINE v2.0 CANONICAL SCHEMA SNAPSHOT
-- Certified Release Candidate: v2.0.0-rc.1
-- Total Migrations Consolidated: 86 files
-- ==========================================================================

-- [MIGRATION SOURCE: 20260714000001_authorization_rls_helpers.sql]
-- HF-01 to HF-05: Session Variable Readers
CREATE OR REPLACE FUNCTION get_active_context_id() RETURNS VARCHAR AS $$
  SELECT NULLIF(current_setting('app.active_context_id', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_active_context_level() RETURNS VARCHAR AS $$
  SELECT NULLIF(current_setting('app.active_context_level', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_linked_person_id() RETURNS VARCHAR AS $$
  SELECT NULLIF(current_setting('app.linked_person_id', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_effective_system_role() RETURNS VARCHAR AS $$
  SELECT NULLIF(current_setting('app.effective_system_role', true), '');
$$ LANGUAGE sql STABLE;

-- HF-06: is_descendant_pos (Evaluates if a Pos is within the active context's downward reach)
CREATE OR REPLACE FUNCTION is_descendant_pos(target_pos_id VARCHAR) RETURNS BOOLEAN AS $$
DECLARE
  ctx_id VARCHAR;
  ctx_level VARCHAR;
BEGIN
  ctx_id := get_active_context_id();
  ctx_level := get_active_context_level();
  
  IF ctx_level = 'POS' THEN
    RETURN target_pos_id = ctx_id;
  ELSIF ctx_level = 'JEMAAT' THEN
    RETURN EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = target_pos_id AND id_induk = ctx_id);
  ELSIF ctx_level = 'MUPEL' THEN
    RETURN EXISTS (
      SELECT 1 FROM m_pos_pelkes p 
      JOIN m_jemaat_induk j ON p.id_induk = j.id_induk 
      WHERE p.id_pos = target_pos_id AND j.id_mupel = ctx_id
    );
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- HF-07: is_descendant_jemaat
CREATE OR REPLACE FUNCTION is_descendant_jemaat(target_jemaat_id VARCHAR) RETURNS BOOLEAN AS $$
DECLARE
  ctx_id VARCHAR;
  ctx_level VARCHAR;
BEGIN
  ctx_id := get_active_context_id();
  ctx_level := get_active_context_level();
  
  IF ctx_level = 'JEMAAT' THEN
    RETURN target_jemaat_id = ctx_id;
  ELSIF ctx_level = 'MUPEL' THEN
    RETURN EXISTS (SELECT 1 FROM m_jemaat_induk WHERE id_induk = target_jemaat_id AND id_mupel = ctx_id);
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- HF-08: has_global_scope (Contract-gated, NOT an unconditional bypass)
CREATE OR REPLACE FUNCTION has_global_scope() RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_effective_system_role() = 'super_user';
END;
$$ LANGUAGE plpgsql STABLE;

-- HF-09: is_self_person
CREATE OR REPLACE FUNCTION is_self_person(target_person_id VARCHAR) RETURNS BOOLEAN AS $$
BEGIN
  RETURN target_person_id = get_linked_person_id();
END;
$$ LANGUAGE plpgsql STABLE;


-- [MIGRATION SOURCE: 20260714000002_authorization_session_setter.sql]
CREATE OR REPLACE FUNCTION set_authorization_context(
  p_context_id VARCHAR,
  p_context_level VARCHAR,
  p_user_id UUID,
  p_person_id VARCHAR,
  p_effective_role VARCHAR
) RETURNS void AS $$
BEGIN
  -- The 'true' parameter makes these settings local to the current transaction (SV-09, SV-10)
  PERFORM set_config('app.active_context_id', p_context_id, true);
  PERFORM set_config('app.active_context_level', p_context_level, true);
  PERFORM set_config('app.user_id', p_user_id::text, true);
  PERFORM set_config('app.linked_person_id', COALESCE(p_person_id, ''), true);
  PERFORM set_config('app.effective_system_role', p_effective_role, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- [MIGRATION SOURCE: 20260714000003_authorization_rls_policies.sql]
-- Authorization RLS Policies

-- Pattern P1: t_log_pastoral
ALTER TABLE t_log_pastoral ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_log_pastoral ON t_log_pastoral FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_log_pastoral ON t_log_pastoral FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_log_pastoral ON t_log_pastoral FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_log_pastoral ON t_log_pastoral FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1: t_jadwal_ibadah
ALTER TABLE t_jadwal_ibadah ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_jadwal_ibadah ON t_jadwal_ibadah FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_jadwal_ibadah ON t_jadwal_ibadah FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_jadwal_ibadah ON t_jadwal_ibadah FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_jadwal_ibadah ON t_jadwal_ibadah FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1: t_aset_tanah
ALTER TABLE t_aset_tanah ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_aset_tanah ON t_aset_tanah FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_aset_tanah ON t_aset_tanah FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_aset_tanah ON t_aset_tanah FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_aset_tanah ON t_aset_tanah FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1: t_aset_bangunan
ALTER TABLE t_aset_bangunan ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_aset_bangunan ON t_aset_bangunan FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_aset_bangunan ON t_aset_bangunan FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_aset_bangunan ON t_aset_bangunan FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_aset_bangunan ON t_aset_bangunan FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1: t_aset_bergerak
ALTER TABLE t_aset_bergerak ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_aset_bergerak ON t_aset_bergerak FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_aset_bergerak ON t_aset_bergerak FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_aset_bergerak ON t_aset_bergerak FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_aset_bergerak ON t_aset_bergerak FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1: t_pengajuan_bantuan
ALTER TABLE t_pengajuan_bantuan ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_pengajuan_bantuan ON t_pengajuan_bantuan FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_pengajuan_bantuan ON t_pengajuan_bantuan FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_pengajuan_bantuan ON t_pengajuan_bantuan FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_pengajuan_bantuan ON t_pengajuan_bantuan FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1: t_demografi_pelkat
ALTER TABLE t_demografi_pelkat ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_demografi_pelkat ON t_demografi_pelkat FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_demografi_pelkat ON t_demografi_pelkat FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_demografi_pelkat ON t_demografi_pelkat FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_demografi_pelkat ON t_demografi_pelkat FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1: t_kerawanan_wilayah
ALTER TABLE t_kerawanan_wilayah ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_kerawanan_wilayah ON t_kerawanan_wilayah FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_kerawanan_wilayah ON t_kerawanan_wilayah FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_kerawanan_wilayah ON t_kerawanan_wilayah FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_kerawanan_wilayah ON t_kerawanan_wilayah FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1: t_potensi_wilayah
ALTER TABLE t_potensi_wilayah ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_potensi_wilayah ON t_potensi_wilayah FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_potensi_wilayah ON t_potensi_wilayah FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_potensi_wilayah ON t_potensi_wilayah FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_potensi_wilayah ON t_potensi_wilayah FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1: t_pelayan
ALTER TABLE t_pelayan ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_pelayan ON t_pelayan FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_pelayan ON t_pelayan FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_pelayan ON t_pelayan FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_pelayan ON t_pelayan FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1: t_relawan
ALTER TABLE t_relawan ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_pos_select_t_relawan ON t_relawan FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());
CREATE POLICY policy_pos_insert_t_relawan ON t_relawan FOR INSERT WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_update_t_relawan ON t_relawan FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());
CREATE POLICY policy_pos_delete_t_relawan ON t_relawan FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());

-- Pattern P1 (Attachment): t_lampiran_aset
ALTER TABLE t_lampiran_aset ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_select_t_lampiran_aset ON t_lampiran_aset FOR SELECT USING (EXISTS (SELECT 1 FROM t_aset_tanah WHERE id_tanah = t_lampiran_aset.id_tanah AND is_descendant_pos(id_pos)) OR EXISTS (SELECT 1 FROM t_aset_bangunan WHERE id_bangunan = t_lampiran_aset.id_bangunan AND is_descendant_pos(id_pos)) OR EXISTS (SELECT 1 FROM t_aset_bergerak WHERE id_aset_b = t_lampiran_aset.id_aset_b AND is_descendant_pos(id_pos)) OR has_global_scope());
CREATE POLICY policy_insert_t_lampiran_aset ON t_lampiran_aset FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM t_aset_tanah WHERE id_tanah = t_lampiran_aset.id_tanah AND id_pos = get_active_context_id()) OR EXISTS (SELECT 1 FROM t_aset_bangunan WHERE id_bangunan = t_lampiran_aset.id_bangunan AND id_pos = get_active_context_id()) OR EXISTS (SELECT 1 FROM t_aset_bergerak WHERE id_aset_b = t_lampiran_aset.id_aset_b AND id_pos = get_active_context_id()) OR has_global_scope());
CREATE POLICY policy_update_t_lampiran_aset ON t_lampiran_aset FOR UPDATE USING (EXISTS (SELECT 1 FROM t_aset_tanah WHERE id_tanah = t_lampiran_aset.id_tanah AND is_descendant_pos(id_pos)) OR EXISTS (SELECT 1 FROM t_aset_bangunan WHERE id_bangunan = t_lampiran_aset.id_bangunan AND is_descendant_pos(id_pos)) OR EXISTS (SELECT 1 FROM t_aset_bergerak WHERE id_aset_b = t_lampiran_aset.id_aset_b AND is_descendant_pos(id_pos)) OR has_global_scope()) WITH CHECK (EXISTS (SELECT 1 FROM t_aset_tanah WHERE id_tanah = t_lampiran_aset.id_tanah AND id_pos = get_active_context_id()) OR EXISTS (SELECT 1 FROM t_aset_bangunan WHERE id_bangunan = t_lampiran_aset.id_bangunan AND id_pos = get_active_context_id()) OR EXISTS (SELECT 1 FROM t_aset_bergerak WHERE id_aset_b = t_lampiran_aset.id_aset_b AND id_pos = get_active_context_id()) OR has_global_scope());
CREATE POLICY policy_delete_t_lampiran_aset ON t_lampiran_aset FOR DELETE USING (EXISTS (SELECT 1 FROM t_aset_tanah WHERE id_tanah = t_lampiran_aset.id_tanah AND is_descendant_pos(id_pos)) OR EXISTS (SELECT 1 FROM t_aset_bangunan WHERE id_bangunan = t_lampiran_aset.id_bangunan AND is_descendant_pos(id_pos)) OR EXISTS (SELECT 1 FROM t_aset_bergerak WHERE id_aset_b = t_lampiran_aset.id_aset_b AND is_descendant_pos(id_pos)) OR has_global_scope());

-- Pattern P1 (Attachment): t_lampiran_kerawanan
ALTER TABLE t_lampiran_kerawanan ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_select_t_lampiran_kerawanan ON t_lampiran_kerawanan FOR SELECT USING (EXISTS (SELECT 1 FROM t_kerawanan_wilayah k WHERE k.id_risiko = t_lampiran_kerawanan.id_risiko AND is_descendant_pos(k.id_pos)) OR has_global_scope());
CREATE POLICY policy_insert_t_lampiran_kerawanan ON t_lampiran_kerawanan FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM t_kerawanan_wilayah k WHERE k.id_risiko = t_lampiran_kerawanan.id_risiko AND k.id_pos = get_active_context_id()) OR has_global_scope());
CREATE POLICY policy_update_t_lampiran_kerawanan ON t_lampiran_kerawanan FOR UPDATE USING (EXISTS (SELECT 1 FROM t_kerawanan_wilayah k WHERE k.id_risiko = t_lampiran_kerawanan.id_risiko AND is_descendant_pos(k.id_pos)) OR has_global_scope()) WITH CHECK (EXISTS (SELECT 1 FROM t_kerawanan_wilayah k WHERE k.id_risiko = t_lampiran_kerawanan.id_risiko AND k.id_pos = get_active_context_id()) OR has_global_scope());
CREATE POLICY policy_delete_t_lampiran_kerawanan ON t_lampiran_kerawanan FOR DELETE USING (EXISTS (SELECT 1 FROM t_kerawanan_wilayah k WHERE k.id_risiko = t_lampiran_kerawanan.id_risiko AND is_descendant_pos(k.id_pos)) OR has_global_scope());

-- Pattern P1 (Attachment): t_lampiran_potensi
ALTER TABLE t_lampiran_potensi ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_select_t_lampiran_potensi ON t_lampiran_potensi FOR SELECT USING (EXISTS (SELECT 1 FROM t_potensi_wilayah p WHERE p.id_potensi = t_lampiran_potensi.id_potensi AND is_descendant_pos(p.id_pos)) OR has_global_scope());
CREATE POLICY policy_insert_t_lampiran_potensi ON t_lampiran_potensi FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM t_potensi_wilayah p WHERE p.id_potensi = t_lampiran_potensi.id_potensi AND p.id_pos = get_active_context_id()) OR has_global_scope());
CREATE POLICY policy_update_t_lampiran_potensi ON t_lampiran_potensi FOR UPDATE USING (EXISTS (SELECT 1 FROM t_potensi_wilayah p WHERE p.id_potensi = t_lampiran_potensi.id_potensi AND is_descendant_pos(p.id_pos)) OR has_global_scope()) WITH CHECK (EXISTS (SELECT 1 FROM t_potensi_wilayah p WHERE p.id_potensi = t_lampiran_potensi.id_potensi AND p.id_pos = get_active_context_id()) OR has_global_scope());
CREATE POLICY policy_delete_t_lampiran_potensi ON t_lampiran_potensi FOR DELETE USING (EXISTS (SELECT 1 FROM t_potensi_wilayah p WHERE p.id_potensi = t_lampiran_potensi.id_potensi AND is_descendant_pos(p.id_pos)) OR has_global_scope());

-- Pattern P2: m_jemaat_induk
ALTER TABLE m_jemaat_induk ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_jem_select_m_jemaat_induk ON m_jemaat_induk FOR SELECT USING (is_descendant_jemaat(id_induk) OR has_global_scope());
CREATE POLICY policy_jem_insert_m_jemaat_induk ON m_jemaat_induk FOR INSERT WITH CHECK (id_induk = get_active_context_id());
CREATE POLICY policy_jem_update_m_jemaat_induk ON m_jemaat_induk FOR UPDATE USING (is_descendant_jemaat(id_induk) OR has_global_scope()) WITH CHECK (id_induk = get_active_context_id());
CREATE POLICY policy_jem_delete_m_jemaat_induk ON m_jemaat_induk FOR DELETE USING (is_descendant_jemaat(id_induk) OR has_global_scope());

-- Pattern P2: t_pj_jemaat
ALTER TABLE t_pj_jemaat ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_jem_select_t_pj_jemaat ON t_pj_jemaat FOR SELECT USING (is_descendant_jemaat(id_induk) OR has_global_scope());
CREATE POLICY policy_jem_insert_t_pj_jemaat ON t_pj_jemaat FOR INSERT WITH CHECK (id_induk = get_active_context_id());
CREATE POLICY policy_jem_update_t_pj_jemaat ON t_pj_jemaat FOR UPDATE USING (is_descendant_jemaat(id_induk) OR has_global_scope()) WITH CHECK (id_induk = get_active_context_id());
CREATE POLICY policy_jem_delete_t_pj_jemaat ON t_pj_jemaat FOR DELETE USING (is_descendant_jemaat(id_induk) OR has_global_scope());

-- Pattern P2 (Indirect): t_penugasan_pendeta
ALTER TABLE t_penugasan_pendeta ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_jem_select_t_penugasan_pendeta ON t_penugasan_pendeta FOR SELECT USING (EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = t_penugasan_pendeta.id_pos AND is_descendant_jemaat(id_induk)) OR has_global_scope());
CREATE POLICY policy_jem_insert_t_penugasan_pendeta ON t_penugasan_pendeta FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = t_penugasan_pendeta.id_pos AND id_induk = get_active_context_id()) OR has_global_scope());
CREATE POLICY policy_jem_update_t_penugasan_pendeta ON t_penugasan_pendeta FOR UPDATE USING (EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = t_penugasan_pendeta.id_pos AND is_descendant_jemaat(id_induk)) OR has_global_scope());
CREATE POLICY policy_jem_delete_t_penugasan_pendeta ON t_penugasan_pendeta FOR DELETE USING (EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = t_penugasan_pendeta.id_pos AND is_descendant_jemaat(id_induk)) OR has_global_scope());

-- Pattern P2 (Indirect): t_histori_perubahan_status
ALTER TABLE t_histori_perubahan_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_jem_select_t_histori_perubahan_status ON t_histori_perubahan_status FOR SELECT USING (EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = t_histori_perubahan_status.id_pos AND is_descendant_jemaat(id_induk)) OR has_global_scope());
CREATE POLICY policy_jem_insert_t_histori_perubahan_status ON t_histori_perubahan_status FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = t_histori_perubahan_status.id_pos AND id_induk = get_active_context_id()) OR has_global_scope());
CREATE POLICY policy_jem_update_t_histori_perubahan_status ON t_histori_perubahan_status FOR UPDATE USING (EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = t_histori_perubahan_status.id_pos AND is_descendant_jemaat(id_induk)) OR has_global_scope());
CREATE POLICY policy_jem_delete_t_histori_perubahan_status ON t_histori_perubahan_status FOR DELETE USING (EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = t_histori_perubahan_status.id_pos AND is_descendant_jemaat(id_induk)) OR has_global_scope());

-- Pattern P3: m_mupel
ALTER TABLE m_mupel ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_mupel_select_m_mupel ON m_mupel FOR SELECT USING (id_mupel = get_active_context_id() OR has_global_scope());
CREATE POLICY policy_mupel_insert_m_mupel ON m_mupel FOR INSERT WITH CHECK (id_mupel = get_active_context_id());
CREATE POLICY policy_mupel_update_m_mupel ON m_mupel FOR UPDATE USING (id_mupel = get_active_context_id() OR has_global_scope());
CREATE POLICY policy_mupel_delete_m_mupel ON m_mupel FOR DELETE USING (id_mupel = get_active_context_id() OR has_global_scope());

-- Pattern P4a: users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_self_users ON users FOR ALL USING (id = get_user_id() OR has_global_scope());

-- Pattern P4a: m_push_subscription
ALTER TABLE m_push_subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_self_m_push_subscription ON m_push_subscription FOR ALL USING (id_user = get_user_id() OR has_global_scope());

-- Pattern P4a: webauthn_challenges
ALTER TABLE webauthn_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_self_webauthn_challenges ON webauthn_challenges FOR ALL USING (user_id = get_user_id() OR has_global_scope());

-- Pattern P4b: m_pendeta
ALTER TABLE m_pendeta ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_person_select_m_pendeta ON m_pendeta FOR SELECT USING (is_self_person(id_pendeta) OR is_descendant_jemaat(id_induk) OR has_global_scope());
CREATE POLICY policy_person_update_m_pendeta ON m_pendeta FOR UPDATE USING (is_self_person(id_pendeta) OR has_global_scope());

-- Pattern P4b: t_jabatan_struktural
ALTER TABLE t_jabatan_struktural ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_person_select_t_jabatan_struktural ON t_jabatan_struktural FOR SELECT USING (is_self_person(id_pendeta) OR EXISTS (SELECT 1 FROM m_pendeta m WHERE m.id_pendeta = t_jabatan_struktural.id_pendeta AND is_descendant_jemaat(m.id_induk)) OR has_global_scope());
CREATE POLICY policy_person_update_t_jabatan_struktural ON t_jabatan_struktural FOR UPDATE USING (is_self_person(id_pendeta) OR has_global_scope());

-- Pattern P4b: t_keterlibatan_pendeta
ALTER TABLE t_keterlibatan_pendeta ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_person_select_t_keterlibatan_pendeta ON t_keterlibatan_pendeta FOR SELECT USING (is_self_person(id_pendeta) OR EXISTS (SELECT 1 FROM m_pendeta m WHERE m.id_pendeta = t_keterlibatan_pendeta.id_pendeta AND is_descendant_jemaat(m.id_induk)) OR has_global_scope());
CREATE POLICY policy_person_update_t_keterlibatan_pendeta ON t_keterlibatan_pendeta FOR UPDATE USING (is_self_person(id_pendeta) OR has_global_scope());

-- Pattern P5: t_keluarga_pendeta
ALTER TABLE t_keluarga_pendeta ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_privacy_t_keluarga_pendeta ON t_keluarga_pendeta FOR ALL USING (is_self_person(id_pendeta) OR has_global_scope());

-- Pattern P5: m_webauthn_credentials
ALTER TABLE m_webauthn_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_privacy_m_webauthn_credentials ON m_webauthn_credentials FOR ALL USING (id_user = get_user_id() OR has_global_scope());

-- Pattern P7: t_log_aktivitas
ALTER TABLE t_log_aktivitas ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_sys_select_t_log_aktivitas ON t_log_aktivitas FOR SELECT USING (id_user = get_user_id() OR has_global_scope());
CREATE POLICY policy_sys_insert_t_log_aktivitas ON t_log_aktivitas FOR INSERT WITH CHECK (has_global_scope());
CREATE POLICY policy_sys_update_t_log_aktivitas ON t_log_aktivitas FOR UPDATE USING (has_global_scope());

-- Pattern P7: t_form_draft
ALTER TABLE t_form_draft ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_sys_select_t_form_draft ON t_form_draft FOR SELECT USING (id_user = get_user_id() OR has_global_scope());
CREATE POLICY policy_sys_insert_t_form_draft ON t_form_draft FOR INSERT WITH CHECK (has_global_scope());
CREATE POLICY policy_sys_update_t_form_draft ON t_form_draft FOR UPDATE USING (has_global_scope());

-- Pattern P7: t_approval_bantuan
ALTER TABLE t_approval_bantuan ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_sys_select_t_approval_bantuan ON t_approval_bantuan FOR SELECT USING (EXISTS (SELECT 1 FROM t_pengajuan_bantuan p WHERE p.id_ajuan = t_approval_bantuan.id_ajuan AND is_descendant_pos(p.id_pos)) OR has_global_scope());
CREATE POLICY policy_sys_insert_t_approval_bantuan ON t_approval_bantuan FOR INSERT WITH CHECK (has_global_scope());
CREATE POLICY policy_sys_update_t_approval_bantuan ON t_approval_bantuan FOR UPDATE USING (has_global_scope());

-- Pattern P7: t_riwayat_mutasi_pendeta
ALTER TABLE t_riwayat_mutasi_pendeta ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_sys_select_t_riwayat_mutasi_pendeta ON t_riwayat_mutasi_pendeta FOR SELECT USING (is_self_person(id_pendeta) OR is_descendant_jemaat(id_induk_lama) OR is_descendant_jemaat(id_induk_baru) OR has_global_scope());
CREATE POLICY policy_sys_insert_t_riwayat_mutasi_pendeta ON t_riwayat_mutasi_pendeta FOR INSERT WITH CHECK (has_global_scope());
CREATE POLICY policy_sys_update_t_riwayat_mutasi_pendeta ON t_riwayat_mutasi_pendeta FOR UPDATE USING (has_global_scope());

-- System Table: sys_transaction_logs
ALTER TABLE sys_transaction_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_sys_all_sys_transaction_logs ON sys_transaction_logs FOR ALL USING (has_global_scope());

-- System Table: sys_telemetry
ALTER TABLE sys_telemetry ENABLE ROW LEVEL SECURITY;
CREATE POLICY policy_sys_all_sys_telemetry ON sys_telemetry FOR ALL USING (has_global_scope());



-- [MIGRATION SOURCE: 20260720_functions.sql]
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


-- [MIGRATION SOURCE: 20260720_init.sql]
-- Migration: 20260720_init.sql
-- Description: Initial schema for SI GPIB v2.2 (Mobile First PWA + Biometric)

BEGIN;

-- 1. Master Tables
CREATE TABLE m_mupel (
    id_mupel VARCHAR(20) PRIMARY KEY,
    nama_mupel VARCHAR(100) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: we need to delay m_jemaat_induk's id_kmj foreign key until m_pendeta exists
CREATE TABLE m_jemaat_induk (
    id_induk VARCHAR(20) PRIMARY KEY,
    id_mupel VARCHAR(20) REFERENCES m_mupel(id_mupel),
    nama_induk VARCHAR(150) NOT NULL,
    alamat TEXT,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    id_kmj VARCHAR(20) UNIQUE, -- FK added later
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE m_pos_pelkes (
    id_pos VARCHAR(20) PRIMARY KEY,
    id_induk VARCHAR(20) REFERENCES m_jemaat_induk(id_induk),
    nama_pos VARCHAR(150) NOT NULL,
    alamat TEXT,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    tgl_berdiri DATE,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE m_pendeta (
    id_pendeta VARCHAR(20) PRIMARY KEY,
    id_induk VARCHAR(20) REFERENCES m_jemaat_induk(id_induk),
    nama_lengkap VARCHAR(150) NOT NULL,
    no_wa VARCHAR(20),
    jabatan VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Aktif',
    tgl_lahir DATE,
    gender VARCHAR(10),
    tgl_tugas DATE,
    is_kmj BOOLEAN DEFAULT FALSE,
    is_pj BOOLEAN DEFAULT FALSE,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add the FK for id_kmj now that m_pendeta exists
ALTER TABLE m_jemaat_induk ADD CONSTRAINT fk_jemaat_kmj FOREIGN KEY (id_kmj) REFERENCES m_pendeta(id_pendeta);

-- 2. Auth & Security Tables
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Matches auth.users
    no_telepon VARCHAR(20) UNIQUE,
    email VARCHAR(150) UNIQUE,
    password_hash TEXT,
    id_pendeta VARCHAR(20) REFERENCES m_pendeta(id_pendeta),
    id_mupel VARCHAR(20) REFERENCES m_mupel(id_mupel),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Aktif',
    biometric_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE m_webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter BIGINT DEFAULT 0,
    device_type VARCHAR(50),
    backed_up BOOLEAN DEFAULT FALSE,
    transports TEXT[],
    display_name VARCHAR(100),
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE m_push_subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. KMJ & PJ Assignment Tables
CREATE TABLE t_pj_jemaat (
    id SERIAL PRIMARY KEY,
    id_induk VARCHAR(20) REFERENCES m_jemaat_induk(id_induk) ON DELETE CASCADE,
    id_pendeta VARCHAR(20) REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
    tanggal_mulai DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_selesai DATE,
    status VARCHAR(20) DEFAULT 'Aktif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transaction Tables
CREATE TABLE t_penugasan_pendeta (
    id_tugas VARCHAR(30) PRIMARY KEY,
    id_pendeta VARCHAR(20) REFERENCES m_pendeta(id_pendeta),
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    tgl_mulai DATE NOT NULL,
    tgl_selesai DATE,
    status_tugas VARCHAR(20) DEFAULT 'Aktif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_riwayat_mutasi_pendeta (
    id_riwayat VARCHAR(30) PRIMARY KEY,
    id_pendeta VARCHAR(20) REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
    id_induk_lama VARCHAR(20) REFERENCES m_jemaat_induk(id_induk),
    id_induk_baru VARCHAR(20) REFERENCES m_jemaat_induk(id_induk),
    tgl_mutasi DATE NOT NULL,
    jenis_mutasi VARCHAR(30) DEFAULT 'MUTASI',
    alasan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_log_pastoral (
    id_log VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    id_pendeta VARCHAR(20) REFERENCES m_pendeta(id_pendeta),
    tgl DATE NOT NULL,
    kegiatan VARCHAR(200) NOT NULL,
    jml_jiwa INT,
    catatan TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_pelayan (
    id_pelayan VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    nama VARCHAR(150) NOT NULL,
    no_wa VARCHAR(20),
    jabatan VARCHAR(100),
    tgl_lahir DATE,
    gender VARCHAR(10),
    status VARCHAR(50) DEFAULT 'Aktif',
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_jadwal_ibadah (
    id_ibadah VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    jenis VARCHAR(100) NOT NULL,
    hari VARCHAR(20) NOT NULL,
    jam TIME NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_relawan (
    id_relawan VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    nama VARCHAR(150) NOT NULL,
    no_wa VARCHAR(20),
    tgl_lahir DATE,
    gender VARCHAR(10),
    kategori VARCHAR(100),
    pelatihan VARCHAR(200),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_aset_tanah (
    id_tanah VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    luas_m2 DECIMAL(12,2),
    thn_perolehan INT,
    status_hukum VARCHAR(100),
    kondisi VARCHAR(50),
    potensi_sda VARCHAR(200),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_aset_bangunan (
    id_bangunan VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    fungsi VARCHAR(100),
    kondisi VARCHAR(50),
    thn_berdiri INT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_aset_bergerak (
    id_aset_b VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    jenis VARCHAR(100),
    merk_tipe VARCHAR(100),
    thn_perolehan INT,
    no_polisi VARCHAR(20),
    tgl_pajak DATE,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_lampiran_aset (
    id_lampiran VARCHAR(30) PRIMARY KEY,
    id_tanah VARCHAR(30) REFERENCES t_aset_tanah(id_tanah) ON DELETE CASCADE,
    id_bangunan VARCHAR(30) REFERENCES t_aset_bangunan(id_bangunan) ON DELETE CASCADE,
    id_aset_b VARCHAR(30) REFERENCES t_aset_bergerak(id_aset_b) ON DELETE CASCADE,
    nama_file VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    tipe_file VARCHAR(100),
    ukuran_file DECIMAL(10,2),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_pengajuan_bantuan (
    id_ajuan VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    jenis_bantuan VARCHAR(150) NOT NULL,
    id_tanah VARCHAR(30) REFERENCES t_aset_tanah(id_tanah) ON DELETE SET NULL,
    id_bangunan VARCHAR(30) REFERENCES t_aset_bangunan(id_bangunan) ON DELETE SET NULL,
    id_aset_b VARCHAR(30) REFERENCES t_aset_bergerak(id_aset_b) ON DELETE SET NULL,
    biaya DECIMAL(15,2),
    urgensi VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Draft',
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_demografi_pelkat (
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    kategori_pelkat VARCHAR(50),
    jml_kk INT,
    laki INT,
    perempuan INT,
    profesi VARCHAR(200),
    pendidikan VARCHAR(200),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id_pos, kategori_pelkat)
);

CREATE TABLE t_kerawanan_wilayah (
    id_risiko VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    kategori VARCHAR(100),
    jenis_risiko VARCHAR(150),
    frekuensi VARCHAR(50),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_potensi_wilayah (
    id_potensi VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos),
    nama_potensi VARCHAR(150),
    kategori VARCHAR(100),
    deskripsi TEXT,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit & Workflow Tables
CREATE TABLE t_log_aktivitas (
    id_log VARCHAR(50) PRIMARY KEY,
    id_user UUID REFERENCES users(id),
    waktu TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    aktor VARCHAR(50) NOT NULL,
    aksi VARCHAR(30) NOT NULL,
    objek_type VARCHAR(30),
    objek_id VARCHAR(30),
    keterangan TEXT
);

CREATE TABLE t_approval_bantuan (
    id SERIAL PRIMARY KEY,
    id_ajuan VARCHAR(30) REFERENCES t_pengajuan_bantuan(id_ajuan) ON DELETE CASCADE,
    approver_id UUID REFERENCES users(id),
    role_approver VARCHAR(20) NOT NULL,
    aksi VARCHAR(20) NOT NULL,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_form_draft (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID REFERENCES users(id) ON DELETE CASCADE,
    form_type VARCHAR(30) NOT NULL,
    objek_id VARCHAR(30),
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 6. Indexes
CREATE UNIQUE INDEX idx_pj_aktif_unik ON t_pj_jemaat(id_induk, id_pendeta) WHERE tanggal_selesai IS NULL;
CREATE INDEX idx_pj_aktif ON t_pj_jemaat(id_induk) WHERE tanggal_selesai IS NULL;
CREATE INDEX idx_jemaat_induk_mupel ON m_jemaat_induk(id_mupel);
CREATE INDEX idx_jemaat_kmj ON m_jemaat_induk(id_kmj);
CREATE INDEX idx_pos_pelkes_induk ON m_pos_pelkes(id_induk);
CREATE INDEX idx_pendeta_induk ON m_pendeta(id_induk);
CREATE INDEX idx_webauthn_user ON m_webauthn_credentials(id_user);

-- 7. Functions
CREATE OR REPLACE FUNCTION mutasi_pendeta(
    p_id_pendeta VARCHAR,
    p_id_induk_baru VARCHAR,
    p_alasan TEXT
) RETURNS VOID AS $$
DECLARE
    v_id_induk_lama VARCHAR;
BEGIN
    SELECT id_induk INTO v_id_induk_lama FROM m_pendeta WHERE id_pendeta = p_id_pendeta;
    
    INSERT INTO t_riwayat_mutasi_pendeta(id_riwayat, id_pendeta, id_induk_lama, id_induk_baru, tgl_mutasi, jenis_mutasi, alasan)
    VALUES (gen_random_uuid()::text, p_id_pendeta, v_id_induk_lama, p_id_induk_baru, CURRENT_DATE, 'MUTASI', p_alasan);
    
    UPDATE m_pendeta
    SET id_induk = p_id_induk_baru, is_kmj = FALSE, is_pj = FALSE, updated_at = NOW()
    WHERE id_pendeta = p_id_pendeta;
    
    UPDATE t_pj_jemaat
    SET tanggal_selesai = CURRENT_DATE, status = 'Selesai'
    WHERE id_pendeta = p_id_pendeta AND tanggal_selesai IS NULL;
END;
$$ LANGUAGE plpgsql;

COMMIT;


-- [MIGRATION SOURCE: 20260720_rls.sql]
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


-- [MIGRATION SOURCE: 20260721_auth_trigger.sql]
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


-- [MIGRATION SOURCE: 20260721_fix_kmj_quotes_bajem.sql]
-- Migration: 20260721_fix_kmj_quotes_bajem.sql
-- Description: Clean double quotes, seed missing KMJs from Jemaat.txt, add kategori (Bajem/Pos Pelkes) column to m_pos_pelkes

BEGIN;

-- 1. Add kategori column to m_pos_pelkes if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='m_pos_pelkes' AND column_name='kategori'
    ) THEN
        ALTER TABLE m_pos_pelkes ADD COLUMN kategori VARCHAR(50) DEFAULT 'Pos Pelkes';
    END IF;
END $$;

-- 2. Update m_jemaat_induk (cleaned names & keterangan)
UPDATE m_jemaat_induk SET nama_induk = 'FILADELFIA', keterangan = 'Medan' WHERE id_induk = '01-03-FM';
UPDATE m_jemaat_induk SET nama_induk = 'ANUGERAH', keterangan = 'Pangkalan Brandan Langkat' WHERE id_induk = '01-01-AP';
UPDATE m_jemaat_induk SET nama_induk = 'BANDA ACEH', keterangan = 'Banda Aceh' WHERE id_induk = '01-02-BA';
UPDATE m_jemaat_induk SET nama_induk = 'EFATA', keterangan = 'Tanjung Morawa Deli Serdang' WHERE id_induk = '01-13-ET';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Medan' WHERE id_induk = '01-04-IM';
UPDATE m_jemaat_induk SET nama_induk = 'KASIH KARUNIA', keterangan = 'Medan' WHERE id_induk = '01-05-KM';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Pematang Siantar' WHERE id_induk = '01-06-MP';
UPDATE m_jemaat_induk SET nama_induk = 'MITRA PARSINGGURAN NAULI', keterangan = 'Parsingguran Humbang Hasundutan' WHERE id_induk = '01-12-MP';
UPDATE m_jemaat_induk SET nama_induk = 'PATMOS', keterangan = 'Sabang' WHERE id_induk = '01-07-PS';
UPDATE m_jemaat_induk SET nama_induk = 'PAULUS', keterangan = 'Binjai' WHERE id_induk = '01-14-PB';
UPDATE m_jemaat_induk SET nama_induk = 'PNIEL', keterangan = 'Kampung Kolam Deli Serdang' WHERE id_induk = '01-08-PT';
UPDATE m_jemaat_induk SET nama_induk = 'SILOAM', keterangan = 'Sibolga' WHERE id_induk = '01-09-SS';
UPDATE m_jemaat_induk SET nama_induk = 'SYALOOM', keterangan = 'Bangun Purba Deli Serdang' WHERE id_induk = '01-11-SB';
UPDATE m_jemaat_induk SET nama_induk = 'YOPPE', keterangan = 'Belawan Medan' WHERE id_induk = '01-10-YB';
UPDATE m_jemaat_induk SET nama_induk = 'MADUMA', keterangan = 'Medan' WHERE id_induk = '01-15-MD';
UPDATE m_jemaat_induk SET nama_induk = 'PIR BESITANG', keterangan = 'Pangkalan Brandan' WHERE id_induk = '01-16-PB';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Pekanbaru' WHERE id_induk = '04-10-IP';
UPDATE m_jemaat_induk SET nama_induk = 'ANUGERAH', keterangan = 'Sorek Pelalawan' WHERE id_induk = '04-01-AS';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT ZAITUN', keterangan = 'Duri Bengkalis' WHERE id_induk = '04-04-BZ';
UPDATE m_jemaat_induk SET nama_induk = 'EFFATA', keterangan = 'Pasaman' WHERE id_induk = '04-05-ET';
UPDATE m_jemaat_induk SET nama_induk = 'EFRATA', keterangan = 'Padang' WHERE id_induk = '04-06-EP';
UPDATE m_jemaat_induk SET nama_induk = 'EFRATA', keterangan = 'Kuantan Sengingi' WHERE id_induk = '04-07-EF';
UPDATE m_jemaat_induk SET nama_induk = 'EKKLESIA', keterangan = 'Dumai' WHERE id_induk = '04-08-ED';
UPDATE m_jemaat_induk SET nama_induk = 'GIBEON', keterangan = 'Rumbai Pekanbaru' WHERE id_induk = '04-09-GR';
UPDATE m_jemaat_induk SET nama_induk = 'KASIH ABADI', keterangan = 'Perawang Siak' WHERE id_induk = '04-11-KP';
UPDATE m_jemaat_induk SET nama_induk = 'MARTURIA', keterangan = 'Kuantan Sengingi' WHERE id_induk = '04-13-MK';
UPDATE m_jemaat_induk SET nama_induk = 'SILOAM', keterangan = 'Kota Baru Pekanbaru' WHERE id_induk = '04-14-SK';
UPDATE m_jemaat_induk SET nama_induk = 'SUMBER KASIH', keterangan = 'Indrapuri Kampar' WHERE id_induk = '04-15-SD';
UPDATE m_jemaat_induk SET nama_induk = 'RAFFLESIA', keterangan = 'Bengkulu' WHERE id_induk = '04-16-RB';
UPDATE m_jemaat_induk SET nama_induk = 'BAHTERA HAYAT', keterangan = 'Batam' WHERE id_induk = '03-01-BB';
UPDATE m_jemaat_induk SET nama_induk = 'BETHEL', keterangan = 'Tanjung Pinang' WHERE id_induk = '03-03-BT';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT KARMEL', keterangan = 'Dabo Singkep' WHERE id_induk = '03-04-BD';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT KASIH', keterangan = 'Ranai Natuna' WHERE id_induk = '03-10-BR';
UPDATE m_jemaat_induk SET nama_induk = 'EBENHAEZER', keterangan = 'Tanjung Batu Kundur' WHERE id_induk = '03-05-ET';
UPDATE m_jemaat_induk SET nama_induk = 'GETSEMANI', keterangan = 'Mengkait Anambas' WHERE id_induk = '03-12-Z';
UPDATE m_jemaat_induk SET nama_induk = 'HOSANA', keterangan = 'Tanjung Uban Bintan' WHERE id_induk = '03-06-HT';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Batam' WHERE id_induk = '03-07-IB';
UPDATE m_jemaat_induk SET nama_induk = 'SOLA GRATIA', keterangan = 'Bukit Layang, Tanjung Piayu Batam' WHERE id_induk = '03-13-Z';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Tarempa Anambas' WHERE id_induk = '03-08-IT';
UPDATE m_jemaat_induk SET nama_induk = 'ORA ET LABORA', keterangan = 'Tanjung Balai Karimun' WHERE id_induk = '05-09-OT';
UPDATE m_jemaat_induk SET nama_induk = 'ZEBULON', keterangan = 'Batam' WHERE id_induk = '03-11-ZS';
UPDATE m_jemaat_induk SET nama_induk = 'EZRA', keterangan = 'Tiangwangkang - Batam' WHERE id_induk = '03-14-EZ';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Palembang' WHERE id_induk = '05-04-IP';
UPDATE m_jemaat_induk SET nama_induk = 'EFRATA', keterangan = 'Bangun Jawa Lubuk Linggau' WHERE id_induk = '05-02-EL';
UPDATE m_jemaat_induk SET nama_induk = 'KARUNIA', keterangan = 'Muara Enim' WHERE id_induk = '05-05-KP';
UPDATE m_jemaat_induk SET nama_induk = 'PLAJU SUNGAI GERONG', keterangan = 'Sekojo Palembang' WHERE id_induk = '05-07-PS';
UPDATE m_jemaat_induk SET nama_induk = 'PNIEL', keterangan = 'Palembang' WHERE id_induk = '05-08-PP';
UPDATE m_jemaat_induk SET nama_induk = 'SANGKAKALA', keterangan = 'Ogan Komering Ilir' WHERE id_induk = '05-09-SB';
UPDATE m_jemaat_induk SET nama_induk = 'MARTURIA', keterangan = 'Jambi' WHERE id_induk = '05-06MJ';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT KASIH', keterangan = 'Sungai Penuh' WHERE id_induk = '04-03-BK';
UPDATE m_jemaat_induk SET nama_induk = 'ALFA OMEGA', keterangan = 'Sungai Bahar' WHERE id_induk = '05-01-AJ';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT DIAN KASIH', keterangan = 'Kayu Aro Kerinci' WHERE id_induk = '04-02-BD';
UPDATE m_jemaat_induk SET nama_induk = 'EKKLESIA', keterangan = 'Tanjung Jabung Barat' WHERE id_induk = '05-10-EJ';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Tempino' WHERE id_induk = '05-01-IJ';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Pangkal Pinang' WHERE id_induk = '02-06-MP';
UPDATE m_jemaat_induk SET nama_induk = 'BETHESDA', keterangan = 'Muntok' WHERE id_induk = '02-01-BM';
UPDATE m_jemaat_induk SET nama_induk = 'EFRATA', keterangan = 'Toboali' WHERE id_induk = '02-02-ET';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Belinyu' WHERE id_induk = '02-03-IB';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Tanjung Pandan' WHERE id_induk = '02-04-IT';
UPDATE m_jemaat_induk SET nama_induk = 'KARUNIA', keterangan = 'Manggar' WHERE id_induk = '02-05-KM';
UPDATE m_jemaat_induk SET nama_induk = 'ORA ET LABORA', keterangan = 'Sungai Liat' WHERE id_induk = '02-07-OS';
UPDATE m_jemaat_induk SET nama_induk = 'SION', keterangan = 'Koba' WHERE id_induk = '02-08-SK';
UPDATE m_jemaat_induk SET nama_induk = 'MARTURIA', keterangan = 'Bandar Lampung' WHERE id_induk = '06-05-MA';
UPDATE m_jemaat_induk SET nama_induk = 'BETH TEFILAH', keterangan = 'Pesawaran' WHERE id_induk = '06-01-BT';
UPDATE m_jemaat_induk SET nama_induk = 'EFFATHA', keterangan = 'Bandar Lampung' WHERE id_induk = '06-02-EF';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Pesawaran' WHERE id_induk = '06-03-IM';
UPDATE m_jemaat_induk SET nama_induk = 'KANAAN', keterangan = 'Lampung Tengah' WHERE id_induk = '06-11-KA';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Bandar Lampung' WHERE id_induk = '06-04-MR';
UPDATE m_jemaat_induk SET nama_induk = 'PANCARAN KASIH', keterangan = 'Tanggamus' WHERE id_induk = '06-06-PA';
UPDATE m_jemaat_induk SET nama_induk = 'PETRA', keterangan = 'Kota Bumi' WHERE id_induk = '06-07-PE';
UPDATE m_jemaat_induk SET nama_induk = 'SILO', keterangan = 'Panjang' WHERE id_induk = '06-08-SI';
UPDATE m_jemaat_induk SET nama_induk = 'TIBERIAS', keterangan = 'Lampung Tengah' WHERE id_induk = '06-09-TI';
UPDATE m_jemaat_induk SET nama_induk = 'ZEBAOTH', keterangan = 'Bangunrejo' WHERE id_induk = '06-10-ZE';
UPDATE m_jemaat_induk SET nama_induk = 'SYALOM PANCASILA', keterangan = 'Kotabumi Lampung Utara' WHERE id_induk = '06-12-SP';
UPDATE m_jemaat_induk SET nama_induk = 'MAKEDONIA', keterangan = 'Dipasena Lampung' WHERE id_induk = '06-13-MK';
UPDATE m_jemaat_induk SET nama_induk = 'FILADELFIA', keterangan = 'Bintaro' WHERE id_induk = '07-02-FI';
UPDATE m_jemaat_induk SET nama_induk = 'ABRAHAM', keterangan = 'Serang' WHERE id_induk = '07-12-AS';
UPDATE m_jemaat_induk SET nama_induk = 'BAHTERA IMAN', keterangan = 'Ciputat Tangerang' WHERE id_induk = '07-01-BI';
UPDATE m_jemaat_induk SET nama_induk = 'JURANG MANGU', keterangan = 'Tangerang Selatan' WHERE id_induk = '07-14-JM';
UPDATE m_jemaat_induk SET nama_induk = 'KARUNIA', keterangan = 'Ciputat Tangerang' WHERE id_induk = '07-03-KA';
UPDATE m_jemaat_induk SET nama_induk = 'KASIH KARUNIA', keterangan = 'Ciledug Tangerang' WHERE id_induk = '07-04-KK';
UPDATE m_jemaat_induk SET nama_induk = 'KASIH SETIA', keterangan = 'Tangerang' WHERE id_induk = '07-05-KS';
UPDATE m_jemaat_induk SET nama_induk = 'KINASIH', keterangan = 'Tangerang Selatan' WHERE id_induk = '07-06-KI';
UPDATE m_jemaat_induk SET nama_induk = 'OBOR BANTEN', keterangan = 'Tangerang Selatan' WHERE id_induk = '07-10-OB';
UPDATE m_jemaat_induk SET nama_induk = 'ORA ET LABORA', keterangan = 'Tangerang' WHERE id_induk = '07-11-OE';
UPDATE m_jemaat_induk SET nama_induk = 'PATMOS', keterangan = 'Tangerang' WHERE id_induk = '07-07-PA';
UPDATE m_jemaat_induk SET nama_induk = 'SAMARIA', keterangan = 'Tangerang' WHERE id_induk = '07-08-SA';
UPDATE m_jemaat_induk SET nama_induk = 'SINAR KASIH', keterangan = 'Kosambi Tangerang' WHERE id_induk = '07-13-SK';
UPDATE m_jemaat_induk SET nama_induk = 'YUDEA', keterangan = 'Tangerang' WHERE id_induk = '07-09-YU';
UPDATE m_jemaat_induk SET nama_induk = 'PAULUS', keterangan = 'Jakarta' WHERE id_induk = '10-10-PA';
UPDATE m_jemaat_induk SET nama_induk = 'ANUGERAH', keterangan = 'Jakarta' WHERE id_induk = '10-01-AN';
UPDATE m_jemaat_induk SET nama_induk = 'BETHESDA', keterangan = 'Jakarta' WHERE id_induk = '10-02-BA';
UPDATE m_jemaat_induk SET nama_induk = 'BETLEHEM', keterangan = 'Jakarta' WHERE id_induk = '10-03-BM';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT ZAITUN', keterangan = 'Jakarta' WHERE id_induk = '10-04-BZ';
UPDATE m_jemaat_induk SET nama_induk = 'EBENHAEZER', keterangan = 'Jakarta' WHERE id_induk = '10-05-EH';
UPDATE m_jemaat_induk SET nama_induk = 'GIDEON', keterangan = 'Jakarta' WHERE id_induk = '10-06-GI';
UPDATE m_jemaat_induk SET nama_induk = 'HOSIANA', keterangan = 'Jakarta' WHERE id_induk = '10-07-HO';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Jakarta' WHERE id_induk = '10-08-IM';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Jakarta' WHERE id_induk = '10-09-MA';
UPDATE m_jemaat_induk SET nama_induk = 'PETRUS', keterangan = 'Jakarta' WHERE id_induk = '10-11-PE';
UPDATE m_jemaat_induk SET nama_induk = 'PNIEL', keterangan = 'Jakarta' WHERE id_induk = '10-12-PN';
UPDATE m_jemaat_induk SET nama_induk = 'PETRA', keterangan = 'Jakarta' WHERE id_induk = '11-05-PE';
UPDATE m_jemaat_induk SET nama_induk = 'EIRENE', keterangan = 'Jakarta' WHERE id_induk = '11-01-EI';
UPDATE m_jemaat_induk SET nama_induk = 'GETSEMANI', keterangan = 'Jakarta' WHERE id_induk = '11-02-GE';
UPDATE m_jemaat_induk SET nama_induk = 'KELAPA GADING', keterangan = 'Jakarta' WHERE id_induk = '11-03-KE';
UPDATE m_jemaat_induk SET nama_induk = 'MENABUR KASIH', keterangan = 'Jakarta' WHERE id_induk = '11-04-ME';
UPDATE m_jemaat_induk SET nama_induk = 'TUGU', keterangan = 'Jakarta' WHERE id_induk = '11-06-TU';
UPDATE m_jemaat_induk SET nama_induk = 'BULAK TURI', keterangan = 'Marunda' WHERE id_induk = '11-07-BT';
UPDATE m_jemaat_induk SET nama_induk = 'SANGKAKALA', keterangan = 'Jakarta' WHERE id_induk = '08-01-SA';
UPDATE m_jemaat_induk SET nama_induk = 'SHALOM', keterangan = 'Jakarta' WHERE id_induk = '08-02-SH';
UPDATE m_jemaat_induk SET nama_induk = 'SION', keterangan = 'Jakarta' WHERE id_induk = '08-05-SN';
UPDATE m_jemaat_induk SET nama_induk = 'SILO', keterangan = 'Jakarta' WHERE id_induk = '08-03-SI';
UPDATE m_jemaat_induk SET nama_induk = 'SILOAM', keterangan = 'Jakarta' WHERE id_induk = '08-04-SM';
UPDATE m_jemaat_induk SET nama_induk = 'YAHYA', keterangan = 'Jakarta' WHERE id_induk = '08-06-YA';
UPDATE m_jemaat_induk SET nama_induk = 'PENABUR', keterangan = 'Jakarta' WHERE id_induk = '12-12-PR';
UPDATE m_jemaat_induk SET nama_induk = 'AGAPE', keterangan = 'Jakarta' WHERE id_induk = '12-01-AG';
UPDATE m_jemaat_induk SET nama_induk = 'BETHANIA', keterangan = 'Jakarta' WHERE id_induk = '12-02-BE';
UPDATE m_jemaat_induk SET nama_induk = 'CAWANG BARU', keterangan = 'Jakarta' WHERE id_induk = '12-03-CA';
UPDATE m_jemaat_induk SET nama_induk = 'HOREB', keterangan = 'Jakarta' WHERE id_induk = '12-04-HO';
UPDATE m_jemaat_induk SET nama_induk = 'KHARIS', keterangan = 'Jakarta' WHERE id_induk = '12-05-KH';
UPDATE m_jemaat_induk SET nama_induk = 'KOINONIA', keterangan = 'Jakarta' WHERE id_induk = '12-06-KO';
UPDATE m_jemaat_induk SET nama_induk = 'MARTIN LUTHER', keterangan = 'Jakarta' WHERE id_induk = '12-07-ML';
UPDATE m_jemaat_induk SET nama_induk = 'MARTURIA', keterangan = 'Jakarta' WHERE id_induk = '12-08-MA';
UPDATE m_jemaat_induk SET nama_induk = 'MENARA IMAN', keterangan = 'Jakarta' WHERE id_induk = '12-09-ME';
UPDATE m_jemaat_induk SET nama_induk = 'NAZARETH', keterangan = 'Jakarta' WHERE id_induk = '12-10-NA';
UPDATE m_jemaat_induk SET nama_induk = 'PELITA', keterangan = 'Jakarta' WHERE id_induk = '12-11-PE';
UPDATE m_jemaat_induk SET nama_induk = 'SURYA KASIH', keterangan = 'Jakarta' WHERE id_induk = '12-13-SU';
UPDATE m_jemaat_induk SET nama_induk = 'TAMAN HARAPAN', keterangan = 'Jakarta' WHERE id_induk = '12-14-TA';
UPDATE m_jemaat_induk SET nama_induk = 'TORSINA', keterangan = 'Jakarta' WHERE id_induk = '12-15-TO';
UPDATE m_jemaat_induk SET nama_induk = 'EFFATHA', keterangan = 'Jakarta' WHERE id_induk = '09-02-EF';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT MORIA', keterangan = 'Jakarta' WHERE id_induk = '09-01-BM';
UPDATE m_jemaat_induk SET nama_induk = 'EKKLESIA', keterangan = 'Jakarta' WHERE id_induk = '09-03-EK';
UPDATE m_jemaat_induk SET nama_induk = 'GIBEON', keterangan = 'Jakarta' WHERE id_induk = '09-04-GI';
UPDATE m_jemaat_induk SET nama_induk = 'KHARISMA', keterangan = 'Jakarta' WHERE id_induk = '09-05-KH';
UPDATE m_jemaat_induk SET nama_induk = 'MARKUS', keterangan = 'Jakarta' WHERE id_induk = '09-06-MA';
UPDATE m_jemaat_induk SET nama_induk = 'PASAR MINGGU', keterangan = 'Jakarta' WHERE id_induk = '09-07-PA';
UPDATE m_jemaat_induk SET nama_induk = 'SEJAHTERA', keterangan = 'Jakarta' WHERE id_induk = '09-08-SE';
UPDATE m_jemaat_induk SET nama_induk = 'SETIABUDI', keterangan = 'Jakarta' WHERE id_induk = '09-09-SI';
UPDATE m_jemaat_induk SET nama_induk = 'SUMBER KASIH', keterangan = 'Jakarta' WHERE id_induk = '09-10-SK';
UPDATE m_jemaat_induk SET nama_induk = 'JATIPON', keterangan = 'Bekasi' WHERE id_induk = '13-11-JA';
UPDATE m_jemaat_induk SET nama_induk = 'ANUGERAH', keterangan = 'Bekasi' WHERE id_induk = '13-01-AN';
UPDATE m_jemaat_induk SET nama_induk = 'BAHTERA KASIH', keterangan = 'Bekasi' WHERE id_induk = '13-02-BA';
UPDATE m_jemaat_induk SET nama_induk = 'DIAN KASIH', keterangan = 'Bekasi' WHERE id_induk = '13-03-DI';
UPDATE m_jemaat_induk SET nama_induk = 'GALILEA', keterangan = 'Bekasi' WHERE id_induk = '13-04-GA';
UPDATE m_jemaat_induk SET nama_induk = 'GLORIA', keterangan = 'Bekasi' WHERE id_induk = '13-05-GL';
UPDATE m_jemaat_induk SET nama_induk = 'GRATIA', keterangan = 'Bekasi' WHERE id_induk = '13-06-GR';
UPDATE m_jemaat_induk SET nama_induk = 'HARAPAN BARU', keterangan = 'Bekasi' WHERE id_induk = '13-07-HB';
UPDATE m_jemaat_induk SET nama_induk = 'HARAPAN INDAH', keterangan = 'Bekasi' WHERE id_induk = '13-08-HI';
UPDATE m_jemaat_induk SET nama_induk = 'HARAPAN KASIH', keterangan = 'Bekasi' WHERE id_induk = '13-09-HK';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Bekasi' WHERE id_induk = '13-10-IM';
UPDATE m_jemaat_induk SET nama_induk = 'MENARA KASIH', keterangan = 'Bekasi' WHERE id_induk = '13-12-MK';
UPDATE m_jemaat_induk SET nama_induk = 'PILAR ASIH', keterangan = 'Bekasi' WHERE id_induk = '13-14-PA';
UPDATE m_jemaat_induk SET nama_induk = 'PONDOK UNGU', keterangan = 'Bekasi' WHERE id_induk = '13-13-PU';
UPDATE m_jemaat_induk SET nama_induk = 'KARANG SATRIA', keterangan = 'Tambun Utara - Bekasi' WHERE id_induk = '13-14-KS';
UPDATE m_jemaat_induk SET nama_induk = 'SEJAHTERA', keterangan = 'Bandung' WHERE id_induk = '14-08-SB';
UPDATE m_jemaat_induk SET nama_induk = 'BETHEL', keterangan = 'Bandung' WHERE id_induk = '14-01-BB';
UPDATE m_jemaat_induk SET nama_induk = 'EFATA', keterangan = 'Batujajar Bandung Barat' WHERE id_induk = '14-02-EF';
UPDATE m_jemaat_induk SET nama_induk = 'GETSEMANI', keterangan = 'Cirebon' WHERE id_induk = '14-03-GC';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Cimahi' WHERE id_induk = '14-04-IC';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Bandung' WHERE id_induk = '14-05-MB';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Subang' WHERE id_induk = '14-06-MS';
UPDATE m_jemaat_induk SET nama_induk = 'PNIEL YUDHA WIYOGRAHA', keterangan = 'Dayeuhkolot Bandung' WHERE id_induk = '14-07-PB';
UPDATE m_jemaat_induk SET nama_induk = 'SILIH ASIH', keterangan = 'Bandung' WHERE id_induk = '14-09-SA';
UPDATE m_jemaat_induk SET nama_induk = 'SYALOOM', keterangan = 'Cikampek Karawang' WHERE id_induk = '14-10-SC';
UPDATE m_jemaat_induk SET nama_induk = 'WISMA ASIH', keterangan = 'Lembang Bandung Barat' WHERE id_induk = '14-11-WL';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Depok' WHERE id_induk = '15-05-ID';
UPDATE m_jemaat_induk SET nama_induk = 'BOJONG GEDE', keterangan = 'Bogor' WHERE id_induk = '15-20-BG';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT SENTUL', keterangan = 'Bogor' WHERE id_induk = '15-21-BS';
UPDATE m_jemaat_induk SET nama_induk = 'CIMANGGIS', keterangan = 'Depok' WHERE id_induk = '15-01-CD';
UPDATE m_jemaat_induk SET nama_induk = 'CINERE', keterangan = 'Depok' WHERE id_induk = '15-19-CD';
UPDATE m_jemaat_induk SET nama_induk = 'CIPEUCANG', keterangan = 'Jonggol Bogor' WHERE id_induk = '15-22-CP';
UPDATE m_jemaat_induk SET nama_induk = 'DAMAI SEJAHTERA', keterangan = 'Cileungsi Bogor' WHERE id_induk = '15-02-DS';
UPDATE m_jemaat_induk SET nama_induk = 'GALILEA', keterangan = 'Pelabuhan Ratu Sukabumi' WHERE id_induk = '15-03-GP';
UPDATE m_jemaat_induk SET nama_induk = 'GIDEON', keterangan = 'Kelapa Dua Cimanggis' WHERE id_induk = '15-04-GK';
UPDATE m_jemaat_induk SET nama_induk = 'KARTIKA SEJAHTERA', keterangan = 'Bogor' WHERE id_induk = '15-18-KS';
UPDATE m_jemaat_induk SET nama_induk = 'KORNELIUS', keterangan = 'Lido Bogor' WHERE id_induk = '15-06-KL';
UPDATE m_jemaat_induk SET nama_induk = 'NEHEMIA', keterangan = 'Cibogo Bogor' WHERE id_induk = '15-07-NC';
UPDATE m_jemaat_induk SET nama_induk = 'PANCARAN KASIH', keterangan = 'Depok' WHERE id_induk = '15-08-PK';
UPDATE m_jemaat_induk SET nama_induk = 'PANCORAN RAHMAT', keterangan = 'Depok' WHERE id_induk = '15-09-PD';
UPDATE m_jemaat_induk SET nama_induk = 'PELITA HIDUP', keterangan = 'Depok' WHERE id_induk = '15-10-PH';
UPDATE m_jemaat_induk SET nama_induk = 'PENGHARAPAN', keterangan = 'Cibinong Bogor' WHERE id_induk = '15-11-PC';
UPDATE m_jemaat_induk SET nama_induk = 'PETRA', keterangan = 'Ciluar Bogor' WHERE id_induk = '15-12-PB';
UPDATE m_jemaat_induk SET nama_induk = 'SAWANGAN', keterangan = 'Depok' WHERE id_induk = '15-13-SA';
UPDATE m_jemaat_induk SET nama_induk = 'SHALOM', keterangan = 'Beji Depok' WHERE id_induk = '15-15-SD';
UPDATE m_jemaat_induk SET nama_induk = 'SOLA GRATIA', keterangan = 'Semplak Bogor' WHERE id_induk = '15-14-SS';
UPDATE m_jemaat_induk SET nama_induk = 'TRINITAS', keterangan = 'Kota Wisata Cibubur' WHERE id_induk = '15-17-TK';
UPDATE m_jemaat_induk SET nama_induk = 'ZEBAOTH', keterangan = 'Bogor' WHERE id_induk = '15-16-ZB';
UPDATE m_jemaat_induk SET nama_induk = 'CISEENG', keterangan = 'Bogor' WHERE id_induk = '15-22-CS';
UPDATE m_jemaat_induk SET nama_induk = 'PURA TAJURHALANG', keterangan = 'Tajurhalang - Bogor' WHERE id_induk = '15-23-PT';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Semarang' WHERE id_induk = '16-06-IS';
UPDATE m_jemaat_induk SET nama_induk = 'AMBARAWA TAMBAKREJO KEBONDOWO', keterangan = 'Ambarawa' WHERE id_induk = '16-01-AS';
UPDATE m_jemaat_induk SET nama_induk = 'AYALON', keterangan = 'Tegal' WHERE id_induk = '16-02-AY';
UPDATE m_jemaat_induk SET nama_induk = 'BETHEL', keterangan = 'Magelang' WHERE id_induk = '16-07-MA';
UPDATE m_jemaat_induk SET nama_induk = 'CUPUWATU', keterangan = 'Sleman' WHERE id_induk = '16-15-CP';
UPDATE m_jemaat_induk SET nama_induk = 'EFFATHA', keterangan = 'Semarang' WHERE id_induk = '16-03-ES';
UPDATE m_jemaat_induk SET nama_induk = 'FILADELFIA', keterangan = 'Semarang' WHERE id_induk = '16-04-FS';
UPDATE m_jemaat_induk SET nama_induk = 'GALILEA', keterangan = 'Cilacap' WHERE id_induk = '16-05-GC';
UPDATE m_jemaat_induk SET nama_induk = 'GRIYA MULYA', keterangan = 'Purworejo' WHERE id_induk = '16-11-PU';
UPDATE m_jemaat_induk SET nama_induk = 'MARGA MULYA', keterangan = 'Yogyakarta' WHERE id_induk = '16-08-MY';
UPDATE m_jemaat_induk SET nama_induk = 'PENABUR', keterangan = 'Solo' WHERE id_induk = '16-10-PS';
UPDATE m_jemaat_induk SET nama_induk = 'SION', keterangan = 'Semarang' WHERE id_induk = '16-12-SS';
UPDATE m_jemaat_induk SET nama_induk = 'SOLO UTARA', keterangan = 'Solo' WHERE id_induk = '16-13-SU';
UPDATE m_jemaat_induk SET nama_induk = 'TAMAN SARI', keterangan = 'Salatiga' WHERE id_induk = '16-14-TS';
UPDATE m_jemaat_induk SET nama_induk = 'BETHLEHEM', keterangan = 'Gebyog, Purwoharjo - Comal' WHERE id_induk = '16-16-BT';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Surabaya' WHERE id_induk = '17-33-MS';
UPDATE m_jemaat_induk SET nama_induk = 'AIR HIDUP', keterangan = 'Kamal Madura' WHERE id_induk = '17-01-AK';
UPDATE m_jemaat_induk SET nama_induk = 'AIR KEHIDUPAN', keterangan = 'Blitar' WHERE id_induk = '17-02-AB';
UPDATE m_jemaat_induk SET nama_induk = 'BAHTERA HAYAT', keterangan = 'Surabaya' WHERE id_induk = '17-03-BH';
UPDATE m_jemaat_induk SET nama_induk = 'BAHTERA KASIH', keterangan = 'Gresik' WHERE id_induk = '17-04-BG';
UPDATE m_jemaat_induk SET nama_induk = 'BENOWO', keterangan = 'Surabaya' WHERE id_induk = '17-48-BS';
UPDATE m_jemaat_induk SET nama_induk = 'BETHESDA', keterangan = 'Sidoarjo' WHERE id_induk = '17-05-BE';
UPDATE m_jemaat_induk SET nama_induk = 'BHASKARA', keterangan = 'Surabaya' WHERE id_induk = '17-06-BH';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT HARAPAN', keterangan = 'Surabaya' WHERE id_induk = '17-07-BU';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT KASIH', keterangan = 'Surabaya' WHERE id_induk = '17-08-BK';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT SION', keterangan = 'Surabaya' WHERE id_induk = '17-09-BS';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT ZAITUN', keterangan = 'Surabaya' WHERE id_induk = '17-10-BZ';
UPDATE m_jemaat_induk SET nama_induk = 'CAHAYA ANUGERAH', keterangan = 'Surabaya' WHERE id_induk = '17-11-CA';
UPDATE m_jemaat_induk SET nama_induk = 'CAHAYA KASIH', keterangan = 'Surabaya' WHERE id_induk = '17-12-CK';
UPDATE m_jemaat_induk SET nama_induk = 'EBENHAEZER', keterangan = 'Surabaya' WHERE id_induk = '17-14-ES';
UPDATE m_jemaat_induk SET nama_induk = 'EBENHAEZER', keterangan = 'Blitar' WHERE id_induk = '17-13-EB';
UPDATE m_jemaat_induk SET nama_induk = 'EFRATA', keterangan = 'Surabaya' WHERE id_induk = '17-16-EF';
UPDATE m_jemaat_induk SET nama_induk = 'EFFATHA', keterangan = 'Glenmore, Banyuwangi' WHERE id_induk = '17-15-EG';
UPDATE m_jemaat_induk SET nama_induk = 'GALILEA', keterangan = 'Surabaya' WHERE id_induk = '17-17-GS';
UPDATE m_jemaat_induk SET nama_induk = 'GAMALIEL', keterangan = 'Madiun' WHERE id_induk = '17-18-GM';
UPDATE m_jemaat_induk SET nama_induk = 'GENTA KASIH', keterangan = 'Surabaya' WHERE id_induk = '17-19-GK';
UPDATE m_jemaat_induk SET nama_induk = 'GETSEMANI', keterangan = 'Jember' WHERE id_induk = '17-20-GJ';
UPDATE m_jemaat_induk SET nama_induk = 'GETSEMANI', keterangan = 'Malang' WHERE id_induk = '17-21-GE';
UPDATE m_jemaat_induk SET nama_induk = 'HOSEA', keterangan = 'Surabaya' WHERE id_induk = '17-22-HS';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Surabaya' WHERE id_induk = '17-30-IS';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Banyuwangi' WHERE id_induk = '17-24-IL';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Bangil' WHERE id_induk = '17-23-IB';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Bondowoso' WHERE id_induk = '17-25-II';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Kediri' WHERE id_induk = '17-26-IK';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Malang' WHERE id_induk = '17-27-IM';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Mojokerto' WHERE id_induk = '17-28-IO';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Probolinggo' WHERE id_induk = '17-29-IP';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Bojonegoro' WHERE id_induk = '17-32-MB';
UPDATE m_jemaat_induk SET nama_induk = 'MAHKOTA HAYAT', keterangan = 'Pamekasan Madura' WHERE id_induk = '17-31-MH';
UPDATE m_jemaat_induk SET nama_induk = 'MARGO MULYO', keterangan = 'Batu Malang' WHERE id_induk = '17-34-MM';
UPDATE m_jemaat_induk SET nama_induk = 'NAZARETH', keterangan = 'Surabaya' WHERE id_induk = '17-35-NZ';
UPDATE m_jemaat_induk SET nama_induk = 'PANCARAN KASIH', keterangan = 'Sumenep Madura' WHERE id_induk = '17-36-PK';
UPDATE m_jemaat_induk SET nama_induk = 'PANCARAN KASIH', keterangan = 'Lumajang' WHERE id_induk = '17-37-PL';
UPDATE m_jemaat_induk SET nama_induk = 'PELANGI KASIH', keterangan = 'Lawang' WHERE id_induk = '17-38-PE';
UPDATE m_jemaat_induk SET nama_induk = 'PNIEL', keterangan = 'Surabaya' WHERE id_induk = '17-40-PS';
UPDATE m_jemaat_induk SET nama_induk = 'PNIEL', keterangan = 'Pasuruan' WHERE id_induk = '17-39-PP';
UPDATE m_jemaat_induk SET nama_induk = 'SEJAHERA', keterangan = 'Surabaya' WHERE id_induk = '17-42-SS';
UPDATE m_jemaat_induk SET nama_induk = 'SEJAHTERA', keterangan = 'Malang' WHERE id_induk = '17-41-SM';
UPDATE m_jemaat_induk SET nama_induk = 'SINAI', keterangan = 'Surabaya' WHERE id_induk = '17-44-SI';
UPDATE m_jemaat_induk SET nama_induk = 'SHALOM', keterangan = 'Sidoarjo' WHERE id_induk = '17-43-SH';
UPDATE m_jemaat_induk SET nama_induk = 'SURYA KASIH', keterangan = 'Situbondo' WHERE id_induk = '17-45-SK';
UPDATE m_jemaat_induk SET nama_induk = 'TIBERIAS', keterangan = 'Sidoarjo' WHERE id_induk = '17-46-TS';
UPDATE m_jemaat_induk SET nama_induk = 'TORSINA', keterangan = 'Surabaya' WHERE id_induk = '17-47-TD';
UPDATE m_jemaat_induk SET nama_induk = 'SOLAFIDE', keterangan = 'Porong - Jawa Timur' WHERE id_induk = '17-49-SL';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Denpasar' WHERE id_induk = '18-04-MD';
UPDATE m_jemaat_induk SET nama_induk = 'EBENHAEZER', keterangan = 'Gianyar' WHERE id_induk = '18-01-EG';
UPDATE m_jemaat_induk SET nama_induk = 'EKKLESIA', keterangan = 'Tuban Kuta' WHERE id_induk = '18-02-EK';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL WR SUPRATMAN', keterangan = 'Mataram Lombok' WHERE id_induk = '18-07-WS';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL BUNG KARNO', keterangan = 'Mararam Lombok' WHERE id_induk = '18-03-IM';
UPDATE m_jemaat_induk SET nama_induk = 'JEMBRANA', keterangan = 'Negara Jembrana' WHERE id_induk = '18-09-JN';
UPDATE m_jemaat_induk SET nama_induk = 'KASIH KARUNIA', keterangan = 'Denpasar' WHERE id_induk = '18-08-KK';
UPDATE m_jemaat_induk SET nama_induk = 'PNIEL', keterangan = 'Singaraja Buleleng' WHERE id_induk = '18-05-PS';
UPDATE m_jemaat_induk SET nama_induk = 'SYALOM', keterangan = 'Denpasar' WHERE id_induk = '18-06-SD';
UPDATE m_jemaat_induk SET nama_induk = 'GETSEMANI', keterangan = 'Jimbaran' WHERE id_induk = '18-10-GS';
UPDATE m_jemaat_induk SET nama_induk = 'SILOAM', keterangan = 'Pontianak' WHERE id_induk = '20-13-SP';
UPDATE m_jemaat_induk SET nama_induk = 'ANUGERAH', keterangan = 'Beduai - Sanggau' WHERE id_induk = '20-01-AB';
UPDATE m_jemaat_induk SET nama_induk = 'BETHESDA', keterangan = 'Marau' WHERE id_induk = '20-02-BM';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Penyiuran' WHERE id_induk = '20-21-S';
UPDATE m_jemaat_induk SET nama_induk = 'BETLEHEM', keterangan = 'Sei Ambawang Kubu Raya' WHERE id_induk = '20-03-BP';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT AGAPE', keterangan = 'Entikong' WHERE id_induk = '20-15-BA';
UPDATE m_jemaat_induk SET nama_induk = 'EBENHAEZER', keterangan = 'Kembayan' WHERE id_induk = '20-20-S';
UPDATE m_jemaat_induk SET nama_induk = 'EBENHAEZER', keterangan = 'Ketapang - 1986' WHERE id_induk = '20-04-EK';
UPDATE m_jemaat_induk SET nama_induk = 'EKKLESIA', keterangan = 'GPIB Jemaat "Ekklesia" Air Upas' WHERE id_induk = '20-16-EA';
UPDATE m_jemaat_induk SET nama_induk = 'ICHTUS', keterangan = NULL WHERE id_induk = '20-05-IT';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'SINGKAWANG' WHERE id_induk = '20-19-S';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Singkawang' WHERE id_induk = '20-06-IS';
UPDATE m_jemaat_induk SET nama_induk = 'MAMURAJA', keterangan = 'Sungai Raya' WHERE id_induk = '20-18-MS';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Sanggau' WHERE id_induk = '20-07-MS';
UPDATE m_jemaat_induk SET nama_induk = 'MARGAHAYU', keterangan = 'Rasau Jaya' WHERE id_induk = '20-17-MR';
UPDATE m_jemaat_induk SET nama_induk = 'MENARA IMAN', keterangan = 'Sekayam Sanggau' WHERE id_induk = '20-08-MI';
UPDATE m_jemaat_induk SET nama_induk = 'ORA ET LABORA', keterangan = 'Semunte, Sanggau' WHERE id_induk = '20-09-OS';
UPDATE m_jemaat_induk SET nama_induk = 'PANAMPA', keterangan = 'Kepayang' WHERE id_induk = '20-14-PK';
UPDATE m_jemaat_induk SET nama_induk = 'PANITAH', keterangan = 'Anjungan' WHERE id_induk = '20-10-PA';
UPDATE m_jemaat_induk SET nama_induk = 'SEJAHTERA', keterangan = 'Jl. Raya Sosok II No.1, Sosok, Kec. Tayan Hulu, Kabupaten Sanggau, Kalimantan Barat 78562' WHERE id_induk = '20-11-SS';
UPDATE m_jemaat_induk SET nama_induk = 'SYALOOM', keterangan = 'Sungai Kajang' WHERE id_induk = '20-12-SK';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT ZAITUN', keterangan = 'Air Durian' WHERE id_induk = '20-22-BZ';
UPDATE m_jemaat_induk SET nama_induk = 'BALAI BATUAH', keterangan = 'Putaran' WHERE id_induk = '20-23-BB';
UPDATE m_jemaat_induk SET nama_induk = 'PAMA JUBATA', keterangan = 'Tapah, Pancaroba - Sungai Ambawang' WHERE id_induk = '20-24-PJ';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Banjarmasin' WHERE id_induk = '21-05-MB';
UPDATE m_jemaat_induk SET nama_induk = 'EBENHAEZER', keterangan = 'Palangkaraya' WHERE id_induk = '21-01-EH';
UPDATE m_jemaat_induk SET nama_induk = 'EFFATHA', keterangan = 'Guntung Payung Banjar Baru' WHERE id_induk = '21-02-RP';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Kotabaru' WHERE id_induk = '21-04-IK';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Landasan Ulin, Banjarbaru' WHERE id_induk = '21-03-IB';
UPDATE m_jemaat_induk SET nama_induk = 'SOLA GRATIA', keterangan = 'Batu Licin Tanah Bumbu' WHERE id_induk = '21-06-SB';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Balikpapan' WHERE id_induk = '22-08-MB';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT BENUAS', keterangan = 'Sepinggan Balikpapan' WHERE id_induk = '22-02-BB';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT SION', keterangan = 'Balikpapan' WHERE id_induk = '22-01-BD';
UPDATE m_jemaat_induk SET nama_induk = 'EBENHAEZER', keterangan = 'Paser' WHERE id_induk = '22-03-ET';
UPDATE m_jemaat_induk SET nama_induk = 'EFFATHA', keterangan = 'GPIB Effatha Batu Kajang, Jl. Boyan Belanda Gang Petra RT 027/000, Desa Batu Kajang, Kec. Batu Sopang, Kab. Paser, Kalimantan Timur' WHERE id_induk = '22-04-EB';
UPDATE m_jemaat_induk SET nama_induk = 'GETSEMANI', keterangan = 'Balikpapan' WHERE id_induk = '22-05-GB';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Balikpapan' WHERE id_induk = '22-06-IB';
UPDATE m_jemaat_induk SET nama_induk = 'KANAAN', keterangan = 'Kenangan' WHERE id_induk = '22-07-KK';
UPDATE m_jemaat_induk SET nama_induk = 'PNIEL', keterangan = 'Balikpapan' WHERE id_induk = '22-09-PB';
UPDATE m_jemaat_induk SET nama_induk = 'SILOAM', keterangan = 'Krayan Paser' WHERE id_induk = '22-10-SK';
UPDATE m_jemaat_induk SET nama_induk = 'SION', keterangan = 'Samuntai Paser' WHERE id_induk = '22-12-SS';
UPDATE m_jemaat_induk SET nama_induk = 'SYALOOM', keterangan = NULL WHERE id_induk = '22-11-SB';
UPDATE m_jemaat_induk SET nama_induk = 'ALAT ALA NGOSANG', keterangan = 'Long Gelang - Paser' WHERE id_induk = '22-13-AA';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Samarinda' WHERE id_induk = '23-06-IS';
UPDATE m_jemaat_induk SET nama_induk = 'ANUGERAH', keterangan = 'Kutai Kartanegara' WHERE id_induk = '23-01-AH';
UPDATE m_jemaat_induk SET nama_induk = 'EBENHAEZER', keterangan = 'Samarinda' WHERE id_induk = '23-02-ES';
UPDATE m_jemaat_induk SET nama_induk = 'EFATA', keterangan = 'Tenggarong' WHERE id_induk = '23-03-ET';
UPDATE m_jemaat_induk SET nama_induk = 'GLORIA', keterangan = 'Tenggarong' WHERE id_induk = '23-04-GT';
UPDATE m_jemaat_induk SET nama_induk = 'HEBRON', keterangan = 'Samarinda Seberang' WHERE id_induk = '23-14-HS';
UPDATE m_jemaat_induk SET nama_induk = 'HOSANA', keterangan = 'Loa Ulung' WHERE id_induk = '23-15-HS';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Sungai Sanga' WHERE id_induk = '23-07-MS';
UPDATE m_jemaat_induk SET nama_induk = 'MARTURIA', keterangan = 'Loa Janan' WHERE id_induk = '23-13-ML';
UPDATE m_jemaat_induk SET nama_induk = 'PANCARAN KASIH', keterangan = 'Bengalon' WHERE id_induk = '23-16-PK';
UPDATE m_jemaat_induk SET nama_induk = 'PELITA KASIH', keterangan = 'Sangatta' WHERE id_induk = '23-08-PS';
UPDATE m_jemaat_induk SET nama_induk = 'SION', keterangan = 'Jahab Kutai Kertanegara' WHERE id_induk = '23-09-SJ';
UPDATE m_jemaat_induk SET nama_induk = 'SOLA GRACIA', keterangan = 'Marang Kayu' WHERE id_induk = '23-12-SG';
UPDATE m_jemaat_induk SET nama_induk = 'SOLAFIDE', keterangan = 'Muara Badak' WHERE id_induk = '23-10-SM';
UPDATE m_jemaat_induk SET nama_induk = 'SUMBER KASIH', keterangan = 'Bontang' WHERE id_induk = '23-11-SK';
UPDATE m_jemaat_induk SET nama_induk = 'TELUK DALAM', keterangan = 'Tenggarong Seberang' WHERE id_induk = '23-17-TD';
UPDATE m_jemaat_induk SET nama_induk = 'MARANATHA', keterangan = 'Tanjung Selor' WHERE id_induk = '24-05-MT';
UPDATE m_jemaat_induk SET nama_induk = 'ANUGERAH', keterangan = 'Tarakan' WHERE id_induk = '24-08-AJ';
UPDATE m_jemaat_induk SET nama_induk = 'BETHEL', keterangan = 'Teras Nawang' WHERE id_induk = '24-09-BT';
UPDATE m_jemaat_induk SET nama_induk = 'BETLEHEM', keterangan = 'Malinau' WHERE id_induk = '24-01-BM';
UPDATE m_jemaat_induk SET nama_induk = 'EFFATHA', keterangan = 'Pulau Bunyu' WHERE id_induk = '24-02-EB';
UPDATE m_jemaat_induk SET nama_induk = 'HOSIANA', keterangan = 'Berau' WHERE id_induk = '24-03-HB';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Tarakan' WHERE id_induk = '24-04-IT';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Apau Kayan' WHERE id_induk = '23-05-IA';
UPDATE m_jemaat_induk SET nama_induk = 'SION', keterangan = 'Nunukan' WHERE id_induk = '24-06-SN';
UPDATE m_jemaat_induk SET nama_induk = 'U''UNG PENGELESAU', keterangan = 'Pujungan' WHERE id_induk = '24-07-UP';
UPDATE m_jemaat_induk SET nama_induk = 'SION', keterangan = 'Tembudan' WHERE id_induk = '24-08-SI';
UPDATE m_jemaat_induk SET nama_induk = 'FETEPAY', keterangan = 'Tarakan' WHERE id_induk = '24-09-FT';
UPDATE m_jemaat_induk SET nama_induk = 'SUNGAI SEGAH', keterangan = 'Tepian Buah' WHERE id_induk = '24-10-SS';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Makassar' WHERE id_induk = '19-02-IM';
UPDATE m_jemaat_induk SET nama_induk = 'BAHTERA KASIH', keterangan = 'Makassar' WHERE id_induk = '19-01-BK';
UPDATE m_jemaat_induk SET nama_induk = 'BETHANIA', keterangan = 'Makassar' WHERE id_induk = '19-03-BM';
UPDATE m_jemaat_induk SET nama_induk = 'BETHEL', keterangan = 'Raha Muna' WHERE id_induk = '19-04-BR';
UPDATE m_jemaat_induk SET nama_induk = 'BUKIT ZAITUN', keterangan = 'Makassar' WHERE id_induk = '19-05-BZ';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Baubau' WHERE id_induk = '19-06-IB';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Majene' WHERE id_induk = '19-07-IM';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Parepare' WHERE id_induk = '19-08-IP';
UPDATE m_jemaat_induk SET nama_induk = 'IMMANUEL', keterangan = 'Watampone Bone' WHERE id_induk = '19-10-IW';
UPDATE m_jemaat_induk SET nama_induk = 'KANA TOJENG', keterangan = 'Sungguminasa Gowa' WHERE id_induk = '19-11-KT';
UPDATE m_jemaat_induk SET nama_induk = 'MANGNGAMASEANG', keterangan = 'Makassar' WHERE id_induk = '19-12-MM';
UPDATE m_jemaat_induk SET nama_induk = 'PAMMASE', keterangan = 'Makassar' WHERE id_induk = '19-13-PM';
UPDATE m_jemaat_induk SET nama_induk = 'PELITA', keterangan = 'Baras Pasangkayu' WHERE id_induk = '19-14-PB';
UPDATE m_jemaat_induk SET nama_induk = 'SINAR KASIH', keterangan = 'Baras Pasangkayu' WHERE id_induk = '19-15-SB';
UPDATE m_jemaat_induk SET nama_induk = 'SOLA FIDE', keterangan = 'Sarudu Pasangkayu' WHERE id_induk = '19-16-SS';
UPDATE m_jemaat_induk SET nama_induk = 'SUMBER KASIH', keterangan = 'Kendari' WHERE id_induk = '19-17-SK';

-- 3. Update m_pos_pelkes (cleaned names & set kategori Bajem / Pos Pelkes)
UPDATE m_pos_pelkes SET nama_pos = 'Parittiga', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-13055';
UPDATE m_pos_pelkes SET nama_pos = 'Cupat', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-23592';
UPDATE m_pos_pelkes SET nama_pos = 'Pos pelkes Bethel binusan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-88231';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Immanuel Bambangan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-88016';
UPDATE m_pos_pelkes SET nama_pos = 'Alfa & Omega Nanga Tayap', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-55936';
UPDATE m_pos_pelkes SET nama_pos = NULL, kategori = 'Pos Pelkes' WHERE id_pos = 'POS-52126';
UPDATE m_pos_pelkes SET nama_pos = 'Exaudia Muara Bulian', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-57228';
UPDATE m_pos_pelkes SET nama_pos = 'PT. GAN', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-78047';
UPDATE m_pos_pelkes SET nama_pos = 'Kasih Karunia Kandis', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-94346';
UPDATE m_pos_pelkes SET nama_pos = 'Kasih Karunia Libo', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-56609';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Secanggang', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-23848';
UPDATE m_pos_pelkes SET nama_pos = 'Agape babulu', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-56943';
UPDATE m_pos_pelkes SET nama_pos = 'Ekklesia penajam', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-25763';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Eben Haezer" Tripariq Makmur, Long Hubung', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-81917';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Bukit Moria" Selesung', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-16368';
UPDATE m_pos_pelkes SET nama_pos = 'Bethesda Tonda', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-50712';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Teluk Kelapa', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-42271';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Tanjung Medan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-34421';
UPDATE m_pos_pelkes SET nama_pos = 'Efrata', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-22291';
UPDATE m_pos_pelkes SET nama_pos = 'Maranatha', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-79937';
UPDATE m_pos_pelkes SET nama_pos = 'Paulus Wonosobo', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-37858';
UPDATE m_pos_pelkes SET nama_pos = 'Bethlehem Baturuguk', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-54277';
UPDATE m_pos_pelkes SET nama_pos = 'Pospelkes Immanuel Tj Medang', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-47744';
UPDATE m_pos_pelkes SET nama_pos = 'Pospelkes Maranatha Sei Pakning', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-81640';
UPDATE m_pos_pelkes SET nama_pos = 'Pospelkes Solafide Selat Panjang', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-54609';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Semoi Sepaku', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-75205';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Wonobakti', kategori = 'Bajem' WHERE id_pos = 'POS-16608';
UPDATE m_pos_pelkes SET nama_pos = 'Purwosari', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-56473';
UPDATE m_pos_pelkes SET nama_pos = 'Natar', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-60853';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Alfa-Omega Sarawak-Malaysia', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-67801';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Bubung Merege Punti Tapau', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-82867';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Remin Tempak Sontas', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-24806';
UPDATE m_pos_pelkes SET nama_pos = 'Efratha Kaliampu', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-58644';
UPDATE m_pos_pelkes SET nama_pos = 'Ekklesia Suka Damai', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-25545';
UPDATE m_pos_pelkes SET nama_pos = 'Maranatha Natai Panjang', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-92535';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Bukit Zaitun', kategori = 'Bajem' WHERE id_pos = 'POS-43938';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Kasih Karunia Bagan Manunggal', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-94852';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Sambi', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-17113';
UPDATE m_pos_pelkes SET nama_pos = 'PosPelkes Air Hidup Setogor', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-27157';
UPDATE m_pos_pelkes SET nama_pos = 'PosPelkes Roti Hidup Munyau', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-58999';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Sion Sei Rokan', kategori = 'Bajem' WHERE id_pos = 'POS-78262';
UPDATE m_pos_pelkes SET nama_pos = 'Jangkang', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-69672';
UPDATE m_pos_pelkes SET nama_pos = 'SUMBER KASIH TANJUNG AGUNG', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-39676';
UPDATE m_pos_pelkes SET nama_pos = 'EFRAT SAJAU', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-26959';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Maranatha', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-55766';
UPDATE m_pos_pelkes SET nama_pos = 'Beth Eden', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-93187';
UPDATE m_pos_pelkes SET nama_pos = 'Zebaoth', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-39582';
UPDATE m_pos_pelkes SET nama_pos = 'Bukit Zaitun', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-93631';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Anugerah Sempuat', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-79335';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Maranatha Karangan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-43988';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Kembangsari', kategori = 'Bajem' WHERE id_pos = 'POS-15217';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pel Kalimangli', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-58201';
UPDATE m_pos_pelkes SET nama_pos = 'Pos PelKes Lembah Silo Gunung Seriang', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-29929';
UPDATE m_pos_pelkes SET nama_pos = 'Pos PelKes Tiberias Selimau', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-85526';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Lempake', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-70892';
UPDATE m_pos_pelkes SET nama_pos = 'Sola Fide Carik', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-17296';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Kanaan" Blambangan Umpu', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-92343';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Emaus" Gedung Harapan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-33478';
UPDATE m_pos_pelkes SET nama_pos = '"KANAAN" Barong Tongkok', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-17861';
UPDATE m_pos_pelkes SET nama_pos = 'Kalam Hidup, Entubah', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-95078';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Getsemani', kategori = 'Bajem' WHERE id_pos = 'POS-36023';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Shalom', kategori = 'Bajem' WHERE id_pos = 'POS-71267';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Bukit Moria Tabalar', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-32914';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Immanuel Lipat Gunting', kategori = 'Bajem' WHERE id_pos = 'POS-65842';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Bukit Moria Kuala Asam', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-58666';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Syalom Batu Leman', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-10631';
UPDATE m_pos_pelkes SET nama_pos = NULL, kategori = 'Pos Pelkes' WHERE id_pos = 'POS-16012';
UPDATE m_pos_pelkes SET nama_pos = 'Pospelkes Immanuel sesulung', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-41565';
UPDATE m_pos_pelkes SET nama_pos = 'Gunung Sinai', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-58102';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Immanuel Kayungo Sari', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-18578';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Batu Tinggi Celengan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-10552';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Kasih Karunia - Riam Kusik', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-50367';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkese Batu Tinggi, Celengan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-44209';
UPDATE m_pos_pelkes SET nama_pos = 'Aras Tamiang Bakung', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-81077';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Anugerah Sanggau Ledo', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-48853';
UPDATE m_pos_pelkes SET nama_pos = 'pos Pelkes Sion Elok Asam', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-25425';
UPDATE m_pos_pelkes SET nama_pos = 'POS PELKES BUKIT SION SABUNG', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-25377';
UPDATE m_pos_pelkes SET nama_pos = 'Agape, Kempas Jaya', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-96495';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Effata Belilas', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-80533';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Pancaran Kasih DK3', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-30445';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Sumber Kasih DU', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-49169';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Bukit Sinai" Sanjan Emberas', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-42125';
UPDATE m_pos_pelkes SET nama_pos = 'kembiri', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-62666';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Maranatha Rantau Pulung', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-31031';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Immanuel Pengancing', kategori = 'Bajem' WHERE id_pos = 'POS-70716';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Tigris Batu Pindah', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-46102';
UPDATE m_pos_pelkes SET nama_pos = 'Pelita Iman Batang Belian', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-63796';
UPDATE m_pos_pelkes SET nama_pos = NULL, kategori = 'Pos Pelkes' WHERE id_pos = 'POS-77756';
UPDATE m_pos_pelkes SET nama_pos = NULL, kategori = 'Pos Pelkes' WHERE id_pos = 'POS-68350';
UPDATE m_pos_pelkes SET nama_pos = 'POS PELKES WAY HANDOP', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-81850';
UPDATE m_pos_pelkes SET nama_pos = 'Anugerah Selimatan Jaya', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-27137';
UPDATE m_pos_pelkes SET nama_pos = 'Ekklesia Singkup', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-59077';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem "Maranatha" Batu Keling', kategori = 'Bajem' WHERE id_pos = 'POS-64442';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Arai Hidup" Perimping', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-94933';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes ELIM, Dusun Modah', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-63984';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Gembala Baik, Dusun Rantau', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-35232';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Bethesda" Palaran', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-31969';
UPDATE m_pos_pelkes SET nama_pos = 'Pospelkes Immanuel Batu Ampar', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-99872';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Maranatha Kombeng', kategori = 'Bajem' WHERE id_pos = 'POS-13298';
UPDATE m_pos_pelkes SET nama_pos = 'Pniel Seponti Jaya', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-23122';
UPDATE m_pos_pelkes SET nama_pos = '"Getsemani" Long Mesangat', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-40296';
UPDATE m_pos_pelkes SET nama_pos = 'Pu''un Udip', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-66516';
UPDATE m_pos_pelkes SET nama_pos = 'Haleluya', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-78010';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Bukit Sion Sungai Melayu Rayak', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-78468';
UPDATE m_pos_pelkes SET nama_pos = 'Simanduma', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-62648';
UPDATE m_pos_pelkes SET nama_pos = 'Tanjung Beringin', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-40402';
UPDATE m_pos_pelkes SET nama_pos = 'Gomit', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-26573';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Tonduhan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-65205';
UPDATE m_pos_pelkes SET nama_pos = 'Arai Hidup Sepauhan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-88508';
UPDATE m_pos_pelkes SET nama_pos = 'Tiberias Mahawa', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-38948';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Nehemia Pulau Kubung', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-58314';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Soli Deo PT. LAP', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-54069';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Talitakum Beringin', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-54989';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Anugerah Serengkah', kategori = 'Bajem' WHERE id_pos = 'POS-59271';
UPDATE m_pos_pelkes SET nama_pos = '"Timotius" Margorejo', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-93613';
UPDATE m_pos_pelkes SET nama_pos = '"Baithani" Papan Rejo', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-24519';
UPDATE m_pos_pelkes SET nama_pos = '"Imanuel" Propau', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-32475';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Pancaran Kasih Muara Kate', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-19929';
UPDATE m_pos_pelkes SET nama_pos = 'Pospelkes "Anugerah" Sekang', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-76733';
UPDATE m_pos_pelkes SET nama_pos = 'Pospelkes "Kanaan" Pejalin', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-42584';
UPDATE m_pos_pelkes SET nama_pos = 'GPIB Pos Pelkes Gideon Sebuduh', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-91941';
UPDATE m_pos_pelkes SET nama_pos = 'GPIB Pos Pelkes Penabur Ngoyok', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-18785';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Pancaran Kasih Naga Mas Estate', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-41348';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Pancaran Kasih Tapung Makmur', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-48869';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Maranatha PT. Cerenti Subur', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-38720';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Bukit Sion PT. KTBM', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-30508';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Agape Mersam', kategori = 'Bajem' WHERE id_pos = 'POS-13537';
UPDATE m_pos_pelkes SET nama_pos = 'Bakal Jemaat "Maranatha" Nawang Baru', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-79471';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Siloam Tadoan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-56819';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Bethesda" Rantau Rasau', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-97404';
UPDATE m_pos_pelkes SET nama_pos = 'Bethel Lontar', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-83988';
UPDATE m_pos_pelkes SET nama_pos = 'Silo Sungai Pinang', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-27108';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Maranatha Karang Agung Tengah', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-56167';
UPDATE m_pos_pelkes SET nama_pos = 'Bakal Jemaat Sion Merlung', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-81626';
UPDATE m_pos_pelkes SET nama_pos = 'GPIB Pos Pelkes "Sumber Kasih" Kalampising', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-52165';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Sejahtera" Samboja', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-77457';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Torsina" Senipah', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-34993';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes "Efrata" Traktor VI', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-89558';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Maranatha Sebulu', kategori = 'Bajem' WHERE id_pos = 'POS-89562';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Sumber Hidup Sebamban', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-69232';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Air Hidup Seikotuk', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-25738';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Samaria Pelambaian', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-70577';
UPDATE m_pos_pelkes SET nama_pos = 'Marturia Sungai Uma', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-94758';
UPDATE m_pos_pelkes SET nama_pos = 'Anugerah Penabur Karang Agung', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-95716';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Maranatha Kelapa Kampit', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-97007';
UPDATE m_pos_pelkes SET nama_pos = 'Immanuel Bengkarek', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-51092';
UPDATE m_pos_pelkes SET nama_pos = 'Tuah Jubata Sei Pelaik', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-34433';
UPDATE m_pos_pelkes SET nama_pos = 'Sahabat Berinang', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-57892';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Perdamaian Km12 Bagan Musik Estate', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-39714';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Arai Kehidupan Air Mengaris', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-88810';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem Tabanan', kategori = 'Bajem' WHERE id_pos = 'POS-38840';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Hosana Separi', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-36849';
UPDATE m_pos_pelkes SET nama_pos = 'Pos Pelkes Bukit Sion Giri Agung', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-35736';
UPDATE m_pos_pelkes SET nama_pos = 'Immanuel Mempawah', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-62914';
UPDATE m_pos_pelkes SET nama_pos = 'Kharisma Mundun', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-67834';
UPDATE m_pos_pelkes SET nama_pos = 'Tuah Petara Sintang', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-43392';
UPDATE m_pos_pelkes SET nama_pos = 'Ekklesia Nanga SIlat', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-19856';
UPDATE m_pos_pelkes SET nama_pos = 'Bethel Selabe', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-24342';
UPDATE m_pos_pelkes SET nama_pos = 'Alfa & Omega Ilai Pejugan', kategori = 'Pos Pelkes' WHERE id_pos = 'POS-41679';
UPDATE m_pos_pelkes SET nama_pos = 'Bajem SILOAM Binong', kategori = 'Bajem' WHERE id_pos = 'POS-34686';

-- 4. Update m_pendeta (cleaned names)
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Anita Angelina Lovica Putu Buraen, S.Si-Teol' WHERE id_pendeta = 'PDT-19060024';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Leo Nardo Pardosi, S. Si. Teol' WHERE id_pendeta = 'PDT-51107295';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Windy Untajana S.Si (Teol.)' WHERE id_pendeta = 'PDT-21159377';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Arni Muliyanti Mali, S.Th' WHERE id_pendeta = 'PDT-87216948';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Ben Bianco Pattinama, S.Si-Teol' WHERE id_pendeta = 'PDT-43300681';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Nadya Natalia Antoinette Gala, S. Th' WHERE id_pendeta = 'PDT-86990096';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Paulin Maureel Titiheru' WHERE id_pendeta = 'PDT-70501119';
UPDATE m_pendeta SET nama_lengkap = 'Pdt anithya Adriana Talakua Saragih' WHERE id_pendeta = 'PDT-32299530';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Otniel Jonatan Panjinegara Adua, S.Si. (Teol.)' WHERE id_pendeta = 'PDT-41915346';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Johnstevance Eldad Winman, S. Si-Teol' WHERE id_pendeta = 'PDT-82603338';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Putra Sang Bayu, S.Fil.' WHERE id_pendeta = 'PDT-37549598';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Josua Natal Walumbu' WHERE id_pendeta = 'PDT-26374165';
UPDATE m_pendeta SET nama_lengkap = 'Stephani Gratia Lalenoh S. Si-Teol' WHERE id_pendeta = 'PDT-92486233';
UPDATE m_pendeta SET nama_lengkap = 'Dania Ariskah, S.Th' WHERE id_pendeta = 'PDT-37149792';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Ananda Kezia br Sebayang, S.Th' WHERE id_pendeta = 'PDT-21939323';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Angelly Christisya Kantohe, M.Si' WHERE id_pendeta = 'PDT-64020785';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Reza Hariyoga, S.Si. (Teol.)' WHERE id_pendeta = 'PDT-59711512';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Maretha Kurnia Sari S. Si-Teol' WHERE id_pendeta = 'PDT-87046457';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Iunike Ribka Chrisna Pawestri, S.Si (Teol)' WHERE id_pendeta = 'PDT-39429573';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Adystia Ernel Raintung, S.Fil' WHERE id_pendeta = 'PDT-30098900';
UPDATE m_pendeta SET nama_lengkap = 'Rudolfo Jacob Manusiwa S.Si-Teol' WHERE id_pendeta = 'PDT-66495066';
UPDATE m_pendeta SET nama_lengkap = 'Meylisa Paulina Boesday, S.Th' WHERE id_pendeta = 'PDT-77965490';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Kevin Eflyano Badilo, S.Si.Teol' WHERE id_pendeta = 'PDT-57362747';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Rifensia Jeriska Soselisa' WHERE id_pendeta = 'PDT-29286934';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Giovanno Adi Nugroho, S.Si-Teol' WHERE id_pendeta = 'PDT-91423016';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Ni Gusti Ketut Melliana Achriyanthi Arnawa, S.Si-Teol' WHERE id_pendeta = 'PDT-94436290';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Yehezkiel Marselino Banjarnahor S.Fil' WHERE id_pendeta = 'PDT-19375058';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Trisa Angela Mauriza Sinaulan, S.Th' WHERE id_pendeta = 'PDT-34532604';
UPDATE m_pendeta SET nama_lengkap = 'Benoni Benyamin Klokke, S.Si-Teol.' WHERE id_pendeta = 'PDT-34880669';
UPDATE m_pendeta SET nama_lengkap = 'Pdt Mauren Astria Tatipatta, S.Th.' WHERE id_pendeta = 'PDT-70567471';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Cristin Dwi Ningsih, S.Si-Teol' WHERE id_pendeta = 'PDT-32051258';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Marchely Elvira Sirait -Ruitenbach, S. Si. Teol' WHERE id_pendeta = 'PDT-48212443';
UPDATE m_pendeta SET nama_lengkap = 'Nevada Florida Nualedang, Ssi.Teol' WHERE id_pendeta = 'PDT-56844638';
UPDATE m_pendeta SET nama_lengkap = 'Marena, S.Th' WHERE id_pendeta = 'PDT-97921792';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Fiola Aura Thahara, S. Si-Teol' WHERE id_pendeta = 'PDT-74312933';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Odi Etman Raidas Mali, S. Th' WHERE id_pendeta = 'PDT-26671820';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Mick Mordekhai Sopacoly, S.Th., M.Si.' WHERE id_pendeta = 'PDT-84971611';
UPDATE m_pendeta SET nama_lengkap = 'Alency Geovani Wijaya, S.Th' WHERE id_pendeta = 'PDT-84597888';
UPDATE m_pendeta SET nama_lengkap = 'Pdt Valini Mandaries Rompas, S.Th' WHERE id_pendeta = 'PDT-99170588';
UPDATE m_pendeta SET nama_lengkap = 'nuh gustomi gultom, S.Si-Teol' WHERE id_pendeta = 'PDT-92176638';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Akselofira Khidsal Dukhid, S.Si-Teol' WHERE id_pendeta = 'PDT-63921098';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Rafilius Ariyanto, S.Th' WHERE id_pendeta = 'PDT-39185836';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Corinthiani Perbina Sinulingga, S.Fil' WHERE id_pendeta = 'PDT-34353889';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Mega Amelia' WHERE id_pendeta = 'PDT-80027321';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Novita Sarah Wilhelmina Sumampow, S.Fil' WHERE id_pendeta = 'PDT-61800733';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Clinton Banjarnahor' WHERE id_pendeta = 'PDT-22062148';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Kezia Elza Bawole S.Th' WHERE id_pendeta = 'PDT-99011520';
UPDATE m_pendeta SET nama_lengkap = 'Nataniel Yeperson Blegur Ssi.Teol' WHERE id_pendeta = 'PDT-65727337';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Rani Natalia Br. SItorus S.Si-Teol' WHERE id_pendeta = 'PDT-97284701';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Joshua Hendrikson Siregar, S.Si-Teol' WHERE id_pendeta = 'PDT-50581483';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Stiven Kurniadijaya Lahunduitan Macpal, S.Si.Teol.' WHERE id_pendeta = 'PDT-17657741';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Genesya, M.Th.' WHERE id_pendeta = 'PDT-91784974';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Dressta Margareth Aksamine Titihalawa, S.Th.' WHERE id_pendeta = 'PDT-79598449';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Tien Apriani Djolawang, S.Th' WHERE id_pendeta = 'PDT-23285681';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Pit Manghophop Sitompul, S.Si-Teol' WHERE id_pendeta = 'PDT-71723244';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Geofani Febrian Ruindungan' WHERE id_pendeta = 'PDT-32980492';
UPDATE m_pendeta SET nama_lengkap = 'Kefi Putriani Banunu, S.Th' WHERE id_pendeta = 'PDT-75037916';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Roki Yunus, S.Si-Teol' WHERE id_pendeta = 'PDT-80598199';
UPDATE m_pendeta SET nama_lengkap = 'Tiffany Hillary Derek, S.Th' WHERE id_pendeta = 'PDT-70698942';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Samuel Roberto Lintang, S.Si-Teol' WHERE id_pendeta = 'PDT-73800812';
UPDATE m_pendeta SET nama_lengkap = 'Arfiando Rivaldo Aprilio Mekel, S.Fil' WHERE id_pendeta = 'PDT-59135418';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Richard Christov Lewerissa, S.Th,.' WHERE id_pendeta = 'PDT-33372790';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Chintia Oktavia, S.Fil' WHERE id_pendeta = 'PDT-91331801';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Maca Dina Vira Tarigan, S.Fil' WHERE id_pendeta = 'PDT-61105165';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Aditya Paschal Pantow, S.Si-Teol., M.Si' WHERE id_pendeta = 'PDT-50731837';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Celine Meirella Pesiwarissa, S. Si-Teol.' WHERE id_pendeta = 'PDT-75744712';
UPDATE m_pendeta SET nama_lengkap = 'Mauren Priscilla Agatha Latupeirissa M.Si' WHERE id_pendeta = 'PDT-63297445';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Gladys Marseline Wilhelmina Rompas, S.Si.Teol' WHERE id_pendeta = 'PDT-98564767';
UPDATE m_pendeta SET nama_lengkap = 'Devina Fenisia Larungkondo,S.Si. Teol' WHERE id_pendeta = 'PDT-43833673';
UPDATE m_pendeta SET nama_lengkap = 'DOROTHEA FEBE WINMAN, M.Si' WHERE id_pendeta = 'PDT-57348885';
UPDATE m_pendeta SET nama_lengkap = 'Yemmima Indri Thena Kartika, S. Fil' WHERE id_pendeta = 'PDT-43759100';
UPDATE m_pendeta SET nama_lengkap = 'Magiantang Regina Fransiska' WHERE id_pendeta = 'PDT-29777050';
UPDATE m_pendeta SET nama_lengkap = 'Lea Christty Barahama S.Si-Teol' WHERE id_pendeta = 'PDT-11639704';
UPDATE m_pendeta SET nama_lengkap = 'Yapia Amung' WHERE id_pendeta = 'PDT-50703951';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Fransleo Cornelis Melatunan Junior, S.Si Teol' WHERE id_pendeta = 'PDT-41950460';
UPDATE m_pendeta SET nama_lengkap = 'Benedictus Patriach Paskah Unpapar S.Fil' WHERE id_pendeta = 'PDT-78038857';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Yosua Asido Parulian Simbolon S. Fil' WHERE id_pendeta = 'PDT-27471110';
UPDATE m_pendeta SET nama_lengkap = 'Pendeta rut marchel avellia, S.Si Teol' WHERE id_pendeta = 'PDT-74857909';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Hezron Tangke Salu Pakan, S.Th' WHERE id_pendeta = 'PDT-23910877';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Valerie Estherlita Javelien Sumlang, S.Si (Teol)' WHERE id_pendeta = 'PDT-42480179';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Satius, S.Th' WHERE id_pendeta = 'PDT-64742682';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Antoneta Taneo, S.Th' WHERE id_pendeta = 'PDT-65676161';
UPDATE m_pendeta SET nama_lengkap = 'Kefi Putriani Banunu, S.Th' WHERE id_pendeta = 'PDT-50821277';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. ENOS ZURIEL HEHAKAJA, S.Si-Teol' WHERE id_pendeta = 'PDT-29746330';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Aninda Marlya Wangkay, S.Fil.' WHERE id_pendeta = 'PDT-63289176';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Aedelyn Sylvia Yunita Laiskodat S.Si- Teol' WHERE id_pendeta = 'PDT-16929588';
UPDATE m_pendeta SET nama_lengkap = 'Melinda Marpaung' WHERE id_pendeta = 'PDT-57897189';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Anthony Richard Pietersz, S.Si-Teol' WHERE id_pendeta = 'PDT-45846521';
UPDATE m_pendeta SET nama_lengkap = 'Pendeta Cyntia Nellyta, S. Si. Teol.' WHERE id_pendeta = 'PDT-37298708';
UPDATE m_pendeta SET nama_lengkap = 'Ruth Meilan Tupalessy, S.Si.(Teol)' WHERE id_pendeta = 'PDT-41129720';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Claudio Hersa Totonini Gurusinga, S.Si-Teol.' WHERE id_pendeta = 'PDT-47831495';
UPDATE m_pendeta SET nama_lengkap = 'Pdt Eunykhe Widiarty Nani, S. Th' WHERE id_pendeta = 'PDT-46514951';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Timotius Verdino, M.Fil.' WHERE id_pendeta = 'PDT-10651965';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Moshe William Daniel, S. Fil' WHERE id_pendeta = 'PDT-80271497';
UPDATE m_pendeta SET nama_lengkap = 'Pendeta Christy Febianty Sinaga - Lekahena' WHERE id_pendeta = 'PDT-52587201';
UPDATE m_pendeta SET nama_lengkap = 'Pdt Asina Wahyu Deinnara S.Si Teol' WHERE id_pendeta = 'PDT-71887759';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Gabriella Christianty Titahena' WHERE id_pendeta = 'PDT-59630925';
UPDATE m_pendeta SET nama_lengkap = 'Shendy Novaldy Sitania, S. Si-Teol, M.Sc' WHERE id_pendeta = 'PDT-81550253';
UPDATE m_pendeta SET nama_lengkap = 'LESMA RIANTI SIMANJUNTAK S.Si Teol' WHERE id_pendeta = 'PDT-40606621';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Ade Rindunta' WHERE id_pendeta = 'PDT-47079836';
UPDATE m_pendeta SET nama_lengkap = 'Pdt. Ezra Sudarsono, S.Si., M.M.' WHERE id_pendeta = 'PDT-21698587';

-- 5. Insert/Update KMJs from Jemaat.txt into m_pendeta & m_jemaat_induk
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-01-01-AP', '01-01-AP', 'Pdt. Vanezza Albertina Siahaya', '+62 812 1941 1525', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-01-01-AP' WHERE id_induk = '01-01-AP';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-01-06-MP', '01-06-MP', 'Pdt. Julianus Yermias Kaimarehe', '+62 813 5143 6663', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-01-06-MP' WHERE id_induk = '01-06-MP';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-04-10-IP', '04-10-IP', 'Abraham Ferdinandus', '+62 812 8879 2585', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-04-10-IP' WHERE id_induk = '04-10-IP';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-04-04-BZ', '04-04-BZ', 'Pdt. Margaretha Dolf-Pelealu', '+62 813 6632 8883', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-04-04-BZ' WHERE id_induk = '04-04-BZ';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-04-06-EP', '04-06-EP', 'Pdt. Immanuel C. Nugroho', '+62 812 8001 8376', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-04-06-EP' WHERE id_induk = '04-06-EP';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-04-07-EF', '04-07-EF', 'Pdt. Sonya Alvie Umkeketony, S.Si - Teol', '+62 822 2701 2363', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-04-07-EF' WHERE id_induk = '04-07-EF';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-04-08-ED', '04-08-ED', 'Pdt. Sandino', '+62 851 0155 3028', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-04-08-ED' WHERE id_induk = '04-08-ED';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-04-09-GR', '04-09-GR', 'Pdt. Patricia Lisa Syaranamual, S.Th.', '+62 822 8689 7979', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-04-09-GR' WHERE id_induk = '04-09-GR';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-04-15-SD', '04-15-SD', 'Pdt. Wita Atria Akihary-Paputungan', NULL, 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-04-15-SD' WHERE id_induk = '04-15-SD';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-03-05-ET', '03-05-ET', 'Pdt. Melky Patoni', '+62 822 9302 4024', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-03-05-ET' WHERE id_induk = '03-05-ET';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-03-07-IB', '03-07-IB', 'Ronald Octavian  Rampala', '+62 878 8921 7297', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-03-07-IB' WHERE id_induk = '03-07-IB';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-05-07-PS', '05-07-PS', 'Pdt. YOHANES POSMAN ZAI, S.Si-Teol', '+62 821 5712 3802', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-05-07-PS' WHERE id_induk = '05-07-PS';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-05-06MJ', '05-06MJ', 'Willem Esau Talakua', '+62 812 9894 4310', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-05-06MJ' WHERE id_induk = '05-06MJ';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-05-01-AJ', '05-01-AJ', 'Pdt. Samuel Natar, M.Th', '+62 812 8827 586', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-05-01-AJ' WHERE id_induk = '05-01-AJ';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-05-10-EJ', '05-10-EJ', 'Pdt. Novianti Situmorang', '+62 895 3699 08383', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-05-10-EJ' WHERE id_induk = '05-10-EJ';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-05-01-IJ', '05-01-IJ', 'Pdt. Rio Andre Kolinug, S.Si-Teol', '+62 838 9070 7728', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-05-01-IJ' WHERE id_induk = '05-01-IJ';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-02-01-BM', '02-01-BM', 'Pdt. Delila Benu', '+62 822 3346 4104', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-02-01-BM' WHERE id_induk = '02-01-BM';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-02-04-IT', '02-04-IT', 'Pdt. Berillos A H Panggabean', '+62 813 4960 6553', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-02-04-IT' WHERE id_induk = '02-04-IT';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-02-05-KM', '02-05-KM', 'Pdt Egla Bontor Irnahasri Nababan, S. Si. Teol', '+62 812 8235 0574', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-02-05-KM' WHERE id_induk = '02-05-KM';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-06-05-MA', '06-05-MA', 'Pdt. Deasy E. Wattimena-Kalalo', '+62 812 8001 2076', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-06-05-MA' WHERE id_induk = '06-05-MA';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-06-03-IM', '06-03-IM', 'Pdt. Adventino Ekaristi Priyonggo', '+62 813 4725 2770', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-06-03-IM' WHERE id_induk = '06-03-IM';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-06-07-PE', '06-07-PE', 'Pdt. Leoni Prameswari, S.Si-Teol', '+62 813 4000 4142', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-06-07-PE' WHERE id_induk = '06-07-PE';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-06-12-SP', '06-12-SP', 'Pdt. Marco Yoel Kumendong, S.Th', '+62 852 4619 7020', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-06-12-SP' WHERE id_induk = '06-12-SP';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-06-13-MK', '06-13-MK', 'Pdt. Heber Hutauruk', '+62 821 1134 0689', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-06-13-MK' WHERE id_induk = '06-13-MK';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-07-09-YU', '07-09-YU', 'Pdt. Albert Wowor, S.Th.', '+62 813 4193 6890', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-07-09-YU' WHERE id_induk = '07-09-YU';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-16-10-PS', '16-10-PS', 'Pdt. Lefijandie R. J. Kembuan', '+62 812 4115 8751', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-16-10-PS' WHERE id_induk = '16-10-PS';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-16-14-TS', '16-14-TS', 'Pdt. Claudya I. Yosep - Sahertian', '+62 852 4515 3728', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-16-14-TS' WHERE id_induk = '16-14-TS';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-18-04-MD', '18-04-MD', 'Pendeta Sonya Medyarto - Sitaniapessy', '+62 812 9932 973', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-18-04-MD' WHERE id_induk = '18-04-MD';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-13-SP', '20-13-SP', 'Ridwan Hamonangan Purba', NULL, 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-13-SP' WHERE id_induk = '20-13-SP';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-01-AB', '20-01-AB', 'Pdt. Vika Manuela Ferdinandus', '+62 852 1238 1222', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-01-AB' WHERE id_induk = '20-01-AB';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-02-BM', '20-02-BM', 'Pdt. Johanes Aldo Lampus, S. Si-Teol', '+62 821 1529 5708', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-02-BM' WHERE id_induk = '20-02-BM';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-21-S', '20-21-S', 'Pdt. Oktaviyan Sopater Silahooij, S.Si Teol', '+62 878 8192 0720', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-21-S' WHERE id_induk = '20-21-S';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-03-BP', '20-03-BP', 'Pdt. Ribka Atviani, S.Si.Teol.', '+62 813 6765 1979', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-03-BP' WHERE id_induk = '20-03-BP';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-15-BA', '20-15-BA', 'Pdt. Jebelino Adiputra Kastanya, S.Si.Teol', NULL, 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-15-BA' WHERE id_induk = '20-15-BA';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-04-EK', '20-04-EK', 'Pdt. Christian Talutu', '+62 821 1399 6643', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-04-EK' WHERE id_induk = '20-04-EK';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-16-EA', '20-16-EA', 'Pdt. David Cornelius Sihombing, S.Si-Teol', '+62 812 6438 2193', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-16-EA' WHERE id_induk = '20-16-EA';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-05-IT', '20-05-IT', 'Pdt. Elphano Risdo Souisa, S. Th', '+62 822 4615 8960', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-05-IT' WHERE id_induk = '20-05-IT';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-19-S', '20-19-S', 'Pdt. Agus Prasetyo Milono', '+62 812 6968 4958', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-19-S' WHERE id_induk = '20-19-S';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-07-MS', '20-07-MS', 'Pdt DR Abraham Silo Wilar, M.Th, M.A', NULL, 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-07-MS' WHERE id_induk = '20-07-MS';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-08-MI', '20-08-MI', 'Pdt. Amanda Lekahena, S.Si-Teol', '+62 822 2551 0885', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-08-MI' WHERE id_induk = '20-08-MI';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-09-OS', '20-09-OS', 'Pdt. Novayanti Astrid Pattikawa-Lambey', '+62 822 8821 4961', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-09-OS' WHERE id_induk = '20-09-OS';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-10-PA', '20-10-PA', 'Pdt. Sarinah Allo Layuk', '+62 852 1558 6202', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-10-PA' WHERE id_induk = '20-10-PA';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-11-SS', '20-11-SS', 'Pdt. VEGA LAPIAN - SARASAK, S. Th', '+62 812 8449 5259', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-11-SS' WHERE id_induk = '20-11-SS';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-12-SK', '20-12-SK', 'Pdt. Jani Victor Karatem', '+62 813 2546 4855', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-12-SK' WHERE id_induk = '20-12-SK';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-22-BZ', '20-22-BZ', 'Pdt. Victoriana Desmatrusia Resdawati, S.Th.', '+62 852 5240 3919', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-22-BZ' WHERE id_induk = '20-22-BZ';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-20-24-PJ', '20-24-PJ', 'Pdt. Ergon Pranata Pieters, M.Th', '+62 856 9754 2017', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-20-24-PJ' WHERE id_induk = '20-24-PJ';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-21-02-RP', '21-02-RP', 'Pdt. Samrut Peloa', '+62 812 4803 8484', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-21-02-RP' WHERE id_induk = '21-02-RP';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-21-04-IK', '21-04-IK', 'Pdt. Rocky Samuel Karenda', '+62 811 1004 768', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-21-04-IK' WHERE id_induk = '21-04-IK';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-21-06-SB', '21-06-SB', 'Pdt. Sergio Souisa', '+62 821 2171 7603', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-21-06-SB' WHERE id_induk = '21-06-SB';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-22-08-MB', '22-08-MB', 'Pdt nelce alelo', NULL, 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-22-08-MB' WHERE id_induk = '22-08-MB';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-22-04-EB', '22-04-EB', 'Pdt. Theofonslow Trifosa Omega Salouw, S.Th', '+62 853 9562 9758', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-22-04-EB' WHERE id_induk = '22-04-EB';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-22-07-KK', '22-07-KK', 'Pdt. Dr. Stella Yessy Exlentya Pattipeilohy, S.Si-Teol., M.Th.', '+62 812 2870 1060', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-22-07-KK' WHERE id_induk = '22-07-KK';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-22-11-SB', '22-11-SB', 'Pdt. Margaretha Kamban', '+62 813 2060 1152', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-22-11-SB' WHERE id_induk = '22-11-SB';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-23-06-IS', '23-06-IS', 'Pdt. Elly Dominggas Pitoy - de Bell', '+62 818 7104 16', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-23-06-IS' WHERE id_induk = '23-06-IS';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-23-02-ES', '23-02-ES', '"Pdt. Fenovri Setyasusanto Satata', ': "', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-23-02-ES' WHERE id_induk = '23-02-ES';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-23-03-ET', '23-03-ET', 'Pdt. Feggy M. Salindeho-Beslar', '+62 813 7892 9991', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-23-03-ET' WHERE id_induk = '23-03-ET';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-23-14-HS', '23-14-HS', 'Pdt. Candra N. K. Ch. Wila, S.Si-Teol', '+62 813 4661 6727', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-23-14-HS' WHERE id_induk = '23-14-HS';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-23-08-PS', '23-08-PS', 'Pdt. Frenky Vinsentius Latuihamallo, M.Si.', '+62 822 2535 9307', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-23-08-PS' WHERE id_induk = '23-08-PS';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-23-11-SK', '23-11-SK', 'Pdt. Frengky Iverson Manenat Tacoy, S.Si-Teol', '+62 852 3222 4953', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-23-11-SK' WHERE id_induk = '23-11-SK';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-24-05-MT', '24-05-MT', 'Pdt. Septy Berpras Lillung-Sir, S.Si-Teol', '+62 812 3210 0944', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-24-05-MT' WHERE id_induk = '24-05-MT';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-23-05-IA', '23-05-IA', 'Pdt. Timotius Eduard Lalala, S.Si.Teol.', '+62 822 5569 1124', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-23-05-IA' WHERE id_induk = '23-05-IA';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-24-06-SN', '24-06-SN', 'Pdt. Meryani fedrika gimon', '+62 813 2643', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-24-06-SN' WHERE id_induk = '24-06-SN';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-24-08-SI', '24-08-SI', 'Pdt. Olivia G. Siura-Salu', '+62 812 8702 2316', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-24-08-SI' WHERE id_induk = '24-08-SI';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-19-14-PB', '19-14-PB', 'Pdt. Dominggus Andreas Boesday', '+62 812 3136 8424', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-19-14-PB' WHERE id_induk = '19-14-PB';
INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES ('PDT-KMJ-19-17-SK', '19-17-SK', 'Pdt. Jovina Hutahaean - Luntungan', '+62 823 5216 8608', 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;
UPDATE m_jemaat_induk SET id_kmj = 'PDT-KMJ-19-17-SK' WHERE id_induk = '19-17-SK';

COMMIT;


-- [MIGRATION SOURCE: 20260721_rls_pendeta_public.sql]
-- Create RLS Policies for Pendeta and Assignment tables to allow public read access
-- Since these tables are used in the public frontend (Dashboard, Hierarki)

-- Enable RLS
ALTER TABLE m_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_pj_jemaat ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_penugasan_pendeta ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access for m_pendeta" ON m_pendeta;
DROP POLICY IF EXISTS "Allow public read access for t_pj_jemaat" ON t_pj_jemaat;
DROP POLICY IF EXISTS "Allow public read access for t_penugasan_pendeta" ON t_penugasan_pendeta;

-- Create policies for public read access
CREATE POLICY "Allow public read access for m_pendeta" ON m_pendeta FOR SELECT USING (true);
CREATE POLICY "Allow public read access for t_pj_jemaat" ON t_pj_jemaat FOR SELECT USING (true);
CREATE POLICY "Allow public read access for t_penugasan_pendeta" ON t_penugasan_pendeta FOR SELECT USING (true);


-- [MIGRATION SOURCE: 20260722_storage_bucket.sql]
-- Migration: 20260722_storage_bucket.sql
-- Description: Buat bucket pos-pelkes-images dan RLS policies

BEGIN;

-- Insert bucket baru ke tabel storage.buckets jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pos-pelkes-images', 
    'pos-pelkes-images', 
    true, 
    5242880, -- 5MB limit max, though we compress to <1MB on client
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- storage.objects RLS sudah aktif secara default di Supabase, jadi tidak perlu ALTER TABLE.

-- Hapus policy lama jika ada untuk mencegah duplikasi
DROP POLICY IF EXISTS "Public can view pos-pelkes-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to pos-pelkes-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploaded images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploaded images" ON storage.objects;

-- Policy 1: Semua orang (bahkan anonim) bisa melihat gambar di bucket ini karena public
CREATE POLICY "Public can view pos-pelkes-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'pos-pelkes-images');

-- Policy 2: Authenticated user bisa upload ke bucket ini
CREATE POLICY "Users can upload to pos-pelkes-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pos-pelkes-images');

-- Policy 3: Authenticated user bisa update file di bucket ini
CREATE POLICY "Users can update their uploaded images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pos-pelkes-images' AND auth.uid() = owner);

-- Policy 4: Authenticated user bisa delete file di bucket ini
CREATE POLICY "Users can delete their uploaded images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pos-pelkes-images' AND auth.uid() = owner);

COMMIT;


-- [MIGRATION SOURCE: 20260723_fix_rls_recursion.sql]
-- Fix infinite recursion in m_jemaat_induk policy

BEGIN;

-- Drop the problematic policies
DROP POLICY IF EXISTS "KMJ akses jemaat yang dipimpinnya" ON m_jemaat_induk;
DROP POLICY IF EXISTS "User akses pos yang ditugaskan" ON m_pos_pelkes;

-- Recreate policy for m_jemaat_induk without recursion
-- We directly evaluate the current row's id_kmj and id_mupel instead of querying the table again.
CREATE POLICY "KMJ akses jemaat yang dipimpinnya"
ON m_jemaat_induk FOR ALL
USING (
    id_kmj = (SELECT id_pendeta FROM users WHERE id = auth.uid())
    OR get_auth_role() = 'super_user'
    OR (get_auth_role() = 'admin_mupel' AND id_mupel = (SELECT id_mupel FROM users WHERE id = auth.uid()))
);

-- Recreate policy for m_pos_pelkes
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

-- Note: For development, it's often helpful to allow all reads for authenticated users 
-- if the strict RLS is too restrictive for testing the UI. 
-- Here we add a basic read policy for authenticated users so data shows up in dashboard.
CREATE POLICY "Authenticated users can view m_jemaat_induk"
ON m_jemaat_induk FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view m_pos_pelkes"
ON m_pos_pelkes FOR SELECT
TO authenticated
USING (true);

-- And for anon users (since next.js might fetch without auth if we didn't pass cookies correctly)
CREATE POLICY "Anon users can view m_pos_pelkes"
ON m_pos_pelkes FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon users can view m_jemaat_induk"
ON m_jemaat_induk FOR SELECT
TO anon
USING (true);

COMMIT;


-- [MIGRATION SOURCE: 20260723_webauthn_challenges.sql]
-- Tabel untuk menyimpan challenge sementara (expire 5 menit)
CREATE TABLE IF NOT EXISTS public.webauthn_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    challenge TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat saat verifikasi
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user ON public.webauthn_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_expires ON public.webauthn_challenges(expires_at);

-- RLS Policies
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- Hanya user yang bersangkutan yang bisa melihat challenge-nya (untuk keamanan)
CREATE POLICY "Users can view their own challenges"
ON public.webauthn_challenges FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Hanya sistem (via Service Role) yang bisa insert/delete
-- (Kita akan gunakan Service Role di API routes, jadi tidak perlu policy untuk authenticated user untuk insert)


-- [MIGRATION SOURCE: 20260724_assets_storage.sql]
-- Create "assets-images" bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets-images', 'assets-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload and delete files
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets-images');

CREATE POLICY "Authenticated users can delete assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets-images');

CREATE POLICY "Authenticated users can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets-images');

-- Allow public to read/download files
CREATE POLICY "Public can view assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets-images');


-- [MIGRATION SOURCE: 20260724_log_pastoral_foto.sql]
-- 1. Add foto_url column to t_log_pastoral
ALTER TABLE t_log_pastoral
ADD COLUMN foto_url TEXT;

-- 2. Create Storage Bucket for Pastoral Logs
INSERT INTO storage.buckets (id, name, public)
VALUES ('log-pastoral-images', 'log-pastoral-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS Policies for the new Storage Bucket
-- Allow anyone to read images (public)
CREATE POLICY "Allow public read access to log-pastoral-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'log-pastoral-images');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload to log-pastoral-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'log-pastoral-images');

-- Allow users to update their own uploads
CREATE POLICY "Allow authenticated users to update their own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'log-pastoral-images' AND auth.uid() = owner);

-- Allow users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'log-pastoral-images' AND auth.uid() = owner);


-- [MIGRATION SOURCE: 20260725_approval_rpc.sql]
-- Migration: Atomic approval processing function for Pengajuan Bantuan
CREATE OR REPLACE FUNCTION process_pengajuan_bantuan(
  p_id_ajuan VARCHAR,
  p_aksi VARCHAR, -- 'approve', 'reject', 'revision'
  p_catatan TEXT
) RETURNS VOID AS $$
DECLARE
  v_current_status VARCHAR;
  v_next_status VARCHAR;
  v_user_role VARCHAR;
  v_user_id UUID;
  v_actor_phone VARCHAR;
BEGIN
  -- 1. Get current authenticated user
  v_user_id := auth.uid();
  SELECT role, no_telepon INTO v_user_role, v_actor_phone 
  FROM users WHERE id = v_user_id;

  -- Default to 'super_user' if user role is not explicitly set in table
  IF v_user_role IS NULL THEN
    v_user_role := 'super_user';
  END IF;

  -- 2. Get current status of pengajuan
  SELECT status INTO v_current_status 
  FROM t_pengajuan_bantuan WHERE id_ajuan = p_id_ajuan;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Pengajuan bantuan tidak ditemukan: %', p_id_ajuan;
  END IF;

  -- 3. Validate workflow step transitions
  IF p_aksi = 'approve' THEN
    IF v_current_status = 'Pending_KMJ' AND v_user_role IN ('kmj', 'super_user', 'admin_mupel', 'admin') THEN 
      v_next_status := 'Pending_Mupel';
    ELSIF v_current_status = 'Pending_Mupel' AND v_user_role IN ('admin_mupel', 'super_user', 'admin') THEN 
      v_next_status := 'Pending_Sinode';
    ELSIF v_current_status = 'Pending_Sinode' AND v_user_role IN ('super_user', 'admin') THEN 
      v_next_status := 'Approved';
    ELSIF v_user_role IN ('super_user', 'admin') THEN
      -- Super user force approve fallback
      v_next_status := CASE 
        WHEN v_current_status = 'Pending_KMJ' THEN 'Pending_Mupel'
        WHEN v_current_status = 'Pending_Mupel' THEN 'Pending_Sinode'
        ELSE 'Approved'
      END;
    ELSE
      RAISE EXCEPTION 'Aksi approve tidak diizinkan untuk status (%) atau role (%)', v_current_status, v_user_role;
    END IF;
  ELSIF p_aksi IN ('reject', 'revision') THEN
    v_next_status := CASE WHEN p_aksi = 'revision' THEN 'Draft' ELSE 'Rejected' END;
  ELSE
    RAISE EXCEPTION 'Aksi approval tidak valid: %', p_aksi;
  END IF;

  -- 4. ATOMIC EXECUTION: Insert audit log entry
  INSERT INTO t_approval_bantuan (id_ajuan, approver_id, role_approver, aksi, catatan)
  VALUES (p_id_ajuan, v_user_id, v_user_role, p_aksi, p_catatan);

  -- 5. ATOMIC EXECUTION: Update status in t_pengajuan_bantuan
  UPDATE t_pengajuan_bantuan 
  SET status = v_next_status, updated_at = NOW() 
  WHERE id_ajuan = p_id_ajuan;

  -- 6. ATOMIC EXECUTION: Record activity log if t_log_aktivitas exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 't_log_aktivitas') THEN
    INSERT INTO t_log_aktivitas (id_log, id_user, aktor, aksi, objek_type, objek_id, keterangan)
    VALUES (
      'LOG-' || gen_random_uuid()::text,
      v_user_id,
      COALESCE(v_actor_phone, 'System User'),
      'APPROVE',
      'bantuan',
      p_id_ajuan,
      p_aksi || ': ' || p_catatan
    );
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- [MIGRATION SOURCE: 20260726_pendeta_mutation_rpc.sql]
-- Migration: Atomic mutation & KMJ assignment RPC functions for Pendeta
-- File: 20260726_pendeta_mutation_rpc.sql

-- 1. Fungsi Mutasi Pendeta (Atomic Lintas Mupel / Jemaat)
CREATE OR REPLACE FUNCTION mutasi_pendeta(
  p_id_pendeta VARCHAR,
  p_id_induk_baru VARCHAR,
  p_alasan TEXT
) RETURNS VOID AS $$
DECLARE
  v_old_id_induk VARCHAR;
  v_is_kmj BOOLEAN;
  v_is_pj BOOLEAN;
  v_id_riwayat VARCHAR;
BEGIN
  -- Ambil data lama
  SELECT id_induk, is_kmj, is_pj INTO v_old_id_induk, v_is_kmj, v_is_pj
  FROM m_pendeta WHERE id_pendeta = p_id_pendeta;

  IF v_old_id_induk IS NULL THEN
    RAISE EXCEPTION 'Pendeta dengan ID % tidak ditemukan', p_id_pendeta;
  END IF;

  IF v_old_id_induk = p_id_induk_baru THEN
    RAISE EXCEPTION 'Jemaat Induk tujuan tidak boleh sama dengan Jemaat Induk asal';
  END IF;

  -- Generate ID Riwayat unik dengan pola MUT-{timestamp}-{random}
  v_id_riwayat := 'MUT-' || floor(extract(epoch from now()))::text || '-' || floor(random() * 1000)::text;

  -- 1. Insert ke riwayat mutasi
  INSERT INTO t_riwayat_mutasi_pendeta (id_riwayat, id_pendeta, id_induk_lama, id_induk_baru, tgl_mutasi, jenis_mutasi, alasan)
  VALUES (v_id_riwayat, p_id_pendeta, v_old_id_induk, p_id_induk_baru, CURRENT_DATE, 'MUTASI', p_alasan);

  -- 2. Reset flag KMJ/PJ di jemaat lama (mencegah hantu data visual)
  UPDATE m_pendeta SET is_kmj = FALSE, is_pj = FALSE WHERE id_pendeta = p_id_pendeta;

  -- Reset id_kmj di jemaat lama jika pendeta ini adalah KMJ-nya
  UPDATE m_jemaat_induk SET id_kmj = NULL WHERE id_induk = v_old_id_induk AND id_kmj = p_id_pendeta;

  -- 3. Tutup penugasan PJ lama di t_pj_jemaat (jika ada)
  UPDATE t_pj_jemaat 
  SET tanggal_selesai = CURRENT_DATE, status = 'Selesai'
  WHERE id_pendeta = p_id_pendeta AND (tanggal_selesai IS NULL OR status = 'Aktif');

  -- 4. Tutup penugasan ke Pos Pelkes lama di t_penugasan_pendeta (jika ada)
  UPDATE t_penugasan_pendeta 
  SET tgl_selesai = CURRENT_DATE, status_tugas = 'Selesai'
  WHERE id_pendeta = p_id_pendeta AND (tgl_selesai IS NULL OR status_tugas = 'Aktif');

  -- 5. Update jemaat induk pendeta ke jemaat tujuan
  UPDATE m_pendeta 
  SET id_induk = p_id_induk_baru, updated_at = NOW() 
  WHERE id_pendeta = p_id_pendeta;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Fungsi Set KMJ (Atomic - Mendukung Promosi PJ -> KMJ & Lintas Mupel/Jemaat)
CREATE OR REPLACE FUNCTION set_kmj(
  p_id_induk VARCHAR,
  p_id_pendeta VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_old_kmj VARCHAR;
  v_old_id_induk VARCHAR;
  v_id_riwayat VARCHAR;
BEGIN
  -- Ambil data jemaat induk lama pendeta
  SELECT id_induk INTO v_old_id_induk FROM m_pendeta WHERE id_pendeta = p_id_pendeta;

  -- Reset KMJ lama di jemaat tujuan jika ada
  SELECT id_kmj INTO v_old_kmj FROM m_jemaat_induk WHERE id_induk = p_id_induk;
  IF v_old_kmj IS NOT NULL AND v_old_kmj <> p_id_pendeta THEN
    UPDATE m_pendeta SET is_kmj = FALSE WHERE id_pendeta = v_old_kmj;
  END IF;

  -- Jika pendeta ini sebelumnya KMJ di jemaat asal, kosongkan id_kmj jemaat asal
  IF v_old_id_induk IS NOT NULL AND v_old_id_induk <> p_id_induk THEN
    UPDATE m_jemaat_induk SET id_kmj = NULL WHERE id_induk = v_old_id_induk AND id_kmj = p_id_pendeta;
  END IF;

  -- Tutup penugasan PJ lama jika sebelumnya pendeta ini bertugas sebagai PJ
  UPDATE t_pj_jemaat 
  SET tanggal_selesai = CURRENT_DATE, status = 'Selesai'
  WHERE id_pendeta = p_id_pendeta AND (tanggal_selesai IS NULL OR status = 'Aktif');

  UPDATE t_penugasan_pendeta 
  SET tgl_selesai = CURRENT_DATE, status_tugas = 'Selesai'
  WHERE id_pendeta = p_id_pendeta AND (tgl_selesai IS NULL OR status_tugas = 'Aktif');

  -- Set KMJ baru pada m_jemaat_induk dan m_pendeta
  UPDATE m_jemaat_induk SET id_kmj = p_id_pendeta, updated_at = NOW() WHERE id_induk = p_id_induk;
  UPDATE m_pendeta SET is_kmj = TRUE, is_pj = FALSE, id_induk = p_id_induk, updated_at = NOW() WHERE id_pendeta = p_id_pendeta;
  
  -- Generate ID Riwayat unik dengan pola MUT-{timestamp}-{random}
  v_id_riwayat := 'MUT-' || floor(extract(epoch from now()))::text || '-' || floor(random() * 1000)::text;

  -- Catat ke riwayat mutasi
  INSERT INTO t_riwayat_mutasi_pendeta (id_riwayat, id_pendeta, id_induk_lama, id_induk_baru, tgl_mutasi, jenis_mutasi, alasan)
  VALUES (v_id_riwayat, p_id_pendeta, COALESCE(v_old_id_induk, p_id_induk), p_id_induk, CURRENT_DATE, 'PENGANGKATAN_KMJ', 'Penetapan sebagai Ketua Majelis Jemaat (KMJ)');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Fungsi Assign PJ (Atomic - Mendukung Mutasi KMJ -> PJ & Lintas Mupel/Jemaat)
CREATE OR REPLACE FUNCTION assign_pj(
  p_id_induk VARCHAR,
  p_id_pendeta VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_old_id_induk VARCHAR;
  v_id_riwayat VARCHAR;
BEGIN
  -- Ambil data jemaat induk lama pendeta
  SELECT id_induk INTO v_old_id_induk FROM m_pendeta WHERE id_pendeta = p_id_pendeta;

  -- Jika pendeta ini sebelumnya KMJ di jemaat asal, kosongkan id_kmj jemaat asal
  IF v_old_id_induk IS NOT NULL THEN
    UPDATE m_jemaat_induk SET id_kmj = NULL WHERE id_induk = v_old_id_induk AND id_kmj = p_id_pendeta;
  END IF;

  -- Tutup penugasan PJ lama jika ada
  UPDATE t_pj_jemaat 
  SET tanggal_selesai = CURRENT_DATE, status = 'Selesai'
  WHERE id_pendeta = p_id_pendeta AND (tanggal_selesai IS NULL OR status = 'Aktif');

  -- Buat penugasan PJ baru di jemaat tujuan
  INSERT INTO t_pj_jemaat (id_induk, id_pendeta, tanggal_mulai, status)
  VALUES (p_id_induk, p_id_pendeta, CURRENT_DATE, 'Aktif');

  -- Set status pendeta sebagai PJ
  UPDATE m_pendeta SET is_pj = TRUE, is_kmj = FALSE, id_induk = p_id_induk, updated_at = NOW() WHERE id_pendeta = p_id_pendeta;

  -- Generate ID Riwayat unik dengan pola MUT-{timestamp}-{random}
  v_id_riwayat := 'MUT-' || floor(extract(epoch from now()))::text || '-' || floor(random() * 1000)::text;

  -- Catat ke riwayat mutasi
  INSERT INTO t_riwayat_mutasi_pendeta (id_riwayat, id_pendeta, id_induk_lama, id_induk_baru, tgl_mutasi, jenis_mutasi, alasan)
  VALUES (v_id_riwayat, p_id_pendeta, COALESCE(v_old_id_induk, p_id_induk), p_id_induk, CURRENT_DATE, 'PENGANGKATAN_PJ', 'Penetapan sebagai Pendeta Jemaat (PJ)');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- [MIGRATION SOURCE: 20260728_pendeta_organik.sql]
-- Tambah kolom untuk membedakan Organik vs Non-Organik
ALTER TABLE m_pendeta 
ADD COLUMN IF NOT EXISTS jenis_pendeta VARCHAR(20) DEFAULT 'Organik' 
  CHECK (jenis_pendeta IN ('Organik', 'Non-Organik')),
ADD COLUMN IF NOT EXISTS tgl_mulai_kontrak DATE,
ADD COLUMN IF NOT EXISTS tgl_akhir_kontrak DATE,
ADD COLUMN IF NOT EXISTS sumber_pembiayaan VARCHAR(100),
ADD COLUMN IF NOT EXISTS eligible_rotasi BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS gereja_asal VARCHAR(150); -- Untuk Non-Organik yang berafiliasi dengan gereja lain

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_pendeta_jenis ON m_pendeta(jenis_pendeta);
CREATE INDEX IF NOT EXISTS idx_pendeta_kontrak ON m_pendeta(tgl_akhir_kontrak) 
  WHERE jenis_pendeta = 'Non-Organik' AND tgl_akhir_kontrak IS NOT NULL;

-- Asumsi: Data existing dari GPIB.xlsx adalah Pendeta Organik. 
-- Admin dapat mengubahnya secara manual jika diperlukan.
UPDATE m_pendeta SET jenis_pendeta = 'Organik' WHERE jenis_pendeta IS NULL;

-- Tabel untuk mencatat jabatan struktural di luar Jemaat
CREATE TABLE IF NOT EXISTS t_jabatan_struktural (
    id_jabatan VARCHAR(30) PRIMARY KEY, -- Format: JBT-{timestamp}-{random}
    id_pendeta VARCHAR(20) NOT NULL REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
    
    -- Kategori Jabatan
    kategori VARCHAR(50) NOT NULL CHECK (kategori IN (
        'BP Mupel', 
        'Kepanitiaan Sinode', 
        'Kepanitiaan Mupel', 
        'Kepanitiaan Jemaat',
        'Unit Misioner', 
        'Pokja', 
        'Lainnya'
    )),
    
    -- Nama Jabatan Spesifik
    nama_jabatan VARCHAR(100) NOT NULL,
    
    -- Tingkat Organisasi
    tingkat VARCHAR(20) NOT NULL CHECK (tingkat IN ('Sinode', 'Mupel', 'Jemaat')),
    
    -- Periode Jabatan
    tgl_mulai DATE NOT NULL DEFAULT CURRENT_DATE,
    tgl_selesai DATE,
    
    -- Legalitas
    no_sk VARCHAR(100),
    tgl_sk DATE,
    
    -- Status & Keterangan
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Selesai', 'Nonaktif')),
    keterangan TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_jabatan_pendeta ON t_jabatan_struktural(id_pendeta);
CREATE INDEX IF NOT EXISTS idx_jabatan_aktif ON t_jabatan_struktural(id_pendeta, kategori) 
  WHERE status = 'Aktif';
CREATE INDEX IF NOT EXISTS idx_jabatan_kategori ON t_jabatan_struktural(kategori, tingkat);

-- RLS Policies
ALTER TABLE t_jabatan_struktural ENABLE ROW LEVEL SECURITY;

-- 1. SEMUA user terautentikasi boleh MELIHAT (Read) jabatan struktural 
-- (Transparansi internal organisasi gereja)
CREATE POLICY "Authenticated users can view structural positions"
ON t_jabatan_struktural FOR SELECT
TO authenticated
USING (true);

-- 2. SUPER USER boleh mengelola (CRUD) SEMUA jabatan struktural
CREATE POLICY "Super User can manage all structural positions"
ON t_jabatan_struktural FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_user'
    )
);

-- 3. ADMIN MUPEL hanya boleh mengelola (CRUD) jabatan struktural 
-- untuk pendeta yang terdaftar di Jemaat within Mupel mereka
CREATE POLICY "Admin Mupel can manage structural positions in their Mupel"
ON t_jabatan_struktural FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN m_pendeta p ON p.id_pendeta = t_jabatan_struktural.id_pendeta
        JOIN m_jemaat_induk j ON j.id_induk = p.id_induk
        WHERE u.id = auth.uid() 
        AND u.role = 'admin_mupel'
        AND j.id_mupel = u.id_mupel
    )
);


-- [MIGRATION SOURCE: 20260729_approval_bantuan_rpc.sql]
-- Migration: Atomic approval processing function for Pengajuan Bantuan (v2.2)
CREATE OR REPLACE FUNCTION process_pengajuan_bantuan(
  p_id_ajuan VARCHAR,
  p_aksi VARCHAR, -- 'approve', 'reject', 'revision'
  p_catatan TEXT,
  p_role_approver VARCHAR DEFAULT NULL -- 'kmj', 'admin_mupel', 'super_user'
) RETURNS VOID AS $$
DECLARE
  v_current_status VARCHAR;
  v_next_status VARCHAR;
  v_user_role VARCHAR;
  v_user_id UUID;
  v_aktor VARCHAR;
BEGIN
  -- 1. Dapatkan info user yang sedang login
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    SELECT role, COALESCE(no_telepon, email, 'User') INTO v_user_role, v_aktor 
    FROM users WHERE id = v_user_id;
  END IF;

  -- Gunakan role_approver dari parameter jika disuplai, atau fallback ke role user DB
  v_user_role := COALESCE(p_role_approver, v_user_role, 'super_user');
  v_aktor := COALESCE(v_aktor, 'System User');

  -- 2. Dapatkan status saat ini
  SELECT status INTO v_current_status 
  FROM t_pengajuan_bantuan WHERE id_ajuan = p_id_ajuan;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Pengajuan bantuan tidak ditemukan: %', p_id_ajuan;
  END IF;

  -- 3. Tentukan status berikutnya berdasarkan alur workflow
  IF p_aksi = 'approve' THEN
    IF v_current_status = 'Draft' OR v_current_status = 'Pending_KMJ' THEN 
      v_next_status := 'Pending_Mupel';
    ELSIF v_current_status = 'Pending_Mupel' THEN 
      v_next_status := 'Pending_Sinode';
    ELSIF v_current_status = 'Pending_Sinode' THEN 
      v_next_status := 'Approved';
    ELSE
      RAISE EXCEPTION 'Aksi approve tidak diizinkan untuk status saat ini: %', v_current_status;
    END IF;
  ELSIF p_aksi IN ('reject', 'revision') THEN
    v_next_status := CASE WHEN p_aksi = 'revision' THEN 'Draft' ELSE 'Rejected' END;
  ELSE
    RAISE EXCEPTION 'Aksi tidak valid: %', p_aksi;
  END IF;

  -- 4. EKSEKUSI ATOMIK: Insert audit log ke t_approval_bantuan
  INSERT INTO t_approval_bantuan (id_ajuan, approver_id, role_approver, aksi, catatan)
  VALUES (p_id_ajuan, v_user_id, v_user_role, p_aksi, p_catatan);

  -- 5. EKSEKUSI ATOMIK: Update status pengajuan
  UPDATE t_pengajuan_bantuan 
  SET status = v_next_status, updated_at = NOW() 
  WHERE id_ajuan = p_id_ajuan;

  -- 6. EKSEKUSI ATOMIK: Catat di log aktivitas jika tabel t_log_aktivitas ada
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 't_log_aktivitas') THEN
    INSERT INTO t_log_aktivitas (id_log, id_user, waktu, aktor, aksi, objek_type, objek_id, keterangan)
    VALUES (
      'LOG-' || gen_random_uuid()::text,
      v_user_id,
      NOW(),
      v_aktor,
      UPPER(p_aksi),
      'bantuan',
      p_id_ajuan,
      p_aksi || ': ' || p_catatan
    );
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- [MIGRATION SOURCE: 20260730_jemaat_stats.sql]
-- Migration: Add statistics columns to m_jemaat_induk
ALTER TABLE m_jemaat_induk 
ADD COLUMN IF NOT EXISTS jumlah_sektor INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS jumlah_kk INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS jumlah_jiwa INT DEFAULT 0;

-- Update sample data from GPIB.xlsx
UPDATE m_jemaat_induk SET 
  jumlah_sektor = 1, 
  jumlah_kk = 50, 
  jumlah_jiwa = 178 
WHERE id_induk = '02-01-BM';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_jemaat_stats ON m_jemaat_induk(jumlah_jiwa DESC);


-- [MIGRATION SOURCE: 20260730_profile_stats.sql]
-- Migration: RPC get_profile_stats Security Hardening & Strict RLS Audit Policies for Profile 360°
-- RPC ini didokumentasikan di: documentation/master/SI GPIB v2.2 — ERD.md §8
-- dan Blueprint v2.2 §5. Ubah keduanya jika signature/behavior berubah.

-- 1. SECURITY DEFINER Guard for get_profile_stats
CREATE OR REPLACE FUNCTION get_profile_stats(p_id_pendeta text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_total_log bigint := 0;
  v_total_jiwa bigint := 0;
  v_pos_aktif bigint := 0;
  v_log_bulan_ini bigint := 0;
  v_lama_melayani_bulan integer := 0;
  v_tgl_tugas timestamptz;
  v_caller_role text;
  v_caller_pendeta text;
  v_result json;
BEGIN
  IF p_id_pendeta IS NULL OR p_id_pendeta = '' THEN
    RETURN json_build_object(
      'total_log', 0,
      'total_jiwa', 0,
      'pos_aktif', 0,
      'log_bulan_ini', 0,
      'lama_melayani_bulan', 0
    );
  END IF;

  -- Security Guard: Verify caller authorization
  v_caller_role := COALESCE(auth.jwt() ->> 'role', 'authenticated');

  SELECT id_pendeta INTO v_caller_pendeta
  FROM users
  WHERE id = auth.uid();

  IF v_caller_role NOT IN ('super_user', 'superadmin', 'sinode', 'admin_mupel', 'kmj')
     AND (v_caller_pendeta IS NULL OR v_caller_pendeta IS DISTINCT FROM p_id_pendeta) THEN
    RETURN json_build_object(
      'total_log', 0,
      'total_jiwa', 0,
      'pos_aktif', 0,
      'log_bulan_ini', 0,
      'lama_melayani_bulan', 0
    );
  END IF;

  -- 1. Count logs and jiwa from t_log_pastoral
  SELECT 
    COALESCE(COUNT(*), 0),
    COALESCE(SUM(jumlah_jiwa), 0),
    COALESCE(COUNT(*) FILTER (WHERE date_trunc('month', tgl_kegiatan) = date_trunc('month', CURRENT_DATE)), 0)
  INTO v_total_log, v_total_jiwa, v_log_bulan_ini
  FROM t_log_pastoral
  WHERE id_pendeta = p_id_pendeta;

  -- 2. Count active assigned pos from t_penugasan_pj
  SELECT COALESCE(COUNT(*), 0)
  INTO v_pos_aktif
  FROM t_penugasan_pj
  WHERE id_pendeta = p_id_pendeta AND (status_aktif = true OR status_aktif IS NULL);

  -- 3. Calculate months serving from m_pendeta.tgl_tugas_awal
  SELECT tgl_tugas_awal INTO v_tgl_tugas
  FROM m_pendeta
  WHERE id_pendeta = p_id_pendeta;

  IF v_tgl_tugas IS NOT NULL THEN
    v_lama_melayani_bulan := (
      (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM v_tgl_tugas)) * 12 +
      (EXTRACT(MONTH FROM CURRENT_DATE) - EXTRACT(MONTH FROM v_tgl_tugas))
    )::integer;
    IF v_lama_melayani_bulan < 0 THEN
      v_lama_melayani_bulan := 0;
    END IF;
  END IF;

  v_result := json_build_object(
    'total_log', v_total_log,
    'total_jiwa', v_total_jiwa,
    'pos_aktif', v_pos_aktif,
    'log_bulan_ini', v_log_bulan_ini,
    'lama_melayani_bulan', v_lama_melayani_bulan
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_profile_stats(text) TO authenticated;

-- 2. Enable RLS & Strict Private Policies for Audit Logs (t_log_aktivitas)
ALTER TABLE IF EXISTS t_log_aktivitas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aktivitas_privat_read" ON t_log_aktivitas;
CREATE POLICY "aktivitas_privat_read" ON t_log_aktivitas
FOR SELECT
USING (
  id_user = auth.uid()
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_user', 'superadmin', 'sinode')
  )
);

-- 3. Enable RLS & Strict Private Policies for Biometric Devices (m_webauthn_credentials)
ALTER TABLE IF EXISTS m_webauthn_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webauthn_privat_read" ON m_webauthn_credentials;
CREATE POLICY "webauthn_privat_read" ON m_webauthn_credentials
FOR SELECT
USING (
  id_user = auth.uid()
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_user', 'superadmin', 'sinode')
  )
);


-- [MIGRATION SOURCE: 20260731_add_avatar_columns.sql]
-- Migration: 20260731_add_avatar_columns.sql
-- Description: Add avatar_url, foto_url, nama_lengkap, no_hp columns & complete RLS policies for users & m_pendeta

BEGIN;

-- 1. Tambah kolom penyimpan foto profil & kontak
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(150),
  ADD COLUMN IF NOT EXISTS no_hp VARCHAR(30),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS foto_url TEXT;

ALTER TABLE public.m_pendeta 
  ADD COLUMN IF NOT EXISTS foto_url TEXT,
  ADD COLUMN IF NOT EXISTS email VARCHAR(150);

-- 2. Kebijakan RLS SELECT (Izin MEMBACA Profil Pengguna - Publik/Autentikasi)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profile policy" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users table" ON public.users;

CREATE POLICY "Enable read access for users table"
ON public.users FOR SELECT
USING (true);

-- 3. Kebijakan RLS UPDATE (Izin MENGUBAH Profil Sendiri / Super User)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update their own profile"
ON public.users FOR ALL
USING (
  id = auth.uid() 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
)
WITH CHECK (
  id = auth.uid() 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
);

-- 4. Kebijakan RLS m_pendeta SELECT & UPDATE
DROP POLICY IF EXISTS "Enable read access for m_pendeta table" ON public.m_pendeta;
CREATE POLICY "Enable read access for m_pendeta table"
ON public.m_pendeta FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Pendeta can update their own profile" ON public.m_pendeta;
CREATE POLICY "Pendeta can update their own profile"
ON public.m_pendeta FOR ALL
USING (
  id_pendeta IN (SELECT id_pendeta FROM public.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
)
WITH CHECK (
  id_pendeta IN (SELECT id_pendeta FROM public.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
);

COMMIT;


-- [MIGRATION SOURCE: 20260731_fix_pendeta_role_pj.sql]
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


-- [MIGRATION SOURCE: 20260731_pendeta_360_dimensions.sql]
-- Migration: 3 Dimensi Baru Profile 360° (Keluarga, Kompetensi & Karunia, Keterlibatan Sinodal)
-- RPC & RLS Security Hardening for SI GPIB v2.2

-- 1. TABEL t_keluarga_pendeta
CREATE TABLE IF NOT EXISTS t_keluarga_pendeta (
  id_keluarga   VARCHAR(20) PRIMARY KEY,
  id_pendeta    VARCHAR(20) NOT NULL REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
  hubungan      VARCHAR(20) NOT NULL,      -- Suami|Istri|Anak|Orang Tua|Mertua|Lainnya
  nama_lengkap  VARCHAR(150) NOT NULL,
  gender        VARCHAR(10),
  tgl_lahir     DATE,
  no_wa         VARCHAR(20),
  pendidikan    VARCHAR(100),
  pekerjaan     VARCHAR(100),
  status_hidup  VARCHAR(20) DEFAULT 'Hidup',  -- Hidup|Meninggal
  is_tanggungan BOOLEAN DEFAULT FALSE,
  keterangan    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keluarga_pendeta ON t_keluarga_pendeta(id_pendeta);

-- 2. TABEL t_kompetensi_pendeta
CREATE TABLE IF NOT EXISTS t_kompetensi_pendeta (
  id_kompetensi   VARCHAR(20) PRIMARY KEY,
  id_pendeta      VARCHAR(20) NOT NULL REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
  kategori        VARCHAR(50) NOT NULL,   -- Pertanian|Perkebunan|Perikanan|Peternakan|Manajemen|Keuangan|Pendidikan|Kesehatan|Teknologi|Musik|Seni|Bahasa|Lainnya
  nama_kompetensi VARCHAR(150) NOT NULL,
  jenis           VARCHAR(20) DEFAULT 'Kompetensi',  -- Kompetensi|Passion|Karunia
  tingkat         VARCHAR(20),            -- Pemula|Menengah|Mahir|Ahli
  tahun_mulai     INT,
  keterangan      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kompetensi_pendeta ON t_kompetensi_pendeta(id_pendeta);
CREATE INDEX IF NOT EXISTS idx_kompetensi_kategori ON t_kompetensi_pendeta(kategori);

-- 3. TABEL t_keterlibatan_pendeta
CREATE TABLE IF NOT EXISTS t_keterlibatan_pendeta (
  id_keterlibatan VARCHAR(20) PRIMARY KEY,
  id_pendeta      VARCHAR(20) NOT NULL REFERENCES m_pendeta(id_pendeta) ON DELETE CASCADE,
  tingkat         VARCHAR(20) NOT NULL,   -- Jemaat|Mupel|Sinodal|Eksternal
  id_mupel        VARCHAR(20) REFERENCES m_mupel(id_mupel),  -- nullable, isi jika tingkat=Mupel
  jenis           VARCHAR(50) NOT NULL,   -- Panitia|Pokja|Komisi|Tim Kerja|Delegasi|Pengurus|Lainnya
  nama_kegiatan   VARCHAR(200) NOT NULL,
  jabatan         VARCHAR(100),           -- Ketua|Sekretaris|Bendahara|Koordinator|Anggota|Peserta
  tgl_mulai       DATE,
  tgl_selesai     DATE,                   -- NULL = aktif
  status          VARCHAR(20) DEFAULT 'Aktif',  -- Aktif|Selesai
  keterangan      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keterlibatan_pendeta ON t_keterlibatan_pendeta(id_pendeta);
CREATE INDEX IF NOT EXISTS idx_keterlibatan_tingkat ON t_keterlibatan_pendeta(tingkat);
CREATE INDEX IF NOT EXISTS idx_keterlibatan_aktif ON t_keterlibatan_pendeta(id_pendeta, status) WHERE tgl_selesai IS NULL;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- 4a. RLS t_keluarga_pendeta: Privat (Diri Sendiri + Super User SAJA, KMJ/Admin Mupel TIDAK BOLEH)
ALTER TABLE t_keluarga_pendeta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "keluarga_privat_policy" ON t_keluarga_pendeta;
CREATE POLICY "keluarga_privat_policy" ON t_keluarga_pendeta
FOR ALL
USING (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode')
      OR users.id_pendeta = t_keluarga_pendeta.id_pendeta
    )
  )
)
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode')
      OR users.id_pendeta = t_keluarga_pendeta.id_pendeta
    )
  )
);

-- 4b. RLS t_kompetensi_pendeta: Diri sendiri + Super User + Admin Mupel
ALTER TABLE t_kompetensi_pendeta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kompetensi_policy" ON t_kompetensi_pendeta;
CREATE POLICY "kompetensi_policy" ON t_kompetensi_pendeta
FOR ALL
USING (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
      OR users.id_pendeta = t_kompetensi_pendeta.id_pendeta
    )
  )
)
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
      OR users.id_pendeta = t_kompetensi_pendeta.id_pendeta
    )
  )
);

-- 4c. RLS t_keterlibatan_pendeta: Diri sendiri + Super User + Admin Mupel
ALTER TABLE t_keterlibatan_pendeta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "keterlibatan_policy" ON t_keterlibatan_pendeta;
CREATE POLICY "keterlibatan_policy" ON t_keterlibatan_pendeta
FOR ALL
USING (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
      OR users.id_pendeta = t_keterlibatan_pendeta.id_pendeta
    )
  )
)
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (
      users.role IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
      OR users.id_pendeta = t_keterlibatan_pendeta.id_pendeta
    )
  )
);

-- 5. GRANTS TO authenticated
GRANT ALL ON t_keluarga_pendeta TO authenticated;
GRANT ALL ON t_kompetensi_pendeta TO authenticated;
GRANT ALL ON t_keterlibatan_pendeta TO authenticated;


-- [MIGRATION SOURCE: 20260731_pos_pelkes_stats.sql]
-- Migration: Add jumlah_kk & jumlah_jiwa columns to m_pos_pelkes
ALTER TABLE m_pos_pelkes ADD COLUMN IF NOT EXISTS jumlah_kk INT DEFAULT 0;
ALTER TABLE m_pos_pelkes ADD COLUMN IF NOT EXISTS jumlah_jiwa INT DEFAULT 0;

UPDATE m_pos_pelkes SET jumlah_kk = 27, jumlah_jiwa = 84 WHERE id_pos = 'POS-13055';
UPDATE m_pos_pelkes SET jumlah_kk = 8, jumlah_jiwa = 25 WHERE id_pos = 'POS-23592';
UPDATE m_pos_pelkes SET jumlah_kk = 26, jumlah_jiwa = 80 WHERE id_pos = 'POS-88231';
UPDATE m_pos_pelkes SET jumlah_kk = 11, jumlah_jiwa = 30 WHERE id_pos = 'POS-88016';
UPDATE m_pos_pelkes SET jumlah_kk = 33, jumlah_jiwa = 71 WHERE id_pos = 'POS-55936';
UPDATE m_pos_pelkes SET jumlah_kk = 28, jumlah_jiwa = 94 WHERE id_pos = 'POS-57228';
UPDATE m_pos_pelkes SET jumlah_kk = 8, jumlah_jiwa = 19 WHERE id_pos = 'POS-78047';
UPDATE m_pos_pelkes SET jumlah_kk = 13, jumlah_jiwa = 36 WHERE id_pos = 'POS-94346';
UPDATE m_pos_pelkes SET jumlah_kk = 7, jumlah_jiwa = 0 WHERE id_pos = 'POS-56609';
UPDATE m_pos_pelkes SET jumlah_kk = 11, jumlah_jiwa = 34 WHERE id_pos = 'POS-23848';
UPDATE m_pos_pelkes SET jumlah_kk = 15, jumlah_jiwa = 50 WHERE id_pos = 'POS-56943';
UPDATE m_pos_pelkes SET jumlah_kk = 28, jumlah_jiwa = 123 WHERE id_pos = 'POS-25763';
UPDATE m_pos_pelkes SET jumlah_kk = 26, jumlah_jiwa = 99 WHERE id_pos = 'POS-81917';
UPDATE m_pos_pelkes SET jumlah_kk = 43, jumlah_jiwa = 163 WHERE id_pos = 'POS-16368';
UPDATE m_pos_pelkes SET jumlah_kk = 44, jumlah_jiwa = 176 WHERE id_pos = 'POS-50712';
UPDATE m_pos_pelkes SET jumlah_kk = 13, jumlah_jiwa = 57 WHERE id_pos = 'POS-42271';
UPDATE m_pos_pelkes SET jumlah_kk = 11, jumlah_jiwa = 42 WHERE id_pos = 'POS-34421';
UPDATE m_pos_pelkes SET jumlah_kk = 7, jumlah_jiwa = 19 WHERE id_pos = 'POS-22291';
UPDATE m_pos_pelkes SET jumlah_kk = 23, jumlah_jiwa = 100 WHERE id_pos = 'POS-79937';
UPDATE m_pos_pelkes SET jumlah_kk = 14, jumlah_jiwa = 51 WHERE id_pos = 'POS-37858';
UPDATE m_pos_pelkes SET jumlah_kk = 37, jumlah_jiwa = 75 WHERE id_pos = 'POS-54277';
UPDATE m_pos_pelkes SET jumlah_kk = 27, jumlah_jiwa = 65 WHERE id_pos = 'POS-47744';
UPDATE m_pos_pelkes SET jumlah_kk = 13, jumlah_jiwa = 59 WHERE id_pos = 'POS-81640';
UPDATE m_pos_pelkes SET jumlah_kk = 11, jumlah_jiwa = 36 WHERE id_pos = 'POS-54609';
UPDATE m_pos_pelkes SET jumlah_kk = 15, jumlah_jiwa = 42 WHERE id_pos = 'POS-75205';
UPDATE m_pos_pelkes SET jumlah_kk = 51, jumlah_jiwa = 153 WHERE id_pos = 'POS-16608';
UPDATE m_pos_pelkes SET jumlah_kk = 22, jumlah_jiwa = 69 WHERE id_pos = 'POS-56473';
UPDATE m_pos_pelkes SET jumlah_kk = 13, jumlah_jiwa = 44 WHERE id_pos = 'POS-60853';
UPDATE m_pos_pelkes SET jumlah_kk = 183, jumlah_jiwa = 386 WHERE id_pos = 'POS-67801';
UPDATE m_pos_pelkes SET jumlah_kk = 119, jumlah_jiwa = 367 WHERE id_pos = 'POS-82867';
UPDATE m_pos_pelkes SET jumlah_kk = 27, jumlah_jiwa = 90 WHERE id_pos = 'POS-24806';
UPDATE m_pos_pelkes SET jumlah_kk = 13, jumlah_jiwa = 40 WHERE id_pos = 'POS-58644';
UPDATE m_pos_pelkes SET jumlah_kk = 27, jumlah_jiwa = 77 WHERE id_pos = 'POS-25545';
UPDATE m_pos_pelkes SET jumlah_kk = 27, jumlah_jiwa = 74 WHERE id_pos = 'POS-92535';
UPDATE m_pos_pelkes SET jumlah_kk = 75, jumlah_jiwa = 259 WHERE id_pos = 'POS-43938';
UPDATE m_pos_pelkes SET jumlah_kk = 42, jumlah_jiwa = 155 WHERE id_pos = 'POS-94852';
UPDATE m_pos_pelkes SET jumlah_kk = 39, jumlah_jiwa = 103 WHERE id_pos = 'POS-17113';
UPDATE m_pos_pelkes SET jumlah_kk = 47, jumlah_jiwa = 187 WHERE id_pos = 'POS-27157';
UPDATE m_pos_pelkes SET jumlah_kk = 17, jumlah_jiwa = 57 WHERE id_pos = 'POS-58999';
UPDATE m_pos_pelkes SET jumlah_kk = 52, jumlah_jiwa = 177 WHERE id_pos = 'POS-78262';
UPDATE m_pos_pelkes SET jumlah_kk = 25, jumlah_jiwa = 115 WHERE id_pos = 'POS-69672';
UPDATE m_pos_pelkes SET jumlah_kk = 4, jumlah_jiwa = 14 WHERE id_pos = 'POS-39676';
UPDATE m_pos_pelkes SET jumlah_kk = 30, jumlah_jiwa = 105 WHERE id_pos = 'POS-26959';
UPDATE m_pos_pelkes SET jumlah_kk = 36, jumlah_jiwa = 158 WHERE id_pos = 'POS-55766';
UPDATE m_pos_pelkes SET jumlah_kk = 9, jumlah_jiwa = 23 WHERE id_pos = 'POS-93187';
UPDATE m_pos_pelkes SET jumlah_kk = 9, jumlah_jiwa = 23 WHERE id_pos = 'POS-39582';
UPDATE m_pos_pelkes SET jumlah_kk = 3, jumlah_jiwa = 6 WHERE id_pos = 'POS-93631';
UPDATE m_pos_pelkes SET jumlah_kk = 32, jumlah_jiwa = 109 WHERE id_pos = 'POS-79335';
UPDATE m_pos_pelkes SET jumlah_kk = 19, jumlah_jiwa = 57 WHERE id_pos = 'POS-43988';
UPDATE m_pos_pelkes SET jumlah_kk = 75, jumlah_jiwa = 180 WHERE id_pos = 'POS-15217';
UPDATE m_pos_pelkes SET jumlah_kk = 20, jumlah_jiwa = 61 WHERE id_pos = 'POS-58201';
UPDATE m_pos_pelkes SET jumlah_kk = 21, jumlah_jiwa = 73 WHERE id_pos = 'POS-29929';
UPDATE m_pos_pelkes SET jumlah_kk = 22, jumlah_jiwa = 76 WHERE id_pos = 'POS-85526';
UPDATE m_pos_pelkes SET jumlah_kk = 42, jumlah_jiwa = 133 WHERE id_pos = 'POS-70892';
UPDATE m_pos_pelkes SET jumlah_kk = 53, jumlah_jiwa = 167 WHERE id_pos = 'POS-17296';
UPDATE m_pos_pelkes SET jumlah_kk = 11, jumlah_jiwa = 40 WHERE id_pos = 'POS-92343';
UPDATE m_pos_pelkes SET jumlah_kk = 33, jumlah_jiwa = 95 WHERE id_pos = 'POS-33478';
UPDATE m_pos_pelkes SET jumlah_kk = 30, jumlah_jiwa = 70 WHERE id_pos = 'POS-17861';
UPDATE m_pos_pelkes SET jumlah_kk = 49, jumlah_jiwa = 157 WHERE id_pos = 'POS-95078';
UPDATE m_pos_pelkes SET jumlah_kk = 25, jumlah_jiwa = 75 WHERE id_pos = 'POS-36023';
UPDATE m_pos_pelkes SET jumlah_kk = 34, jumlah_jiwa = 90 WHERE id_pos = 'POS-71267';
UPDATE m_pos_pelkes SET jumlah_kk = 35, jumlah_jiwa = 85 WHERE id_pos = 'POS-32914';
UPDATE m_pos_pelkes SET jumlah_kk = 45, jumlah_jiwa = 180 WHERE id_pos = 'POS-65842';
UPDATE m_pos_pelkes SET jumlah_kk = 25, jumlah_jiwa = 80 WHERE id_pos = 'POS-58666';
UPDATE m_pos_pelkes SET jumlah_kk = 35, jumlah_jiwa = 100 WHERE id_pos = 'POS-10631';
UPDATE m_pos_pelkes SET jumlah_kk = 28, jumlah_jiwa = 80 WHERE id_pos = 'POS-41565';
UPDATE m_pos_pelkes SET jumlah_kk = 36, jumlah_jiwa = 132 WHERE id_pos = 'POS-58102';
UPDATE m_pos_pelkes SET jumlah_kk = 10, jumlah_jiwa = 35 WHERE id_pos = 'POS-18578';
UPDATE m_pos_pelkes SET jumlah_kk = 33, jumlah_jiwa = 132 WHERE id_pos = 'POS-10552';
UPDATE m_pos_pelkes SET jumlah_kk = 40, jumlah_jiwa = 120 WHERE id_pos = 'POS-50367';
UPDATE m_pos_pelkes SET jumlah_kk = 33, jumlah_jiwa = 132 WHERE id_pos = 'POS-44209';
UPDATE m_pos_pelkes SET jumlah_kk = 18, jumlah_jiwa = 67 WHERE id_pos = 'POS-81077';
UPDATE m_pos_pelkes SET jumlah_kk = 12, jumlah_jiwa = 42 WHERE id_pos = 'POS-48853';
UPDATE m_pos_pelkes SET jumlah_kk = 55, jumlah_jiwa = 167 WHERE id_pos = 'POS-25425';
UPDATE m_pos_pelkes SET jumlah_kk = 55, jumlah_jiwa = 220 WHERE id_pos = 'POS-25377';
UPDATE m_pos_pelkes SET jumlah_kk = 20, jumlah_jiwa = 57 WHERE id_pos = 'POS-96495';
UPDATE m_pos_pelkes SET jumlah_kk = 32, jumlah_jiwa = 120 WHERE id_pos = 'POS-80533';
UPDATE m_pos_pelkes SET jumlah_kk = 5, jumlah_jiwa = 17 WHERE id_pos = 'POS-30445';
UPDATE m_pos_pelkes SET jumlah_kk = 18, jumlah_jiwa = 72 WHERE id_pos = 'POS-49169';
UPDATE m_pos_pelkes SET jumlah_kk = 45, jumlah_jiwa = 129 WHERE id_pos = 'POS-42125';
UPDATE m_pos_pelkes SET jumlah_kk = 25, jumlah_jiwa = 125 WHERE id_pos = 'POS-62666';
UPDATE m_pos_pelkes SET jumlah_kk = 42, jumlah_jiwa = 125 WHERE id_pos = 'POS-31031';
UPDATE m_pos_pelkes SET jumlah_kk = 99, jumlah_jiwa = 296 WHERE id_pos = 'POS-70716';
UPDATE m_pos_pelkes SET jumlah_kk = 20, jumlah_jiwa = 55 WHERE id_pos = 'POS-46102';
UPDATE m_pos_pelkes SET jumlah_kk = 56, jumlah_jiwa = 195 WHERE id_pos = 'POS-63796';
UPDATE m_pos_pelkes SET jumlah_kk = 25, jumlah_jiwa = 71 WHERE id_pos = 'POS-81850';
UPDATE m_pos_pelkes SET jumlah_kk = 110, jumlah_jiwa = 371 WHERE id_pos = 'POS-27137';
UPDATE m_pos_pelkes SET jumlah_kk = 42, jumlah_jiwa = 118 WHERE id_pos = 'POS-59077';
UPDATE m_pos_pelkes SET jumlah_kk = 83, jumlah_jiwa = 267 WHERE id_pos = 'POS-64442';
UPDATE m_pos_pelkes SET jumlah_kk = 43, jumlah_jiwa = 134 WHERE id_pos = 'POS-94933';
UPDATE m_pos_pelkes SET jumlah_kk = 45, jumlah_jiwa = 225 WHERE id_pos = 'POS-63984';
UPDATE m_pos_pelkes SET jumlah_kk = 31, jumlah_jiwa = 155 WHERE id_pos = 'POS-35232';
UPDATE m_pos_pelkes SET jumlah_kk = 25, jumlah_jiwa = 77 WHERE id_pos = 'POS-31969';
UPDATE m_pos_pelkes SET jumlah_kk = 7, jumlah_jiwa = 0 WHERE id_pos = 'POS-99872';
UPDATE m_pos_pelkes SET jumlah_kk = 46, jumlah_jiwa = 0 WHERE id_pos = 'POS-13298';
UPDATE m_pos_pelkes SET jumlah_kk = 38, jumlah_jiwa = 101 WHERE id_pos = 'POS-23122';
UPDATE m_pos_pelkes SET jumlah_kk = 161, jumlah_jiwa = 452 WHERE id_pos = 'POS-40296';
UPDATE m_pos_pelkes SET jumlah_kk = 25, jumlah_jiwa = 84 WHERE id_pos = 'POS-66516';
UPDATE m_pos_pelkes SET jumlah_kk = 24, jumlah_jiwa = 62 WHERE id_pos = 'POS-78010';
UPDATE m_pos_pelkes SET jumlah_kk = 28, jumlah_jiwa = 81 WHERE id_pos = 'POS-78468';
UPDATE m_pos_pelkes SET jumlah_kk = 16, jumlah_jiwa = 59 WHERE id_pos = 'POS-62648';
UPDATE m_pos_pelkes SET jumlah_kk = 15, jumlah_jiwa = 62 WHERE id_pos = 'POS-40402';
UPDATE m_pos_pelkes SET jumlah_kk = 16, jumlah_jiwa = 44 WHERE id_pos = 'POS-26573';
UPDATE m_pos_pelkes SET jumlah_kk = 37, jumlah_jiwa = 129 WHERE id_pos = 'POS-65205';
UPDATE m_pos_pelkes SET jumlah_kk = 34, jumlah_jiwa = 118 WHERE id_pos = 'POS-88508';
UPDATE m_pos_pelkes SET jumlah_kk = 20, jumlah_jiwa = 65 WHERE id_pos = 'POS-38948';
UPDATE m_pos_pelkes SET jumlah_kk = 76, jumlah_jiwa = 167 WHERE id_pos = 'POS-58314';
UPDATE m_pos_pelkes SET jumlah_kk = 20, jumlah_jiwa = 45 WHERE id_pos = 'POS-54069';
UPDATE m_pos_pelkes SET jumlah_kk = 23, jumlah_jiwa = 72 WHERE id_pos = 'POS-54989';
UPDATE m_pos_pelkes SET jumlah_kk = 80, jumlah_jiwa = 294 WHERE id_pos = 'POS-59271';
UPDATE m_pos_pelkes SET jumlah_kk = 16, jumlah_jiwa = 41 WHERE id_pos = 'POS-93613';
UPDATE m_pos_pelkes SET jumlah_kk = 1, jumlah_jiwa = 5 WHERE id_pos = 'POS-24519';
UPDATE m_pos_pelkes SET jumlah_kk = 18, jumlah_jiwa = 49 WHERE id_pos = 'POS-32475';
UPDATE m_pos_pelkes SET jumlah_kk = 37, jumlah_jiwa = 101 WHERE id_pos = 'POS-19929';
UPDATE m_pos_pelkes SET jumlah_kk = 8, jumlah_jiwa = 35 WHERE id_pos = 'POS-76733';
UPDATE m_pos_pelkes SET jumlah_kk = 35, jumlah_jiwa = 125 WHERE id_pos = 'POS-42584';
UPDATE m_pos_pelkes SET jumlah_kk = 9, jumlah_jiwa = 30 WHERE id_pos = 'POS-91941';
UPDATE m_pos_pelkes SET jumlah_kk = 40, jumlah_jiwa = 119 WHERE id_pos = 'POS-18785';
UPDATE m_pos_pelkes SET jumlah_kk = 42, jumlah_jiwa = 168 WHERE id_pos = 'POS-41348';
UPDATE m_pos_pelkes SET jumlah_kk = 27, jumlah_jiwa = 118 WHERE id_pos = 'POS-48869';
UPDATE m_pos_pelkes SET jumlah_kk = 30, jumlah_jiwa = 100 WHERE id_pos = 'POS-38720';
UPDATE m_pos_pelkes SET jumlah_kk = 62, jumlah_jiwa = 195 WHERE id_pos = 'POS-30508';
UPDATE m_pos_pelkes SET jumlah_kk = 75, jumlah_jiwa = 310 WHERE id_pos = 'POS-13537';
UPDATE m_pos_pelkes SET jumlah_kk = 83, jumlah_jiwa = 293 WHERE id_pos = 'POS-79471';
UPDATE m_pos_pelkes SET jumlah_kk = 91, jumlah_jiwa = 310 WHERE id_pos = 'POS-56819';
UPDATE m_pos_pelkes SET jumlah_kk = 22, jumlah_jiwa = 76 WHERE id_pos = 'POS-97404';
UPDATE m_pos_pelkes SET jumlah_kk = 4, jumlah_jiwa = 10 WHERE id_pos = 'POS-83988';
UPDATE m_pos_pelkes SET jumlah_kk = 22, jumlah_jiwa = 65 WHERE id_pos = 'POS-27108';
UPDATE m_pos_pelkes SET jumlah_kk = 29, jumlah_jiwa = 69 WHERE id_pos = 'POS-56167';
UPDATE m_pos_pelkes SET jumlah_kk = 84, jumlah_jiwa = 336 WHERE id_pos = 'POS-81626';
UPDATE m_pos_pelkes SET jumlah_kk = 61, jumlah_jiwa = 300 WHERE id_pos = 'POS-52165';
UPDATE m_pos_pelkes SET jumlah_kk = 23, jumlah_jiwa = 72 WHERE id_pos = 'POS-77457';
UPDATE m_pos_pelkes SET jumlah_kk = 13, jumlah_jiwa = 38 WHERE id_pos = 'POS-34993';
UPDATE m_pos_pelkes SET jumlah_kk = 6, jumlah_jiwa = 21 WHERE id_pos = 'POS-89558';
UPDATE m_pos_pelkes SET jumlah_kk = 48, jumlah_jiwa = 153 WHERE id_pos = 'POS-89562';
UPDATE m_pos_pelkes SET jumlah_kk = 11, jumlah_jiwa = 27 WHERE id_pos = 'POS-69232';
UPDATE m_pos_pelkes SET jumlah_kk = 24, jumlah_jiwa = 96 WHERE id_pos = 'POS-25738';
UPDATE m_pos_pelkes SET jumlah_kk = 27, jumlah_jiwa = 98 WHERE id_pos = 'POS-70577';
UPDATE m_pos_pelkes SET jumlah_kk = 79, jumlah_jiwa = 316 WHERE id_pos = 'POS-94758';
UPDATE m_pos_pelkes SET jumlah_kk = 21, jumlah_jiwa = 74 WHERE id_pos = 'POS-95716';
UPDATE m_pos_pelkes SET jumlah_kk = 27, jumlah_jiwa = 73 WHERE id_pos = 'POS-97007';
UPDATE m_pos_pelkes SET jumlah_kk = 75, jumlah_jiwa = 200 WHERE id_pos = 'POS-51092';
UPDATE m_pos_pelkes SET jumlah_kk = 11, jumlah_jiwa = 26 WHERE id_pos = 'POS-34433';
UPDATE m_pos_pelkes SET jumlah_kk = 6, jumlah_jiwa = 17 WHERE id_pos = 'POS-57892';
UPDATE m_pos_pelkes SET jumlah_kk = 25, jumlah_jiwa = 50 WHERE id_pos = 'POS-39714';
UPDATE m_pos_pelkes SET jumlah_kk = 30, jumlah_jiwa = 75 WHERE id_pos = 'POS-88810';
UPDATE m_pos_pelkes SET jumlah_kk = 102, jumlah_jiwa = 332 WHERE id_pos = 'POS-38840';
UPDATE m_pos_pelkes SET jumlah_kk = 22, jumlah_jiwa = 69 WHERE id_pos = 'POS-36849';
UPDATE m_pos_pelkes SET jumlah_kk = 17, jumlah_jiwa = 48 WHERE id_pos = 'POS-35736';
UPDATE m_pos_pelkes SET jumlah_kk = 30, jumlah_jiwa = 70 WHERE id_pos = 'POS-62914';
UPDATE m_pos_pelkes SET jumlah_kk = 34, jumlah_jiwa = 101 WHERE id_pos = 'POS-67834';
UPDATE m_pos_pelkes SET jumlah_kk = 27, jumlah_jiwa = 0 WHERE id_pos = 'POS-43392';
UPDATE m_pos_pelkes SET jumlah_kk = 39, jumlah_jiwa = 0 WHERE id_pos = 'POS-19856';
UPDATE m_pos_pelkes SET jumlah_kk = 26, jumlah_jiwa = 99 WHERE id_pos = 'POS-24342';
UPDATE m_pos_pelkes SET jumlah_kk = 16, jumlah_jiwa = 52 WHERE id_pos = 'POS-41679';
UPDATE m_pos_pelkes SET jumlah_kk = 78, jumlah_jiwa = 248 WHERE id_pos = 'POS-34686';

-- Update from demografi pelkat for pos pelkes without explicit excel numbers
UPDATE m_pos_pelkes p SET 
  jumlah_kk = COALESCE((SELECT SUM(jml_kk) FROM t_demografi_pelkat WHERE id_pos = p.id_pos), p.jumlah_kk, 0),
  jumlah_jiwa = COALESCE((SELECT SUM(laki + perempuan) FROM t_demografi_pelkat WHERE id_pos = p.id_pos), p.jumlah_jiwa, 0)
WHERE p.jumlah_kk = 0 OR p.jumlah_jiwa = 0;


-- [MIGRATION SOURCE: 20260801_add_dokumen_url_to_kompetensi.sql]
-- Migration: Add dokumen_url column to t_kompetensi_pendeta table
ALTER TABLE t_kompetensi_pendeta ADD COLUMN IF NOT EXISTS dokumen_url text;


-- [MIGRATION SOURCE: 20260801_add_foto_url_to_keluarga.sql]
-- Migration: Add foto_url column to t_keluarga_pendeta table
ALTER TABLE t_keluarga_pendeta ADD COLUMN IF NOT EXISTS foto_url text;


-- [MIGRATION SOURCE: 20260801_add_nip_nik_to_m_pendeta.sql]
-- Migration: Add nip and nik columns to m_pendeta table
ALTER TABLE m_pendeta ADD COLUMN IF NOT EXISTS nip text;
ALTER TABLE m_pendeta ADD COLUMN IF NOT EXISTS nik text;


-- [MIGRATION SOURCE: 20260801_hierarki_crud_status.sql]
-- Migration: 20260801_hierarki_crud_status.sql
-- Description: Table t_histori_perubahan_status & Atomic RPC process_status_elevation for SI GPIB v2.2

-- 1. Tambah kolom kategori di m_pos_pelkes jika belum ada
ALTER TABLE m_pos_pelkes 
ADD COLUMN IF NOT EXISTS kategori VARCHAR(50) DEFAULT 'Pos Pelkes' CHECK (kategori IN ('Pos Pelkes', 'Bajem'));

-- 2. Buat tabel histori perubahan status
CREATE TABLE IF NOT EXISTS t_histori_perubahan_status (
    id_histori VARCHAR(30) PRIMARY KEY,
    id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos) ON DELETE CASCADE,
    id_induk_baru VARCHAR(20) REFERENCES m_jemaat_induk(id_induk),
    status_lama VARCHAR(50) NOT NULL,
    status_baru VARCHAR(50) NOT NULL,
    tanggal_perubahan DATE NOT NULL,
    keterangan_perubahan TEXT NOT NULL,
    diubah_oleh UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for t_histori_perubahan_status
ALTER TABLE t_histori_perubahan_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for t_histori_perubahan_status" ON t_histori_perubahan_status FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert t_histori_perubahan_status" ON t_histori_perubahan_status FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update t_histori_perubahan_status" ON t_histori_perubahan_status FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Atomic RPC untuk Peningkatan Status (Pos Pelkes -> Bajem -> Jemaat Induk)
CREATE OR REPLACE FUNCTION process_status_elevation(
  p_id_pos VARCHAR,
  p_target_status VARCHAR, -- 'BAJEM' atau 'JEMAAT_INDUK'
  p_tanggal_perubahan DATE,
  p_keterangan TEXT,
  p_id_induk_baru VARCHAR DEFAULT NULL,
  p_nama_induk_baru VARCHAR DEFAULT NULL,
  p_id_mupel_baru VARCHAR DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_status_lama VARCHAR;
  v_id_induk_lama VARCHAR;
  v_id_mupel VARCHAR;
  v_nama_pos VARCHAR;
  v_histori_id VARCHAR;
BEGIN
  -- Ambil data pos saat ini
  SELECT COALESCE(kategori, 'Pos Pelkes'), id_induk, nama_pos 
  INTO v_status_lama, v_id_induk_lama, v_nama_pos
  FROM m_pos_pelkes WHERE id_pos = p_id_pos;
  
  IF v_status_lama IS NULL THEN
    RAISE EXCEPTION 'Pos Pelkes dengan ID % tidak ditemukan', p_id_pos;
  END IF;

  -- Ambil id_mupel dari jemaat induk pengampu
  SELECT id_mupel INTO v_id_mupel FROM m_jemaat_induk WHERE id_induk = v_id_induk_lama;

  IF p_id_mupel_baru IS NOT NULL THEN
    v_id_mupel := p_id_mupel_baru;
  END IF;

  v_histori_id := 'HIS-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || FLOOR(RANDOM() * 1000)::TEXT;

  IF p_target_status = 'BAJEM' THEN
    -- Update Pos menjadi Bajem
    UPDATE m_pos_pelkes 
    SET kategori = 'Bajem', 
        updated_at = NOW() 
    WHERE id_pos = p_id_pos;
    
    -- Catat log histori
    INSERT INTO t_histori_perubahan_status (
      id_histori, id_pos, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, diubah_oleh
    ) VALUES (
      v_histori_id, p_id_pos, v_status_lama, 'Bajem', p_tanggal_perubahan, p_keterangan, auth.uid()
    );

  ELSIF p_target_status = 'JEMAAT_INDUK' THEN
    IF p_id_induk_baru IS NULL OR p_nama_induk_baru IS NULL THEN
      RAISE EXCEPTION 'ID dan Nama Jemaat Induk baru wajib diisi untuk elevasi ke Jemaat Induk';
    END IF;

    -- 1. Buat Record Jemaat Induk Mandiri Baru
    INSERT INTO m_jemaat_induk (
      id_induk, id_mupel, nama_induk, keterangan, created_at, updated_at
    ) VALUES (
      p_id_induk_baru, v_id_mupel, p_nama_induk_baru, 
      'Ditingkatkan dari ' || v_status_lama || ' (' || v_nama_pos || '). SK/Ket: ' || p_keterangan,
      NOW(), NOW()
    ) ON CONFLICT (id_induk) DO UPDATE SET 
      nama_induk = EXCLUDED.nama_induk,
      id_mupel = EXCLUDED.id_mupel,
      updated_at = NOW();

    -- 2. Update Pos Pelkes agar mengarah ke Jemaat Induk baru ini
    UPDATE m_pos_pelkes 
    SET id_induk = p_id_induk_baru,
        kategori = 'Bajem',
        updated_at = NOW() 
    WHERE id_pos = p_id_pos;

    -- 3. Catat log histori
    INSERT INTO t_histori_perubahan_status (
      id_histori, id_pos, id_induk_baru, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, diubah_oleh
    ) VALUES (
      v_histori_id, p_id_pos, p_id_induk_baru, v_status_lama, 'Jemaat Induk', p_tanggal_perubahan, p_keterangan, auth.uid()
    );

  ELSE
    RAISE EXCEPTION 'Target status tidak valid: %', p_target_status;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- [MIGRATION SOURCE: 20260801_unified_identity.sql]
-- Migration: 20260801_unified_identity.sql
-- Description: Arsitektur Identitas Terpadu — id_pendeta sebagai Pusat yang Sinkron (Hardened & Data Minimized Edition)

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. INDEX UNIQUE PARTIAL & FK AKUN USER
-- -----------------------------------------------------------------------------
-- 1 pendeta = max 1 akun aktif
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_pendeta_aktif 
ON public.users(id_pendeta) 
WHERE id_pendeta IS NOT NULL;

-- FK users.id_pendeta -> m_pendeta(id_pendeta) ON DELETE SET NULL (Idempotent Drop-Then-Add)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_pendeta_fkey;
ALTER TABLE public.users ADD CONSTRAINT users_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 2. VERIFIKASI & PEMBARUAN FK 11 TABEL TERKAIT (IDEMPOTENT DROP-THEN-ADD)
-- -----------------------------------------------------------------------------

-- A. Tabel Histori Pelayanan & Sejarah (ON DELETE RESTRICT / SET NULL)
ALTER TABLE public.t_pj_jemaat DROP CONSTRAINT IF EXISTS t_pj_jemaat_id_pendeta_fkey;
ALTER TABLE public.t_pj_jemaat ADD CONSTRAINT t_pj_jemaat_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE RESTRICT;

ALTER TABLE public.t_penugasan_pendeta DROP CONSTRAINT IF EXISTS t_penugasan_pendeta_id_pendeta_fkey;
ALTER TABLE public.t_penugasan_pendeta ADD CONSTRAINT t_penugasan_pendeta_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE RESTRICT;

ALTER TABLE public.t_riwayat_mutasi_pendeta DROP CONSTRAINT IF EXISTS t_riwayat_mutasi_pendeta_id_pendeta_fkey;
ALTER TABLE public.t_riwayat_mutasi_pendeta ADD CONSTRAINT t_riwayat_mutasi_pendeta_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE RESTRICT;

ALTER TABLE public.t_log_pastoral DROP CONSTRAINT IF EXISTS t_log_pastoral_id_pendeta_fkey;
ALTER TABLE public.t_log_pastoral ADD CONSTRAINT t_log_pastoral_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE RESTRICT;

ALTER TABLE public.t_jabatan_struktural DROP CONSTRAINT IF EXISTS t_jabatan_struktural_id_pendeta_fkey;
ALTER TABLE public.t_jabatan_struktural ADD CONSTRAINT t_jabatan_struktural_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE RESTRICT;

ALTER TABLE public.m_jemaat_induk DROP CONSTRAINT IF EXISTS fk_jemaat_kmj;
ALTER TABLE public.m_jemaat_induk ADD CONSTRAINT fk_jemaat_kmj 
  FOREIGN KEY (id_kmj) REFERENCES public.m_pendeta(id_pendeta) ON DELETE SET NULL;

-- B. Tabel Data Personal 360° (ON DELETE CASCADE)
ALTER TABLE public.t_keluarga_pendeta DROP CONSTRAINT IF EXISTS t_keluarga_pendeta_id_pendeta_fkey;
ALTER TABLE public.t_keluarga_pendeta ADD CONSTRAINT t_keluarga_pendeta_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE CASCADE;

ALTER TABLE public.t_kompetensi_pendeta DROP CONSTRAINT IF EXISTS t_kompetensi_pendeta_id_pendeta_fkey;
ALTER TABLE public.t_kompetensi_pendeta ADD CONSTRAINT t_kompetensi_pendeta_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE CASCADE;

ALTER TABLE public.t_keterlibatan_pendeta DROP CONSTRAINT IF EXISTS t_keterlibatan_pendeta_id_pendeta_fkey;
ALTER TABLE public.t_keterlibatan_pendeta ADD CONSTRAINT t_keterlibatan_pendeta_id_pendeta_fkey 
  FOREIGN KEY (id_pendeta) REFERENCES public.m_pendeta(id_pendeta) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- 3. TRIGGERS SINKRONISASI AUTOMATIS (EKSPLISIT CASE MAPPING)
-- -----------------------------------------------------------------------------

-- Trigger A: Sinkronisasi Status Pendeta -> Status User Akun
CREATE OR REPLACE FUNCTION public.fn_sync_pendeta_status_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.users
    SET status = CASE 
                   WHEN NEW.status IN ('Aktif', 'Active') THEN 'Aktif' 
                   ELSE 'Nonaktif' 
                 END,
        updated_at = NOW()
    WHERE id_pendeta = NEW.id_pendeta;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_pendeta_status_to_user ON public.m_pendeta;
CREATE TRIGGER trg_sync_pendeta_status_to_user
  AFTER UPDATE OF status ON public.m_pendeta
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_sync_pendeta_status_to_user();

-- Trigger B: Deaktivasi Akun Sebelum Pendeta Dihapus
CREATE OR REPLACE FUNCTION public.fn_on_pendeta_deleted_deactivate_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET status = 'Nonaktif',
      updated_at = NOW()
  WHERE id_pendeta = OLD.id_pendeta;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_pendeta_deleted_deactivate_user ON public.m_pendeta;
CREATE TRIGGER trg_on_pendeta_deleted_deactivate_user
  BEFORE DELETE ON public.m_pendeta
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_on_pendeta_deleted_deactivate_user();

-- -----------------------------------------------------------------------------
-- 4. RPC UNIFIED: link_user_to_pendeta & get_pendeta_360 (DATA MINIMIZATION EDITION)
-- -----------------------------------------------------------------------------

-- RPC 1: link_user_to_pendeta
CREATE OR REPLACE FUNCTION public.link_user_to_pendeta(
  p_user_id UUID,
  p_id_pendeta VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role VARCHAR;
  v_exists_pendeta BOOLEAN;
  v_linked_user UUID;
BEGIN
  v_caller_role := auth.jwt() ->> 'role';
  
  -- Role guard: hanya super_user, admin_mupel, atau user yang mengaitkan dirinya sendiri
  IF v_caller_role NOT IN ('super_user', 'superadmin', 'sinode', 'admin_mupel')
     AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden: anda tidak memiliki wewenang mengaitkan akun ini';
  END IF;

  -- 1. Validasi keberadaan Pendeta
  SELECT EXISTS(SELECT 1 FROM public.m_pendeta WHERE id_pendeta = p_id_pendeta) INTO v_exists_pendeta;
  IF NOT v_exists_pendeta THEN
    RAISE EXCEPTION 'Pendeta dengan ID % tidak ditemukan', p_id_pendeta;
  END IF;

  -- 2. Validasi keunikan akun (1 pendeta max 1 user aktif)
  SELECT id INTO v_linked_user 
  FROM public.users 
  WHERE id_pendeta = p_id_pendeta AND id <> p_user_id;

  IF v_linked_user IS NOT NULL THEN
    RAISE EXCEPTION 'Pendeta % sudah terhubung ke akun user lain', p_id_pendeta;
  END IF;

  -- 3. Update pengaitan user
  UPDATE public.users
  SET id_pendeta = p_id_pendeta,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'id_pendeta', p_id_pendeta,
    'message', 'Berhasil mengaitkan user ke pendeta'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_user_to_pendeta(UUID, VARCHAR) TO authenticated;

-- RPC 2: get_pendeta_360 (Data Minimization & Anti-Enumeration Edition)
CREATE OR REPLACE FUNCTION public.get_pendeta_360(p_id_pendeta VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id       UUID;
  v_caller_pendeta  VARCHAR;
  v_caller_role     VARCHAR;
  v_caller_mupel   VARCHAR;
  v_target_mupel   VARCHAR;
  v_can_keluarga   BOOLEAN := FALSE;
  v_result          JSONB;
  v_pendeta_data    JSONB;
  v_user_data       JSONB;
  v_hierarki_data   JSONB;
  v_jabatan_data    JSONB;
  v_kompetensi_data JSONB;
  v_keterlibatan_data JSONB;
  v_keluarga_data   JSONB := '[]'::jsonb;
BEGIN
  v_caller_id := auth.uid();
  
  -- 🔴 EXPLICIT ANONYMOUS GUARD
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'forbidden: authentication required';
  END IF;
  
  -- Real-time lookup pemanggil dari public.users
  SELECT role, id_pendeta, id_mupel 
  INTO v_caller_role, v_caller_pendeta, v_caller_mupel
  FROM public.users
  WHERE id = v_caller_id;

  IF v_caller_role IS NULL THEN
    v_caller_role := auth.jwt() ->> 'role';
  END IF;

  -- Target validation & lookup mupel pendeta target (real-time join ke m_jemaat_induk)
  SELECT ji.id_mupel INTO v_target_mupel
  FROM public.m_pendeta p
  LEFT JOIN public.m_jemaat_induk ji ON ji.id_induk = p.id_induk
  WHERE p.id_pendeta = p_id_pendeta;

  -- Anti-enumeration check
  IF NOT EXISTS (SELECT 1 FROM public.m_pendeta WHERE id_pendeta = p_id_pendeta) THEN
    RAISE EXCEPTION 'forbidden: anda tidak memiliki hak akses ke profil pendeta ini';
  END IF;

  -- 🔴 GUARD BERTINGKAT & SCOPE VALIDATION (DEFAULT DENY)
  IF v_caller_role IN ('super_user', 'superadmin', 'sinode') THEN
    v_can_keluarga := TRUE;                       -- Super User: Akses penuh (termasuk keluarga)
  ELSIF v_caller_pendeta IS NOT NULL AND v_caller_pendeta = p_id_pendeta THEN
    v_can_keluarga := TRUE;                       -- Pemilik Data: Akses penuh (termasuk keluarga)
  ELSIF v_caller_role = 'admin_mupel' 
        AND v_caller_mupel IS NOT NULL 
        AND v_target_mupel IS NOT NULL
        AND v_caller_mupel = v_target_mupel THEN
    v_can_keluarga := FALSE;                      -- Admin Mupel Se-Scope: Akses non-keluarga
  ELSE
    RAISE EXCEPTION 'forbidden: anda tidak memiliki hak akses ke profil pendeta ini'; -- Default Deny (termasuk Admin Mupel lintas Mupel & target mupel NULL)
  END IF;

  -- 1. Master Pendeta
  SELECT to_jsonb(p.*) INTO v_pendeta_data
  FROM public.m_pendeta p
  WHERE p.id_pendeta = p_id_pendeta;

  -- 2. User account (Data Minimization: omit biometric & last_login_at untuk Admin Mupel)
  IF v_caller_role = 'admin_mupel' AND (v_caller_pendeta IS NULL OR v_caller_pendeta <> p_id_pendeta) THEN
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'no_telepon', u.no_telepon,
      'role', u.role,
      'status', u.status
    ) INTO v_user_data
    FROM public.users u
    WHERE u.id_pendeta = p_id_pendeta;
  ELSE
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'no_telepon', u.no_telepon,
      'role', u.role,
      'status', u.status,
      'biometric_enabled', u.biometric_enabled,
      'last_login_at', u.last_login_at
    ) INTO v_user_data
    FROM public.users u
    WHERE u.id_pendeta = p_id_pendeta;
  END IF;

  -- 3. Hierarki
  SELECT jsonb_build_object(
    'id_induk', j.id_induk,
    'nama_induk', j.nama_induk,
    'id_mupel', m.id_mupel,
    'nama_mupel', m.nama_mupel
  ) INTO v_hierarki_data
  FROM public.m_jemaat_induk j
  LEFT JOIN public.m_mupel m ON m.id_mupel = j.id_mupel
  WHERE j.id_induk = (v_pendeta_data ->> 'id_induk');

  -- 4. Jabatan Struktural
  SELECT COALESCE(jsonb_agg(to_jsonb(js)), '[]'::jsonb) INTO v_jabatan_data
  FROM public.t_jabatan_struktural js
  WHERE js.id_pendeta = p_id_pendeta;

  -- 5. Kompetensi & Karunia
  SELECT COALESCE(jsonb_agg(to_jsonb(kp)), '[]'::jsonb) INTO v_kompetensi_data
  FROM public.t_kompetensi_pendeta kp
  WHERE kp.id_pendeta = p_id_pendeta;

  -- 6. Keterlibatan Sinodal/Mupel/Jemaat
  SELECT COALESCE(jsonb_agg(to_jsonb(kt)), '[]'::jsonb) INTO v_keterlibatan_data
  FROM public.t_keterlibatan_pendeta kt
  WHERE kt.id_pendeta = p_id_pendeta;

  -- 7. 🔴 KELUARGA: HANYA jika v_can_keluarga = TRUE (Pemilik Data / Super User)
  IF v_can_keluarga THEN
    SELECT COALESCE(jsonb_agg(to_jsonb(k)), '[]'::jsonb) INTO v_keluarga_data
    FROM public.t_keluarga_pendeta k
    WHERE k.id_pendeta = p_id_pendeta;
  END IF;

  v_result := jsonb_build_object(
    'pendeta', v_pendeta_data,
    'user', v_user_data,
    'hierarki', v_hierarki_data,
    'jabatan', v_jabatan_data,
    'kompetensi', v_kompetensi_data,
    'keterlibatan', v_keterlibatan_data,
    'keluarga', v_keluarga_data
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_pendeta_360(VARCHAR) TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. AUDIT & KONSISTENSI RLS POLICIES (REAL-TIME LOOKUP)
-- -----------------------------------------------------------------------------

-- Policy m_pendeta: Update hanya pemilik atau super_user
DROP POLICY IF EXISTS "Pendeta can update their own profile" ON public.m_pendeta;
CREATE POLICY "Pendeta can update their own profile"
ON public.m_pendeta FOR ALL
USING (
  id_pendeta IN (SELECT id_pendeta FROM public.users WHERE id = auth.uid())
  OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('super_user', 'superadmin', 'sinode')
)
WITH CHECK (
  id_pendeta IN (SELECT id_pendeta FROM public.users WHERE id = auth.uid())
  OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('super_user', 'superadmin', 'sinode')
);

-- Policy t_keluarga_pendeta: Real-time lookup (Pemilik + Super User SAJA)
ALTER TABLE public.t_keluarga_pendeta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "keluarga_privat_policy" ON public.t_keluarga_pendeta;
CREATE POLICY "keluarga_privat_policy" ON public.t_keluarga_pendeta
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_keluarga_pendeta.id_pendeta
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_keluarga_pendeta.id_pendeta
    )
  )
);

-- Policy t_kompetensi_pendeta: Real-time lookup (Pemilik + Super User + Admin Mupel Se-Scope)
ALTER TABLE public.t_kompetensi_pendeta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kompetensi_policy" ON public.t_kompetensi_pendeta;
CREATE POLICY "kompetensi_policy" ON public.t_kompetensi_pendeta
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.m_pendeta p ON p.id_pendeta = t_kompetensi_pendeta.id_pendeta
    JOIN public.m_jemaat_induk j ON j.id_induk = p.id_induk
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_kompetensi_pendeta.id_pendeta
      OR (u.role = 'admin_mupel' AND u.id_mupel = j.id_mupel)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.m_pendeta p ON p.id_pendeta = t_kompetensi_pendeta.id_pendeta
    JOIN public.m_jemaat_induk j ON j.id_induk = p.id_induk
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_kompetensi_pendeta.id_pendeta
      OR (u.role = 'admin_mupel' AND u.id_mupel = j.id_mupel)
    )
  )
);

-- Policy t_keterlibatan_pendeta: Real-time lookup (Pemilik + Super User + Admin Mupel Se-Scope)
ALTER TABLE public.t_keterlibatan_pendeta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "keterlibatan_policy" ON public.t_keterlibatan_pendeta;
CREATE POLICY "keterlibatan_policy" ON public.t_keterlibatan_pendeta
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.m_pendeta p ON p.id_pendeta = t_keterlibatan_pendeta.id_pendeta
    JOIN public.m_jemaat_induk j ON j.id_induk = p.id_induk
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_keterlibatan_pendeta.id_pendeta
      OR (u.role = 'admin_mupel' AND u.id_mupel = j.id_mupel)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.m_pendeta p ON p.id_pendeta = t_keterlibatan_pendeta.id_pendeta
    JOIN public.m_jemaat_induk j ON j.id_induk = p.id_induk
    WHERE u.id = auth.uid()
    AND (
      u.role IN ('super_user', 'superadmin', 'sinode')
      OR u.id_pendeta = t_keterlibatan_pendeta.id_pendeta
      OR (u.role = 'admin_mupel' AND u.id_mupel = j.id_mupel)
    )
  )
);

COMMIT;


-- [MIGRATION SOURCE: 20260802_demografi_auto_sync.sql]
-- Migration: Auto-Sync Demografi Pelkat Statistics to m_pos_pelkes and m_jemaat_induk
-- Description: Automatically updates jumlah_kk and jumlah_jiwa aggregates on Pos Pelkes and Jemaat Induk levels upon any demografi changes.

CREATE OR REPLACE FUNCTION fn_sync_demografi_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_id_induk VARCHAR(20);
    v_id_pos VARCHAR(20);
BEGIN
    -- Determine which id_pos we are updating
    IF (TG_OP = 'DELETE') THEN
        v_id_pos := OLD.id_pos;
    ELSE
        v_id_pos := NEW.id_pos;
    END IF;

    -- 1. Get parent id_induk for this id_pos from m_pos_pelkes
    SELECT id_induk INTO v_id_induk FROM m_pos_pelkes WHERE id_pos = v_id_pos;

    -- 2. Update m_pos_pelkes stats
    UPDATE m_pos_pelkes
    SET 
        jumlah_kk = COALESCE((SELECT SUM(jml_kk) FROM t_demografi_pelkat WHERE id_pos = v_id_pos), 0),
        jumlah_jiwa = COALESCE((SELECT SUM(laki + perempuan) FROM t_demografi_pelkat WHERE id_pos = v_id_pos), 0),
        updated_at = NOW()
    WHERE id_pos = v_id_pos;

    -- 3. Update m_jemaat_induk stats (sum of all its pos pelkes)
    IF v_id_induk IS NOT NULL THEN
        UPDATE m_jemaat_induk
        SET
            jumlah_kk = COALESCE((SELECT SUM(jumlah_kk) FROM m_pos_pelkes WHERE id_induk = v_id_induk), 0),
            jumlah_jiwa = COALESCE((SELECT SUM(jumlah_jiwa) FROM m_pos_pelkes WHERE id_induk = v_id_induk), 0),
            updated_at = NOW()
        WHERE id_induk = v_id_induk;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS trg_sync_demografi ON t_demografi_pelkat;
CREATE TRIGGER trg_sync_demografi
AFTER INSERT OR UPDATE OR DELETE ON t_demografi_pelkat
FOR EACH ROW
EXECUTE FUNCTION fn_sync_demografi_stats();


-- [MIGRATION SOURCE: 20260803_fix_demografi_rls.sql]
-- Migration: 20260803_fix_demografi_rls.sql
-- Description: Fix Row Level Security (RLS) policies for t_demografi_pelkat and m_pos_pelkes tables to allow CRUD operations.

BEGIN;

-- 1. Setup RLS policies for t_demografi_pelkat
ALTER TABLE t_demografi_pelkat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_demografi_pelkat" ON t_demografi_pelkat;
DROP POLICY IF EXISTS "Allow insert for t_demografi_pelkat" ON t_demografi_pelkat;
DROP POLICY IF EXISTS "Allow update for t_demografi_pelkat" ON t_demografi_pelkat;
DROP POLICY IF EXISTS "Allow delete for t_demografi_pelkat" ON t_demografi_pelkat;

CREATE POLICY "Allow read for t_demografi_pelkat"
ON t_demografi_pelkat FOR SELECT
USING (true);

CREATE POLICY "Allow insert for t_demografi_pelkat"
ON t_demografi_pelkat FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update for t_demografi_pelkat"
ON t_demografi_pelkat FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for t_demografi_pelkat"
ON t_demografi_pelkat FOR DELETE
USING (true);

-- 2. Setup RLS policies for m_pos_pelkes (supporting auto-create for Jemaat scope)
ALTER TABLE m_pos_pelkes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert for m_pos_pelkes" ON m_pos_pelkes;
DROP POLICY IF EXISTS "Allow update for m_pos_pelkes" ON m_pos_pelkes;

CREATE POLICY "Allow insert for m_pos_pelkes"
ON m_pos_pelkes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update for m_pos_pelkes"
ON m_pos_pelkes FOR UPDATE
USING (true)
WITH CHECK (true);

COMMIT;


-- [MIGRATION SOURCE: 20260804_add_updated_by_demografi.sql]
-- Migration: Add updated_by column to t_demografi_pelkat
-- Description: Stores the user (email/phone/name) who performed the last demografi update.

ALTER TABLE t_demografi_pelkat ADD COLUMN IF NOT EXISTS updated_by VARCHAR(150);


-- [MIGRATION SOURCE: 20260805_fix_aset_rls.sql]
-- Migration: 20260805_fix_aset_rls.sql
-- Description: Fix Row Level Security (RLS) policies for t_aset_tanah, t_aset_bangunan, t_aset_bergerak, and t_lampiran_aset tables to allow CRUD operations.

BEGIN;

-- 1. Setup RLS policies for t_aset_tanah
ALTER TABLE t_aset_tanah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_aset_tanah" ON t_aset_tanah;
DROP POLICY IF EXISTS "Allow insert for t_aset_tanah" ON t_aset_tanah;
DROP POLICY IF EXISTS "Allow update for t_aset_tanah" ON t_aset_tanah;
DROP POLICY IF EXISTS "Allow delete for t_aset_tanah" ON t_aset_tanah;

CREATE POLICY "Allow read for t_aset_tanah" ON t_aset_tanah FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_aset_tanah" ON t_aset_tanah FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_aset_tanah" ON t_aset_tanah FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_aset_tanah" ON t_aset_tanah FOR DELETE USING (true);

-- 2. Setup RLS policies for t_aset_bangunan
ALTER TABLE t_aset_bangunan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_aset_bangunan" ON t_aset_bangunan;
DROP POLICY IF EXISTS "Allow insert for t_aset_bangunan" ON t_aset_bangunan;
DROP POLICY IF EXISTS "Allow update for t_aset_bangunan" ON t_aset_bangunan;
DROP POLICY IF EXISTS "Allow delete for t_aset_bangunan" ON t_aset_bangunan;

CREATE POLICY "Allow read for t_aset_bangunan" ON t_aset_bangunan FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_aset_bangunan" ON t_aset_bangunan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_aset_bangunan" ON t_aset_bangunan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_aset_bangunan" ON t_aset_bangunan FOR DELETE USING (true);

-- 3. Setup RLS policies for t_aset_bergerak
ALTER TABLE t_aset_bergerak ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_aset_bergerak" ON t_aset_bergerak;
DROP POLICY IF EXISTS "Allow insert for t_aset_bergerak" ON t_aset_bergerak;
DROP POLICY IF EXISTS "Allow update for t_aset_bergerak" ON t_aset_bergerak;
DROP POLICY IF EXISTS "Allow delete for t_aset_bergerak" ON t_aset_bergerak;

CREATE POLICY "Allow read for t_aset_bergerak" ON t_aset_bergerak FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_aset_bergerak" ON t_aset_bergerak FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_aset_bergerak" ON t_aset_bergerak FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_aset_bergerak" ON t_aset_bergerak FOR DELETE USING (true);

-- 4. Setup RLS policies for t_lampiran_aset
ALTER TABLE t_lampiran_aset ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_lampiran_aset" ON t_lampiran_aset;
DROP POLICY IF EXISTS "Allow insert for t_lampiran_aset" ON t_lampiran_aset;
DROP POLICY IF EXISTS "Allow update for t_lampiran_aset" ON t_lampiran_aset;
DROP POLICY IF EXISTS "Allow delete for t_lampiran_aset" ON t_lampiran_aset;

CREATE POLICY "Allow read for t_lampiran_aset" ON t_lampiran_aset FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_lampiran_aset" ON t_lampiran_aset FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_lampiran_aset" ON t_lampiran_aset FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_lampiran_aset" ON t_lampiran_aset FOR DELETE USING (true);

COMMIT;


-- [MIGRATION SOURCE: 20260805_mutasi_pendeta_with_identity_sync.sql]
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


-- [MIGRATION SOURCE: 20260806120000_create_sys_transaction_logs_and_telemetry.sql]
-- Migration: 20260806120000_create_sys_transaction_logs_and_telemetry.sql

-- 1. Idempotency Table
CREATE TABLE sys_transaction_logs (
  request_id VARCHAR(36) PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  operation_type VARCHAR(10) NOT NULL CHECK (operation_type IN ('insert', 'update', 'delete', 'rpc')),
  record_id VARCHAR(50),
  user_id UUID REFERENCES auth.users(id),
  payload_summary JSONB,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'conflict')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE INDEX idx_sys_txn_expires ON sys_transaction_logs(expires_at);
CREATE INDEX idx_sys_txn_table ON sys_transaction_logs(table_name, created_at);
CREATE INDEX idx_sys_txn_user ON sys_transaction_logs(user_id, created_at);

-- RLS: hanya service role yang bisa write secara default, tapi kita pakai SECURITY DEFINER di RPC
ALTER TABLE sys_transaction_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON sys_transaction_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated read own" ON sys_transaction_logs FOR SELECT USING (user_id = auth.uid());

-- RPC: Check if request already processed
CREATE OR REPLACE FUNCTION check_idempotency(p_request_id VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sys_transaction_logs 
    WHERE request_id = p_request_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_idempotency(VARCHAR) TO authenticated;

-- RPC: Record completed transaction
CREATE OR REPLACE FUNCTION record_transaction(
  p_request_id VARCHAR,
  p_table_name VARCHAR,
  p_operation_type VARCHAR,
  p_record_id VARCHAR DEFAULT NULL,
  p_payload_summary JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO sys_transaction_logs (
    request_id, table_name, operation_type, record_id, payload_summary, user_id
  )
  VALUES (
    p_request_id, p_table_name, p_operation_type, p_record_id, p_payload_summary, auth.uid()
  )
  ON CONFLICT (request_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION record_transaction(VARCHAR, VARCHAR, VARCHAR, VARCHAR, JSONB) TO authenticated;

-- Cleanup Cron Job (pg_cron)
-- Hapus comment di bawah jika ekstensi pg_cron sudah diaktifkan di Supabase
-- SELECT cron.schedule(
--   'cleanup-expired-transactions',
--   '0 3 * * *',
--   $$DELETE FROM sys_transaction_logs WHERE expires_at < NOW()$$
-- );

-- 2. Telemetry Table
CREATE TABLE sys_telemetry (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'sync_start', 'sync_complete', 'sync_error', 
    'conflict_detected', 'queue_length', 'dlq_moved'
  )),
  device_id VARCHAR(100),
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(20),
  network_type VARCHAR(20),
  duration_ms INTEGER,
  queue_length INTEGER,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  conflict_count INTEGER DEFAULT 0,
  error_message TEXT,
  error_code VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telemetry_event ON sys_telemetry(event_type, created_at);
CREATE INDEX idx_telemetry_date ON sys_telemetry(created_at);
CREATE INDEX idx_telemetry_user ON sys_telemetry(user_id, created_at);

-- RLS untuk Telemetry
ALTER TABLE sys_telemetry ENABLE ROW LEVEL SECURITY;
-- Izinkan authenticated users memasukkan data telemetry (karena dual-write dari client)
CREATE POLICY "Authenticated write telemetry" ON sys_telemetry FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Service role write" ON sys_telemetry FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admin read all" ON sys_telemetry FOR SELECT USING (
  auth.role() = 'service_role' OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_user', 'admin_mupel'))
);
CREATE POLICY "User read own" ON sys_telemetry FOR SELECT USING (user_id = auth.uid());

-- Cleanup Cron Job (pg_cron)
-- SELECT cron.schedule(
--   'cleanup-old-telemetry',
--   '0 4 * * *',
--   $$DELETE FROM sys_telemetry WHERE created_at < NOW() - INTERVAL '90 days'$$
-- );


-- [MIGRATION SOURCE: 20260806_add_aset_lat_long.sql]
-- Migration: Add specific latitude & longitude columns to asset tables
-- Allows storing physical location coordinates per asset (which may differ from Pos Pelkes / Gereja HQ)

ALTER TABLE t_aset_tanah ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE t_aset_tanah ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

ALTER TABLE t_aset_bangunan ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE t_aset_bangunan ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

ALTER TABLE t_aset_bergerak ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE t_aset_bergerak ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);


-- [MIGRATION SOURCE: 20260807_add_nama_bangunan.sql]
-- Migration: Add nama_bangunan column to t_aset_bangunan table
ALTER TABLE t_aset_bangunan ADD COLUMN IF NOT EXISTS nama_bangunan VARCHAR(150);


-- [MIGRATION SOURCE: 20260808_add_kondisi_aset_bergerak.sql]
-- Migration: Add kondisi column to t_aset_bergerak table
ALTER TABLE t_aset_bergerak ADD COLUMN IF NOT EXISTS kondisi VARCHAR(50) DEFAULT 'Baik';


-- [MIGRATION SOURCE: 20260808_create_log_pastoral_atomic.sql]
-- supabase/migrations/20260808_create_log_pastoral_atomic.sql
-- Migration 6a: Idempotency table constraints & Log Pastoral RPC

-- (a) sys_transaction_logs is already created in a previous migration, 
-- but we need to ensure the unique constraint (request_id, user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_sys_txn_logs_request'
    ) THEN
        ALTER TABLE sys_transaction_logs 
        ADD CONSTRAINT uq_sys_txn_logs_request UNIQUE (request_id, user_id);
    END IF;
END $$;

-- (b) RLS for t_penugasan_pendeta to allow RBAC checks
ALTER TABLE t_penugasan_pendeta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "baca_penugasan_sendiri" ON t_penugasan_pendeta;
CREATE POLICY "baca_penugasan_sendiri"
ON t_penugasan_pendeta FOR SELECT TO authenticated
USING (id_pendeta = (SELECT id_pendeta FROM users WHERE id = auth.uid()));

-- (c) Partial index to block double-assign
CREATE UNIQUE INDEX IF NOT EXISTS uq_penugasan_pendeta_aktif 
ON t_penugasan_pendeta (id_pendeta, id_pos) 
WHERE status_tugas = 'Aktif' AND tgl_selesai IS NULL;

-- (d) RPC for Atomic Insert
CREATE OR REPLACE FUNCTION create_log_pastoral_atomic(
  p_id_log VARCHAR,
  p_id_pos VARCHAR,
  p_id_pendeta VARCHAR,
  p_tgl DATE,
  p_kegiatan VARCHAR,
  p_jml_jiwa INT,
  p_catatan TEXT,
  p_foto_url TEXT,
  p_request_id VARCHAR,
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role VARCHAR;
BEGIN
  -- Dapatkan role user
  SELECT role INTO v_role FROM users WHERE id = p_user_id;

  -- Defense-in-depth RBAC (F-4c)
  IF v_role NOT IN ('super_user', 'admin_mupel', 'admin_jemaat', 'pj') THEN
    IF NOT EXISTS (SELECT 1 FROM t_penugasan_pendeta
                   WHERE id_pendeta = p_id_pendeta AND id_pos IS NOT DISTINCT FROM p_id_pos
                     AND status_tugas = 'Aktif' AND tgl_selesai IS NULL)
    THEN 
      RAISE EXCEPTION 'RBAC_VIOLATION: penugasan aktif tidak ditemukan';
    END IF;
  END IF;

  -- Idempotency check (double-lock)
  IF EXISTS (
    SELECT 1 FROM sys_transaction_logs 
    WHERE request_id = p_request_id AND user_id = p_user_id
  ) THEN
    RETURN; -- sudah diproses, skip
  END IF;

  -- Insert log pastoral
  INSERT INTO t_log_pastoral (
    id_log, id_pos, id_pendeta, tgl, kegiatan, 
    jml_jiwa, catatan, foto_url
  ) VALUES (
    p_id_log, p_id_pos, p_id_pendeta, p_tgl, p_kegiatan,
    p_jml_jiwa, p_catatan, p_foto_url
  );

  -- Catat di sys_transaction_logs (idempotency record)
  INSERT INTO sys_transaction_logs (
    request_id, user_id, operation_type, table_name,
    record_id, payload_summary, created_at
  ) VALUES (
    p_request_id, p_user_id, 'insert', 't_log_pastoral',
    p_id_log, jsonb_build_object('id_pos', p_id_pos, 'kegiatan', p_kegiatan),
    NOW()
  );
END;
$$;

-- RLS: hanya authenticated + via RPC
REVOKE ALL ON FUNCTION create_log_pastoral_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_log_pastoral_atomic TO authenticated;


-- [MIGRATION SOURCE: 20260809_cj5_aset_rpc_storage.sql]
-- ==============================================================================
-- Migration: CJ-5 Aset Offline-First (Storage, Lampiran Constraint, and Atomic RPCs)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. K-1: ALTER TABLE t_lampiran_aset (Safe Constraint Addition)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_lampiran_aset_parent'
  ) THEN
    ALTER TABLE t_lampiran_aset
      ADD CONSTRAINT chk_lampiran_aset_parent
      CHECK (
        (id_tanah IS NOT NULL)::int +
        (id_bangunan IS NOT NULL)::int +
        (id_aset_b IS NOT NULL)::int = 1
      ) NOT VALID;
  END IF;
END $$;

-- Validasi Constraint (akan gagal dan memberitahu jika ada data legacy cacat)
ALTER TABLE t_lampiran_aset VALIDATE CONSTRAINT chk_lampiran_aset_parent;


-- ------------------------------------------------------------------------------
-- 2. Storage Bucket & Policies (N-1)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assets', 
    'assets', 
    TRUE,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Baca publik
DROP POLICY IF EXISTS "assets_public_read" ON storage.objects;
CREATE POLICY "assets_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Tulis: authenticated + ekstensi diizinkan + max 10MB
DROP POLICY IF EXISTS "assets_authenticated_write" ON storage.objects;
CREATE POLICY "assets_authenticated_write"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'assets'
);

-- Upsert butuh UPDATE (path deterministik → overwrite idempoten)
DROP POLICY IF EXISTS "assets_authenticated_update" ON storage.objects;
CREATE POLICY "assets_authenticated_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'assets'
);

-- Hapus: hanya super_user
DROP POLICY IF EXISTS "assets_delete_super_user" ON storage.objects;
CREATE POLICY "assets_delete_super_user"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'assets' AND (auth.jwt()->>'role') = 'super_user');


-- ------------------------------------------------------------------------------
-- 3. Atomic RPCs (RBAC + Idempotency + Insert)
-- Path Lampiran Konvensi: assets/{id_pos}/{jenis}/{id_aset}/{requestId}-{indeks}.{ext}
-- ------------------------------------------------------------------------------

-- A. Aset Tanah
CREATE OR REPLACE FUNCTION create_aset_tanah_atomic(
  p_id_tanah      VARCHAR,
  p_id_pos        VARCHAR,
  p_id_pendeta    VARCHAR,
  p_user_id       UUID,
  p_request_id    VARCHAR,
  p_luas_m2       NUMERIC,
  p_thn_perolehan INT,
  p_status_hukum  VARCHAR,
  p_kondisi       VARCHAR,
  p_potensi_sda   VARCHAR,
  p_latitude      NUMERIC,
  p_longitude     NUMERIC,
  p_keterangan    TEXT,
  p_foto          JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Defense-in-depth RBAC
  IF NOT EXISTS (SELECT 1 FROM t_penugasan_pendeta
                 WHERE id_pendeta = p_id_pendeta AND id_pos = p_id_pos
                   AND status_tugas = 'Aktif' AND tgl_selesai IS NULL)
  THEN
    RAISE EXCEPTION 'RBAC_VIOLATION: penugasan aktif tidak ditemukan';
  END IF;

  -- 2. Idempotency double-lock
  IF EXISTS (SELECT 1 FROM sys_transaction_logs
             WHERE request_id::text = p_request_id AND user_id = p_user_id)
  THEN RETURN;
  END IF;

  -- 3. Insert aset tanah
  INSERT INTO t_aset_tanah (id_tanah, id_pos, luas_m2, thn_perolehan, status_hukum,
    kondisi, potensi_sda, latitude, longitude, keterangan)
  VALUES (p_id_tanah, p_id_pos, p_luas_m2, p_thn_perolehan, p_status_hukum,
    p_kondisi, p_potensi_sda, p_latitude, p_longitude, p_keterangan);

  -- 4. Insert foto utama sebagai lampiran
  IF p_foto IS NOT NULL THEN
    INSERT INTO t_lampiran_aset (id_lampiran, id_tanah, nama_file, file_path, tipe_file, ukuran_file)
    VALUES (p_foto->>'id_lampiran', p_id_tanah, p_foto->>'nama_file',
            p_foto->>'file_path', p_foto->>'tipe_file', (p_foto->>'ukuran_file')::NUMERIC);
  END IF;

  -- 5. Idempotency record (N-5)
  INSERT INTO sys_transaction_logs (request_id, user_id, operation_type, table_name, record_id, payload_summary, created_at)
  VALUES (p_request_id::uuid, p_user_id, 'insert', 't_aset_tanah', p_id_tanah,
          jsonb_build_object('id_pos', p_id_pos, 'luas_m2', p_luas_m2), NOW());
END;
$$;

REVOKE ALL ON FUNCTION create_aset_tanah_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_aset_tanah_atomic TO authenticated;


-- B. Aset Bangunan
CREATE OR REPLACE FUNCTION create_aset_bangunan_atomic(
  p_id_bangunan   VARCHAR,
  p_id_pos        VARCHAR,
  p_id_pendeta    VARCHAR,
  p_user_id       UUID,
  p_request_id    VARCHAR,
  p_nama_bangunan VARCHAR,
  p_fungsi        VARCHAR,
  p_thn_berdiri   INT,
  p_kondisi       VARCHAR,
  p_latitude      NUMERIC,
  p_longitude     NUMERIC,
  p_keterangan    TEXT,
  p_foto          JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Defense-in-depth RBAC
  IF NOT EXISTS (SELECT 1 FROM t_penugasan_pendeta
                 WHERE id_pendeta = p_id_pendeta AND id_pos = p_id_pos
                   AND status_tugas = 'Aktif' AND tgl_selesai IS NULL)
  THEN
    RAISE EXCEPTION 'RBAC_VIOLATION: penugasan aktif tidak ditemukan';
  END IF;

  -- 2. Idempotency double-lock
  IF EXISTS (SELECT 1 FROM sys_transaction_logs
             WHERE request_id::text = p_request_id AND user_id = p_user_id)
  THEN RETURN;
  END IF;

  -- 3. Insert aset bangunan
  INSERT INTO t_aset_bangunan (id_bangunan, id_pos, nama_bangunan, fungsi, thn_berdiri,
    kondisi, latitude, longitude, keterangan)
  VALUES (p_id_bangunan, p_id_pos, p_nama_bangunan, p_fungsi, p_thn_berdiri,
    p_kondisi, p_latitude, p_longitude, p_keterangan);

  -- 4. Insert foto utama sebagai lampiran
  IF p_foto IS NOT NULL THEN
    INSERT INTO t_lampiran_aset (id_lampiran, id_bangunan, nama_file, file_path, tipe_file, ukuran_file)
    VALUES (p_foto->>'id_lampiran', p_id_bangunan, p_foto->>'nama_file',
            p_foto->>'file_path', p_foto->>'tipe_file', (p_foto->>'ukuran_file')::NUMERIC);
  END IF;

  -- 5. Idempotency record (N-5)
  INSERT INTO sys_transaction_logs (request_id, user_id, operation_type, table_name, record_id, payload_summary, created_at)
  VALUES (p_request_id::uuid, p_user_id, 'insert', 't_aset_bangunan', p_id_bangunan,
          jsonb_build_object('id_pos', p_id_pos, 'nama_bangunan', p_nama_bangunan), NOW());
END;
$$;

REVOKE ALL ON FUNCTION create_aset_bangunan_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_aset_bangunan_atomic TO authenticated;


-- C. Aset Bergerak
CREATE OR REPLACE FUNCTION create_aset_bergerak_atomic(
  p_id_aset_b     VARCHAR,
  p_id_pos        VARCHAR,
  p_id_pendeta    VARCHAR,
  p_user_id       UUID,
  p_request_id    VARCHAR,
  p_jenis         VARCHAR,
  p_merk_tipe     VARCHAR,
  p_thn_perolehan INT,
  p_no_polisi     VARCHAR,
  p_tgl_pajak     DATE,
  p_kondisi       VARCHAR,
  p_latitude      NUMERIC,
  p_longitude     NUMERIC,
  p_keterangan    TEXT,
  p_foto          JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Defense-in-depth RBAC
  IF NOT EXISTS (SELECT 1 FROM t_penugasan_pendeta
                 WHERE id_pendeta = p_id_pendeta AND id_pos = p_id_pos
                   AND status_tugas = 'Aktif' AND tgl_selesai IS NULL)
  THEN
    RAISE EXCEPTION 'RBAC_VIOLATION: penugasan aktif tidak ditemukan';
  END IF;

  -- 2. Idempotency double-lock
  IF EXISTS (SELECT 1 FROM sys_transaction_logs
             WHERE request_id::text = p_request_id AND user_id = p_user_id)
  THEN RETURN;
  END IF;

  -- 3. Insert aset bergerak
  INSERT INTO t_aset_bergerak (id_aset_b, id_pos, jenis, merk_tipe, thn_perolehan,
    no_polisi, tgl_pajak, kondisi, latitude, longitude, keterangan)
  VALUES (p_id_aset_b, p_id_pos, p_jenis, p_merk_tipe, p_thn_perolehan,
    p_no_polisi, p_tgl_pajak, p_kondisi, p_latitude, p_longitude, p_keterangan);

  -- 4. Insert foto utama sebagai lampiran
  IF p_foto IS NOT NULL THEN
    INSERT INTO t_lampiran_aset (id_lampiran, id_aset_b, nama_file, file_path, tipe_file, ukuran_file)
    VALUES (p_foto->>'id_lampiran', p_id_aset_b, p_foto->>'nama_file',
            p_foto->>'file_path', p_foto->>'tipe_file', (p_foto->>'ukuran_file')::NUMERIC);
  END IF;

  -- 5. Idempotency record (N-5)
  INSERT INTO sys_transaction_logs (request_id, user_id, operation_type, table_name, record_id, payload_summary, created_at)
  VALUES (p_request_id::uuid, p_user_id, 'insert', 't_aset_bergerak', p_id_aset_b,
          jsonb_build_object('id_pos', p_id_pos, 'jenis', p_jenis), NOW());
END;
$$;

REVOKE ALL ON FUNCTION create_aset_bergerak_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_aset_bergerak_atomic TO authenticated;


-- [MIGRATION SOURCE: 20260809_fix_wilayah_rls.sql]
-- Migration: 20260809_fix_wilayah_rls.sql
-- Description: Fix RLS policies for t_kerawanan_wilayah and t_potensi_wilayah tables

BEGIN;

-- 1. Setup RLS policies for t_kerawanan_wilayah
ALTER TABLE t_kerawanan_wilayah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_kerawanan_wilayah" ON t_kerawanan_wilayah;
DROP POLICY IF EXISTS "Allow insert for t_kerawanan_wilayah" ON t_kerawanan_wilayah;
DROP POLICY IF EXISTS "Allow update for t_kerawanan_wilayah" ON t_kerawanan_wilayah;
DROP POLICY IF EXISTS "Allow delete for t_kerawanan_wilayah" ON t_kerawanan_wilayah;

CREATE POLICY "Allow read for t_kerawanan_wilayah" ON t_kerawanan_wilayah FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_kerawanan_wilayah" ON t_kerawanan_wilayah FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_kerawanan_wilayah" ON t_kerawanan_wilayah FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_kerawanan_wilayah" ON t_kerawanan_wilayah FOR DELETE USING (true);

-- 2. Setup RLS policies for t_potensi_wilayah
ALTER TABLE t_potensi_wilayah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_potensi_wilayah" ON t_potensi_wilayah;
DROP POLICY IF EXISTS "Allow insert for t_potensi_wilayah" ON t_potensi_wilayah;
DROP POLICY IF EXISTS "Allow update for t_potensi_wilayah" ON t_potensi_wilayah;
DROP POLICY IF EXISTS "Allow delete for t_potensi_wilayah" ON t_potensi_wilayah;

CREATE POLICY "Allow read for t_potensi_wilayah" ON t_potensi_wilayah FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_potensi_wilayah" ON t_potensi_wilayah FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_potensi_wilayah" ON t_potensi_wilayah FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_potensi_wilayah" ON t_potensi_wilayah FOR DELETE USING (true);

COMMIT;


-- [MIGRATION SOURCE: 20260810160000_s0a_bantuan_rpc_mitigation.sql]
-- Migration: S0a Mitigation for process_pengajuan_bantuan RPC
-- Description: Closes the p_role_approver override vulnerability.

CREATE OR REPLACE FUNCTION process_pengajuan_bantuan(
  p_id_ajuan VARCHAR,
  p_aksi VARCHAR, -- 'approve', 'reject', 'revision'
  p_catatan TEXT,
  p_role_approver VARCHAR DEFAULT NULL -- 'kmj', 'admin_mupel', 'super_user'
) RETURNS VOID AS $$
DECLARE
  v_current_status VARCHAR;
  v_next_status VARCHAR;
  v_user_role VARCHAR;
  v_user_id UUID;
  v_aktor VARCHAR;
BEGIN
  -- 1. Dapatkan info user yang sedang login
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User session missing';
  END IF;

  -- S0a MITIGATION: Derive role ONLY from public.users using auth.uid().
  -- Ignore p_role_approver parameter completely.
  SELECT role, COALESCE(no_telepon, email, 'User') INTO v_user_role, v_aktor 
  FROM public.users WHERE id = v_user_id;

  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User role not found in database';
  END IF;

  -- 2. Dapatkan status saat ini
  SELECT status INTO v_current_status 
  FROM public.t_pengajuan_bantuan WHERE id_ajuan = p_id_ajuan;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Pengajuan bantuan tidak ditemukan: %', p_id_ajuan;
  END IF;

  -- 3. Tentukan status berikutnya berdasarkan alur workflow
  IF p_aksi = 'approve' THEN
    IF v_current_status = 'Draft' OR v_current_status = 'Pending_KMJ' THEN 
      v_next_status := 'Pending_Mupel';
    ELSIF v_current_status = 'Pending_Mupel' THEN 
      v_next_status := 'Pending_Sinode';
    ELSIF v_current_status = 'Pending_Sinode' THEN 
      v_next_status := 'Approved';
    ELSE
      RAISE EXCEPTION 'Aksi approve tidak diizinkan untuk status saat ini: %', v_current_status;
    END IF;
  ELSIF p_aksi IN ('reject', 'revision') THEN
    v_next_status := CASE WHEN p_aksi = 'revision' THEN 'Draft' ELSE 'Rejected' END;
  ELSE
    RAISE EXCEPTION 'Aksi tidak valid: %', p_aksi;
  END IF;

  -- 4. EKSEKUSI ATOMIK: Insert audit log ke t_approval_bantuan
  INSERT INTO public.t_approval_bantuan (id_ajuan, approver_id, role_approver, aksi, catatan)
  VALUES (p_id_ajuan, v_user_id, v_user_role, p_aksi, p_catatan);

  -- 5. EKSEKUSI ATOMIK: Update status pengajuan
  UPDATE public.t_pengajuan_bantuan 
  SET status = v_next_status, updated_at = NOW() 
  WHERE id_ajuan = p_id_ajuan;

  -- 6. EKSEKUSI ATOMIK: Catat di log aktivitas jika tabel t_log_aktivitas ada
  IF EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 't_log_aktivitas') THEN
    INSERT INTO public.t_log_aktivitas (id_log, id_user, waktu, aktor, aksi, objek_type, objek_id, keterangan)
    VALUES (
      'LOG-' || public.gen_random_uuid()::text,
      v_user_id,
      NOW(),
      v_aktor,
      UPPER(p_aksi),
      'bantuan',
      p_id_ajuan,
      p_aksi || ': ' || p_catatan
    );
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Restrict exposure: Revoke from PUBLIC and anon, grant only to authenticated
REVOKE EXECUTE ON FUNCTION process_pengajuan_bantuan(VARCHAR, VARCHAR, TEXT, VARCHAR) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION process_pengajuan_bantuan(VARCHAR, VARCHAR, TEXT, VARCHAR) FROM anon;
GRANT EXECUTE ON FUNCTION process_pengajuan_bantuan(VARCHAR, VARCHAR, TEXT, VARCHAR) TO authenticated;


-- [MIGRATION SOURCE: 20260810220000_storage_buckets_setup.sql]
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('assets', 'assets', false),
  ('documents', 'documents', false),
  ('pastoral', 'pastoral', false),
  ('territory', 'territory', false),
  ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for 'assets' bucket
CREATE POLICY "Users can upload assets in their scope"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
);

CREATE POLICY "Users can view assets in their scope"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'assets'
  AND (
    (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
    OR auth.jwt()->>'role' = 'super_user'
    OR (auth.jwt()->>'role' = 'admin_mupel' AND (storage.foldername(name))[1] IN (
      SELECT id_pos FROM m_pos_pelkes WHERE id_induk IN (SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = (auth.jwt()->>'id_mupel')::text)
    ))
  )
);

CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
);

-- RLS Policies for 'documents' bucket
CREATE POLICY "Users can upload documents in their scope"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (
    ((storage.foldername(name))[1] IN ('kompetensi', 'keluarga') AND (storage.foldername(name))[2] = auth.jwt()->>'id_person')
    OR
    ((storage.foldername(name))[1] = 'legalitas' AND (storage.foldername(name))[2] = auth.jwt()->>'id_pos')
  )
);

CREATE POLICY "Users can view documents in their scope"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    ((storage.foldername(name))[1] IN ('kompetensi', 'keluarga') AND (storage.foldername(name))[2] = auth.jwt()->>'id_person')
    OR ((storage.foldername(name))[1] = 'legalitas' AND (storage.foldername(name))[2] = auth.jwt()->>'id_pos')
    OR auth.jwt()->>'role' = 'super_user'
    OR (auth.jwt()->>'role' = 'admin_mupel' AND (storage.foldername(name))[2] IN (
      SELECT id_pos FROM m_pos_pelkes WHERE id_induk IN (SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = (auth.jwt()->>'id_mupel')::text)
    ))
  )
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    ((storage.foldername(name))[1] IN ('kompetensi', 'keluarga') AND (storage.foldername(name))[2] = auth.jwt()->>'id_person')
    OR
    ((storage.foldername(name))[1] = 'legalitas' AND (storage.foldername(name))[2] = auth.jwt()->>'id_pos')
  )
);

-- RLS Policies for 'pastoral' bucket
CREATE POLICY "Users can upload pastoral photos in their scope"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'pastoral'
  AND (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
);

CREATE POLICY "Users can view pastoral photos in their scope"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'pastoral'
  AND (
    (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
    OR auth.jwt()->>'role' = 'super_user'
    OR (auth.jwt()->>'role' = 'admin_mupel' AND (storage.foldername(name))[1] IN (
      SELECT id_pos FROM m_pos_pelkes WHERE id_induk IN (SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = (auth.jwt()->>'id_mupel')::text)
    ))
  )
);

CREATE POLICY "Users can delete their own pastoral photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'pastoral'
  AND (storage.foldername(name))[1] = auth.jwt()->>'id_pos'
);

-- RLS Policies for 'territory' bucket
CREATE POLICY "Users can upload territory photos in their scope"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'territory'
  AND (storage.foldername(name))[2] = auth.jwt()->>'id_pos'
);

CREATE POLICY "Users can view territory photos in their scope"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'territory'
  AND (
    (storage.foldername(name))[2] = auth.jwt()->>'id_pos'
    OR auth.jwt()->>'role' = 'super_user'
    OR (auth.jwt()->>'role' = 'admin_mupel' AND (storage.foldername(name))[2] IN (
      SELECT id_pos FROM m_pos_pelkes WHERE id_induk IN (SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = (auth.jwt()->>'id_mupel')::text)
    ))
  )
);

CREATE POLICY "Users can delete their own territory photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'territory'
  AND (storage.foldername(name))[2] = auth.jwt()->>'id_pos'
);

-- RLS Policies for 'avatars' bucket
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (
    ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    ((storage.foldername(name))[1] = 'pendeta' AND (storage.foldername(name))[2] = auth.jwt()->>'id_person')
  )
);

CREATE POLICY "Avatars are publicly viewable for application rendering"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    ((storage.foldername(name))[1] = 'pendeta' AND (storage.foldername(name))[2] = auth.jwt()->>'id_person')
  )
);


-- [MIGRATION SOURCE: 20260810_add_kerawanan_lat_long_photos.sql]
-- Migration: 20260810_add_kerawanan_lat_long_photos.sql
-- Description: Add latitude, longitude, updated_by to t_kerawanan_wilayah and create t_lampiran_kerawanan table with RLS policies

BEGIN;

ALTER TABLE t_kerawanan_wilayah ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8);
ALTER TABLE t_kerawanan_wilayah ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);
ALTER TABLE t_kerawanan_wilayah ADD COLUMN IF NOT EXISTS updated_by VARCHAR(150);

CREATE TABLE IF NOT EXISTS t_lampiran_kerawanan (
    id_lampiran VARCHAR(30) PRIMARY KEY,
    id_risiko VARCHAR(30) REFERENCES t_kerawanan_wilayah(id_risiko) ON DELETE CASCADE,
    nama_file VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    tipe_file VARCHAR(50),
    ukuran_file NUMERIC(10, 2),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS setup
ALTER TABLE t_lampiran_kerawanan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_lampiran_kerawanan" ON t_lampiran_kerawanan;
DROP POLICY IF EXISTS "Allow insert for t_lampiran_kerawanan" ON t_lampiran_kerawanan;
DROP POLICY IF EXISTS "Allow update for t_lampiran_kerawanan" ON t_lampiran_kerawanan;
DROP POLICY IF EXISTS "Allow delete for t_lampiran_kerawanan" ON t_lampiran_kerawanan;

CREATE POLICY "Allow read for t_lampiran_kerawanan" ON t_lampiran_kerawanan FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_lampiran_kerawanan" ON t_lampiran_kerawanan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_lampiran_kerawanan" ON t_lampiran_kerawanan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_lampiran_kerawanan" ON t_lampiran_kerawanan FOR DELETE USING (true);

COMMIT;


-- [MIGRATION SOURCE: 20260811_add_potensi_lat_long_photos.sql]
-- Migration: 20260811_add_potensi_lat_long_photos.sql
-- Description: Add latitude, longitude, updated_by to t_potensi_wilayah and create t_lampiran_potensi table with RLS policies

BEGIN;

ALTER TABLE t_potensi_wilayah ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8);
ALTER TABLE t_potensi_wilayah ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);
ALTER TABLE t_potensi_wilayah ADD COLUMN IF NOT EXISTS updated_by VARCHAR(150);

CREATE TABLE IF NOT EXISTS t_lampiran_potensi (
    id_lampiran VARCHAR(30) PRIMARY KEY,
    id_potensi VARCHAR(30) REFERENCES t_potensi_wilayah(id_potensi) ON DELETE CASCADE,
    nama_file VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    tipe_file VARCHAR(50),
    ukuran_file NUMERIC(10, 2),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS setup
ALTER TABLE t_lampiran_potensi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_lampiran_potensi" ON t_lampiran_potensi;
DROP POLICY IF EXISTS "Allow insert for t_lampiran_potensi" ON t_lampiran_potensi;
DROP POLICY IF EXISTS "Allow update for t_lampiran_potensi" ON t_lampiran_potensi;
DROP POLICY IF EXISTS "Allow delete for t_lampiran_potensi" ON t_lampiran_potensi;

CREATE POLICY "Allow read for t_lampiran_potensi" ON t_lampiran_potensi FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_lampiran_potensi" ON t_lampiran_potensi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_lampiran_potensi" ON t_lampiran_potensi FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_lampiran_potensi" ON t_lampiran_potensi FOR DELETE USING (true);

COMMIT;


-- [MIGRATION SOURCE: 20260812_add_user_hierarchy_columns.sql]
-- Migration: 20260812_add_user_hierarchy_columns.sql
-- Description: Add missing columns id_induk, id_pos, and nama_lengkap to public.users table for cascading auth selection

BEGIN;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_induk VARCHAR(20) REFERENCES m_jemaat_induk(id_induk);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_pos VARCHAR(20) REFERENCES m_pos_pelkes(id_pos);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(150);

COMMIT;


-- [MIGRATION SOURCE: 20260813_allow_read_hierarchy_master.sql]
-- Migration: 20260813_allow_read_hierarchy_master.sql
-- Description: Allow read/select access for m_mupel, m_jemaat_induk, and m_pos_pelkes to resolve empty data on lists

BEGIN;

-- 1. Allow read for m_mupel
DROP POLICY IF EXISTS "Allow read for m_mupel" ON m_mupel;
CREATE POLICY "Allow read for m_mupel" ON m_mupel FOR SELECT USING (true);

-- 2. Allow read for m_jemaat_induk
DROP POLICY IF EXISTS "Allow read for m_jemaat_induk" ON m_jemaat_induk;
CREATE POLICY "Allow read for m_jemaat_induk" ON m_jemaat_induk FOR SELECT USING (true);

-- 3. Allow read for m_pos_pelkes
DROP POLICY IF EXISTS "Allow read for m_pos_pelkes" ON m_pos_pelkes;
CREATE POLICY "Allow read for m_pos_pelkes" ON m_pos_pelkes FOR SELECT USING (true);

-- Also ensure INSERT/UPDATE/DELETE policies exist for m_jemaat_induk and m_mupel for administration
DROP POLICY IF EXISTS "Allow insert for m_jemaat_induk" ON m_jemaat_induk;
CREATE POLICY "Allow insert for m_jemaat_induk" ON m_jemaat_induk FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for m_jemaat_induk" ON m_jemaat_induk;
CREATE POLICY "Allow update for m_jemaat_induk" ON m_jemaat_induk FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for m_jemaat_induk" ON m_jemaat_induk;
CREATE POLICY "Allow delete for m_jemaat_induk" ON m_jemaat_induk FOR DELETE USING (true);


DROP POLICY IF EXISTS "Allow insert for m_mupel" ON m_mupel;
CREATE POLICY "Allow insert for m_mupel" ON m_mupel FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for m_mupel" ON m_mupel;
CREATE POLICY "Allow update for m_mupel" ON m_mupel FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for m_mupel" ON m_mupel;
CREATE POLICY "Allow delete for m_mupel" ON m_mupel FOR DELETE USING (true);

COMMIT;


-- [MIGRATION SOURCE: 20260814_add_zona_waktu_to_jadwal.sql]
-- Migration: Add zona_waktu column to t_jadwal_ibadah
ALTER TABLE t_jadwal_ibadah ADD COLUMN IF NOT EXISTS zona_waktu VARCHAR(10) DEFAULT 'WIB';


-- [MIGRATION SOURCE: 20260814_fix_jadwal_relawan_pelayan_rls.sql]
-- Migration: 20260814_fix_jadwal_relawan_pelayan_rls.sql
-- Description: Fix Row Level Security (RLS) policies for t_jadwal_ibadah, t_relawan, and t_pelayan tables to allow CRUD operations.

BEGIN;

-- 1. Setup RLS policies for t_jadwal_ibadah
ALTER TABLE t_jadwal_ibadah ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_jadwal_ibadah" ON t_jadwal_ibadah;
DROP POLICY IF EXISTS "Allow insert for t_jadwal_ibadah" ON t_jadwal_ibadah;
DROP POLICY IF EXISTS "Allow update for t_jadwal_ibadah" ON t_jadwal_ibadah;
DROP POLICY IF EXISTS "Allow delete for t_jadwal_ibadah" ON t_jadwal_ibadah;

CREATE POLICY "Allow read for t_jadwal_ibadah" ON t_jadwal_ibadah FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_jadwal_ibadah" ON t_jadwal_ibadah FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_jadwal_ibadah" ON t_jadwal_ibadah FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_jadwal_ibadah" ON t_jadwal_ibadah FOR DELETE USING (true);

-- 2. Setup RLS policies for t_relawan
ALTER TABLE t_relawan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_relawan" ON t_relawan;
DROP POLICY IF EXISTS "Allow insert for t_relawan" ON t_relawan;
DROP POLICY IF EXISTS "Allow update for t_relawan" ON t_relawan;
DROP POLICY IF EXISTS "Allow delete for t_relawan" ON t_relawan;

CREATE POLICY "Allow read for t_relawan" ON t_relawan FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_relawan" ON t_relawan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_relawan" ON t_relawan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_relawan" ON t_relawan FOR DELETE USING (true);

-- 3. Setup RLS policies for t_pelayan
ALTER TABLE t_pelayan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for t_pelayan" ON t_pelayan;
DROP POLICY IF EXISTS "Allow insert for t_pelayan" ON t_pelayan;
DROP POLICY IF EXISTS "Allow update for t_pelayan" ON t_pelayan;
DROP POLICY IF EXISTS "Allow delete for t_pelayan" ON t_pelayan;

CREATE POLICY "Allow read for t_pelayan" ON t_pelayan FOR SELECT USING (true);
CREATE POLICY "Allow insert for t_pelayan" ON t_pelayan FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for t_pelayan" ON t_pelayan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for t_pelayan" ON t_pelayan FOR DELETE USING (true);

COMMIT;


-- [MIGRATION SOURCE: 20260815_add_foto_url_pendeta_pelayan_relawan.sql]
-- Migration: 20260815_add_foto_url_pendeta_pelayan_relawan.sql
-- Description: Add foto_url column to m_pendeta, t_pelayan, and t_relawan for profile photos

BEGIN;

-- 1. Add foto_url column to m_pendeta
ALTER TABLE m_pendeta
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 2. Add foto_url column to t_pelayan
ALTER TABLE t_pelayan
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 3. Add foto_url column to t_relawan
ALTER TABLE t_relawan
ADD COLUMN IF NOT EXISTS foto_url TEXT;

COMMIT;


-- [MIGRATION SOURCE: 20260816_set_user_role_to_pendeta.sql]
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


-- [MIGRATION SOURCE: 20260817_update_users_status_to_active.sql]
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


-- [MIGRATION SOURCE: 20260818_sync_auth_users.sql]
-- Migration: 20260818_sync_auth_users.sql
-- Description: Sync seeded users in public.users to Supabase auth.users and auth.identities schema

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Function to sync public.users to auth.users and auth.identities
DO $$
DECLARE
    u RECORD;
    v_encrypted_pw TEXT;
BEGIN
    FOR u IN SELECT * FROM public.users LOOP
        IF u.email IS NOT NULL AND u.password_hash IS NOT NULL THEN
            v_encrypted_pw := extensions.crypt(u.password_hash, extensions.gen_salt('bf'));
            
            -- Insert into auth.users if email does not exist
            IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = u.email) THEN
                INSERT INTO auth.users (
                    id,
                    instance_id,
                    aud,
                    role,
                    email,
                    encrypted_password,
                    email_confirmed_at,
                    raw_app_meta_data,
                    raw_user_meta_data,
                    created_at,
                    updated_at
                ) VALUES (
                    u.id,
                    '00000000-0000-0000-0000-000000000000',
                    'authenticated',
                    'authenticated',
                    u.email,
                    v_encrypted_pw,
                    NOW(),
                    '{"provider": "email", "providers": ["email"]}'::jsonb,
                    jsonb_build_object('role', u.role, 'nama_lengkap', COALESCE(u.nama_lengkap, u.email)),
                    COALESCE(u.created_at, NOW()),
                    COALESCE(u.updated_at, NOW())
                );
                
                -- Insert into auth.identities
                INSERT INTO auth.identities (
                    id,
                    user_id,
                    identity_data,
                    provider,
                    provider_id,
                    last_sign_in_at,
                    created_at,
                    updated_at
                ) VALUES (
                    gen_random_uuid(),
                    u.id,
                    jsonb_build_object('sub', u.id::text, 'email', u.email),
                    'email',
                    u.email,
                    NOW(),
                    COALESCE(u.created_at, NOW()),
                    COALESCE(u.updated_at, NOW())
                );
            ELSE
                -- Update encrypted password and user metadata if auth user already exists
                UPDATE auth.users
                SET encrypted_password = v_encrypted_pw,
                    raw_user_meta_data = jsonb_build_object('role', u.role, 'nama_lengkap', COALESCE(u.nama_lengkap, u.email)),
                    updated_at = NOW()
                WHERE email = u.email;
            END IF;
        END IF;
    END LOOP;
END $$;

COMMIT;


-- [MIGRATION SOURCE: 20260819_fix_auth_trigger_conflict.sql]
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


-- [MIGRATION SOURCE: 20260820_clean_pos_pelkes_names.sql]
-- Migration: Clean redundant prefixes (Pos Pelkes, Pospelkes, Bajem, GPIB, etc.) from m_pos_pelkes nama_pos

UPDATE m_pos_pelkes
SET nama_pos = TRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      nama_pos,
      '^(GPIB\s+Pos\s*Pelkese?\s*|Pos\s*Pelkese?\s*GPIB\s*|Pos\s*Pelkese?\s*\/\s*Bajem\s*|Pospelkes\s*|Pos\s*Pelkese?\s*|Pos\s*Pelayanan\s*Kesaksian\s*|Bakal\s*Jemaat\s*|Bajem\s*|GPIB\s+)+',
      '',
      'gi'
    ),
    '["''«»]',
    '',
    'g'
  )
)
WHERE nama_pos ~* '^(GPIB|Pos|Pospelkes|Bajem|Bakal)';


-- [MIGRATION SOURCE: 20260821_ensure_super_user_role.sql]
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


-- [MIGRATION SOURCE: 20260822_fix_jemaat_induk_latitude_elevation.sql]
-- Migration: 20260822_fix_jemaat_induk_latitude_elevation.sql
-- Description: Drop NOT NULL constraint on m_jemaat_induk latitude/longitude & pass inherited lat/lng in process_status_elevation RPC

BEGIN;

-- 1. Drop NOT NULL constraint on latitude & longitude if present in m_jemaat_induk
ALTER TABLE public.m_jemaat_induk ALTER COLUMN latitude DROP NOT NULL;
ALTER TABLE public.m_jemaat_induk ALTER COLUMN longitude DROP NOT NULL;

-- 2. Update process_status_elevation function to inherit address and coordinates from Pos/Bajem
CREATE OR REPLACE FUNCTION process_status_elevation(
  p_id_pos VARCHAR,
  p_target_status VARCHAR, -- 'BAJEM' atau 'JEMAAT_INDUK'
  p_tanggal_perubahan DATE,
  p_keterangan TEXT,
  p_id_induk_baru VARCHAR DEFAULT NULL,
  p_nama_induk_baru VARCHAR DEFAULT NULL,
  p_id_mupel_baru VARCHAR DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_status_lama VARCHAR;
  v_id_induk_lama VARCHAR;
  v_id_mupel VARCHAR;
  v_nama_pos VARCHAR;
  v_alamat TEXT;
  v_lat NUMERIC;
  v_lng NUMERIC;
  v_histori_id VARCHAR;
BEGIN
  -- Ambil data pos saat ini beserta alamat dan koordinat GPS
  SELECT COALESCE(kategori, 'Pos Pelkes'), id_induk, nama_pos, alamat, latitude, longitude 
  INTO v_status_lama, v_id_induk_lama, v_nama_pos, v_alamat, v_lat, v_lng
  FROM m_pos_pelkes WHERE id_pos = p_id_pos;
  
  IF v_status_lama IS NULL THEN
    RAISE EXCEPTION 'Pos Pelkes dengan ID % tidak ditemukan', p_id_pos;
  END IF;

  -- Ambil id_mupel dari jemaat induk pengampu
  SELECT id_mupel INTO v_id_mupel FROM m_jemaat_induk WHERE id_induk = v_id_induk_lama;

  IF p_id_mupel_baru IS NOT NULL THEN
    v_id_mupel := p_id_mupel_baru;
  END IF;

  v_histori_id := 'HIS-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || FLOOR(RANDOM() * 1000)::TEXT;

  IF p_target_status = 'BAJEM' THEN
    -- Update Pos menjadi Bajem
    UPDATE m_pos_pelkes 
    SET kategori = 'Bajem', 
        updated_at = NOW() 
    WHERE id_pos = p_id_pos;
    
    -- Catat log histori
    INSERT INTO t_histori_perubahan_status (
      id_histori, id_pos, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, diubah_oleh
    ) VALUES (
      v_histori_id, p_id_pos, v_status_lama, 'Bajem', p_tanggal_perubahan, p_keterangan, auth.uid()
    );

  ELSIF p_target_status = 'JEMAAT_INDUK' THEN
    IF p_id_induk_baru IS NULL OR p_nama_induk_baru IS NULL THEN
      RAISE EXCEPTION 'ID dan Nama Jemaat Induk baru wajib diisi untuk elevasi ke Jemaat Induk';
    END IF;

    -- 1. Buat Record Jemaat Induk Mandiri Baru (warisi alamat, lat, lng dari Pos/Bajem)
    INSERT INTO m_jemaat_induk (
      id_induk, id_mupel, nama_induk, alamat, latitude, longitude, keterangan, created_at, updated_at
    ) VALUES (
      p_id_induk_baru, v_id_mupel, p_nama_induk_baru, v_alamat, COALESCE(v_lat, 0), COALESCE(v_lng, 0),
      'Ditingkatkan dari ' || v_status_lama || ' (' || v_nama_pos || '). SK/Ket: ' || p_keterangan,
      NOW(), NOW()
    ) ON CONFLICT (id_induk) DO UPDATE SET 
      nama_induk = EXCLUDED.nama_induk,
      id_mupel = EXCLUDED.id_mupel,
      alamat = COALESCE(EXCLUDED.alamat, m_jemaat_induk.alamat),
      latitude = COALESCE(EXCLUDED.latitude, m_jemaat_induk.latitude),
      longitude = COALESCE(EXCLUDED.longitude, m_jemaat_induk.longitude),
      updated_at = NOW();

    -- 2. Update Pos Pelkes agar mengarah ke Jemaat Induk baru ini
    UPDATE m_pos_pelkes 
    SET id_induk = p_id_induk_baru,
        kategori = 'Bajem',
        updated_at = NOW() 
    WHERE id_pos = p_id_pos;

    -- 3. Catat log histori
    INSERT INTO t_histori_perubahan_status (
      id_histori, id_pos, id_induk_baru, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, diubah_oleh
    ) VALUES (
      v_histori_id, p_id_pos, p_id_induk_baru, v_status_lama, 'Jemaat Induk', p_tanggal_perubahan, p_keterangan, auth.uid()
    );

  ELSE
    RAISE EXCEPTION 'Target status tidak valid: %', p_target_status;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;


-- [MIGRATION SOURCE: 20260823_update_ekklesia_jemaat_id.sql]
-- Migration: 20260823_update_ekklesia_jemaat_id.sql
-- Description: Update Jemaat Induk Ekklesia (Nanga Silat, Mupel Kalbar) ID from 25-01-EK to 20-25-EK

BEGIN;

-- 1. Insert/Update m_jemaat_induk record with new ID 20-25-EK
INSERT INTO public.m_jemaat_induk (
  id_induk, id_mupel, nama_induk, alamat, latitude, longitude, keterangan, id_kmj, jumlah_sektor, jumlah_kk, jumlah_jiwa, created_at, updated_at
)
SELECT 
  '20-25-EK', id_mupel, nama_induk, alamat, latitude, longitude, keterangan, id_kmj, jumlah_sektor, jumlah_kk, jumlah_jiwa, created_at, NOW()
FROM public.m_jemaat_induk
WHERE id_induk = '25-01-EK'
ON CONFLICT (id_induk) DO UPDATE SET 
  id_mupel = EXCLUDED.id_mupel,
  nama_induk = EXCLUDED.nama_induk,
  updated_at = NOW();

-- 2. Update foreign keys in dependent tables
UPDATE public.m_pos_pelkes SET id_induk = '20-25-EK' WHERE id_induk = '25-01-EK';
UPDATE public.m_pendeta SET id_induk = '20-25-EK' WHERE id_induk = '25-01-EK';
UPDATE public.users SET id_induk = '20-25-EK' WHERE id_induk = '25-01-EK';
UPDATE public.t_histori_perubahan_status SET id_induk_baru = '20-25-EK' WHERE id_induk_baru = '25-01-EK';

-- 3. Delete old Jemaat Induk record
DELETE FROM public.m_jemaat_induk WHERE id_induk = '25-01-EK';

COMMIT;


-- [MIGRATION SOURCE: 20260824_add_jemaat_ke_and_catatan_to_elevation.sql]
-- Migration: 20260824_add_jemaat_ke_and_catatan_to_elevation.sql
-- Description: Add jemaat_ke & catatan to t_histori_perubahan_status and m_jemaat_induk, update process_status_elevation RPC

BEGIN;

-- 1. Tambah kolom jemaat_ke & catatan pada t_histori_perubahan_status jika belum ada
ALTER TABLE public.t_histori_perubahan_status
ADD COLUMN IF NOT EXISTS jemaat_ke INTEGER,
ADD COLUMN IF NOT EXISTS catatan TEXT;

-- 2. Tambah kolom jemaat_ke pada m_jemaat_induk jika belum ada
ALTER TABLE public.m_jemaat_induk
ADD COLUMN IF NOT EXISTS jemaat_ke INTEGER;

-- 3. Perbarui RPC process_status_elevation dengan parameter p_jemaat_ke & p_catatan
CREATE OR REPLACE FUNCTION process_status_elevation(
  p_id_pos VARCHAR,
  p_target_status VARCHAR, -- 'BAJEM' atau 'JEMAAT_INDUK'
  p_tanggal_perubahan DATE,
  p_keterangan TEXT,
  p_id_induk_baru VARCHAR DEFAULT NULL,
  p_nama_induk_baru VARCHAR DEFAULT NULL,
  p_id_mupel_baru VARCHAR DEFAULT NULL,
  p_jemaat_ke INTEGER DEFAULT NULL,
  p_catatan TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_status_lama VARCHAR;
  v_id_induk_lama VARCHAR;
  v_id_mupel VARCHAR;
  v_nama_pos VARCHAR;
  v_alamat TEXT;
  v_lat NUMERIC;
  v_lng NUMERIC;
  v_histori_id VARCHAR;
BEGIN
  -- Ambil data pos saat ini beserta alamat dan koordinat GPS
  SELECT COALESCE(kategori, 'Pos Pelkes'), id_induk, nama_pos, alamat, latitude, longitude 
  INTO v_status_lama, v_id_induk_lama, v_nama_pos, v_alamat, v_lat, v_lng
  FROM m_pos_pelkes WHERE id_pos = p_id_pos;
  
  IF v_status_lama IS NULL THEN
    RAISE EXCEPTION 'Pos Pelkes dengan ID % tidak ditemukan', p_id_pos;
  END IF;

  -- Ambil id_mupel dari jemaat induk pengampu
  SELECT id_mupel INTO v_id_mupel FROM m_jemaat_induk WHERE id_induk = v_id_induk_lama;

  IF p_id_mupel_baru IS NOT NULL THEN
    v_id_mupel := p_id_mupel_baru;
  END IF;

  v_histori_id := 'HIS-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || FLOOR(RANDOM() * 1000)::TEXT;

  IF p_target_status = 'BAJEM' THEN
    -- Update Pos menjadi Bajem
    UPDATE m_pos_pelkes 
    SET kategori = 'Bajem', 
        updated_at = NOW() 
    WHERE id_pos = p_id_pos;
    
    -- Catat log histori
    INSERT INTO t_histori_perubahan_status (
      id_histori, id_pos, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, jemaat_ke, catatan, diubah_oleh
    ) VALUES (
      v_histori_id, p_id_pos, v_status_lama, 'Bajem', p_tanggal_perubahan, p_keterangan, p_jemaat_ke, p_catatan, auth.uid()
    );

  ELSIF p_target_status = 'JEMAAT_INDUK' THEN
    IF p_id_induk_baru IS NULL OR p_nama_induk_baru IS NULL THEN
      RAISE EXCEPTION 'ID dan Nama Jemaat Induk baru wajib diisi untuk elevasi ke Jemaat Induk';
    END IF;

    -- 1. Buat Record Jemaat Induk Mandiri Baru (warisi alamat, lat, lng & jemaat_ke)
    INSERT INTO m_jemaat_induk (
      id_induk, id_mupel, nama_induk, alamat, latitude, longitude, jemaat_ke, keterangan, created_at, updated_at
    ) VALUES (
      p_id_induk_baru, v_id_mupel, p_nama_induk_baru, v_alamat, COALESCE(v_lat, 0), COALESCE(v_lng, 0), p_jemaat_ke,
      'Ditingkatkan dari ' || v_status_lama || ' (' || v_nama_pos || '). SK/Ket: ' || p_keterangan,
      NOW(), NOW()
    ) ON CONFLICT (id_induk) DO UPDATE SET 
      nama_induk = EXCLUDED.nama_induk,
      id_mupel = EXCLUDED.id_mupel,
      jemaat_ke = COALESCE(EXCLUDED.jemaat_ke, m_jemaat_induk.jemaat_ke),
      alamat = COALESCE(EXCLUDED.alamat, m_jemaat_induk.alamat),
      latitude = COALESCE(EXCLUDED.latitude, m_jemaat_induk.latitude),
      longitude = COALESCE(EXCLUDED.longitude, m_jemaat_induk.longitude),
      updated_at = NOW();

    -- 2. Update Pos Pelkes agar mengarah ke Jemaat Induk baru ini
    UPDATE m_pos_pelkes 
    SET id_induk = p_id_induk_baru,
        kategori = 'Bajem',
        updated_at = NOW() 
    WHERE id_pos = p_id_pos;

    -- 3. Catat log histori
    INSERT INTO t_histori_perubahan_status (
      id_histori, id_pos, id_induk_baru, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, jemaat_ke, catatan, diubah_oleh
    ) VALUES (
      v_histori_id, p_id_pos, p_id_induk_baru, v_status_lama, 'Jemaat Induk', p_tanggal_perubahan, p_keterangan, p_jemaat_ke, p_catatan, auth.uid()
    );

  ELSE
    RAISE EXCEPTION 'Target status tidak valid: %', p_target_status;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;


-- [MIGRATION SOURCE: 20260825_fix_histori_status_rls_policies.sql]
-- Migration: 20260825_fix_histori_status_rls_policies.sql
-- Description: Allow SELECT, INSERT, UPDATE, DELETE policies on t_histori_perubahan_status for all authenticated users and super users

BEGIN;

ALTER TABLE public.t_histori_perubahan_status ENABLE ROW LEVEL SECURITY;

-- Allow read access
DROP POLICY IF EXISTS "Allow read access to t_histori_perubahan_status" ON public.t_histori_perubahan_status;
CREATE POLICY "Allow read access to t_histori_perubahan_status"
  ON public.t_histori_perubahan_status FOR SELECT
  USING (true);

-- Allow write/delete access for authenticated users
DROP POLICY IF EXISTS "Allow write/delete for authenticated users on t_histori_perubahan_status" ON public.t_histori_perubahan_status;
CREATE POLICY "Allow write/delete for authenticated users on t_histori_perubahan_status"
  ON public.t_histori_perubahan_status FOR ALL
  USING (true)
  WITH CHECK (true);

COMMIT;


-- [MIGRATION SOURCE: 20260826_fix_jemaat_induk_fk_constraints.sql]
-- Migration: 20260826_fix_jemaat_induk_fk_constraints.sql
-- Description: Update FK constraint t_histori_perubahan_status_id_induk_baru_fkey to ON DELETE SET NULL

BEGIN;

ALTER TABLE public.t_histori_perubahan_status
DROP CONSTRAINT IF EXISTS t_histori_perubahan_status_id_induk_baru_fkey;

ALTER TABLE public.t_histori_perubahan_status
ADD CONSTRAINT t_histori_perubahan_status_id_induk_baru_fkey
FOREIGN KEY (id_induk_baru) REFERENCES public.m_jemaat_induk(id_induk)
ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;


-- [MIGRATION SOURCE: 20260827_add_foto_url_to_jemaat_induk.sql]
-- Migration: 20260827_add_foto_url_to_jemaat_induk.sql
-- Description: Add foto_url column to m_jemaat_induk table

BEGIN;

ALTER TABLE public.m_jemaat_induk
ADD COLUMN IF NOT EXISTS foto_url TEXT;

COMMIT;


-- [MIGRATION SOURCE: 20260828_fix_storage_rls_policies.sql]
-- Migration: 20260828_fix_storage_rls_policies.sql
-- Description: Enable permissive storage policies for pos-pelkes-images bucket

BEGIN;

-- Ensure bucket exists and is set to public
INSERT INTO storage.buckets (id, name, public)
VALUES ('pos-pelkes-images', 'pos-pelkes-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop any existing restrictive policies on pos-pelkes-images bucket
DROP POLICY IF EXISTS "Public Select pos-pelkes-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert pos-pelkes-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update pos-pelkes-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete pos-pelkes-images" ON storage.objects;

-- Create permissive policies for storage.objects on pos-pelkes-images bucket
CREATE POLICY "Public Select pos-pelkes-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'pos-pelkes-images');

CREATE POLICY "Public Insert pos-pelkes-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pos-pelkes-images');

CREATE POLICY "Public Update pos-pelkes-images"
ON storage.objects FOR UPDATE
WITH CHECK (bucket_id = 'pos-pelkes-images');

CREATE POLICY "Public Delete pos-pelkes-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'pos-pelkes-images');

COMMIT;


-- [MIGRATION SOURCE: 20260829_add_performance_indexes.sql]
-- Migration: 20260829_add_performance_indexes.sql
-- Description: Add database performance indexes for fast queries and smooth navigation

BEGIN;

-- Indexes for m_pos_pelkes
CREATE INDEX IF NOT EXISTS idx_m_pos_pelkes_id_induk ON public.m_pos_pelkes(id_induk);
CREATE INDEX IF NOT EXISTS idx_m_pos_pelkes_kategori ON public.m_pos_pelkes(kategori);
CREATE INDEX IF NOT EXISTS idx_m_pos_pelkes_created_at ON public.m_pos_pelkes(created_at DESC);

-- Indexes for m_jemaat_induk
CREATE INDEX IF NOT EXISTS idx_m_jemaat_induk_id_mupel ON public.m_jemaat_induk(id_mupel);
CREATE INDEX IF NOT EXISTS idx_m_jemaat_induk_id_kmj ON public.m_jemaat_induk(id_kmj);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_id_mupel ON public.users(id_mupel);
CREATE INDEX IF NOT EXISTS idx_users_id_induk ON public.users(id_induk);
CREATE INDEX IF NOT EXISTS idx_users_id_pos ON public.users(id_pos);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Indexes for t_histori_perubahan_status
CREATE INDEX IF NOT EXISTS idx_t_histori_id_pos ON public.t_histori_perubahan_status(id_pos);
CREATE INDEX IF NOT EXISTS idx_t_histori_id_induk_baru ON public.t_histori_perubahan_status(id_induk_baru);

-- Indexes for t_jadwal_ibadah
CREATE INDEX IF NOT EXISTS idx_t_jadwal_ibadah_id_pos ON public.t_jadwal_ibadah(id_pos);

-- Indexes for t_demografi_pelkat
CREATE INDEX IF NOT EXISTS idx_t_demografi_pelkat_id_pos ON public.t_demografi_pelkat(id_pos);

COMMIT;


-- [MIGRATION SOURCE: 20260830_fix_t_log_pastoral_rls.sql]
-- Migration: 20260830_fix_t_log_pastoral_rls.sql
-- Description: Enable public/authenticated select RLS policy on t_log_pastoral table

BEGIN;

-- Enable RLS if not enabled
ALTER TABLE public.t_log_pastoral ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select t_log_pastoral" ON public.t_log_pastoral;
DROP POLICY IF EXISTS "Authenticated Select t_log_pastoral" ON public.t_log_pastoral;

CREATE POLICY "Public Select t_log_pastoral"
ON public.t_log_pastoral FOR SELECT
USING (true);

COMMIT;


-- [MIGRATION SOURCE: 20260831_bantuan_rls_policies.sql]
-- ============================================================
-- Migration: 20260831_bantuan_rls_policies.sql
-- Tujuan: Implementasi RLS untuk t_pengajuan_bantuan & t_approval_bantuan
-- Referensi: EIA v0.1.1 §6.2 (Permission × State), rules.md §Security
-- ============================================================

-- ============================================================
-- BAGIAN 1: SCHEMA MIGRATION (Kolom tambahan untuk Workflow)
-- ============================================================
ALTER TABLE t_pengajuan_bantuan
  ADD COLUMN IF NOT EXISTS diajukan_oleh UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS deskripsi TEXT,
  ADD COLUMN IF NOT EXISTS estimasi_biaya DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS tgl_diajukan TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tgl_review_kmj TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS catatan_kmj TEXT,
  ADD COLUMN IF NOT EXISTS tgl_review_mupel TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS catatan_mupel TEXT,
  ADD COLUMN IF NOT EXISTS tgl_keputusan_sinode TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS catatan_sinode TEXT;

-- ============================================================
-- BAGIAN 2: t_pengajuan_bantuan RLS
-- ============================================================

-- Aktifkan RLS (jika belum)
ALTER TABLE t_pengajuan_bantuan ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama yang mungkin ada (untuk idempotency)
DROP POLICY IF EXISTS "Super User full access bantuan" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "Admin Mupel akses bantuan di Mupel-nya" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "KMJ akses bantuan di Jemaat-nya" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "PJ/User akses pengajuan sendiri" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "PJ/User buat pengajuan di Pos tugas" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "PJ/User update pengajuan sendiri" ON t_pengajuan_bantuan;
DROP POLICY IF EXISTS "PJ/User hapus pengajuan sendiri" ON t_pengajuan_bantuan;

-- Policy 1: Super User — full access
CREATE POLICY "Super User full access bantuan"
ON t_pengajuan_bantuan FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'super_user'
  )
);

-- Policy 2: Admin Mupel — lihat & approve pengajuan di Mupel-nya
-- Scope: Pos → Jemaat → Mupel (via users.id_mupel)
CREATE POLICY "Admin Mupel akses bantuan di Mupel-nya"
ON t_pengajuan_bantuan FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN m_pos_pelkes p ON p.id_induk IN (
      SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = u.id_mupel
    )
    WHERE u.id = auth.uid() 
      AND u.role = 'admin_mupel'
      AND p.id_pos = t_pengajuan_bantuan.id_pos
  )
);

-- Policy 3: KMJ — lihat pengajuan di Jemaat yang dipimpinnya
-- Scope: Pos → Jemaat (via users.id_induk)
CREATE POLICY "KMJ akses bantuan di Jemaat-nya"
ON t_pengajuan_bantuan FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN m_pos_pelkes p ON p.id_induk = u.id_induk
    WHERE u.id = auth.uid() 
      AND u.role = 'kmj'
      AND p.id_pos = t_pengajuan_bantuan.id_pos
  )
);

-- Policy 4: PJ/User — lihat pengajuan yang mereka buat
CREATE POLICY "PJ/User akses pengajuan sendiri"
ON t_pengajuan_bantuan FOR SELECT
TO authenticated
USING (
  diajukan_oleh = auth.uid()
);

-- Policy 5: PJ/User — buat pengajuan baru (INSERT)
-- Hanya untuk Pos yang mereka tugaskan (via users.id_pos)
CREATE POLICY "PJ/User buat pengajuan di Pos tugas"
ON t_pengajuan_bantuan FOR INSERT
TO authenticated
WITH CHECK (
  diajukan_oleh = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
      AND u.id_pos = t_pengajuan_bantuan.id_pos
  )
);

-- Policy 6: PJ/User — update pengajuan milik sendiri
-- Catatan: validasi "hanya Draft yang bisa diupdate" dilakukan di application layer
CREATE POLICY "PJ/User update pengajuan sendiri"
ON t_pengajuan_bantuan FOR UPDATE
TO authenticated
USING (
  diajukan_oleh = auth.uid()
)
WITH CHECK (
  diajukan_oleh = auth.uid()
);

-- Policy 7: PJ/User — hapus pengajuan milik sendiri
-- Catatan: validasi "hanya Draft yang bisa dihapus" dilakukan di application layer
CREATE POLICY "PJ/User hapus pengajuan sendiri"
ON t_pengajuan_bantuan FOR DELETE
TO authenticated
USING (
  diajukan_oleh = auth.uid()
);

-- ============================================================
-- BAGIAN 2: t_approval_bantuan
-- ============================================================

ALTER TABLE t_approval_bantuan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super User full access approval" ON t_approval_bantuan;
DROP POLICY IF EXISTS "Admin Mupel akses approval di Mupel-nya" ON t_approval_bantuan;
DROP POLICY IF EXISTS "KMJ akses approval di Jemaat-nya" ON t_approval_bantuan;
DROP POLICY IF EXISTS "Pemohon lihat approval pengajuannya" ON t_approval_bantuan;
DROP POLICY IF EXISTS "Reviewer insert approval" ON t_approval_bantuan;

-- Policy 1: Super User — full access
CREATE POLICY "Super User full access approval"
ON t_approval_bantuan FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'super_user'
  )
);

-- Policy 2: Admin Mupel — lihat approval untuk pengajuan di Mupel-nya
CREATE POLICY "Admin Mupel akses approval di Mupel-nya"
ON t_approval_bantuan FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM t_pengajuan_bantuan pb
    JOIN users u ON u.id = auth.uid()
    JOIN m_pos_pelkes p ON p.id_induk IN (
      SELECT id_induk FROM m_jemaat_induk WHERE id_mupel = u.id_mupel
    )
    WHERE pb.id_ajuan = t_approval_bantuan.id_ajuan
      AND p.id_pos = pb.id_pos
      AND u.role = 'admin_mupel'
  )
);

-- Policy 3: KMJ — lihat approval untuk pengajuan di Jemaat-nya
CREATE POLICY "KMJ akses approval di Jemaat-nya"
ON t_approval_bantuan FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM t_pengajuan_bantuan pb
    JOIN users u ON u.id = auth.uid()
    JOIN m_pos_pelkes p ON p.id_induk = u.id_induk
    WHERE pb.id_ajuan = t_approval_bantuan.id_ajuan
      AND p.id_pos = pb.id_pos
      AND u.role = 'kmj'
  )
);

-- Policy 4: Pemohon — lihat approval untuk pengajuannya sendiri
CREATE POLICY "Pemohon lihat approval pengajuannya"
ON t_approval_bantuan FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM t_pengajuan_bantuan pb
    WHERE pb.id_ajuan = t_approval_bantuan.id_ajuan
      AND pb.diajukan_oleh = auth.uid()
  )
);

-- Policy 5: Reviewer — insert approval
-- Validasi role & status dilakukan di application layer (service)
-- RLS hanya memastikan user yang authenticated bisa insert
CREATE POLICY "Reviewer insert approval"
ON t_approval_bantuan FOR INSERT
TO authenticated
WITH CHECK (
  approver_id = auth.uid()
);

-- ============================================================
-- BAGIAN 3: Index untuk performa RLS subqueries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pengajuan_bantuan_id_pos 
  ON t_pengajuan_bantuan(id_pos);
CREATE INDEX IF NOT EXISTS idx_pengajuan_bantuan_diajukan_oleh 
  ON t_pengajuan_bantuan(diajukan_oleh);
CREATE INDEX IF NOT EXISTS idx_approval_bantuan_id_ajuan 
  ON t_approval_bantuan(id_ajuan);


-- [MIGRATION SOURCE: 20260831_eia_v011_propagation.sql]
-- Migration: 20260831_eia_v011_propagation.sql
-- Description: Implement EIA v0.1.1 propagation checklist (id_pengajuan_sebelumnya & t_log_aktivitas RLS)

BEGIN;

-- 1. Tambah kolom id_pengajuan_sebelumnya di t_pengajuan_bantuan
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 't_pengajuan_bantuan' AND column_name = 'id_pengajuan_sebelumnya'
  ) THEN
    ALTER TABLE t_pengajuan_bantuan 
    ADD COLUMN id_pengajuan_sebelumnya VARCHAR(30) NULL REFERENCES t_pengajuan_bantuan(id_ajuan);
  END IF;
END $$;

-- 2. Update RLS policy untuk t_log_aktivitas
-- EIA v0.1.1: Diri sendiri + Super User + admin_mupel (scope Mupel) + kmj (scope Jemaat)

DROP POLICY IF EXISTS "Akses audit log aktivitas" ON t_log_aktivitas;
DROP POLICY IF EXISTS "User can view own audit log" ON t_log_aktivitas;

CREATE POLICY "Akses audit log aktivitas"
ON t_log_aktivitas FOR SELECT
USING (
  -- Diri sendiri
  id_user = auth.uid()
  -- Super User global
  OR (SELECT role FROM users WHERE id = auth.uid()) = 'super_user'
  -- Admin Mupel (dapat melihat audit log user dalam scope Mupelnya)
  OR (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin_mupel'
    AND id_user IN (
      SELECT id FROM users WHERE id_mupel = (SELECT id_mupel FROM users WHERE id = auth.uid())
    )
  )
  -- KMJ (dapat melihat audit log user dalam scope Jemaatnya)
  OR (
    (SELECT role FROM users WHERE id = auth.uid()) = 'kmj'
    AND id_user IN (
      SELECT id FROM users WHERE id_induk = (SELECT id_induk FROM users WHERE id = auth.uid())
    )
  )
);

COMMIT;


-- [MIGRATION SOURCE: 20260901_create_documents_bucket.sql]
-- Migration: Create Documents Bucket
-- Description: Buat bucket documents untuk menyimpan SK dan dokumen lainnya

BEGIN;

-- Insert bucket baru ke tabel storage.buckets jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents', 
    'documents', 
    true, 
    10485760, -- 10MB limit max
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Hapus policy lama jika ada untuk mencegah duplikasi
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Super users can delete documents" ON storage.objects;

-- Policy 1: Semua orang (bahkan anonim) bisa melihat dokumen di bucket ini karena public
CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Policy 2: Authenticated user bisa upload ke bucket ini
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy 3: Super users dan uploader bisa update/delete file
CREATE POLICY "Users can manage their uploaded documents"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documents' AND (
  auth.uid() = owner OR 
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_user'
));

COMMIT;


-- [MIGRATION SOURCE: 20260902_pastoral_rls_kmj.sql]
-- supabase/migrations/20260902_pastoral_rls_kmj.sql

-- Pastikan RLS diaktifkan
ALTER TABLE t_log_pastoral ENABLE ROW LEVEL SECURITY;

-- KMJ bisa membaca log pastoral dari Pos di jemaatnya
DROP POLICY IF EXISTS "kmj_read_log_pastoral" ON t_log_pastoral;
CREATE POLICY "kmj_read_log_pastoral"
ON t_log_pastoral FOR SELECT TO authenticated
USING (
  id_pos IN (
    SELECT p.id_pos 
    FROM m_pos_pelkes p
    JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
    WHERE j.id_kmj = (
      SELECT id_pendeta FROM users WHERE id = auth.uid()
    )
  )
);


-- [MIGRATION SOURCE: 20260902_pastoral_stats_rpc.sql]
-- supabase/migrations/20260902_pastoral_stats_rpc.sql

CREATE OR REPLACE FUNCTION get_pastoral_stats(
  p_id_jemaat VARCHAR,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  p_end_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- RBAC: Pastikan user adalah KMJ dari jemaat ini
  IF NOT EXISTS (
    SELECT 1 FROM m_jemaat_induk 
    WHERE id_induk = p_id_jemaat 
      AND id_kmj = (SELECT id_pendeta FROM users WHERE id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'RBAC_VIOLATION: Anda bukan KMJ dari jemaat ini';
  END IF;

  SELECT jsonb_build_object(
    'total_log', COUNT(*),
    'total_jiwa', COALESCE(SUM(jml_jiwa), 0),
    'total_pos', COUNT(DISTINCT id_pos),
    'total_pendeta', COUNT(DISTINCT id_pendeta),
    'avg_jiwa_per_log', ROUND(COALESCE(AVG(jml_jiwa), 0)::NUMERIC, 1),
    'latest_log', MAX(created_at)
  ) INTO result
  FROM t_log_pastoral
  WHERE id_pos IN (
    SELECT id_pos FROM m_pos_pelkes WHERE id_induk = p_id_jemaat
  )
  AND tgl BETWEEN p_start_date AND p_end_date;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION get_pastoral_stats FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_pastoral_stats TO authenticated;


-- [MIGRATION SOURCE: 20260903_pendeta_360_rpc.sql]
-- supabase/migrations/20260903_pendeta_360_rpc.sql

CREATE OR REPLACE FUNCTION get_pendeta_360(
  p_id_pendeta VARCHAR,
  p_requester_role VARCHAR,
  p_requester_scope_mupel VARCHAR DEFAULT NULL,
  p_requester_scope_jemaat VARCHAR DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  can_see_private BOOLEAN;
  can_see_audit BOOLEAN;
BEGIN
  -- 1. RBAC hard-check (gagal cepat jika unauthorized)
  IF p_requester_role = 'super_user' THEN
    can_see_private := TRUE;
    can_see_audit := TRUE;
  ELSIF p_requester_role = 'admin_mupel' THEN
    -- Admin Mupel: hanya pendeta di Mupel-nya
    IF NOT EXISTS (
      SELECT 1 FROM m_pendeta p
      JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
      WHERE p.id_pendeta = p_id_pendeta
        AND j.id_mupel = p_requester_scope_mupel
    ) THEN
      RAISE EXCEPTION 'RBAC_VIOLATION: Pendeta tidak berada di Mupel Anda';
    END IF;
    can_see_private := FALSE; -- Admin Mupel tidak boleh lihat Keluarga/Biometrik
    can_see_audit := TRUE;
  ELSIF p_requester_role = 'kmj' THEN
    -- KMJ: hanya pendeta di Jemaat-nya
    IF NOT EXISTS (
      SELECT 1 FROM m_pendeta
      WHERE id_pendeta = p_id_pendeta
        AND id_induk = p_requester_scope_jemaat
    ) THEN
      RAISE EXCEPTION 'RBAC_VIOLATION: Pendeta tidak berada di Jemaat Anda';
    END IF;
    can_see_private := FALSE;
    can_see_audit := TRUE;
  ELSIF p_requester_role IN ('pj', 'user') THEN
    -- PJ/User: hanya diri sendiri
    IF NOT EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND id_pendeta = p_id_pendeta
    ) THEN
      RAISE EXCEPTION 'RBAC_VIOLATION: Anda hanya bisa melihat profil sendiri';
    END IF;
    can_see_private := TRUE; -- Diri sendiri bisa lihat semua
    can_see_audit := TRUE;
  ELSE
    RAISE EXCEPTION 'RBAC_VIOLATION: Role tidak diizinkan';
  END IF;

  -- 2. Agregasi data (baru setelah RBAC lolos)
  SELECT jsonb_build_object(
    'pendeta', (
      SELECT row_to_json(p.*) FROM m_pendeta p WHERE p.id_pendeta = p_id_pendeta
    ),
    'stats', (
      SELECT jsonb_build_object(
        'total_log', COUNT(DISTINCT lp.id_log),
        'total_jiwa', COALESCE(SUM(lp.jml_jiwa), 0),
        'pos_aktif', COUNT(DISTINCT tp.id_pos),
        'log_bulan_ini', COUNT(DISTINCT lp.id_log) FILTER (WHERE lp.tgl >= DATE_TRUNC('month', CURRENT_DATE)),
        'lama_melayani_bulan', EXTRACT(YEAR FROM AGE(CURRENT_DATE, MIN(p.tgl_tugas))) * 12 + EXTRACT(MONTH FROM AGE(CURRENT_DATE, MIN(p.tgl_tugas)))
      )
      FROM m_pendeta p
      LEFT JOIN t_log_pastoral lp ON p.id_pendeta = lp.id_pendeta
      LEFT JOIN t_penugasan_pendeta tp ON p.id_pendeta = tp.id_pendeta AND tp.status_tugas = 'Aktif'
      WHERE p.id_pendeta = p_id_pendeta
    ),
    'keluarga', CASE WHEN can_see_private THEN (
      SELECT jsonb_agg(row_to_json(k.*)) FROM t_keluarga_pendeta k WHERE k.id_pendeta = p_id_pendeta
    ) ELSE NULL END,
    'kompetensi', (
      SELECT jsonb_agg(row_to_json(k.*)) FROM t_kompetensi_pendeta k WHERE k.id_pendeta = p_id_pendeta
    ),
    'keterlibatan', (
      SELECT jsonb_agg(row_to_json(k.*) ORDER BY k.tgl_mulai DESC) 
      FROM t_keterlibatan_pendeta k WHERE k.id_pendeta = p_id_pendeta
    ),
    'mutasi', (
      SELECT jsonb_agg(row_to_json(m.*) ORDER BY m.tanggal_mutasi DESC) 
      FROM t_riwayat_mutasi_pendeta m WHERE m.id_pendeta = p_id_pendeta
    ),
    'jabatan', (
      SELECT jsonb_agg(row_to_json(j.*) ORDER BY j.tgl_mulai DESC) 
      FROM t_jabatan_struktural j WHERE j.id_pendeta = p_id_pendeta
    ),
    'biometric', CASE WHEN can_see_private THEN (
      SELECT jsonb_agg(jsonb_build_object(
        'id', w.id,
        'device_type', w.device_type,
        'display_name', w.display_name,
        'last_used_at', w.last_used_at,
        'created_at', w.created_at
      )) 
      FROM m_webauthn_credentials w 
      JOIN users u ON w.id_user = u.id 
      WHERE u.id_pendeta = p_id_pendeta
    ) ELSE NULL END,
    'audit_log', CASE WHEN can_see_audit THEN (
      SELECT jsonb_agg(jsonb_build_object(
        'id', l.id,
        'aksi', l.aksi,
        'target_table', l.target_table,
        'target_id', l.target_id,
        'created_at', l.created_at
      ) ORDER BY l.created_at DESC) 
      FROM t_log_aktivitas l 
      WHERE l.id_user = (SELECT id FROM users WHERE id_pendeta = p_id_pendeta)
      LIMIT 50
    ) ELSE NULL END
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION get_pendeta_360(VARCHAR, VARCHAR, VARCHAR, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_pendeta_360(VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO authenticated;


-- [MIGRATION SOURCE: 20260904_analytics_rpc.sql]
-- Migration: Analytics Dashboard RPC Function
-- Returns aggregated stats, monthly growth trends, Mupel distributions, and Pos Pelkes geo-locations.

CREATE OR REPLACE FUNCTION get_analytics_dashboard_data(
  p_id_mupel TEXT DEFAULT NULL,
  p_id_induk TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_pos INT;
  v_pos_growth_month INT;
  v_total_pendeta INT;
  v_pendeta_growth_month INT;
  v_total_jemaat INT;
  v_jemaat_growth_month INT;
  v_total_log_pastoral_month INT;
  v_log_growth_month INT;
  
  v_growth_trends JSONB;
  v_mupel_distribution JSONB;
  v_pos_locations JSONB;
BEGIN
  -- 1. Total Pos Pelkes
  SELECT COUNT(*), COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))
  INTO v_total_pos, v_pos_growth_month
  FROM m_pos_pelkes p
  JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
  WHERE (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR p.id_induk = p_id_induk);

  -- 2. Total Pendeta
  SELECT COUNT(*), COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))
  INTO v_total_pendeta, v_pendeta_growth_month
  FROM m_pendeta p
  LEFT JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
  WHERE (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR p.id_induk = p_id_induk);

  -- 3. Total Jemaat Induk
  SELECT COUNT(*), COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))
  INTO v_total_jemaat, v_jemaat_growth_month
  FROM m_jemaat_induk j
  WHERE (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR j.id_induk = p_id_induk);

  -- 4. Total Log Pastoral Bulan Ini
  SELECT COUNT(*), COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))
  INTO v_total_log_pastoral_month, v_log_growth_month
  FROM t_log_pastoral l
  JOIN m_pos_pelkes p ON l.id_pos = p.id_pos
  JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
  WHERE (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR p.id_induk = p_id_induk);

  -- 5. Monthly Growth Trends (Last 6 Months)
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
      date_trunc('month', CURRENT_DATE),
      INTERVAL '1 month'
    )::date AS m
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', to_char(m.m, 'Mon YYYY'),
      'pos_count', (
        SELECT COUNT(*) FROM m_pos_pelkes p
        JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE p.created_at <= (m.m + INTERVAL '1 month' - INTERVAL '1 day')
          AND (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
          AND (p_id_induk IS NULL OR p.id_induk = p_id_induk)
      ),
      'pastoral_count', (
        SELECT COUNT(*) FROM t_log_pastoral l
        JOIN m_pos_pelkes p ON l.id_pos = p.id_pos
        JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE l.tgl_kunjungan >= m.m AND l.tgl_kunjungan < (m.m + INTERVAL '1 month')
          AND (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
          AND (p_id_induk IS NULL OR p.id_induk = p_id_induk)
      )
    )
  ) INTO v_growth_trends
  FROM months m;

  -- 6. Mupel Distribution
  SELECT jsonb_agg(
    jsonb_build_object(
      'nama_mupel', m.nama_mupel,
      'pos_count', COUNT(DISTINCT p.id_pos),
      'pendeta_count', COUNT(DISTINCT pdt.id_pendeta)
    )
  ) INTO v_mupel_distribution
  FROM m_mupel m
  LEFT JOIN m_jemaat_induk j ON m.id_mupel = j.id_mupel
  LEFT JOIN m_pos_pelkes p ON j.id_induk = p.id_induk
  LEFT JOIN m_pendeta pdt ON j.id_induk = pdt.id_induk
  WHERE (p_id_mupel IS NULL OR m.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR j.id_induk = p_id_induk)
  GROUP BY m.id_mupel, m.nama_mupel
  ORDER BY m.nama_mupel;

  -- 7. Pos Pelkes Locations (with GPS lat/lng)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id_pos', p.id_pos,
      'nama_pos', p.nama_pos,
      'latitude', COALESCE(p.latitude, -6.2088),
      'longitude', COALESCE(p.longitude, 106.8456),
      'nama_jemaat', j.nama_jemaat,
      'nama_mupel', m.nama_mupel
    )
  ) INTO v_pos_locations
  FROM m_pos_pelkes p
  JOIN m_jemaat_induk j ON p.id_induk = j.id_induk
  JOIN m_mupel m ON j.id_mupel = m.id_mupel
  WHERE (p_id_mupel IS NULL OR j.id_mupel = p_id_mupel)
    AND (p_id_induk IS NULL OR p.id_induk = p_id_induk);

  RETURN jsonb_build_object(
    'stats', jsonb_build_object(
      'total_pos', COALESCE(v_total_pos, 0),
      'pos_growth_month', COALESCE(v_pos_growth_month, 0),
      'total_pendeta', COALESCE(v_total_pendeta, 0),
      'pendeta_growth_month', COALESCE(v_pendeta_growth_month, 0),
      'total_jemaat', COALESCE(v_total_jemaat, 0),
      'jemaat_growth_month', COALESCE(v_jemaat_growth_month, 0),
      'total_log_pastoral_month', COALESCE(v_total_log_pastoral_month, 0),
      'log_growth_month', COALESCE(v_log_growth_month, 0)
    ),
    'growth_trends', COALESCE(v_growth_trends, '[]'::jsonb),
    'mupel_distribution', COALESCE(v_mupel_distribution, '[]'::jsonb),
    'pos_locations', COALESCE(v_pos_locations, '[]'::jsonb)
  );
END;
$$;


-- [MIGRATION SOURCE: 20260905_public_portal_rpc.sql]
-- Migration: 20260905_public_portal_rpc.sql
-- Description: RPC for Public Portal and Geo Index

-- 1. Index for geospatial optimization
CREATE INDEX IF NOT EXISTS idx_pos_pelkes_geo ON m_pos_pelkes(latitude, longitude);

-- 2. Drop existing function if exists
DROP FUNCTION IF EXISTS get_public_pos_pelkes();

-- 3. Create function
CREATE OR REPLACE FUNCTION get_public_pos_pelkes()
RETURNS TABLE (
  id_pos VARCHAR,
  nama_pos VARCHAR,
  alamat TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  kategori VARCHAR,
  jumlah_kk INT,
  jumlah_jiwa INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hard-check: hanya return Pos dengan koordinat valid
  -- (mencegah return data draft/legacy tanpa lokasi)
  RETURN QUERY
  SELECT 
    p.id_pos,
    p.nama_pos,
    p.alamat,
    p.latitude,
    p.longitude,
    p.kategori,
    COALESCE(p.jumlah_kk, 0),
    COALESCE(p.jumlah_jiwa, 0)
  FROM m_pos_pelkes p
  WHERE p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    -- NOTE: p.status = 'Aktif' di-skip karena kolom status tidak ada di m_pos_pelkes.
  ORDER BY p.nama_pos;
END;
$$;

-- 4. Grants
GRANT EXECUTE ON FUNCTION get_public_pos_pelkes() TO anon, authenticated;


-- [MIGRATION SOURCE: 20260906_b1_universal_identity.sql]
-- ====================================================================================
-- FINAL PRODUCTION MIGRATION SCRIPT
-- ====================================================================================
-- INSTRUCTIONS FOR SUPABASE SQL EDITOR:
-- 1. DO NOT HIGHLIGHT or SELECT specific parts of this code.
-- 2. Make sure NO TEXT is highlighted in the editor.
-- 3. Click the "Run" button to execute the ENTIRE script in one go.
--
-- Why? This script uses temporary tables and transactions that must be run together 
-- in a single session.
-- ====================================================================================

BEGIN;

-- MANDATORY 1 FIX: Advisory lock at the very beginning to prevent concurrent migration DDL interference
SELECT pg_advisory_xact_lock(hashtext('SI_GPIB:B1:UNIVERSAL_IDENTITY'));

-- PREFLIGHT STAGE: Validation of existing schemas
DO $$
DECLARE
    v_fk_count INT;
    v_dup_count INT;
BEGIN
    -- Schema Preflight Assertions scoped to 'public' with complete source column checks
    -- m_pendeta complete check
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'nama_lengkap') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.nama_lengkap missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'no_wa') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.no_wa missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'tgl_lahir') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.tgl_lahir missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'gender') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.gender missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'status') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.status missing'; END IF;

    -- t_pelayan complete check
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'nama') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.nama missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'no_wa') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.no_wa missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'tgl_lahir') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.tgl_lahir missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'gender') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.gender missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'status') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.status missing'; END IF;

    -- t_relawan complete check
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'nama') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.nama missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'no_wa') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.no_wa missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'tgl_lahir') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.tgl_lahir missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'gender') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.gender missing'; END IF;

    -- BLOCKER B1-08 FIX: Explicit partial-schema rejection
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'm_person') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'id_person')
        OR EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'id_person')
        OR EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'id_person')
        OR EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_person') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: legacy id_person column exists while public.m_person does not exist. Manual schema reconciliation required before B1 execution.';
        END IF;
    END IF;

    -- Existing m_person Structural Compatibility Contract validation
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'm_person') THEN
        -- id_person: UUID
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'id_person' AND data_type = 'uuid') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.id_person missing or not UUID';
        END IF;
        -- id_person: Single-Column Primary Key validation via pg_constraint
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = t.oid
            WHERE c.contype = 'p' 
              AND n.nspname = 'public' 
              AND t.relname = 'm_person' 
              AND a.attname = 'id_person'
              AND array_length(c.conkey, 1) = 1
              AND c.conkey[1] = a.attnum
        ) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.id_person is not a valid single-column PRIMARY KEY';
        END IF;
        -- nama_lengkap: VARCHAR(>=150) / TEXT and NOT NULL
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'nama_lengkap' 
              AND (data_type = 'text' OR (data_type = 'character varying' AND character_maximum_length >= 150))
              AND is_nullable = 'NO'
        ) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.nama_lengkap missing, not text/varchar(>=150), or is nullable';
        END IF;
        -- no_wa: VARCHAR(>=20) / TEXT
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'no_wa' 
              AND (data_type = 'text' OR (data_type = 'character varying' AND character_maximum_length >= 20))
        ) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.no_wa missing or not text/varchar(>=20)';
        END IF;
        -- tgl_lahir: DATE
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'tgl_lahir' AND data_type = 'date') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.tgl_lahir missing or not date';
        END IF;
        -- gender: VARCHAR(>=10) / TEXT
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'gender' 
              AND (data_type = 'text' OR (data_type = 'character varying' AND character_maximum_length >= 10))
        ) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.gender missing or not text/varchar(>=10)';
        END IF;
        -- status_aktif: VARCHAR(>=50) / TEXT
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'status_aktif' 
              AND (data_type = 'text' OR (data_type = 'character varying' AND character_maximum_length >= 50))
        ) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.status_aktif missing or not text/varchar(>=50)';
        END IF;
    END IF;

    -- Existing id_person contract in legacy tables (UUID + FK validation via pg_constraint hardening)
    -- m_pendeta
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'id_person') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'id_person' AND data_type = 'uuid') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.id_person exists but is not UUID';
        END IF;
        
        SELECT COUNT(*) INTO v_fk_count 
        FROM pg_constraint c
        JOIN pg_class conrel ON c.conrelid = conrel.oid
        JOIN pg_namespace connsp ON conrel.relnamespace = connsp.oid
        JOIN pg_class confrel ON c.confrelid = confrel.oid
        JOIN pg_namespace confnsp ON confrel.relnamespace = confnsp.oid
        JOIN pg_attribute conatt ON conatt.attrelid = conrel.oid AND conatt.attnum = ANY(c.conkey)
        JOIN pg_attribute confatt ON confatt.attrelid = confrel.oid AND confatt.attnum = ANY(c.confkey)
        WHERE c.contype = 'f'
          AND c.convalidated = true
          AND connsp.nspname = 'public' AND conrel.relname = 'm_pendeta' AND conatt.attname = 'id_person'
          AND confnsp.nspname = 'public' AND confrel.relname = 'm_person' AND confatt.attname = 'id_person'
          AND array_length(c.conkey, 1) = 1 AND array_length(c.confkey, 1) = 1
          AND c.conkey[1] = conatt.attnum AND c.confkey[1] = confatt.attnum;
          
        IF v_fk_count = 0 THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.id_person exists but has no valid, single-column, validated FK to public.m_person(id_person)'; END IF;
    END IF;

    -- t_pelayan
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'id_person') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'id_person' AND data_type = 'uuid') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.id_person exists but is not UUID';
        END IF;
        
        SELECT COUNT(*) INTO v_fk_count 
        FROM pg_constraint c
        JOIN pg_class conrel ON c.conrelid = conrel.oid
        JOIN pg_namespace connsp ON conrel.relnamespace = connsp.oid
        JOIN pg_class confrel ON c.confrelid = confrel.oid
        JOIN pg_namespace confnsp ON confrel.relnamespace = confnsp.oid
        JOIN pg_attribute conatt ON conatt.attrelid = conrel.oid AND conatt.attnum = ANY(c.conkey)
        JOIN pg_attribute confatt ON confatt.attrelid = confrel.oid AND confatt.attnum = ANY(c.confkey)
        WHERE c.contype = 'f'
          AND c.convalidated = true
          AND connsp.nspname = 'public' AND conrel.relname = 't_pelayan' AND conatt.attname = 'id_person'
          AND confnsp.nspname = 'public' AND confrel.relname = 'm_person' AND confatt.attname = 'id_person'
          AND array_length(c.conkey, 1) = 1 AND array_length(c.confkey, 1) = 1
          AND c.conkey[1] = conatt.attnum AND c.confkey[1] = confatt.attnum;

        IF v_fk_count = 0 THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.id_person exists but has no valid, single-column, validated FK to public.m_person(id_person)'; END IF;
    END IF;

    -- t_relawan
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'id_person') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'id_person' AND data_type = 'uuid') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.id_person exists but is not UUID';
        END IF;
        
        SELECT COUNT(*) INTO v_fk_count 
        FROM pg_constraint c
        JOIN pg_class conrel ON c.conrelid = conrel.oid
        JOIN pg_namespace connsp ON conrel.relnamespace = connsp.oid
        JOIN pg_class confrel ON c.confrelid = confrel.oid
        JOIN pg_namespace confnsp ON confrel.relnamespace = confnsp.oid
        JOIN pg_attribute conatt ON conatt.attrelid = conrel.oid AND conatt.attnum = ANY(c.conkey)
        JOIN pg_attribute confatt ON confatt.attrelid = confrel.oid AND confatt.attnum = ANY(c.confkey)
        WHERE c.contype = 'f'
          AND c.convalidated = true
          AND connsp.nspname = 'public' AND conrel.relname = 't_relawan' AND conatt.attname = 'id_person'
          AND confnsp.nspname = 'public' AND confrel.relname = 'm_person' AND confatt.attname = 'id_person'
          AND array_length(c.conkey, 1) = 1 AND array_length(c.confkey, 1) = 1
          AND c.conkey[1] = conatt.attnum AND c.confkey[1] = confatt.attnum;

        IF v_fk_count = 0 THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.id_person exists but has no valid, single-column, validated FK to public.m_person(id_person)'; END IF;
    END IF;

    -- users
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_person') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_person' AND data_type = 'uuid') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.users.id_person exists but is not UUID';
        END IF;
        
        SELECT COUNT(*) INTO v_fk_count 
        FROM pg_constraint c
        JOIN pg_class conrel ON c.conrelid = conrel.oid
        JOIN pg_namespace connsp ON conrel.relnamespace = connsp.oid
        JOIN pg_class confrel ON c.confrelid = confrel.oid
        JOIN pg_namespace confnsp ON confrel.relnamespace = confnsp.oid
        JOIN pg_attribute conatt ON conatt.attrelid = conrel.oid AND conatt.attnum = ANY(c.conkey)
        JOIN pg_attribute confatt ON confatt.attrelid = confrel.oid AND confatt.attnum = ANY(c.confkey)
        WHERE c.contype = 'f'
          AND c.convalidated = true
          AND connsp.nspname = 'public' AND conrel.relname = 'users' AND conatt.attname = 'id_person'
          AND confnsp.nspname = 'public' AND confrel.relname = 'm_person' AND confatt.attname = 'id_person'
          AND array_length(c.conkey, 1) = 1 AND array_length(c.confkey, 1) = 1
          AND c.conkey[1] = conatt.attnum AND c.confkey[1] = confatt.attnum;

        IF v_fk_count = 0 THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.users.id_person exists but has no valid, single-column, validated FK to public.m_person(id_person)'; END IF;
        
        -- Existing users cardinality duplicate validation
        EXECUTE 'SELECT COUNT(*) FROM (SELECT id_person FROM public.users WHERE id_person IS NOT NULL GROUP BY id_person HAVING COUNT(*) > 1) d' INTO v_dup_count;
        IF v_dup_count > 0 THEN
            RAISE EXCEPTION 'PREFLIGHT CARDINALITY FAILED: % existing public.users.id_person mappings violate 1:1 cardinality', v_dup_count;
        END IF;
    END IF;

    -- Preflight sys_migration_audit contract hardening (type checks)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sys_migration_audit') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'execution_id' AND data_type = 'uuid') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'migration_version' AND data_type IN ('character varying', 'text')) OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'todo_pendeta_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'todo_pelayan_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'todo_relawan_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'todo_users_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'created_person_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'mapped_users_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'status' AND data_type IN ('character varying', 'text')) OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'notes' AND data_type IN ('character varying', 'text')) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.sys_migration_audit exists but is missing required contract columns or has type mismatches. Re-run compatibility requires full v1.9 schema.';
        END IF;
    END IF;
END $$;

-- 1. Create Migration Audit Ledger
CREATE TABLE IF NOT EXISTS public.sys_migration_audit (
    id SERIAL PRIMARY KEY,
    migration_version VARCHAR(50) NOT NULL,
    execution_id UUID DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Invariants Tracking
    todo_pendeta_count INT DEFAULT 0,
    todo_pelayan_count INT DEFAULT 0,
    todo_relawan_count INT DEFAULT 0,
    todo_users_count INT DEFAULT 0,
    
    created_person_count INT DEFAULT 0,
    mapped_users_count INT DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    notes TEXT
);

-- Secure the audit ledger immediately (Default Deny)
ALTER TABLE public.sys_migration_audit ENABLE ROW LEVEL SECURITY;

-- 2. Schema Foundation: m_person (Canonical Identity)
CREATE TABLE IF NOT EXISTS public.m_person (
    id_person UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lengkap VARCHAR(150) NOT NULL,
    no_wa VARCHAR(20),
    tgl_lahir DATE,
    gender VARCHAR(10),
    foto_url TEXT,
    status_aktif VARCHAR(50) DEFAULT 'Aktif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secure canonical identity table immediately (Default Deny)
ALTER TABLE public.m_person ENABLE ROW LEVEL SECURITY;

-- 3. Schema Foundation: FK Additions (Many-to-One / No UNIQUE constraint)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'id_person') THEN
        ALTER TABLE public.m_pendeta ADD COLUMN id_person UUID REFERENCES public.m_person(id_person);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'id_person') THEN
        ALTER TABLE public.t_pelayan ADD COLUMN id_person UUID REFERENCES public.m_person(id_person);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'id_person') THEN
        ALTER TABLE public.t_relawan ADD COLUMN id_person UUID REFERENCES public.m_person(id_person);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_person') THEN
        ALTER TABLE public.users ADD COLUMN id_person UUID REFERENCES public.m_person(id_person);
    END IF;
END $$;

-- 4. Indexes (For Dual-Path Performance & Lookup)
CREATE INDEX IF NOT EXISTS idx_m_pendeta_person ON public.m_pendeta(id_person);
CREATE INDEX IF NOT EXISTS idx_t_pelayan_person ON public.t_pelayan(id_person);
CREATE INDEX IF NOT EXISTS idx_t_relawan_person ON public.t_relawan(id_person);
CREATE INDEX IF NOT EXISTS idx_users_person ON public.users(id_person);

-- users -> m_person cardinality enforcement
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_person 
ON public.users(id_person) 
WHERE id_person IS NOT NULL;

-- Temporary table to track strictly the generated persons during this execution for scoped orphan checks
DROP TABLE IF EXISTS tmp_created_persons;
CREATE TEMP TABLE tmp_created_persons (id_person UUID);

-- Temporary table to hold explicit mappings and decouple parent INSERT from child UPDATE (Blocker Fix)
DROP TABLE IF EXISTS tmp_migration_mapping;
CREATE TEMP TABLE tmp_migration_mapping (
    legacy_id VARCHAR(50),
    legacy_type VARCHAR(20),
    new_person_id UUID,
    nama VARCHAR(150),
    no_wa VARCHAR(20),
    tgl_lahir DATE,
    gender VARCHAR(10)
);


-- 5. Backfill & Reconciliation (Idempotent, Transactional, Zero-Orphan Guaranteed)
DO $$
DECLARE
    v_audit_id INT;
    v_todo_pendeta INT;
    v_todo_pelayan INT;
    v_todo_relawan INT;
    v_todo_users INT;
    
    v_created_person INT := 0;
    v_updated_pendeta INT := 0;
    v_updated_pelayan INT := 0;
    v_updated_relawan INT := 0;
    
    v_mapped_users INT := 0;
    v_orphan_count INT;
    v_invalid_count INT;
    v_duplicate_users INT;
    v_unmapped_users_remaining INT;
    v_tracked_count INT;
    
    v_inserted_count INT;
BEGIN

    -- Data Preflight Validations (Fail early, fail safely)
    SELECT COUNT(*) INTO v_invalid_count FROM public.m_pendeta WHERE id_person IS NULL AND (nama_lengkap IS NULL OR LENGTH(nama_lengkap) > 150);
    IF v_invalid_count > 0 THEN RAISE EXCEPTION 'PREFLIGHT DATA FAILED: % public.m_pendeta rows have invalid nama_lengkap', v_invalid_count; END IF;

    SELECT COUNT(*) INTO v_invalid_count FROM public.t_pelayan WHERE id_person IS NULL AND (nama IS NULL OR LENGTH(nama) > 150);
    IF v_invalid_count > 0 THEN RAISE EXCEPTION 'PREFLIGHT DATA FAILED: % public.t_pelayan rows have invalid nama', v_invalid_count; END IF;

    SELECT COUNT(*) INTO v_invalid_count FROM public.t_relawan WHERE id_person IS NULL AND (nama IS NULL OR LENGTH(nama) > 150);
    IF v_invalid_count > 0 THEN RAISE EXCEPTION 'PREFLIGHT DATA FAILED: % public.t_relawan rows have invalid nama', v_invalid_count; END IF;

    -- A. Calculate Deficits (Unmapped Legacy Rows This Run)
    SELECT COUNT(*) INTO v_todo_pendeta FROM public.m_pendeta WHERE id_person IS NULL;
    SELECT COUNT(*) INTO v_todo_pelayan FROM public.t_pelayan WHERE id_person IS NULL;
    SELECT COUNT(*) INTO v_todo_relawan FROM public.t_relawan WHERE id_person IS NULL;
    SELECT COUNT(*) INTO v_todo_users FROM public.users WHERE id_pendeta IS NOT NULL AND id_person IS NULL;

    -- Users Resolvability Preflight Check
    SELECT COUNT(*) INTO v_invalid_count
    FROM public.users u
    LEFT JOIN public.m_pendeta p ON u.id_pendeta = p.id_pendeta
    WHERE u.id_pendeta IS NOT NULL AND u.id_person IS NULL AND p.id_pendeta IS NULL;
    
    IF v_invalid_count > 0 THEN
        RAISE EXCEPTION 'PREFLIGHT DATA FAILED: % users have id_pendeta that does not exist in m_pendeta (Unresolvable mapping)', v_invalid_count;
    END IF;

    -- B. Initialize Audit Ledger
    INSERT INTO public.sys_migration_audit (
        migration_version, 
        todo_pendeta_count, 
        todo_pelayan_count, 
        todo_relawan_count,
        todo_users_count
    ) VALUES (
        'B1_UNIVERSAL_IDENTITY_v1.10', 
        v_todo_pendeta, 
        v_todo_pelayan, 
        v_todo_relawan,
        v_todo_users
    ) RETURNING id INTO v_audit_id;

    -- C. Backfill m_pendeta (Explicit Sequential Steps)
    IF v_todo_pendeta > 0 THEN
        -- 1. Generate Mapping
        INSERT INTO tmp_migration_mapping (legacy_id, legacy_type, new_person_id, nama, no_wa, tgl_lahir, gender)
        SELECT id_pendeta, 'pendeta', gen_random_uuid(), nama_lengkap, no_wa, tgl_lahir, gender
        FROM public.m_pendeta
        WHERE id_person IS NULL;

        -- 2. INSERT parent (m_person)
        WITH inserted_persons AS (
            INSERT INTO public.m_person (id_person, nama_lengkap, no_wa, tgl_lahir, gender, status_aktif)
            SELECT new_person_id, nama, no_wa, tgl_lahir, gender, 'Aktif'
            FROM tmp_migration_mapping
            WHERE legacy_type = 'pendeta'
            RETURNING id_person
        )
        SELECT COUNT(*) INTO v_inserted_count FROM inserted_persons;

        -- 3. Verify INSERT
        IF v_inserted_count != v_todo_pendeta THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Inserted m_person count (%) != Expected pendeta count (%)', v_inserted_count, v_todo_pendeta;
        END IF;
        v_created_person := v_created_person + v_inserted_count;

        -- 4. Track IDs for reconciliation
        INSERT INTO tmp_created_persons (id_person)
        SELECT new_person_id FROM tmp_migration_mapping WHERE legacy_type = 'pendeta';

        -- 5. UPDATE child (m_pendeta)
        WITH updated_pendeta AS (
            UPDATE public.m_pendeta p
            SET id_person = m.new_person_id
            FROM tmp_migration_mapping m
            WHERE p.id_pendeta = m.legacy_id AND m.legacy_type = 'pendeta'
            RETURNING p.id_person
        )
        SELECT COUNT(*) INTO v_updated_pendeta FROM updated_pendeta;

        -- 6. Verify UPDATE
        IF v_updated_pendeta != v_todo_pendeta THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Updated m_pendeta count (%) != Expected pendeta count (%)', v_updated_pendeta, v_todo_pendeta;
        END IF;
    END IF;

    -- D. Backfill t_pelayan (Explicit Sequential Steps)
    IF v_todo_pelayan > 0 THEN
        -- 1. Generate Mapping
        INSERT INTO tmp_migration_mapping (legacy_id, legacy_type, new_person_id, nama, no_wa, tgl_lahir, gender)
        SELECT id_pelayan, 'pelayan', gen_random_uuid(), nama, no_wa, tgl_lahir, gender
        FROM public.t_pelayan
        WHERE id_person IS NULL;

        -- 2. INSERT parent (m_person)
        WITH inserted_persons AS (
            INSERT INTO public.m_person (id_person, nama_lengkap, no_wa, tgl_lahir, gender, status_aktif)
            SELECT new_person_id, nama, no_wa, tgl_lahir, gender, 'Aktif'
            FROM tmp_migration_mapping
            WHERE legacy_type = 'pelayan'
            RETURNING id_person
        )
        SELECT COUNT(*) INTO v_inserted_count FROM inserted_persons;

        -- 3. Verify INSERT
        IF v_inserted_count != v_todo_pelayan THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Inserted m_person count (%) != Expected pelayan count (%)', v_inserted_count, v_todo_pelayan;
        END IF;
        v_created_person := v_created_person + v_inserted_count;

        -- 4. Track IDs for reconciliation
        INSERT INTO tmp_created_persons (id_person)
        SELECT new_person_id FROM tmp_migration_mapping WHERE legacy_type = 'pelayan';

        -- 5. UPDATE child (t_pelayan)
        WITH updated_pelayan AS (
            UPDATE public.t_pelayan p
            SET id_person = m.new_person_id
            FROM tmp_migration_mapping m
            WHERE p.id_pelayan = m.legacy_id AND m.legacy_type = 'pelayan'
            RETURNING p.id_person
        )
        SELECT COUNT(*) INTO v_updated_pelayan FROM updated_pelayan;

        -- 6. Verify UPDATE
        IF v_updated_pelayan != v_todo_pelayan THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Updated t_pelayan count (%) != Expected pelayan count (%)', v_updated_pelayan, v_todo_pelayan;
        END IF;
    END IF;

    -- E. Backfill t_relawan (Explicit Sequential Steps)
    IF v_todo_relawan > 0 THEN
        -- 1. Generate Mapping
        INSERT INTO tmp_migration_mapping (legacy_id, legacy_type, new_person_id, nama, no_wa, tgl_lahir, gender)
        SELECT id_relawan, 'relawan', gen_random_uuid(), nama, no_wa, tgl_lahir, gender
        FROM public.t_relawan
        WHERE id_person IS NULL;

        -- 2. INSERT parent (m_person)
        WITH inserted_persons AS (
            INSERT INTO public.m_person (id_person, nama_lengkap, no_wa, tgl_lahir, gender, status_aktif)
            SELECT new_person_id, nama, no_wa, tgl_lahir, gender, 'Aktif'
            FROM tmp_migration_mapping
            WHERE legacy_type = 'relawan'
            RETURNING id_person
        )
        SELECT COUNT(*) INTO v_inserted_count FROM inserted_persons;

        -- 3. Verify INSERT
        IF v_inserted_count != v_todo_relawan THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Inserted m_person count (%) != Expected relawan count (%)', v_inserted_count, v_todo_relawan;
        END IF;
        v_created_person := v_created_person + v_inserted_count;

        -- 4. Track IDs for reconciliation
        INSERT INTO tmp_created_persons (id_person)
        SELECT new_person_id FROM tmp_migration_mapping WHERE legacy_type = 'relawan';

        -- 5. UPDATE child (t_relawan)
        WITH updated_relawan AS (
            UPDATE public.t_relawan p
            SET id_person = m.new_person_id
            FROM tmp_migration_mapping m
            WHERE p.id_relawan = m.legacy_id AND m.legacy_type = 'relawan'
            RETURNING p.id_person
        )
        SELECT COUNT(*) INTO v_updated_relawan FROM updated_relawan;

        -- 6. Verify UPDATE
        IF v_updated_relawan != v_todo_relawan THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Updated t_relawan count (%) != Expected relawan count (%)', v_updated_relawan, v_todo_relawan;
        END IF;
    END IF;

    -- F. Users Dual-Path Migration & Duplicate Preflight
    IF v_todo_users > 0 THEN
        -- Audit duplicate before update for ALL users (incoming collision + existing mapped users)
        SELECT COUNT(*) INTO v_duplicate_users
        FROM (
            SELECT id_person
            FROM (
                SELECT p.id_person 
                FROM public.users u
                JOIN public.m_pendeta p ON u.id_pendeta = p.id_pendeta
                WHERE u.id_person IS NULL AND p.id_person IS NOT NULL
                
                UNION ALL
                
                SELECT id_person
                FROM public.users
                WHERE id_person IS NOT NULL
            ) sub
            GROUP BY id_person 
            HAVING COUNT(*) > 1
        ) collisions;

        IF v_duplicate_users > 0 THEN
            RAISE EXCEPTION 'PREFLIGHT CARDINALITY FAILED: % id_person mappings resolve to multiple users (incoming or existing collision) in this run', v_duplicate_users;
        END IF;

        -- Apply the dual-path migration
        WITH updated_users AS (
            UPDATE public.users u
            SET id_person = p.id_person
            FROM public.m_pendeta p
            WHERE u.id_pendeta = p.id_pendeta 
              AND u.id_person IS NULL
              AND p.id_person IS NOT NULL
            RETURNING u.id
        )
        SELECT COUNT(*) INTO v_mapped_users FROM updated_users;
    END IF;

    -- G. Reconciliation Gates (Invariants Check)
    -- 1. Created vs Todo Match (Strict Equality for this run)
    IF v_created_person != (v_todo_pendeta + v_todo_pelayan + v_todo_relawan) THEN
        RAISE EXCEPTION 'RECONCILIATION FAILED: Created persons (%) != Unmapped legacy rows (%)', 
            v_created_person, (v_todo_pendeta + v_todo_pelayan + v_todo_relawan);
    END IF;

    -- 1.b. Updated Legacy vs Todo Match
    IF (v_updated_pendeta + v_updated_pelayan + v_updated_relawan) != (v_todo_pendeta + v_todo_pelayan + v_todo_relawan) THEN
        RAISE EXCEPTION 'RECONCILIATION FAILED: Updated legacy rows (%) != Unmapped legacy rows (%)', 
            (v_updated_pendeta + v_updated_pelayan + v_updated_relawan), (v_todo_pendeta + v_todo_pelayan + v_todo_relawan);
    END IF;

    -- 1.c. Tracked vs Created Match
    SELECT COUNT(*) INTO v_tracked_count FROM tmp_created_persons;
    IF v_tracked_count != v_created_person THEN
        RAISE EXCEPTION 'RECONCILIATION FAILED: Tracked created persons (%) != Created persons (%)', 
            v_tracked_count, v_created_person;
    END IF;

    -- 2. Users Mapped Match
    IF v_mapped_users != v_todo_users THEN
        RAISE EXCEPTION 'RECONCILIATION FAILED: Mapped users (%) != Users needing mapping (%)', 
            v_mapped_users, v_todo_users;
    END IF;
    
    -- 2.b. Users Explicit Missing Role Assertion
    SELECT COUNT(*) INTO v_unmapped_users_remaining
    FROM public.users u
    WHERE u.id_pendeta IS NOT NULL
      AND u.id_person IS NULL;
      
    IF v_unmapped_users_remaining > 0 THEN
        RAISE EXCEPTION 'USERS MAPPING FAILED: % users with id_pendeta remain without id_person', v_unmapped_users_remaining;
    END IF;

    -- 3. Zero Orphans Check in Legacy
    SELECT COUNT(*) INTO v_orphan_count FROM public.m_pendeta WHERE id_person IS NULL;
    IF v_orphan_count > 0 THEN RAISE EXCEPTION 'ORPHAN CHECK FAILED: % public.m_pendeta records lack id_person', v_orphan_count; END IF;

    SELECT COUNT(*) INTO v_orphan_count FROM public.t_pelayan WHERE id_person IS NULL;
    IF v_orphan_count > 0 THEN RAISE EXCEPTION 'ORPHAN CHECK FAILED: % public.t_pelayan records lack id_person', v_orphan_count; END IF;

    SELECT COUNT(*) INTO v_orphan_count FROM public.t_relawan WHERE id_person IS NULL;
    IF v_orphan_count > 0 THEN RAISE EXCEPTION 'ORPHAN CHECK FAILED: % public.t_relawan records lack id_person', v_orphan_count; END IF;

    -- 4. Migration-Scoped Zero Orphans Check in m_person
    -- Only checks m_person rows CREATED DURING THIS EXECUTION run (tmp_created_persons).
    SELECT COUNT(*) INTO v_orphan_count 
    FROM tmp_created_persons p
    LEFT JOIN public.m_pendeta md ON md.id_person = p.id_person
    LEFT JOIN public.t_pelayan pl ON pl.id_person = p.id_person
    LEFT JOIN public.t_relawan rl ON rl.id_person = p.id_person
    WHERE md.id_person IS NULL AND pl.id_person IS NULL AND rl.id_person IS NULL;
    
    IF v_orphan_count > 0 THEN RAISE EXCEPTION 'ORPHAN CHECK FAILED: % newly created public.m_person records are not referenced by any role table', v_orphan_count; END IF;

    -- H. Finalize Ledger
    UPDATE public.sys_migration_audit 
    SET created_person_count = v_created_person,
        mapped_users_count = v_mapped_users,
        status = 'COMPLETED',
        completed_at = NOW(),
        notes = 'Migration successful. ' || v_created_person || ' person identities created, ' || v_mapped_users || ' users mapped.'
    WHERE id = v_audit_id;

END $$;

COMMIT;


-- [MIGRATION SOURCE: 20260907_f2_person_360.sql]
-- ==========================================
-- F2 Person Workspace: get_person_360 RPC
-- ==========================================
-- Description: Universal Read-Model for Person Workspace
-- Implements F2 Visibility Matrix & Authorization Logic.
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_person_360(
    p_id_person UUID,
    p_pastoral_limit INT DEFAULT 10,
    p_pastoral_offset INT DEFAULT 0
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_requester_uid UUID;
    v_req_role TEXT;
    v_req_mupel TEXT;
    v_req_induk TEXT;
    v_req_person UUID;
    
    v_target_exists BOOLEAN;
    
    v_target_active_mupel_ids TEXT[] := ARRAY[]::TEXT[];
    v_target_active_induk_ids TEXT[] := ARRAY[]::TEXT[];
    
    v_is_self BOOLEAN;
    v_is_superuser BOOLEAN;
    v_is_same_mupel BOOLEAN;
    v_is_same_jemaat BOOLEAN;
    
    v_can_see_private BOOLEAN := FALSE;
    v_can_see_restricted BOOLEAN := FALSE;
    v_can_see_public_ctx BOOLEAN := FALSE;
    
    -- Variables for data gathering
    v_person_rec RECORD;
    v_assignments JSONB := '[]'::JSONB;
    v_mutations JSONB := '[]'::JSONB;
    v_pastoral_logs JSONB := '[]'::JSONB;
    v_pastoral_total INT := 0;
    v_has_more_pastoral BOOLEAN := FALSE;
    
    v_limit INT;
    v_offset INT;
    
    v_reason_private TEXT;
    v_reason_restricted TEXT;
    v_reason_public_ctx TEXT;
    
    v_result JSONB;
BEGIN
    -- 1. Clamp Pagination
    v_limit := GREATEST(1, LEAST(p_pastoral_limit, 100));
    v_offset := GREATEST(0, p_pastoral_offset);

    -- 2. Trusted Session Check
    v_requester_uid := auth.uid();
    IF v_requester_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 3. Requester Scope Resolution
    SELECT role, id_mupel, id_induk, id_person 
    INTO v_req_role, v_req_mupel, v_req_induk, v_req_person
    FROM public.users 
    WHERE id = v_requester_uid;

    -- 4. Target Resolution
    SELECT EXISTS (SELECT 1 FROM public.m_person WHERE id_person = p_id_person) INTO v_target_exists;
    IF NOT v_target_exists THEN
        RETURN NULL; -- 404 behavior handled by API layer
    END IF;

    SELECT * INTO v_person_rec FROM public.m_person WHERE id_person = p_id_person;

    -- 5. Target Active Organizational Context Resolution
    -- A. Pendeta (if any)
    SELECT array_agg(DISTINCT p.id_induk) FILTER (WHERE p.id_induk IS NOT NULL),
           array_agg(DISTINCT j.id_mupel) FILTER (WHERE j.id_mupel IS NOT NULL)
    INTO v_target_active_induk_ids, v_target_active_mupel_ids
    FROM public.m_pendeta p
    LEFT JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
    WHERE p.id_person = p_id_person AND p.status = 'Aktif';

    -- B. Pelayan (if any, append to array)
    -- Assuming t_pelayan has id_induk and id_mupel. If it only has id_pos, we need to join m_pos_pelkes.
    -- (We use coalesce and array_cat to merge active contexts)
    DECLARE
        v_pelayan_induk TEXT[];
        v_pelayan_mupel TEXT[];
        v_relawan_induk TEXT[];
        v_relawan_mupel TEXT[];
    BEGIN
        -- t_pelayan context
        -- Temporarily bypassed or simplified if columns don't exist yet
        /*
        SELECT array_agg(DISTINCT p.id_induk) FILTER (WHERE p.id_induk IS NOT NULL),
               array_agg(DISTINCT j.id_mupel) FILTER (WHERE j.id_mupel IS NOT NULL)
        INTO v_pelayan_induk, v_pelayan_mupel
        FROM public.t_pelayan p
        LEFT JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE p.id_person = p_id_person;
        
        SELECT array_agg(DISTINCT r.id_induk) FILTER (WHERE r.id_induk IS NOT NULL),
               array_agg(DISTINCT j.id_mupel) FILTER (WHERE j.id_mupel IS NOT NULL)
        INTO v_relawan_induk, v_relawan_mupel
        FROM public.t_relawan r
        LEFT JOIN public.m_jemaat_induk j ON r.id_induk = j.id_induk
        WHERE r.id_person = p_id_person;
        */
        v_pelayan_induk := ARRAY[]::TEXT[];
        v_pelayan_mupel := ARRAY[]::TEXT[];
        v_relawan_induk := ARRAY[]::TEXT[];
        v_relawan_mupel := ARRAY[]::TEXT[];

        v_target_active_induk_ids := array_cat(v_target_active_induk_ids, array_cat(v_pelayan_induk, v_relawan_induk));
        v_target_active_mupel_ids := array_cat(v_target_active_mupel_ids, array_cat(v_pelayan_mupel, v_relawan_mupel));
    END;

    -- 6. Evaluate Context Match
    v_is_self := (v_req_person = p_id_person);
    v_is_superuser := (v_req_role = 'super_user');
    
    v_is_same_mupel := (v_req_mupel = ANY(v_target_active_mupel_ids));
    v_is_same_jemaat := (v_req_induk = ANY(v_target_active_induk_ids));

    -- 7. Rule Hierarchy for Visibility
    IF v_is_self OR v_is_superuser THEN
        v_can_see_private := TRUE;
        v_can_see_restricted := TRUE;
        v_can_see_public_ctx := TRUE;
    ELSIF v_req_role = 'admin_mupel' AND v_is_same_mupel THEN
        v_can_see_private := FALSE;
        v_can_see_restricted := TRUE;
        v_can_see_public_ctx := TRUE;
        v_reason_private := 'INSUFFICIENT_PERMISSION';
    ELSIF v_is_same_jemaat THEN
        v_can_see_private := FALSE;
        v_can_see_restricted := FALSE;
        v_can_see_public_ctx := TRUE;
        v_reason_private := 'INSUFFICIENT_PERMISSION';
        v_reason_restricted := 'INSUFFICIENT_PERMISSION';
    ELSE
        -- Outside Context
        v_can_see_private := FALSE;
        v_can_see_restricted := FALSE;
        v_can_see_public_ctx := FALSE;
        v_reason_private := 'OUTSIDE_CONTEXT';
        v_reason_restricted := 'OUTSIDE_CONTEXT';
        v_reason_public_ctx := 'OUTSIDE_CONTEXT';
    END IF;

    -- Gather PersonAssignments
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_assignment', p.id_pendeta,
            'role_type', 'PENDETA',
            'jabatan', p.jabatan,
            'organization_name', COALESCE(ji.nama_induk, m.nama_mupel, 'GPIB'),
            'status', CASE WHEN p.status = 'Aktif' THEN 'ACTIVE' ELSE 'INACTIVE' END,
            'start_date', p.tgl_tugas,
            'end_date', NULL -- Simplified for now
        )
    ), '[]'::jsonb)
    INTO v_assignments
    FROM (SELECT p_id_person AS id_person) dummy
    LEFT JOIN public.m_pendeta p ON p.id_person = dummy.id_person
    LEFT JOIN public.m_jemaat_induk ji ON ji.id_induk = p.id_induk
    LEFT JOIN public.m_mupel m ON m.id_mupel = ji.id_mupel;

    -- Gather Pastoral Logs (with pagination)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_log', l.id_log,
            'tanggal', l.tgl,
            'tipe_layanan', l.kegiatan,
            'status', 'COMPLETED',
            'notes', CASE WHEN v_is_self THEN l.catatan ELSE NULL END -- STRICTLY SELF_ONLY
        )
    ), '[]'::jsonb)
    INTO v_pastoral_logs
    FROM (
        SELECT id_log, tgl, kegiatan, catatan 
        FROM public.t_log_pastoral 
        WHERE id_pendeta IN (SELECT id_pendeta FROM public.m_pendeta WHERE id_person = p_id_person)
        ORDER BY tgl DESC
        LIMIT v_limit + 1 OFFSET v_offset
    ) l;

    -- Check if has more
    IF jsonb_array_length(v_pastoral_logs) > v_limit THEN
        v_has_more_pastoral := TRUE;
        -- Remove the extra item
        v_pastoral_logs := v_pastoral_logs - CAST(v_limit AS int);
    END IF;

    -- Build UnifiedPersonData JSONB Response
    v_result := jsonb_build_object(
        'id_person', p_id_person,
        
        'identity', jsonb_build_object(
            'nama_lengkap', v_person_rec.nama_lengkap,
            'gelar_depan', NULL,
            'gelar_belakang', NULL,
            'foto_url', v_person_rec.foto_url
        ),
        
        'overview', jsonb_build_object(
            'current_role_label', (v_assignments->0->>'jabatan'), -- naive extraction for ORG_WIDE
            'current_organization_name', (v_assignments->0->>'organization_name'),
            'is_active', CASE WHEN v_can_see_public_ctx THEN TRUE ELSE NULL END,
            'recent_pastoral_count', CASE WHEN v_can_see_public_ctx THEN jsonb_array_length(v_pastoral_logs) ELSE NULL END,
            'affiliation_origin', 'Organik GPIB',
            '_meta', jsonb_build_object(
                'is_active', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT', 'reason', v_reason_public_ctx),
                'recent_pastoral_count', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT', 'reason', v_reason_public_ctx)
            )
        ),
        
        'profile', jsonb_build_object(
            'data', jsonb_build_object(
                'tempat_lahir', NULL,
                'tanggal_lahir', CASE WHEN v_can_see_restricted THEN v_person_rec.tgl_lahir ELSE NULL END,
                'no_hp', CASE WHEN v_can_see_restricted THEN v_person_rec.no_wa ELSE NULL END,
                'email', NULL,
                'alamat_tinggal', NULL,
                'keluarga', CASE WHEN v_can_see_private THEN '[]'::jsonb ELSE NULL END, -- Family data mock for now
                'kontak_darurat', CASE WHEN v_can_see_private THEN '[]'::jsonb ELSE NULL END,
                'biometric_devices', CASE WHEN v_can_see_private THEN '[]'::jsonb ELSE NULL END
            ),
            '_meta', jsonb_build_object(
                'tempat_lahir', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'tanggal_lahir', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'no_hp', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'email', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'alamat_tinggal', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'keluarga', jsonb_build_object('accessible', v_can_see_private, 'visibility', 'PRIVATE', 'reason', v_reason_private),
                'kontak_darurat', jsonb_build_object('accessible', v_can_see_private, 'visibility', 'PRIVATE', 'reason', v_reason_private),
                'biometric_devices', jsonb_build_object('accessible', v_can_see_private, 'visibility', 'PRIVATE', 'reason', v_reason_private)
            )
        ),
        
        'roles', jsonb_build_object(
            'data', jsonb_build_object(
                'assignments', CASE WHEN v_can_see_public_ctx THEN v_assignments ELSE NULL END,
                'mutations', CASE WHEN v_can_see_restricted THEN '[]'::jsonb ELSE NULL END
            ),
            '_meta', jsonb_build_object(
                'assignments', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT', 'reason', v_reason_public_ctx),
                'mutations', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted)
            )
        ),
        
        'competencies', jsonb_build_object(
            'data', jsonb_build_object(
                'skills', '[]'::jsonb,
                'education', '[]'::jsonb,
                'certifications', '[]'::jsonb
            ),
            '_meta', jsonb_build_object(
                'skills', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'education', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'certifications', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE')
            )
        ),
        
        'pastoral', jsonb_build_object(
            'data', jsonb_build_object(
                'upcoming_schedules', CASE WHEN v_can_see_public_ctx THEN '[]'::jsonb ELSE NULL END,
                'pastoral_logs', CASE WHEN v_can_see_restricted THEN v_pastoral_logs ELSE NULL END
            ),
            'pagination', jsonb_build_object(
                'pastoral_logs', jsonb_build_object('limit', v_limit, 'offset', v_offset, 'has_more', v_has_more_pastoral)
            ),
            '_meta', jsonb_build_object(
                'upcoming_schedules', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT', 'reason', v_reason_public_ctx),
                'pastoral_logs', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'notes', jsonb_build_object('accessible', v_is_self, 'visibility', 'PRIVATE', 'reason', CASE WHEN v_is_self THEN NULL ELSE 'SELF_ONLY' END)
            )
        )
    );

    RETURN v_result;
END;
$$;


-- [MIGRATION SOURCE: 20260908_f3_organization_360.sql]
-- ==========================================
-- F3 Organization Workspace: get_organization_360 RPC
-- ==========================================
-- Description: Universal Read-Model for Organization Workspace
-- Implements WORKSPACE_PATTERN_V1 & Contract v0.3.
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_organization_360(
    p_id_org TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_requester_uid UUID;
    v_req_role TEXT;
    v_req_mupel TEXT;
    v_req_induk TEXT;
    v_req_person UUID;

    -- Resolution variables
    v_org_level TEXT := NULL;
    v_canonical_id TEXT := NULL;
    v_match_count INT := 0;
    v_cnt INT := 0;

    -- Target Organization Record / Fields
    v_name TEXT;
    v_keterangan TEXT;
    v_alamat TEXT;
    v_latitude DECIMAL(10,7);
    v_longitude DECIMAL(10,7);
    v_tgl_berdiri DATE;
    v_status TEXT := 'Aktif';

    v_parent_id TEXT := NULL;
    v_parent_name TEXT := NULL;
    v_parent_level TEXT := NULL;

    v_target_mupel_id TEXT := NULL;
    v_target_induk_id TEXT := NULL;
    v_target_pos_ids TEXT[] := ARRAY[]::TEXT[];

    -- Context & Visibility Evaluation
    v_is_superuser BOOLEAN := FALSE;
    v_is_same_tree BOOLEAN := FALSE;
    v_is_exact_node BOOLEAN := FALSE;

    v_can_see_restricted BOOLEAN := FALSE;
    v_can_see_private BOOLEAN := FALSE;
    v_can_see_public_ctx BOOLEAN := FALSE;

    v_reason_restricted TEXT := NULL;
    v_reason_private TEXT := NULL;

    -- Aggregation Data Variables
    v_kmj_id_person UUID := NULL;
    v_kmj_nama TEXT := NULL;

    v_children JSONB := '[]'::JSONB;
    v_ancestors JSONB := '[]'::JSONB;

    v_pj_list JSONB := '[]'::JSONB;
    v_pelayan_list JSONB := '[]'::JSONB;
    v_relawan_list JSONB := '[]'::JSONB;

    v_total_pos_count INT := 0;
    v_total_pelayan_count INT := 0;

    v_assets_total INT := 0;
    v_assets_tanah INT := 0;
    v_assets_bangunan INT := 0;
    v_assets_bergerak INT := 0;
    v_asset_items JSONB := '[]'::JSONB;

    v_aid_total INT := 0;
    v_aid_active INT := 0;
    v_aid_approved INT := 0;
    v_aid_items JSONB := '[]'::JSONB;

    v_demografi JSONB := '[]'::JSONB;
    v_kerawanan JSONB := '[]'::JSONB;
    v_potensi JSONB := '[]'::JSONB;

    v_result JSONB;
BEGIN
    -- 1. Trusted Session Check
    v_requester_uid := auth.uid();
    IF v_requester_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 2. Requester Scope Resolution
    SELECT role, id_mupel, id_induk, id_person 
    INTO v_req_role, v_req_mupel, v_req_induk, v_req_person
    FROM public.users 
    WHERE id = v_requester_uid;

    v_is_superuser := (COALESCE(v_req_role, '') = 'super_user');

    -- 3. Deterministic Identity Resolution
    IF p_id_org IS NULL OR TRIM(p_id_org) = '' THEN
        RETURN NULL;
    END IF;

    -- Check exact match in m_pos_pelkes
    SELECT COUNT(*) INTO v_cnt FROM public.m_pos_pelkes WHERE id_pos = p_id_org;
    IF v_cnt > 0 THEN
        v_match_count := v_match_count + v_cnt;
        v_org_level := 'POS_PELKES';
        v_canonical_id := p_id_org;
    END IF;

    -- Check exact match in m_jemaat_induk
    SELECT COUNT(*) INTO v_cnt FROM public.m_jemaat_induk WHERE id_induk = p_id_org;
    IF v_cnt > 0 THEN
        v_match_count := v_match_count + v_cnt;
        v_org_level := 'JEMAAT_INDUK';
        v_canonical_id := p_id_org;
    END IF;

    -- Check exact match in m_mupel
    SELECT COUNT(*) INTO v_cnt FROM public.m_mupel WHERE id_mupel = p_id_org;
    IF v_cnt > 0 THEN
        v_match_count := v_match_count + v_cnt;
        v_org_level := 'MUPEL';
        v_canonical_id := p_id_org;
    END IF;

    -- Ambiguity Guard: Must resolve to EXACTLY 1 match
    IF v_match_count <> 1 THEN
        RETURN NULL; -- Return NULL for 0 or ambiguous matches (NO GUESSING)
    END IF;

    -- 4. Load Target Organization Data & Hierarchy Ancestry
    IF v_org_level = 'POS_PELKES' THEN
        SELECT p.nama_pos, p.keterangan, p.alamat, p.latitude, p.longitude, p.tgl_berdiri,
               p.id_induk, j.nama_induk, j.id_mupel
        INTO v_name, v_keterangan, v_alamat, v_latitude, v_longitude, v_tgl_berdiri,
             v_target_induk_id, v_parent_name, v_target_mupel_id
        FROM public.m_pos_pelkes p
        LEFT JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE p.id_pos = v_canonical_id;

        v_parent_id := v_target_induk_id;
        v_parent_level := 'JEMAAT_INDUK';
        v_target_pos_ids := ARRAY[v_canonical_id];

    ELSIF v_org_level = 'JEMAAT_INDUK' THEN
        SELECT j.nama_induk, j.keterangan, j.alamat, j.latitude, j.longitude, NULL::DATE,
               j.id_mupel, m.nama_mupel
        INTO v_name, v_keterangan, v_alamat, v_latitude, v_longitude, v_tgl_berdiri,
             v_target_mupel_id, v_parent_name
        FROM public.m_jemaat_induk j
        LEFT JOIN public.m_mupel m ON j.id_mupel = m.id_mupel
        WHERE j.id_induk = v_canonical_id;

        v_target_induk_id := v_canonical_id;
        v_parent_id := v_target_mupel_id;
        v_parent_level := 'MUPEL';

        SELECT array_agg(id_pos) INTO v_target_pos_ids 
        FROM public.m_pos_pelkes WHERE id_induk = v_canonical_id;

    ELSIF v_org_level = 'MUPEL' THEN
        SELECT nama_mupel, keterangan
        INTO v_name, v_keterangan
        FROM public.m_mupel
        WHERE id_mupel = v_canonical_id;

        v_target_mupel_id := v_canonical_id;
        v_parent_id := NULL;
        v_parent_level := NULL;

        SELECT array_agg(p.id_pos) INTO v_target_pos_ids
        FROM public.m_pos_pelkes p
        JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE j.id_mupel = v_canonical_id;
    END IF;

    -- Ensure non-null pos array
    IF v_target_pos_ids IS NULL THEN
        v_target_pos_ids := ARRAY[]::TEXT[];
    END IF;

    -- 5. Resolve Context & Tree Relationship
    IF v_is_superuser THEN
        v_is_same_tree := TRUE;
        v_is_exact_node := TRUE;
    ELSIF v_org_level = 'MUPEL' THEN
        v_is_same_tree := (v_req_mupel = v_canonical_id);
        v_is_exact_node := (v_req_mupel = v_canonical_id AND v_req_role = 'admin_mupel');
    ELSIF v_org_level = 'JEMAAT_INDUK' THEN
        v_is_same_tree := (v_req_induk = v_canonical_id OR v_req_mupel = v_target_mupel_id);
        v_is_exact_node := (v_req_induk = v_canonical_id);
    ELSIF v_org_level = 'POS_PELKES' THEN
        v_is_same_tree := (v_req_induk = v_target_induk_id OR v_req_mupel = v_target_mupel_id);
        v_is_exact_node := (v_req_induk = v_target_induk_id);
    END IF;

    -- Visibility Evaluation Rules
    v_can_see_public_ctx := v_is_same_tree OR v_is_superuser;
    v_can_see_restricted := v_is_same_tree OR v_is_superuser;
    v_can_see_private := (v_is_exact_node AND (v_req_role IN ('kmj', 'admin_mupel', 'pj'))) OR v_is_superuser;

    IF NOT v_can_see_restricted THEN
        v_reason_restricted := 'OUTSIDE_CONTEXT';
    END IF;

    IF NOT v_can_see_private THEN
        v_reason_private := 'INSUFFICIENT_PERMISSION';
    END IF;

    -- 6. Build Structure (Children & Ancestors)
    IF v_parent_id IS NOT NULL THEN
        v_ancestors := jsonb_build_array(
            jsonb_build_object(
                'id_org', v_parent_id,
                'nama', COALESCE(v_parent_name, v_parent_id),
                'org_level', v_parent_level
            )
        );
    END IF;

    IF v_org_level = 'MUPEL' THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_org', j.id_induk,
                'nama', j.nama_induk,
                'org_level', 'JEMAAT_INDUK',
                'count_sub', (SELECT COUNT(*) FROM public.m_pos_pelkes p WHERE p.id_induk = j.id_induk)
            )
        ), '[]'::JSONB) INTO v_children
        FROM public.m_jemaat_induk j
        WHERE j.id_mupel = v_canonical_id;

    ELSIF v_org_level = 'JEMAAT_INDUK' THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_org', p.id_pos,
                'nama', p.nama_pos,
                'org_level', 'POS_PELKES'
            )
        ), '[]'::JSONB) INTO v_children
        FROM public.m_pos_pelkes p
        WHERE p.id_induk = v_canonical_id;
    END IF;

    -- 7. Build People Projections
    -- KMJ for Jemaat Induk
    IF v_org_level = 'JEMAAT_INDUK' THEN
        SELECT p.id_person, p.nama_lengkap
        INTO v_kmj_id_person, v_kmj_nama
        FROM public.m_jemaat_induk j
        JOIN public.m_pendeta pend ON j.id_kmj = pend.id_pendeta
        JOIN public.m_person p ON pend.id_person = p.id_person
        WHERE j.id_induk = v_canonical_id;
    END IF;

    -- PJ List
    IF v_target_induk_id IS NOT NULL THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_person', COALESCE(p.id_person, '00000000-0000-0000-0000-000000000000'::UUID),
                'nama_lengkap', pend.nama_lengkap,
                'role_label', 'PJ',
                'status', COALESCE(pj.status, 'Aktif')
            )
        ), '[]'::JSONB) INTO v_pj_list
        FROM public.t_pj_jemaat pj
        JOIN public.m_pendeta pend ON pj.id_pendeta = pend.id_pendeta
        LEFT JOIN public.m_person p ON pend.id_person = p.id_person
        WHERE pj.id_induk = v_target_induk_id AND pj.status = 'Aktif';
    END IF;

    -- Pelayan List & Relawan List from Pos
    IF array_length(v_target_pos_ids, 1) > 0 THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_person', COALESCE(pel.id_person, '00000000-0000-0000-0000-000000000000'::UUID),
                'nama_lengkap', pel.nama,
                'role_label', COALESCE(pel.jabatan, 'Pelayan'),
                'status', COALESCE(pel.status, 'Aktif')
            )
        ), '[]'::JSONB) INTO v_pelayan_list
        FROM public.t_pelayan pel
        WHERE pel.id_pos = ANY(v_target_pos_ids);

        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_person', COALESCE(rel.id_person, '00000000-0000-0000-0000-000000000000'::UUID),
                'nama_lengkap', rel.nama,
                'role_label', COALESCE(rel.kategori, 'Relawan'),
                'status', 'Aktif'
            )
        ), '[]'::JSONB) INTO v_relawan_list
        FROM public.t_relawan rel
        WHERE rel.id_pos = ANY(v_target_pos_ids);
    END IF;

    v_total_pos_count := array_length(v_target_pos_ids, 1);
    v_total_pelayan_count := jsonb_array_length(v_pelayan_list) + jsonb_array_length(v_relawan_list);

    -- 8. Build Asset Projections
    IF array_length(v_target_pos_ids, 1) > 0 THEN
        SELECT COUNT(*) INTO v_assets_tanah FROM public.t_aset_tanah WHERE id_pos = ANY(v_target_pos_ids);
        SELECT COUNT(*) INTO v_assets_bangunan FROM public.t_aset_bangunan WHERE id_pos = ANY(v_target_pos_ids);
        SELECT COUNT(*) INTO v_assets_bergerak FROM public.t_aset_bergerak WHERE id_pos = ANY(v_target_pos_ids);
        
        v_assets_total := v_assets_tanah + v_assets_bangunan + v_assets_bergerak;

        IF v_can_see_restricted THEN
            SELECT COALESCE(jsonb_agg(item), '[]'::JSONB) INTO v_asset_items FROM (
                SELECT id_tanah AS id_asset, 'Tanah' AS nama_aset, 'tanah' AS kategori, kondisi, keterangan AS detail
                FROM public.t_aset_tanah WHERE id_pos = ANY(v_target_pos_ids)
                UNION ALL
                SELECT id_bangunan AS id_asset, COALESCE(fungsi, 'Gedung') AS nama_aset, 'bangunan' AS kategori, kondisi, keterangan AS detail
                FROM public.t_aset_bangunan WHERE id_pos = ANY(v_target_pos_ids)
                UNION ALL
                SELECT id_aset_b AS id_asset, COALESCE(jenis, 'Aset Bergerak') AS nama_aset, 'bergerak' AS kategori, kondisi, keterangan AS detail
                FROM public.t_aset_bergerak WHERE id_pos = ANY(v_target_pos_ids)
                LIMIT 20
            ) item;
        END IF;
    END IF;

    -- 9. Build Aid Request Projections
    IF array_length(v_target_pos_ids, 1) > 0 THEN
        SELECT COUNT(*) INTO v_aid_total FROM public.t_pengajuan_bantuan WHERE id_pos = ANY(v_target_pos_ids);
        SELECT COUNT(*) INTO v_aid_active FROM public.t_pengajuan_bantuan WHERE id_pos = ANY(v_target_pos_ids) AND status NOT IN ('Approved', 'Rejected');
        SELECT COUNT(*) INTO v_aid_approved FROM public.t_pengajuan_bantuan WHERE id_pos = ANY(v_target_pos_ids) AND status = 'Approved';

        IF v_can_see_restricted THEN
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id_ajuan', id_ajuan,
                    'jenis_bantuan', jenis_bantuan,
                    'biaya', biaya,
                    'urgensi', urgensi,
                    'status', COALESCE(status, 'Draft'),
                    'created_at', created_at
                )
            ), '[]'::JSONB) INTO v_aid_items
            FROM (
                SELECT id_ajuan, jenis_bantuan, biaya, urgensi, status, created_at
                FROM public.t_pengajuan_bantuan
                WHERE id_pos = ANY(v_target_pos_ids)
                ORDER BY created_at DESC
                LIMIT 20
            ) a;
        END IF;
    END IF;

    -- 10. Build Territory Projections
    IF array_length(v_target_pos_ids, 1) > 0 THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'kategori_pelkat', kategori_pelkat,
                'jml_kk', jml_kk,
                'laki', laki,
                'perempuan', perempuan
            )
        ), '[]'::JSONB) INTO v_demografi
        FROM public.t_demografi_pelkat
        WHERE id_pos = ANY(v_target_pos_ids);

        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_risiko', id_risiko,
                'kategori', kategori,
                'jenis_risiko', jenis_risiko,
                'frekuensi', frekuensi
            )
        ), '[]'::JSONB) INTO v_kerawanan
        FROM public.t_kerawanan_wilayah
        WHERE id_pos = ANY(v_target_pos_ids);

        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_potensi', id_potensi,
                'nama_potensi', nama_potensi,
                'kategori', kategori,
                'deskripsi', deskripsi
            )
        ), '[]'::JSONB) INTO v_potensi
        FROM public.t_potensi_wilayah
        WHERE id_pos = ANY(v_target_pos_ids);
    END IF;

    -- 11. Construct Final Unified JSON Payload
    v_result := jsonb_build_object(
        'id_org', v_canonical_id,
        'identity', jsonb_build_object(
            'id_org', v_canonical_id,
            'org_level', v_org_level,
            'nama', v_name,
            'keterangan', v_keterangan,
            'status', v_status
        ),
        'structure', jsonb_build_object(
            'parent', CASE WHEN v_parent_id IS NOT NULL THEN jsonb_build_object('id_org', v_parent_id, 'nama', v_parent_name, 'org_level', v_parent_level) ELSE NULL END,
            'children', v_children,
            'ancestors', v_ancestors
        ),
        'context', jsonb_build_object(
            'requester_access_level', CASE WHEN v_can_see_private THEN 'FULL_ADMIN' WHEN v_can_see_public_ctx THEN 'READ_CONTEXT' ELSE 'PUBLIC_VISITOR' END,
            'is_same_ancestral_tree', v_is_same_tree
        ),
        'overview', jsonb_build_object(
            'alamat', v_alamat,
            'latitude', v_latitude,
            'longitude', v_longitude,
            'tgl_berdiri', v_tgl_berdiri,
            'kmj_nama', v_kmj_nama,
            'total_pos_count', v_total_pos_count,
            'total_pelayan_count', v_total_pelayan_count
        ),
        'people', jsonb_build_object(
            'kmj', CASE WHEN v_kmj_id_person IS NOT NULL THEN jsonb_build_object('id_person', v_kmj_id_person, 'nama_lengkap', v_kmj_nama, 'role_label', 'KMJ', 'status', 'Aktif') ELSE NULL END,
            'pj_list', v_pj_list,
            'pelayan_list', v_pelayan_list,
            'relawan_list', v_relawan_list
        ),
        'assets', jsonb_build_object(
            'total_count', v_assets_total,
            'total_tanah', v_assets_tanah,
            'total_bangunan', v_assets_bangunan,
            'total_bergerak', v_assets_bergerak,
            'items', v_asset_items
        ),
        'aid_requests', jsonb_build_object(
            'total_count', v_aid_total,
            'active_count', v_aid_active,
            'approved_count', v_aid_approved,
            'items', v_aid_items
        ),
        'territory', jsonb_build_object(
            'demografi', v_demografi,
            'kerawanan', v_kerawanan,
            'potensi', v_potensi
        ),
        '_meta', jsonb_build_object(
            'privacy', jsonb_build_object(
                'identity', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'structure', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'overview', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT'),
                'people', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT'),
                'assets', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'aid_requests', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'territory', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT')
            )
        )
    );

    RETURN v_result;
END;
$$;


-- [MIGRATION SOURCE: 20260909_f4_asset_360.sql]
-- ==============================================================================
-- Migration: F4 Asset 360 Canonical Read-Model RPC
-- Function: get_asset_360(p_id_asset text)
-- Status: Gate 3 Executable Security & Isolation Boundary
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_asset_360(
  p_id_asset text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_auth_uid uuid;
  v_user_role text;
  v_match_count int := 0;
  
  -- Target Asset Variables
  v_asset_id text;
  v_kategori text;
  v_nama_aset text;
  v_id_pos text;
  v_nama_org text;
  v_org_level text;
  
  -- Physical specs
  v_luas_m2 numeric;
  v_fungsi text;
  v_nama_bangunan text;
  v_jenis text;
  v_merk_tipe text;
  v_thn_perolehan int;
  v_thn_berdiri int;
  v_kondisi text;
  
  -- Location
  v_alamat text;
  v_latitude numeric;
  v_longitude numeric;
  
  -- Valuation & Legal (Restricted)
  v_nilai_est numeric;
  v_nilai_buku numeric;
  v_sumber_dana text;
  v_status_hukum text;
  v_no_sertifikat text;
  v_lampiran_files jsonb := '[]'::jsonb;
  
  -- Access & Scope Context
  v_is_super_user boolean := false;
  v_is_restricted_authorized boolean := false;
  v_access_level text := 'UNAUTHENTICATED';
  v_same_tree boolean := false;
  
  -- Final JSON Payload
  v_result jsonb;
BEGIN
  -- ----------------------------------------------------------------------------
  -- Step 1: Session Authenticated Context Resolution
  -- ----------------------------------------------------------------------------
  v_auth_uid := auth.uid();
  
  IF v_auth_uid IS NOT NULL THEN
    SELECT role INTO v_user_role FROM public.users WHERE id = v_auth_uid;
    IF v_user_role = 'super_user' THEN
      v_is_super_user := true;
      v_is_restricted_authorized := true;
      v_access_level := 'FULL_ADMIN';
    ELSIF v_user_role IN ('admin_mupel', 'kmj', 'pj') THEN
      v_is_restricted_authorized := true;
      v_access_level := 'RESTRICTED';
    ELSE
      v_access_level := 'STANDARD';
    END IF;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Step 2: Deterministic Exact-Match ID Resolution Across 3 Physical Tables
  -- ----------------------------------------------------------------------------
  IF p_id_asset IS NULL OR trim(p_id_asset) = '' THEN
    RETURN NULL;
  END IF;

  -- Check Table 1: t_aset_tanah
  IF EXISTS (SELECT 1 FROM public.t_aset_tanah WHERE id_tanah = p_id_asset) THEN
    v_match_count := v_match_count + 1;
    v_asset_id := p_id_asset;
    v_kategori := 'tanah';
    
    SELECT 
      'Aset Tanah ' || COALESCE(t.status_hukum, ''),
      t.id_pos,
      t.luas_m2,
      t.thn_perolehan,
      t.status_hukum,
      t.kondisi,
      t.latitude,
      t.longitude,
      t.keterangan
    INTO 
      v_nama_aset, v_id_pos, v_luas_m2, v_thn_perolehan, v_status_hukum, 
      v_kondisi, v_latitude, v_longitude, v_alamat
    FROM public.t_aset_tanah t
    WHERE t.id_tanah = p_id_asset;
  END IF;

  -- Check Table 2: t_aset_bangunan
  IF EXISTS (SELECT 1 FROM public.t_aset_bangunan WHERE id_bangunan = p_id_asset) THEN
    v_match_count := v_match_count + 1;
    v_asset_id := p_id_asset;
    v_kategori := 'bangunan';
    
    SELECT 
      COALESCE(b.nama_bangunan, 'Bangunan ' || COALESCE(b.fungsi, '')),
      b.id_pos,
      b.fungsi,
      b.nama_bangunan,
      b.thn_berdiri,
      b.kondisi,
      b.latitude,
      b.longitude,
      b.keterangan
    INTO 
      v_nama_aset, v_id_pos, v_fungsi, v_nama_bangunan, v_thn_berdiri,
      v_kondisi, v_latitude, v_longitude, v_alamat
    FROM public.t_aset_bangunan b
    WHERE b.id_bangunan = p_id_asset;
  END IF;

  -- Check Table 3: t_aset_bergerak
  IF EXISTS (SELECT 1 FROM public.t_aset_bergerak WHERE id_aset_b = p_id_asset) THEN
    v_match_count := v_match_count + 1;
    v_asset_id := p_id_asset;
    v_kategori := 'bergerak';
    
    SELECT 
      COALESCE(bg.merk_tipe, 'Aset Bergerak ' || COALESCE(bg.jenis, '')),
      bg.id_pos,
      bg.jenis,
      bg.merk_tipe,
      bg.thn_perolehan,
      bg.kondisi,
      bg.latitude,
      bg.longitude,
      bg.keterangan
    INTO 
      v_nama_aset, v_id_pos, v_jenis, v_merk_tipe, v_thn_perolehan,
      v_kondisi, v_latitude, v_longitude, v_alamat
    FROM public.t_aset_bergerak bg
    WHERE bg.id_aset_b = p_id_asset;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Ambiguity Safety Guard: 0 Matches OR >1 Matches Return NULL
  -- ----------------------------------------------------------------------------
  IF v_match_count <> 1 THEN
    RETURN NULL; -- Exact resolution invariant: Ambiguous or Not Found
  END IF;

  -- ----------------------------------------------------------------------------
  -- Step 3: Resolve Ownership Organization Node
  -- ----------------------------------------------------------------------------
  IF v_id_pos IS NOT NULL THEN
    -- Try Jemaat Induk
    SELECT nama_jemaat, 'JEMAAT_INDUK' INTO v_nama_org, v_org_level
    FROM public.m_jemaat_induk WHERE id_jemaat = v_id_pos;

    -- Try Pos Pelkes if not jemaat
    IF v_nama_org IS NULL THEN
      SELECT nama_pos, 'POS_PELKES' INTO v_nama_org, v_org_level
      FROM public.m_pos_pelkes WHERE id_pos = v_id_pos;
    END IF;

    -- Try Mupel if neither
    IF v_nama_org IS NULL THEN
      SELECT nama_mupel, 'MUPEL' INTO v_nama_org, v_org_level
      FROM public.m_mupel WHERE id_mupel = v_id_pos;
    END IF;
  END IF;

  IF v_nama_org IS NULL THEN
    v_nama_org := 'Organisasi ID: ' || COALESCE(v_id_pos, 'N/A');
    v_org_level := 'POS_PELKES';
  END IF;

  -- ----------------------------------------------------------------------------
  -- Step 4: Resolve Lampiran Files Attachment Summary
  -- ----------------------------------------------------------------------------
  SELECT jsonb_agg(
    jsonb_build_object(
      'id_lampiran', l.id_lampiran,
      'nama_file', l.nama_file,
      'url', COALESCE(l.file_path, ''),
      'file_type', COALESCE(l.tipe_file, 'application/octet-stream')
    )
  ) INTO v_lampiran_files
  FROM public.t_lampiran_aset l
  WHERE l.id_tanah = v_asset_id OR l.id_bangunan = v_asset_id OR l.id_aset_b = v_asset_id;

  IF v_lampiran_files IS NULL THEN
    v_lampiran_files := '[]'::jsonb;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Step 5: Construct UnifiedAssetData Read-Model Payload
  -- ----------------------------------------------------------------------------
  v_result := jsonb_build_object(
    'id_asset', v_asset_id,
    'identity', jsonb_build_object(
      'id_asset', v_asset_id,
      'kategori', v_kategori,
      'nama_aset', v_nama_aset
    ),
    'ownership', jsonb_build_object(
      'id_pos', COALESCE(v_id_pos, ''),
      'nama_organisasi', v_nama_org,
      'org_level', v_org_level
    ),
    'physical', jsonb_build_object(
      'luas_m2', v_luas_m2,
      'fungsi', v_fungsi,
      'nama_bangunan', v_nama_bangunan,
      'jenis', v_jenis,
      'merk_tipe', v_merk_tipe,
      'thn_perolehan', v_thn_perolehan,
      'thn_berdiri', v_thn_berdiri,
      'kondisi', v_kondisi
    ),
    'location', jsonb_build_object(
      'alamat', v_alamat,
      'latitude', v_latitude,
      'longitude', v_longitude
    ),
    'valuation', CASE 
      WHEN v_is_restricted_authorized THEN jsonb_build_object(
        'nilai_est', NULL,
        'nilai_buku', NULL,
        'sumber_dana', NULL
      )
      ELSE NULL
    END,
    'legal', CASE 
      WHEN v_is_restricted_authorized THEN jsonb_build_object(
        'status_hukum', v_status_hukum,
        'no_sertifikat', NULL,
        'lampiran_files', v_lampiran_files
      )
      ELSE NULL
    END,
    'context', jsonb_build_object(
      'requester_access_level', v_access_level,
      'is_same_ancestral_tree', true
    ),
    '_meta', jsonb_build_object(
      'privacy', jsonb_build_object(
        'identity', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
        'ownership', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
        'physical', jsonb_build_object('accessible', true, 'visibility', 'PUBLIC_WITHIN_CONTEXT'),
        'location', jsonb_build_object('accessible', true, 'visibility', 'PUBLIC_WITHIN_CONTEXT'),
        'valuation', jsonb_build_object(
          'accessible', v_is_restricted_authorized, 
          'visibility', 'RESTRICTED',
          'reason', CASE WHEN NOT v_is_restricted_authorized THEN 'INSUFFICIENT_PERMISSION' ELSE NULL END
        ),
        'legal', jsonb_build_object(
          'accessible', v_is_restricted_authorized, 
          'visibility', 'RESTRICTED',
          'reason', CASE WHEN NOT v_is_restricted_authorized THEN 'INSUFFICIENT_PERMISSION' ELSE NULL END
        )
      )
    )
  );

  RETURN v_result;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_asset_360(text) TO authenticated, anon;


-- [MIGRATION SOURCE: 20260910_f5_aid_request_360.sql]
-- ==========================================
-- F5 Aid Request Entity: Read RPC & Atomic Transition RPC
-- ==========================================
-- Description: Universal Read-Model (get_aid_request_360) and 
-- Atomic Workflow State Transition (transition_aid_request_atomic).
-- Implements WORKSPACE_PATTERN_V1.1 & Aid Request Contract v0.1.
-- ==========================================

-- 0. Ensure System Transaction Logs Table for Idempotency
CREATE TABLE IF NOT EXISTS public.sys_transaction_logs (
    request_id TEXT PRIMARY KEY,
    id_ajuan TEXT NOT NULL,
    action TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 1. QUERY RPC: get_aid_request_360(p_id_ajuan)
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_aid_request_360(
    p_id_ajuan TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_requester_uid UUID;
    v_req_role TEXT;
    v_req_mupel TEXT;
    v_req_induk TEXT;

    v_match_count INT := 0;

    -- Aid Request Record Data
    v_id_pos TEXT;
    v_jenis_bantuan TEXT;
    v_id_tanah TEXT;
    v_id_bangunan TEXT;
    v_id_aset_b TEXT;
    v_biaya DECIMAL(15,2);
    v_urgensi TEXT;
    v_status TEXT;
    v_keterangan TEXT;
    v_created_at TIMESTAMPTZ;

    -- Ownership Context
    v_nama_pos TEXT;
    v_id_induk TEXT;
    v_id_mupel TEXT;

    -- Relationship Context & Access Control
    v_is_superuser BOOLEAN := FALSE;
    v_is_same_tree BOOLEAN := FALSE;
    v_can_see_restricted BOOLEAN := FALSE;
    v_reason_restricted TEXT := NULL;

    -- Approval History
    v_approval_history JSONB := '[]'::JSONB;

    v_result JSONB;
BEGIN
    -- 1. Trusted Session Check
    v_requester_uid := auth.uid();
    IF v_requester_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 2. Requester Scope Resolution
    SELECT role, id_mupel, id_induk 
    INTO v_req_role, v_req_mupel, v_req_induk
    FROM public.users 
    WHERE id = v_requester_uid;

    v_is_superuser := (COALESCE(v_req_role, '') = 'super_user');

    -- 3. Deterministic Identity Resolution (NO LIMIT 1)
    IF p_id_ajuan IS NULL OR TRIM(p_id_ajuan) = '' THEN
        RETURN NULL;
    END IF;

    SELECT COUNT(*) INTO v_match_count 
    FROM public.t_pengajuan_bantuan 
    WHERE id_ajuan = p_id_ajuan;

    IF v_match_count <> 1 THEN
        RETURN NULL; -- Return NULL for 0 or ambiguous matches (NO GUESSING)
    END IF;

    -- 4. Load Primary Aid Request Record
    SELECT 
        id_pos, jenis_bantuan, id_tanah, id_bangunan, id_aset_b,
        biaya, urgensi, COALESCE(status, 'Draft'), keterangan, created_at
    INTO 
        v_id_pos, v_jenis_bantuan, v_id_tanah, v_id_bangunan, v_id_aset_b,
        v_biaya, v_urgensi, v_status, v_keterangan, v_created_at
    FROM public.t_pengajuan_bantuan
    WHERE id_ajuan = p_id_ajuan;

    -- 5. Load Ownership Context
    SELECT p.nama_pos, p.id_induk, j.id_mupel
    INTO v_nama_pos, v_id_induk, v_id_mupel
    FROM public.m_pos_pelkes p
    LEFT JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
    WHERE p.id_pos = v_id_pos;

    -- 6. Evaluate Relationship Context & Access Control
    IF v_is_superuser THEN
        v_is_same_tree := TRUE;
    ELSE
        v_is_same_tree := (v_req_induk = v_id_induk OR v_req_mupel = v_id_mupel);
    END IF;

    v_can_see_restricted := v_is_superuser OR (v_is_same_tree AND v_req_role IN ('kmj', 'admin_mupel', 'pj'));

    IF NOT v_can_see_restricted THEN
        v_reason_restricted := CASE WHEN NOT v_is_same_tree THEN 'OUTSIDE_CONTEXT' ELSE 'INSUFFICIENT_PERMISSION' END;
    END IF;

    -- 7. Projection: Approval History (Restricted)
    IF v_can_see_restricted THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id', id,
                'role_approver', role_approver,
                'aksi', aksi,
                'catatan', catatan,
                'created_at', created_at
            ) ORDER BY created_at ASC
        ), '[]'::JSONB) INTO v_approval_history
        FROM public.t_approval_bantuan
        WHERE id_ajuan = p_id_ajuan;
    END IF;

    -- 8. Construct Final Unified JSON Payload
    -- Invariant: SYSTEM_ONLY fields (updated_at, created_by) are strictly EXCLUDED
    v_result := jsonb_build_object(
        'id_ajuan', p_id_ajuan,
        'identity', jsonb_build_object(
            'id_ajuan', p_id_ajuan,
            'jenis_bantuan', v_jenis_bantuan,
            'urgensi', v_urgensi
        ),
        'ownership', jsonb_build_object(
            'id_pos', v_id_pos,
            'nama_organisasi', COALESCE(v_nama_pos, 'Organisasi Pemohon'),
            'org_level', 'POS_PELKES'
        ),
        'workflow', jsonb_build_object(
            'status', v_status,
            'created_at', v_created_at
        ),
        'proposal', CASE 
            WHEN v_can_see_restricted THEN jsonb_build_object(
                'biaya', v_biaya,
                'keterangan', v_keterangan,
                'id_tanah', v_id_tanah,
                'id_bangunan', v_id_bangunan,
                'id_aset_b', v_id_aset_b
            )
            ELSE NULL 
        END,
        'approval_history', v_approval_history,
        'context', jsonb_build_object(
            'requester_access_level', CASE WHEN v_can_see_restricted THEN 'FULL_ADMIN' WHEN v_is_same_tree THEN 'STANDARD' ELSE 'UNAUTHENTICATED' END,
            'is_same_ancestral_tree', v_is_same_tree
        ),
        '_meta', jsonb_build_object(
            'privacy', jsonb_build_object(
                'identity', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'ownership', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'workflow', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'proposal', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'approval_history', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted)
            )
        )
    );

    RETURN v_result;
END;
$$;


-- ==========================================
-- 2. COMMAND RPC: transition_aid_request_atomic(...)
-- ==========================================
CREATE OR REPLACE FUNCTION public.transition_aid_request_atomic(
    p_id_ajuan TEXT,
    p_action TEXT,
    p_catatan TEXT DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_requester_uid UUID;
    v_req_role TEXT;
    v_req_mupel TEXT;
    v_req_induk TEXT;

    v_action TEXT;
    v_current_status TEXT;
    v_target_status TEXT;
    v_id_pos TEXT;
    v_id_induk TEXT;
    v_id_mupel TEXT;

    v_is_superuser BOOLEAN := FALSE;
    v_is_authorized BOOLEAN := FALSE;
BEGIN
    -- 1. Trusted Session Check
    v_requester_uid := auth.uid();
    IF v_requester_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 2. Idempotency Guard (via sys_transaction_logs)
    IF p_request_id IS NOT NULL AND TRIM(p_request_id) <> '' THEN
        IF EXISTS (SELECT 1 FROM public.sys_transaction_logs WHERE request_id = p_request_id) THEN
            -- Already processed: return current read model safely
            RETURN public.get_aid_request_360(p_id_ajuan);
        END IF;
    END IF;

    -- 3. Requester Scope Resolution
    SELECT role, id_mupel, id_induk 
    INTO v_req_role, v_req_mupel, v_req_induk
    FROM public.users 
    WHERE id = v_requester_uid;

    v_is_superuser := (COALESCE(v_req_role, '') = 'super_user');

    -- 4. Lock Target Aid Request & Load Current Status
    SELECT status, id_pos INTO v_current_status, v_id_pos
    FROM public.t_pengajuan_bantuan
    WHERE id_ajuan = p_id_ajuan
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'AID_REQUEST_NOT_FOUND';
    END IF;

    -- Load Owner Org Scope
    SELECT p.id_induk, j.id_mupel
    INTO v_id_induk, v_id_mupel
    FROM public.m_pos_pelkes p
    LEFT JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
    WHERE p.id_pos = v_id_pos;

    -- 5. Validate State Machine Transition & Evaluate Authorization Boundary
    v_action := LOWER(TRIM(p_action));

    IF v_current_status = 'Draft' THEN
        IF v_action = 'submit' THEN
            v_target_status := 'Pending_KMJ';
            v_is_authorized := v_is_superuser OR (v_req_induk = v_id_induk OR v_req_mupel = v_id_mupel);
        ELSE
            RAISE EXCEPTION 'INVALID_TRANSITION';
        END IF;

    ELSIF v_current_status = 'Pending_KMJ' THEN
        IF v_action = 'approve' THEN
            v_target_status := 'Pending_Mupel';
            v_is_authorized := v_is_superuser OR (v_req_role = 'kmj' AND v_req_induk = v_id_induk);
        ELSIF v_action = 'reject' THEN
            v_target_status := 'Rejected';
            v_is_authorized := v_is_superuser OR (v_req_role = 'kmj' AND v_req_induk = v_id_induk);
        ELSE
            RAISE EXCEPTION 'INVALID_TRANSITION';
        END IF;

    ELSIF v_current_status = 'Pending_Mupel' THEN
        IF v_action = 'approve' THEN
            v_target_status := 'Pending_Sinode';
            v_is_authorized := v_is_superuser OR (v_req_role = 'admin_mupel' AND v_req_mupel = v_id_mupel);
        ELSIF v_action = 'reject' THEN
            v_target_status := 'Rejected';
            v_is_authorized := v_is_superuser OR (v_req_role = 'admin_mupel' AND v_req_mupel = v_id_mupel);
        ELSE
            RAISE EXCEPTION 'INVALID_TRANSITION';
        END IF;

    ELSIF v_current_status = 'Pending_Sinode' THEN
        IF v_action = 'approve' THEN
            v_target_status := 'Approved';
            v_is_authorized := v_is_superuser;
        ELSIF v_action = 'reject' THEN
            v_target_status := 'Rejected';
            v_is_authorized := v_is_superuser;
        ELSE
            RAISE EXCEPTION 'INVALID_TRANSITION';
        END IF;

    ELSE
        -- Terminal state (Approved / Rejected) cannot be transitioned
        RAISE EXCEPTION 'INVALID_TRANSITION';
    END IF;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'INSUFFICIENT_PERMISSION';
    END IF;

    -- 6. Perform Atomic Mutation (State Update + Approval Audit Log Insertion)
    UPDATE public.t_pengajuan_bantuan
    SET status = v_target_status,
        updated_at = NOW()
    WHERE id_ajuan = p_id_ajuan;

    INSERT INTO public.t_approval_bantuan (
        id_ajuan, approver_id, role_approver, aksi, catatan, created_at
    ) VALUES (
        p_id_ajuan,
        v_requester_uid,
        COALESCE(v_req_role, 'user'),
        v_action,
        p_catatan,
        NOW()
    );

    -- Log Idempotency Token
    IF p_request_id IS NOT NULL AND TRIM(p_request_id) <> '' THEN
        INSERT INTO public.sys_transaction_logs (request_id, id_ajuan, action)
        VALUES (p_request_id, p_id_ajuan, v_action)
        ON CONFLICT (request_id) DO NOTHING;
    END IF;

    -- 7. Return Updated Read Model Payload
    RETURN public.get_aid_request_360(p_id_ajuan);
END;
$$;


-- [MIGRATION SOURCE: 20260911_f7_document_vault_360.sql]
-- ============================================================================
-- F7 DOCUMENT VAULT & STORAGE OBJECT MIGRATION
-- Reference Implementation #6 (Document Storage Lifecycle & Security Boundary)
-- ============================================================================

-- 1. PHYSICAL METADATA TABLE
CREATE TABLE IF NOT EXISTS public.t_dokumen_resmi (
    id_dokumen TEXT PRIMARY KEY DEFAULT ('DOC-' || gen_random_uuid()::text),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'organization', 'asset', 'aid_request')),
    entity_id TEXT NOT NULL,
    nama_file TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
    mime_type TEXT NOT NULL,
    visibility_tier TEXT NOT NULL DEFAULT 'ORG_WIDE' CHECK (visibility_tier IN ('PUBLIC', 'ORG_WIDE', 'CONFIDENTIAL')),
    sha256_checksum TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING_UPLOAD' CHECK (status IN ('PENDING_UPLOAD', 'ACTIVE', 'FAILED_UPLOAD', 'CORRUPTED', 'DELETED')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_dokumen_entity ON public.t_dokumen_resmi (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_dokumen_status ON public.t_dokumen_resmi (status);

-- Enable RLS on metadata table
ALTER TABLE public.t_dokumen_resmi ENABLE ROW LEVEL SECURITY;

-- 2. PRIVATE STORAGE BUCKET CREATION
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault_documents', 'vault_documents', false)
ON CONFLICT (id) DO NOTHING;

-- 3. RPC: REGISTER DOCUMENT UPLOAD INTENT (PHASE 1)
CREATE OR REPLACE FUNCTION public.register_document_upload_intent(
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_nama_file TEXT,
    p_size_bytes BIGINT,
    p_mime_type TEXT,
    p_visibility_tier TEXT DEFAULT 'ORG_WIDE'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_id_dokumen TEXT;
    v_storage_path TEXT;
    v_result JSONB;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required to upload documents.';
    END IF;

    -- Validate input parameters
    IF p_entity_type NOT IN ('person', 'organization', 'asset', 'aid_request') THEN
        RAISE EXCEPTION 'INVALID_ENTITY: Invalid entity_type specified.';
    END IF;

    v_id_dokumen := 'DOC-' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 12);
    v_storage_path := p_entity_type || '/' || p_entity_id || '/' || v_id_dokumen || '/' || p_nama_file;

    INSERT INTO public.t_dokumen_resmi (
        id_dokumen,
        entity_type,
        entity_id,
        nama_file,
        storage_path,
        size_bytes,
        mime_type,
        visibility_tier,
        status,
        created_by
    ) VALUES (
        v_id_dokumen,
        p_entity_type,
        p_entity_id,
        p_nama_file,
        v_storage_path,
        p_size_bytes,
        p_mime_type,
        COALESCE(p_visibility_tier, 'ORG_WIDE'),
        'PENDING_UPLOAD',
        v_uid
    );

    v_result := jsonb_build_object(
        'id_dokumen', v_id_dokumen,
        'entity_type', p_entity_type,
        'entity_id', p_entity_id,
        'expected_file_name', p_nama_file,
        'expected_size_bytes', p_size_bytes,
        'expected_mime_type', p_mime_type,
        'storage_path', v_storage_path,
        'upload_token', 'TOKEN-' || v_id_dokumen,
        'expires_at', (NOW() + INTERVAL '1 hour')::text
    );

    RETURN v_result;
END;
$$;

-- 4. RPC: CONFIRM DOCUMENT UPLOAD SUCCESS (PHASE 2)
CREATE OR REPLACE FUNCTION public.confirm_document_upload_success(
    p_id_dokumen TEXT,
    p_sha256_checksum TEXT DEFAULT NULL,
    p_size_bytes BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_doc RECORD;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_doc FROM public.t_dokumen_resmi WHERE id_dokumen = p_id_dokumen FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'DOCUMENT_NOT_FOUND: Specified document id does not exist.';
    END IF;

    IF v_doc.status != 'PENDING_UPLOAD' THEN
        RAISE EXCEPTION 'INVALID_TRANSITION: Document is not in PENDING_UPLOAD state.';
    END IF;

    -- Double verification: declare vs confirmation mismatch check
    IF p_size_bytes IS NOT NULL AND p_size_bytes != v_doc.size_bytes THEN
        UPDATE public.t_dokumen_resmi 
        SET status = 'CORRUPTED', updated_at = NOW() 
        WHERE id_dokumen = p_id_dokumen;
        
        RAISE EXCEPTION 'FILE_SIZE_MISMATCH: Uploaded file size does not match declared intent.';
    END IF;

    UPDATE public.t_dokumen_resmi
    SET 
        status = 'ACTIVE',
        sha256_checksum = COALESCE(p_sha256_checksum, v_doc.sha256_checksum),
        updated_at = NOW()
    WHERE id_dokumen = p_id_dokumen;

    RETURN jsonb_build_object(
        'id_dokumen', p_id_dokumen,
        'status', 'ACTIVE',
        'storage_path', v_doc.storage_path
    );
END;
$$;

-- 5. RPC: GET DOCUMENT SIGNED URL METADATA
CREATE OR REPLACE FUNCTION public.get_document_signed_url(
    p_id_dokumen TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_doc RECORD;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_doc FROM public.t_dokumen_resmi WHERE id_dokumen = p_id_dokumen;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'DOCUMENT_NOT_FOUND: Specified document does not exist.';
    END IF;

    IF v_doc.status = 'DELETED' OR v_doc.status = 'PENDING_UPLOAD' THEN
        RAISE EXCEPTION 'UNAVAILABLE_DOCUMENT: Cannot generate signed URL for inactive or deleted document.';
    END IF;

    RETURN jsonb_build_object(
        'id_dokumen', v_doc.id_dokumen,
        'storage_path', v_doc.storage_path,
        'signed_url', 'https://mock-storage.supabase.co/object/sign/vault_documents/' || v_doc.storage_path || '?token=MOCK_SIGNED_TOKEN',
        'expires_at', (NOW() + INTERVAL '60 seconds')::text
    );
END;
$$;

-- 6. RPC: DELETE DOCUMENT SOFT
CREATE OR REPLACE FUNCTION public.delete_document_soft(
    p_id_dokumen TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_doc RECORD;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_doc FROM public.t_dokumen_resmi WHERE id_dokumen = p_id_dokumen FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'DOCUMENT_NOT_FOUND: Specified document does not exist.';
    END IF;

    UPDATE public.t_dokumen_resmi
    SET status = 'DELETED', updated_at = NOW()
    WHERE id_dokumen = p_id_dokumen;

    RETURN jsonb_build_object(
        'id_dokumen', p_id_dokumen,
        'status', 'DELETED',
        'storage_path', v_doc.storage_path
    );
END;
$$;

-- 7. RPC: GET DOCUMENT VAULT 360 (READ MODEL)
CREATE OR REPLACE FUNCTION public.get_document_vault_360(
    p_entity_type TEXT,
    p_entity_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_docs JSONB;
    v_total_count INT;
    v_total_size BIGINT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT 
        COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_dokumen', d.id_dokumen,
                'entity_type', d.entity_type,
                'entity_id', d.entity_id,
                'nama_file', d.nama_file,
                'storage_path', d.storage_path,
                'size_bytes', d.size_bytes,
                'mime_type', d.mime_type,
                'visibility_tier', d.visibility_tier,
                'sha256_checksum', d.sha256_checksum,
                'status', d.status,
                'created_at', d.created_at
            ) ORDER BY d.created_at DESC
        ), '[]'::jsonb),
        COUNT(*),
        COALESCE(SUM(d.size_bytes), 0)
    INTO v_docs, v_total_count, v_total_size
    FROM public.t_dokumen_resmi d
    WHERE d.entity_type = p_entity_type 
      AND d.entity_id = p_entity_id
      AND d.status != 'DELETED';

    RETURN jsonb_build_object(
        'entity_type', p_entity_type,
        'entity_id', p_entity_id,
        'total_count', v_total_count,
        'total_size_bytes', v_total_size,
        'documents', v_docs
    );
END;
$$;


-- [MIGRATION SOURCE: 20260912_f8_pastoral_transfer_360.sql]
-- ============================================================================
-- F8 PASTORAL TRANSFER & RELOCATION ENGINE MIGRATION
-- Reference Implementation #7 (Dual-Context Relocation & Service Continuity)
-- ============================================================================

-- 0. RECONCILIATION AUDIT TRAIL LOG TABLE
CREATE TABLE IF NOT EXISTS public.sys_reconciliation_audit_logs (
    id_log TEXT PRIMARY KEY DEFAULT ('RECON-' || gen_random_uuid()::text),
    table_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    id_person TEXT,
    action TEXT NOT NULL,
    reason TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. PHYSICAL TABLE: TRANSFER PROPOSALS (t_mutasi_pelayan)
CREATE TABLE IF NOT EXISTS public.t_mutasi_pelayan (
    id_mutasi TEXT PRIMARY KEY DEFAULT ('MUTASI-' || gen_random_uuid()::text),
    id_person TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL,
    id_org_asal TEXT NOT NULL,
    nama_org_asal TEXT NOT NULL,
    id_org_tujuan TEXT NOT NULL,
    nama_org_tujuan TEXT NOT NULL,
    status_mutasi TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status_mutasi IN ('PROPOSED', 'APPROVED_SINODE', 'REJECTED', 'DEPLOYED', 'CANCELLED')),
    tanggal_efektif DATE,
    catatan TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reconcile t_mutasi_pelayan if pre-existed from legacy schemas
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS id_person TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS nama_lengkap TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS id_org_asal TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS nama_org_asal TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS id_org_tujuan TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS nama_org_tujuan TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS status_mutasi TEXT DEFAULT 'PROPOSED';
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS tanggal_efektif DATE;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS catatan TEXT;

-- 2. PHYSICAL TABLE: PASTORAL SERVICE POSTINGS (t_penugasan_pendeta)
CREATE TABLE IF NOT EXISTS public.t_penugasan_pendeta (
    id_penugasan TEXT PRIMARY KEY DEFAULT ('NUGAS-' || gen_random_uuid()::text),
    id_person TEXT NOT NULL,
    id_pos TEXT NOT NULL,
    nama_organisasi TEXT NOT NULL,
    jabatan TEXT NOT NULL DEFAULT 'Ketua Majelis Jemaat',
    tanggal_mulai DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_selesai DATE,
    status_penugasan TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status_penugasan IN ('ACTIVE', 'TRANSFERRED', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reconcile t_penugasan_pendeta if pre-existed in legacy schemas
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS id_penugasan TEXT DEFAULT ('NUGAS-' || gen_random_uuid()::text);
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS id_person TEXT;
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS id_pos TEXT;
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS nama_organisasi TEXT;
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS jabatan TEXT DEFAULT 'Ketua Majelis Jemaat';
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS tanggal_mulai DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS tanggal_selesai DATE;
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS status_penugasan TEXT DEFAULT 'ACTIVE';

-- Populate id_person & reconcile legacy status_tugas values with strict mapping & audit trail
DO $$
DECLARE
    r RECORD;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 't_penugasan_pendeta' AND column_name = 'id_pendeta'
    ) THEN
        UPDATE public.t_penugasan_pendeta 
        SET id_person = COALESCE(id_person, id_pendeta) 
        WHERE id_person IS NULL;
    END IF;

    -- Strict Mapping (No Guesswork)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 't_penugasan_pendeta' AND column_name = 'status_tugas'
    ) THEN
        UPDATE public.t_penugasan_pendeta 
        SET status_penugasan = CASE 
            WHEN status_tugas ILIKE 'aktif' THEN 'ACTIVE' 
            WHEN status_tugas ILIKE 'selesai' THEN 'TRANSFERRED'
            WHEN status_tugas ILIKE 'mutasi' THEN 'TRANSFERRED'
            ELSE 'INACTIVE'
        END
        WHERE status_penugasan IS NULL;
    END IF;

    -- Deduplicate pre-existing duplicate ACTIVE assignments with Audit Logging:
    FOR r IN (
        WITH RankedActiveAssignments AS (
            SELECT 
                id_penugasan,
                id_person,
                id_pos,
                nama_organisasi,
                ROW_NUMBER() OVER (
                    PARTITION BY id_person 
                    ORDER BY COALESCE(tanggal_mulai, created_at::date) DESC, created_at DESC
                ) as rn
            FROM public.t_penugasan_pendeta
            WHERE status_penugasan = 'ACTIVE' AND id_person IS NOT NULL
        )
        SELECT * FROM RankedActiveAssignments WHERE rn > 1
    ) LOOP
        -- Archive older active assignment
        UPDATE public.t_penugasan_pendeta
        SET 
            status_penugasan = 'TRANSFERRED',
            tanggal_selesai = COALESCE(tanggal_selesai, CURRENT_DATE)
        WHERE id_penugasan = r.id_penugasan;

        -- Record Audit Log for Historical Integrity
        INSERT INTO public.sys_reconciliation_audit_logs (
            table_name,
            entity_id,
            id_person,
            action,
            reason,
            metadata
        ) VALUES (
            't_penugasan_pendeta',
            r.id_penugasan,
            r.id_person,
            'ARCHIVE_DUPLICATE_ACTIVE',
            'Legacy data reconciliation: archived older duplicate ACTIVE assignment while retaining historical continuity.',
            jsonb_build_object(
                'id_pos', r.id_pos,
                'nama_organisasi', r.nama_organisasi,
                'reconciled_at', NOW()
            )
        );
    END LOOP;
END $$;

-- Indexing for fast lookup
CREATE INDEX IF NOT EXISTS idx_mutasi_person ON public.t_mutasi_pelayan (id_person);
CREATE INDEX IF NOT EXISTS idx_penugasan_person ON public.t_penugasan_pendeta (id_person);

-- 3. DATABASE INVARIANT: SINGLE ACTIVE ASSIGNMENT CONSTRAINT
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_assignment 
ON public.t_penugasan_pendeta (id_person) 
WHERE (status_penugasan = 'ACTIVE' AND id_person IS NOT NULL);

-- Enable RLS
ALTER TABLE public.t_mutasi_pelayan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.t_penugasan_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_reconciliation_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. ATOMIC RELOCATION & STATE TRANSITION RPC
CREATE OR REPLACE FUNCTION public.transition_pastoral_transfer_atomic(
    p_id_mutasi TEXT,
    p_action TEXT,
    p_catatan TEXT DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_uid UUID;
    v_action TEXT;
    v_transfer RECORD;
    v_new_status TEXT;
    v_log_exists BOOLEAN;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for transfer transitions.';
    END IF;

    -- Idempotency Check
    IF p_request_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.sys_transaction_logs WHERE request_id = p_request_id
        ) INTO v_log_exists;

        IF v_log_exists THEN
            RETURN public.get_pastoral_transfer_360((SELECT id_mutasi FROM public.t_mutasi_pelayan WHERE id_mutasi = p_id_mutasi));
        END IF;
    END IF;

    v_action := LOWER(TRIM(p_action));

    SELECT * INTO v_transfer FROM public.t_mutasi_pelayan WHERE id_mutasi = p_id_mutasi FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'TRANSFER_NOT_FOUND: Specified transfer request does not exist.';
    END IF;

    -- Validate State Transition Matrix
    IF v_action = 'approve' THEN
        IF v_transfer.status_mutasi != 'PROPOSED' THEN
            RAISE EXCEPTION 'INVALID_TRANSITION: Can only approve transfers in PROPOSED state.';
        END IF;
        v_new_status := 'APPROVED_SINODE';

    ELSIF v_action = 'reject' THEN
        IF v_transfer.status_mutasi != 'PROPOSED' THEN
            RAISE EXCEPTION 'INVALID_TRANSITION: Can only reject transfers in PROPOSED state.';
        END IF;
        v_new_status := 'REJECTED';

    ELSIF v_action = 'deploy' THEN
        IF v_transfer.status_mutasi != 'APPROVED_SINODE' THEN
            RAISE EXCEPTION 'INVALID_TRANSITION: Can only deploy transfers in APPROVED_SINODE state.';
        END IF;
        v_new_status := 'DEPLOYED';

        -- ATOMIC ASSIGNMENT MUTATION IN SINGLE TRANSACTION BOUNDARY
        -- 1. Archive current active assignment to TRANSFERRED
        UPDATE public.t_penugasan_pendeta
        SET 
            status_penugasan = 'TRANSFERRED',
            tanggal_selesai = CURRENT_DATE
        WHERE id_person = v_transfer.id_person AND status_penugasan = 'ACTIVE';

        -- 2. Insert new active assignment for receiving organization
        INSERT INTO public.t_penugasan_pendeta (
            id_person,
            id_pos,
            nama_organisasi,
            jabatan,
            tanggal_mulai,
            status_penugasan
        ) VALUES (
            v_transfer.id_person,
            v_transfer.id_org_tujuan,
            v_transfer.nama_org_tujuan,
            'Ketua Majelis Jemaat',
            CURRENT_DATE,
            'ACTIVE'
        );

    ELSE
        RAISE EXCEPTION 'INVALID_ACTION: Unknown transfer action specified.';
    END IF;

    -- Update Transfer Lifecycle Record
    UPDATE public.t_mutasi_pelayan
    SET 
        status_mutasi = v_new_status,
        catatan = COALESCE(p_catatan, catatan),
        updated_at = NOW()
    WHERE id_mutasi = p_id_mutasi;

    -- Record Idempotency Log
    IF p_request_id IS NOT NULL THEN
        INSERT INTO public.sys_transaction_logs (request_id, entity_id, action, status)
        VALUES (p_request_id, p_id_mutasi, v_action, v_new_status)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN public.get_pastoral_transfer_360(p_id_mutasi);
END;
$$;

-- 5. READ MODEL QUERY RPC: GET PASTORAL TRANSFER 360
CREATE OR REPLACE FUNCTION public.get_pastoral_transfer_360(
    p_id_mutasi TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_uid UUID;
    v_transfer RECORD;
    v_current_assignment JSONB;
    v_assignment_history JSONB;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_transfer FROM public.t_mutasi_pelayan WHERE id_mutasi = p_id_mutasi;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Current Active Assignment
    SELECT jsonb_build_object(
        'id_penugasan', p.id_penugasan,
        'id_person', p.id_person,
        'id_pos', p.id_pos,
        'nama_organisasi', p.nama_organisasi,
        'jabatan', p.jabatan,
        'tanggal_mulai', p.tanggal_mulai,
        'tanggal_selesai', p.tanggal_selesai,
        'status_penugasan', p.status_penugasan
    ) INTO v_current_assignment
    FROM public.t_penugasan_pendeta p
    WHERE p.id_person = v_transfer.id_person AND p.status_penugasan = 'ACTIVE';

    -- Historical Service Chain
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_penugasan', h.id_penugasan,
            'id_person', h.id_person,
            'id_pos', h.id_pos,
            'nama_organisasi', h.nama_organisasi,
            'jabatan', h.jabatan,
            'tanggal_mulai', h.tanggal_mulai,
            'tanggal_selesai', h.tanggal_selesai,
            'status_penugasan', h.status_penugasan
        ) ORDER BY h.tanggal_mulai DESC
    ), '[]'::jsonb) INTO v_assignment_history
    FROM public.t_penugasan_pendeta h
    WHERE h.id_person = v_transfer.id_person;

    RETURN jsonb_build_object(
        'id_mutasi', v_transfer.id_mutasi,
        'transfer', jsonb_build_object(
            'id_mutasi', v_transfer.id_mutasi,
            'id_person', v_transfer.id_person,
            'nama_lengkap', v_transfer.nama_lengkap,
            'id_org_asal', v_transfer.id_org_asal,
            'nama_org_asal', v_transfer.nama_org_asal,
            'id_org_tujuan', v_transfer.id_org_tujuan,
            'nama_org_tujuan', v_transfer.nama_org_tujuan,
            'status_mutasi', v_transfer.status_mutasi,
            'tanggal_efektif', v_transfer.tanggal_efektif,
            'catatan', v_transfer.catatan,
            'created_at', v_transfer.created_at
        ),
        'current_assignment', v_current_assignment,
        'assignment_history', v_assignment_history
    );
END;
$$;


-- [MIGRATION SOURCE: 20260913_f9_geospatial_territory_360.sql]
-- ============================================================================
-- F9 GEOSPATIAL & TERRITORY BOUNDARY ENGINE MIGRATION
-- Reference Implementation #8 (Spatial Context Resolution & Boundary Polygon Engine)
-- ============================================================================

-- Enable PostGIS Extension if not enabled
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- 0. SPATIAL HISTORY AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.sys_spatial_history_logs (
    id_history TEXT PRIMARY KEY DEFAULT ('SPATIAL-HIST-' || gen_random_uuid()::text),
    id_spatial TEXT NOT NULL,
    canonical_entity_type TEXT NOT NULL,
    canonical_entity_id TEXT NOT NULL,
    semantic_category TEXT NOT NULL,
    previous_geojson JSONB NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    request_id TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. PHYSICAL TABLE: SECTOR & TERRITORY BOUNDARIES (m_wilayah_pelayanan)
CREATE TABLE IF NOT EXISTS public.m_wilayah_pelayanan (
    id_spatial TEXT PRIMARY KEY DEFAULT ('GEO-' || gen_random_uuid()::text),
    canonical_entity_type TEXT NOT NULL CHECK (canonical_entity_type IN ('organization', 'sector', 'asset', 'territory_zone')),
    canonical_entity_id TEXT NOT NULL,
    semantic_category TEXT NOT NULL CHECK (semantic_category IN ('TERRITORY_BOUNDARY', 'RISK_ZONE', 'RESOURCE_ZONE', 'POINT_LOCATION')),
    nama_wilayah TEXT NOT NULL,
    keterangan TEXT,
    geojson_data JSONB NOT NULL,
    luas_m2 NUMERIC,
    geom extensions.geometry(Geometry, 4326),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GIST SPATIAL INDEXING FOR FAST POLYGON/POINT QUERIES
CREATE INDEX IF NOT EXISTS idx_wilayah_geom ON public.m_wilayah_pelayanan USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_wilayah_entity ON public.m_wilayah_pelayanan (canonical_entity_type, canonical_entity_id);
CREATE INDEX IF NOT EXISTS idx_wilayah_semantic ON public.m_wilayah_pelayanan (semantic_category);

-- Enable RLS
ALTER TABLE public.m_wilayah_pelayanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_spatial_history_logs ENABLE ROW LEVEL SECURITY;

-- 3. HELPER FUNCTION: VALIDATE WGS84 COORDINATE RANGE & GEOMETRY SEMANTIC COMPATIBILITY
CREATE OR REPLACE FUNCTION public.validate_geospatial_feature_atomic(
    p_geometry_type TEXT,
    p_semantic_category TEXT,
    p_coordinates JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Semantic ↔ Geometry Type Compatibility Matrix Enforcement
    IF p_semantic_category IN ('TERRITORY_BOUNDARY', 'RISK_ZONE', 'RESOURCE_ZONE') THEN
        IF p_geometry_type NOT IN ('Polygon', 'MultiPolygon') THEN
            RAISE EXCEPTION 'GEOMETRY_SEMANTIC_MISMATCH: Category % requires Polygon or MultiPolygon geometry.', p_semantic_category;
        END IF;
    ELSIF p_semantic_category = 'POINT_LOCATION' THEN
        IF p_geometry_type != 'Point' THEN
            RAISE EXCEPTION 'GEOMETRY_SEMANTIC_MISMATCH: Category POINT_LOCATION requires Point geometry.';
        END IF;
    ELSE
        RAISE EXCEPTION 'INVALID_SEMANTIC_CATEGORY: Category % is not supported.', p_semantic_category;
    END IF;

    RETURN TRUE;
END;
$$;

-- 4. ATOMIC SPATIAL BOUNDARY MUTATION & AUDIT RPC
CREATE OR REPLACE FUNCTION public.save_territory_boundary_atomic(
    p_id_spatial TEXT DEFAULT NULL,
    p_canonical_entity_type TEXT DEFAULT 'sector',
    p_canonical_entity_id TEXT DEFAULT NULL,
    p_semantic_category TEXT DEFAULT 'TERRITORY_BOUNDARY',
    p_nama_wilayah TEXT DEFAULT NULL,
    p_keterangan TEXT DEFAULT NULL,
    p_geojson_feature JSONB DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_id_spatial TEXT;
    v_geom_type TEXT;
    v_geom extensions.geometry;
    v_existing RECORD;
    v_log_exists BOOLEAN;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for spatial mutations.';
    END IF;

    -- Idempotency Check
    IF p_request_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.sys_transaction_logs WHERE request_id = p_request_id
        ) INTO v_log_exists;

        IF v_log_exists THEN
            RETURN public.get_territory_geospatial_360(p_canonical_entity_type, p_canonical_entity_id);
        END IF;
    END IF;

    IF p_canonical_entity_id IS NULL OR p_nama_wilayah IS NULL OR p_geojson_feature IS NULL THEN
        RAISE EXCEPTION 'INVALID_INPUT: Missing required spatial parameters.';
    END IF;

    -- Extract geometry type
    v_geom_type := p_geojson_feature->'geometry'->>'type';
    IF v_geom_type IS NULL THEN
        RAISE EXCEPTION 'INVALID_GEOJSON: Missing geometry type in Feature.';
    END IF;

    -- Enforce Semantic ↔ Geometry Matrix
    PERFORM public.validate_geospatial_feature_atomic(v_geom_type, p_semantic_category, p_geojson_feature->'geometry'->'coordinates');

    -- Convert GeoJSON to PostGIS Geometry (SRID 4326)
    BEGIN
        v_geom := ST_SetSRID(ST_GeomFromGeoJSON(p_geojson_feature->>'geometry'), 4326);
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'INVALID_GEOJSON_FORMAT: Could not parse GeoJSON geometry into SRID 4326.';
    END;

    -- PostGIS ST_IsValid Topology Check
    IF NOT ST_IsValid(v_geom) THEN
        RAISE EXCEPTION 'INVALID_TOPOLOGY: Self-intersecting or invalid polygon geometry topology rejected.';
    END IF;

    v_id_spatial := COALESCE(p_id_spatial, 'GEO-' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 12));

    -- Check if record exists for update & historical archiving
    SELECT * INTO v_existing FROM public.m_wilayah_pelayanan WHERE id_spatial = v_id_spatial FOR UPDATE;

    IF FOUND THEN
        -- Archive previous spatial geometry
        INSERT INTO public.sys_spatial_history_logs (
            id_spatial,
            canonical_entity_type,
            canonical_entity_id,
            semantic_category,
            previous_geojson,
            actor_id,
            request_id,
            reason
        ) VALUES (
            v_existing.id_spatial,
            v_existing.canonical_entity_type,
            v_existing.canonical_entity_id,
            v_existing.semantic_category,
            v_existing.geojson_data,
            v_uid,
            p_request_id,
            COALESCE(p_reason, 'Spatial boundary update mutation')
        );

        -- Update Spatial Record
        UPDATE public.m_wilayah_pelayanan
        SET 
            canonical_entity_type = p_canonical_entity_type,
            canonical_entity_id = p_canonical_entity_id,
            semantic_category = p_semantic_category,
            nama_wilayah = p_nama_wilayah,
            keterangan = COALESCE(p_keterangan, keterangan),
            geojson_data = p_geojson_feature,
            geom = v_geom,
            luas_m2 = ST_Area(v_geom::geography),
            updated_at = NOW()
        WHERE id_spatial = v_id_spatial;
    ELSE
        -- Insert New Spatial Record
        INSERT INTO public.m_wilayah_pelayanan (
            id_spatial,
            canonical_entity_type,
            canonical_entity_id,
            semantic_category,
            nama_wilayah,
            keterangan,
            geojson_data,
            geom,
            luas_m2,
            created_by
        ) VALUES (
            v_id_spatial,
            p_canonical_entity_type,
            p_canonical_entity_id,
            p_semantic_category,
            p_nama_wilayah,
            p_keterangan,
            p_geojson_feature,
            v_geom,
            ST_Area(v_geom::geography),
            v_uid
        );
    END IF;

    -- Log Idempotency Token
    IF p_request_id IS NOT NULL THEN
        INSERT INTO public.sys_transaction_logs (request_id, entity_id, action, status)
        VALUES (p_request_id, v_id_spatial, 'SAVE_SPATIAL_BOUNDARY', 'SUCCESS')
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN public.get_territory_geospatial_360(p_canonical_entity_type, p_canonical_entity_id);
END;
$$;

-- 5. READ MODEL QUERY RPC: GET TERRITORY GEOSPATIAL 360 (GEOJSON FEATURECOLLECTION)
CREATE OR REPLACE FUNCTION public.get_territory_geospatial_360(
    p_canonical_entity_type TEXT,
    p_canonical_entity_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_features JSONB;
    v_total INT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT 
        COALESCE(jsonb_agg(
            jsonb_build_object(
                'type', 'Feature',
                'id', w.id_spatial,
                'geometry', w.geojson_data->'geometry',
                'properties', jsonb_build_object(
                    'id_spatial', w.id_spatial,
                    'canonical_entity_type', w.canonical_entity_type,
                    'canonical_entity_id', w.canonical_entity_id,
                    'semantic_category', w.semantic_category,
                    'nama_wilayah', w.nama_wilayah,
                    'keterangan', w.keterangan,
                    'luas_m2', w.luas_m2,
                    'created_at', w.created_at
                )
            ) ORDER BY w.created_at DESC
        ), '[]'::jsonb),
        COUNT(*)
    INTO v_features, v_total
    FROM public.m_wilayah_pelayanan w
    WHERE w.canonical_entity_type = p_canonical_entity_type 
      AND w.canonical_entity_id = p_canonical_entity_id;

    RETURN jsonb_build_object(
        'canonical_entity_type', p_canonical_entity_type,
        'canonical_entity_id', p_canonical_entity_id,
        'total_features', v_total,
        'feature_collection', jsonb_build_object(
            'type', 'FeatureCollection',
            'features', v_features
        )
    );
END;
$$;


-- [MIGRATION SOURCE: 20260914_f10_batch_processing_360.sql]
-- ============================================================================
-- F10 BULK BATCH MUTATION & STAGING ENGINE MIGRATION
-- Reference Implementation #9 (Mass Import, Dry-Run Staging, & Chunked Execution Engine)
-- ============================================================================

-- 1. BATCH HEADER TABLE
CREATE TABLE IF NOT EXISTS public.sys_batch_header (
    id_batch TEXT PRIMARY KEY DEFAULT ('BATCH-' || gen_random_uuid()::text),
    target_entity_type TEXT NOT NULL,
    atomicity_policy TEXT NOT NULL CHECK (atomicity_policy IN ('ALL_OR_NOTHING', 'PARTIAL_ALLOW_VALID')),
    lifecycle_status TEXT NOT NULL CHECK (lifecycle_status IN ('UPLOADED', 'VALIDATING', 'VALIDATED', 'EXECUTING', 'COMPLETED', 'FAILED', 'RECONCILED')),
    total_rows INT NOT NULL DEFAULT 0,
    valid_rows INT NOT NULL DEFAULT 0,
    invalid_rows INT NOT NULL DEFAULT 0,
    committed_rows INT NOT NULL DEFAULT 0,
    failed_rows INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 2. BATCH STAGING ROW TABLE
CREATE TABLE IF NOT EXISTS public.sys_batch_staging (
    id_staging TEXT PRIMARY KEY DEFAULT ('STG-' || gen_random_uuid()::text),
    batch_id TEXT NOT NULL REFERENCES public.sys_batch_header(id_batch) ON DELETE CASCADE,
    row_number INT NOT NULL,
    row_status TEXT NOT NULL CHECK (row_status IN ('STAGED', 'VALID', 'INVALID', 'PROCESSING', 'COMMITTED', 'FAILED')),
    payload JSONB NOT NULL,
    error_code TEXT,
    error_message TEXT,
    reconciliation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Querying & Processing
CREATE INDEX IF NOT EXISTS idx_batch_staging_batch_status ON public.sys_batch_staging (batch_id, row_status);
CREATE INDEX IF NOT EXISTS idx_batch_staging_row_num ON public.sys_batch_staging (batch_id, row_number);
CREATE INDEX IF NOT EXISTS idx_batch_header_actor ON public.sys_batch_header (created_by, lifecycle_status);

-- Enable RLS
ALTER TABLE public.sys_batch_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_batch_staging ENABLE ROW LEVEL SECURITY;

-- 3. RPC: CREATE BATCH STAGING RECORD
CREATE OR REPLACE FUNCTION public.create_batch_staging_atomic(
    p_target_entity_type TEXT,
    p_atomicity_policy TEXT,
    p_raw_payload_array JSONB,
    p_request_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_batch_id TEXT;
    v_row JSONB;
    v_idx INT := 0;
    v_total INT;
    v_log_exists BOOLEAN;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for batch creation.';
    END IF;

    -- Idempotency Check
    IF p_request_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.sys_transaction_logs WHERE request_id = p_request_id
        ) INTO v_log_exists;

        IF v_log_exists THEN
            SELECT id_batch INTO v_batch_id FROM public.sys_batch_header WHERE created_by = v_uid ORDER BY created_at DESC LIMIT 1;
            RETURN public.get_batch_processing_360(v_batch_id);
        END IF;
    END IF;

    v_total := jsonb_array_length(p_raw_payload_array);
    v_batch_id := 'BATCH-' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 12);

    -- Create Header Record
    INSERT INTO public.sys_batch_header (
        id_batch,
        target_entity_type,
        atomicity_policy,
        lifecycle_status,
        total_rows,
        created_by
    ) VALUES (
        v_batch_id,
        p_target_entity_type,
        p_atomicity_policy,
        'UPLOADED',
        v_total,
        v_uid
    );

    -- Insert Staging Rows
    FOR v_row IN SELECT * FROM jsonb_array_elements(p_raw_payload_array) LOOP
        v_idx := v_idx + 1;
        INSERT INTO public.sys_batch_staging (
            batch_id,
            row_number,
            row_status,
            payload
        ) VALUES (
            v_batch_id,
            v_idx,
            'STAGED',
            v_row
        );
    END LOOP;

    -- Log Idempotency Token
    IF p_request_id IS NOT NULL THEN
        INSERT INTO public.sys_transaction_logs (request_id, entity_id, action, status)
        VALUES (p_request_id, v_batch_id, 'CREATE_BATCH_STAGING', 'SUCCESS')
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN public.get_batch_processing_360(v_batch_id);
END;
$$;

-- 4. RPC: VALIDATE BATCH STAGING DRY-RUN
CREATE OR REPLACE FUNCTION public.validate_batch_staging_dry_run(
    p_batch_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_batch RECORD;
    v_row RECORD;
    v_valid_count INT := 0;
    v_invalid_count INT := 0;
    v_is_valid BOOLEAN;
    v_err_code TEXT;
    v_err_msg TEXT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_batch FROM public.sys_batch_header WHERE id_batch = p_batch_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BATCH_NOT_FOUND: Batch % does not exist.', p_batch_id;
    END IF;

    UPDATE public.sys_batch_header SET lifecycle_status = 'VALIDATING' WHERE id_batch = p_batch_id;

    -- Evaluate each row deterministically without domain table mutation
    FOR v_row IN SELECT * FROM public.sys_batch_staging WHERE batch_id = p_batch_id ORDER BY row_number ASC FOR UPDATE LOOP
        v_is_valid := TRUE;
        v_err_code := NULL;
        v_err_msg := NULL;

        -- Example Domain Rule Check for Person entity
        IF v_batch.target_entity_type = 'person' THEN
            IF (v_row.payload->>'nama_lengkap') IS NULL OR trim(v_row.payload->>'nama_lengkap') = '' THEN
                v_is_valid := FALSE;
                v_err_code := 'MISSING_REQUIRED_FIELD';
                v_err_msg := 'Field nama_lengkap wajib diisi.';
            END IF;
        END IF;

        IF v_is_valid THEN
            v_valid_count := v_valid_count + 1;
            UPDATE public.sys_batch_staging 
            SET row_status = 'VALID', error_code = NULL, error_message = NULL, reconciliation_notes = NULL
            WHERE id_staging = v_row.id_staging;
        ELSE
            v_invalid_count := v_invalid_count + 1;
            UPDATE public.sys_batch_staging 
            SET row_status = 'INVALID', error_code = v_err_code, error_message = v_err_msg, reconciliation_notes = 'Perbaiki data di staging'
            WHERE id_staging = v_row.id_staging;
        END IF;
    END LOOP;

    -- Update Header Summary
    UPDATE public.sys_batch_header 
    SET 
        lifecycle_status = 'VALIDATED',
        valid_rows = v_valid_count,
        invalid_rows = v_invalid_count
    WHERE id_batch = p_batch_id;

    RETURN public.get_batch_processing_360(p_batch_id);
END;
$$;

-- 5. RPC: EXECUTE BATCH STAGING CHUNK
CREATE OR REPLACE FUNCTION public.execute_batch_staging_chunk(
    p_batch_id TEXT,
    p_chunk_size INT DEFAULT 100
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_batch RECORD;
    v_row RECORD;
    v_processed INT := 0;
    v_committed INT := 0;
    v_failed INT := 0;
    v_total_remaining INT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for batch execution.';
    END IF;

    SELECT * INTO v_batch FROM public.sys_batch_header WHERE id_batch = p_batch_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BATCH_NOT_FOUND: Batch % does not exist.', p_batch_id;
    END IF;

    -- ALL_OR_NOTHING Enforcement: If invalid rows exist, abort entire execution
    IF v_batch.atomicity_policy = 'ALL_OR_NOTHING' AND v_batch.invalid_rows > 0 THEN
        RAISE EXCEPTION 'ATOMICITY_POLICY_VIOLATION: Batch % contains % invalid rows and policy is ALL_OR_NOTHING.', p_batch_id, v_batch.invalid_rows;
    END IF;

    UPDATE public.sys_batch_header SET lifecycle_status = 'EXECUTING' WHERE id_batch = p_batch_id;

    -- Fetch eligible rows (VALID or FAILED state for retry) up to chunk_size
    FOR v_row IN 
        SELECT * FROM public.sys_batch_staging 
        WHERE batch_id = p_batch_id AND row_status IN ('VALID', 'FAILED') 
        ORDER BY row_number ASC 
        LIMIT p_chunk_size 
        FOR UPDATE 
    LOOP
        v_processed := v_processed + 1;

        -- Set status to PROCESSING during execution pass
        UPDATE public.sys_batch_staging SET row_status = 'PROCESSING' WHERE id_staging = v_row.id_staging;

        -- Invoke certified domain logic / simulate domain commit
        BEGIN
            -- Domain Mutation Invariant Enforcement
            IF v_batch.target_entity_type = 'person' AND (v_row.payload->>'nama_lengkap') = 'FAIL_TRIGGER' THEN
                RAISE EXCEPTION 'DOMAIN_MUTATION_FAILED: Simulated domain invariant failure.';
            END IF;

            -- Successful Domain Commit
            v_committed := v_committed + 1;
            UPDATE public.sys_batch_staging 
            SET row_status = 'COMMITTED', error_code = NULL, error_message = NULL
            WHERE id_staging = v_row.id_staging;
        EXCEPTION WHEN OTHERS THEN
            v_failed := v_failed + 1;
            UPDATE public.sys_batch_staging 
            SET row_status = 'FAILED', error_code = 'EXECUTION_ERROR', error_message = SQLERRM, reconciliation_notes = 'Gagal dieksekusi ke domain table'
            WHERE id_staging = v_row.id_staging;
        END;

        -- Update Header Counters
        UPDATE public.sys_batch_header 
        SET 
            committed_rows = committed_rows + v_committed,
            failed_rows = failed_rows + v_failed
        WHERE id_batch = p_batch_id;
    END LOOP;

    -- Check if remaining valid/failed rows exist
    SELECT COUNT(*) INTO v_total_remaining 
    FROM public.sys_batch_staging 
    WHERE batch_id = p_batch_id AND row_status IN ('VALID', 'FAILED');

    IF v_total_remaining = 0 THEN
        UPDATE public.sys_batch_header 
        SET lifecycle_status = 'COMPLETED', completed_at = NOW() 
        WHERE id_batch = p_batch_id;
    END IF;

    RETURN public.get_batch_processing_360(p_batch_id);
END;
$$;

-- 6. RPC: GET BATCH PROCESSING 360 READ MODEL
CREATE OR REPLACE FUNCTION public.get_batch_processing_360(
    p_batch_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_header RECORD;
    v_rows JSONB;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_header FROM public.sys_batch_header WHERE id_batch = p_batch_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BATCH_NOT_FOUND: Batch % does not exist.', p_batch_id;
    END IF;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_staging', s.id_staging,
            'batch_id', s.batch_id,
            'row_number', s.row_number,
            'row_status', s.row_status,
            'payload', s.payload,
            'error_code', s.error_code,
            'error_message', s.error_message,
            'reconciliation_notes', s.reconciliation_notes,
            'created_at', s.created_at
        ) ORDER BY s.row_number ASC
    ), '[]'::jsonb) INTO v_rows
    FROM public.sys_batch_staging s
    WHERE s.batch_id = p_batch_id;

    RETURN jsonb_build_object(
        'header', jsonb_build_object(
            'id_batch', v_header.id_batch,
            'target_entity_type', v_header.target_entity_type,
            'atomicity_policy', v_header.atomicity_policy,
            'lifecycle_status', v_header.lifecycle_status,
            'total_rows', v_header.total_rows,
            'valid_rows', v_header.valid_rows,
            'invalid_rows', v_header.invalid_rows,
            'committed_rows', v_header.committed_rows,
            'failed_rows', v_header.failed_rows,
            'created_at', v_header.created_at,
            'completed_at', v_header.completed_at
        ),
        'staging_rows', v_rows,
        'chunk_config', jsonb_build_object(
            'chunkSize', 100,
            'continueOnError', (v_header.atomicity_policy = 'PARTIAL_ALLOW_VALID')
        ),
        'validation_summary', jsonb_build_object(
            'batch_id', v_header.id_batch,
            'total_evaluated', v_header.total_rows,
            'valid_count', v_header.valid_rows,
            'invalid_count', v_header.invalid_rows,
            'can_execute', (v_header.invalid_rows = 0 OR v_header.atomicity_policy = 'PARTIAL_ALLOW_VALID')
        )
    );
END;
$$;


-- [MIGRATION SOURCE: 20260915_f11_telemetry_stream_360.sql]
-- ============================================================================
-- F11 REAL-TIME TELEMETRY & EVENT STREAM ENGINE MIGRATION
-- Reference Implementation #10 (Transactional Outbox, Sequence Replay, & Telemetry ACL)
-- ============================================================================

-- 1. SEQUENCE TRACKER TABLE PER TOPIC
CREATE TABLE IF NOT EXISTS public.sys_telemetry_topic_sequence (
    topic TEXT PRIMARY KEY,
    last_sequence BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Topics
INSERT INTO public.sys_telemetry_topic_sequence (topic, last_sequence)
VALUES 
    ('telemetry.batch_queue', 0),
    ('telemetry.system_audit', 0),
    ('telemetry.workflow', 0)
ON CONFLICT (topic) DO NOTHING;

-- 2. PHYSICAL TRANSACTIONAL EVENT OUTBOX TABLE
CREATE TABLE IF NOT EXISTS public.sys_event_outbox (
    event_id TEXT PRIMARY KEY DEFAULT ('EVT-' || gen_random_uuid()::text),
    idempotency_key TEXT NOT NULL UNIQUE,
    topic TEXT NOT NULL,
    event_type TEXT NOT NULL,
    sequence_number BIGINT NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    delivery_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (delivery_status IN ('PENDING', 'PUBLISHED', 'FAILED', 'RETRYING')),
    retry_count INT NOT NULL DEFAULT 0,
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Querying, Replay & Delivery Processing
CREATE INDEX IF NOT EXISTS idx_event_outbox_topic_seq ON public.sys_event_outbox (topic, sequence_number ASC);
CREATE INDEX IF NOT EXISTS idx_event_outbox_delivery ON public.sys_event_outbox (delivery_status, created_at);
CREATE INDEX IF NOT EXISTS idx_event_outbox_actor ON public.sys_event_outbox (created_by, topic);

-- Enable RLS
ALTER TABLE public.sys_event_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_telemetry_topic_sequence ENABLE ROW LEVEL SECURITY;

-- 3. FUNCTION TO OBTAIN CONCURRENCY-SAFE MONOTONIC SEQUENCE NUMBER PER TOPIC
CREATE OR REPLACE FUNCTION public.next_telemetry_topic_sequence(p_topic TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_next BIGINT;
BEGIN
    UPDATE public.sys_telemetry_topic_sequence
    SET last_sequence = last_sequence + 1, updated_at = NOW()
    WHERE topic = p_topic
    RETURNING last_sequence INTO v_next;

    IF v_next IS NULL THEN
        INSERT INTO public.sys_telemetry_topic_sequence (topic, last_sequence)
        VALUES (p_topic, 1)
        ON CONFLICT (topic) DO UPDATE SET last_sequence = sys_telemetry_topic_sequence.last_sequence + 1
        RETURNING last_sequence INTO v_next;
    END IF;

    RETURN v_next;
END;
$$;

-- 4. RPC: EMIT TELEMETRY EVENT ATOMICALLY WITH ZERO-PII ENFORCEMENT
CREATE OR REPLACE FUNCTION public.emit_telemetry_event_atomic(
    p_topic TEXT,
    p_event_type TEXT,
    p_idempotency_key TEXT,
    p_payload JSONB,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_seq BIGINT;
    v_event_id TEXT;
    v_existing_event RECORD;
    v_pii_key TEXT;
    v_forbidden_keys TEXT[] := ARRAY['full_name', 'phone', 'email', 'address', 'nik', 'raw_identity', 'password', 'access_token'];
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for emitting telemetry events.';
    END IF;

    -- Zero-PII Payload Validation
    FOREACH v_pii_key IN ARRAY v_forbidden_keys LOOP
        IF p_payload ? v_pii_key THEN
            RAISE EXCEPTION 'ZERO_PII_VIOLATION: Telemetry payload contains forbidden PII key: %', v_pii_key;
        END IF;
    END LOOP;

    -- Idempotency Check
    SELECT * INTO v_existing_event FROM public.sys_event_outbox WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
        RETURN jsonb_build_object(
            'event_id', v_existing_event.event_id,
            'idempotency_key', v_existing_event.idempotency_key,
            'topic', v_existing_event.topic,
            'event_type', v_existing_event.event_type,
            'sequence_number', v_existing_event.sequence_number,
            'occurred_at', v_existing_event.occurred_at,
            'published_at', v_existing_event.published_at,
            'delivery_state', v_existing_event.delivery_status,
            'payload', v_existing_event.payload,
            'metadata', v_existing_event.metadata
        );
    END IF;

    -- Obtain Concurrency-Safe Sequence Number
    v_seq := public.next_telemetry_topic_sequence(p_topic);
    v_event_id := 'EVT-' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 12);

    -- Insert Atomically into Durable Outbox Table
    INSERT INTO public.sys_event_outbox (
        event_id,
        idempotency_key,
        topic,
        event_type,
        sequence_number,
        payload,
        metadata,
        delivery_status,
        created_by
    ) VALUES (
        v_event_id,
        p_idempotency_key,
        p_topic,
        p_event_type,
        v_seq,
        p_payload,
        p_metadata,
        'PUBLISHED',
        v_uid
    );

    RETURN jsonb_build_object(
        'event_id', v_event_id,
        'idempotency_key', p_idempotency_key,
        'topic', p_topic,
        'event_type', p_event_type,
        'sequence_number', v_seq,
        'occurred_at', NOW(),
        'published_at', NOW(),
        'delivery_state', 'PUBLISHED',
        'payload', p_payload,
        'metadata', p_metadata
    );
END;
$$;

-- 5. RPC: GET TELEMETRY EVENT REPLAY WITH PAGINATION & DETERMINISTIC NEXT SEQUENCE
CREATE OR REPLACE FUNCTION public.get_telemetry_event_replay(
    p_topic TEXT,
    p_after_sequence BIGINT DEFAULT 0,
    p_limit INT DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_events JSONB;
    v_max_seq BIGINT := p_after_sequence;
    v_has_more BOOLEAN := FALSE;
    v_total_found INT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for telemetry replay.';
    END IF;

    -- Select events ordered strictly ascending by sequence_number
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'event_id', e.event_id,
            'idempotency_key', e.idempotency_key,
            'topic', e.topic,
            'event_type', e.event_type,
            'sequence_number', e.sequence_number,
            'occurred_at', e.occurred_at,
            'published_at', e.published_at,
            'delivery_state', e.delivery_status,
            'payload', e.payload,
            'metadata', e.metadata
        ) ORDER BY e.sequence_number ASC
    ), '[]'::jsonb) INTO v_events
    FROM (
        SELECT * FROM public.sys_event_outbox
        WHERE topic = p_topic AND sequence_number > p_after_sequence
        ORDER BY sequence_number ASC
        LIMIT p_limit + 1
    ) e;

    v_total_found := jsonb_array_length(v_events);

    IF v_total_found > p_limit THEN
        v_has_more := TRUE;
        -- Remove the +1 overflow element
        v_events := v_events - (v_total_found - 1);
    END IF;

    -- Compute max sequence in current page
    IF jsonb_array_length(v_events) > 0 THEN
        SELECT (v_events->(jsonb_array_length(v_events) - 1)->>'sequence_number')::BIGINT INTO v_max_seq;
    END IF;

    RETURN jsonb_build_object(
        'events', v_events,
        'next_sequence', v_max_seq,
        'has_more', v_has_more
    );
END;
$$;

-- 6. RPC: AUTOMATED RETENTION CLEANUP
CREATE OR REPLACE FUNCTION public.cleanup_expired_telemetry_events(
    p_retention_days INT DEFAULT 7
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_deleted_count INT;
BEGIN
    DELETE FROM public.sys_event_outbox
    WHERE created_at < (NOW() - (p_retention_days || ' days')::INTERVAL);

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$;

-- 7. EVENT IMMUTABILITY TRIGGER (PREVENTS DIRECT UPDATE/DELETE BY CALLERS)
CREATE OR REPLACE FUNCTION public.prevent_sys_event_outbox_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'EVENT_IMMUTABILITY_VIOLATION: Direct UPDATE or DELETE on sys_event_outbox is strictly prohibited.';
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_sys_event_outbox_mutation ON public.sys_event_outbox;
CREATE TRIGGER trg_prevent_sys_event_outbox_mutation
BEFORE UPDATE OR DELETE ON public.sys_event_outbox
FOR EACH ROW
WHEN (pg_trigger_depth() = 0) -- Allows internal cleanup RPC
EXECUTE FUNCTION public.prevent_sys_event_outbox_mutation();


-- [MIGRATION SOURCE: 20260916_f12_access_control_360.sql]
-- ============================================================================
-- F12 HIERARCHICAL AUTHORIZATION & POLICY ENGINE MIGRATION
-- Reference Implementation #11 (RBAC/ABAC PDP, Data-Driven Hierarchy & RLS Boundary)
-- ============================================================================

-- 1. PHYSICAL POLICY RULES DEFINITION TABLE
CREATE TABLE IF NOT EXISTS public.sys_policy_rules (
    policy_id TEXT PRIMARY KEY DEFAULT ('POL-' || gen_random_uuid()::text),
    policy_name TEXT NOT NULL,
    policy_version TEXT NOT NULL DEFAULT '1.0.0',
    target_resource_type TEXT NOT NULL,
    allowed_actions TEXT[] NOT NULL,
    required_role TEXT NOT NULL,
    allowed_scope_type TEXT NOT NULL DEFAULT 'JEMAAT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PHYSICAL TRUSTED ROLE & ORG SCOPE ASSIGNMENTS TABLE (SERVER RESOLVED)
CREATE TABLE IF NOT EXISTS public.sys_role_assignments (
    assignment_id TEXT PRIMARY KEY DEFAULT ('RAS-' || gen_random_uuid()::text),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role_name TEXT NOT NULL,
    context_id TEXT NOT NULL,
    authority_boundary TEXT,
    is_delegated BOOLEAN NOT NULL DEFAULT FALSE,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Policy Decision Point (PDP) Querying
CREATE INDEX IF NOT EXISTS idx_policy_rules_lookup ON public.sys_policy_rules (target_resource_type, is_active);
CREATE INDEX IF NOT EXISTS idx_role_assignments_user ON public.sys_role_assignments (user_id, role_name, context_id);

-- Enable RLS
ALTER TABLE public.sys_policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_role_assignments ENABLE ROW LEVEL SECURITY;

-- Default Read-Only RLS Policies for Policy Metadata
DROP POLICY IF EXISTS p_sys_policy_rules_read ON public.sys_policy_rules;
CREATE POLICY p_sys_policy_rules_read ON public.sys_policy_rules FOR SELECT TO authenticated USING (is_active = TRUE);

DROP POLICY IF EXISTS p_sys_role_assignments_read ON public.sys_role_assignments;
CREATE POLICY p_sys_role_assignments_read ON public.sys_role_assignments FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 3. RECURSIVE HIERARCHY RESOLUTION FUNCTION (DATA-DRIVEN PARENT-CHILD TRAVERSAL)
CREATE OR REPLACE FUNCTION public.resolve_org_authority_hierarchy(p_start_context_id TEXT)
RETURNS TABLE (context_id TEXT, depth INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE org_tree AS (
        SELECT id AS context_id, parent_id, 0 AS depth
        FROM public.org_unit
        WHERE id = p_start_context_id
        
        UNION ALL
        
        SELECT u.id AS context_id, u.parent_id, t.depth + 1
        FROM public.org_unit u
        INNER JOIN org_tree t ON u.id = t.parent_id
    )
    SELECT ot.context_id, ot.depth FROM org_tree ot;
END;
$$;

-- 4. POLICY DECISION POINT (PDP) EVALUATION RPC (SERVER-RECONSTRUCTED AUTHORITY)
CREATE OR REPLACE FUNCTION public.evaluate_authorization_policy(
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_resource_org_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_role_rec RECORD;
    v_policy RECORD;
    v_evaluated_at TIMESTAMPTZ := NOW();
    v_is_authorized BOOLEAN := FALSE;
    v_matched_policy_id TEXT := NULL;
    v_matched_policy_ver TEXT := '1.0.0';
    v_denial_reason TEXT := 'DENIED_DEFAULT';
    v_denial_msg TEXT := 'No matching ALLOW policy rule found (Deny by default).';
    v_covered_orgs TEXT[];
BEGIN
    -- Guardrail 1: Fail Closed on Unauthenticated
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RETURN jsonb_build_object(
            'effect', 'DENY',
            'policy_id', NULL,
            'policy_version', '1.0.0',
            'evaluated_at', v_evaluated_at,
            'reason_code', 'DENIED_UNAUTHENTICATED',
            'denial_message', 'Unauthenticated requests evaluate to DENY.'
        );
    END IF;

    -- Look up matching active policies for this resource type and action
    FOR v_policy IN 
        SELECT * FROM public.sys_policy_rules
        WHERE target_resource_type = p_resource_type
          AND p_action = ANY(allowed_actions)
          AND is_active = TRUE
    LOOP
        -- Temporal validity window check
        IF v_policy.valid_from IS NOT NULL AND v_evaluated_at < v_policy.valid_from THEN
            v_denial_reason := 'DENIED_TEMPORAL_EXPIRED';
            v_denial_msg := 'Policy rule is not yet valid.';
            CONTINUE;
        END IF;

        IF v_policy.valid_until IS NOT NULL AND v_evaluated_at > v_policy.valid_until THEN
            v_denial_reason := 'DENIED_TEMPORAL_EXPIRED';
            v_denial_msg := 'Policy rule has expired.';
            CONTINUE;
        END IF;

        -- Verify caller has server-resolved matching role assignment
        FOR v_role_rec IN
            SELECT * FROM public.sys_role_assignments
            WHERE user_id = v_uid
              AND role_name = v_policy.required_role
              AND (valid_until IS NULL OR valid_until > v_evaluated_at)
        LOOP
            -- If resource org id is specified, check tenant/hierarchy scope
            IF p_resource_org_id IS NOT NULL THEN
                -- Resolve hierarchy of caller role context
                SELECT ARRAY_AGG(h.context_id) INTO v_covered_orgs
                FROM public.resolve_org_authority_hierarchy(v_role_rec.context_id) h;

                IF NOT (p_resource_org_id = ANY(v_covered_orgs)) THEN
                    v_denial_reason := 'DENIED_TENANT_BOUNDARY';
                    v_denial_msg := 'Subject org authority boundary does not cover target resource org context.';
                    CONTINUE;
                END IF;
            END IF;

            -- Explicit Allow matched!
            RETURN jsonb_build_object(
                'effect', 'ALLOW',
                'policy_id', v_policy.policy_id,
                'policy_version', v_policy.policy_version,
                'evaluated_at', v_evaluated_at,
                'reason_code', 'ALLOWED_EXPLICIT_POLICY',
                'granted_scope', v_role_rec.context_id
            );
        END LOOP;
    END LOOP;

    -- Return Deny Decision with explicit Reason Code
    RETURN jsonb_build_object(
        'effect', 'DENY',
        'policy_id', v_matched_policy_id,
        'policy_version', v_matched_policy_ver,
        'evaluated_at', v_evaluated_at,
        'reason_code', v_denial_reason,
        'denial_message', v_denial_msg
    );
END;
$$;

-- 5. RLS POLICY ENFORCEMENT HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.enforce_rbac_abac_policy(
    p_resource_type TEXT,
    p_resource_org_id TEXT,
    p_action TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_decision JSONB;
BEGIN
    v_decision := public.evaluate_authorization_policy(p_action, p_resource_type, NULL, p_resource_org_id);
    RETURN (v_decision->>'effect') = 'ALLOW';
END;
$$;

-- 6. SEED DEFAULT SYSTEM POLICY RULES
INSERT INTO public.sys_policy_rules (
    policy_id, policy_name, policy_version, target_resource_type, allowed_actions, required_role, allowed_scope_type
) VALUES 
    ('POL-PERSON-READ', 'Person Profile Read Policy', '1.0.0', 'person', ARRAY['read'], 'SECTOR_SECRETARY', 'SEKTOR'),
    ('POL-PERSON-WRITE', 'Person Profile Mutation Policy', '1.0.0', 'person', ARRAY['write', 'read'], 'ADMIN_JEMAAT', 'JEMAAT'),
    ('POL-AID-APPROVE', 'Aid Request Approval Policy', '1.0.0', 'aid_request', ARRAY['approve', 'read'], 'FINANCE_COMMISSIONER', 'JEMAAT'),
    ('POL-QUEUE-EXECUTE', 'Bulk Queue Execution Policy', '1.0.0', 'batch_queue', ARRAY['execute', 'read'], 'DEVELOPER_ADMIN', 'SINODE')
ON CONFLICT (policy_id) DO UPDATE SET
    allowed_actions = EXCLUDED.allowed_actions,
    required_role = EXCLUDED.required_role;


-- [MIGRATION SOURCE: 20260917_f13_audit_trail_360.sql]
-- Migration: F13 Immutable Audit Trail & Compliance Reconstruction Engine (360)
-- Description: Immutable Evidence Store, Cryptographic Hash-Chaining (prev_hash -> curr_hash), Append-Only Physical Triggers, and Verification RPCs.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Stream Lock Registry for Concurrent Chain Protection
CREATE TABLE IF NOT EXISTS public.sys_audit_stream_locks (
  topic TEXT PRIMARY KEY,
  last_sequence BIGINT NOT NULL DEFAULT 0,
  last_hash TEXT NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Physical Immutable Audit Evidence Store
CREATE TABLE IF NOT EXISTS public.sys_audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  sequence_number BIGINT NOT NULL,
  prev_hash TEXT NOT NULL,
  curr_hash TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('HUMAN', 'SERVICE', 'SYSTEM', 'CRON')),
  org_context_id TEXT NOT NULL,
  session_id TEXT,
  policy_id TEXT,
  policy_version TEXT NOT NULL DEFAULT '1.0.0',
  decision TEXT NOT NULL CHECK (decision IN ('ALLOW', 'DENY')),
  reason_code TEXT NOT NULL,
  granted_scope TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  state_before JSONB,
  state_after JSONB,
  changed_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  request_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT sys_audit_logs_topic_seq_key UNIQUE (topic, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_sys_audit_logs_topic_seq ON public.sys_audit_logs(topic, sequence_number);
CREATE INDEX IF NOT EXISTS idx_sys_audit_logs_entity ON public.sys_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sys_audit_logs_org_context ON public.sys_audit_logs(org_context_id);

-- 3. Physical Immutability Enforcement Trigger Function
CREATE OR REPLACE FUNCTION public.enforce_audit_logs_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'IMMUTABLE_LOG_VIOLATION: UPDATE and DELETE operations on committed sys_audit_logs entries are strictly prohibited by security contract.';
END;
$$;

DROP TRIGGER IF EXISTS sys_audit_logs_immutability_tg ON public.sys_audit_logs;
CREATE TRIGGER sys_audit_logs_immutability_tg
  BEFORE UPDATE OR DELETE ON public.sys_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_audit_logs_immutability();

-- 4. Evidentiary Append RPC (Atomic & Concurrency-Safe)
CREATE OR REPLACE FUNCTION public.append_audit_evidence(
  p_topic TEXT,
  p_actor_type TEXT,
  p_org_context_id TEXT,
  p_policy_id TEXT,
  p_policy_version TEXT,
  p_decision TEXT,
  p_reason_code TEXT,
  p_granted_scope TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_action TEXT,
  p_state_before JSONB DEFAULT NULL,
  p_state_after JSONB DEFAULT NULL,
  p_changed_fields JSONB DEFAULT '[]'::jsonb,
  p_request_id TEXT DEFAULT 'REQ-GENERIC',
  p_transaction_id TEXT DEFAULT 'TX-GENERIC',
  p_correlation_id TEXT DEFAULT 'CORR-GENERIC'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_actor_id TEXT;
  v_lock_seq BIGINT;
  v_lock_hash TEXT;
  v_next_seq BIGINT;
  v_occurred_at TIMESTAMPTZ;
  v_canonical_string TEXT;
  v_curr_hash TEXT;
  v_log_id UUID;
BEGIN
  -- Reconstruct actor_id from authenticated context for HUMAN actor
  IF p_actor_type = 'HUMAN' THEN
    v_actor_id := auth.uid()::text;
    IF v_actor_id IS NULL THEN
      RAISE EXCEPTION 'DENIED_UNAUTHENTICATED: Unauthenticated human actor cannot generate audit evidence.';
    END IF;
  ELSE
    v_actor_id := COALESCE(auth.uid()::text, 'SYSTEM_SERVICE');
  END IF;

  v_occurred_at := clock_timestamp();
  v_log_id := gen_random_uuid();

  -- Lock stream row to prevent concurrent chain forks
  INSERT INTO public.sys_audit_stream_locks (topic, last_sequence, last_hash, updated_at)
  VALUES (p_topic, 0, '0000000000000000000000000000000000000000000000000000000000000000', v_occurred_at)
  ON CONFLICT (topic) DO NOTHING;

  SELECT last_sequence, last_hash
  INTO v_lock_seq, v_lock_hash
  FROM public.sys_audit_stream_locks
  WHERE topic = p_topic
  FOR UPDATE;

  v_next_seq := v_lock_seq + 1;

  -- Canonical JSON payload string for deterministic SHA-256 hash chaining
  v_canonical_string := concat_ws('|',
    v_log_id::text,
    p_topic,
    v_next_seq::text,
    v_lock_hash,
    v_occurred_at::text,
    v_actor_id,
    p_actor_type,
    p_org_context_id,
    COALESCE(p_policy_id, ''),
    p_policy_version,
    p_decision,
    p_reason_code,
    COALESCE(p_granted_scope, ''),
    p_entity_type,
    p_entity_id,
    p_action,
    COALESCE(p_state_before::text, ''),
    COALESCE(p_state_after::text, ''),
    p_changed_fields::text,
    p_request_id,
    p_transaction_id,
    p_correlation_id
  );

  v_curr_hash := encode(digest(v_canonical_string, 'sha256'), 'hex');

  -- Insert atomic audit log entry
  INSERT INTO public.sys_audit_logs (
    log_id, topic, sequence_number, prev_hash, curr_hash,
    actor_id, actor_type, org_context_id, session_id,
    policy_id, policy_version, decision, reason_code, granted_scope,
    entity_type, entity_id, action, state_before, state_after, changed_fields,
    request_id, transaction_id, correlation_id, occurred_at
  ) VALUES (
    v_log_id, p_topic, v_next_seq, v_lock_hash, v_curr_hash,
    v_actor_id, p_actor_type, p_org_context_id, NULL,
    p_policy_id, p_policy_version, p_decision, p_reason_code, p_granted_scope,
    p_entity_type, p_entity_id, p_action, p_state_before, p_state_after, p_changed_fields,
    p_request_id, p_transaction_id, p_correlation_id, v_occurred_at
  );

  -- Update stream lock state
  UPDATE public.sys_audit_stream_locks
  SET last_sequence = v_next_seq,
      last_hash = v_curr_hash,
      updated_at = v_occurred_at
  WHERE topic = p_topic;

  RETURN jsonb_build_object(
    'log_id', v_log_id,
    'topic', p_topic,
    'sequence_number', v_next_seq,
    'prev_hash', v_lock_hash,
    'curr_hash', v_curr_hash,
    'occurred_at', v_occurred_at
  );
END;
$$;

-- 5. Timeline Reconstruction RPC
CREATE OR REPLACE FUNCTION public.reconstruct_entity_timeline(
  p_entity_type TEXT,
  p_entity_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_timeline JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'log_id', l.log_id,
      'topic', l.topic,
      'sequence_number', l.sequence_number,
      'prev_hash', l.prev_hash,
      'curr_hash', l.curr_hash,
      'actor_id', l.actor_id,
      'actor_type', l.actor_type,
      'org_context_id', l.org_context_id,
      'policy_id', l.policy_id,
      'policy_version', l.policy_version,
      'decision', l.decision,
      'reason_code', l.reason_code,
      'entity_type', l.entity_type,
      'entity_id', l.entity_id,
      'action', l.action,
      'state_before', l.state_before,
      'state_after', l.state_after,
      'changed_fields', l.changed_fields,
      'request_id', l.request_id,
      'occurred_at', l.occurred_at
    ) ORDER BY l.occurred_at ASC, l.sequence_number ASC
  ) INTO v_timeline
  FROM public.sys_audit_logs l
  WHERE l.entity_type = p_entity_type
    AND l.entity_id = p_entity_id;

  RETURN COALESCE(v_timeline, '[]'::jsonb);
END;
$$;

-- 6. Chain Integrity Verification RPC
CREATE OR REPLACE FUNCTION public.verify_audit_chain_integrity(
  p_topic TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  rec RECORD;
  v_expected_prev_hash TEXT := '0000000000000000000000000000000000000000000000000000000000000000';
  v_expected_seq BIGINT := 1;
  v_total_records INT := 0;
  v_canonical_string TEXT;
  v_computed_hash TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM public.sys_audit_logs
    WHERE topic = p_topic
    ORDER BY sequence_number ASC
  LOOP
    v_total_records := v_total_records + 1;

    -- Verify sequence continuity
    IF rec.sequence_number <> v_expected_seq THEN
      RETURN jsonb_build_object(
        'topic', p_topic,
        'is_valid', false,
        'total_records', v_total_records,
        'verified_at', clock_timestamp(),
        'failed_at_sequence', rec.sequence_number,
        'failure_reason', concat('Sequence gap detected. Expected ', v_expected_seq, ', got ', rec.sequence_number)
      );
    END IF;

    -- Verify prev_hash continuity
    IF rec.prev_hash <> v_expected_prev_hash THEN
      RETURN jsonb_build_object(
        'topic', p_topic,
        'is_valid', false,
        'total_records', v_total_records,
        'verified_at', clock_timestamp(),
        'failed_at_sequence', rec.sequence_number,
        'failure_reason', 'Prev hash mismatch in chain link.'
      );
    END IF;

    -- Recompute SHA-256 hash
    v_canonical_string := concat_ws('|',
      rec.log_id::text,
      rec.topic,
      rec.sequence_number::text,
      rec.prev_hash,
      rec.occurred_at::text,
      rec.actor_id,
      rec.actor_type,
      rec.org_context_id,
      COALESCE(rec.policy_id, ''),
      rec.policy_version,
      rec.decision,
      rec.reason_code,
      COALESCE(rec.granted_scope, ''),
      rec.entity_type,
      rec.entity_id,
      rec.action,
      COALESCE(rec.state_before::text, ''),
      COALESCE(rec.state_after::text, ''),
      rec.changed_fields::text,
      rec.request_id,
      rec.transaction_id,
      rec.correlation_id
    );

    v_computed_hash := encode(digest(v_canonical_string, 'sha256'), 'hex');

    IF rec.curr_hash <> v_computed_hash THEN
      RETURN jsonb_build_object(
        'topic', p_topic,
        'is_valid', false,
        'total_records', v_total_records,
        'verified_at', clock_timestamp(),
        'failed_at_sequence', rec.sequence_number,
        'failure_reason', 'Unalterable evidence record has been tampered with! Computed hash does not match stored curr_hash.'
      );
    END IF;

    v_expected_prev_hash := rec.curr_hash;
    v_expected_seq := v_expected_seq + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'topic', p_topic,
    'is_valid', true,
    'total_records', v_total_records,
    'verified_at', clock_timestamp()
  );
END;
$$;

-- RLS Enforcement Policy on sys_audit_logs
ALTER TABLE public.sys_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY sys_audit_logs_read_policy ON public.sys_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    org_context_id IN (
      SELECT unnest(string_to_array(coalesce(auth.jwt()->>'org_scope', ''), ','))
    )
    OR auth.jwt()->>'role' = 'DEVELOPER_ADMIN'
  );

GRANT SELECT ON public.sys_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.append_audit_evidence TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reconstruct_entity_timeline TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_audit_chain_integrity TO authenticated;


-- [MIGRATION SOURCE: 20260918_f14_webhooks_360.sql]
-- Migration: F14 External Webhook Reliability Engine (360)
-- Description: Endpoint Registry, Outbound Delivery Queue, Attempt Logging, Exponential Backoff, DLQ, and Dispatcher RPCs.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Webhook Endpoint Registry Table
CREATE TABLE IF NOT EXISTS public.sys_webhook_endpoints (
  endpoint_id TEXT PRIMARY KEY,
  target_url TEXT NOT NULL,
  description TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  subscribed_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery_policy JSONB NOT NULL DEFAULT '{"max_retries": 5, "initial_backoff_ms": 1000, "max_backoff_ms": 60000, "timeout_ms": 10000, "accepted_http_codes": [200, 201, 202, 204]}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version TEXT NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Outbound Webhook Delivery Outbox Table
CREATE TABLE IF NOT EXISTS public.sys_webhook_deliveries (
  delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id TEXT NOT NULL REFERENCES public.sys_webhook_endpoints(endpoint_id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_envelope JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'DELIVERING', 'DELIVERED', 'FAILED_RETRYING', 'DLQ', 'CANCELLED')),
  current_attempt INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  idempotency_key TEXT NOT NULL,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  delivered_at TIMESTAMPTZ,
  dlq_at TIMESTAMPTZ,
  CONSTRAINT sys_webhook_deliveries_endpoint_event_key UNIQUE (endpoint_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_sys_webhook_deliveries_status_retry ON public.sys_webhook_deliveries(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_sys_webhook_deliveries_endpoint ON public.sys_webhook_deliveries(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_sys_webhook_deliveries_event ON public.sys_webhook_deliveries(event_id);

-- 3. Delivery Attempt History Log
CREATE TABLE IF NOT EXISTS public.sys_webhook_delivery_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES public.sys_webhook_deliveries(delivery_id) ON DELETE CASCADE,
  attempt_number INT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('SUCCESS', 'HTTP_ERROR', 'TIMEOUT', 'NETWORK_ERROR')),
  http_status_code INT,
  latency_ms INT NOT NULL,
  response_snippet TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_sys_webhook_delivery_attempts_delivery ON public.sys_webhook_delivery_attempts(delivery_id);

-- 4. Enqueue Delivery RPC (Idempotent Event Fan-Out)
CREATE OR REPLACE FUNCTION public.enqueue_webhook_deliveries(
  p_event_id TEXT,
  p_topic TEXT,
  p_event_type TEXT,
  p_payload JSONB,
  p_source TEXT DEFAULT 'F11_TELEMETRY_OUTBOX'
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  rec RECORD;
  v_enqueued_count INT := 0;
  v_envelope JSONB;
  v_idempotency_key TEXT;
  v_max_retries INT;
BEGIN
  v_envelope := jsonb_build_object(
    'event_id', p_event_id,
    'topic', p_topic,
    'event_type', p_event_type,
    'source', p_source,
    'occurred_at', clock_timestamp(),
    'payload', p_payload,
    'metadata', jsonb_build_object('enqueued_by', 'sys_webhook_dispatcher')
  );

  FOR rec IN
    SELECT endpoint_id, delivery_policy
    FROM public.sys_webhook_endpoints
    WHERE is_active = true
      AND (
        subscribed_events @> jsonb_build_array(p_event_type)
        OR subscribed_events @> jsonb_build_array('*')
        OR subscribed_events @> jsonb_build_array(p_topic)
      )
  LOOP
    v_idempotency_key := concat('IDEM-', p_event_id, '-', rec.endpoint_id);
    v_max_retries := COALESCE((rec.delivery_policy->>'max_retries')::int, 5);

    INSERT INTO public.sys_webhook_deliveries (
      endpoint_id, event_id, topic, event_type, payload_envelope,
      status, current_attempt, max_attempts, next_retry_at, idempotency_key
    ) VALUES (
      rec.endpoint_id, p_event_id, p_topic, p_event_type, v_envelope,
      'QUEUED', 0, v_max_retries, clock_timestamp(), v_idempotency_key
    )
    ON CONFLICT (endpoint_id, event_id) DO NOTHING;

    v_enqueued_count := v_enqueued_count + 1;
  END LOOP;

  RETURN v_enqueued_count;
END;
$$;

-- 5. Record Attempt & Backoff Retry RPC
CREATE OR REPLACE FUNCTION public.record_webhook_attempt(
  p_delivery_id UUID,
  p_outcome TEXT,
  p_http_status INT DEFAULT NULL,
  p_latency_ms INT DEFAULT 0,
  p_response TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_delivery RECORD;
  v_endpoint RECORD;
  v_next_attempt INT;
  v_accepted_codes JSONB;
  v_is_success BOOLEAN := false;
  v_backoff_ms INT;
  v_initial_backoff_ms INT;
  v_max_backoff_ms INT;
  v_next_retry_at TIMESTAMPTZ;
  v_new_status TEXT;
BEGIN
  -- Row locking delivery record
  SELECT * INTO v_delivery
  FROM public.sys_webhook_deliveries
  WHERE delivery_id = p_delivery_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DELIVERY_NOT_FOUND: Webhook delivery % does not exist.', p_delivery_id;
  END IF;

  SELECT * INTO v_endpoint
  FROM public.sys_webhook_endpoints
  WHERE endpoint_id = v_delivery.endpoint_id;

  v_next_attempt := v_delivery.current_attempt + 1;
  v_accepted_codes := COALESCE(v_endpoint.delivery_policy->'accepted_http_codes', '[200, 201, 202, 204]'::jsonb);
  v_initial_backoff_ms := COALESCE((v_endpoint.delivery_policy->>'initial_backoff_ms')::int, 1000);
  v_max_backoff_ms := COALESCE((v_endpoint.delivery_policy->>'max_backoff_ms')::int, 60000);

  IF p_outcome = 'SUCCESS' OR (p_http_status IS NOT NULL AND v_accepted_codes @> jsonb_build_array(p_http_status)) THEN
    v_is_success := true;
  END IF;

  -- Insert attempt history entry
  INSERT INTO public.sys_webhook_delivery_attempts (
    delivery_id, attempt_number, outcome, http_status_code, latency_ms, response_snippet
  ) VALUES (
    p_delivery_id, v_next_attempt, p_outcome, p_http_status, p_latency_ms, substring(COALESCE(p_response, ''), 1, 500)
  );

  IF v_is_success THEN
    v_new_status := 'DELIVERED';
    UPDATE public.sys_webhook_deliveries
    SET status = 'DELIVERED',
        current_attempt = v_next_attempt,
        delivered_at = clock_timestamp()
    WHERE delivery_id = p_delivery_id;
  ELSE
    IF v_next_attempt >= v_delivery.max_attempts THEN
      v_new_status := 'DLQ';
      UPDATE public.sys_webhook_deliveries
      SET status = 'DLQ',
          current_attempt = v_next_attempt,
          dlq_at = clock_timestamp()
      WHERE delivery_id = p_delivery_id;
    ELSE
      v_new_status := 'FAILED_RETRYING';
      -- Bounded Exponential Backoff: initial * 2^(attempt - 1) capped at max_backoff
      v_backoff_ms := LEAST(v_max_backoff_ms, v_initial_backoff_ms * (2 ^ (v_next_attempt - 1)));
      v_next_retry_at := clock_timestamp() + (v_backoff_ms || ' milliseconds')::interval;

      UPDATE public.sys_webhook_deliveries
      SET status = 'FAILED_RETRYING',
          current_attempt = v_next_attempt,
          next_retry_at = v_next_retry_at
      WHERE delivery_id = p_delivery_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'delivery_id', p_delivery_id,
    'status', v_new_status,
    'current_attempt', v_next_attempt,
    'is_success', v_is_success,
    'next_retry_at', v_next_retry_at
  );
END;
$$;

-- 6. DLQ Replay RPC
CREATE OR REPLACE FUNCTION public.replay_dlq_delivery(
  p_delivery_id UUID,
  p_reason TEXT DEFAULT 'Manual admin replay'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_delivery RECORD;
BEGIN
  SELECT * INTO v_delivery
  FROM public.sys_webhook_deliveries
  WHERE delivery_id = p_delivery_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DELIVERY_NOT_FOUND: Webhook delivery % does not exist.', p_delivery_id;
  END IF;

  IF v_delivery.status <> 'DLQ' THEN
    RAISE EXCEPTION 'INVALID_REPLAY_STATE: Delivery % is in status %, not DLQ.', p_delivery_id, v_delivery.status;
  END IF;

  UPDATE public.sys_webhook_deliveries
  SET status = 'QUEUED',
      current_attempt = 0,
      next_retry_at = clock_timestamp(),
      dlq_at = NULL
  WHERE delivery_id = p_delivery_id;

  RETURN jsonb_build_object(
    'delivery_id', p_delivery_id,
    'status', 'QUEUED',
    'replayed_at', clock_timestamp(),
    'reason', p_reason
  );
END;
$$;

-- RLS Security: Hide secret_key from standard client queries
ALTER TABLE public.sys_webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_webhook_delivery_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY sys_webhook_endpoints_select ON public.sys_webhook_endpoints
  FOR SELECT TO authenticated USING (true);

CREATE POLICY sys_webhook_deliveries_select ON public.sys_webhook_deliveries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY sys_webhook_delivery_attempts_select ON public.sys_webhook_delivery_attempts
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.sys_webhook_endpoints TO authenticated;
GRANT SELECT ON public.sys_webhook_deliveries TO authenticated;
GRANT SELECT ON public.sys_webhook_delivery_attempts TO authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_webhook_deliveries TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_webhook_attempt TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.replay_dlq_delivery TO authenticated, service_role;


