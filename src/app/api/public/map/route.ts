import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Verify request is from allowed origin (CORS)
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://sigpib.vercel.app',
      'https://gpib.org',
      'http://localhost:3000', // Development
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'Origin not allowed' },
        { status: 403 }
      );
    }

    // Fetch public data with service_role (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('m_pos_pelkes')
      .select(`
        id_pos,
        nama_pos,
        kategori,
        alamat,
        latitude,
        longitude,
        m_jemaat_induk!inner (
          nama_induk
        )
      `)
      .eq('status', 'Aktif');

    if (error) throw error;

    // Transform to public format (exclude sensitive data)
    const publicData = data.map(pos => ({
      id: pos.id_pos,
      name: pos.nama_pos,
      category: pos.kategori,
      address: pos.alamat,
      lat: pos.latitude,
      lng: pos.longitude,
      parent: Array.isArray(pos.m_jemaat_induk) ? pos.m_jemaat_induk[0]?.nama_induk : (pos.m_jemaat_induk as any)?.nama_induk,
    }));

    return NextResponse.json(publicData, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400', // 1 hour browser, 24 hours CDN
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Public map API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
