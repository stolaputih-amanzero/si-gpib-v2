import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  await supabase.auth.signOut().catch(() => {})
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.delete('si_gpib_user_session')
  return response
}
