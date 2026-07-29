import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const cookieStore = await cookies()

  await supabase.auth.signOut().catch(() => {})
  cookieStore.delete('si_gpib_user_session')

  const host = request.headers.get('host') || 'localhost:3000'
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  const cleanHost = host.includes('0.0.0.0') ? host.replace('0.0.0.0', 'localhost') : host

  return NextResponse.redirect(`${proto}://${cleanHost}/login`)
}
