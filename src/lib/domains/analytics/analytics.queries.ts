import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsData } from './analytics.service';
import type { AnalyticsFilter } from './analytics.types';

export function useAnalyticsData(filter?: AnalyticsFilter) {
  return useQuery({
    queryKey: ['analytics-data', filter?.idMupel, filter?.idInduk],
    queryFn: () => fetchAnalyticsData(filter),
    staleTime: 5 * 60 * 1000, // 5 mins cache
  });
}
