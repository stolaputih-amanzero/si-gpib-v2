import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ error: 'Unauthorized: Sesi tidak ditemukan' }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch users from public.users table
    let { data: usersData, error: usersErr } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        nama_lengkap,
        role,
        id_mupel,
        id_induk,
        id_pos,
        status,
        created_at,
        mupel:m_mupel(id_mupel, nama_mupel),
        jemaat_induk:m_jemaat_induk(id_induk, nama_induk),
        pos_pelkes:m_pos_pelkes(id_pos, nama_pos)
      `)
      .order('created_at', { ascending: false });

    if (usersErr || !usersData) {
      const { data: rawUsers } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      usersData = rawUsers || [];
    }

    // 2. Fetch auth users to merge any missing registered accounts
    let authUsers: any[] = [];
    try {
      const { data: listRes } = await supabaseAdmin.auth.admin.listUsers();
      if (listRes?.users) {
        authUsers = listRes.users;
      }
    } catch {}

    const existingUserIds = new Set((usersData || []).map((u: any) => u.id));
    const mergedUsers: any[] = [...(usersData || [])];

    // Add auth users that aren't in public.users table yet
    authUsers.forEach((authUser: any) => {
      if (!existingUserIds.has(authUser.id)) {
        mergedUsers.push({
          id: authUser.id,
          email: authUser.email || 'user@gpib.or.id',
          nama_lengkap: authUser.user_metadata?.nama_lengkap || authUser.email || 'Pengguna GPIB',
          role: authUser.user_metadata?.role || 'pelayan',
          id_mupel: authUser.user_metadata?.id_mupel || null,
          id_induk: authUser.user_metadata?.id_induk || null,
          id_pos: authUser.user_metadata?.id_pos || null,
          status: 'Active',
          created_at: authUser.created_at || new Date().toISOString(),
          mupel: null,
          jemaat_induk: null,
          pos_pelkes: null,
        });
      }
    });

    return NextResponse.json({ users: mergedUsers });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
