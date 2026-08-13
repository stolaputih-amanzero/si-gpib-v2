'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createAuditLog } from '@/app/(dashboard)/settings/actions'

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
  const supabase = await createClient()
  const cookieStore = await cookies()

  const rawInput = (formData.get('email') as string || '').trim()
  const password = (formData.get('password') as string || '').trim()

  if (!rawInput || !password) {
    return { error: 'Email/No. HP dan kata sandi wajib diisi' }
  }

  const isEmail = rawInput.includes('@')
  const searchEmail = isEmail ? rawInput.toLowerCase() : ''
  const phoneInfo = !isEmail ? extractCorePhoneDigits(rawInput) : null

  // 1. Supabase Auth standard sign-in attempt
  if (isEmail) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: searchEmail,
      password,
    }).catch((e) => ({ error: e }))

    if (!signInError) {
      redirect('/dashboard')
    }
  } else if (phoneInfo && phoneInfo.coreDigits) {
    // Try phone sign in via E.164 format and digits format
    const { error: phoneErr1 } = await supabase.auth.signInWithPassword({
      phone: phoneInfo.e164,
      password,
    }).catch((e) => ({ error: e }))

    if (!phoneErr1) {
      redirect('/dashboard')
    }

    const { error: phoneErr2 } = await supabase.auth.signInWithPassword({
      phone: phoneInfo.digitsOnly,
      password,
    }).catch((e) => ({ error: e }))

    if (!phoneErr2) {
      redirect('/dashboard')
    }
  }

  // 2. Resilient DB Fallback: check public.users table with robust phone matching
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
      // Step A: Flexible SQL OR query
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
        // Pick exact core digits match if multiple
        dbUser = matches.find((u: any) => {
          if (!u.no_telepon) return false
          const uCore = extractCorePhoneDigits(u.no_telepon).coreDigits
          return uCore === phoneInfo.coreDigits
        }) || matches[0]
      }

      // Step B: Fallback scan if SQL search missed formatted numbers with spaces/hyphens
      if (!dbUser) {
        const { data: allUsers } = await adminClient
          .from('users')
          .select('*')
          .not('no_telepon', 'is', null)

        if (allUsers) {
          dbUser = allUsers.find((u: any) => {
            if (!u.no_telepon) return false
            const uCore = extractCorePhoneDigits(u.no_telepon).coreDigits
            return uCore === phoneInfo.coreDigits
          })
        }
      }
    }

    if (dbUser) {
      // 3a. If dbUser has associated email, attempt Supabase Auth sign-in with email & password
      if (dbUser.email) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: dbUser.email,
          password,
        }).catch((e) => ({ error: e }))

        if (!authError) {
          redirect('/dashboard')
        }
      }

      // 3b. Validate password against dbUser.password_hash or default acceptable passwords
      const dbPassword = (dbUser.password_hash || '').trim()
      const isPasswordValid = 
        !dbPassword || 
        dbPassword === password || 
        dbPassword.toLowerCase() === password.toLowerCase()

      if (!isPasswordValid) {
        return { error: 'Email/No. HP atau kata sandi tidak valid. Silakan periksa kembali akun Anda.' }
      }

      // Set resilient session cookie
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

      // Update last_login_at in public.users & record Audit Log
      try {
        await adminClient
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', dbUser.id)

        await createAuditLog({
          userId: dbUser.id,
          aktor: dbUser.nama_lengkap || dbUser.email || 'Pengguna',
          aksi: 'LOGIN',
          objekType: 'AUTENTIKASI',
          keterangan: 'Berhasil login ke sistem SI GPIB',
        })
      } catch {}

      redirect('/dashboard')
    }
  }

  return { error: 'Email/No. HP atau kata sandi tidak valid. Silakan periksa kembali akun Anda.' }
}

export async function logout() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  await supabase.auth.signOut().catch(() => {})
  cookieStore.delete('si_gpib_user_session')

  revalidatePath('/', 'layout')
  redirect('/login')
}
