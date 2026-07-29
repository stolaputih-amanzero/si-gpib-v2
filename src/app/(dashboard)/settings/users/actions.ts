'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('Konfigurasi NEXT_PUBLIC_SUPABASE_URL tidak ditemukan pada server.')
  }

  if (!key) {
    throw new Error('Konfigurasi SUPABASE_SERVICE_ROLE_KEY belum diisi pada file .env server. Pembuatan/manajemen pengguna memerlukan Service Role Key.')
  }

  return createSupabaseAdmin(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
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

    // 1. Verify authenticated user has super permissions
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized: Pengguna tidak terautentikasi' }
    }

    const { data: userAuth } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const currentRole = userAuth?.role || user.user_metadata?.role || 'guest'

    if (!['super_user', 'superadmin', 'sinode'].includes(currentRole)) {
      return { success: false, error: 'Unauthorized: Anda tidak memiliki hak akses untuk membuat pengguna baru' }
    }

    let adminClient;
    try {
      adminClient = createAdminClient()
    } catch (e: any) {
      return { success: false, error: e.message }
    }
    
    // 2. Create the user in auth
    const tempPassword = payload.password || `Gpib-${Math.floor(100000 + Math.random() * 900000)}`
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
      let detailMsg = '';
      if (authError) {
        detailMsg =
          authError.message ||
          (authError as any).error_description ||
          (authError as any).msg ||
          (authError as any).error ||
          '';
        if (!detailMsg && typeof authError === 'object') {
          try {
            detailMsg = JSON.stringify(authError);
          } catch {
            detailMsg = String(authError);
          }
        }
      }
      if (!detailMsg) {
        detailMsg = 'Data pengguna auth baru tidak berhasil dibuat atau dikembalikan oleh server';
      }
      return { success: false, error: `Gagal membuat akun auth: ${detailMsg}` }
    }

    const newUserId = createdAuth.user.id

    // 3. Upsert public.users row with metadata
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { error: dbError } = await adminClient
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
      // If update fails, clean up the auth user
      await adminClient.auth.admin.deleteUser(newUserId)
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

    // 1. Verify authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized: Pengguna tidak terautentikasi' }
    }

    const { data: userAuth } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const currentRole = userAuth?.role || user.user_metadata?.role || 'guest'

    if (!['super_user', 'superadmin', 'sinode'].includes(currentRole)) {
      return { success: false, error: 'Unauthorized: Anda tidak memiliki hak akses untuk manajemen user' }
    }

    let adminClient;
    try {
      adminClient = createAdminClient()
    } catch (e: any) {
      return { success: false, error: e.message }
    }

    // 2. Update auth user metadata & email
    const { error: authError } = await adminClient.auth.admin.updateUserById(payload.id, {
      email: payload.email,
      user_metadata: {
        nama_lengkap: payload.nama_lengkap,
        role: payload.role,
      }
    })

    if (authError) {
      return { success: false, error: `Gagal memperbarui data auth user: ${authError.message}` }
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

    const { data, error } = await adminClient
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

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized: Pengguna tidak terautentikasi' }
    }

    const { data: userAuth } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const currentRole = userAuth?.role || user.user_metadata?.role || 'guest'

    if (!['super_user', 'superadmin', 'sinode'].includes(currentRole)) {
      return { success: false, error: 'Unauthorized: Anda tidak memiliki hak akses untuk manajemen user' }
    }

    let adminClient;
    try {
      adminClient = createAdminClient()
    } catch (e: any) {
      return { success: false, error: e.message }
    }

    // 1. Delete from public.users first
    const { error: dbError } = await adminClient
      .from('users')
      .delete()
      .eq('id', id)

    if (dbError) {
      return { success: false, error: `Gagal menghapus profil user dari DB: ${dbError.message}` }
    }

    // 2. Delete from auth.users
    const { error: authError } = await adminClient.auth.admin.deleteUser(id)
    if (authError) {
      return { success: false, error: `Gagal menghapus akun auth: ${authError.message}` }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Terjadi kesalahan tidak terduga saat menghapus pengguna' }
  }
}

