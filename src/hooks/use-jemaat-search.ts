import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useJemaatSearch(query: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['jemaat-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from('m_jemaat_induk')
        .select('id_induk, nama_jemaat, m_mupel (nama_mupel)')
        .ilike('nama_jemaat', `%${query}%`)
        .limit(10);
        
      if (error) throw error;
      return data;
    },
    enabled: query.length >= 2,
    staleTime: 60000,
  });
}
