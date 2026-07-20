import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server';
import { createClient } from '@/lib/supabase/server';
import { getWebAuthnConfig } from '@/lib/auth/webauthn-config';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rpID } = getWebAuthnConfig(req);

    // Generate options
    const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
      rpName: process.env.NEXT_PUBLIC_RP_NAME || 'SI GPIB',
      rpID,
      userID: Buffer.from(user.id),
      userName: user.email || user.phone || user.id,
      userDisplayName: user.user_metadata?.full_name || 'User GPIB',
      timeout: 60000,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform', // Device biometric
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });

    // Simpan challenge ke database (expire 5 menit)
    const { error: dbError } = await supabase
      .from('webauthn_challenges')
      .insert({
        user_id: user.id,
        challenge: options.challenge,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

    if (dbError) throw dbError;

    return NextResponse.json(options);
  } catch (error) {
    console.error('Register options error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
