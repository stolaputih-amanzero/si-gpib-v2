import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function usePendetaList(options?: any) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['pendeta-list', options],
    queryFn: async () => {
      let query = supabase.from('m_pendeta').select('*').order('nama_lengkap', { ascending: true });
      // If we needed to filter by idMupel, we would join with jemaat_induk here. 
      // For now, we just return the query.
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });
}
