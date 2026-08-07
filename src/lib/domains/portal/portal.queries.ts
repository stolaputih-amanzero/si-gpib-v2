import { useQuery } from '@tanstack/react-query';
import { getPublicPosPelkes, getPosDetail } from './portal.service';

export const portalKeys = {
  all: ['portal'] as const,
  posPelkes: () => [...portalKeys.all, 'pos-pelkes'] as const,
  posDetail: (id: string) => [...portalKeys.all, 'pos-detail', id] as const,
};

export function usePublicPosPelkes() {
  return useQuery({
    queryKey: portalKeys.posPelkes(),
    queryFn: () => getPublicPosPelkes(),
    staleTime: 1000 * 60 * 60, // 1 hour caching
  });
}

export function usePosDetail(idPos: string) {
  return useQuery({
    queryKey: portalKeys.posDetail(idPos),
    queryFn: () => getPosDetail(idPos),
    enabled: !!idPos,
    staleTime: 1000 * 60 * 60, // 1 hour caching
  });
}
