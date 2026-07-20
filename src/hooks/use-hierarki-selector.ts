import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface PosHierarchyDetail {
  id_pos: string;
  nama_pos: string;
  id_induk: string;
  jemaat_induk: {
    id_induk: string;
    nama_induk: string;
    id_mupel: string;
    mupel: {
      id_mupel: string;
      nama_mupel: string;
    };
  };
}

export interface JemaatHierarchyDetail {
  id_induk: string;
  nama_induk: string;
  id_mupel: string;
  mupel: {
    id_mupel: string;
    nama_mupel: string;
  };
}

export function usePosReverseLookup(id_pos?: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['pos-hierarchy', id_pos],
    queryFn: async () => {
      if (!id_pos) return null;
      
      const { data, error } = await supabase
        .from('m_pos_pelkes')
        .select(`
          id_pos,
          nama_pos,
          id_induk,
          jemaat_induk:m_jemaat_induk (
            id_induk,
            nama_induk,
            id_mupel,
            mupel:m_mupel (
              id_mupel,
              nama_mupel
            )
          )
        `)
        .eq('id_pos', id_pos)
        .single();
        
      if (error) throw error;
      
      // Supabase nested relation typing mapping
      const mappedData = data as unknown as any;
      
      return {
        id_pos: mappedData.id_pos,
        nama_pos: mappedData.nama_pos,
        id_induk: mappedData.id_induk,
        jemaat_induk: mappedData.jemaat_induk ? {
          id_induk: mappedData.jemaat_induk.id_induk,
          nama_induk: mappedData.jemaat_induk.nama_induk,
          id_mupel: mappedData.jemaat_induk.id_mupel,
          mupel: mappedData.jemaat_induk.mupel
        } : null
      } as PosHierarchyDetail;
    },
    enabled: !!id_pos,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}

export function useJemaatReverseLookup(id_induk?: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['jemaat-hierarchy', id_induk],
    queryFn: async () => {
      if (!id_induk) return null;
      
      const { data, error } = await supabase
        .from('m_jemaat_induk')
        .select(`
          id_induk,
          nama_induk,
          id_mupel,
          mupel:m_mupel (
            id_mupel,
            nama_mupel
          )
        `)
        .eq('id_induk', id_induk)
        .single();
        
      if (error) throw error;
      
      const mappedData = data as unknown as any;
      
      return {
        id_induk: mappedData.id_induk,
        nama_induk: mappedData.nama_induk,
        id_mupel: mappedData.id_mupel,
        mupel: mappedData.mupel
      } as JemaatHierarchyDetail;
    },
    enabled: !!id_induk,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}

export function useUserMupelAuth() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['user-mupel-auth'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('role, id_mupel')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching user auth', error);
        return null;
      }
      
      return data as { role: string; id_mupel?: string | null };
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function usePosByInduk(id_induk?: string | null) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['pos-by-induk', id_induk],
    queryFn: async () => {
      if (!id_induk) return [];
      
      const { data, error } = await supabase
        .from('m_pos_pelkes')
        .select('id_pos, nama_pos, id_induk, mupel')
        .eq('id_induk', id_induk)
        .order('nama_pos', { ascending: true });
        
      if (error) throw error;
      return (data || []) as { id_pos: string; nama_pos: string; id_induk: string; mupel: string | null }[];
    },
    enabled: !!id_induk,
    staleTime: 1000 * 60 * 10, // 10 mins
  });
}
