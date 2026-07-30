import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  KeluargaPendeta,
  KompetensiPendeta,
  KeterlibatanPendeta,
} from '@/types/pendeta-360.types';

function generatePatternId(prefix: 'KLG' | 'KMP' | 'KTL'): string {
  const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `${prefix}-${random8}`;
}

/**
 * 1. Hook Keluarga Pendeta (Fetch & Mutations)
 */
export function useKeluargaPendeta(idPendeta?: string) {
  const supabase = createClient();

  return useQuery<KeluargaPendeta[]>({
    queryKey: ['profile-keluarga', idPendeta],
    enabled: Boolean(idPendeta),
    queryFn: async () => {
      if (!idPendeta) return [];

      const { data, error } = await supabase
        .from('t_keluarga_pendeta')
        .select('*')
        .eq('id_pendeta', idPendeta)
        .order('created_at', { ascending: true });

      if (error) return [];
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateKeluarga() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (payload: Omit<KeluargaPendeta, 'id_keluarga'>) => {
      const id = generatePatternId('KLG');
      const { data, error } = await supabase
        .from('t_keluarga_pendeta')
        .insert({
          id_keluarga: id,
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;
      return data as KeluargaPendeta;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keluarga', variables.id_pendeta] });
    },
  });
}

export function useUpdateKeluarga() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id_keluarga,
      ...payload
    }: Partial<KeluargaPendeta> & { id_keluarga: string; id_pendeta: string }) => {
      const { data, error } = await supabase
        .from('t_keluarga_pendeta')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id_keluarga', id_keluarga)
        .select('*')
        .single();

      if (error) throw error;
      return data as KeluargaPendeta;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keluarga', variables.id_pendeta] });
    },
  });
}

export function useDeleteKeluarga() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id_keluarga, id_pendeta: _id_pendeta }: { id_keluarga: string; id_pendeta: string }) => {
      const { error } = await supabase
        .from('t_keluarga_pendeta')
        .delete()
        .eq('id_keluarga', id_keluarga);

      if (error) throw error;
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keluarga', variables.id_pendeta] });
    },
  });
}

/**
 * 2. Hook Kompetensi Pendeta (Fetch & Mutations)
 */
export function useKompetensiPendeta(idPendeta?: string) {
  const supabase = createClient();

  return useQuery<KompetensiPendeta[]>({
    queryKey: ['profile-kompetensi', idPendeta],
    enabled: Boolean(idPendeta),
    queryFn: async () => {
      if (!idPendeta) return [];

      const { data, error } = await supabase
        .from('t_kompetensi_pendeta')
        .select('*')
        .eq('id_pendeta', idPendeta)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateKompetensi() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (payload: Omit<KompetensiPendeta, 'id_kompetensi'>) => {
      const id = generatePatternId('KMP');
      const { data, error } = await supabase
        .from('t_kompetensi_pendeta')
        .insert({
          id_kompetensi: id,
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;
      return data as KompetensiPendeta;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-kompetensi', variables.id_pendeta] });
    },
  });
}

export function useUpdateKompetensi() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id_kompetensi,
      ...payload
    }: Partial<KompetensiPendeta> & { id_kompetensi: string; id_pendeta: string }) => {
      const { data, error } = await supabase
        .from('t_kompetensi_pendeta')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id_kompetensi', id_kompetensi)
        .select('*')
        .single();

      if (error) throw error;
      return data as KompetensiPendeta;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-kompetensi', variables.id_pendeta] });
    },
  });
}

export function useDeleteKompetensi() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id_kompetensi, id_pendeta: _id_pendeta }: { id_kompetensi: string; id_pendeta: string }) => {
      const { error } = await supabase
        .from('t_kompetensi_pendeta')
        .delete()
        .eq('id_kompetensi', id_kompetensi);

      if (error) throw error;
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-kompetensi', variables.id_pendeta] });
    },
  });
}

/**
 * 3. Hook Keterlibatan Pendeta (Fetch & Mutations)
 */
export function useKeterlibatanPendeta(idPendeta?: string) {
  const supabase = createClient();

  return useQuery<KeterlibatanPendeta[]>({
    queryKey: ['profile-keterlibatan', idPendeta],
    enabled: Boolean(idPendeta),
    queryFn: async () => {
      if (!idPendeta) return [];

      const { data, error } = await supabase
        .from('t_keterlibatan_pendeta')
        .select('*')
        .eq('id_pendeta', idPendeta)
        .order('tgl_mulai', { ascending: false });

      if (error) return [];
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateKeterlibatan() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (payload: Omit<KeterlibatanPendeta, 'id_keterlibatan'>) => {
      const id = generatePatternId('KTL');
      const { data, error } = await supabase
        .from('t_keterlibatan_pendeta')
        .insert({
          id_keterlibatan: id,
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;
      return data as KeterlibatanPendeta;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keterlibatan', variables.id_pendeta] });
    },
  });
}

export function useUpdateKeterlibatan() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id_keterlibatan,
      ...payload
    }: Partial<KeterlibatanPendeta> & { id_keterlibatan: string; id_pendeta: string }) => {
      const { data, error } = await supabase
        .from('t_keterlibatan_pendeta')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id_keterlibatan', id_keterlibatan)
        .select('*')
        .single();

      if (error) throw error;
      return data as KeterlibatanPendeta;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keterlibatan', variables.id_pendeta] });
    },
  });
}

export function useDeleteKeterlibatan() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id_keterlibatan, id_pendeta: _id_pendeta }: { id_keterlibatan: string; id_pendeta: string }) => {
      const { error } = await supabase
        .from('t_keterlibatan_pendeta')
        .delete()
        .eq('id_keterlibatan', id_keterlibatan);

      if (error) throw error;
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keterlibatan', variables.id_pendeta] });
    },
  });
}
