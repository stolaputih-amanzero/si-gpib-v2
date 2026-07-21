import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface LogPastoralItem {
  id_log: string;
  id_pos?: string | null;
  id_pendeta?: string | null;
  tgl: string;
  kegiatan: string;
  jml_jiwa?: number | null;
  catatan?: string | null;
  created_at?: string;
  pos?: {
    id_pos: string;
    nama_pos: string;
    kategori?: string;
    jemaat_induk?: {
      id_induk: string;
      nama_induk: string;
      mupel?: {
        id_mupel: string;
        nama_mupel: string;
      } | null;
    } | null;
  } | null;
  pendeta?: {
    id_pendeta: string;
    nama_lengkap: string;
  } | null;
}

export interface UpdateLogPastoralPayload {
  id_log: string;
  tgl: string;
  kegiatan: string;
  jml_jiwa?: number | null;
  catatan?: string | null;
  id_pos?: string | null;
}

export function useLogPastoralList(search?: string, id_pos?: string) {
  const supabase = createClient();

  return useQuery<LogPastoralItem[]>({
    queryKey: ['log-pastoral-list', search || 'all', id_pos || 'all'],
    queryFn: async () => {
      let query = supabase
        .from('t_log_pastoral')
        .select(`
          id_log,
          id_pos,
          id_pendeta,
          tgl,
          kegiatan,
          jml_jiwa,
          catatan,
          created_at,
          pos:m_pos_pelkes(
            id_pos,
            nama_pos,
            kategori,
            jemaat_induk:m_jemaat_induk(
              id_induk,
              nama_induk,
              mupel:m_mupel(id_mupel, nama_mupel)
            )
          ),
          pendeta:m_pendeta(id_pendeta, nama_lengkap)
        `)
        .order('tgl', { ascending: false });

      if (id_pos && id_pos !== 'all') {
        query = query.eq('id_pos', id_pos);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Falling back to simple pastoral query:', error);
        // Fallback for flat query if relationship names differ
        const { data: rawData, error: rawErr } = await supabase
          .from('t_log_pastoral')
          .select(`
            *,
            pos:m_pos_pelkes(id_pos, nama_pos),
            pendeta:m_pendeta(id_pendeta, nama_lengkap)
          `)
          .order('tgl', { ascending: false });

        if (rawErr) throw rawErr;
        return (rawData || []) as LogPastoralItem[];
      }

      let result = (data || []).map((log: any) => ({
        id_log: log.id_log,
        id_pos: log.id_pos,
        id_pendeta: log.id_pendeta,
        tgl: log.tgl,
        kegiatan: log.kegiatan,
        jml_jiwa: log.jml_jiwa,
        catatan: log.catatan,
        created_at: log.created_at,
        pos: log.pos || null,
        pendeta: log.pendeta || null,
      })) as LogPastoralItem[];

      if (search) {
        const q = search.toLowerCase();
        result = result.filter(
          (l) =>
            l.kegiatan.toLowerCase().includes(q) ||
            (l.catatan || '').toLowerCase().includes(q) ||
            (l.pos?.nama_pos || '').toLowerCase().includes(q) ||
            (l.pos?.jemaat_induk?.nama_induk || '').toLowerCase().includes(q) ||
            (l.pos?.jemaat_induk?.mupel?.nama_mupel || '').toLowerCase().includes(q) ||
            (l.pendeta?.nama_lengkap || '').toLowerCase().includes(q)
        );
      }

      return result;
    },
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });
}

export function useUpdateLogPastoral() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateLogPastoralPayload) => {
      const { data, error } = await supabase
        .from('t_log_pastoral')
        .update({
          tgl: payload.tgl,
          kegiatan: payload.kegiatan,
          jml_jiwa: payload.jml_jiwa ? Number(payload.jml_jiwa) : null,
          catatan: payload.catatan || null,
          id_pos: payload.id_pos || null,
        })
        .eq('id_log', payload.id_log)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['log-pastoral-list'] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
  });
}

export function useDeleteLogPastoral() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_log: string) => {
      const { error } = await supabase.from('t_log_pastoral').delete().eq('id_log', id_log);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['log-pastoral-list'] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
  });
}
