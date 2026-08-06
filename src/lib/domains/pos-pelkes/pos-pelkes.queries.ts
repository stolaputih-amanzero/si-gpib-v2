import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useAssignedPosList() {
  return useQuery({
    queryKey: ['assigned-pos-list'],
    queryFn: async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const idPendeta = user.user_metadata?.id_pendeta;
      if (!idPendeta) return [];

      const { data, error } = await supabase
        .from('t_penugasan_pendeta')
        .select(`
          id_pos,
          pos:t_pos_pelkes(nama_pos, alamat)
        `)
        .eq('id_pendeta', idPendeta)
        .eq('status_tugas', 'Aktif')
        .is('tgl_selesai', null);

      if (error) throw error;
      
      return data.map((item: any) => ({
        id_pos: item.id_pos,
        nama_pos: item.pos?.nama_pos || item.id_pos,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
