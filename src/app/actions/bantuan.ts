'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { pengajuanBantuanSchema } from '@/lib/validations/bantuan.schema';
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

export async function createPengajuanBantuanAction(payload: {
  id_pos: string;
  jenis_bantuan: string;
  biaya: number;
  urgensi: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
  id_tanah?: string | null;
  id_bangunan?: string | null;
  id_aset_b?: string | null;
  keterangan?: string | null;
  proposal_files?: { name: string; size: number; path?: string }[];
}) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  // 1. Validate input
  const validated = pengajuanBantuanSchema.parse({
    id_pos: payload.id_pos,
    jenis_bantuan: payload.jenis_bantuan,
    biaya: payload.biaya,
    urgensi: payload.urgensi,
    id_tanah: payload.id_tanah || null,
    id_bangunan: payload.id_bangunan || null,
    id_aset_b: payload.id_aset_b || null,
    keterangan: payload.keterangan || null,
  });

  // 2. Authorization (OC-AID-001)
  const contractId: ContractId = 'OC-AID-001';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Aid',
      entity_id: null,
      owning_context_id: validated.id_pos,
    },
    operation_payload: {
      jenis_bantuan: validated.jenis_bantuan,
      biaya: validated.biaya,
    },
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    throw new Error('System configuration error (Authorization).');
  }
  if (result.decision.result === 'DENY') {
    throw new Error(result.decision.error_detail || 'Access denied.');
  }

  // 3. Inject validated session variables into the DB transaction
  await db.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  const idAjuan = `AJU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // 2. Insert into t_pengajuan_bantuan with status Pending_KMJ
  const { data: pengajuan, error: pengajuanError } = await db
    .from('t_pengajuan_bantuan')
    .insert({
      id_ajuan: idAjuan,
      id_pos: validated.id_pos,
      jenis_bantuan: validated.jenis_bantuan,
      biaya: validated.biaya,
      urgensi: validated.urgensi,
      id_tanah: validated.id_tanah || null,
      id_bangunan: validated.id_bangunan || null,
      id_aset_b: validated.id_aset_b || null,
      keterangan: validated.keterangan || null,
      status: 'Pending_KMJ',
    })
    .select('*')
    .single();

  if (pengajuanError) {
    console.error('Insert t_pengajuan_bantuan error:', pengajuanError);
    throw new Error(pengajuanError.message || 'Gagal membuat pengajuan bantuan.');
  }

  // 3. Insert lampiran proposal if any
  if (payload.proposal_files && payload.proposal_files.length > 0) {
    for (const file of payload.proposal_files) {
      await db.from('t_lampiran_bantuan').insert({
        id_lampiran: `LMP-AJU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        id_ajuan: idAjuan,
        nama_file: file.name,
        file_path: file.path || `bantuan-proposals/${file.name}`,
        ukuran_file: (file.size / (1024 * 1024)).toFixed(2),
        created_at: new Date().toISOString(),
      });
    }
  }

  // Layer 8 Audit
  await db.from('t_log_aktivitas').insert({ 
    id_log: `LOG-AID-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id, 
    aksi: 'aid.create', 
    objek_type: 'Aid', 
    objek_id: idAjuan,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Membuat draft pengajuan bantuan ${validated.jenis_bantuan}`
  });

  // Revalidate cache
  revalidatePath('/bantuan');
  revalidatePath('/dashboard');

  return pengajuan;
}

export async function submitBantuanAction(id_ajuan: string) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  // Lookup record to get id_pos for authorization
  const { data: currentRecord } = await db
    .from('t_pengajuan_bantuan')
    .select('id_pos, status')
    .eq('id_ajuan', id_ajuan)
    .single();

  if (!currentRecord) {
    throw new Error('Pengajuan bantuan tidak ditemukan.');
  }

  const contractId: ContractId = 'OC-AID-003';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Aid',
      entity_id: id_ajuan,
      owning_context_id: currentRecord.id_pos,
    },
    operation_payload: {
      status: currentRecord.status, // Evaluated against precondition TargetAid.status == 'Draft'
    },
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

  const { data, error } = await db
    .from('t_pengajuan_bantuan')
    .update({
      status: 'Pending_KMJ',
      updated_at: new Date().toISOString(),
    })
    .eq('id_ajuan', id_ajuan)
    .select('*')
    .single();

  if (error) {
    console.error('submitBantuanAction error:', error);
    throw new Error(error.message || 'Gagal mengirim pengajuan bantuan untuk diapprove.');
  }

  // Audit
  await db.from('t_log_aktivitas').insert({
    id_log: `LOG-AID-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'aid.submit',
    objek_type: 'Aid',
    objek_id: id_ajuan,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Submit pengajuan bantuan ${id_ajuan}`
  });

  revalidatePath('/bantuan');
  revalidatePath('/dashboard');

  return data;
}

export async function processApprovalAction(payload: {
  id_ajuan: string;
  aksi: 'approve' | 'reject' | 'revision';
  catatan: string;
  role_approver?: string;
  step?: 1 | 2; // 1 for KMJ, 2 for Mupel
}) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  const { data: currentRecord } = await db
    .from('t_pengajuan_bantuan')
    .select('id_pos, status')
    .eq('id_ajuan', payload.id_ajuan)
    .single();

  if (!currentRecord) {
    throw new Error('Pengajuan tidak ditemukan');
  }

  let contractId: ContractId;
  if (payload.aksi === 'reject' || payload.aksi === 'revision') {
    contractId = 'OC-AID-006'; // reject
  } else {
    // determine step
    const step = payload.step || (currentRecord.status === 'Pending_KMJ' ? 1 : 2);
    contractId = step === 1 ? 'OC-AID-004' : 'OC-AID-005';
  }

  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Aid',
      entity_id: payload.id_ajuan,
      owning_context_id: currentRecord.id_pos,
    },
    operation_payload: {
      status: currentRecord.status,
    },
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

  const userRole = payload.role_approver || result.role_binding.effective_system_role || 'super_user';

  // 3. Execute atomic RPC
  const { error: rpcError } = await db.rpc('process_pengajuan_bantuan', {
    p_id_ajuan: payload.id_ajuan,
    p_aksi: payload.aksi,
    p_catatan: payload.catatan,
    p_role_approver: userRole,
  });

  if (rpcError) {
    console.error('processApprovalAction RPC error:', rpcError);
    throw new Error(rpcError.message || 'Gagal memproses aksi persetujuan.');
  }

  // Audit
  await db.from('t_log_aktivitas').insert({
    id_log: `LOG-AID-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: contractId === 'OC-AID-006' ? 'aid.reject' : 'aid.approve',
    objek_type: 'Aid',
    objek_id: payload.id_ajuan,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Approval action ${payload.aksi} by ${userRole} for ${payload.id_ajuan}`
  });

  revalidatePath('/bantuan');
  revalidatePath(`/bantuan/${payload.id_ajuan}`);
  revalidatePath('/dashboard');

  return { success: true };
}

