'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface PosDetailData {
  id_pos: string;
  id_induk: string;
  nama_pos: string;
  kategori: string | null;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  tgl_berdiri: string | null;
  keterangan: string | null;
  foto_url?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  jumlah_kk?: number | null;
  jumlah_jiwa?: number | null;
  jemaat_induk: {
    nama_induk: string;
    id_induk: string;
    id_mupel: string;
    latitude?: number | null;
    longitude?: number | null;
    keterangan?: string | null;
    mupel?: {
      id_mupel: string;
      nama_mupel: string;
    } | null;
  } | null;
}

export function usePosPelkesDetail(id_pos: string, initialData?: PosDetailData | null) {
  return useQuery({
    queryKey: ['pos-pelkes-detail', id_pos],
    queryFn: async (): Promise<PosDetailData | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('m_pos_pelkes')
        .select(`
          id_pos, id_induk, nama_pos, kategori, alamat, latitude, longitude, tgl_berdiri, keterangan, foto_url, updated_at, updated_by, jumlah_kk, jumlah_jiwa,
          jemaat_induk:m_jemaat_induk(id_induk, nama_induk, id_mupel, latitude, longitude, keterangan, mupel:m_mupel(id_mupel, nama_mupel))
        `)
        .eq('id_pos', id_pos)
        .single();

      if (error || !data) return null;
      return data as unknown as PosDetailData;
    },
    initialData: initialData || undefined,
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}
