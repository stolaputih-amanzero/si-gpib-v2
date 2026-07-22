import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { VerifyAuthenticationResponseOpts } from '@simplewebauthn/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getWebAuthnConfig } from '@/lib/auth/webauthn-config';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId: bodyUserId } = body;
    const credentialId = body.id || body.credentialId;

    if (!credentialId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Ambil credential dari database untuk mencocokkan id_user secara dinamis
    let query = supabase
      .from('m_webauthn_credentials')
      .select('id_user, public_key, counter')
      .eq('credential_id', credentialId);

    if (bodyUserId) {
      query = query.eq('id_user', bodyUserId);
    }

    const { data: credential, error: credError } = await query.maybeSingle();

    if (credError || !credential) {
      return NextResponse.json({ error: 'Device biometrik tidak valid atau tidak terdaftar' }, { status: 400 });
    }

    const userId = credential.id_user;

    // 2. Ambil challenge terakhir dari cookie (dengan fallback ke database)
    const cookieStore = await cookies();
    let expectedChallenge = cookieStore.get('webauthn_challenge')?.value;

    if (!expectedChallenge) {
      // Fallback ke database
      const { data: challengeData } = await supabase
        .from('webauthn_challenges')
        .select('challenge')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      expectedChallenge = challengeData?.challenge;
    }

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Sesi login biometrik kadaluarsa' }, { status: 400 });
    }

    const { rpID, origin, appUrl } = getWebAuthnConfig(req);

    // 3. Verifikasi respons biometric
    const verification: VerifyAuthenticationResponseOpts = {
      response: body.response,
      expectedChallenge: expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credentialId,
        publicKey: Buffer.from(credential.public_key, 'base64'),
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
    cookieStore.delete('webauthn_challenge');

    // 6. Log aktivitas login
    await supabase.from('t_log_aktivitas').insert({
      id_user: userId,
      aktor: 'Sistem',
      aksi: 'LOGIN',
      objek_type: 'auth',
      objek_id: userId,
      keterangan: 'Berhasil login menggunakan Biometric (WebAuthn)',
    });

    // 7. Ambil email user dan generate session link (Magic Link)
    const { data: userData } = await supabase.from('users').select('email').eq('id', userId).single();
    let redirectUrl = null;

    if (userData?.email) {
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: userData.email,
        options: { redirectTo: `${appUrl}/login/callback` }
      });

      if (!linkError && linkData?.properties?.action_link) {
        redirectUrl = linkData.properties.action_link;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Login biometric berhasil',
      redirectUrl,
      userId 
    });

  } catch (error) {
    console.error('Login verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
