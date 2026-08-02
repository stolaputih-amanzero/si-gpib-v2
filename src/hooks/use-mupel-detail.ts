'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface MupelDetailData {
  id_mupel: string;
  nama_mupel: string;
  keterangan: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function useMupelDetail(id_mupel: string, initialData?: MupelDetailData | null) {
  return useQuery({
    queryKey: ['mupel-detail', id_mupel],
    queryFn: async (): Promise<MupelDetailData | null> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('m_mupel')
        .select('*')
        .eq('id_mupel', id_mupel)
        .maybeSingle();

      if (error || !data) return null;
      return data as MupelDetailData;
    },
    initialData: initialData || undefined,
    staleTime: 1000 * 60 * 5,
  });
}
