import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUserMupelAuth } from './use-hierarki-selector';
import { useMemo } from 'react';
import type { UserRoleScope } from '@/components/analitik/ScopeIndicator';

export interface AnalitikFilter {
  id_mupel?: string;
  id_induk?: string;
  id_pos?: string;
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

// ===== HELPER: Helper Hook for User Role Scope =====
export function useUserRoleScope(): { scope: UserRoleScope | null; isLoading: boolean } {
  const { data: auth, isLoading } = useUserMupelAuth();

  const scope = useMemo(() => {
    if (!auth) return null;

    const role = auth.role || 'guest';
    const isLocked = role !== 'super_user';

    let scopeLabel = 'Anda';
    if (role === 'super_user') scopeLabel = 'Seluruh Indonesia';
    else if (role === 'admin_mupel') scopeLabel = 'Mupel Anda';
    else if (role === 'kmj') scopeLabel = 'Jemaat Anda';
    else if (role === 'pj' || role === 'user') scopeLabel = 'Pos Pelkes Anda';

    return {
      role,
      id_mupel: auth.id_mupel || null,
      id_induk: auth.id_induk || null,
      id_pos: auth.id_pos || null,
      isLocked,
      scopeLabel,
    } as UserRoleScope;
  }, [auth]);

  return { scope, isLoading };
}

// ===== HELPER: Merge user filter with auto-scope =====
function mergeWithAutoScope(
  filter: AnalitikFilter,
  scope: UserRoleScope | null
): AnalitikFilter {
  if (!scope || scope.role === 'super_user') {
    return filter;
  }

  const merged: AnalitikFilter = { ...filter };

  if (scope.role === 'admin_mupel' && scope.id_mupel) {
    merged.id_mupel = scope.id_mupel;
    delete merged.id_induk;
    delete merged.id_pos;
  } else if (scope.role === 'kmj' && scope.id_induk) {
    merged.id_induk = scope.id_induk;
    delete merged.id_pos;
  } else if ((scope.role === 'pj' || scope.role === 'user') && scope.id_pos) {
    merged.id_pos = scope.id_pos;
  }

  return merged;
}

// ===== 1. Fetch KPI Utama (Auto Role-Scoped) =====
export function useAnalitikKPI(filter: AnalitikFilter = {}) {
  const supabase = createClient();
  const { scope, isLoading: isScopeLoading } = useUserRoleScope();

  const effectiveFilter = useMemo(
    () => mergeWithAutoScope(filter, scope),
    [filter, scope]
  );

  const query = useQuery({
    queryKey: ['analitik-kpi', effectiveFilter],
    queryFn: async (): Promise<KPIStats> => {
      // 1a. Query Pos Pelkes Count
      let posQuery = supabase.from('m_pos_pelkes').select('id_pos, id_induk', { count: 'exact' });
      if (effectiveFilter.id_pos) {
        posQuery = posQuery.eq('id_pos', effectiveFilter.id_pos);
      } else if (effectiveFilter.id_induk) {
        posQuery = posQuery.eq('id_induk', effectiveFilter.id_induk);
      } else if (effectiveFilter.id_mupel) {
        const { data: jemaat } = await supabase.from('m_jemaat_induk').select('id_induk').eq('id_mupel', effectiveFilter.id_mupel);
        const idInduks = jemaat?.map((j) => j.id_induk) || [];
        posQuery = posQuery.in('id_induk', idInduks);
      }
      const { count: totalPos } = await posQuery;

      // 1b. Query Total Jiwa
      let posJiwaQuery = supabase.from('m_pos_pelkes').select('jumlah_jiwa, id_induk');
      if (effectiveFilter.id_pos) {
        posJiwaQuery = posJiwaQuery.eq('id_pos', effectiveFilter.id_pos);
      } else if (effectiveFilter.id_induk) {
        posJiwaQuery = posJiwaQuery.eq('id_induk', effectiveFilter.id_induk);
      } else if (effectiveFilter.id_mupel) {
        const { data: jemaat } = await supabase.from('m_jemaat_induk').select('id_induk').eq('id_mupel', effectiveFilter.id_mupel);
        const idInduks = jemaat?.map((j) => j.id_induk) || [];
        posJiwaQuery = posJiwaQuery.in('id_induk', idInduks);
      }
      const { data: posJiwaData } = await posJiwaQuery;
      const totalJiwaFromPos = (posJiwaData || []).reduce((sum: number, curr: any) => sum + (curr.jumlah_jiwa || 0), 0);

      let demoQuery = supabase.from('t_demografi_pelkat').select('laki, perempuan, id_pos!inner(id_induk)');
      const { data: demoData } = await demoQuery;

      let filteredDemo = demoData || [];
      if (effectiveFilter.id_induk) {
        filteredDemo = filteredDemo.filter((d: any) => d.id_pos?.id_induk === effectiveFilter.id_induk);
      } else if (effectiveFilter.id_mupel) {
        const { data: jemaat } = await supabase.from('m_jemaat_induk').select('id_induk').eq('id_mupel', effectiveFilter.id_mupel);
        const idInduks = new Set(jemaat?.map((j) => j.id_induk) || []);
        filteredDemo = filteredDemo.filter((d: any) => idInduks.has(d.id_pos?.id_induk));
      }

      const totalJiwaFromPelkat = filteredDemo.reduce((sum: number, curr: any) => sum + (curr.laki || 0) + (curr.perempuan || 0), 0);
      const totalJiwa = totalJiwaFromPos > 0 ? totalJiwaFromPos : totalJiwaFromPelkat;

      // 1c. Query Total Pendeta Aktif
      let pendetaQuery = supabase.from('m_pendeta').select('id_pendeta', { count: 'exact' }).eq('status', 'Aktif');
      if (effectiveFilter.id_induk) {
        pendetaQuery = pendetaQuery.eq('id_induk', effectiveFilter.id_induk);
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
    enabled: !isScopeLoading,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    scope,
    isScopeLocked: scope?.isLocked ?? false,
  };
}

// ===== 2. Fetch Data Demografi per Pelkat (Auto Role-Scoped) =====
export function useAnalitikDemografi(filter: AnalitikFilter = {}) {
  const supabase = createClient();
  const { scope, isLoading: isScopeLoading } = useUserRoleScope();

  const effectiveFilter = useMemo(
    () => mergeWithAutoScope(filter, scope),
    [filter, scope]
  );

  const query = useQuery({
    queryKey: ['analitik-demografi', effectiveFilter],
    queryFn: async (): Promise<DemografiPelkatData[]> => {
      const { data, error } = await supabase
        .from('t_demografi_pelkat')
        .select('kategori_pelkat, laki, perempuan, id_pos!inner(id_induk)');

      if (error) throw error;

      let filteredData = data || [];
      if (effectiveFilter.id_induk) {
        filteredData = filteredData.filter((d: any) => d.id_pos?.id_induk === effectiveFilter.id_induk);
      } else if (effectiveFilter.id_mupel) {
        const { data: jemaat } = await supabase.from('m_jemaat_induk').select('id_induk').eq('id_mupel', effectiveFilter.id_mupel);
        const idInduks = new Set(jemaat?.map((j) => j.id_induk) || []);
        filteredData = filteredData.filter((d: any) => idInduks.has(d.id_pos?.id_induk));
      }

      const orderPelkat = ['PA', 'PT', 'GP', 'PKP', 'PKB', 'PKLU'];
      const aggregatedMap: Record<string, DemografiPelkatData> = {};

      orderPelkat.forEach((k) => {
        aggregatedMap[k] = { kategori: k, laki: 0, perempuan: 0, total: 0 };
      });

      filteredData.forEach((curr: any) => {
        let cat = (curr.kategori_pelkat || '').trim().toUpperCase();
        if (cat.includes('ANAK') || cat === 'PA') cat = 'PA';
        else if (cat.includes('TERUNA') || cat === 'PT') cat = 'PT';
        else if (cat.includes('PEMUDA') || cat === 'GP') cat = 'GP';
        else if (cat.includes('PEREMPUAN') || cat === 'PKP') cat = 'PKP';
        else if (cat.includes('BAPAK') || cat.includes('BAPA') || cat === 'PKB') cat = 'PKB';
        else if (cat.includes('LANJUT') || cat.includes('LANSIA') || cat === 'PKLU') cat = 'PKLU';

        if (aggregatedMap[cat]) {
          aggregatedMap[cat].laki += curr.laki || 0;
          aggregatedMap[cat].perempuan += curr.perempuan || 0;
          aggregatedMap[cat].total += (curr.laki || 0) + (curr.perempuan || 0);
        }
      });

      return Object.values(aggregatedMap);
    },
    enabled: !isScopeLoading,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    scope,
    isScopeLocked: scope?.isLocked ?? false,
  };
}

// ===== 3. Fetch Status Pengajuan Bantuan (Donut Chart - Auto Role-Scoped) =====
export function useAnalitikBantuan(filter: AnalitikFilter = {}) {
  const supabase = createClient();
  const { scope, isLoading: isScopeLoading } = useUserRoleScope();

  const effectiveFilter = useMemo(
    () => mergeWithAutoScope(filter, scope),
    [filter, scope]
  );

  const query = useQuery({
    queryKey: ['analitik-bantuan', effectiveFilter],
    queryFn: async (): Promise<ChartPieData[]> => {
      const { data, error } = await supabase
        .from('t_pengajuan_bantuan')
        .select('status, id_pos!inner(id_induk)');

      if (error) throw error;

      let filteredData = data || [];
      if (effectiveFilter.id_induk) {
        filteredData = filteredData.filter((d: any) => d.id_pos?.id_induk === effectiveFilter.id_induk);
      } else if (effectiveFilter.id_mupel) {
        const { data: jemaat } = await supabase.from('m_jemaat_induk').select('id_induk').eq('id_mupel', effectiveFilter.id_mupel);
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
    enabled: !isScopeLoading,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    scope,
    isScopeLocked: scope?.isLocked ?? false,
  };
}

// ===== 4. Fetch Kondisi Aset (Pie Chart - Auto Role-Scoped) =====
export function useAnalitikAsetKondisi(filter: AnalitikFilter = {}) {
  const supabase = createClient();
  const { scope, isLoading: isScopeLoading } = useUserRoleScope();

  const effectiveFilter = useMemo(
    () => mergeWithAutoScope(filter, scope),
    [filter, scope]
  );

  const query = useQuery({
    queryKey: ['analitik-aset-kondisi', effectiveFilter],
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
    enabled: !isScopeLoading,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    scope,
    isScopeLocked: scope?.isLocked ?? false,
  };
}
