import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PendetaInput, MutasiInput, SetKmjInput } from '@/lib/validations/pendeta.schema';
import { getRiwayatMutasiAction } from '@/app/(dashboard)/sdm/pendeta/actions-360';

function toError(error: any): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  if (error && typeof error === 'object') {
    if (error.code === '42501') {
      return new Error('Gagal menyimpan: Akses ditolak oleh kebijakan keamanan database (RLS). Pastikan Anda memiliki izin akses.');
    }
    if (typeof error.message === 'string' && error.message.trim()) {
      return new Error(error.message);
    }
  }
  return new Error(JSON.stringify(error));
}

export interface PendetaItem {
  id_pendeta: string;
  id_induk: string;
  nama_lengkap: string;
  no_wa?: string | null;
  jabatan: string;
  status: string;
  tgl_lahir?: string | null;
  gender: 'Laki-laki' | 'Perempuan';
  tgl_tugas?: string | null;
  is_kmj: boolean;
  is_pj: boolean;
  keterangan?: string | null;
  jenis_pendeta: 'Organik' | 'Non-Organik';
  tgl_mulai_kontrak?: string | null;
  tgl_akhir_kontrak?: string | null;
  sumber_pembiayaan?: string | null;
  eligible_rotasi: boolean;
  gereja_asal?: string | null;
  created_at?: string;
  updated_at?: string;
  jemaat_induk?: {
    id_induk: string;
    nama_induk: string;
    mupel?: {
      nama_mupel: string;
    };
  };
}

export interface MutasiHistoryItem {
  id_riwayat: string;
  id_pendeta: string;
  id_induk_lama?: string | null;
  id_induk_baru?: string | null;
  tgl_mutasi: string;
  jenis_mutasi: string;
  alasan?: string | null;
  created_at?: string;
  jemaat_lama?: {
    nama_induk: string;
  };
  jemaat_baru?: {
    nama_induk: string;
  };
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
}

export function usePendetaList(filter?: { id_induk?: string, search?: string, jenis_pendeta?: 'Organik' | 'Non-Organik' }) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['pendeta-list', filter],
    queryFn: async () => {
      let query = supabase
        .from('m_pendeta')
        .select('*, jemaat_induk:m_jemaat_induk!m_pendeta_id_induk_fkey(id_induk, nama_induk, mupel:m_mupel(nama_mupel))')
        .order('created_at', { ascending: false });

      if (filter?.id_induk && filter.id_induk !== 'all') {
        query = query.or(`id_induk.eq.${filter.id_induk},id_induk.is.null`);
      }

      if (filter?.jenis_pendeta && filter.jenis_pendeta !== 'all' as any) {
        query = query.eq('jenis_pendeta', filter.jenis_pendeta);
      }

      const { data, error } = await query;
      if (error) throw toError(error);

      let result = (data || []) as PendetaItem[];

      if (filter?.search) {
        const s = filter.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.nama_lengkap.toLowerCase().includes(s) ||
            p.jabatan.toLowerCase().includes(s) ||
            p.jemaat_induk?.nama_induk.toLowerCase().includes(s)
        );
      }

      return result;
    },
  });
}

export function usePendetaKontrakSegeraBerakhir() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['pendeta-kontrak-segera-berakhir'],
    queryFn: async () => {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

      const { data, error } = await supabase
        .from('m_pendeta')
        .select(`*, jemaat_induk:m_jemaat_induk!m_pendeta_id_induk_fkey(nama_induk)`)
        .eq('jenis_pendeta', 'Non-Organik')
        .not('tgl_akhir_kontrak', 'is', null)
        .lte('tgl_akhir_kontrak', ninetyDaysFromNow.toISOString().split('T')[0])
        .gte('tgl_akhir_kontrak', new Date().toISOString().split('T')[0])
        .order('tgl_akhir_kontrak');

      if (error) throw toError(error);
      return (data || []) as PendetaItem[];
    },
  });
}

export function usePendetaDetail(id_pendeta?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['pendeta-detail', id_pendeta],
    queryFn: async () => {
      if (!id_pendeta) return null;

      const { data, error } = await supabase
        .from('m_pendeta')
        .select('*, jemaat_induk:m_jemaat_induk!m_pendeta_id_induk_fkey(id_induk, nama_induk, mupel:m_mupel(nama_mupel))')
        .eq('id_pendeta', id_pendeta)
        .single();

      if (error) throw toError(error);
      return data as PendetaItem;
    },
    enabled: Boolean(id_pendeta),
  });
}

export function useMutationHistory(id_pendeta?: string) {
  return useQuery({
    queryKey: ['mutation-history', id_pendeta],
    queryFn: async () => {
      if (!id_pendeta) return [];
      const data = await getRiwayatMutasiAction(id_pendeta);
      return (data || []) as MutasiHistoryItem[];
    },
    enabled: Boolean(id_pendeta),
  });
}

export function useCreatePendeta() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PendetaInput) => {
      const id_pendeta = generateId('PDT');
      const payload = {
        id_pendeta,
        ...input,
        tgl_lahir: input.tgl_lahir ? new Date(input.tgl_lahir).toISOString().split('T')[0] : null,
        tgl_tugas: input.tgl_tugas ? new Date(input.tgl_tugas).toISOString().split('T')[0] : null,
        keterangan: input.keterangan || null,
        jenis_pendeta: input.jenis_pendeta || 'Organik',
        tgl_mulai_kontrak: input.tgl_mulai_kontrak ? new Date(input.tgl_mulai_kontrak).toISOString().split('T')[0] : null,
        tgl_akhir_kontrak: input.tgl_akhir_kontrak ? new Date(input.tgl_akhir_kontrak).toISOString().split('T')[0] : null,
        sumber_pembiayaan: input.sumber_pembiayaan || null,
        eligible_rotasi: input.eligible_rotasi ?? true,
        gereja_asal: input.gereja_asal || null,
      };

      const { data, error } = await supabase
        .from('m_pendeta')
        .insert(payload)
        .select()
        .single();

      if (error) throw toError(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendeta-list'] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
  });
}

export function useUpdatePendeta() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_pendeta, input }: { id_pendeta: string; input: Partial<PendetaInput> }) => {
      const updateData = {
        ...input,
        tgl_lahir: input.tgl_lahir ? new Date(input.tgl_lahir).toISOString().split('T')[0] : null,
        tgl_tugas: input.tgl_tugas ? new Date(input.tgl_tugas).toISOString().split('T')[0] : null,
        tgl_mulai_kontrak: input.tgl_mulai_kontrak ? new Date(input.tgl_mulai_kontrak).toISOString().split('T')[0] : null,
        tgl_akhir_kontrak: input.tgl_akhir_kontrak ? new Date(input.tgl_akhir_kontrak).toISOString().split('T')[0] : null,
      };

      const { data, error } = await supabase
        .from('m_pendeta')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id_pendeta', id_pendeta)
        .select()
        .single();

      if (error) throw toError(error);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['current-pendeta'] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-list'] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-detail', variables.id_pendeta] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
  });
}

export function useDeletePendeta() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_pendeta: string) => {
      const { error } = await supabase.from('m_pendeta').delete().eq('id_pendeta', id_pendeta);
      if (error) {
        if (error.code === '23503' || error.message?.includes('foreign key constraint') || error.message?.includes('violates foreign key constraint')) {
          throw new Error('Pendeta ini tidak dapat dihapus karena memiliki riwayat pelayanan (mutasi, penugasan, log pastoral, atau jabatan) yang harus dipertahankan.');
        }
        throw toError(error);
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-pendeta'] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-list'] });
    },
  });
}

/**
 * Mutasi Pendeta (Calls Database RPC mutasi_pendeta)
 */
export function useMutasiPendeta() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MutasiInput) => {
      const tglMutasiVal = data.tgl_mutasi || new Date().toISOString().split('T')[0];

      // 1. Call RPC mutasi_pendeta or fallback
      const { error } = await supabase.rpc('mutasi_pendeta', {
        p_id_pendeta: data.id_pendeta,
        p_id_induk_baru: data.id_induk_baru,
        p_alasan: data.alasan,
      });

      if (error) throw toError(error);

      // Determine structural role flags & titles
      let isKmj = false;
      let isPj = false;
      let targetPosId: string | null = null;
      let userRole = 'pendeta';
      let jabatanTitle = 'Pendeta Jemaat';
      let jenisMutasiTitle = 'MUTASI';

      if (data.peran_tugas === 'KMJ') {
        isKmj = true;
        isPj = false;
        userRole = 'kmj';
        jabatanTitle = 'Ketua Majelis Jemaat (KMJ)';
        jenisMutasiTitle = 'PENGANGKATAN_KMJ';

        // Call RPC set_kmj to update KMJ assignment in database
        try {
          await supabase.rpc('set_kmj', {
            p_id_induk: data.id_induk_baru,
            p_id_pendeta: data.id_pendeta,
          });
        } catch {}
      } else {
        // Pendeta Jemaat (PJ)
        isKmj = false;
        isPj = true;
        targetPosId = data.id_pos_baru || null;
        userRole = targetPosId ? 'pj_pos' : 'pendeta';
        jabatanTitle = targetPosId ? 'Pendeta Jemaat (Pos Pelkes/Bajem)' : 'Pendeta Jemaat (PJ)';
        jenisMutasiTitle = targetPosId ? 'PENUGASAN_POS_PELKES' : 'MUTASI_PENDETA';
      }

      // 2. Update m_pendeta record with new hierarchy & structural role
      try {
        await supabase
          .from('m_pendeta')
          .update({
            id_induk: data.id_induk_baru,
            id_pos: targetPosId,
            is_kmj: isKmj,
            is_pj: isPj,
            jabatan: jabatanTitle,
          })
          .eq('id_pendeta', data.id_pendeta);
      } catch {}

      // 3. Update users table if linked
      try {
        await supabase
          .from('users')
          .update({
            id_induk: data.id_induk_baru,
            id_pos: targetPosId,
            role: userRole,
          })
          .eq('id_pendeta', data.id_pendeta);
      } catch {}

      // 4. Ensure tgl_mutasi and SK attachment (file_sk) in database are updated
      try {
        const skTag = data.file_sk ? `[📄 SK_MUTASI:${data.file_sk}]` : '';
        await supabase
          .from('t_riwayat_mutasi_pendeta')
          .update({
            tgl_mutasi: tglMutasiVal,
            jenis_mutasi: jenisMutasiTitle,
            catatan: skTag,
          })
          .eq('id_pendeta', data.id_pendeta)
          .order('created_at', { ascending: false })
          .limit(1);
      } catch {}

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['current-pendeta'] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-list'] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-detail', variables.id_pendeta] });
      queryClient.invalidateQueries({ queryKey: ['mutation-history', variables.id_pendeta] });
      queryClient.invalidateQueries({ queryKey: ['profile-akun'] });
      queryClient.invalidateQueries({ queryKey: ['profile-pelayanan'] });
      queryClient.invalidateQueries({ queryKey: ['profile-penugasan-pj'] });
      queryClient.invalidateQueries({ queryKey: ['hierarki-info'] });
      queryClient.invalidateQueries({ queryKey: ['user-mupel-auth'] });
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

/**
 * Set KMJ (Calls Database RPC set_kmj)
 */
export function useSetKmj() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetKmjInput) => {
      const tglMutasiVal = data.tgl_mutasi || new Date().toISOString().split('T')[0];

      // 1. Call RPC set_kmj
      const { error } = await supabase.rpc('set_kmj', {
        p_id_induk: data.id_induk,
        p_id_pendeta: data.id_pendeta,
      });

      if (error) throw toError(error);

      // 2. Update m_pendeta: is_kmj = true, is_pj = false, id_pos = null, jabatan = 'Ketua Majelis Jemaat (KMJ)'
      try {
        await supabase
          .from('m_pendeta')
          .update({
            id_induk: data.id_induk,
            is_kmj: true,
            is_pj: false,
            id_pos: null,
            jabatan: 'Ketua Majelis Jemaat (KMJ)',
          })
          .eq('id_pendeta', data.id_pendeta);
      } catch {}

      // 3. Update users table if linked: id_induk = data.id_induk, id_pos = null, role = 'kmj'
      try {
        await supabase
          .from('users')
          .update({
            id_induk: data.id_induk,
            id_pos: null,
            role: 'kmj',
          })
          .eq('id_pendeta', data.id_pendeta);
      } catch {}

      // 4. Insert or update t_riwayat_mutasi_pendeta for KMJ appointment history
      try {
        const skTag = data.file_sk ? `[📄 SK_MUTASI:${data.file_sk}]` : '';
        await supabase
          .from('t_riwayat_mutasi_pendeta')
          .insert({
            id_riwayat: 'MUT-' + Math.floor(1000000000 + Math.random() * 9000000000),
            id_pendeta: data.id_pendeta,
            id_induk_baru: data.id_induk,
            tgl_mutasi: tglMutasiVal,
            jenis_mutasi: 'PENGANGKATAN_KMJ',
            alasan: data.alasan,
            catatan: skTag,
          });
      } catch {}

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['current-pendeta'] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-list'] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-detail', variables.id_pendeta] });
      queryClient.invalidateQueries({ queryKey: ['mutation-history', variables.id_pendeta] });
      queryClient.invalidateQueries({ queryKey: ['profile-akun'] });
      queryClient.invalidateQueries({ queryKey: ['profile-pelayanan'] });
      queryClient.invalidateQueries({ queryKey: ['profile-penugasan-pj'] });
      queryClient.invalidateQueries({ queryKey: ['hierarki-info'] });
      queryClient.invalidateQueries({ queryKey: ['user-mupel-auth'] });
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
