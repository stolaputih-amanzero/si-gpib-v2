'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseAdmin(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function updateOwnProfileAction(payload: {
  nama_lengkap: string;
  no_hp?: string;
  avatar_url?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let currentUserId = user?.id;
    let currentUserEmail = user?.email;

    if (!currentUserId) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('si_gpib_user_session')?.value;
      if (sessionCookie) {
        try {
          const parsed = JSON.parse(sessionCookie);
          currentUserId = parsed.id;
          currentUserEmail = parsed.email;
        } catch {}
      }
    }

    if (!currentUserId) {
      return { success: false, error: 'Unauthorized: Sesi pengguna tidak ditemukan' };
    }

    // 1. Update Auth user metadata
    try {
      await supabase.auth.updateUser({
        data: {
          nama_lengkap: payload.nama_lengkap,
          no_hp: payload.no_hp || '',
          avatar_url: payload.avatar_url || '',
        },
      });
    } catch {}

    // 2. Update public.users row via admin client (bypassing RLS restriction)
    const adminClient = createAdminClient();
    if (adminClient) {
      const { error: dbError } = await adminClient
        .from('users')
        .upsert({
          id: currentUserId,
          email: currentUserEmail || '',
          nama_lengkap: payload.nama_lengkap,
          no_hp: payload.no_hp || null,
          avatar_url: payload.avatar_url || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (dbError) {
        console.error('Error updating users table:', dbError);
      }
    }

    // 3. Update session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('si_gpib_user_session')?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        parsed.nama_lengkap = payload.nama_lengkap;
        parsed.user_metadata = {
          ...parsed.user_metadata,
          nama_lengkap: payload.nama_lengkap,
          no_hp: payload.no_hp,
          avatar_url: payload.avatar_url,
        };
        cookieStore.set('si_gpib_user_session', JSON.stringify(parsed), {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
        });
      } catch {}
    }

    return { success: true };
  } catch (err: any) {
    console.error('Update own profile error:', err);
    return { success: false, error: err?.message || 'Gagal memperbarui profil pengguna' };
  }
}
