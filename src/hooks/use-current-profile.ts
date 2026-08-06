// src/hooks/use-current-profile.ts
// Hook untuk mengambil profil user yang sedang login beserta scope hierarkinya.
// Digunakan untuk role-based rendering (ReviewActions, AjukanUlangButton, dll).

'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export type UserRole = 'super_user' | 'admin_mupel' | 'kmj' | 'pj' | 'user';

export interface CurrentProfile {
  id: string;
  role: UserRole;
  id_pendeta: string | null;
  id_mupel: string | null;
  id_induk: string | null;
  id_pos: string | null;
  nama_lengkap: string | null;
}

export function useCurrentProfile() {
  return useQuery({
    queryKey: ['current-profile'],
    queryFn: async (): Promise<CurrentProfile | null> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('users')
        .select('id, role, id_pendeta, id_mupel, id_induk, id_pos, nama_lengkap, status')
        .eq('id', user.id)
        .single();

      if (error || !profile || profile.status !== 'Aktif') {
        return null;
      }

      return profile as CurrentProfile;
    },
    staleTime: 5 * 60 * 1000, // 5 menit — profil jarang berubah
    gcTime: 10 * 60 * 1000,
  });
}
