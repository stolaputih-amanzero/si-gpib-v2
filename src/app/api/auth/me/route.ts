import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  let user: any = null

  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {}

  if (!user) {
    const sessionCookie = cookieStore.get('si_gpib_user_session')?.value
    if (sessionCookie) {
      try {
        user = JSON.parse(sessionCookie)
      } catch {}
    }
  }

  if (user) {
    try {
      let query = supabase.from('users').select('nama_lengkap, avatar_url, foto_url, role, no_hp')
      if (user.id && user.email) {
        query = query.or(`id.eq.${user.id},email.eq.${user.email}`)
      } else if (user.id) {
        query = query.eq('id', user.id)
      } else if (user.email) {
        query = query.eq('email', user.email)
      }
      const { data: dbUser } = await query.maybeSingle()

      if (dbUser) {
        const resolvedAvatar = dbUser.avatar_url || dbUser.foto_url || user.avatar_url || user.foto_url
        user = {
          ...user,
          nama_lengkap: dbUser.nama_lengkap || user.nama_lengkap,
          avatar_url: resolvedAvatar,
          foto_url: resolvedAvatar,
          user_metadata: {
            ...(user.user_metadata || {}),
            nama_lengkap: dbUser.nama_lengkap || user.user_metadata?.nama_lengkap,
            avatar_url: resolvedAvatar,
            foto_url: resolvedAvatar,
            picture: resolvedAvatar,
          },
        }
      }
    } catch {}
  }

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user })
}
