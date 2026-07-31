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

export interface SelectorOptionItem {
  id: string;
  nama: string;
  parentId?: string | null;
  kategori?: string | null;
}

export interface UserHierarchyAuth {
  role: string;
  id_mupel?: string | null;
  id_induk?: string | null;
  id_pos?: string | null;
  id_pendeta?: string | null;
}

/**
 * Ultra-Fast Hook: Fetch lightweight Mupel list for Dropdown selectors
 */
export function useMupelOptions() {
  const supabase = createClient();

  return useQuery<SelectorOptionItem[]>({
    queryKey: ['mupel-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('m_mupel')
        .select('id_mupel, nama_mupel')
        .order('id_mupel', { ascending: true });

      if (error) throw error;
      return (data || []).map((m) => ({
        id: m.id_mupel,
        nama: m.nama_mupel,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour memory cache
    gcTime: 1000 * 60 * 60 * 2, // 2 hours retention
  });
}

/**
 * Ultra-Fast Hook: Fetch lightweight Jemaat Induk list for Dropdown selectors
 */
export function useJemaatOptions(id_mupel?: string | null) {
  const supabase = createClient();

  return useQuery<SelectorOptionItem[]>({
    queryKey: ['jemaat-options', id_mupel || 'all'],
    queryFn: async () => {
      let query = supabase
        .from('m_jemaat_induk')
        .select('id_induk, nama_induk, id_mupel')
        .order('nama_induk', { ascending: true });

      if (id_mupel && id_mupel !== 'all') {
        query = query.eq('id_mupel', id_mupel);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((j) => ({
        id: j.id_induk,
        nama: j.nama_induk,
        parentId: j.id_mupel,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour memory cache
    gcTime: 1000 * 60 * 60 * 2,
  });
}

/**
 * Ultra-Fast Hook: Fetch lightweight Pos Pelkes list for Dropdown selectors
 */
export function usePosOptions(id_induk?: string | null) {
  const supabase = createClient();

  return useQuery<SelectorOptionItem[]>({
    queryKey: ['pos-options', id_induk || 'all'],
    queryFn: async () => {
      let query = supabase
        .from('m_pos_pelkes')
        .select('id_pos, nama_pos, id_induk, kategori')
        .order('nama_pos', { ascending: true });

      if (id_induk && id_induk !== 'all') {
        query = query.eq('id_induk', id_induk);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((p) => ({
        id: p.id_pos,
        nama: p.nama_pos,
        parentId: p.id_induk,
        kategori: p.kategori,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour memory cache
    gcTime: 1000 * 60 * 60 * 2,
  });
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

      const mappedData = data as unknown as any;

      return {
        id_pos: mappedData.id_pos,
        nama_pos: mappedData.nama_pos,
        id_induk: mappedData.id_induk,
        jemaat_induk: mappedData.jemaat_induk
          ? {
              id_induk: mappedData.jemaat_induk.id_induk,
              nama_induk: mappedData.jemaat_induk.nama_induk,
              id_mupel: mappedData.jemaat_induk.id_mupel,
              mupel: mappedData.jemaat_induk.mupel,
            }
          : null,
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
        mupel: mappedData.mupel,
      } as JemaatHierarchyDetail;
    },
    enabled: !!id_induk,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}

/**
 * Poka-Yoke RBAC Hook: Fetch user role & assigned hierarchy IDs (Mupel, Jemaat Induk, Pos Pelkes)
 */
export function useUserMupelAuth() {
  const supabase = createClient();

  return useQuery<UserHierarchyAuth | null>({
    queryKey: ['user-mupel-auth'],
    queryFn: async () => {
      let user: any = null;
      try {
        const { data } = await supabase.auth.getUser();
        user = data?.user;
      } catch {}

      if (!user) {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const body = await res.json();
            user = body?.user;
          }
        } catch {}
      }

      if (!user) return null;

      let dbUser: any = null;
      if (user.id) {
        const { data } = await supabase
          .from('users')
          .select('role, id_mupel, id_induk, id_pos, id_pendeta')
          .eq('id', user.id)
          .maybeSingle();
        dbUser = data;
      }
      if (!dbUser && user.email) {
        const { data } = await supabase
          .from('users')
          .select('role, id_mupel, id_induk, id_pos, id_pendeta')
          .eq('email', user.email)
          .maybeSingle();
        dbUser = data;
      }

      const role = dbUser?.role || user.role || user.user_metadata?.role || 'guest';
      let id_mupel = dbUser?.id_mupel || user.id_mupel || user.user_metadata?.id_mupel || null;
      let id_induk = dbUser?.id_induk || user.id_induk || user.user_metadata?.id_induk || null;
      const id_pos = dbUser?.id_pos || user.id_pos || user.user_metadata?.id_pos || null;
      let id_pendeta = dbUser?.id_pendeta || user.id_pendeta || user.user_metadata?.id_pendeta || null;

      if (!id_pendeta && user.email) {
        const { data: pData } = await supabase
          .from('m_pendeta')
          .select('id_pendeta, id_induk')
          .eq('email', user.email)
          .maybeSingle();
        if (pData) {
          id_pendeta = pData.id_pendeta;
          if (!id_induk) id_induk = pData.id_induk;
        }
      }

      if (id_pendeta && !id_induk) {
        const { data: pData } = await supabase
          .from('m_pendeta')
          .select('id_induk')
          .eq('id_pendeta', id_pendeta)
          .maybeSingle();
        if (pData?.id_induk) {
          id_induk = pData.id_induk;
        }
      }

      return {
        role,
        id_mupel,
        id_induk,
        id_pos,
        id_pendeta,
      };
    },
    staleTime: 0,
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
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}
