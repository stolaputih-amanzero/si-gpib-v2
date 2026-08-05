'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface PosPelkesItemByJemaat {
  id_pos: string;
  id_induk: string;
  nama_pos: string;
  kategori: string | null;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  tgl_berdiri: string | null;
  keterangan: string | null;
  jumlah_kk?: number | null;
  jumlah_jiwa?: number | null;
  foto_url?: string | null;
  pj?: {
    id_pendeta: string;
    nama_lengkap: string;
    no_wa: string | null;
    foto_url?: string | null;
  } | null;
  demografi?: Array<{
    jml_kk: number;
    laki: number;
    perempuan: number;
  }>;
}

export function usePosPelkesByJemaat(id_induk: string, searchQuery: string = '', initialData?: PosPelkesItemByJemaat[]) {
  return useQuery({
    queryKey: ['pos-pelkes-by-jemaat', id_induk, searchQuery],
    queryFn: async (): Promise<PosPelkesItemByJemaat[]> => {
      const supabase = createClient();
      let query = supabase
        .from('m_pos_pelkes')
        .select(`
          id_pos, id_induk, nama_pos, kategori, alamat, latitude, longitude, tgl_berdiri, keterangan, jumlah_kk, jumlah_jiwa, foto_url,
          t_penugasan_pendeta(tgl_mulai, status_tugas, pendeta:m_pendeta(id_pendeta, nama_lengkap, no_wa, foto_url)),
          t_demografi_pelkat(jml_kk, laki, perempuan)
        `)
        .eq('id_induk', id_induk)
        .order('nama_pos', { ascending: true });

      if (searchQuery.trim()) {
        query = query.ilike('nama_pos', `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      // Fetch PJ assignments from multiple fallback sources to ensure sync
      const [{ data: pjData }, { data: pendetaData }] = await Promise.all([
        supabase.from('t_pj_jemaat').select('id_induk, id_pendeta, pendeta:m_pendeta(id_pendeta, nama_lengkap, no_wa)').is('tanggal_selesai', null),
        supabase.from('m_pendeta').select('id_pendeta, id_induk, nama_lengkap, no_wa, is_pj'),
      ]);

      return data.map((item: any) => {
        const activeTugas = item.t_penugasan_pendeta?.find((t: any) => t.status_tugas === 'Aktif');
        let posPj: any = activeTugas?.pendeta || null;

        if (!posPj) {
          posPj = (pjData || []).find((pj: any) => pj.id_induk === item.id_induk)?.pendeta;
        }

        if (!posPj) {
          const pPj = (pendetaData || []).find((pend: any) => pend.id_induk === item.id_induk && pend.is_pj);
          if (pPj) {
            posPj = {
              id_pendeta: pPj.id_pendeta,
              nama_lengkap: pPj.nama_lengkap,
              no_wa: pPj.no_wa,
            };
          }
        }

        if (Array.isArray(posPj)) {
          posPj = posPj[0] || null;
        }

        return {
          id_pos: item.id_pos,
          id_induk: item.id_induk,
          nama_pos: item.nama_pos,
          kategori: item.kategori,
          alamat: item.alamat,
          latitude: item.latitude,
          longitude: item.longitude,
          tgl_berdiri: item.tgl_berdiri,
          keterangan: item.keterangan,
          jumlah_kk: item.jumlah_kk,
          jumlah_jiwa: item.jumlah_jiwa,
          foto_url: item.foto_url,
          pj: posPj ? {
            id_pendeta: posPj.id_pendeta,
            nama_lengkap: posPj.nama_lengkap,
            no_wa: posPj.no_wa,
            foto_url: posPj.foto_url,
          } : null,
          demografi: item.t_demografi_pelkat || [],
        };
      });
    },
    initialData,
    staleTime: 1000 * 60 * 5,
  });
}
