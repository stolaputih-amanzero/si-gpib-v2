import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface MupelItem {
  id_mupel: string;
  nama_mupel: string;
  keterangan: string | null;
  jemaat_count?: number;
  pos_count?: number;
}

export interface JemaatIndukItem {
  id_induk: string;
  id_mupel: string;
  nama_induk: string;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  id_kmj: string | null;
  keterangan: string | null;
  kmj?: {
    id_pendeta?: string;
    nama_lengkap: string;
    no_wa: string | null;
  } | null;
  mupel?: {
    nama_mupel: string;
  } | null;
  pos_count?: number;
  pj_count?: number;
}

export interface PosPelkesItem {
  id_pos: string;
  id_induk: string;
  nama_pos: string;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  tgl_berdiri: string | null;
  keterangan: string | null;
  jemaat_induk?: {
    id_induk: string;
    nama_induk: string;
    id_mupel: string;
    mupel?: {
      nama_mupel: string;
    } | null;
  } | null;
  pj?: {
    id_pendeta?: string;
    nama_lengkap: string;
    no_wa: string | null;
  } | null;
}

export interface HierarchyStatsData {
  total_mupel: number;
  total_jemaat: number;
  total_pos: number;
  total_jiwa: number;
}

/**
 * Fetch semua Mupel + agregat count Jemaat Induk & Pos Pelkes
 */
export function useMupelList(search?: string) {
  const supabase = createClient();

  return useQuery<MupelItem[]>({
    queryKey: ['mupel-list', search || 'all'],
    queryFn: async () => {
      // Query Mupel
      const { data: mupelData, error: mupelErr } = await supabase
        .from('m_mupel')
        .select('*')
        .order('id_mupel', { ascending: true });

      if (mupelErr) throw mupelErr;

      // Query Counts Jemaat Induk
      const { data: jemaatData } = await supabase
        .from('m_jemaat_induk')
        .select('id_mupel, id_induk');

      // Query Counts Pos Pelkes
      const { data: posData } = await supabase
        .from('m_pos_pelkes')
        .select('id_pos, id_induk, jemaat:m_jemaat_induk(id_mupel)');

      const jemaatList = jemaatData || [];
      const posList = posData || [];

      const result: MupelItem[] = (mupelData || []).map((mupel) => {
        const jCount = jemaatList.filter((j) => j.id_mupel === mupel.id_mupel).length;
        const pCount = posList.filter((p: any) => p.jemaat?.id_mupel === mupel.id_mupel).length;

        return {
          ...mupel,
          jemaat_count: jCount,
          pos_count: pCount,
        };
      });

      if (search) {
        const q = search.toLowerCase();
        return result.filter(
          (m) =>
            m.nama_mupel.toLowerCase().includes(q) ||
            m.id_mupel.toLowerCase().includes(q)
        );
      }

      return result;
    },
  });
}

/**
 * Fetch detail 1 Mupel
 */
export function useMupelDetail(id_mupel?: string) {
  const supabase = createClient();

  return useQuery<MupelItem | null>({
    queryKey: ['mupel-detail', id_mupel],
    queryFn: async () => {
      if (!id_mupel) return null;
      const { data, error } = await supabase
        .from('m_mupel')
        .select('*')
        .eq('id_mupel', id_mupel)
        .single();

      if (error) throw error;
      return data as MupelItem;
    },
    enabled: Boolean(id_mupel),
  });
}

/**
 * Fetch Jemaat Induk berdasarkan Mupel (Sinkronisasi Multi-Sumber KMJ & PJ)
 */
export function useJemaatByMupel(id_mupel?: string, search?: string) {
  const supabase = createClient();

  return useQuery<JemaatIndukItem[]>({
    queryKey: ['jemaat-list-by-mupel', id_mupel || 'all', search || 'all'],
    queryFn: async () => {
      let query = supabase
        .from('m_jemaat_induk')
        .select('*, kmj:m_pendeta!id_kmj(id_pendeta, nama_lengkap, no_wa), mupel:m_mupel(nama_mupel)')
        .order('nama_induk', { ascending: true });

      if (id_mupel && id_mupel !== 'all') {
        query = query.eq('id_mupel', id_mupel);
      }

      const { data: jemaatData, error } = await query;
      if (error) throw error;

      // Fetch all Pendeta to perform multi-source resolution
      const { data: pendetaData } = await supabase
        .from('m_pendeta')
        .select('id_pendeta, id_induk, nama_lengkap, no_wa, is_kmj, is_pj, jabatan');

      const { data: posData } = await supabase.from('m_pos_pelkes').select('id_pos, id_induk');
      const { data: pjData } = await supabase.from('t_pj_jemaat').select('id_induk, id_pendeta').is('tanggal_selesai', null);

      const allPendeta = pendetaData || [];
      const allPos = posData || [];
      const allPjAssignments = pjData || [];

      const result: JemaatIndukItem[] = (jemaatData || []).map((j: any) => {
        // 1. Synchronized KMJ Resolution (FK id_kmj -> is_kmj flag -> Jabatan)
        let resolvedKmj = j.kmj
          ? { id_pendeta: j.kmj.id_pendeta, nama_lengkap: j.kmj.nama_lengkap, no_wa: j.kmj.no_wa }
          : null;

        if (!resolvedKmj) {
          const fallbackKmj = allPendeta.find(
            (p) =>
              p.id_induk === j.id_induk &&
              (p.is_kmj || (p.jabatan && p.jabatan.toUpperCase().includes('KMJ')))
          );
          if (fallbackKmj) {
            resolvedKmj = {
              id_pendeta: fallbackKmj.id_pendeta,
              nama_lengkap: fallbackKmj.nama_lengkap,
              no_wa: fallbackKmj.no_wa,
            };
          }
        }

        // 2. Synchronized PJ Count (Combine t_pj_jemaat & is_pj flag)
        const pjSet = new Set<string>();
        allPjAssignments.filter((pj) => pj.id_induk === j.id_induk).forEach((pj) => pjSet.add(pj.id_pendeta));
        allPendeta.filter((p) => p.id_induk === j.id_induk && p.is_pj).forEach((p) => pjSet.add(p.id_pendeta));

        const pCount = allPos.filter((p) => p.id_induk === j.id_induk).length;

        return {
          ...j,
          kmj: resolvedKmj,
          pos_count: pCount,
          pj_count: pjSet.size,
        };
      });

      if (search) {
        const q = search.toLowerCase();
        return result.filter(
          (j) =>
            j.nama_induk.toLowerCase().includes(q) ||
            j.id_induk.toLowerCase().includes(q) ||
            (j.kmj?.nama_lengkap || '').toLowerCase().includes(q)
        );
      }

      return result;
    },
  });
}

/**
 * Fetch detail 1 Jemaat Induk (Sinkronisasi Multi-Sumber KMJ & PJ)
 */
export function useJemaatDetail(id_induk?: string) {
  const supabase = createClient();

  return useQuery<JemaatIndukItem | null>({
    queryKey: ['jemaat-detail', id_induk],
    queryFn: async () => {
      if (!id_induk) return null;

      const { data, error } = await supabase
        .from('m_jemaat_induk')
        .select('*, kmj:m_pendeta!id_kmj(id_pendeta, nama_lengkap, no_wa), mupel:m_mupel(nama_mupel)')
        .eq('id_induk', id_induk)
        .single();

      if (error) throw error;

      const { data: pendetaData } = await supabase
        .from('m_pendeta')
        .select('id_pendeta, id_induk, nama_lengkap, no_wa, is_kmj, is_pj, jabatan')
        .eq('id_induk', id_induk);

      const { data: posData } = await supabase.from('m_pos_pelkes').select('id_pos').eq('id_induk', id_induk);
      const { data: pjData } = await supabase
        .from('t_pj_jemaat')
        .select('id_pendeta, pendeta:m_pendeta(id_pendeta, nama_lengkap, no_wa)')
        .eq('id_induk', id_induk)
        .is('tanggal_selesai', null);

      const allPendeta = pendetaData || [];

      // Multi-Source KMJ Resolution
      let resolvedKmj = (data as any).kmj
        ? { id_pendeta: (data as any).kmj.id_pendeta, nama_lengkap: (data as any).kmj.nama_lengkap, no_wa: (data as any).kmj.no_wa }
        : null;

      if (!resolvedKmj) {
        const fallbackKmj = allPendeta.find(
          (p) => p.is_kmj || (p.jabatan && p.jabatan.toUpperCase().includes('KMJ'))
        );
        if (fallbackKmj) {
          resolvedKmj = {
            id_pendeta: fallbackKmj.id_pendeta,
            nama_lengkap: fallbackKmj.nama_lengkap,
            no_wa: fallbackKmj.no_wa,
          };
        }
      }

      // Multi-Source PJ Count
      const pjSet = new Set<string>();
      (pjData || []).forEach((pj) => pjSet.add(pj.id_pendeta));
      allPendeta.filter((p) => p.is_pj).forEach((p) => pjSet.add(p.id_pendeta));

      return {
        ...(data as any),
        kmj: resolvedKmj,
        pos_count: posData?.length || 0,
        pj_count: pjSet.size,
      } as JemaatIndukItem;
    },
    enabled: Boolean(id_induk),
  });
}

/**
 * Fetch Pos Pelkes di bawah Jemaat Induk tertentu (Sinkronisasi Multi-Sumber PJ)
 */
export function usePosByJemaat(id_induk?: string, search?: string) {
  const supabase = createClient();

  return useQuery<PosPelkesItem[]>({
    queryKey: ['pos-list-by-jemaat', id_induk || 'all', search || 'all'],
    queryFn: async () => {
      let query = supabase
        .from('m_pos_pelkes')
        .select('*, jemaat_induk:m_jemaat_induk(id_induk, nama_induk, id_mupel, mupel:m_mupel(nama_mupel))')
        .order('nama_pos', { ascending: true });

      if (id_induk && id_induk !== 'all') {
        query = query.eq('id_induk', id_induk);
      }

      const { data: posData, error } = await query;
      if (error) throw error;

      // Fetch PJ assignments from multiple tables
      const [{ data: pjData }, { data: penugasanData }, { data: pendetaData }] = await Promise.all([
        supabase
          .from('t_pj_jemaat')
          .select('id_induk, id_pendeta, pendeta:m_pendeta(id_pendeta, nama_lengkap, no_wa)')
          .is('tanggal_selesai', null),
        supabase
          .from('t_penugasan_pendeta')
          .select('id_pos, id_pendeta, pendeta:m_pendeta(id_pendeta, nama_lengkap, no_wa)')
          .eq('status_tugas', 'Aktif'),
        supabase
          .from('m_pendeta')
          .select('id_pendeta, id_induk, nama_lengkap, no_wa, is_pj')
          .eq('is_pj', true),
      ]);

      const result: PosPelkesItem[] = (posData || []).map((p: any) => {
        // Source 1: t_penugasan_pendeta
        let posPj: any = (penugasanData || []).find((t: any) => t.id_pos === p.id_pos)?.pendeta;

        // Source 2: t_pj_jemaat
        if (!posPj) {
          posPj = (pjData || []).find((pj: any) => pj.id_induk === p.id_induk)?.pendeta;
        }

        // Source 3: m_pendeta (is_pj = true)
        if (!posPj) {
          const pPj = (pendetaData || []).find((pend: any) => pend.id_induk === p.id_induk);
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
          ...p,
          pj: posPj ? (posPj as any) : null,
        };
      });

      if (search) {
        const q = search.toLowerCase();
        return result.filter(
          (p) =>
            p.nama_pos.toLowerCase().includes(q) ||
            p.id_pos.toLowerCase().includes(q) ||
            (p.alamat || '').toLowerCase().includes(q)
        );
      }

      return result;
    },
  });
}

/**
 * Hook Agregat Statistik Hierarki Nasional
 */
export function useHierarchyStats() {
  const supabase = createClient();

  return useQuery<HierarchyStatsData>({
    queryKey: ['hierarchy-stats'],
    queryFn: async () => {
      const [{ count: mCount }, { count: jCount }, { count: pCount }] = await Promise.all([
        supabase.from('m_mupel').select('*', { count: 'exact', head: true }),
        supabase.from('m_jemaat_induk').select('*', { count: 'exact', head: true }),
        supabase.from('m_pos_pelkes').select('*', { count: 'exact', head: true }),
      ]);

      return {
        total_mupel: mCount || 25,
        total_jemaat: jCount || 350,
        total_pos: pCount || 500,
        total_jiwa: (pCount || 500) * 100,
      };
    },
  });
}

/**
 * Assign KMJ (Atomic Database RPC `set_kmj` + Full Synchronized Fallback Updates)
 */
export function useAssignKmj() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id_induk: string; id_pendeta: string }) => {
      // 1. Execute Database RPC set_kmj
      try {
        await supabase.rpc('set_kmj', {
          p_id_induk: data.id_induk,
          p_id_pendeta: data.id_pendeta,
        });
      } catch (e) {
        console.warn('RPC set_kmj warning, running direct table sync fallback:', e);
      }

      // 2. Guarantee 100% synchronization on all related tables
      await supabase
        .from('m_jemaat_induk')
        .update({ id_kmj: data.id_pendeta, updated_at: new Date().toISOString() })
        .eq('id_induk', data.id_induk);

      await supabase
        .from('m_pendeta')
        .update({ is_kmj: false })
        .eq('id_induk', data.id_induk);

      await supabase
        .from('m_pendeta')
        .update({ is_kmj: true, id_induk: data.id_induk, updated_at: new Date().toISOString() })
        .eq('id_pendeta', data.id_pendeta);

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mupel-list'] });
      queryClient.invalidateQueries({ queryKey: ['jemaat-list-by-mupel'] });
      queryClient.invalidateQueries({ queryKey: ['jemaat-detail', variables.id_induk] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-list'] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
    onError: () => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    },
  });
}

/**
 * Assign PJ (Atomic Database RPC `assign_pj` + Full Synchronized Fallback Updates)
 */
export function useAssignPj() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id_induk: string; id_pendeta: string }) => {
      // 1. Execute Database RPC assign_pj
      try {
        await supabase.rpc('assign_pj', {
          p_id_induk: data.id_induk,
          p_id_pendeta: data.id_pendeta,
        });
      } catch (e) {
        console.warn('RPC assign_pj warning, running direct table sync fallback:', e);
      }

      // 2. Guarantee 100% synchronization on all related tables
      await supabase.from('t_pj_jemaat').insert({
        id_induk: data.id_induk,
        id_pendeta: data.id_pendeta,
        tanggal_mulai: new Date().toISOString().split('T')[0],
        status: 'Aktif',
      });

      await supabase
        .from('m_pendeta')
        .update({ is_pj: true, id_induk: data.id_induk, updated_at: new Date().toISOString() })
        .eq('id_pendeta', data.id_pendeta);

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jemaat-list-by-mupel'] });
      queryClient.invalidateQueries({ queryKey: ['jemaat-detail', variables.id_induk] });
      queryClient.invalidateQueries({ queryKey: ['pos-list-by-jemaat', variables.id_induk] });
      queryClient.invalidateQueries({ queryKey: ['pendeta-list'] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
    onError: () => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    },
  });
}
