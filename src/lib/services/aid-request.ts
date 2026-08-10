import { createClient } from '@/lib/supabase/server';
import { getServerContext } from '@/lib/utils/context';

export interface UnifiedAidRequestData {
  id_ajuan: string;
  id_pos: string;
  nama_pos: string;
  judul_ajuan: string;
  jenis_bantuan: string;
  deskripsi: string;
  estimasi_biaya: number;
  urgensi: string;
  status: string;
  tgl_diajukan: string | null;
  diajukan_oleh_nama: string;
  
  // Aset justifikasi
  aset_terkait?: {
    id: string;
    kategori: string;
    keterangan: string;
  } | null;
  
  // Timeline approvals
  timeline: {
    id_approval: number;
    aksi: string;
    catatan: string | null;
    created_at: string;
    role_approver: string;
    approver_nama: string;
  }[];
  
  // Permissions for Action Bar
  canApprove: boolean;
  canReject: boolean;
  canSubmit: boolean;
  canResubmit: boolean;
  canEdit: boolean;
}

export async function fetchUnifiedAidRequestData(ajuanId: string): Promise<UnifiedAidRequestData | null> {
  const supabase = await createClient();
  const context = await getServerContext();
  const contextId = context?.context_id;

  if (!context || !contextId) {
    return null;
  }

  // Fetch ajuan with relations
  const { data: ajuan, error } = await supabase
    .from('t_pengajuan_bantuan')
    .select(`
      *,
      m_pos_pelkes (nama_pos, id_induk, m_jemaat_induk (id_mupel)),
      users!diajukan_oleh (full_name)
    `)
    .eq('id_ajuan', ajuanId)
    .single();

  if (error || !ajuan) {
    return null;
  }

  // RBAC Validation based on contextId
  // Ensure the user's active context has jurisdiction over this ajuan's POS
  let hasAccess = false;
  
  // Because we removed org level properties from getServerContext, we parse context_id
  if (contextId === 'SINODE') {
    hasAccess = true;
  } else if (contextId.startsWith('MUPEL-')) {
    hasAccess = ajuan.m_pos_pelkes?.m_jemaat_induk?.id_mupel === contextId;
  } else if (contextId.startsWith('JEMAAT-')) {
    // Note: older data might not use JEMAAT- prefix, but usually id_induk is direct
    // Let's just compare id_induk
    hasAccess = ajuan.m_pos_pelkes?.id_induk === contextId;
  } else if (contextId.startsWith('POS-')) {
    hasAccess = ajuan.id_pos === contextId;
  }

  if (!hasAccess) {
    return null; // Will trigger a 404/403
  }

  // Fetch Timeline
  const { data: approvals } = await supabase
    .from('t_approval_bantuan')
    .select(`
      *,
      users!approver_id (full_name)
    `)
    .eq('id_ajuan', ajuanId)
    .order('created_at', { ascending: true });

  // Fetch Aset Terkait
  let asetTerkait = null;
  if (ajuan.id_aset_tanah) {
    const { data } = await supabase.from('t_aset_tanah').select('luas_m2, status_hukum').eq('id_tanah', ajuan.id_aset_tanah).single();
    if (data) asetTerkait = { id: ajuan.id_aset_tanah, kategori: 'Tanah', keterangan: `Luas ${data.luas_m2}m², Status: ${data.status_hukum}` };
  } else if (ajuan.id_aset_bangunan) {
    const { data } = await supabase.from('t_aset_bangunan').select('fungsi, kondisi').eq('id_bangunan', ajuan.id_aset_bangunan).single();
    if (data) asetTerkait = { id: ajuan.id_aset_bangunan, kategori: 'Bangunan', keterangan: `Fungsi: ${data.fungsi}, Kondisi: ${data.kondisi}` };
  } else if (ajuan.id_aset_bergerak) {
    const { data } = await supabase.from('t_aset_bbergerak').select('jenis, merk_tipe').eq('id_aset_b', ajuan.id_aset_bergerak).single();
    if (data) asetTerkait = { id: ajuan.id_aset_bergerak, kategori: 'Bergerak', keterangan: `${data.jenis} - ${data.merk_tipe}` };
  }

  // Calculate permissions based on Status Machine UI Mapping
  const isCreatorPos = contextId === ajuan.id_pos;
  const isKmj = contextId === ajuan.m_pos_pelkes?.id_induk;
  const isAdminMupel = contextId === ajuan.m_pos_pelkes?.m_jemaat_induk?.id_mupel;

  const status = ajuan.status_ajuan || ajuan.status; // check schema

  let canSubmit = false, canEdit = false, canApprove = false, canReject = false, canResubmit = false;

  if (status === 'Draft' && isCreatorPos) {
    canSubmit = true;
    canEdit = true;
  } else if (status === 'Pending_KMJ' && isKmj) {
    canApprove = true;
    canReject = true;
  } else if (status === 'Pending_Mupel' && isAdminMupel) {
    canApprove = true;
    canReject = true;
  } else if (status === 'Rejected' && isCreatorPos) {
    canResubmit = true;
  }
  // Pending_Sinode handles by Sinode role (if implemented)

  return {
    id_ajuan: ajuan.id_ajuan,
    id_pos: ajuan.id_pos,
    nama_pos: ajuan.m_pos_pelkes?.nama_pos || '',
    judul_ajuan: ajuan.judul_ajuan || ajuan.jenis_bantuan,
    jenis_bantuan: ajuan.jenis_bantuan,
    deskripsi: ajuan.deskripsi,
    estimasi_biaya: ajuan.estimasi_biaya,
    urgensi: ajuan.urgensi,
    status: status,
    tgl_diajukan: ajuan.tgl_diajukan || ajuan.created_at,
    diajukan_oleh_nama: ajuan.users?.full_name || 'System',
    aset_terkait: asetTerkait,
    timeline: approvals?.map((a: any) => ({
      id_approval: a.id_approval,
      aksi: a.aksi,
      catatan: a.catatan,
      created_at: a.created_at,
      role_approver: a.role_approver,
      approver_nama: a.users?.full_name || 'Unknown'
    })) || [],
    canApprove,
    canReject,
    canSubmit,
    canResubmit,
    canEdit
  };
}
