'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface PendetaByMupelItem {
  id_pendeta: string;
  id_induk: string;
  nama_lengkap: string;
  no_wa: string | null;
  email: string | null;
  jabatan: string | null;
  status: string | null;
  foto_url: string | null;
  is_kmj: boolean;
  is_pj: boolean;
  nama_induk?: string | null;
  user_id?: string | null;
}

export function usePendetaByMupel(id_mupel: string) {
  return useQuery({
    queryKey: ['pendeta-by-mupel', id_mupel],
    queryFn: async (): Promise<PendetaByMupelItem[]> => {
      const supabase = createClient();

      // 1. Fetch Jemaat Induk in Mupel
      const { data: jemaatList } = await supabase
        .from('m_jemaat_induk')
        .select('id_induk, nama_induk')
        .eq('id_mupel', id_mupel);

      const jemaatIds = (jemaatList || []).map((j) => j.id_induk);
      const jemaatMap = new Map((jemaatList || []).map((j) => [j.id_induk, j.nama_induk]));

      if (jemaatIds.length === 0) return [];

      // 2. Fetch all pendeta registered in these Jemaat Induk
      const { data: rawPendeta } = await supabase
        .from('m_pendeta')
        .select('id_pendeta, id_induk, nama_lengkap, no_wa, email, jabatan, status, foto_url, is_kmj, is_pj')
        .in('id_induk', jemaatIds)
        .order('nama_lengkap', { ascending: true });

      // 3. Fetch linked user_id for Profile 360° deep-linking
      const { data: usersList } = await supabase
        .from('users')
        .select('id, id_pendeta')
        .not('id_pendeta', 'is', null);

      const userIdMap = new Map<string, string>();
      (usersList || []).forEach((u) => {
        if (u.id_pendeta) userIdMap.set(u.id_pendeta, u.id);
      });

      return (rawPendeta || []).map((p: any) => ({
        id_pendeta: p.id_pendeta,
        id_induk: p.id_induk,
        nama_lengkap: p.nama_lengkap,
        no_wa: p.no_wa,
        email: p.email,
        jabatan: p.jabatan,
        status: p.status,
        foto_url: p.foto_url,
        is_kmj: Boolean(p.is_kmj),
        is_pj: Boolean(p.is_pj),
        nama_induk: jemaatMap.get(p.id_induk) || 'Jemaat Induk',
        user_id: userIdMap.get(p.id_pendeta) || p.id_pendeta,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}
