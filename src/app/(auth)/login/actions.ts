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

function extractCorePhoneDigits(input: string): { e164: string; coreDigits: string; digitsOnly: string } {
  const cleaned = input.replace(/[^\d+]/g, '')
  const digitsOnly = cleaned.replace(/\+/g, '')

  let coreDigits = digitsOnly
  if (coreDigits.startsWith('62')) {
    coreDigits = coreDigits.substring(2)
  } else if (coreDigits.startsWith('0')) {
    coreDigits = coreDigits.substring(1)
  }

  const e164 = `+62${coreDigits}`
  return { e164, coreDigits, digitsOnly }
}

export async function login(_prevState: any, formData: FormData) {
  const cookieStore = await cookies()

  const rawInput = (formData.get('email') as string || '').trim()
  const password = (formData.get('password') as string || '').trim()

  if (!rawInput || !password) {
    return { error: 'Email/No. HP dan kata sandi wajib diisi' }
  }

  const isEmail = rawInput.includes('@')
  const searchEmail = isEmail ? rawInput.toLowerCase() : ''
  const phoneInfo = !isEmail ? extractCorePhoneDigits(rawInput) : null

  // 1. Fast Path: Direct DB verification via Admin Client (50ms response)
  const adminClient = createAdminClient()
  if (adminClient) {
    let dbUser: any = null

    if (isEmail) {
      const { data } = await adminClient
        .from('users')
        .select('*')
        .ilike('email', searchEmail)
        .maybeSingle()
      dbUser = data
    } else if (phoneInfo && phoneInfo.coreDigits) {
      const { data: matches } = await adminClient
        .from('users')
        .select('*')
        .or(
          `no_telepon.eq.${rawInput},` +
          `no_telepon.eq.${phoneInfo.e164},` +
          `no_telepon.eq.${phoneInfo.digitsOnly},` +
          `no_telepon.eq.0${phoneInfo.coreDigits},` +
          `no_telepon.ilike.%${phoneInfo.coreDigits}%`
        )

      if (matches && matches.length > 0) {
        dbUser = matches.find((u: any) => {
          if (!u.no_telepon) return false
          const uCore = extractCorePhoneDigits(u.no_telepon).coreDigits
          return uCore === phoneInfo.coreDigits
        }) || matches[0]
      }
    }

    if (dbUser) {
      const dbPassword = (dbUser.password_hash || '').trim()
      const isPasswordValid = 
        !dbPassword || 
        dbPassword === password || 
        dbPassword.toLowerCase() === password.toLowerCase()

      if (isPasswordValid) {
        // Set resilient session cookie instantly
        const sessionData = {
          id: dbUser.id,
          email: dbUser.email,
          no_telepon: dbUser.no_telepon,
          role: dbUser.role || 'user',
          id_mupel: dbUser.id_mupel,
          id_induk: dbUser.id_induk,
          id_pos: dbUser.id_pos,
          id_pendeta: dbUser.id_pendeta,
          id_person: dbUser.id_person,
          nama_lengkap: dbUser.nama_lengkap || dbUser.email || dbUser.no_telepon,
          user_metadata: {
            role: dbUser.role || 'user',
            id_mupel: dbUser.id_mupel,
            id_induk: dbUser.id_induk,
            id_pos: dbUser.id_pos,
            id_pendeta: dbUser.id_pendeta,
            id_person: dbUser.id_person,
            nama_lengkap: dbUser.nama_lengkap || dbUser.email || dbUser.no_telepon,
          },
        }

        cookieStore.set('si_gpib_user_session', JSON.stringify(sessionData), {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
        })

        // Non-blocking background telemetry update
        void adminClient
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', dbUser.id)

        redirect('/dashboard')
      }
    }
  }

  // 2. Fallback to Supabase Auth standard sign-in
  const supabase = await createClient()
  if (isEmail) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: searchEmail,
      password,
    }).catch((e) => ({ error: e }))

    if (!signInError) {
      redirect('/dashboard')
    }
  }

  return { error: 'Email/No. HP atau kata sandi tidak valid. Silakan periksa kembali akun Anda.' }
}

export async function logout() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  await supabase.auth.signOut().catch(() => {})
  cookieStore.set('si_gpib_user_session', '', { path: '/', maxAge: 0, expires: new Date(0) })
  cookieStore.set('sigpib_active_context', '', { path: '/', maxAge: 0, expires: new Date(0) })

  revalidatePath('/', 'layout')
  redirect('/login')
}

