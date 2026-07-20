import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface AnalitikFilter {
  id_mupel?: string;
  id_induk?: string;
}

export interface KPIStats {
  totalPos: number;
  totalJiwa: number;
  totalPendeta: number;
  totalAset: number;
  totalBantuanPending: number;
}

export interface DemografiPelkatData {
  kategori: string;
  laki: number;
  perempuan: number;
  total: number;
}

export interface ChartPieData {
  name: string;
  value: number;
  color?: string;
}

// 1. Fetch KPI Utama
export function useAnalitikKPI(filter?: AnalitikFilter) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['analitik-kpi', filter],
    queryFn: async (): Promise<KPIStats> => {
      // 1a. Query Pos Pelkes Count
      let posQuery = supabase.from('m_pos_pelkes').select('id_pos, id_induk', { count: 'exact' });
      if (filter?.id_induk) {
        posQuery = posQuery.eq('id_induk', filter.id_induk);
      } else if (filter?.id_mupel) {
        const { data: jemaat } = await supabase.from('m_jemaat_induk').select('id_induk').eq('id_mupel', filter.id_mupel);
        const idInduks = jemaat?.map((j) => j.id_induk) || [];
        posQuery = posQuery.in('id_induk', idInduks);
      }
      const { count: totalPos } = await posQuery;

      // 1b. Query Total Jiwa (Demografi)
      let demoQuery = supabase.from('t_demografi_pelkat').select('laki, perempuan, id_pos!inner(id_induk)');
      const { data: demoData } = await demoQuery;

      let filteredDemo = demoData || [];
      if (filter?.id_induk) {
        filteredDemo = filteredDemo.filter((d: any) => d.id_pos?.id_induk === filter.id_induk);
      } else if (filter?.id_mupel) {
        // We will fetch jemaat list for mupel if needed
        const { data: jemaat } = await supabase.from('m_jemaat_induk').select('id_induk').eq('id_mupel', filter.id_mupel);
        const idInduks = new Set(jemaat?.map((j) => j.id_induk) || []);
        filteredDemo = filteredDemo.filter((d: any) => idInduks.has(d.id_pos?.id_induk));
      }

      const totalJiwa = filteredDemo.reduce((sum: number, curr: any) => sum + (curr.laki || 0) + (curr.perempuan || 0), 0);

      // 1c. Query Total Pendeta Aktif
      let pendetaQuery = supabase.from('m_pendeta').select('id_pendeta', { count: 'exact' }).eq('status', 'Aktif');
      if (filter?.id_induk) {
        pendetaQuery = pendetaQuery.eq('id_induk', filter.id_induk);
      }
      const { count: totalPendeta } = await pendetaQuery;

      // 1d. Query Total Bantuan Pending
      let bantuanQuery = supabase.from('t_pengajuan_bantuan').select('id_ajuan', { count: 'exact' }).like('status', 'Pending%');
      const { count: totalBantuanPending } = await bantuanQuery;

      // 1e. Query Total Aset (Tanah + Bangunan + Bergerak)
      const { count: tanahCount } = await supabase.from('t_aset_tanah').select('id_aset', { count: 'exact' });
      const { count: bangunanCount } = await supabase.from('t_aset_bangunan').select('id_aset', { count: 'exact' });
      const { count: bergerakCount } = await supabase.from('t_aset_bergerak').select('id_aset', { count: 'exact' });
      const totalAset = (tanahCount || 0) + (bangunanCount || 0) + (bergerakCount || 0);

      return {
        totalPos: totalPos || 0,
        totalJiwa,
        totalPendeta: totalPendeta || 0,
        totalAset,
        totalBantuanPending: totalBantuanPending || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

// 2. Fetch Data Demografi per Pelkat
export function useAnalitikDemografi(filter?: AnalitikFilter) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['analitik-demografi', filter],
    queryFn: async (): Promise<DemografiPelkatData[]> => {
      const { data, error } = await supabase
        .from('t_demografi_pelkat')
        .select('kategori_pelkat, laki, perempuan, id_pos!inner(id_induk)');

      if (error) throw error;

      let filteredData = data || [];
      if (filter?.id_induk) {
        filteredData = filteredData.filter((d: any) => d.id_pos?.id_induk === filter.id_induk);
      } else if (filter?.id_mupel) {
        const { data: jemaat } = await supabase.from('m_jemaat_induk').select('id_induk').eq('id_mupel', filter.id_mupel);
        const idInduks = new Set(jemaat?.map((j) => j.id_induk) || []);
        filteredData = filteredData.filter((d: any) => idInduks.has(d.id_pos?.id_induk));
      }

      const orderPelkat = ['PA', 'PT', 'GP', 'PKP', 'PKB', 'PKLU'];
      const aggregatedMap: Record<string, DemografiPelkatData> = {};

      orderPelkat.forEach((k) => {
        aggregatedMap[k] = { kategori: k, laki: 0, perempuan: 0, total: 0 };
      });

      filteredData.forEach((curr: any) => {
        const kat = curr.kategori_pelkat;
        if (aggregatedMap[kat]) {
          aggregatedMap[kat].laki += curr.laki || 0;
          aggregatedMap[kat].perempuan += curr.perempuan || 0;
          aggregatedMap[kat].total += (curr.laki || 0) + (curr.perempuan || 0);
        }
      });

      return Object.values(aggregatedMap);
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 3. Fetch Status Pengajuan Bantuan (Donut Chart)
export function useAnalitikBantuan(filter?: AnalitikFilter) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['analitik-bantuan', filter],
    queryFn: async (): Promise<ChartPieData[]> => {
      const { data, error } = await supabase
        .from('t_pengajuan_bantuan')
        .select('status, id_pos!inner(id_induk)');

      if (error) throw error;

      let filteredData = data || [];
      if (filter?.id_induk) {
        filteredData = filteredData.filter((d: any) => d.id_pos?.id_induk === filter.id_induk);
      } else if (filter?.id_mupel) {
        const { data: jemaat } = await supabase.from('m_jemaat_induk').select('id_induk').eq('id_mupel', filter.id_mupel);
        const idInduks = new Set(jemaat?.map((j) => j.id_induk) || []);
        filteredData = filteredData.filter((d: any) => idInduks.has(d.id_pos?.id_induk));
      }

      const statusMap: Record<string, number> = {
        'Draft': 0,
        'Pending_KMJ': 0,
        'Pending_Mupel': 0,
        'Pending_Sinode': 0,
        'Approved': 0,
        'Rejected': 0,
      };

      filteredData.forEach((curr: any) => {
        if (statusMap[curr.status] !== undefined) {
          statusMap[curr.status] += 1;
        } else {
          statusMap[curr.status] = 1;
        }
      });

      const labelMapping: Record<string, string> = {
        Draft: 'Draft',
        Pending_KMJ: 'Review KMJ',
        Pending_Mupel: 'Review Mupel',
        Pending_Sinode: 'Review Sinode',
        Approved: 'Disetujui',
        Rejected: 'Ditolak',
      };

      return Object.entries(statusMap)
        .filter(([_, val]) => val > 0)
        .map(([key, value]) => ({
          name: labelMapping[key] || key,
          value,
        }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 4. Fetch Kondisi Aset (Pie Chart)
export function useAnalitikAsetKondisi(filter?: AnalitikFilter) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['analitik-aset-kondisi', filter],
    queryFn: async (): Promise<ChartPieData[]> => {
      const [tanahRes, bangunanRes, bergerakRes] = await Promise.all([
        supabase.from('t_aset_tanah').select('kondisi'),
        supabase.from('t_aset_bangunan').select('kondisi'),
        supabase.from('t_aset_bergerak').select('kondisi'),
      ]);

      const kondisiMap: Record<string, number> = {
        Baik: 0,
        'Rusak Ringan': 0,
        'Rusak Berat': 0,
      };

      const processRows = (rows: any[] | null) => {
        rows?.forEach((r) => {
          const k = r.kondisi || 'Baik';
          if (kondisiMap[k] !== undefined) kondisiMap[k] += 1;
          else kondisiMap[k] = 1;
        });
      };

      processRows(tanahRes.data);
      processRows(bangunanRes.data);
      processRows(bergerakRes.data);

      return Object.entries(kondisiMap).map(([name, value]) => ({
        name,
        value,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}
