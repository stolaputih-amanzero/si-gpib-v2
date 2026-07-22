import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { createUserAction, deleteUserAction, updateUserRoleAction } from '@/app/(dashboard)/settings/users/actions';

export type UserRole =
  | 'superadmin'
  | 'admin_mupel'
  | 'admin_jemaat'
  | 'pj_pos'
  | 'pendeta'
  | 'pelayan'
  | 'relawan';

export interface UserManagementItem {
  id: string;
  email: string;
  nama_lengkap: string;
  role: UserRole;
  id_mupel?: string | null;
  id_induk?: string | null;
  id_pos?: string | null;
  status: 'Active' | 'Inactive' | 'Pending';
  created_at?: string;
  mupel?: { id_mupel: string; nama_mupel: string } | null;
  jemaat_induk?: { id_induk: string; nama_induk: string } | null;
  pos_pelkes?: { id_pos: string; nama_pos: string } | null;
}

export interface UpdateUserPayload {
  id: string;
  role: UserRole;
  nama_lengkap: string;
  email: string;
  id_mupel?: string | null;
  id_induk?: string | null;
  id_pos?: string | null;
  status?: 'Active' | 'Inactive' | 'Pending';
}

/**
 * Hook to fetch users list with joined hierarchy names for Superadmin Management
 */
export function useUsersList(search?: string, roleFilter?: string) {
  const supabase = createClient();

  return useQuery<UserManagementItem[]>({
    queryKey: ['users-management-list', search || 'all', roleFilter || 'all'],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          nama_lengkap,
          role,
          id_mupel,
          id_induk,
          id_pos,
          status,
          created_at,
          mupel:m_mupel(id_mupel, nama_mupel),
          jemaat_induk:m_jemaat_induk(id_induk, nama_induk),
          pos_pelkes:m_pos_pelkes(id_pos, nama_pos)
        `)
        .order('created_at', { ascending: false });

      if (roleFilter && roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Falling back from joined users query:', error);
        // Fallback for simple users table structure
        const { data: rawUsers, error: rawErr } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (rawErr) throw rawErr;
        return (rawUsers || []).map((u: any) => ({
          id: u.id,
          email: u.email || 'user@gpib.or.id',
          nama_lengkap: u.nama_lengkap || u.nama || 'Pengguna SI GPIB',
          role: u.role || 'pelayan',
          id_mupel: u.id_mupel || null,
          id_induk: u.id_induk || null,
          id_pos: u.id_pos || null,
          status: u.status || 'Active',
          created_at: u.created_at || new Date().toISOString(),
        })) as UserManagementItem[];
      }

      let result = (data || []).map((u: any) => ({
        id: u.id,
        email: u.email || 'user@gpib.or.id',
        nama_lengkap: u.nama_lengkap || u.nama || 'Pengguna SI GPIB',
        role: u.role || 'pelayan',
        id_mupel: u.id_mupel || null,
        id_induk: u.id_induk || null,
        id_pos: u.id_pos || null,
        status: u.status || 'Active',
        created_at: u.created_at,
        mupel: u.mupel || null,
        jemaat_induk: u.jemaat_induk || null,
        pos_pelkes: u.pos_pelkes || null,
      })) as UserManagementItem[];

      if (search) {
        const q = search.toLowerCase();
        result = result.filter(
          (u) =>
            u.nama_lengkap.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q) ||
            (u.mupel?.nama_mupel || '').toLowerCase().includes(q) ||
            (u.jemaat_induk?.nama_induk || '').toLowerCase().includes(q) ||
            (u.pos_pelkes?.nama_pos || '').toLowerCase().includes(q)
        );
      }

      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}

/**
 * Hook to update user role and assigned hierarchy IDs (Poka-Yoke RBAC)
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      return updateUserRoleAction({
        id: payload.id,
        role: payload.role,
        nama_lengkap: payload.nama_lengkap,
        email: payload.email,
        id_mupel: payload.id_mupel || null,
        id_induk: payload.id_induk || null,
        id_pos: payload.id_pos || null,
        status: payload.status || 'Active',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management-list'] });
      queryClient.invalidateQueries({ queryKey: ['user-mupel-auth'] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      email: string;
      nama_lengkap: string;
      role: string;
      password?: string;
      id_mupel: string | null;
      id_induk: string | null;
      id_pos: string | null;
      status: 'Active' | 'Inactive' | 'Pending';
    }) => {
      return createUserAction(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management-list'] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return deleteUserAction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management-list'] });
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    },
  });
}
