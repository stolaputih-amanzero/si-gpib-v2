import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { VerifyRegistrationResponseOpts } from '@simplewebauthn/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Ambil challenge terakhir
    const { data: challengeData } = await supabase
      .from('webauthn_challenges')
      .select('challenge')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!challengeData) throw new Error('Challenge not found');

    const verification: VerifyRegistrationResponseOpts = {
      response: body,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      expectedRPID: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
    };

    const { verified, registrationInfo } = await verifyRegistrationResponse(verification);

    if (!verified || !registrationInfo) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Simpan credential ke tabel m_webauthn_credentials
    const { error: insertError } = await supabase.from('m_webauthn_credentials').insert({
      id_user: user.id,
      credential_id: registrationInfo.credential.id,
      public_key: Buffer.from(registrationInfo.credential.publicKey).toString('base64'),
      counter: registrationInfo.credential.counter,
      device_type: 'platform',
      display_name: body.clientExtensionResults?.appid || 'Biometric Device',
      last_used_at: new Date().toISOString(),
    });

    if (insertError) throw insertError;

    // Hapus challenge yang sudah dipakai
    await supabase.from('webauthn_challenges').delete().eq('user_id', user.id);

    // Update flag di tabel users
    await supabase.from('users').update({ biometric_enabled: true }).eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
