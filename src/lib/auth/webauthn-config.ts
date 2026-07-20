import { NextRequest } from 'next/server';

export function getWebAuthnConfig(req: NextRequest) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const hostname = host.split(':')[0];
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');

  // Dynamically derive RP ID and Origin from incoming request host to support custom domains
  const rpID = hostname || process.env.NEXT_PUBLIC_RP_ID || 'localhost';
  const origin = hostname ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  const appUrl = origin;

  return { rpID, origin, appUrl };
}
