import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { JadwalInput } from '@/lib/validations/jadwal.schema';

export interface JadwalItem {
  id_ibadah: string;
  id_pos: string;
  jenis: string;
  hari: string;
  jam: string;
  zona_waktu?: string | null;
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
  pos?: {
    nama_pos: string;
    jemaat_induk?: {
      nama_induk: string;
      mupel?: {
        nama_mupel: string;
      } | null;
    } | null;
  } | null;
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
}

const DAY_ORDER: Record<string, number> = {
  'Minggu': 0,
  'Senin': 1,
  'Selasa': 2,
  'Rabu': 3,
  'Kamis': 4,
  'Jumat': 5,
  'Sabtu': 6
};

export function useJadwalList(id_pos?: string, search?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['jadwal-list', id_pos, search],
    queryFn: async () => {
      let query = supabase
        .from('t_jadwal_ibadah')
        .select('*, pos:m_pos_pelkes(nama_pos, jemaat_induk:m_jemaat_induk(nama_induk, mupel:m_mupel(nama_mupel)))');

      if (id_pos) {
        query = query.eq('id_pos', id_pos);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = (data || []) as JadwalItem[];

      // Client-side sorting by Day (starting Sunday) and Time (ascending)
      result.sort((a, b) => {
        const orderA = DAY_ORDER[a.hari] ?? 99;
        const orderB = DAY_ORDER[b.hari] ?? 99;
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        
        return a.jam.localeCompare(b.jam);
      });

      if (search) {
        const s = search.toLowerCase();
        result = result.filter(
          (j) =>
            j.jenis.toLowerCase().includes(s) ||
            j.hari.toLowerCase().includes(s) ||
            j.pos?.nama_pos.toLowerCase().includes(s)
        );
      }

      return result;
    },
  });
}

export function useCreateJadwal() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: JadwalInput) => {
      const id_ibadah = generateId('JAD');
      const payload = {
        id_ibadah,
        ...input,
        keterangan: input.keterangan || null,
      };

      const { data, error } = await supabase
        .from('t_jadwal_ibadah')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal-list'] });
    },
  });
}

export function useUpdateJadwal() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_ibadah, input }: { id_ibadah: string; input: Partial<JadwalInput> }) => {
      const { data, error } = await supabase
        .from('t_jadwal_ibadah')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id_ibadah', id_ibadah)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal-list'] });
    },
  });
}

export function useDeleteJadwal() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_ibadah: string) => {
      const { error } = await supabase.from('t_jadwal_ibadah').delete().eq('id_ibadah', id_ibadah);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal-list'] });
    },
  });
}
