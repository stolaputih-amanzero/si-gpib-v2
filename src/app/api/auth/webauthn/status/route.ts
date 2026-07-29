import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = await createClient();
    let user: any = null;

    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    } catch {}

    if (!user) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('si_gpib_user_session')?.value;
      if (sessionCookie) {
        try {
          user = JSON.parse(sessionCookie);
        } catch {}
      }
    }

    if (!user) {
      return NextResponse.json({ enabled: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Cek kredensial di tabel m_webauthn_credentials
    const { data: creds } = await supabaseAdmin
      .from('m_webauthn_credentials')
      .select('id')
      .eq('id_user', user.id);

    const hasCreds = Boolean(creds && creds.length > 0);

    // 2. Cek flag biometric_enabled di tabel users
    const { data: uData } = await supabaseAdmin
      .from('users')
      .select('biometric_enabled')
      .eq('id', user.id)
      .maybeSingle();

    const isEnabled = Boolean(hasCreds || uData?.biometric_enabled);

    // Sync flag di tabel users jika kredensial terdaftar
    if (hasCreds && !uData?.biometric_enabled) {
      try {
        await supabaseAdmin.from('users').update({ biometric_enabled: true }).eq('id', user.id);
      } catch {}
    }

    return NextResponse.json({
      enabled: isEnabled,
      credentialCount: creds?.length || 0,
      userId: user.id
    });
  } catch (error) {
    console.error('Biometric status error:', error);
    return NextResponse.json({ enabled: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
