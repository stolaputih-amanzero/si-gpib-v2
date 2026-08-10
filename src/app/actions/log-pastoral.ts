'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { logPastoralSchema } from '@/lib/validations/log-pastoral.schema';
import { revalidatePath } from 'next/cache';
import { enforceContract } from '@/lib/authorization';
import type { ContractId } from '@/lib/authorization/types';

function getDbClient(supabaseServerClient: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    return createSupabaseAdmin(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseServerClient;
}

export async function createLogPastoral(payload: {
  id_log?: string;
  id_pos?: string | null;
  id_induk?: string | null;
  id_pendeta?: string | null;
  tgl: string | Date;
  kegiatan: string;
  jml_jiwa?: number | null;
  catatan?: string | null;
  foto_url?: string | null;
}) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pendetaId = payload.id_pendeta || user?.user_metadata?.id_pendeta || 'PDT-001';

  // 2. Validate
  const validated = logPastoralSchema.parse({
    id_induk: payload.id_induk || 'JMT-MOCK-001',
    id_pos: payload.id_pos || undefined,
    id_pendeta: pendetaId,
    tgl: payload.tgl,
    kegiatan: payload.kegiatan,
    jml_jiwa: payload.jml_jiwa ? Number(payload.jml_jiwa) : undefined,
    catatan: payload.catatan || undefined,
  });

  const idLog = payload.id_log || `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  let tglStr = typeof validated.tgl === 'string' ? validated.tgl : new Date().toISOString().split('T')[0];
  if (validated.tgl instanceof Date) {
    tglStr = validated.tgl.toISOString().split('T')[0];
  }

  const contractId: ContractId = 'OC-PASTORAL-001';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'PastoralLog',
      entity_id: idLog,
      owning_context_id: validated.id_pos || payload.id_induk || null,
    },
    operation_payload: {},
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    throw new Error('System configuration error (Authorization).');
  }
  if (result.decision.result === 'DENY') {
    throw new Error(result.decision.error_detail || 'Access denied.');
  }

  await db.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  // 3. Insert ke DB
  const { data, error } = await db
    .from('t_log_pastoral')
    .insert({
      id_log: idLog,
      id_pos: validated.id_pos || null,
      id_pendeta: validated.id_pendeta,
      tgl: tglStr,
      kegiatan: validated.kegiatan,
      jml_jiwa: validated.jml_jiwa ?? null,
      catatan: validated.catatan || null,
      foto_url: payload.foto_url || null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('createLogPastoral error:', error);
    throw new Error(error.message || 'Gagal menyimpan log pastoral');
  }

  await db.from('t_log_aktivitas').insert({
    id_log: `LOG-PAST-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'pastoral.create',
    objek_type: 'PastoralLog',
    objek_id: idLog,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Membuat log pastoral kegiatan ${validated.kegiatan}`
  });

  // 4. Revalidate
  revalidatePath('/laporan/pastoral');
  revalidatePath('/dashboard/pastoral');
  revalidatePath('/pastoral');

  return data;
}
