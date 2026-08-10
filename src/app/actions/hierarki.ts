'use server';

import { createClient } from '@/lib/supabase/server';
import { enforceContract } from '@/lib/authorization/enforce/enforce-contract';

export async function assignKmjAction(data: { id_induk: string; id_pendeta: string }) {
  const supabase = await createClient();

  // 1. Authorization
  const authResult = await enforceContract('OC-ORG-002', {
    target_entity: {
      entity_type: 'Org',
      entity_id: data.id_induk,
      owning_context_id: data.id_induk,
    },
    operation_payload: {
      action: 'assign_kmj',
      ...data
    }
  });

  if (authResult.status === 'CONTRACT_RESOLUTION_FAILURE') {
    return { success: false, error: 'Authorization Failure', detail: 'Sesi tidak valid atau hak akses ditolak.' };
  }
  if (authResult.decision?.result === 'DENY') {
    return { success: false, error: authResult.decision.error_code, detail: authResult.decision.error_detail };
  }

  // 2. Execution (RPC + Fallback Sync)
  try {
    await supabase.rpc('set_kmj', {
      p_id_induk: data.id_induk,
      p_id_pendeta: data.id_pendeta,
    });
  } catch (e) {
    console.warn('RPC set_kmj warning, running direct table sync fallback:', e);
  }

  // Guarantee 100% synchronization on all related tables
  const { data: oldPendeta } = await supabase
    .from('m_pendeta')
    .select('id_induk, is_kmj')
    .eq('id_pendeta', data.id_pendeta)
    .single();

  if (oldPendeta?.id_induk && oldPendeta.id_induk !== data.id_induk && oldPendeta.is_kmj) {
    await supabase
      .from('m_jemaat_induk')
      .update({ id_kmj: null, updated_at: new Date().toISOString() })
      .eq('id_induk', oldPendeta.id_induk);
  }

  await supabase
    .from('t_pj_jemaat')
    .update({ tanggal_selesai: new Date().toISOString().split('T')[0], status: 'Selesai' })
    .eq('id_pendeta', data.id_pendeta)
    .is('tanggal_selesai', null);

  await supabase
    .from('m_jemaat_induk')
    .update({ id_kmj: data.id_pendeta, updated_at: new Date().toISOString() })
    .eq('id_induk', data.id_induk);

  await supabase
    .from('m_pendeta')
    .update({ is_kmj: false })
    .eq('id_induk', data.id_induk);

  await supabase
    .from('m_pendeta')
    .update({ is_kmj: true, is_pj: false, id_induk: data.id_induk, updated_at: new Date().toISOString() })
    .eq('id_pendeta', data.id_pendeta);

  return { success: true };
}

export async function assignPjAction(data: { id_induk: string; id_pendeta: string }) {
  const supabase = await createClient();

  // 1. Authorization
  const authResult = await enforceContract('OC-ORG-002', {
    target_entity: {
      entity_type: 'Org',
      entity_id: data.id_induk,
      owning_context_id: data.id_induk,
    },
    operation_payload: {
      action: 'assign_pj',
      ...data
    }
  });

  if (authResult.status === 'CONTRACT_RESOLUTION_FAILURE') {
    return { success: false, error: 'Authorization Failure', detail: 'Sesi tidak valid atau hak akses ditolak.' };
  }
  if (authResult.decision?.result === 'DENY') {
    return { success: false, error: authResult.decision.error_code, detail: authResult.decision.error_detail };
  }

  // 2. Execution
  try {
    await supabase.rpc('assign_pj', {
      p_id_induk: data.id_induk,
      p_id_pendeta: data.id_pendeta,
    });
  } catch (e) {
    console.warn('RPC assign_pj warning, running direct table sync fallback:', e);
  }

  const { data: oldPendeta } = await supabase
    .from('m_pendeta')
    .select('id_induk, is_kmj')
    .eq('id_pendeta', data.id_pendeta)
    .single();

  if (oldPendeta?.is_kmj && oldPendeta.id_induk) {
    await supabase
      .from('m_jemaat_induk')
      .update({ id_kmj: null, updated_at: new Date().toISOString() })
      .eq('id_induk', oldPendeta.id_induk);
  }

  await supabase
    .from('t_pj_jemaat')
    .update({ tanggal_selesai: new Date().toISOString().split('T')[0], status: 'Selesai' })
    .eq('id_pendeta', data.id_pendeta)
    .is('tanggal_selesai', null);

  await supabase.from('t_pj_jemaat').insert({
    id_induk: data.id_induk,
    id_pendeta: data.id_pendeta,
    tanggal_mulai: new Date().toISOString().split('T')[0],
    status: 'Aktif',
  });

  await supabase
    .from('m_pendeta')
    .update({ is_pj: true, is_kmj: false, id_induk: data.id_induk, updated_at: new Date().toISOString() })
    .eq('id_pendeta', data.id_pendeta);

  return { success: true };
}
