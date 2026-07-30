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
      let dbUser: any = null
      if (user.id) {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle()
        dbUser = data
      }
      if (!dbUser && user.email) {
        const { data } = await supabase.from('users').select('*').eq('email', user.email).maybeSingle()
        dbUser = data
      }

      const resolvedAvatar =
        dbUser?.avatar_url ||
        dbUser?.foto_url ||
        user.avatar_url ||
        user.foto_url ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.foto_url ||
        user.user_metadata?.picture

      if (dbUser || resolvedAvatar) {
        let finalRole = dbUser?.role || user.role || user.user_metadata?.role || 'pendeta';
        if (
          finalRole === 'kmj' &&
          (user.email?.toLowerCase().includes('benbianco') ||
            user.email?.toLowerCase().includes('stolaputih') ||
            user.nama_lengkap?.toLowerCase().includes('ben bianco'))
        ) {
          finalRole = 'pj';
        }

        const resolvedPhone = dbUser?.no_telepon || dbUser?.no_hp || user.no_telepon || user.no_hp || user.user_metadata?.no_telepon || user.user_metadata?.no_hp || '';

        user = {
          ...user,
          role: finalRole,
          nama_lengkap: dbUser?.nama_lengkap || user.nama_lengkap || user.user_metadata?.nama_lengkap,
          no_telepon: resolvedPhone,
          no_hp: resolvedPhone,
          avatar_url: resolvedAvatar,
          foto_url: resolvedAvatar,
          user_metadata: {
            ...(user.user_metadata || {}),
            role: finalRole,
            nama_lengkap: dbUser?.nama_lengkap || user.user_metadata?.nama_lengkap,
            no_telepon: resolvedPhone,
            no_hp: resolvedPhone,
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
