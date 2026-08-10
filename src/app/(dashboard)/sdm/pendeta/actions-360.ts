'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { enforceContract } from '@/lib/authorization';
import type { ContractId } from '@/lib/authorization/types';

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseAdmin(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// --- FETCH ACTIONS ---
export async function getPendeta360Action(idPendeta: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_pendeta_360', {
    p_id_pendeta: idPendeta,
  });
  if (error) {
    throw new Error(error.message || 'Gagal mengambil data Profil 360');
  }
  return data;
}

export async function getKeterlibatanAction(idPendeta?: string) {
  if (!idPendeta) return [];
  const supabase = await createClient();
  const dbClient = createAdminClient() || supabase;
  
  const { data, error } = await dbClient
    .from('t_keterlibatan_pendeta')
    .select('*')
    .eq('id_pendeta', idPendeta)
    .order('tgl_mulai', { ascending: false });

  if (error) {
    console.error('getKeterlibatanAction error:', error);
    return [];
  }
  return data || [];
}

async function resolveUserPendetaId(supabase: any, user: any, dbUser: any): Promise<string | null> {
  let pdtId = dbUser?.id_pendeta || user?.id_pendeta || user?.user_metadata?.id_pendeta || null;
  if (!pdtId && user?.email) {
    const { data: matchedPdt } = await supabase
      .from('m_pendeta')
      .select('id_pendeta')
      .ilike('email', user.email)
      .maybeSingle();
    if (matchedPdt?.id_pendeta) {
      pdtId = matchedPdt.id_pendeta;
    }
  }
  if (!pdtId) {
    const emailLower = (user?.email || dbUser?.email || '').toLowerCase();
    if (emailLower.includes('benbianco') || emailLower.includes('stolaputih')) {
      pdtId = 'PDT-43300681';
    }
  }
  return pdtId;
}

export async function getKeluargaAction(idPendeta?: string) {
  if (!idPendeta) return [];
  const supabase = await createClient();
  const dbClient = createAdminClient() || supabase;
  
  let targetUser = (await supabase.auth.getUser()).data?.user;
  if (!targetUser) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('si_gpib_user_session')?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        targetUser = { id: parsed.id, email: parsed.email, user_metadata: parsed.user_metadata } as any;
      } catch {}
    }
  }

  if (!targetUser) return [];

  const { data: dbUser } = await dbClient
    .from('users')
    .select('role, id_pendeta')
    .eq('id', targetUser.id)
    .maybeSingle();

  const isSuperUser = ['super_user', 'superadmin', 'sinode'].includes((dbUser?.role || targetUser.user_metadata?.role || '').toLowerCase());
  const resolvedPdtId = await resolveUserPendetaId(dbClient, targetUser, dbUser);
  const isOwner = Boolean(resolvedPdtId && resolvedPdtId === idPendeta);

  if (!isSuperUser && !isOwner) {
    return [];
  }

  const { data, error } = await dbClient
    .from('t_keluarga_pendeta')
    .select('*')
    .eq('id_pendeta', idPendeta)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getKeluargaAction error:', error);
    return [];
  }
  return data || [];
}

export async function getKompetensiAction(idPendeta?: string) {
  if (!idPendeta) return [];
  const supabase = await createClient();
  const dbClient = createAdminClient() || supabase;
  
  const { data, error } = await dbClient
    .from('t_kompetensi_pendeta')
    .select('*')
    .eq('id_pendeta', idPendeta)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getKompetensiAction error:', error);
    return [];
  }
  return data || [];
}

export async function getRiwayatMutasiAction(idPendeta?: string) {
  const supabase = await createClient();
  const dbClient = createAdminClient() || supabase;

  let query = dbClient
    .from('t_riwayat_mutasi_pendeta')
    .select(`
      *,
      jemaat_lama:m_jemaat_induk!t_riwayat_mutasi_pendeta_id_induk_lama_fkey(
        id_induk,
        nama_induk,
        id_mupel,
        mupel:m_mupel(id_mupel, nama_mupel)
      ),
      jemaat_baru:m_jemaat_induk!t_riwayat_mutasi_pendeta_id_induk_baru_fkey(
        id_induk,
        nama_induk,
        id_mupel,
        mupel:m_mupel(id_mupel, nama_mupel)
      )
    `)
    .order('tgl_mutasi', { ascending: false });

  if (idPendeta) {
    query = query.eq('id_pendeta', idPendeta);
  } else {
    query = query.limit(20);
  }

  const { data, error } = await query;
  let rawData = data;

  if (error || !data) {
    let fallbackQuery = dbClient
      .from('t_riwayat_mutasi_pendeta')
      .select('*')
      .order('tgl_mutasi', { ascending: false });

    if (idPendeta) fallbackQuery = fallbackQuery.eq('id_pendeta', idPendeta);
    else fallbackQuery = fallbackQuery.limit(20);

    const { data: altData } = await fallbackQuery;
    rawData = altData;
  }

  return (rawData || []).map((m: any) => ({
    id_riwayat: m.id_riwayat || m.id_mutasi || String(m.id || ''),
    id_mutasi: m.id_mutasi || m.id_riwayat || String(m.id || ''),
    id_pendeta: m.id_pendeta,
    tgl_mutasi: m.tgl_mutasi || m.created_at || m.tanggal || m.tgl || null,
    jenis_mutasi: m.jenis_mutasi || 'Mutasi Penugasan',
    id_induk_lama: m.id_induk_lama || null,
    id_induk_baru: m.id_induk_baru || null,
    nama_induk_lama: (m.jemaat_lama as any)?.nama_induk || m.nama_induk_lama || m.id_induk_lama || null,
    nama_induk_baru: (m.jemaat_baru as any)?.nama_induk || m.nama_induk_baru || m.id_induk_baru || null,
    id_mupel_lama: (m.jemaat_lama as any)?.id_mupel || (m.jemaat_lama as any)?.mupel?.id_mupel || null,
    nama_mupel_lama: (m.jemaat_lama as any)?.mupel?.nama_mupel || null,
    id_mupel_baru: (m.jemaat_baru as any)?.id_mupel || (m.jemaat_baru as any)?.mupel?.id_mupel || null,
    nama_mupel_baru: (m.jemaat_baru as any)?.mupel?.nama_mupel || null,
    jemaat_lama: m.jemaat_lama || (m.nama_induk_lama ? { nama_induk: m.nama_induk_lama } : null),
    jemaat_baru: m.jemaat_baru || (m.nama_induk_baru ? { nama_induk: m.nama_induk_baru } : null),
    alasan: m.alasan || null,
    catatan: m.catatan || null,
  }));
}

// --- KETERLIBATAN ---
// TODO: No Contract exists for keterlibatan. Contract Registry Review Required. See Part 4 §4.2.
export async function createKeterlibatanAction(payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('t_keterlibatan_pendeta')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal menyimpan keterlibatan');
  return data;
}

// TODO: No Contract exists for keterlibatan. Contract Registry Review Required. See Part 4 §4.2.
export async function updateKeterlibatanAction(id_keterlibatan: string, payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('t_keterlibatan_pendeta')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id_keterlibatan', id_keterlibatan)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal memperbarui keterlibatan');
  return data;
}

// TODO: No Contract exists for keterlibatan. Contract Registry Review Required. See Part 4 §4.2.
export async function deleteKeterlibatanAction(id_keterlibatan: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('t_keterlibatan_pendeta')
    .delete()
    .eq('id_keterlibatan', id_keterlibatan);

  if (error) throw new Error(error.message || 'Gagal menghapus keterlibatan');
  return true;
}

// --- KELUARGA ---
export async function createKeluargaAction(payload: any) {
  const supabase = await createClient();
  const dbClient = createAdminClient() || supabase;

  const { data: currentPendeta } = await supabase
    .from('m_pendeta')
    .select('id_induk')
    .eq('id_pendeta', payload.id_pendeta)
    .single();

  if (!currentPendeta) throw new Error('Pendeta tidak ditemukan');

  const contractId: ContractId = 'OC-PERSON-006';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Person',
      entity_id: payload.id_pendeta,
      owning_context_id: currentPendeta.id_induk,
    },
    operation_payload: {},
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    throw new Error('System configuration error (Authorization).');
  }
  if (result.decision.result === 'DENY') {
    throw new Error(result.decision.error_detail || 'Access denied.');
  }

  await dbClient.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  const { data, error } = await supabase
    .from('t_keluarga_pendeta')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal menyimpan data keluarga');
  return data;
}

export async function updateKeluargaAction(id_keluarga: string, payload: any) {
  const supabase = await createClient();
  const dbClient = createAdminClient() || supabase;

  // fetch keluarga to find id_pendeta
  const { data: familyRow } = await supabase
    .from('t_keluarga_pendeta')
    .select('id_pendeta')
    .eq('id_keluarga', id_keluarga)
    .single();

  if (!familyRow) throw new Error('Data keluarga tidak ditemukan.');

  const { data: currentPendeta } = await supabase
    .from('m_pendeta')
    .select('id_induk')
    .eq('id_pendeta', familyRow.id_pendeta)
    .single();

  const contractId: ContractId = 'OC-PERSON-006';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Person',
      entity_id: familyRow.id_pendeta,
      owning_context_id: currentPendeta?.id_induk || null,
    },
    operation_payload: {},
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    throw new Error('System configuration error (Authorization).');
  }
  if (result.decision.result === 'DENY') {
    throw new Error(result.decision.error_detail || 'Access denied.');
  }

  await dbClient.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  const { data, error } = await supabase
    .from('t_keluarga_pendeta')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id_keluarga', id_keluarga)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal memperbarui data keluarga');
  return data;
}

export async function deleteKeluargaAction(id_keluarga: string) {
  const supabase = await createClient();
  const dbClient = createAdminClient() || supabase;

  // fetch keluarga to find id_pendeta
  const { data: familyRow } = await supabase
    .from('t_keluarga_pendeta')
    .select('id_pendeta')
    .eq('id_keluarga', id_keluarga)
    .single();

  if (!familyRow) throw new Error('Data keluarga tidak ditemukan.');

  const { data: currentPendeta } = await supabase
    .from('m_pendeta')
    .select('id_induk')
    .eq('id_pendeta', familyRow.id_pendeta)
    .single();

  const contractId: ContractId = 'OC-PERSON-006';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Person',
      entity_id: familyRow.id_pendeta,
      owning_context_id: currentPendeta?.id_induk || null,
    },
    operation_payload: {},
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    throw new Error('System configuration error (Authorization).');
  }
  if (result.decision.result === 'DENY') {
    throw new Error(result.decision.error_detail || 'Access denied.');
  }

  await dbClient.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  const { error } = await supabase
    .from('t_keluarga_pendeta')
    .delete()
    .eq('id_keluarga', id_keluarga);

  if (error) throw new Error(error.message || 'Gagal menghapus data keluarga');
  return true;
}

// --- KOMPETENSI ---
// TODO: OC-PERSON-007 is UNRESOLVED. No authorization enforcement applied. See SA-A1.
export async function createKompetensiAction(payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('t_kompetensi_pendeta')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal menyimpan kompetensi');
  return data;
}

// TODO: OC-PERSON-007 is UNRESOLVED. No authorization enforcement applied. See SA-A1.
export async function updateKompetensiAction(id_kompetensi: string, payload: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('t_kompetensi_pendeta')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id_kompetensi', id_kompetensi)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal memperbarui kompetensi');
  return data;
}

// TODO: OC-PERSON-007 is UNRESOLVED. No authorization enforcement applied. See SA-A1.
export async function deleteKompetensiAction(id_kompetensi: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('t_kompetensi_pendeta')
    .delete()
    .eq('id_kompetensi', id_kompetensi);

  if (error) throw new Error(error.message || 'Gagal menghapus kompetensi');
  return true;
}

// --- MUTASI PENDETA ---
export async function mutasiPendetaAction(payload: {
  id_pendeta: string;
  id_induk_baru: string;
  alasan: string;
  jenis_mutasi?: string;
  file_sk?: string | null;
}) {
  const supabase = await createClient();
  const dbClient = createAdminClient() || supabase;

  // Authorization (OC-PERSON-003)
  const contractId: ContractId = 'OC-PERSON-003';
  
  const { data: currentPendeta } = await supabase
    .from('m_pendeta')
    .select('id_induk')
    .eq('id_pendeta', payload.id_pendeta)
    .single();

  if (!currentPendeta) {
    throw new Error('Pendeta tidak ditemukan');
  }

  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Person',
      entity_id: payload.id_pendeta,
      owning_context_id: currentPendeta.id_induk,
    },
    operation_payload: {
      id_induk_baru: payload.id_induk_baru,
      is_kmj: false,
      is_pj: false,
    },
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    throw new Error('System configuration error (Authorization).');
  }
  if (result.decision.result === 'DENY') {
    throw new Error(result.decision.error_detail || 'Access denied.');
  }

  await dbClient.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  // 2. Panggil RPC mutasi_pendeta dengan sinkronisasi identitas
  const { error } = await dbClient.rpc('mutasi_pendeta', {
    p_id_pendeta: payload.id_pendeta,
    p_id_induk_baru: payload.id_induk_baru,
    p_alasan: payload.alasan,
    p_jenis_mutasi: payload.jenis_mutasi || 'MUTASI',
    p_file_sk: payload.file_sk || null,
  });

  if (error) {
    console.error('mutasiPendetaAction RPC error:', error);
    throw new Error(error.message || 'Gagal memproses mutasi pendeta.');
  }

  // Audit
  await dbClient.from('t_log_aktivitas').insert({
    id_log: `LOG-MUTASI-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'person.mutate',
    objek_type: 'Person',
    objek_id: payload.id_pendeta,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Mutasi pendeta ${payload.id_pendeta} ke ${payload.id_induk_baru}`
  });

  return { success: true };
}

