import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  KeluargaPendeta,
  KompetensiPendeta,
  KeterlibatanPendeta,
} from '@/types/pendeta-360.types';
import {
  getKeluargaAction,
  createKeluargaAction,
  updateKeluargaAction,
  deleteKeluargaAction,
  getKompetensiAction,
  createKompetensiAction,
  updateKompetensiAction,
  deleteKompetensiAction,
  getKeterlibatanAction,
  createKeterlibatanAction,
  updateKeterlibatanAction,
  deleteKeterlibatanAction,
} from '@/app/(dashboard)/sdm/pendeta/actions-360';

function generatePatternId(prefix: 'KLG' | 'KMP' | 'KTL'): string {
  const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `${prefix}-${random8}`;
}

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

/**
 * 1. Hook Keluarga Pendeta (Fetch & Mutations)
 */
export function useKeluargaPendeta(idPendeta?: string) {
  return useQuery<KeluargaPendeta[]>({
    queryKey: ['profile-keluarga', idPendeta],
    enabled: Boolean(idPendeta),
    queryFn: async () => {
      if (!idPendeta) return [];
      return (await getKeluargaAction(idPendeta)) as KeluargaPendeta[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateKeluarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<KeluargaPendeta, 'id_keluarga'>) => {
      const id = generatePatternId('KLG');
      try {
        return (await createKeluargaAction({
          id_keluarga: id,
          ...payload,
          updated_at: new Date().toISOString(),
        })) as KeluargaPendeta;
      } catch (err) {
        throw toError(err);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keluarga', variables.id_pendeta] });
    },
  });
}

export function useUpdateKeluarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id_keluarga,
      ...payload
    }: Partial<KeluargaPendeta> & { id_keluarga: string; id_pendeta: string }) => {
      try {
        return (await updateKeluargaAction(id_keluarga, payload)) as KeluargaPendeta;
      } catch (err) {
        throw toError(err);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keluarga', variables.id_pendeta] });
    },
  });
}

export function useDeleteKeluarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_keluarga, id_pendeta: _id_pendeta }: { id_keluarga: string; id_pendeta: string }) => {
      try {
        return await deleteKeluargaAction(id_keluarga);
      } catch (err) {
        throw toError(err);
      }
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
  return useQuery<KompetensiPendeta[]>({
    queryKey: ['profile-kompetensi', idPendeta],
    enabled: Boolean(idPendeta),
    queryFn: async () => {
      if (!idPendeta) return [];
      return (await getKompetensiAction(idPendeta)) as KompetensiPendeta[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateKompetensi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<KompetensiPendeta, 'id_kompetensi'>) => {
      const id = generatePatternId('KMP');
      try {
        return (await createKompetensiAction({
          id_kompetensi: id,
          ...payload,
          updated_at: new Date().toISOString(),
        })) as KompetensiPendeta;
      } catch (err) {
        throw toError(err);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-kompetensi', variables.id_pendeta] });
    },
  });
}

export function useUpdateKompetensi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id_kompetensi,
      ...payload
    }: Partial<KompetensiPendeta> & { id_kompetensi: string; id_pendeta: string }) => {
      try {
        return (await updateKompetensiAction(id_kompetensi, payload)) as KompetensiPendeta;
      } catch (err) {
        throw toError(err);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-kompetensi', variables.id_pendeta] });
    },
  });
}

export function useDeleteKompetensi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_kompetensi, id_pendeta: _id_pendeta }: { id_kompetensi: string; id_pendeta: string }) => {
      try {
        return await deleteKompetensiAction(id_kompetensi);
      } catch (err) {
        throw toError(err);
      }
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
  return useQuery<KeterlibatanPendeta[]>({
    queryKey: ['profile-keterlibatan', idPendeta],
    enabled: Boolean(idPendeta),
    queryFn: async () => {
      if (!idPendeta) return [];
      return (await getKeterlibatanAction(idPendeta)) as KeterlibatanPendeta[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateKeterlibatan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<KeterlibatanPendeta, 'id_keterlibatan'>) => {
      const id = generatePatternId('KTL');
      try {
        return (await createKeterlibatanAction({
          id_keterlibatan: id,
          ...payload,
          updated_at: new Date().toISOString(),
        })) as KeterlibatanPendeta;
      } catch (err) {
        throw toError(err);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keterlibatan', variables.id_pendeta] });
    },
  });
}

export function useUpdateKeterlibatan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id_keterlibatan,
      ...payload
    }: Partial<KeterlibatanPendeta> & { id_keterlibatan: string; id_pendeta: string }) => {
      try {
        return (await updateKeterlibatanAction(id_keterlibatan, payload)) as KeterlibatanPendeta;
      } catch (err) {
        throw toError(err);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keterlibatan', variables.id_pendeta] });
    },
  });
}

export function useDeleteKeterlibatan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_keterlibatan, id_pendeta: _id_pendeta }: { id_keterlibatan: string; id_pendeta: string }) => {
      try {
        return await deleteKeterlibatanAction(id_keterlibatan);
      } catch (err) {
        throw toError(err);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-keterlibatan', variables.id_pendeta] });
    },
  });
}
