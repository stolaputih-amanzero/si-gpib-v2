import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function handleLogout(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut().catch(() => {});
  } catch {}

  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl?.host ||
    'localhost:3000';
  const protocol =
    request.headers.get('x-forwarded-proto') ||
    (request.url.startsWith('https') ? 'https' : 'http');
  let origin = `${protocol}://${host}`;
  if (origin.includes('0.0.0.0')) {
    origin = origin.replace('0.0.0.0', 'localhost');
  }

  const response = NextResponse.redirect(new URL('/login', origin), {
    status: 303,
  });

  // Explicitly clear session cookies on root path '/'
  response.cookies.set('si_gpib_user_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  response.cookies.set('sigpib_active_context', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  // Clear all Supabase auth cookies
  const allCookies = request.cookies.getAll();
  for (const c of allCookies) {
    if (
      c.name.startsWith('sb-') ||
      c.name.includes('supabase') ||
      c.name.includes('session') ||
      c.name.includes('token')
    ) {
      response.cookies.set(c.name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }

  return response;
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}


