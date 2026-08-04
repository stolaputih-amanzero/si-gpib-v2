import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { normalizeRole } from '@/hooks/use-hierarki-selector';
import { PosPelkesList } from "./pos-pelkes-list";

export default async function PosPelkesPage() {
  const supabaseServer = await createServerClient();
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let posPelkes: any[] = [];
  try {
    const { data: { user } } = await supabaseServer.auth.getUser();

    let userRole = 'guest';
    let userMupelId: string | null = null;
    let userIndukId: string | null = null;
    let userPosId: string | null = null;

    if (user) {
      let { data: profile } = await supabaseAdmin
        .from('users')
        .select('role, id_mupel, id_induk, id_pos, email, id_pendeta')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile && user.email) {
        const { data: profByEmail } = await supabaseAdmin
          .from('users')
          .select('role, id_mupel, id_induk, id_pos, email, id_pendeta')
          .eq('email', user.email)
          .maybeSingle();
        profile = profByEmail;
      }

      if (profile) {
        userRole = normalizeRole(profile.role);
        userMupelId = profile.id_mupel || null;
        userIndukId = profile.id_induk || null;
        userPosId = profile.id_pos || null;

        if ((userRole === 'pj' || userRole === 'user') && !userPosId && profile.id_pendeta) {
          const { data: penugasan } = await supabaseAdmin
            .from('t_penugasan_pendeta')
            .select('id_pos')
            .eq('id_pendeta', profile.id_pendeta)
            .eq('status_tugas', 'Aktif')
            .maybeSingle();
          if (penugasan?.id_pos) {
            userPosId = penugasan.id_pos;
          }
        }
      }
    }

    let query = supabaseAdmin
      .from('m_pos_pelkes')
      .select(`
        id_pos,
        nama_pos,
        kategori,
        alamat,
        tgl_berdiri,
        id_induk,
        jemaat_induk:m_jemaat_induk (
          id_induk,
          nama_induk,
          id_mupel,
          mupel:m_mupel (
            id_mupel,
            nama_mupel
          )
        )
      `);

    const isLocked = userRole !== 'super_user';
    if (isLocked) {
      if ((userRole === 'pj' || userRole === 'user') && userPosId) {
        query = query.eq('id_pos', userPosId);
      } else if (userIndukId) {
        query = query.eq('id_induk', userIndukId);
      } else if (userMupelId) {
        const { data: jemaatList } = await supabaseAdmin
          .from('m_jemaat_induk')
          .select('id_induk')
          .eq('id_mupel', userMupelId);
        const jIds = jemaatList?.map((j) => j.id_induk) || [];
        if (jIds.length > 0) {
          query = query.in('id_induk', jIds);
        }
      }
    }

    const { data } = await query;
    if (data) posPelkes = data;
  } catch (err) {
    console.error('Offline / network error in PosPelkesPage:', err);
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <PosPelkesList initialData={(posPelkes as any) || []} />
    </div>
  );
}
