const fs = require('fs');
const path = require('path');

let sql = `-- Authorization RLS Policies

`;

// Pattern P1 (Context-Owned, Pos-level)
const p1Tables = [
  't_log_pastoral', 't_jadwal_ibadah', 't_aset_tanah', 't_aset_bangunan', 
  't_aset_bergerak', 't_pengajuan_bantuan', 't_demografi_pelkat', 
  't_kerawanan_wilayah', 't_potensi_wilayah', 't_pelayan', 't_relawan'
];

p1Tables.forEach(tb => {
  sql += `-- Pattern P1: ${tb}\n`;
  sql += `ALTER TABLE ${tb} ENABLE ROW LEVEL SECURITY;\n`;
  sql += `CREATE POLICY policy_pos_select_${tb} ON ${tb} FOR SELECT USING (is_descendant_pos(id_pos) OR has_global_scope());\n`;
  sql += `CREATE POLICY policy_pos_insert_${tb} ON ${tb} FOR INSERT WITH CHECK (id_pos = get_active_context_id());\n`;
  sql += `CREATE POLICY policy_pos_update_${tb} ON ${tb} FOR UPDATE USING (is_descendant_pos(id_pos) OR has_global_scope()) WITH CHECK (id_pos = get_active_context_id());\n`;
  sql += `CREATE POLICY policy_pos_delete_${tb} ON ${tb} FOR DELETE USING (is_descendant_pos(id_pos) OR has_global_scope());\n\n`;
});

// Pattern P1 via Parent Join
// t_lampiran_aset
sql += `-- Pattern P1 (Attachment): t_lampiran_aset\n`;
sql += `ALTER TABLE t_lampiran_aset ENABLE ROW LEVEL SECURITY;\n`;
const asetSel = `EXISTS (SELECT 1 FROM t_aset_tanah WHERE id_tanah = t_lampiran_aset.id_tanah AND is_descendant_pos(id_pos)) OR EXISTS (SELECT 1 FROM t_aset_bangunan WHERE id_bangunan = t_lampiran_aset.id_bangunan AND is_descendant_pos(id_pos)) OR EXISTS (SELECT 1 FROM t_aset_bergerak WHERE id_aset_b = t_lampiran_aset.id_aset_b AND is_descendant_pos(id_pos)) OR has_global_scope()`;
const asetIns = `EXISTS (SELECT 1 FROM t_aset_tanah WHERE id_tanah = t_lampiran_aset.id_tanah AND id_pos = get_active_context_id()) OR EXISTS (SELECT 1 FROM t_aset_bangunan WHERE id_bangunan = t_lampiran_aset.id_bangunan AND id_pos = get_active_context_id()) OR EXISTS (SELECT 1 FROM t_aset_bergerak WHERE id_aset_b = t_lampiran_aset.id_aset_b AND id_pos = get_active_context_id()) OR has_global_scope()`;
sql += `CREATE POLICY policy_select_t_lampiran_aset ON t_lampiran_aset FOR SELECT USING (${asetSel});\n`;
sql += `CREATE POLICY policy_insert_t_lampiran_aset ON t_lampiran_aset FOR INSERT WITH CHECK (${asetIns});\n`;
sql += `CREATE POLICY policy_update_t_lampiran_aset ON t_lampiran_aset FOR UPDATE USING (${asetSel}) WITH CHECK (${asetIns});\n`;
sql += `CREATE POLICY policy_delete_t_lampiran_aset ON t_lampiran_aset FOR DELETE USING (${asetSel});\n\n`;

// t_lampiran_kerawanan
sql += `-- Pattern P1 (Attachment): t_lampiran_kerawanan\n`;
sql += `ALTER TABLE t_lampiran_kerawanan ENABLE ROW LEVEL SECURITY;\n`;
const kSel = `EXISTS (SELECT 1 FROM t_kerawanan_wilayah k WHERE k.id_risiko = t_lampiran_kerawanan.id_risiko AND is_descendant_pos(k.id_pos)) OR has_global_scope()`;
const kIns = `EXISTS (SELECT 1 FROM t_kerawanan_wilayah k WHERE k.id_risiko = t_lampiran_kerawanan.id_risiko AND k.id_pos = get_active_context_id()) OR has_global_scope()`;
sql += `CREATE POLICY policy_select_t_lampiran_kerawanan ON t_lampiran_kerawanan FOR SELECT USING (${kSel});\n`;
sql += `CREATE POLICY policy_insert_t_lampiran_kerawanan ON t_lampiran_kerawanan FOR INSERT WITH CHECK (${kIns});\n`;
sql += `CREATE POLICY policy_update_t_lampiran_kerawanan ON t_lampiran_kerawanan FOR UPDATE USING (${kSel}) WITH CHECK (${kIns});\n`;
sql += `CREATE POLICY policy_delete_t_lampiran_kerawanan ON t_lampiran_kerawanan FOR DELETE USING (${kSel});\n\n`;

// t_lampiran_potensi
sql += `-- Pattern P1 (Attachment): t_lampiran_potensi\n`;
sql += `ALTER TABLE t_lampiran_potensi ENABLE ROW LEVEL SECURITY;\n`;
const pSel = `EXISTS (SELECT 1 FROM t_potensi_wilayah p WHERE p.id_potensi = t_lampiran_potensi.id_potensi AND is_descendant_pos(p.id_pos)) OR has_global_scope()`;
const pIns = `EXISTS (SELECT 1 FROM t_potensi_wilayah p WHERE p.id_potensi = t_lampiran_potensi.id_potensi AND p.id_pos = get_active_context_id()) OR has_global_scope()`;
sql += `CREATE POLICY policy_select_t_lampiran_potensi ON t_lampiran_potensi FOR SELECT USING (${pSel});\n`;
sql += `CREATE POLICY policy_insert_t_lampiran_potensi ON t_lampiran_potensi FOR INSERT WITH CHECK (${pIns});\n`;
sql += `CREATE POLICY policy_update_t_lampiran_potensi ON t_lampiran_potensi FOR UPDATE USING (${pSel}) WITH CHECK (${pIns});\n`;
sql += `CREATE POLICY policy_delete_t_lampiran_potensi ON t_lampiran_potensi FOR DELETE USING (${pSel});\n\n`;

// Pattern P2 (Jemaat-level)
const p2TablesDirect = ['m_jemaat_induk', 't_pj_jemaat'];
p2TablesDirect.forEach(tb => {
  sql += `-- Pattern P2: ${tb}\n`;
  sql += `ALTER TABLE ${tb} ENABLE ROW LEVEL SECURITY;\n`;
  sql += `CREATE POLICY policy_jem_select_${tb} ON ${tb} FOR SELECT USING (is_descendant_jemaat(id_induk) OR has_global_scope());\n`;
  sql += `CREATE POLICY policy_jem_insert_${tb} ON ${tb} FOR INSERT WITH CHECK (id_induk = get_active_context_id());\n`;
  sql += `CREATE POLICY policy_jem_update_${tb} ON ${tb} FOR UPDATE USING (is_descendant_jemaat(id_induk) OR has_global_scope()) WITH CHECK (id_induk = get_active_context_id());\n`;
  sql += `CREATE POLICY policy_jem_delete_${tb} ON ${tb} FOR DELETE USING (is_descendant_jemaat(id_induk) OR has_global_scope());\n\n`;
});

const p2TablesIndirect = ['t_penugasan_pendeta', 't_histori_perubahan_status'];
p2TablesIndirect.forEach(tb => {
  sql += `-- Pattern P2 (Indirect): ${tb}\n`;
  sql += `ALTER TABLE ${tb} ENABLE ROW LEVEL SECURITY;\n`;
  const sel = `EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = ${tb}.id_pos AND is_descendant_jemaat(id_induk)) OR has_global_scope()`;
  const ins = `EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = ${tb}.id_pos AND id_induk = get_active_context_id()) OR has_global_scope()`;
  sql += `CREATE POLICY policy_jem_select_${tb} ON ${tb} FOR SELECT USING (${sel});\n`;
  sql += `CREATE POLICY policy_jem_insert_${tb} ON ${tb} FOR INSERT WITH CHECK (${ins});\n`;
  sql += `CREATE POLICY policy_jem_update_${tb} ON ${tb} FOR UPDATE USING (${sel});\n`;
  sql += `CREATE POLICY policy_jem_delete_${tb} ON ${tb} FOR DELETE USING (${sel});\n\n`;
});

// Pattern P3 (Mupel-level)
sql += `-- Pattern P3: m_mupel\n`;
sql += `ALTER TABLE m_mupel ENABLE ROW LEVEL SECURITY;\n`;
sql += `CREATE POLICY policy_mupel_select_m_mupel ON m_mupel FOR SELECT USING (id_mupel = get_active_context_id() OR has_global_scope());\n`;
sql += `CREATE POLICY policy_mupel_insert_m_mupel ON m_mupel FOR INSERT WITH CHECK (id_mupel = get_active_context_id());\n`;
sql += `CREATE POLICY policy_mupel_update_m_mupel ON m_mupel FOR UPDATE USING (id_mupel = get_active_context_id() OR has_global_scope());\n`;
sql += `CREATE POLICY policy_mupel_delete_m_mupel ON m_mupel FOR DELETE USING (id_mupel = get_active_context_id() OR has_global_scope());\n\n`;

// Pattern P4a (User Self)
['users', 'm_push_subscription', 'webauthn_challenges'].forEach(tb => {
  sql += `-- Pattern P4a: ${tb}\n`;
  sql += `ALTER TABLE ${tb} ENABLE ROW LEVEL SECURITY;\n`;
  const uidCol = tb === 'users' ? 'id' : (tb === 'm_push_subscription' ? 'id_user' : 'user_id');
  sql += `CREATE POLICY policy_self_${tb} ON ${tb} FOR ALL USING (${uidCol} = get_user_id() OR has_global_scope());\n\n`;
});

// Pattern P4b (Person Self + Admin)
const p4bTables = ['m_pendeta', 't_jabatan_struktural', 't_keterlibatan_pendeta'];
p4bTables.forEach(tb => {
  sql += `-- Pattern P4b: ${tb}\n`;
  sql += `ALTER TABLE ${tb} ENABLE ROW LEVEL SECURITY;\n`;
  if (tb === 'm_pendeta') {
    sql += `CREATE POLICY policy_person_select_${tb} ON ${tb} FOR SELECT USING (is_self_person(id_pendeta) OR is_descendant_jemaat(id_induk) OR has_global_scope());\n`;
  } else {
    const sel = `is_self_person(id_pendeta) OR EXISTS (SELECT 1 FROM m_pendeta m WHERE m.id_pendeta = ${tb}.id_pendeta AND is_descendant_jemaat(m.id_induk)) OR has_global_scope()`;
    sql += `CREATE POLICY policy_person_select_${tb} ON ${tb} FOR SELECT USING (${sel});\n`;
  }
  sql += `CREATE POLICY policy_person_update_${tb} ON ${tb} FOR UPDATE USING (is_self_person(id_pendeta) OR has_global_scope());\n\n`;
});

// Pattern P5 (Privacy Matrix)
['t_keluarga_pendeta', 'm_webauthn_credentials'].forEach(tb => {
  sql += `-- Pattern P5: ${tb}\n`;
  sql += `ALTER TABLE ${tb} ENABLE ROW LEVEL SECURITY;\n`;
  const pidCol = tb === 'm_webauthn_credentials' ? 'id_user' : 'id_pendeta';
  const personCheck = tb === 'm_webauthn_credentials' ? 'id_user = get_user_id()' : 'is_self_person(id_pendeta)';
  sql += `CREATE POLICY policy_privacy_${tb} ON ${tb} FOR ALL USING (${personCheck} OR has_global_scope());\n\n`;
});

// Pattern P7 (Read-only Downward for System/Logs)
const p7Tables = ['t_log_aktivitas', 't_form_draft', 't_approval_bantuan'];
p7Tables.forEach(tb => {
  sql += `-- Pattern P7: ${tb}\n`;
  sql += `ALTER TABLE ${tb} ENABLE ROW LEVEL SECURITY;\n`;
  let selCheck = 'has_global_scope()';
  if (tb === 't_approval_bantuan') {
    selCheck = `EXISTS (SELECT 1 FROM t_pengajuan_bantuan p WHERE p.id_ajuan = t_approval_bantuan.id_ajuan AND is_descendant_pos(p.id_pos)) OR has_global_scope()`;
  } else {
    selCheck = `id_user = get_user_id() OR has_global_scope()`;
  }
  sql += `CREATE POLICY policy_sys_select_${tb} ON ${tb} FOR SELECT USING (${selCheck});\n`;
  sql += `CREATE POLICY policy_sys_insert_${tb} ON ${tb} FOR INSERT WITH CHECK (has_global_scope());\n`;
  sql += `CREATE POLICY policy_sys_update_${tb} ON ${tb} FOR UPDATE USING (has_global_scope());\n\n`;
});

sql += `-- Pattern P7: t_riwayat_mutasi_pendeta\n`;
sql += `ALTER TABLE t_riwayat_mutasi_pendeta ENABLE ROW LEVEL SECURITY;\n`;
const mutasiSel = `is_self_person(id_pendeta) OR is_descendant_jemaat(id_induk_lama) OR is_descendant_jemaat(id_induk_baru) OR has_global_scope()`;
sql += `CREATE POLICY policy_sys_select_t_riwayat_mutasi_pendeta ON t_riwayat_mutasi_pendeta FOR SELECT USING (${mutasiSel});\n`;
sql += `CREATE POLICY policy_sys_insert_t_riwayat_mutasi_pendeta ON t_riwayat_mutasi_pendeta FOR INSERT WITH CHECK (has_global_scope());\n`;
sql += `CREATE POLICY policy_sys_update_t_riwayat_mutasi_pendeta ON t_riwayat_mutasi_pendeta FOR UPDATE USING (has_global_scope());\n\n`;

// System Tables
['sys_transaction_logs', 'sys_telemetry'].forEach(tb => {
  sql += `-- System Table: ${tb}\n`;
  sql += `ALTER TABLE ${tb} ENABLE ROW LEVEL SECURITY;\n`;
  sql += `CREATE POLICY policy_sys_all_${tb} ON ${tb} FOR ALL USING (has_global_scope());\n\n`;
});

fs.writeFileSync(path.join(__dirname, 'supabase/migrations/20260714000003_authorization_rls_policies.sql'), sql);
console.log('done');
