// src/lib/domains/pastoral/pastoral.queries.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitLogPastoral } from './pastoral.service';
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
