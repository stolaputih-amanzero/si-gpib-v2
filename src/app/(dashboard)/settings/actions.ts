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
        const clientForStorage = createAdminClient() || supabase;
        const base64Data = finalAvatarUrl.split(',')[1];
        const mimeType = finalAvatarUrl.split(';')[0].split(':')[1] || 'image/jpeg';
        const ext = mimeType.split('/')[1] || 'jpg';
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `avatar-${currentUserId}-${Date.now()}.${ext}`;

        // Attempt 1: Upload to root of 'pos-pelkes-assets'
        let { data: uploadData, error: storageError } = await clientForStorage.storage
          .from('pos-pelkes-assets')
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        // Attempt 2: If root upload failed, try subfolder 'avatars/'
        if (storageError) {
          const subfolderPath = `avatars/${fileName}`;
          const res2 = await clientForStorage.storage
            .from('pos-pelkes-assets')
            .upload(subfolderPath, buffer, {
              contentType: mimeType,
              upsert: true,
            });
          if (!res2.error) {
            storageError = null;
            uploadData = res2.data;
          }
        }

        if (!storageError) {
          const uploadedPath = uploadData?.path || fileName;
          const { data: publicData } = clientForStorage.storage
            .from('pos-pelkes-assets')
            .getPublicUrl(uploadedPath);

          if (publicData?.publicUrl) {
            finalAvatarUrl = publicData.publicUrl;
          }
        } else {
          console.error('Storage upload error to pos-pelkes-assets:', storageError);
        }
      } catch (uploadErr) {
        console.warn('Supabase storage avatar upload warning:', uploadErr);
      }
    }

    // 1. Update Auth user metadata
    try {
      await supabase.auth.updateUser({
        data: {
          nama_lengkap: payload.nama_lengkap,
          no_hp: payload.no_hp || '',
          avatar_url: finalAvatarUrl,
          foto_url: finalAvatarUrl,
          picture: finalAvatarUrl,
        },
      });
    } catch {}

    // 2. Update public.users row via dbClient (adminClient fallback to user supabase client)
    const dbClient = createAdminClient() || supabase;
    const { error: dbError } = await dbClient
      .from('users')
      .upsert({
        id: currentUserId,
        email: currentUserEmail || '',
        nama_lengkap: payload.nama_lengkap,
        no_hp: payload.no_hp || null,
        avatar_url: finalAvatarUrl || null,
        foto_url: finalAvatarUrl || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (dbError) {
      console.error('Error updating users table:', dbError);
    }

    // 3. Update session cookie safely
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('si_gpib_user_session')?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        parsed.nama_lengkap = payload.nama_lengkap;
        if (!finalAvatarUrl.startsWith('data:image/')) {
          parsed.avatar_url = finalAvatarUrl;
          parsed.foto_url = finalAvatarUrl;
        }
        parsed.user_metadata = {
          ...parsed.user_metadata,
          nama_lengkap: payload.nama_lengkap,
          no_hp: payload.no_hp,
          avatar_url: finalAvatarUrl.startsWith('data:image/') ? (parsed.user_metadata?.avatar_url || '') : finalAvatarUrl,
          foto_url: finalAvatarUrl.startsWith('data:image/') ? (parsed.user_metadata?.foto_url || '') : finalAvatarUrl,
          picture: finalAvatarUrl.startsWith('data:image/') ? (parsed.user_metadata?.picture || '') : finalAvatarUrl,
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
