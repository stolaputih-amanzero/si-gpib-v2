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

export function useCurrentUser() {
  const supabase = createClient();

  return useQuery<CurrentUserAuth | null>({
    queryKey: ['current-user-auth'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userDb } = await supabase
        .from('users')
        .select('role, id_mupel, id_induk, id_pos')
        .eq('id', user.id)
        .maybeSingle();

      const role = userDb?.role || user.user_metadata?.role || 'guest';
      const isSuperUser = role === 'super_user' || role === 'superadmin';

      return {
        id: user.id,
        email: user.email || '',
        role,
        id_mupel: userDb?.id_mupel || user.user_metadata?.id_mupel || null,
        id_induk: userDb?.id_induk || user.user_metadata?.id_induk || null,
        id_pos: userDb?.id_pos || user.user_metadata?.id_pos || null,
        isSuperUser,
      };
    },
  });
}
