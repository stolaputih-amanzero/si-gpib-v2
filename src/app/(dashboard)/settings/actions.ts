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
  email?: string;
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
        const fileName = `avatars/avatar-${currentUserId}-${Date.now()}.${ext}`;

        try {
          await clientForStorage.storage.createBucket('pos-pelkes-assets', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
        } catch {}

        let { data: uploadData, error: storageError } = await clientForStorage.storage
          .from('pos-pelkes-assets')
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (storageError) {
          const rootFileName = `avatar-${currentUserId}-${Date.now()}.${ext}`;
          const res2 = await clientForStorage.storage
            .from('pos-pelkes-assets')
            .upload(rootFileName, buffer, {
              contentType: mimeType,
              upsert: true,
            });
          if (!res2.error) {
            storageError = null;
            uploadData = res2.data;
          }
        }

        if (!storageError && uploadData) {
          const uploadedPath = uploadData.path;
          const { data: publicData } = clientForStorage.storage
            .from('pos-pelkes-assets')
            .getPublicUrl(uploadedPath);

          if (publicData?.publicUrl) {
            finalAvatarUrl = publicData.publicUrl;
          }
        } else {
          console.warn('Storage upload error to pos-pelkes-assets, using base64 fallback in DB:', storageError);
        }
      } catch (uploadErr) {
        console.warn('Supabase storage avatar upload warning:', uploadErr);
      }
    }

    // Determine target email
    const newEmail = payload.email?.trim().toLowerCase();
    const isEmailChanging = Boolean(newEmail && newEmail !== currentUserEmail?.toLowerCase());
    const finalEmail = (isEmailChanging && newEmail) ? newEmail : (currentUserEmail || '');

    // 1. Update Auth user metadata & email
    try {
      const authUpdate: any = {
        data: {
          nama_lengkap: payload.nama_lengkap,
          no_hp: payload.no_hp || '',
          avatar_url: finalAvatarUrl,
          foto_url: finalAvatarUrl,
          picture: finalAvatarUrl,
        },
      };

      if (isEmailChanging && newEmail) {
        authUpdate.email = newEmail;
      }

      await supabase.auth.updateUser(authUpdate);
    } catch {}

    // 2. Update public.users row by ID or Email
    const dbClient = createAdminClient() || supabase;

    let targetRowId = currentUserId;
    if (currentUserId) {
      const { data: rowById } = await dbClient
        .from('users')
        .select('id')
        .eq('id', currentUserId)
        .maybeSingle();

      if (rowById) {
        targetRowId = rowById.id;
      } else if (currentUserEmail) {
        const { data: rowByEmail } = await dbClient
          .from('users')
          .select('id')
          .eq('email', currentUserEmail)
          .maybeSingle();

        if (rowByEmail) {
          targetRowId = rowByEmail.id;
        }
      }
    }

    const { error: dbError } = await dbClient
      .from('users')
      .upsert({
        id: targetRowId,
        email: finalEmail,
        nama_lengkap: payload.nama_lengkap,
        no_hp: payload.no_hp || null,
        no_telepon: payload.no_hp || null,
        avatar_url: finalAvatarUrl || null,
        foto_url: finalAvatarUrl || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (dbError) {
      console.error('Error updating users table:', dbError);
    }

    // 2.b If user is linked to m_pendeta, update m_pendeta email, foto_url & nama
    try {
      const { data: userData } = await dbClient
        .from('users')
        .select('id_pendeta')
        .eq('id', targetRowId)
        .maybeSingle();

      if (userData?.id_pendeta) {
        await dbClient
          .from('m_pendeta')
          .update({
            nama_pendeta: payload.nama_lengkap,
            email: finalEmail,
            foto_url: finalAvatarUrl || null,
            no_wa: payload.no_hp || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id_pendeta', userData.id_pendeta);
      } else if (currentUserEmail) {
        await dbClient
          .from('m_pendeta')
          .update({
            nama_pendeta: payload.nama_lengkap,
            email: finalEmail,
            foto_url: finalAvatarUrl || null,
            no_wa: payload.no_hp || null,
            updated_at: new Date().toISOString(),
          })
          .eq('email', currentUserEmail);
      }
    } catch (mErr) {
      console.warn('m_pendeta foto_url update warning:', mErr);
    }

    // 3. Update session cookie safely
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('si_gpib_user_session')?.value;
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        parsed.nama_lengkap = payload.nama_lengkap;
        parsed.email = finalEmail;
        
        if (finalAvatarUrl && !finalAvatarUrl.startsWith('data:image/')) {
          parsed.avatar_url = finalAvatarUrl;
          parsed.foto_url = finalAvatarUrl;
          parsed.user_metadata = {
            ...parsed.user_metadata,
            email: finalEmail,
            nama_lengkap: payload.nama_lengkap,
            no_hp: payload.no_hp,
            avatar_url: finalAvatarUrl,
            foto_url: finalAvatarUrl,
            picture: finalAvatarUrl,
          };
        } else {
          parsed.user_metadata = {
            ...parsed.user_metadata,
            email: finalEmail,
            nama_lengkap: payload.nama_lengkap,
            no_hp: payload.no_hp,
          };
        }

        cookieStore.set('si_gpib_user_session', JSON.stringify(parsed), {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
        });
      } catch {}
    }

    return { success: true, avatar_url: finalAvatarUrl, email: finalEmail };
  } catch (err: any) {
    console.error('Update own profile error:', err);
    return { success: false, error: err?.message || 'Gagal memperbarui profil pengguna' };
  }
}

export async function updatePendetaPelayananAction(payload: {
  id_pendeta?: string;
  nama_lengkap: string;
  gender: string;
  tgl_lahir?: string;
  no_wa?: string;
  tgl_tugas?: string;
  jenis_pendeta?: string;
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

    const dbClient = createAdminClient() || supabase;
    let targetPendetaId = payload.id_pendeta;

    if (!targetPendetaId && currentUserId) {
      const { data: userRow } = await dbClient
        .from('users')
        .select('id_pendeta')
        .eq('id', currentUserId)
        .maybeSingle();
      if (userRow?.id_pendeta) {
        targetPendetaId = userRow.id_pendeta;
      }
    }

    if (!targetPendetaId && currentUserEmail) {
      const { data: pendetaByEmail } = await dbClient
        .from('m_pendeta')
        .select('id_pendeta')
        .eq('email', currentUserEmail)
        .maybeSingle();
      if (pendetaByEmail?.id_pendeta) {
        targetPendetaId = pendetaByEmail.id_pendeta;
      }
    }

    if (!targetPendetaId) {
      return { success: false, error: 'Tidak dapat menemukan ID Pendeta terhubung' };
    }

    const { error: updateError } = await dbClient
      .from('m_pendeta')
      .update({
        nama_lengkap: payload.nama_lengkap.trim(),
        gender: payload.gender,
        tgl_lahir: payload.tgl_lahir || null,
        no_wa: payload.no_wa?.trim() || null,
        tgl_tugas: payload.tgl_tugas || null,
        jenis_pendeta: payload.jenis_pendeta || 'Organik',
        updated_at: new Date().toISOString(),
      })
      .eq('id_pendeta', targetPendetaId);

    if (updateError) {
      console.error('Error updating m_pendeta:', updateError);
      return { success: false, error: updateError.message };
    }

    if (currentUserId) {
      await dbClient
        .from('users')
        .update({
          nama_lengkap: payload.nama_lengkap.trim(),
          no_hp: payload.no_wa?.trim() || null,
        })
        .eq('id', currentUserId);
    }

    return { success: true };
  } catch (err: any) {
    console.error('updatePendetaPelayananAction error:', err);
    return { success: false, error: err?.message || 'Gagal memperbarui biodata pendeta' };
  }
}
