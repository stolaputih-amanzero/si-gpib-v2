'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { pengajuanBantuanSchema } from '@/lib/validations/bantuan.schema';
import { revalidatePath } from 'next/cache';

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

  // 4. Revalidate cache
  revalidatePath('/bantuan');
  revalidatePath('/dashboard');

  return pengajuan;
}

export async function submitBantuanAction(id_ajuan: string) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

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

  revalidatePath('/bantuan');
  revalidatePath('/dashboard');

  return data;
}

export async function processApprovalAction(payload: {
  id_ajuan: string;
  aksi: 'approve' | 'reject' | 'revision';
  catatan: string;
  role_approver?: string;
}) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Autentikasi diperlukan untuk memproses persetujuan.');
  }

  // 2. Lookup user profile role
  const { data: profile } = await db
    .from('users')
    .select('role, nama_lengkap')
    .eq('id', user.id)
    .single();

  const userRole = payload.role_approver || profile?.role || 'super_user';

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

  revalidatePath('/bantuan');
  revalidatePath(`/bantuan/${payload.id_ajuan}`);
  revalidatePath('/dashboard');

  return { success: true };
}

