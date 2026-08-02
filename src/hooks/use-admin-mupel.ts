'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface AdminMupelUser {
  id: string;
  nama_lengkap: string;
  email: string;
  no_wa?: string | null;
  foto_url?: string | null;
  role: string;
  id_mupel: string;
}

export function useAdminMupel(id_mupel: string) {
  return useQuery({
    queryKey: ['admin-mupel-users', id_mupel],
    queryFn: async (): Promise<AdminMupelUser[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .select('id, nama_lengkap, email, no_wa, foto_url, role, id_mupel')
        .eq('role', 'admin_mupel')
        .eq('id_mupel', id_mupel);

      if (error || !data) return [];
      return data as AdminMupelUser[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
