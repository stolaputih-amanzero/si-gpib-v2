'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface JemaatIndukDetailData {
  id_induk: string;
  id_mupel: string;
  nama_induk: string;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  id_kmj: string | null;
  jemaat_ke?: number | null;
  foto_url?: string | null;
  keterangan: string | null;
  jumlah_sektor?: number | null;
  jumlah_kk?: number | null;
  jumlah_jiwa?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  mupel?: {
    id_mupel: string;
    nama_mupel: string;
  } | null;
  kmj?: {
    id_pendeta: string;
    nama_lengkap: string;
    no_wa: string | null;
    email?: string | null;
    foto_url?: string | null;
  } | null;
}

export function useJemaatDetail(id_induk: string, initialData?: JemaatIndukDetailData | null) {
  return useQuery({
    queryKey: ['jemaat-induk-detail', id_induk],
    queryFn: async (): Promise<JemaatIndukDetailData | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('m_jemaat_induk')
        .select(`
          id_induk, id_mupel, nama_induk, alamat, latitude, longitude, id_kmj, jemaat_ke, foto_url, keterangan, jumlah_sektor, jumlah_kk, jumlah_jiwa, created_at, updated_at,
          mupel:m_mupel(id_mupel, nama_mupel),
          kmj:m_pendeta!m_jemaat_induk_id_kmj_fkey(id_pendeta, nama_lengkap, no_wa, email, foto_url)
        `)
        .eq('id_induk', id_induk)
        .maybeSingle();

      if (error || !data) {
        // Fallback without explicit fkey alias if fkey name differs
        const { data: fallbackData } = await supabase
          .from('m_jemaat_induk')
          .select(`
            id_induk, id_mupel, nama_induk, alamat, latitude, longitude, id_kmj, jemaat_ke, foto_url, keterangan, jumlah_sektor, jumlah_kk, jumlah_jiwa, created_at, updated_at,
            mupel:m_mupel(id_mupel, nama_mupel)
          `)
          .eq('id_induk', id_induk)
          .maybeSingle();

        if (!fallbackData) return null;

        let kmjData = null;
        if (fallbackData.id_kmj) {
          const { data: pData } = await supabase
            .from('m_pendeta')
            .select('id_pendeta, nama_lengkap, no_wa, email, foto_url')
            .eq('id_pendeta', fallbackData.id_kmj)
            .maybeSingle();
          kmjData = pData;
        }

        return {
          ...fallbackData,
          kmj: kmjData,
        } as unknown as JemaatIndukDetailData;
      }

      return data as unknown as JemaatIndukDetailData;
    },
    initialData: initialData || undefined,
    staleTime: 1000 * 60 * 5,
  });
}
