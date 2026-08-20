import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
  let origin = `${protocol}://${host}`;
  if (origin.includes('0.0.0.0')) {
    origin = origin.replace('0.0.0.0', 'localhost');
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    } else {
      console.error('Error exchanging code for session:', error);
    }
  }

  // Jika gagal atau tidak ada code, kembali ke halaman login
  return NextResponse.redirect(new URL('/login', origin));
}

