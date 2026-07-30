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
      const { data: dbUser } = await supabase
        .from('users')
        .select('nama_lengkap, avatar_url, role, no_hp')
        .eq('id', user.id)
        .maybeSingle()

      if (dbUser) {
        user = {
          ...user,
          nama_lengkap: dbUser.nama_lengkap || user.nama_lengkap,
          avatar_url: dbUser.avatar_url || user.avatar_url,
          user_metadata: {
            ...(user.user_metadata || {}),
            nama_lengkap: dbUser.nama_lengkap || user.user_metadata?.nama_lengkap,
            avatar_url: dbUser.avatar_url || user.user_metadata?.avatar_url,
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
