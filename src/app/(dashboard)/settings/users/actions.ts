'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'

async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      }
    }
  )
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
  const supabase = await createClient()

  // 1. Verify authenticated user has super permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: Pengguna tidak terautentikasi')
  }

  const { data: userAuth } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const currentRole = userAuth?.role || user.user_metadata?.role || 'guest'

  if (!['super_user', 'superadmin', 'sinode'].includes(currentRole)) {
    throw new Error('Unauthorized: Anda tidak memiliki hak akses untuk manajemen user')
  }

  const adminClient = await createAdminClient()
  
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

  if (authError || !createdAuth.user) {
    throw new Error(`Gagal membuat akun auth: ${authError?.message || 'Data user kosong'}`)
  }

  const newUserId = createdAuth.user.id

  // 3. Update public.users row with metadata (trigger inserts row automatically, we update it)
  // Let's wait a small delay to make sure the trigger has finished executing
  await new Promise((resolve) => setTimeout(resolve, 500))

  const { error: dbError } = await adminClient
    .from('users')
    .update({
      nama_lengkap: payload.nama_lengkap,
      email: payload.email,
      role: payload.role,
      id_mupel: payload.id_mupel || null,
      id_induk: payload.id_induk || null,
      id_pos: payload.id_pos || null,
      status: payload.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', newUserId)

  if (dbError) {
    // If update fails, clean up the auth user
    await adminClient.auth.admin.deleteUser(newUserId)
    throw new Error(`Gagal menyimpan data profil pengguna: ${dbError.message}`)
  }

  return { id: newUserId, password: tempPassword }
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
  const supabase = await createClient()

  // 1. Verify authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: Pengguna tidak terautentikasi')
  }

  const { data: userAuth } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const currentRole = userAuth?.role || user.user_metadata?.role || 'guest'

  if (!['super_user', 'superadmin', 'sinode'].includes(currentRole)) {
    throw new Error('Unauthorized: Anda tidak memiliki hak akses untuk manajemen user')
  }

  const adminClient = await createAdminClient()

  // 2. Update auth user metadata & email
  const { error: authError } = await adminClient.auth.admin.updateUserById(payload.id, {
    email: payload.email,
    user_metadata: {
      nama_lengkap: payload.nama_lengkap,
      role: payload.role,
    }
  })

  if (authError) {
    throw new Error(`Gagal memperbarui data auth user: ${authError.message}`)
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
    .update(updateData)
    .eq('id', payload.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Gagal memperbarui user: ${error.message}`)
  }

  return data
}

export async function deleteUserAction(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: Pengguna tidak terautentikasi')
  }

  const { data: userAuth } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const currentRole = userAuth?.role || user.user_metadata?.role || 'guest'

  if (!['super_user', 'superadmin', 'sinode'].includes(currentRole)) {
    throw new Error('Unauthorized: Anda tidak memiliki hak akses untuk manajemen user')
  }

  const adminClient = await createAdminClient()

  // 1. Delete from public.users first
  const { error: dbError } = await adminClient
    .from('users')
    .delete()
    .eq('id', id)

  if (dbError) {
    throw new Error(`Gagal menghapus profil user dari DB: ${dbError.message}`)
  }

  // 2. Delete from auth.users
  const { error: authError } = await adminClient.auth.admin.deleteUser(id)
  if (authError) {
    throw new Error(`Gagal menghapus akun auth: ${authError.message}`)
  }

  return { success: true }
}
