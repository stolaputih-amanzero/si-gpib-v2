import { useQuery, useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useKeluargaPendeta(idPendeta: string | null | undefined) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['keluarga-pendeta', idPendeta],
    queryFn: async () => {
      if (!idPendeta) return [];
      const { data, error } = await supabase.from('t_keluarga_pendeta').select('*').eq('id_pendeta', idPendeta);
      if (error) throw error;
      return data || [];
    },
    enabled: !!idPendeta
  });
}

export function useKompetensiPendeta(idPendeta: string | null | undefined) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['kompetensi-pendeta', idPendeta],
    queryFn: async () => {
      if (!idPendeta) return [];
      const { data, error } = await supabase.from('t_kompetensi_pendeta').select('*').eq('id_pendeta', idPendeta);
      if (error) throw error;
      return data || [];
    },
    enabled: !!idPendeta
  });
}

export function useKeterlibatanPendeta(idPendeta: string | null | undefined) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['keterlibatan-pendeta', idPendeta],
    queryFn: async () => {
      if (!idPendeta) return [];
      const { data, error } = await supabase.from('t_keterlibatan_pendeta').select('*').eq('id_pendeta', idPendeta);
      if (error) throw error;
      return data || [];
    },
    enabled: !!idPendeta
  });
}

// Dummy mutation hooks to satisfy legacy components during transition
export const useCreateKeluarga = () => useMutation({ mutationFn: async (_vars: any) => {} });
export const useUpdateKeluarga = () => useMutation({ mutationFn: async (_vars: any) => {} });
export const useDeleteKeluarga = () => useMutation({ mutationFn: async (_vars: any) => {} });

export const useCreateKompetensi = () => useMutation({ mutationFn: async (_vars: any) => {} });
export const useUpdateKompetensi = () => useMutation({ mutationFn: async (_vars: any) => {} });
export const useDeleteKompetensi = () => useMutation({ mutationFn: async (_vars: any) => {} });

export const useCreateKeterlibatan = () => useMutation({ mutationFn: async (_vars: any) => {} });
export const useUpdateKeterlibatan = () => useMutation({ mutationFn: async (_vars: any) => {} });
export const useDeleteKeterlibatan = () => useMutation({ mutationFn: async (_vars: any) => {} });

