import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { searchParams } = new URL(request.url);
    const id_induk = searchParams.get('id_induk');

    let query = supabaseAdmin
      .from('m_pos_pelkes')
      .select('id_pos, id_induk, nama_pos, alamat, latitude, longitude, tgl_berdiri, keterangan')
      .order('nama_pos', { ascending: true });

    if (id_induk && id_induk !== 'all') {
      query = query.eq('id_induk', id_induk);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
