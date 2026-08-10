'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { enforceContract } from '@/lib/authorization';
import type { ContractId } from '@/lib/authorization/types';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function createPendetaAction(payload: any) {
  // supabase unused
  const dbClient = getAdminClient();

  const contractId: ContractId = 'OC-PERSON-001';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Person',
      entity_id: payload.id_pendeta,
      owning_context_id: payload.id_induk,
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

  const { data, error } = await dbClient
    .from('m_pendeta')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await dbClient.from('t_log_aktivitas').insert({
    id_log: `LOG-PERSON-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'person.create',
    objek_type: 'Person',
    objek_id: payload.id_pendeta,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Membuat data pendeta ${payload.nama_lengkap}`
  });

  revalidatePath('/sdm/pendeta');
  return data;
}

export async function updatePendetaAction(id_pendeta: string, payload: any) {
  const supabase = await createClient();
  const dbClient = getAdminClient();

  // fetch current to get id_induk
  const { data: current } = await supabase.from('m_pendeta').select('id_induk, nama_lengkap').eq('id_pendeta', id_pendeta).single();
  
  if (!current) throw new Error('Data pendeta tidak ditemukan');

  const contractId: ContractId = 'OC-PERSON-002';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Person',
      entity_id: id_pendeta,
      owning_context_id: payload.id_induk || current.id_induk,
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

  const { data, error } = await dbClient
    .from('m_pendeta')
    .update(payload)
    .eq('id_pendeta', id_pendeta)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await dbClient.from('t_log_aktivitas').insert({
    id_log: `LOG-PERSON-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'person.update',
    objek_type: 'Person',
    objek_id: id_pendeta,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Memperbarui data pendeta ${payload.nama_lengkap || current.nama_lengkap}`
  });

  revalidatePath('/sdm/pendeta');
  return data;
}

export async function deletePendetaAction(id_pendeta: string) {
  const supabase = await createClient();
  const dbClient = getAdminClient();

  const { data: current } = await supabase.from('m_pendeta').select('id_induk').eq('id_pendeta', id_pendeta).single();
  if (!current) throw new Error('Data pendeta tidak ditemukan');

  const contractId: ContractId = 'OC-PERSON-004';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Person',
      entity_id: id_pendeta,
      owning_context_id: current.id_induk,
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

  const { error } = await dbClient.from('m_pendeta').delete().eq('id_pendeta', id_pendeta);

  if (error) {
    if (error.code === '23503' || error.message?.includes('foreign key constraint') || error.message?.includes('violates foreign key constraint')) {
      throw new Error('Pendeta ini tidak dapat dihapus karena memiliki riwayat pelayanan (mutasi, penugasan, log pastoral, atau jabatan) yang harus dipertahankan.');
    }
    throw new Error(error.message);
  }

  await dbClient.from('t_log_aktivitas').insert({
    id_log: `LOG-PERSON-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'person.delete',
    objek_type: 'Person',
    objek_id: id_pendeta,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Menghapus data pendeta ${id_pendeta}`
  });

  revalidatePath('/sdm/pendeta');
  return true;
}

export async function setKmjAction(payload: { id_induk: string; id_pendeta: string; alasan?: string; file_sk?: string; tgl_mutasi?: string; }) {
  // supabase unused
  const dbClient = getAdminClient();

  const contractId: ContractId = 'OC-PERSON-005';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Person',
      entity_id: payload.id_pendeta,
      owning_context_id: payload.id_induk,
    },
    operation_payload: {
      id_induk_baru: payload.id_induk,
      is_kmj: true,
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

  const tglMutasiVal = payload.tgl_mutasi || new Date().toISOString().split('T')[0];

  // 1. Call RPC set_kmj
  const { error } = await dbClient.rpc('set_kmj', {
    p_id_induk: payload.id_induk,
    p_id_pendeta: payload.id_pendeta,
  });

  if (error) throw new Error(error.message);

  // 4. Insert or update t_riwayat_mutasi_pendeta for KMJ appointment history
  try {
    const skTag = payload.file_sk ? `[📄 SK_MUTASI:${payload.file_sk}]` : '';
    await dbClient
      .from('t_riwayat_mutasi_pendeta')
      .insert({
        id_riwayat: 'MUT-' + Math.floor(1000000000 + Math.random() * 9000000000),
        id_pendeta: payload.id_pendeta,
        id_induk_baru: payload.id_induk,
        tgl_mutasi: tglMutasiVal,
        jenis_mutasi: 'PENGANGKATAN_KMJ',
        alasan: payload.alasan,
        catatan: skTag,
      });
  } catch {}

  await dbClient.from('t_log_aktivitas').insert({
    id_log: `LOG-PERSON-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'person.set_kmj',
    objek_type: 'Person',
    objek_id: payload.id_pendeta,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Menetapkan pendeta ${payload.id_pendeta} sebagai KMJ di ${payload.id_induk}`
  });

  revalidatePath('/sdm/pendeta');
  return true;
}
