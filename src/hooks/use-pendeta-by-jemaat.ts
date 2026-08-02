'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface PendetaItemByJemaat {
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
  tanggal_mulai_pj?: string | null;
  user_id?: string | null;
}

export function usePendetaByJemaat(id_induk: string) {
  return useQuery({
    queryKey: ['pendeta-by-jemaat', id_induk],
    queryFn: async (): Promise<{
      kmj: PendetaItemByJemaat | null;
      pjs: PendetaItemByJemaat[];
      allPendeta: PendetaItemByJemaat[];
    }> => {
      const supabase = createClient();

      // 1. Fetch all registered pendeta for this jemaat
      const { data: pendetaList } = await supabase
        .from('m_pendeta')
        .select(`
          id_pendeta, id_induk, nama_lengkap, no_wa, email, jabatan, status, foto_url, is_kmj, is_pj
        `)
        .eq('id_induk', id_induk)
        .order('nama_lengkap', { ascending: true });

      // 2. Fetch active PJ assignments from t_pj_jemaat
      const { data: pjAssignments } = await supabase
        .from('t_pj_jemaat')
        .select(`
          id, id_induk, id_pendeta, tanggal_mulai, status,
          pendeta:m_pendeta(id_pendeta, id_induk, nama_lengkap, no_wa, email, jabatan, status, foto_url, is_kmj, is_pj)
        `)
        .eq('id_induk', id_induk)
        .is('tanggal_selesai', null);

      // 3. Fetch linked user_id for Profile 360° deep-linking
      const { data: usersList } = await supabase
        .from('users')
        .select('id, id_pendeta')
        .not('id_pendeta', 'is', null);

      const userIdMap = new Map<string, string>();
      (usersList || []).forEach((u) => {
        if (u.id_pendeta) userIdMap.set(u.id_pendeta, u.id);
      });

      const processedAll: PendetaItemByJemaat[] = (pendetaList || []).map((p: any) => ({
        ...p,
        is_kmj: Boolean(p.is_kmj),
        is_pj: Boolean(p.is_pj),
        user_id: userIdMap.get(p.id_pendeta) || p.id_pendeta,
      }));

      const kmj = processedAll.find((p) => p.is_kmj) || null;

      const pjs: PendetaItemByJemaat[] = (pjAssignments || []).map((pj: any) => {
        const p = pj.pendeta || {};
        return {
          id_pendeta: p.id_pendeta || pj.id_pendeta,
          id_induk: p.id_induk || id_induk,
          nama_lengkap: p.nama_lengkap || 'Pendeta Jemaat',
          no_wa: p.no_wa || null,
          email: p.email || null,
          jabatan: p.jabatan || 'Pendeta Jemaat',
          status: p.status || 'Aktif',
          foto_url: p.foto_url || null,
          is_kmj: Boolean(p.is_kmj),
          is_pj: true,
          tanggal_mulai_pj: pj.tanggal_mulai,
          user_id: userIdMap.get(p.id_pendeta || pj.id_pendeta) || p.id_pendeta || pj.id_pendeta,
        };
      });

      return {
        kmj,
        pjs,
        allPendeta: processedAll,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
