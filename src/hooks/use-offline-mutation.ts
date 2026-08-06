import { db } from '@/lib/offline/dexie';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { uuidv7 } from 'uuidv7';

export function useOfflineRPC<T extends Record<string, unknown>>(
  rpcName: string, 
  actualMutationFn: (payload: T) => Promise<any>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: T) => {
      // Coba eksekusi langsung (ini akan melempar error jika offline)
      return actualMutationFn(payload);
    },
    onError: async (error: any, variables) => {
      const isNetworkError = !navigator.onLine || error.message?.includes('fetch') || error.message?.includes('Failed to fetch');
      
      if (isNetworkError) {
        await db.pendingSubmissions.add({
          requestId: uuidv7(),
          operationType: 'rpc',
          targetIdentifier: rpcName,
          payload: variables,
          status: 'pending',
          attempts: 0,
          createdAt: Date.now(),
        });
        toast.info('Data Disimpan Luring', 'Koneksi terputus. Data Anda telah diamankan dan akan dikirim secara otomatis saat jaringan pulih.');
      } else {
        toast.error('Gagal Menyimpan', error.message || 'Terjadi kesalahan tidak terduga.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(); // Refresh data global
    }
  });
}

export function useOfflineInsert<T extends Record<string, unknown>>(
  tableName: string, 
  actualMutationFn: (payload: T) => Promise<any>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: T) => {
      // Coba eksekusi langsung
      return actualMutationFn(payload);
    },
    onError: async (error: any, variables) => {
      const isNetworkError = !navigator.onLine || error.message?.includes('fetch') || error.message?.includes('Failed to fetch');
      
      if (isNetworkError) {
        await db.pendingSubmissions.add({
          requestId: uuidv7(),
          operationType: 'insert',
          targetIdentifier: tableName,
          payload: variables,
          status: 'pending',
          attempts: 0,
          createdAt: Date.now(),
        });
        toast.info('Data Disimpan Luring', 'Koneksi terputus. Data Anda telah diamankan dan akan dikirim secara otomatis saat jaringan pulih.');
      } else {
        toast.error('Gagal Menyimpan', error.message || 'Terjadi kesalahan tidak terduga.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(); // Refresh data global
    }
  });
}
