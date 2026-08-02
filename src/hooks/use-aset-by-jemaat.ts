'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface AsetItem {
  id: string;
  id_pos: string;
  nama: string;
  kategori: 'tanah' | 'bangunan' | 'bergerak';
  detail: string;
  kondisi: string;
  updated_at?: string;
}

export function useAsetByJemaat(id_induk: string, activeSubTab: 'all' | 'tanah' | 'bangunan' | 'bergerak' = 'all', page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['aset-by-jemaat', id_induk, activeSubTab, page, pageSize],
    queryFn: async () => {
      const supabase = createClient();

      // 1. Get all Pos IDs under this Jemaat
      const { data: posList } = await supabase
        .from('m_pos_pelkes')
        .select('id_pos, nama_pos')
        .eq('id_induk', id_induk);

      const posIds = (posList || []).map((p) => p.id_pos);
      const posMap = new Map((posList || []).map((p) => [p.id_pos, p.nama_pos]));

      if (posIds.length === 0) {
        return { items: [], total: 0, hasMore: false };
      }

      // Fetch assets based on active sub tab
      let tanah: any[] = [];
      let bangunan: any[] = [];
      let bergerak: any[] = [];

      if (activeSubTab === 'all' || activeSubTab === 'tanah') {
        const { data } = await supabase
          .from('t_aset_tanah')
          .select('*')
          .in('id_pos', posIds);
        tanah = data || [];
      }

      if (activeSubTab === 'all' || activeSubTab === 'bangunan') {
        const { data } = await supabase
          .from('t_aset_bangunan')
          .select('*')
          .in('id_pos', posIds);
        bangunan = data || [];
      }

      if (activeSubTab === 'all' || activeSubTab === 'bergerak') {
        const { data } = await supabase
          .from('t_aset_bergerak')
          .select('*')
          .in('id_pos', posIds);
        bergerak = data || [];
      }

      const allItems: AsetItem[] = [
        ...tanah.map((t) => ({
          id: t.id_tanah,
          id_pos: t.id_pos,
          nama: `Tanah Luas ${t.luas_m2 || '-'} m² (${posMap.get(t.id_pos) || 'Pos'})`,
          kategori: 'tanah' as const,
          detail: `Status: ${t.status_hukum || 'Sertifikat'} • Thn ${t.thn_perolehan || '-'}`,
          kondisi: t.kondisi || 'Baik',
          updated_at: t.created_at,
        })),
        ...bangunan.map((b) => ({
          id: b.id_bangunan,
          id_pos: b.id_pos,
          nama: `${b.nama_bangunan || 'Gedung'} (${posMap.get(b.id_pos) || 'Pos'})`,
          kategori: 'bangunan' as const,
          detail: `Fungsi: ${b.fungsi || 'Pelayanan'} • Berdiri Thn ${b.thn_berdiri || '-'}`,
          kondisi: b.kondisi || 'Baik',
          updated_at: b.created_at,
        })),
        ...bergerak.map((bg) => ({
          id: bg.id_aset_b,
          id_pos: bg.id_pos,
          nama: `${bg.jenis || 'Aset Bergerak'} ${bg.merk_tipe ? `- ${bg.merk_tipe}` : ''} (${posMap.get(bg.id_pos) || 'Pos'})`,
          kategori: 'bergerak' as const,
          detail: `${bg.no_polisi ? `Nopol: ${bg.no_polisi} • ` : ''}Thn ${bg.thn_perolehan || '-'}`,
          kondisi: bg.kondisi || 'Baik',
          updated_at: bg.created_at,
        })),
      ];

      const total = allItems.length;
      const paginatedItems = allItems.slice(0, page * pageSize);
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
