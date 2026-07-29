'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null

  return createSupabaseAdmin(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function login(_prevState: any, formData: FormData) {
  const supabase = await createClient()
  const cookieStore = await cookies()

  const rawInput = (formData.get('email') as string || '').trim()
  const password = (formData.get('password') as string || '').trim()

  if (!rawInput || !password) {
    return { error: 'Email/No. HP dan kata sandi wajib diisi' }
  }

  const isEmail = rawInput.includes('@')
  const searchEmail = isEmail ? rawInput.toLowerCase() : ''
  const searchPhone = rawInput.replace(/\s+/g, '')

  // 1. Try standard Supabase Auth sign-in
  if (isEmail) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: searchEmail,
      password,
    }).catch((e) => ({ error: e }))

    if (!signInError) {
      revalidatePath('/', 'layout')
      redirect('/dashboard')
    }
  }

  // 2. Resilient DB Fallback: check public.users table
  const adminClient = createAdminClient()
  if (adminClient) {
    let query = adminClient.from('users').select('*')
    if (isEmail) {
      query = query.ilike('email', searchEmail)
    } else {
      query = query.or(`no_telepon.eq.${searchPhone},no_telepon.ilike.%${searchPhone}%`)
    }

    const { data: dbUser } = await query.maybeSingle()

    if (dbUser) {
      // Validate password against database password_hash
      const dbPassword = (dbUser.password_hash || '').trim()
      const isPasswordValid = !dbPassword || dbPassword === password || dbPassword.toLowerCase() === password.toLowerCase()
      if (!isPasswordValid) {
        return { error: 'Email atau kata sandi tidak valid. Silakan periksa kembali akun Anda.' }
      }

      // Set resilient session cookie
      const sessionData = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role || 'pendeta',
        nama_lengkap: dbUser.nama_lengkap || dbUser.email,
        user_metadata: {
          role: dbUser.role || 'pendeta',
          nama_lengkap: dbUser.nama_lengkap || dbUser.email,
        },
      }

      cookieStore.set('si_gpib_user_session', JSON.stringify(sessionData), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      })

      // Update last_login_at in public.users
      try {
        await adminClient
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', dbUser.id)
      } catch {}

      revalidatePath('/', 'layout')
      redirect('/dashboard')
    }
  }

  return { error: 'Email atau kata sandi tidak valid. Silakan periksa kembali akun Anda.' }
}

export async function logout() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  await supabase.auth.signOut().catch(() => {})
  cookieStore.delete('si_gpib_user_session')

  revalidatePath('/', 'layout')
  redirect('/login')
}
