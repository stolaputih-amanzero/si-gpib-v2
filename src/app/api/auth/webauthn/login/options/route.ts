import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email diperlukan' }, { status: 400 });
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Cari user berdasarkan email untuk mendapatkan ID dan credentials
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, biometric_enabled')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    if (!userData.biometric_enabled) {
      return NextResponse.json({ error: 'Biometric belum diaktifkan untuk akun ini' }, { status: 403 });
    }

    // 2. Ambil credentials yang terdaftar untuk user ini
    const { data: credentials, error: credError } = await supabase
      .from('m_webauthn_credentials')
      .select('credential_id, public_key, counter, transports')
      .eq('id_user', userData.id);

    if (credError || !credentials || credentials.length === 0) {
      return NextResponse.json({ error: 'Tidak ada device biometric terdaftar' }, { status: 400 });
    }

    // 3. Generate Authentication Options
    const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
      timeout: 60000,
      allowCredentials: credentials.map((cred) => ({
        id: cred.credential_id,
        type: 'public-key',
        transports: cred.transports ? (cred.transports as any) : undefined,
      })),
      userVerification: 'preferred',
      rpID: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
    });

    // 4. Simpan challenge sementara (untuk verifikasi nanti)
    const { error: dbError } = await supabase
      .from('webauthn_challenges')
      .insert({
        user_id: userData.id,
        challenge: options.challenge,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

    if (dbError) throw dbError;

    return NextResponse.json({ options, userId: userData.id });
  } catch (error) {
    console.error('Login options error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
