import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PendetaInput, MutasiInput, SetKmjInput } from '@/lib/validations/pendeta.schema';

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

export function usePendetaList(id_induk?: string, search?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['pendeta-list', id_induk, search],
    queryFn: async () => {
      let query = supabase
        .from('m_pendeta')
        .select('*, jemaat_induk:m_jemaat_induk!m_pendeta_id_induk_fkey(id_induk, nama_induk, mupel:m_mupel(nama_mupel))')
        .order('created_at', { ascending: false });

      if (id_induk && id_induk !== 'all') {
        query = query.or(`id_induk.eq.${id_induk},id_induk.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = (data || []) as PendetaItem[];

      if (search) {
        const s = search.toLowerCase();
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

      if (error) throw error;
      return data as PendetaItem;
    },
    enabled: Boolean(id_pendeta),
  });
}

export function useMutationHistory(id_pendeta?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['mutation-history', id_pendeta],
    queryFn: async () => {
      if (!id_pendeta) return [];

      const { data, error } = await supabase
        .from('t_riwayat_mutasi_pendeta')
        .select('*, jemaat_lama:m_jemaat_induk!t_riwayat_mutasi_pendeta_id_induk_lama_fkey(nama_induk), jemaat_baru:m_jemaat_induk!t_riwayat_mutasi_pendeta_id_induk_baru_fkey(nama_induk)')
        .eq('id_pendeta', id_pendeta)
        .order('tgl_mutasi', { ascending: false });

      if (error) throw error;
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
        tgl_lahir: input.tgl_lahir || null,
        tgl_tugas: input.tgl_tugas || null,
        keterangan: input.keterangan || null,
      };

      const { data, error } = await supabase
        .from('m_pendeta')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('m_pendeta')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id_pendeta', id_pendeta)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
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
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
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
      const { error } = await supabase.rpc('mutasi_pendeta', {
        p_id_pendeta: data.id_pendeta,
        p_id_induk_baru: data.id_induk_baru,
        p_alasan: data.alasan,
      });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendeta-list'] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-detail', variables.id_pendeta] });
      queryClient.invalidateQueries({ queryKey: ['mutation-history', variables.id_pendeta] });
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
      const { error } = await supabase.rpc('set_kmj', {
        p_id_induk: data.id_induk,
        p_id_pendeta: data.id_pendeta,
      });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendeta-list'] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-detail', variables.id_pendeta] });
      queryClient.invalidateQueries({ queryKey: ['mutation-history', variables.id_pendeta] });
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
