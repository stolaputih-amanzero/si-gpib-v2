'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface JemaatByMupelItem {
  id_induk: string;
  id_mupel: string;
  nama_induk: string;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  id_kmj: string | null;
  keterangan: string | null;
  jumlah_kk?: number | null;
  jumlah_jiwa?: number | null;
  pos_count: number;
  bajem_count: number;
  demografi?: Array<{
    jml_kk: number;
    laki: number;
    perempuan: number;
  }>;
}

export function useJemaatByMupel(id_mupel: string, searchQuery: string = '', initialData?: JemaatByMupelItem[]) {
  return useQuery({
    queryKey: ['jemaat-by-mupel', id_mupel, searchQuery],
    queryFn: async (): Promise<JemaatByMupelItem[]> => {
      const supabase = createClient();
      let query = supabase
        .from('m_jemaat_induk')
        .select(`
          id_induk, id_mupel, nama_induk, alamat, latitude, longitude, id_kmj, keterangan, jumlah_kk, jumlah_jiwa,
          m_pos_pelkes(id_pos, nama_pos, t_demografi_pelkat(jml_kk, laki, perempuan))
        `)
        .eq('id_mupel', id_mupel)
        .order('nama_induk', { ascending: true });

      if (searchQuery.trim()) {
        query = query.ilike('nama_induk', `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((jemaat: any) => {
        const posItems = jemaat.m_pos_pelkes || [];
        const bajemCount = posItems.filter(
          (p: any) => p.kategori === 'Bajem' || (p.nama_pos || '').toLowerCase().startsWith('bajem')
        ).length;
        const posCount = posItems.length - bajemCount;

        const allDemo = posItems.flatMap((p: any) => p.t_demografi_pelkat || []);

        return {
          id_induk: jemaat.id_induk,
          id_mupel: jemaat.id_mupel,
          nama_induk: jemaat.nama_induk,
          alamat: jemaat.alamat,
          latitude: jemaat.latitude,
          longitude: jemaat.longitude,
          id_kmj: jemaat.id_kmj,
          keterangan: jemaat.keterangan,
          jumlah_kk: jemaat.jumlah_kk,
          jumlah_jiwa: jemaat.jumlah_jiwa,
          pos_count: posCount,
          bajem_count: bajemCount,
          demografi: allDemo,
        };
      });
    },
    initialData,
    staleTime: 1000 * 60 * 5,
  });
}
