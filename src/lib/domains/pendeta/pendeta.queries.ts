'use client';

import { useQuery } from '@tanstack/react-query';
import { getPendeta360 } from './pendeta.service';

export function usePendeta360(idPendeta: string) {
  return useQuery({
    queryKey: ['pendeta-360', idPendeta],
    queryFn: () => getPendeta360(idPendeta),
    enabled: !!idPendeta,
    staleTime: 2 * 60 * 1000, // 2 menit
  });
}
