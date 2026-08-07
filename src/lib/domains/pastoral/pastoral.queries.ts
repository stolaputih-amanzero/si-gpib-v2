// src/lib/domains/pastoral/pastoral.queries.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submitLogPastoral, getLogPastoralList, getPastoralStats } from './pastoral.service';
import type { PastoralFilter } from './pastoral.types';
import { toast } from 'sonner';
import { haptic } from '@/lib/haptic/vibrate';

export function useCreateLogPastoral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitLogPastoral,
    onSuccess: (data: any) => {
      if (data.success) {
        if (data.queued) {
          toast.info('Log disimpan lokal. Akan dikirim saat online.', {
            description: 'Anda sedang offline.',
          });
        } else if (data.idempotent) {
          toast.success('Log sudah tercatat sebelumnya.');
        } else {
          toast.success('Log pastoral berhasil dikirim!');
          haptic('success');
        }
        queryClient.invalidateQueries({ queryKey: ['log-pastoral'] });
      } else {
        toast.error('Gagal mengirim log', {
          description: data.error,
        });
        haptic('error');
      }
    },
    onError: (error: Error) => {
      toast.error('Terjadi kesalahan', {
        description: error.message,
      });
      haptic('error');
    },
  });
}

export function useLogPastoralList(filter: PastoralFilter) {
  return useQuery({
    queryKey: ['log-pastoral-list', filter],
    queryFn: () => getLogPastoralList(filter),
    enabled: !!filter.idJemaat,
    staleTime: 5 * 60 * 1000, // 5 menit
  });
}

export function usePastoralStats(idJemaat: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['pastoral-stats', idJemaat, startDate, endDate],
    queryFn: () => getPastoralStats(idJemaat, startDate, endDate),
    enabled: !!idJemaat,
    staleTime: 5 * 60 * 1000,
  });
}
