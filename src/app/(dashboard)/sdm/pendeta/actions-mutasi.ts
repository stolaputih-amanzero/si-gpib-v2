'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { enforceContract } from '@/lib/authorization';
import type { ContractId } from '@/lib/authorization/types';

const mutasiSchema = z.object({
  id_pendeta: z.string().min(1, 'ID Pendeta wajib diisi'),
  id_induk_baru: z.string().min(1, 'Jemaat tujuan wajib dipilih'),
  jenis_mutasi: z.string().min(1, 'Jenis mutasi wajib dipilih'),
  alasan: z.string().min(10, 'Alasan minimal 10 karakter'),
  file_sk_url: z.string().optional(),
});

export async function mutasiPendetaAction(formData: FormData) {
  try {
    const supabase = await createClient();


    const rawData = {
      id_pendeta: formData.get('id_pendeta'),
      id_induk_baru: formData.get('id_induk_baru'),
      jenis_mutasi: formData.get('jenis_mutasi'),
      alasan: formData.get('alasan'),
      file_sk_url: formData.get('file_sk_url'),
    };

    const validatedData = mutasiSchema.parse(rawData);

    // 1. Authorization (OC-PERSON-003)
    const contractId: ContractId = 'OC-PERSON-003';
    
    // Lookup current pendeta to get id_induk
    const { data: currentPendeta } = await supabase
      .from('m_pendeta')
      .select('id_induk')
      .eq('id_pendeta', validatedData.id_pendeta)
      .single();

    if (!currentPendeta) {
      return { success: false, error: 'Pendeta tidak ditemukan' };
    }

    const result = await enforceContract(contractId, {
      target_entity: {
        entity_type: 'Person',
        entity_id: validatedData.id_pendeta,
        owning_context_id: currentPendeta.id_induk,
      },
      operation_payload: {
        // EIA O6 Rule: is_kmj and is_pj must be explicitly set to false during mutasi
        id_induk_baru: validatedData.id_induk_baru,
        is_kmj: false,
        is_pj: false,
      },
    });

    if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
      return { success: false, error: 'System configuration error (Authorization).' };
    }
    if (result.decision.result === 'DENY') {
      return { success: false, error: result.decision.error_detail || 'Access denied.' };
    }

    // 2. Inject session context
    await supabase.rpc('set_authorization_context', {
      p_context_id: result.context_resolution.active_context?.context_id || '',
      p_context_level: result.context_resolution.active_context?.context_level || '',
      p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
      p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
      p_effective_role: result.role_binding.effective_system_role || '',
    });

    // Panggil RPC Atomic
    const { error: rpcError } = await supabase.rpc('mutasi_pendeta', {
      p_id_pendeta: validatedData.id_pendeta,
      p_id_induk_baru: validatedData.id_induk_baru,
      p_alasan: validatedData.alasan,
      p_jenis_mutasi: validatedData.jenis_mutasi,
      p_file_sk: validatedData.file_sk_url || null,
    });

    if (rpcError) {
      console.error('RPC Error mutasi_pendeta:', rpcError);
      return { success: false, error: rpcError.message };
    }

    // Layer 8 Audit
    await supabase.from('t_log_aktivitas').insert({
      id_log: `LOG-MUTASI-${Date.now()}`,
      id_user: result.identity_resolution.base_identity?.user_account_id,
      aksi: 'person.mutate',
      objek_type: 'Person',
      objek_id: validatedData.id_pendeta,
      aktor: result.role_binding.effective_system_role,
      keterangan: `Mutasi pendeta ${validatedData.id_pendeta} ke ${validatedData.id_induk_baru}`
    });

    // Revalidate cache agar UI terupdate
    revalidatePath('/sdm/pendeta');
    revalidatePath('/hierarki');
    
    return { success: true };
  } catch (error) {
    console.error('Error mutasiPendetaAction:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Terjadi kesalahan saat memproses mutasi.' };
  }
}
