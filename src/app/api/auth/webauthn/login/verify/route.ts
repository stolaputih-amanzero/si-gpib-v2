import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { VerifyAuthenticationResponseOpts } from '@simplewebauthn/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, credentialId } = body;

    if (!userId || !credentialId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Ambil challenge terakhir untuk user ini
    const { data: challengeData } = await supabase
      .from('webauthn_challenges')
      .select('challenge')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!challengeData) throw new Error('Challenge tidak ditemukan atau sudah expired');

    // 2. Ambil credential dari database untuk verifikasi
    const { data: credential, error: credError } = await supabase
      .from('m_webauthn_credentials')
      .select('public_key, counter')
      .eq('id_user', userId)
      .eq('credential_id', credentialId)
      .single();

    if (credError || !credential) throw new Error('Credential tidak valid');

    // 3. Verifikasi respons biometric
    const verification: VerifyAuthenticationResponseOpts = {
      response: body.response,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      expectedRPID: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
      authenticator: {
        credentialPublicKey: Buffer.from(credential.public_key, 'base64'),
        counter: credential.counter,
      },
    };

    const { verified, authenticationInfo } = await verifyAuthenticationResponse(verification);

    if (!verified) {
      return NextResponse.json({ error: 'Verifikasi biometric gagal' }, { status: 400 });
    }

    // 4. Update counter (anti-replay attack)
    await supabase
      .from('m_webauthn_credentials')
      .update({ 
        counter: authenticationInfo.newCounter,
        last_used_at: new Date().toISOString()
      })
      .eq('id_user', userId)
      .eq('credential_id', credentialId);

    // 5. Hapus challenge yang sudah dipakai
    await supabase.from('webauthn_challenges').delete().eq('user_id', userId);

    // 6. Log aktivitas login
    await supabase.from('t_log_aktivitas').insert({
      id_user: userId,
      aktor: 'Sistem',
      aksi: 'LOGIN',
      objek_type: 'auth',
      objek_id: userId,
      keterangan: 'Berhasil login menggunakan Biometric (WebAuthn)',
    });

    // CATATAN PENTING:
    // Di sini Anda perlu membuat sesi Supabase. 
    // Karena WebAuthn memverifikasi device, Anda bisa menggunakan Supabase Admin API 
    // untuk generate magic link atau menggunakan custom JWT (jose) yang dibaca middleware.
    // Untuk kesederhanaan blueprint ini, kita return success.
    
    return NextResponse.json({ 
      success: true, 
      message: 'Login biometric berhasil',
      userId 
    });

  } catch (error) {
    console.error('Login verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
