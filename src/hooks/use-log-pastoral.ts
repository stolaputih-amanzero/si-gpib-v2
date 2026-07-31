import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLogPastoralListAction,
  updateLogPastoralAction,
  deleteLogPastoralAction,
} from '@/app/(dashboard)/dashboard/pastoral/actions';

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
    latitude?: number | null;
    longitude?: number | null;
    jemaat_induk?: {
      id_induk: string;
      nama_induk: string;
      latitude?: number | null;
      longitude?: number | null;
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
  return useQuery<LogPastoralItem[]>({
    queryKey: ['log-pastoral-list', search || 'all', id_pos || 'all'],
    queryFn: async () => {
      return (await getLogPastoralListAction(search, id_pos)) as LogPastoralItem[];
    },
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });
}

export function useUpdateLogPastoral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateLogPastoralPayload) => {
      return await updateLogPastoralAction(payload);
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_log: string) => {
      return await deleteLogPastoralAction(id_log);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['log-pastoral-list'] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
  });
}
