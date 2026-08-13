import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useHierarchyStats,
  useMupelList,
  useJemaatByMupel,
  usePosByJemaat,
  isBajemPos,
} from '@/hooks/use-hierarki';
import { useContextUIStore } from '@/stores/useContextUIStore';

export type OrgLevelFilter = 'all' | 'mupel' | 'jemaat' | 'bajem' | 'pos';

export interface OrgDirectoryItem {
  id: string;
  name: string;
  type: 'mupel' | 'jemaat_induk' | 'pos_pelkes' | 'bajem';
  typeLabel: string;
  mupelName?: string;
  mupelId?: string;
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

const norm = (str?: string | null) => (str || '').replace(/[\s\-_]+/g, '').toUpperCase();

export function useOrgDirectory() {
  const searchParams = useSearchParams();
  const { optimisticContextId } = useContextUIStore();

  const tabParam = searchParams?.get('tab') as OrgLevelFilter | null;
  const qParam = searchParams?.get('q') || '';
  const mupelParam = searchParams?.get('mupel');
  const jemaatParam = searchParams?.get('jemaat');
  const posParam = searchParams?.get('pos');

  const initialTab: OrgLevelFilter = tabParam && ['all', 'mupel', 'jemaat', 'bajem', 'pos'].includes(tabParam) 
    ? tabParam 
    : 'all';

  const [activeTab, setActiveTab] = useState<OrgLevelFilter>(initialTab);
  const [searchQuery, setSearchQuery] = useState(qParam);

  // Sync state when URL params change (e.g. from statcard deep links)
  useEffect(() => {
    if (tabParam && ['all', 'mupel', 'jemaat', 'bajem', 'pos'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    if (qParam !== undefined) {
      setSearchQuery(qParam);
    }
  }, [tabParam, qParam]);

  // 1. Consume certified F3 hooks
  const { isLoading: isStatsLoading, refetch: refetchStats } = useHierarchyStats();
  const { data: mupelList, isLoading: isMupelLoading, isError: isMupelError, refetch: refetchMupel } = useMupelList();
  const { data: jemaatList, isLoading: isJemaatLoading, isError: isJemaatError, refetch: refetchJemaat } = useJemaatByMupel('all');
  const { data: posList, refetch: refetchPos } = usePosByJemaat('all');

  const isLoading = isStatsLoading || isMupelLoading || isJemaatLoading;
  const isError = Boolean(isMupelError && isJemaatError);

  const refetchAll = () => {
    refetchStats();
    refetchMupel();
    refetchJemaat();
    refetchPos();
  };

  // 2. Map F3 Domain Entities to Application View Models with complete cross-references
  const allItems: OrgDirectoryItem[] = useMemo(() => {
    const result: OrgDirectoryItem[] = [];

    // Lookup map from Jemaat Induk to Mupel
    const jmtToMupelMap = new Map<string, { id_mupel?: string; nama_mupel?: string }>();
    (jemaatList || []).forEach(j => {
      jmtToMupelMap.set(j.id_induk, { id_mupel: j.id_mupel, nama_mupel: j.mupel?.nama_mupel });
    });

    // Add Mupels
    (mupelList || []).forEach((m) => {
      result.push({
        id: m.id_mupel,
        name: m.nama_mupel,
        type: 'mupel',
        typeLabel: 'Mupel',
        leaderName: m.keterangan || null,
        leaderRole: 'Ketua Mupel',
        posCount: m.pos_count || 0,
        bajemCount: m.bajem_count || 0,
        detailUrl: `/org/${m.id_mupel}`,
      });
    });

    // Add Jemaat
    (jemaatList || []).forEach((j) => {
      result.push({
        id: j.id_induk,
        name: j.nama_induk,
        type: 'jemaat_induk',
        typeLabel: 'Jemaat',
        mupelName: j.mupel?.nama_mupel,
        mupelId: j.id_mupel,
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
      const jInfo = jmtToMupelMap.get(p.id_induk);
      const resolvedMupelId = p.jemaat_induk?.id_mupel || jInfo?.id_mupel;
      const resolvedMupelName = p.jemaat_induk?.mupel?.nama_mupel || jInfo?.nama_mupel;

      result.push({
        id: p.id_pos,
        name: p.nama_pos,
        type: isBajem ? 'bajem' : 'pos_pelkes',
        typeLabel: isBajem ? 'Bajem' : 'Pos Pelkes',
        parentName: p.jemaat_induk?.nama_induk,
        mupelName: resolvedMupelName,
        mupelId: resolvedMupelId,
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

  // 3. Scope items according to active Context Switcher / URL Parameter
  const scopedItems = useMemo(() => {
    const activeContext = optimisticContextId || null;
    const effectiveMupel = mupelParam || (activeContext && (activeContext.startsWith('M -') || activeContext.startsWith('MPL-') || activeContext.startsWith('M-')) ? activeContext : null);
    const effectiveJemaat = jemaatParam || (activeContext && (activeContext.startsWith('ORG-') || activeContext.startsWith('JMT-')) ? activeContext : null);
    const effectivePos = posParam || (activeContext && activeContext.startsWith('POS-') ? activeContext : null);

    if (!effectiveMupel && !effectiveJemaat && !effectivePos) {
      return allItems;
    }

    const targetMupelObj = effectiveMupel
      ? (mupelList || []).find((m) => norm(m.id_mupel) === norm(effectiveMupel) || norm(m.nama_mupel) === norm(effectiveMupel))
      : null;

    const targetMupelIdNorm = targetMupelObj ? norm(targetMupelObj.id_mupel) : (effectiveMupel ? norm(effectiveMupel) : null);
    const targetMupelNameNorm = targetMupelObj ? norm(targetMupelObj.nama_mupel) : null;

    return allItems.filter((item) => {
      if (effectiveMupel) {
        if (item.type === 'mupel') {
          const matchId = targetMupelIdNorm ? norm(item.id) === targetMupelIdNorm : false;
          const matchName = targetMupelNameNorm ? norm(item.name).includes(targetMupelNameNorm) : false;
          if (!matchId && !matchName) return false;
        } else if (item.type === 'jemaat_induk') {
          const matchMupelId = targetMupelIdNorm ? (norm(item.mupelId) === targetMupelIdNorm || norm(item.parentId) === targetMupelIdNorm) : false;
          const matchMupelName = targetMupelNameNorm && item.mupelName ? norm(item.mupelName).includes(targetMupelNameNorm) : false;
          if (!matchMupelId && !matchMupelName) return false;
        } else if (item.type === 'pos_pelkes' || item.type === 'bajem') {
          const matchMupelId = targetMupelIdNorm && item.mupelId ? norm(item.mupelId) === targetMupelIdNorm : false;
          const matchMupelName = targetMupelNameNorm && item.mupelName ? norm(item.mupelName).includes(targetMupelNameNorm) : false;
          if (!matchMupelId && !matchMupelName) return false;
        }
      } else if (effectiveJemaat) {
        const normJ = norm(effectiveJemaat);
        if (item.type === 'jemaat_induk' && norm(item.id) !== normJ) return false;
        if ((item.type === 'pos_pelkes' || item.type === 'bajem') && norm(item.parentId) !== normJ) return false;
      } else if (effectivePos) {
        const normP = norm(effectivePos);
        if ((item.type === 'pos_pelkes' || item.type === 'bajem') && norm(item.id) !== normP) return false;
      }
      return true;
    });
  }, [allItems, optimisticContextId, mupelParam, jemaatParam, posParam, mupelList]);

  // 4. Calculate responsive StatCard values for the active context scope
  const stats = useMemo(() => {
    let total_mupel = 0;
    let total_jemaat = 0;
    let total_pos = 0;
    let total_bajem = 0;
    let total_jiwa = 0;

    scopedItems.forEach((item) => {
      if (item.type === 'mupel') {
        total_mupel++;
      } else if (item.type === 'jemaat_induk') {
        total_jemaat++;
        total_jiwa += (item.jiwaCount || 0);
      } else if (item.type === 'bajem') {
        total_bajem++;
        total_jiwa += (item.jiwaCount || 0);
      } else if (item.type === 'pos_pelkes') {
        total_pos++;
        total_jiwa += (item.jiwaCount || 0);
      }
    });

    return {
      total_mupel,
      total_jemaat,
      total_pos,
      total_bajem,
      total_jiwa,
      total_kk: 0,
    };
  }, [scopedItems]);

  // 5. UX Presentation-Layer Filtering (Search & Active StatCard Filter Tab)
  const filteredItems = useMemo(() => {
    return scopedItems.filter((item) => {
      // Level Tab Filter (selected from clicking a StatCard)
      if (activeTab === 'mupel' && item.type !== 'mupel') return false;
      if (activeTab === 'jemaat' && item.type !== 'jemaat_induk') return false;
      if (activeTab === 'bajem' && item.type !== 'bajem') return false;
      if (activeTab === 'pos' && item.type !== 'pos_pelkes') return false;

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
  }, [scopedItems, activeTab, searchQuery]);

  return {
    items: filteredItems,
    allItemsCount: scopedItems.length,
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
