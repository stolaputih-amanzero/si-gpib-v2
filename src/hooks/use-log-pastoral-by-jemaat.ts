'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { subDays, parseISO, isAfter } from 'date-fns';

export interface PastoralLogByJemaatItem {
  id_log: string;
  id_pos: string;
  tgl: string;
  kegiatan: string;
  jml_jiwa: number | null;
  catatan: string | null;
  foto_url?: string | null;
  nama_pos?: string | null;
  pendeta?: {
    nama_lengkap: string;
  } | null;
}

export function useLogPastoralByJemaat(
  id_induk: string,
  dateFilter: 'all' | '7d' | '30d' | '90d' = 'all',
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ['log-pastoral-by-jemaat', id_induk, dateFilter, page, pageSize],
    queryFn: async () => {
      const supabase = createClient();

      // 1. Get all Pos IDs under this Jemaat Induk
      const { data: posList } = await supabase
        .from('m_pos_pelkes')
        .select('id_pos, nama_pos')
        .eq('id_induk', id_induk);

      const posIds = (posList || []).map((p) => p.id_pos);
      const posMap = new Map((posList || []).map((p) => [p.id_pos, p.nama_pos]));

      if (posIds.length === 0) {
        return { items: [], total: 0, hasMore: false, remaining: 0 };
      }

      // 2. Query t_log_pastoral for these Pos Pelkes
      const { data: rawLogs } = await supabase
        .from('t_log_pastoral')
        .select(`
          id_log, id_pos, tgl, kegiatan, jml_jiwa, catatan, foto_url,
          pendeta:m_pendeta(nama_lengkap)
        `)
        .in('id_pos', posIds)
        .order('tgl', { ascending: false });

      let filteredLogs = (rawLogs || []).map((log: any) => ({
        ...log,
        nama_pos: posMap.get(log.id_pos) || 'Pos Pelkes',
      }));

      // Apply date filter if specified
      if (dateFilter !== 'all') {
        const now = new Date();
        let daysToSub = 7;
        if (dateFilter === '30d') daysToSub = 30;
        if (dateFilter === '90d') daysToSub = 90;
        const thresholdDate = subDays(now, daysToSub);

        filteredLogs = filteredLogs.filter((log) => {
          if (!log.tgl) return false;
          try {
            const logDate = parseISO(log.tgl);
            return isAfter(logDate, thresholdDate);
          } catch {
            return true;
          }
        });
      }

      const total = filteredLogs.length;
      const paginatedItems = filteredLogs.slice(0, page * pageSize);
      const hasMore = paginatedItems.length < total;

      return {
        items: paginatedItems,
        total,
        hasMore,
        remaining: Math.max(0, total - paginatedItems.length),
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
