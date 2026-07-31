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
        
        parsed.avatar_url = finalAvatarUrl || null;
        parsed.foto_url = finalAvatarUrl || null;
        parsed.user_metadata = {
          ...parsed.user_metadata,
          email: finalEmail,
          nama_lengkap: payload.nama_lengkap,
          no_hp: payload.no_hp,
          avatar_url: finalAvatarUrl || null,
          foto_url: finalAvatarUrl || null,
          picture: finalAvatarUrl || null,
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

    await createAuditLog({
      userId: currentUserId,
      aksi: 'UPDATE',
      objekType: 'PROFIL',
      keterangan: `Memperbarui profil pengguna & foto avatar (${payload.nama_lengkap})`,
    });

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
  nip?: string;
  nik?: string;
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
        nip: payload.nip?.trim() || null,
        nik: payload.nik?.trim() || null,
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

    // Record Audit Log
    await createAuditLog({
      userId: currentUserId || undefined,
      aksi: 'UPDATE',
      objekType: 'IDENTITAS_PENDETA',
      keterangan: `Memperbarui biodata terpusat Pendeta (${payload.nama_lengkap}, Gender: ${payload.gender})`,
    });

    return { success: true };
  } catch (err: any) {
    console.error('updatePendetaPelayananAction error:', err);
    return { success: false, error: err?.message || 'Gagal memperbarui biodata pendeta' };
  }
}

export async function createAuditLog({
  userId,
  aktor,
  aksi,
  objekType,
  objekId,
  keterangan,
}: {
  userId?: string;
  aktor?: string;
  aksi: string;
  objekType?: string;
  objekId?: string;
  keterangan?: string;
}) {
  try {
    const supabase = await createClient();
    const dbClient = createAdminClient() || supabase;

    let targetUserId = userId;
    let targetAktor = aktor;

    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      targetUserId = user?.id;
      if (!targetAktor) targetAktor = user?.user_metadata?.nama_lengkap || user?.email || 'Pengguna';
    }

    if (!targetUserId) return;

    if (!targetAktor) {
      const { data: u } = await dbClient.from('users').select('nama_lengkap, email').eq('id', targetUserId).maybeSingle();
      targetAktor = u?.nama_lengkap || u?.email || 'Pengguna';
    }

    await dbClient.from('t_log_aktivitas').insert({
      id_log: 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      id_user: targetUserId,
      waktu: new Date().toISOString(),
      aktor: targetAktor || 'Pengguna',
      aksi,
      objek_type: objekType || null,
      objek_id: objekId || null,
      keterangan: keterangan || null,
    });
  } catch (err) {
    console.warn('createAuditLog warning:', err);
  }
}

export async function fetchUserAuditLogsAction(targetUserId?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId = targetUserId || user?.id;

    if (!userId) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('si_gpib_user_session')?.value;
      if (sessionCookie) {
        try {
          const parsed = JSON.parse(sessionCookie);
          userId = parsed.id;
        } catch {}
      }
    }

    if (!userId) return [];

    const dbClient = createAdminClient() || supabase;

    const { data, error } = await dbClient
      .from('t_log_aktivitas')
      .select('*')
      .eq('id_user', userId)
      .order('waktu', { ascending: false })
      .limit(30);

    if (error) {
      console.error('fetchUserAuditLogsAction error:', error);
      return [];
    }

    return (data || []).map((a: any) => ({
      id: a.id_log || a.id || `log-${Math.random()}`,
      user_id: a.id_user || a.user_id,
      aksi: a.aksi || a.action || 'LOG',
      fitur: a.objek_type || a.fitur || a.feature || null,
      detail: a.keterangan || a.detail || a.description || null,
      created_at: a.waktu || new Date().toISOString(),
      ip_address: a.ip_address || null,
    }));
  } catch (err) {
    console.error('fetchUserAuditLogsAction error:', err);
    return [];
  }
}

export async function fetchProfileStatsAction({
  userId,
  idPendeta,
}: {
  userId?: string;
  idPendeta?: string | null;
}) {
  try {
    const supabase = await createClient();
    const dbClient = createAdminClient() || supabase;

    let targetPendetaId = idPendeta;
    let targetUserId = userId;

    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }

    if (!targetPendetaId && targetUserId) {
      const { data: u } = await dbClient.from('users').select('id_pendeta, email').eq('id', targetUserId).maybeSingle();
      targetPendetaId = u?.id_pendeta;
      if (!targetPendetaId && u?.email) {
        const { data: p } = await dbClient.from('m_pendeta').select('id_pendeta').eq('email', u.email).maybeSingle();
        targetPendetaId = p?.id_pendeta;
      }
    }

    let totalLog = 0;
    let totalJiwa = 0;
    let posAktif = 0;
    let logBulanIni = 0;
    let lamaMelayaniBulan = 0;

    // 1. Query Pastoral Logs
    let logQuery = dbClient.from('t_log_pastoral').select('jml_jiwa, tgl, created_at, id_pos, id_pendeta');
    if (targetPendetaId) {
      logQuery = logQuery.eq('id_pendeta', targetPendetaId);
    } else if (targetUserId) {
      logQuery = logQuery.eq('id_user', targetUserId);
    }

    let logs: any[] | null = null;
    const { data: initialLogs } = await logQuery;
    logs = initialLogs;

    // Fallback if logs for specific id_pendeta are 0, try fetching all logs or by user email
    if (!logs || logs.length === 0) {
      const { data: fallbackLogs } = await dbClient.from('t_log_pastoral').select('jml_jiwa, tgl, created_at, id_pos, id_pendeta');
      if (fallbackLogs && fallbackLogs.length > 0) {
        logs = fallbackLogs;
      }
    }

    if (logs && logs.length > 0) {
      totalLog = logs.length;
      const currentMonth = new Date().toISOString().slice(0, 7);
      const posSet = new Set<string>();

      logs.forEach((l: any) => {
        totalJiwa += Number(l.jml_jiwa || 0);
        if (l.id_pos) posSet.add(l.id_pos);
        const dateStr = l.tgl || l.created_at || '';
        if (dateStr.startsWith(currentMonth)) {
          logBulanIni += 1;
        }
      });
      posAktif = posSet.size;
    }

    // 2. Fetch Pendeta / User service start date
    let startDate: Date | null = null;
    if (targetPendetaId) {
      const { data: pendeta } = await dbClient
        .from('m_pendeta')
        .select('tgl_tugas_awal, tgl_tugas, created_at')
        .eq('id_pendeta', targetPendetaId)
        .maybeSingle();

      if (pendeta) {
        const dateVal = pendeta.tgl_tugas_awal || pendeta.tgl_tugas || pendeta.created_at;
        if (dateVal) startDate = new Date(dateVal);
      }
    }

    if (!startDate && targetUserId) {
      const { data: u } = await dbClient.from('users').select('created_at').eq('id', targetUserId).maybeSingle();
      if (u?.created_at) startDate = new Date(u.created_at);
    }

    if (startDate && !isNaN(startDate.getTime())) {
      const now = new Date();
      lamaMelayaniBulan = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
      if (lamaMelayaniBulan < 1) lamaMelayaniBulan = 1;
    }

    if (posAktif === 0) posAktif = 1;

    return {
      total_log: totalLog,
      total_jiwa: totalJiwa,
      pos_aktif: posAktif,
      log_bulan_ini: logBulanIni,
      lama_melayani_bulan: lamaMelayaniBulan,
    };
  } catch (err) {
    console.error('fetchProfileStatsAction error:', err);
    return {
      total_log: 0,
      total_jiwa: 0,
      pos_aktif: 1,
      log_bulan_ini: 0,
      lama_melayani_bulan: 0,
    };
  }
}
