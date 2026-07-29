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

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user })
}
