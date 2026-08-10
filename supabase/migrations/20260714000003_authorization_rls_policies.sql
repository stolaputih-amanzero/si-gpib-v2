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

