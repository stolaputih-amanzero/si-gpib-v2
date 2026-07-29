import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface CurrentUserAuth {
  id: string;
  email: string;
  role: string;
  id_mupel?: string | null;
  id_induk?: string | null;
  id_pos?: string | null;
  isSuperUser: boolean;
}

export function isSuperUserRole(role?: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim().replace(/[\s_]/g, '');
  return r === 'superuser' || r === 'superadmin' || r === 'sinode' || r === 'admin';
}

export function useCurrentUser() {
  const supabase = createClient();

  return useQuery<CurrentUserAuth | null>({
    queryKey: ['current-user-auth'],
    queryFn: async () => {
      let user: any = null;

      try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
      } catch {}

      if (!user) {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const body = await res.json();
            user = body.user;
          }
        } catch {}
      }

      if (!user) {
        try {
          const cached = localStorage.getItem('si_gpib_cached_user');
          if (cached) user = JSON.parse(cached);
        } catch {}
      }

      if (!user) {
        try {
          const cachedCurr = localStorage.getItem('si_gpib_cached_current_user');
          if (cachedCurr) return JSON.parse(cachedCurr);
        } catch {}
        return null;
      }

      let userDb: any = null;
      try {
        const { data } = await supabase
          .from('users')
          .select('role, id_mupel, id_induk, id_pos')
          .or(`id.eq.${user.id},email.eq.${user.email}`)
          .maybeSingle();
        userDb = data;
      } catch {}

      let role = userDb?.role || user.user_metadata?.role || user.role || 'pendeta';
      if (role === 'user' || role === 'User') role = 'pendeta';
      const isSuperUser = isSuperUserRole(role);

      const currentUserObj: CurrentUserAuth = {
        id: user.id || 'usr-mock-001',
        email: user.email || '',
        role,
        id_mupel: userDb?.id_mupel || user.user_metadata?.id_mupel || user.id_mupel || null,
        id_induk: userDb?.id_induk || user.user_metadata?.id_induk || user.id_induk || null,
        id_pos: userDb?.id_pos || user.user_metadata?.id_pos || user.id_pos || null,
        isSuperUser,
      };

      try {
        localStorage.setItem('si_gpib_cached_current_user', JSON.stringify(currentUserObj));
      } catch {}

      return currentUserObj;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
