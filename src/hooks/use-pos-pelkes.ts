'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/use-current-user';

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
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const supabase = createClient();

  const scopeKey = currentUser?.id ? `user_${currentUser.id}` : 'public_scope';
  const hasInitialData = Array.isArray(options?.initialData) && options.initialData.length > 0;

  return useQuery<PosPelkesItem[]>({
    queryKey: ['pos-pelkes', 'list', scopeKey],
    queryFn: async () => {
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error fetching pos_pelkes:', error);
        throw error;
      }

      return (data as unknown as PosPelkesItem[]) || [];
    },
    // Guard: Do NOT fetch before currentUser loading is resolved (unless initialData is present)
    enabled: !isUserLoading || hasInitialData,
    initialData: hasInitialData ? options?.initialData : undefined,
    staleTime: 5 * 60_000, // 5 minutes master data freshness
    gcTime: 15 * 60_000, // 15 minutes cache memory
    refetchOnWindowFocus: false, // 🔴 Disable auto-refetch on window/keyboard focus
    refetchOnReconnect: false, // 🔴 Disable auto-refetch on reconnect
  });
}
