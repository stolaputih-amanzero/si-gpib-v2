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

    let finalAvatarUrl = payload.avatar_url || '';

    // Upload base64 avatar image to Supabase Storage if provided
    if (finalAvatarUrl && finalAvatarUrl.startsWith('data:image/')) {
      try {
        const adminClient = createAdminClient();
        if (adminClient) {
          const base64Data = finalAvatarUrl.split(',')[1];
          const mimeType = finalAvatarUrl.split(';')[0].split(':')[1] || 'image/jpeg';
          const ext = mimeType.split('/')[1] || 'jpg';
          const buffer = Buffer.from(base64Data, 'base64');
          const fileName = `avatars/avatar-${currentUserId}-${Date.now()}.${ext}`;

          // Try uploading to 'avatars' or 'pos-pelkes-attachments' bucket
          const { error: storageError } = await adminClient.storage
            .from('avatars')
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: true,
            });

          if (!storageError) {
            const { data: publicData } = adminClient.storage
              .from('avatars')
              .getPublicUrl(fileName);
            if (publicData?.publicUrl) {
              finalAvatarUrl = publicData.publicUrl;
            }
          } else {
            // Fallback to 'pos-pelkes-attachments' bucket if 'avatars' is not created
            const { error: fallbackError } = await adminClient.storage
              .from('pos-pelkes-attachments')
              .upload(fileName, buffer, {
                contentType: mimeType,
                upsert: true,
              });

            if (!fallbackError) {
              const { data: publicData } = adminClient.storage
                .from('pos-pelkes-attachments')
                .getPublicUrl(fileName);
              if (publicData?.publicUrl) {
                finalAvatarUrl = publicData.publicUrl;
              }
            }
          }
        }
      } catch (uploadErr) {
        console.warn('Supabase storage avatar upload warning (resilient fallback active):', uploadErr);
      }
    }

    // 1. Update Auth user metadata
    try {
      await supabase.auth.updateUser({
        data: {
          nama_lengkap: payload.nama_lengkap,
          no_hp: payload.no_hp || '',
          avatar_url: finalAvatarUrl,
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
          avatar_url: finalAvatarUrl || null,
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
          avatar_url: finalAvatarUrl,
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

    return { success: true, avatar_url: finalAvatarUrl };
  } catch (err: any) {
    console.error('Update own profile error:', err);
    return { success: false, error: err?.message || 'Gagal memperbarui profil pengguna' };
  }
}
