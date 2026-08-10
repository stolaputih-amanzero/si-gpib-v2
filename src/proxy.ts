import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// In-memory rate limiter (untuk self-hosted)
// Untuk production Vercel, gunakan Vercel KV atau Upstash Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute per IP
};

function getClientIP(request: NextRequest): string {
  // Vercel Edge
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  
  // Cloudflare
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;
  
  // Fallback
  return (request as any).ip || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_CONFIG.windowMs });
    return false;
  }
  
  if (record.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Hanya apply rate-limiting ke public routes (termasuk redirect destination)
  if (pathname.startsWith('/peta-sebaran') || pathname.startsWith('/maps')) {
    const ip = getClientIP(request);
    
    if (isRateLimited(ip)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
        },
      });
    }
  }
  
  // Call updateSession for all routes that need session management
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files, service workers, manifests:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js, workbox-*, fallback-*
     * - manifest.json
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|workbox-.*|fallback-.*|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css)$).*)',
  ],
};
