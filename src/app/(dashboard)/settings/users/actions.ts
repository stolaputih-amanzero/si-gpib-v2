'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { enforceAction } from '@/app/actions/helpers/enforce-action'

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('Konfigurasi NEXT_PUBLIC_SUPABASE_URL tidak ditemukan pada server.')
  }

  if (!key) {
    return null
  }

  return createSupabaseAdmin(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Unused functions removed

async function resolveHierarchyMupel(
  client: any,
  id_mupel: string | null,
  id_induk: string | null,
  id_pos: string | null
): Promise<{ resolved_mupel: string | null; resolved_induk: string | null }> {
  let finalMupel = id_mupel || null
  let finalInduk = id_induk || null

  if (id_pos) {
    const { data: pos } = await client
      .from('m_pos_pelkes')
      .select('id_induk, jemaat_induk:m_jemaat_induk(id_mupel)')
      .eq('id_pos', id_pos)
      .maybeSingle()

    if (pos) {
      if (!finalInduk && pos.id_induk) finalInduk = pos.id_induk
      if (!finalMupel && pos.jemaat_induk?.id_mupel) {
        finalMupel = pos.jemaat_induk.id_mupel
      }
    }
  }

  if (finalInduk && !finalMupel) {
    const { data: jemaat } = await client
      .from('m_jemaat_induk')
      .select('id_mupel')
      .eq('id_induk', finalInduk)
      .maybeSingle()

    if (jemaat?.id_mupel) {
      finalMupel = jemaat.id_mupel
    }
  }

  return { resolved_mupel: finalMupel, resolved_induk: finalInduk }
}

export async function createUserAction(payload: {
  email: string;
  nama_lengkap: string;
  role: string;
  password?: string;
  id_mupel: string | null;
  id_induk: string | null;
  id_pos: string | null;
  status: 'Active' | 'Inactive' | 'Pending';
}) {
  try {
    const supabase = await createClient()

    // 1. Authorization (OC-USER-001)
    const contextAffinityId = payload.id_pos || payload.id_induk || payload.id_mupel || '';
    const outcome = await enforceAction('OC-USER-001', {
      targetEntity: {
        entityId: 'NEW',
        entityType: 'UserAccount',
        contextAffinityId: contextAffinityId,
        contextAffinityLevel: payload.id_pos ? 'POS' : (payload.id_induk ? 'JEMAAT' : 'MUPEL'),
      }
    }, contextAffinityId);

    const adminClient = createAdminClient()
    const clientForRead = adminClient || supabase

    // Inject session context
    await clientForRead.rpc('set_authorization_context', {
      p_context_id: outcome.sessionContext.activeContextId || '',
      p_context_level: outcome.sessionContext.activeContextLevel || '',
      p_user_id: outcome.userId || '',
      p_person_id: outcome.sessionContext.linkedPersonId || '',
      p_effective_role: outcome.sessionContext.effectiveSystemRole || '',
    });

    // Resolve hierarchy IDs defensively
    const { resolved_mupel, resolved_induk } = await resolveHierarchyMupel(
      clientForRead,
      payload.id_mupel,
      payload.id_induk,
      payload.id_pos
    )

    // 2. Create the user in auth or DB
    const tempPassword = payload.password || `Gpib-${Math.floor(100000 + Math.random() * 900000)}`
    let newUserId = `usr-${Date.now()}`

    if (adminClient) {
      const { data: createdAuth, error: authError } = await adminClient.auth.admin.createUser({
        email: payload.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          nama_lengkap: payload.nama_lengkap,
          role: payload.role,
        }
      })

      if (authError || !createdAuth?.user) {
        let detailMsg = authError?.message || 'Gagal membuat akun auth di server'
        return { success: false, error: `Gagal membuat akun auth: ${detailMsg}` }
      }
      newUserId = createdAuth.user.id
    }

    // 3. Upsert public.users row with metadata
    const clientForWrite = adminClient || supabase
    const { error: dbError } = await clientForWrite
      .from('users')
      .upsert({
        id: newUserId,
        nama_lengkap: payload.nama_lengkap,
        email: payload.email,
        role: payload.role,
        id_mupel: resolved_mupel,
        id_induk: resolved_induk,
        id_pos: payload.id_pos || null,
        status: payload.status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (dbError) {
      if (adminClient && newUserId) {
        await adminClient.auth.admin.deleteUser(newUserId)
      }
      return { success: false, error: `Gagal menyimpan data profil pengguna: ${dbError.message}` }
    }

    // Layer 8 Audit
    await clientForWrite.from('t_log_aktivitas').insert({
      id_log: `LOG-USR-${Date.now()}`,
      id_user: outcome.userId,
      aksi: 'user.create',
      objek_type: 'User',
      objek_id: newUserId,
      aktor: outcome.sessionContext.effectiveSystemRole,
      keterangan: `Membuat pengguna baru ${payload.email}`
    });

    return { success: true, data: { id: newUserId, password: tempPassword } }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Terjadi kesalahan tidak terduga saat membuat pengguna' }
  }
}

export async function updateUserRoleAction(payload: {
  id: string;
  role: string;
  nama_lengkap: string;
  email: string;
  id_mupel: string | null;
  id_induk: string | null;
  id_pos: string | null;
  status: 'Active' | 'Inactive' | 'Pending';
}) {
  try {
    const supabase = await createClient()

    // 1. Authorization (OC-USER-002)
    const contextAffinityId = payload.id_pos || payload.id_induk || payload.id_mupel || '';
    const outcome = await enforceAction('OC-USER-002', {
      targetEntity: {
        entityId: payload.id,
        entityType: 'UserAccount',
        contextAffinityId: contextAffinityId,
        contextAffinityLevel: payload.id_pos ? 'POS' : (payload.id_induk ? 'JEMAAT' : 'MUPEL'),
      }
    }, contextAffinityId);

    const adminClient = createAdminClient()
    const clientForRead = adminClient || supabase

    // Inject session context
    await clientForRead.rpc('set_authorization_context', {
      p_context_id: outcome.sessionContext.activeContextId || '',
      p_context_level: outcome.sessionContext.activeContextLevel || '',
      p_user_id: outcome.userId || '',
      p_person_id: outcome.sessionContext.linkedPersonId || '',
      p_effective_role: outcome.sessionContext.effectiveSystemRole || '',
    });

    // Resolve hierarchy IDs defensively
    const { resolved_mupel, resolved_induk } = await resolveHierarchyMupel(
      clientForRead,
      payload.id_mupel,
      payload.id_induk,
      payload.id_pos
    )

    // 2. Update auth user metadata if adminClient is available
    if (adminClient) {
      try {
        await adminClient.auth.admin.updateUserById(payload.id, {
          email: payload.email,
          user_metadata: {
            nama_lengkap: payload.nama_lengkap,
            role: payload.role,
          }
        })
      } catch (authErr) {
        console.warn('Auth admin update user warning:', authErr)
      }
    }

    // 3. Update public.users
    const updateData: any = {
      role: payload.role,
      nama_lengkap: payload.nama_lengkap,
      email: payload.email,
      id_mupel: resolved_mupel,
      id_induk: resolved_induk,
      id_pos: payload.id_pos || null,
      status: payload.status,
      updated_at: new Date().toISOString(),
    }

    const clientForWrite = adminClient || supabase
    const { data, error } = await clientForWrite
      .from('users')
      .upsert({ id: payload.id, ...updateData }, { onConflict: 'id' })
      .select()
      .maybeSingle()

    if (error) {
      return { success: false, error: `Gagal memperbarui user: ${error.message}` }
    }

    // Layer 8 Audit
    await clientForWrite.from('t_log_aktivitas').insert({
      id_log: `LOG-USR-${Date.now()}`,
      id_user: outcome.userId,
      aksi: 'user.update_role',
      objek_type: 'User',
      objek_id: payload.id,
      aktor: outcome.sessionContext.effectiveSystemRole,
      keterangan: `Memperbarui pengguna ${payload.email}`
    });

    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Terjadi kesalahan tidak terduga saat memperbarui pengguna' }
  }
}

export async function deleteUserAction(id: string) {
  try {
    const supabase = await createClient()

    // 1. Authorization (OC-USER-004)
    const outcome = await enforceAction('OC-USER-004', {
      targetEntity: {
        entityId: id,
        entityType: 'UserAccount',
        contextAffinityId: 'SINODE',
        contextAffinityLevel: 'SINODE',
      }
    }, 'SINODE');

    const adminClient = createAdminClient()
    const clientForRead = adminClient || supabase

    // Inject session context
    await clientForRead.rpc('set_authorization_context', {
      p_context_id: outcome.sessionContext.activeContextId || '',
      p_context_level: outcome.sessionContext.activeContextLevel || '',
      p_user_id: outcome.userId || '',
      p_person_id: outcome.sessionContext.linkedPersonId || '',
      p_effective_role: outcome.sessionContext.effectiveSystemRole || '',
    });

    const clientForWrite = adminClient || supabase

    // 1. Delete from public.users first
    const { error: dbError } = await clientForWrite
      .from('users')
      .delete()
      .eq('id', id)

    if (dbError) {
      return { success: false, error: `Gagal menghapus profil user dari DB: ${dbError.message}` }
    }

    // 2. Delete from auth.users if adminClient available
    if (adminClient) {
      try {
        await adminClient.auth.admin.deleteUser(id)
      } catch (authErr) {
        console.warn('Auth admin delete user warning:', authErr)
      }
    }

    // Layer 8 Audit
    await clientForWrite.from('t_log_aktivitas').insert({
      id_log: `LOG-USR-${Date.now()}`,
      id_user: outcome.userId,
      aksi: 'user.delete',
      objek_type: 'User',
      objek_id: id,
      aktor: outcome.sessionContext.effectiveSystemRole,
      keterangan: `Menghapus pengguna ${id}`
    });

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Terjadi kesalahan tidak terduga saat menghapus pengguna' }
  }
}
