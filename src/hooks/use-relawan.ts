import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { RelawanInput } from '@/lib/validations/relawan.schema';

export interface RelawanItem {
  id_relawan: string;
  id_pos: string;
  nama: string;
  no_wa?: string | null;
  tgl_lahir?: string | null;
  gender: 'Laki-laki' | 'Perempuan';
  kategori: string;
  pelatihan?: string | null;
  keterangan?: string | null;
  foto_url?: string | null;
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

export function useRelawanList(id_pos?: string, search?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['relawan-list', id_pos, search],
    queryFn: async () => {
      let query = supabase
        .from('t_relawan')
        .select('*, pos:m_pos_pelkes(nama_pos, jemaat_induk:m_jemaat_induk(nama_induk))')
        .order('created_at', { ascending: false });

      if (id_pos) {
        query = query.eq('id_pos', id_pos);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = (data || []) as RelawanItem[];

      if (search) {
        const s = search.toLowerCase();
        result = result.filter(
          (r) =>
            r.nama.toLowerCase().includes(s) ||
            r.kategori.toLowerCase().includes(s) ||
            r.pos?.nama_pos.toLowerCase().includes(s)
        );
      }

      return result;
    },
  });
}

export function useCreateRelawan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RelawanInput) => {
      const id_relawan = generateId('RLW');
      const payload = {
        id_relawan,
        ...input,
        tgl_lahir: input.tgl_lahir || null,
        pelatihan: input.pelatihan || null,
        keterangan: input.keterangan || null,
      };

      const { data, error } = await supabase
        .from('t_relawan')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relawan-list'] });
    },
  });
}

export function useUpdateRelawan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_relawan, input }: { id_relawan: string; input: Partial<RelawanInput> }) => {
      const { data, error } = await supabase
        .from('t_relawan')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id_relawan', id_relawan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relawan-list'] });
    },
  });
}

export function useDeleteRelawan() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_relawan: string) => {
      const { error } = await supabase.from('t_relawan').delete().eq('id_relawan', id_relawan);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relawan-list'] });
    },
  });
}
