'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUserMupelAuth } from '@/hooks/use-hierarki-selector';

export interface PosPelkesItem {
  id_pos: string;
  id_induk?: string;
  nama_pos: string;
  kategori?: string | null;
  alamat: string | null;
  tgl_berdiri: string | null;
  jemaat_induk?: {
    id_induk: string;
    nama_induk: string;
    id_mupel: string;
    mupel?: {
      id_mupel: string;
      nama_mupel: string;
    } | null;
  } | null;
}

export function usePosPelkes(options?: { initialData?: PosPelkesItem[] }) {
  const supabase = createClient();
  const { data: auth } = useUserMupelAuth();
  const initialData = options?.initialData;
  const hasInitialData = Array.isArray(initialData) && initialData.length > 0;

  const isLocked = auth?.role && auth.role !== 'super_user';

  return useQuery<PosPelkesItem[]>({
    queryKey: ['pos-pelkes', 'list', auth?.role, auth?.id_mupel, auth?.id_induk, auth?.id_pos],
    queryFn: async () => {
      let query = supabase
        .from('m_pos_pelkes')
        .select(`
          id_pos,
          nama_pos,
          kategori,
          alamat,
          tgl_berdiri,
          id_induk,
          jemaat_induk:m_jemaat_induk (
            id_induk,
            nama_induk,
            id_mupel,
            mupel:m_mupel (
              id_mupel,
              nama_mupel
            )
          )
        `);

      if (isLocked && auth) {
        if ((auth.role === 'pj' || auth.role === 'user') && auth.id_pos) {
          query = query.eq('id_pos', auth.id_pos);
        } else if (auth.id_induk) {
          query = query.eq('id_induk', auth.id_induk);
        } else if (auth.id_mupel) {
          const { data: jemaatList } = await supabase
            .from('m_jemaat_induk')
            .select('id_induk')
            .eq('id_mupel', auth.id_mupel);
          const jIds = jemaatList?.map((j) => j.id_induk) || [];
          if (jIds.length > 0) {
            query = query.in('id_induk', jIds);
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching pos_pelkes:', error);
        throw error;
      }

      return (data as unknown as PosPelkesItem[]) || [];
    },
    initialData: hasInitialData ? initialData : undefined,
    staleTime: 5 * 60_000, // 5 minutes master data freshness
    gcTime: 15 * 60_000, // 15 minutes cache memory
    refetchOnWindowFocus: false, // 🔴 Disable auto-refetch on window/keyboard focus
    refetchOnReconnect: false, // 🔴 Disable auto-refetch on reconnect
  });
}
