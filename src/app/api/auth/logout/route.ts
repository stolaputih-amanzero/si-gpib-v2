import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL('/login', request.url);
  return NextResponse.redirect(url, { status: 302 });
}

export async function POST(_request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.json({ success: true, redirect: '/login' });
}
