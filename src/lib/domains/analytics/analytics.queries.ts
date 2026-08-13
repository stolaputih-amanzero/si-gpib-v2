import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsData } from './analytics.service';
import type { AnalyticsFilter } from './analytics.types';
import { useContextUIStore } from '@/stores/useContextUIStore';

export function useAnalyticsData(filter?: AnalyticsFilter) {
  const { optimisticContextId } = useContextUIStore();

  const effectiveMupel = filter?.idMupel || (optimisticContextId && (optimisticContextId.startsWith('M -') || optimisticContextId.startsWith('MPL-') || optimisticContextId.startsWith('M-')) ? optimisticContextId : undefined);
  const effectiveInduk = filter?.idInduk || (optimisticContextId && (optimisticContextId.startsWith('ORG-') || optimisticContextId.startsWith('JMT-')) ? optimisticContextId : undefined);

  return useQuery({
    queryKey: ['analytics-data', effectiveMupel, effectiveInduk, optimisticContextId],
    queryFn: () => fetchAnalyticsData({ ...filter, idMupel: effectiveMupel, idInduk: effectiveInduk }),
    staleTime: 5 * 60 * 1000, // 5 mins cache
  });
}
