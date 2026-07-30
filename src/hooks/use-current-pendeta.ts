import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { getCurrentPendetaId } from '@/lib/identity/get-current-pendeta';

/**
 * Hook Gerbang Tunggal `useCurrentPendeta`
 * Mengambil `id_pendeta` dari pengguna yang sedang login secara real-time.
 * Cache disimpan selama 5 menit (`staleTime: 5 * 60 * 1000`).
 */
export function useCurrentPendeta() {
  const supabase = createClient();

  return useQuery<string | null>({
    queryKey: ['current-pendeta'],
    queryFn: () => getCurrentPendetaId(supabase),
    staleTime: 5 * 60 * 1000,
  });
}
