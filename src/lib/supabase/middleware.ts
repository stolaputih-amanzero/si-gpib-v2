import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.placeholder',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user: any = null

  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {}

  // Fallback to custom session cookie if Supabase Auth user is not active
  if (!user) {
    const sessionCookie = request.cookies.get('si_gpib_user_session')?.value
    if (sessionCookie) {
      try {
        user = JSON.parse(sessionCookie)
      } catch {}
    }
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/forgot-password') &&
    !request.nextUrl.pathname.startsWith('/api/auth') &&
    !request.nextUrl.pathname.startsWith('/offline') && 
    !request.nextUrl.pathname.startsWith('/icons') && 
    !request.nextUrl.pathname.startsWith('/manifest.json')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Ensure logged-in users don't access auth pages again
  if (user && (
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/register') || 
    request.nextUrl.pathname.startsWith('/forgot-password')
  )) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
  }

  // RBAC (Role-Based Access Control) Logic
  if (user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/settings/users'))) {
    const userRole = user.user_metadata?.role || user.role || 'pendeta';
    const pathname = request.nextUrl.pathname;

    const protectedRoutes: Record<string, string[]> = {
      '/settings/users': ['super_user', 'superadmin', 'sinode', 'Super User', 'SuperAdmin', 'Admin', 'admin'],
      '/dashboard/mupel': ['super_user', 'superadmin', 'sinode', 'admin_mupel', 'Super User', 'SuperAdmin', 'Admin', 'admin'],
      '/dashboard/jemaat': ['super_user', 'superadmin', 'sinode', 'admin_mupel', 'admin_jemaat', 'kmj', 'pendeta', 'pj_pos', 'pj', 'user', 'pelayan', 'relawan', 'Super User', 'SuperAdmin', 'Admin', 'admin'],
      '/dashboard/pos-pelkes': ['super_user', 'superadmin', 'sinode', 'admin_mupel', 'admin_jemaat', 'kmj', 'pj_pos', 'pj', 'user', 'pendeta', 'pelayan', 'relawan', 'Super User', 'SuperAdmin', 'Admin', 'admin'],
    };

    let isAuthorized = true;
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          isAuthorized = false;
          break;
        }
      }
    }

    if (!isAuthorized) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse
}
