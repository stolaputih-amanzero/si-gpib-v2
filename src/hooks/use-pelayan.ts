import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PelayanInput } from '@/lib/validations/pelayan.schema';

export interface PelayanItem {
  id_pelayan: string;
  id_pos: string;
  nama: string;
  no_wa?: string | null;
  jabatan: string;
  tgl_lahir?: string | null;
  gender: 'Laki-laki' | 'Perempuan';
  status: 'Aktif' | 'Nonaktif';
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
  pos?: {
    nama_pos: string;
    jemaat_induk?: {
      nama_induk: string;
    };
  };
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
}

export function usePelayanList(id_pos?: string, search?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['pelayan-list', id_pos, search],
    queryFn: async () => {
      let query = supabase
        .from('t_pelayan')
        .select('*, pos:m_pos_pelkes(nama_pos, jemaat_induk:m_jemaat_induk(nama_induk))')
        .order('created_at', { ascending: false });

      if (id_pos) {
        query = query.eq('id_pos', id_pos);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = (data || []) as PelayanItem[];

      if (search) {
        const s = search.toLowerCase();
        result = result.filter(
          (p) =>
            p.nama.toLowerCase().includes(s) ||
            p.jabatan.toLowerCase().includes(s) ||
            p.pos?.nama_pos.toLowerCase().includes(s)
        );
      }

      return result;
    },
  });
}

export function useCreatePelayan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PelayanInput) => {
      const id_pelayan = generateId('PLY');
      const payload = {
        id_pelayan,
        ...input,
        tgl_lahir: input.tgl_lahir || null,
        keterangan: input.keterangan || null,
      };

      const { data, error } = await supabase
        .from('t_pelayan')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelayan-list'] });
    },
  });
}

export function useUpdatePelayan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_pelayan, input }: { id_pelayan: string; input: Partial<PelayanInput> }) => {
      const { data, error } = await supabase
        .from('t_pelayan')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id_pelayan', id_pelayan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelayan-list'] });
    },
  });
}

export function useDeletePelayan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_pelayan: string) => {
      const { error } = await supabase.from('t_pelayan').delete().eq('id_pelayan', id_pelayan);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelayan-list'] });
    },
  });
}
