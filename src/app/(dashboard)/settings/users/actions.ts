'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

function isSuperUserRole(role?: string): boolean {
  if (!role) return false
  const r = role.toLowerCase().trim().replace(/[\s_]/g, '')
  return r === 'superuser' || r === 'superadmin' || r === 'sinode' || r === 'admin'
}

async function getAuthenticatedCaller(supabase: any) {
  // Attempt 1: Supabase auth.getUser()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return user
  } catch {}

  // Attempt 2: Read cookies fallback
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('si_gpib_user_session')?.value
    if (sessionCookie) {
      const parsed = JSON.parse(sessionCookie)
      if (parsed?.id) {
        return {
          id: parsed.id,
          email: parsed.email || '',
          user_metadata: { role: parsed.role || 'super_user' },
          role: parsed.role || 'super_user',
        }
      }
    }
  } catch {}

  return null
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

    // 1. Verify authenticated caller
    const caller = await getAuthenticatedCaller(supabase)
    if (!caller) {
      return { success: false, error: 'Unauthorized: Pengguna tidak terautentikasi' }
    }

    // Verify caller role in DB
    const adminClient = createAdminClient()
    const clientForRead = adminClient || supabase

    const { data: userAuth } = await clientForRead
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .maybeSingle()

    const currentRole = userAuth?.role || caller.user_metadata?.role || caller.role || 'guest'

    if (!isSuperUserRole(currentRole)) {
      return { success: false, error: 'Unauthorized: Anda tidak memiliki hak akses untuk membuat pengguna baru' }
    }

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
        id_mupel: payload.id_mupel || null,
        id_induk: payload.id_induk || null,
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

    // 1. Verify authenticated caller
    const caller = await getAuthenticatedCaller(supabase)
    if (!caller) {
      return { success: false, error: 'Unauthorized: Pengguna tidak terautentikasi' }
    }

    const adminClient = createAdminClient()
    const clientForRead = adminClient || supabase

    const { data: userAuth } = await clientForRead
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .maybeSingle()

    const currentRole = userAuth?.role || caller.user_metadata?.role || caller.role || 'guest'

    if (!isSuperUserRole(currentRole)) {
      return { success: false, error: 'Unauthorized: Anda tidak memiliki hak akses untuk manajemen user' }
    }

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
      id_mupel: payload.id_mupel || null,
      id_induk: payload.id_induk || null,
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

    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Terjadi kesalahan tidak terduga saat memperbarui pengguna' }
  }
}

export async function deleteUserAction(id: string) {
  try {
    const supabase = await createClient()

    const caller = await getAuthenticatedCaller(supabase)
    if (!caller) {
      return { success: false, error: 'Unauthorized: Pengguna tidak terautentikasi' }
    }

    const adminClient = createAdminClient()
    const clientForRead = adminClient || supabase

    const { data: userAuth } = await clientForRead
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .maybeSingle()

    const currentRole = userAuth?.role || caller.user_metadata?.role || caller.role || 'guest'

    if (!isSuperUserRole(currentRole)) {
      return { success: false, error: 'Unauthorized: Anda tidak memiliki hak akses untuk manajemen user' }
    }

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

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Terjadi kesalahan tidak terduga saat menghapus pengguna' }
  }
}
