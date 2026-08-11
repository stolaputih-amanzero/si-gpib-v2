import { useState, useMemo } from 'react';
import {
  useHierarchyStats,
  useMupelList,
  useJemaatByMupel,
  usePosByJemaat,
  isBajemPos,
} from '@/hooks/use-hierarki';

export type OrgLevelFilter = 'all' | 'mupel' | 'jemaat' | 'pos';

export interface OrgDirectoryItem {
  id: string;
  name: string;
  type: 'mupel' | 'jemaat_induk' | 'pos_pelkes' | 'bajem';
  typeLabel: string;
  mupelName?: string;
  parentName?: string;
  parentId?: string;
  address?: string | null;
  leaderName?: string | null;
  leaderRole?: 'KMJ' | 'PJ' | 'Ketua Mupel' | null;
  posCount?: number;
  bajemCount?: number;
  kkCount?: number;
  jiwaCount?: number;
  detailUrl: string;
}

export function useOrgDirectory() {
  const [activeTab, setActiveTab] = useState<OrgLevelFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Consume certified F3 hooks (which apply F12/RLS role scoping on data layer)
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError, refetch: refetchStats } = useHierarchyStats();
  const { data: mupelList, isLoading: isMupelLoading, isError: isMupelError, refetch: refetchMupel } = useMupelList();
  const { data: jemaatList, isLoading: isJemaatLoading, isError: isJemaatError, refetch: refetchJemaat } = useJemaatByMupel('all');
  const { data: posList, isLoading: isPosLoading, isError: isPosError, refetch: refetchPos } = usePosByJemaat('all');

  const isLoading = isStatsLoading || isMupelLoading || isJemaatLoading || isPosLoading;
  const isError = isStatsError || isJemaatError || isPosError || isMupelError;

  const refetchAll = () => {
    refetchStats();
    refetchMupel();
    refetchJemaat();
    refetchPos();
  };

  // 2. Map F3 Domain Entities to Application View Models (Presentation Layer Only)
  const items: OrgDirectoryItem[] = useMemo(() => {
    const result: OrgDirectoryItem[] = [];

    // Add Mupels
    (mupelList || []).forEach((m) => {
      result.push({
        id: m.id_mupel,
        name: m.nama_mupel,
        type: 'mupel',
        typeLabel: 'Musyawarah Pelayanan (Mupel)',
        leaderName: m.keterangan || null,
        leaderRole: 'Ketua Mupel',
        posCount: m.pos_count || 0,
        bajemCount: m.bajem_count || 0,
        detailUrl: `/org/${m.id_mupel}`,
      });
    });

    // Add Jemaat Induk
    (jemaatList || []).forEach((j) => {
      result.push({
        id: j.id_induk,
        name: j.nama_induk,
        type: 'jemaat_induk',
        typeLabel: 'Jemaat Induk',
        mupelName: j.mupel?.nama_mupel,
        parentId: j.id_mupel,
        address: j.alamat,
        leaderName: j.kmj?.nama_lengkap || null,
        leaderRole: j.kmj ? 'KMJ' : null,
        posCount: j.pos_count || 0,
        bajemCount: j.bajem_count || 0,
        kkCount: j.jumlah_kk || 0,
        jiwaCount: j.jumlah_jiwa || 0,
        detailUrl: `/org/${j.id_induk}`,
      });
    });

    // Add Pos Pelkes & Bajem
    (posList || []).forEach((p) => {
      const isBajem = isBajemPos(p);
      result.push({
        id: p.id_pos,
        name: p.nama_pos,
        type: isBajem ? 'bajem' : 'pos_pelkes',
        typeLabel: isBajem ? 'Bakal Jemaat (Bajem)' : 'Pos Pelkes',
        parentName: p.jemaat_induk?.nama_induk,
        mupelName: p.jemaat_induk?.mupel?.nama_mupel,
        parentId: p.id_induk,
        address: p.alamat,
        leaderName: p.pj?.nama_lengkap || null,
        leaderRole: p.pj ? 'PJ' : null,
        kkCount: p.jumlah_kk || 0,
        jiwaCount: p.jumlah_jiwa || 0,
        detailUrl: `/org/${p.id_pos}`,
      });
    });

    return result;
  }, [mupelList, jemaatList, posList]);

  // 3. UX Presentation-Layer Filtering (Search & Active Tab)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Level Tab Filter
      if (activeTab === 'mupel' && item.type !== 'mupel') return false;
      if (activeTab === 'jemaat' && item.type !== 'jemaat_induk') return false;
      if (activeTab === 'pos' && item.type !== 'pos_pelkes' && item.type !== 'bajem') return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchMupel = item.mupelName?.toLowerCase().includes(q) || false;
        const matchLeader = item.leaderName?.toLowerCase().includes(q) || false;
        const matchAddress = item.address?.toLowerCase().includes(q) || false;

        return matchName || matchId || matchMupel || matchLeader || matchAddress;
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  return {
    items: filteredItems,
    allItemsCount: items.length,
    stats,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    refetch: refetchAll,
  };
}
