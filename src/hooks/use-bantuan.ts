import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { 
  PengajuanBantuanInput, 
  ApprovalActionInput, 
  BantuanFilter 
} from '@/lib/validations/bantuan.schema';

function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
}

export interface PengajuanBantuanItem {
  id_ajuan: string;
  id_pos: string;
  jenis_bantuan: string;
  id_aset_tanah?: string | null;
  id_aset_bangunan?: string | null;
  id_aset_bergerak?: string | null;
  biaya: number;
  urgensi: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
  status: 'Draft' | 'Pending_KMJ' | 'Pending_Mupel' | 'Pending_Sinode' | 'Approved' | 'Rejected';
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
  pos?: {
    nama_pos: string;
    id_induk?: string;
    jemaat_induk?: {
      nama_induk: string;
      id_mupel?: string;
    };
  };
  approval_history?: Array<{
    id: number;
    id_ajuan: string;
    approver_id?: string | null;
    role_approver: string;
    aksi: 'approve' | 'reject' | 'revision';
    catatan?: string | null;
    created_at?: string;
    approver?: {
      no_telepon?: string;
      role?: string;
    };
  }>;
}

// Fetch list of pengajuan bantuan
export function usePengajuanList(filter?: BantuanFilter) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['pengajuan-bantuan-list', filter],
    queryFn: async () => {
      let query = supabase
        .from('t_pengajuan_bantuan')
        .select(`
          *,
          pos:m_pos_pelkes(nama_pos, jemaat_induk:m_jemaat_induk(nama_induk, id_mupel)),
          approval_history:t_approval_bantuan(*)
        `)
        .order('created_at', { ascending: false });

      if (filter?.id_pos) {
        query = query.eq('id_pos', filter.id_pos);
      }

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.urgensi) {
        query = query.eq('urgensi', filter.urgensi);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = (data || []) as PengajuanBantuanItem[];

      if (filter?.search) {
        const s = filter.search.toLowerCase();
        result = result.filter(item => 
          item.jenis_bantuan.toLowerCase().includes(s) ||
          item.pos?.nama_pos.toLowerCase().includes(s) ||
          item.keterangan?.toLowerCase().includes(s)
        );
      }

      return result;
    },
  });
}

// Fetch single pengajuan detail with approval history
export function usePengajuanDetail(id_ajuan: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['pengajuan-bantuan-detail', id_ajuan],
    enabled: Boolean(id_ajuan),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('t_pengajuan_bantuan')
        .select(`
          *,
          pos:m_pos_pelkes(nama_pos, jemaat_induk:m_jemaat_induk(nama_induk, id_mupel)),
          approval_history:t_approval_bantuan(*)
        `)
        .eq('id_ajuan', id_ajuan)
        .single();

      if (error) throw error;
      return data as PengajuanBantuanItem;
    },
  });
}

// Create new submission
export function useCreatePengajuan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PengajuanBantuanInput) => {
      const id_ajuan = generateId('AJU');

      const payload = {
        id_ajuan,
        id_pos: input.id_pos,
        jenis_bantuan: input.jenis_bantuan,
        id_aset_tanah: input.id_aset_tanah || null,
        id_aset_bangunan: input.id_aset_bangunan || null,
        id_aset_bergerak: input.id_aset_bergerak || null,
        biaya: input.biaya,
        urgensi: input.urgensi,
        status: 'Pending_KMJ', // Initial status for KMJ review
        keterangan: input.keterangan,
      };

      const { data, error } = await supabase
        .from('t_pengajuan_bantuan')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengajuan-bantuan-list'] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
  });
}

// Process Atomic Approval using Supabase RPC `process_pengajuan_bantuan`
export function useProcessApproval() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ApprovalActionInput & { role_approver?: string }) => {
      // 1. Call Supabase RPC for atomic execution
      const { error: rpcError } = await supabase.rpc('process_pengajuan_bantuan', {
        p_id_ajuan: input.id_ajuan,
        p_aksi: input.aksi,
        p_catatan: input.catatan,
        p_role_approver: input.role_approver || 'super_user',
      });

      // 2. Fallback if RPC is not yet registered
      if (rpcError) {
        console.warn('RPC process_pengajuan_bantuan failed, running fallback:', rpcError.message);

        const { data: ajuan, error: fetchErr } = await supabase
          .from('t_pengajuan_bantuan')
          .select('status')
          .eq('id_ajuan', input.id_ajuan)
          .single();

        if (fetchErr) throw fetchErr;

        let nextStatus = 'Pending_KMJ';
        if (input.aksi === 'approve') {
          if (ajuan.status === 'Pending_KMJ' || ajuan.status === 'Draft') nextStatus = 'Pending_Mupel';
          else if (ajuan.status === 'Pending_Mupel') nextStatus = 'Pending_Sinode';
          else if (ajuan.status === 'Pending_Sinode') nextStatus = 'Approved';
          else nextStatus = 'Approved';
        } else if (input.aksi === 'revision') {
          nextStatus = 'Draft';
        } else {
          nextStatus = 'Rejected';
        }

        // Insert audit log
        const { error: auditErr } = await supabase
          .from('t_approval_bantuan')
          .insert({
            id_ajuan: input.id_ajuan,
            role_approver: input.role_approver || 'super_user',
            aksi: input.aksi,
            catatan: input.catatan,
          });

        if (auditErr) throw auditErr;

        // Update status
        const { error: updateErr } = await supabase
          .from('t_pengajuan_bantuan')
          .update({ status: nextStatus, updated_at: new Date().toISOString() })
          .eq('id_ajuan', input.id_ajuan);

        if (updateErr) throw updateErr;
      }

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pengajuan-bantuan-list'] });
      queryClient.invalidateQueries({ queryKey: ['pengajuan-bantuan-detail', variables.id_ajuan] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
    onError: () => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    },
  });
}

// Delete submission draft
export function useDeletePengajuan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_ajuan: string) => {
      const { error } = await supabase
        .from('t_pengajuan_bantuan')
        .delete()
        .eq('id_ajuan', id_ajuan);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengajuan-bantuan-list'] });
    },
  });
}
