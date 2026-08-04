import { createClient as createServerClient } from '@/lib/supabase/server';
import { normalizeRole } from '@/hooks/use-hierarki-selector';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { StatCards } from '@/components/dashboard/StatCards';
import { DemografiChart } from '@/components/dashboard/DemografiChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { formatNumber } from '@/lib/utils';
import { ScopeIndicator, UserRoleScope } from '@/components/analitik/ScopeIndicator';

interface DemografiRow {
  kategori_pelkat: string;
  laki: number;
  perempuan: number;
}

export default async function Dashboard() {
  const supabaseServer = await createServerClient();
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // 1. Resolve logged in user session & role scope
  const { data: { user } } = await supabaseServer.auth.getUser();

  let userRole: string = 'guest';
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

      // Lookup pendeta assignment for PJ if id_pos not set directly in users table
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

      // Lookup parent id_induk / id_mupel if userPosId is set
      if (userPosId && (!userIndukId || !userMupelId)) {
        const { data: posObj } = await supabaseAdmin
          .from('m_pos_pelkes')
          .select('id_induk, jemaat_induk:m_jemaat_induk(id_mupel)')
          .eq('id_pos', userPosId)
          .maybeSingle();

        if (posObj) {
          if (!userIndukId) userIndukId = posObj.id_induk;
          if (!userMupelId && posObj.jemaat_induk) {
            userMupelId = (posObj.jemaat_induk as any).id_mupel;
          }
        }
      }

      // Lookup parent id_mupel if userIndukId is set
      if (userIndukId && !userMupelId) {
        const { data: jemaatObj } = await supabaseAdmin
          .from('m_jemaat_induk')
          .select('id_mupel')
          .eq('id_induk', userIndukId)
          .maybeSingle();

        if (jemaatObj?.id_mupel) {
          userMupelId = jemaatObj.id_mupel;
        }
      }
    }
  }

  const isLocked = userRole !== 'super_user';
  let scopeLabel = 'Seluruh Indonesia';
  if (userRole === 'admin_mupel') scopeLabel = 'Mupel Anda';
  else if (userRole === 'kmj') scopeLabel = 'Jemaat Anda';
  else if (userRole === 'pj' || userRole === 'user') scopeLabel = 'Pos Pelkes / Mupel Anda';

  const roleScopeObj: UserRoleScope = {
    role: userRole as any,
    id_mupel: userMupelId,
    id_induk: userIndukId,
    id_pos: userPosId,
    isLocked,
    scopeLabel,
  };

  // 2. Resolve Jemaat IDs inside user's Mupel for clean 1-Mupel aggregation
  let jemaatIdsInMupel: string[] = [];
  if (isLocked && userMupelId) {
    const { data: jemaatListInMupel } = await supabaseAdmin
      .from('m_jemaat_induk')
      .select('id_induk')
      .eq('id_mupel', userMupelId);
    jemaatIdsInMupel = jemaatListInMupel?.map((j) => j.id_induk) || [];
  }

  // 3. Fetch scoped data
  let mupelCount = 0;
  let jemaatCount = 0;
  let bajemCount = 0;
  let posPelkesCount = 0;
  let logCount = 0;
  let demografiData: any[] | null = [];
  let posPelkesSumData: any[] | null = [];
  let recentLogs: any[] | null = [];

  try {
    // Build queries scoped to Mupel level for reliable 25 Jemaat & Pos count
    let mupelQuery = supabaseAdmin.from('m_mupel').select('*', { count: 'exact', head: true });
    let jemaatQuery = supabaseAdmin.from('m_jemaat_induk').select('*', { count: 'exact', head: true });
    let posQuery = supabaseAdmin.from('m_pos_pelkes').select('id_pos, nama_pos, kategori, jumlah_jiwa, id_induk');

    if (isLocked && userMupelId) {
      mupelQuery = mupelQuery.eq('id_mupel', userMupelId);
      jemaatQuery = jemaatQuery.eq('id_mupel', userMupelId);
      if (jemaatIdsInMupel.length > 0) {
        posQuery = posQuery.in('id_induk', jemaatIdsInMupel);
      }
    }

    const [resMupel, resJemaat, resLog, resDemo, resSum, resPastoral, resHistori] = await Promise.all([
      mupelQuery,
      jemaatQuery,
      supabaseAdmin
        .from('t_log_pastoral')
        .select('*', { count: 'exact', head: true })
        .gte('tgl', startOfMonth)
        .lte('tgl', endOfMonth),
      supabaseAdmin
        .from('t_demografi_pelkat')
        .select('kategori_pelkat, laki, perempuan'),
      posQuery,
      supabaseAdmin
        .from('t_log_pastoral')
        .select(`
          id_log, tgl, kegiatan, created_at,
          pos_pelkes:m_pos_pelkes(nama_pos),
          pendeta:m_pendeta(nama_lengkap)
        `)
        .order('tgl', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5),
      supabaseAdmin
        .from('t_histori_perubahan_status')
        .select(`
          id_histori, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, catatan, created_at,
          pos_pelkes:m_pos_pelkes(nama_pos)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    mupelCount = resMupel.count || (userMupelId ? 1 : 0);
    jemaatCount = resJemaat.count || 0;
    logCount = resLog.count || 0;
    demografiData = resDemo.data;
    posPelkesSumData = resSum.data;

    if (posPelkesSumData) {
      posPelkesSumData.forEach((item: any) => {
        const isBajem = item.kategori === 'Bajem' || (item.nama_pos || '').toLowerCase().includes('bajem');
        if (isBajem) {
          bajemCount++;
        } else {
          posPelkesCount++;
        }
      });
    }

    // Combine Pastoral Activity Logs + Histori Status Elevasi Logs
    const pastoralLogs = (resPastoral.data || []).map((p: any) => ({
      id_log: p.id_log,
      tgl: p.tgl || p.created_at,
      kegiatan: p.kegiatan,
      pos_pelkes: p.pos_pelkes,
      pendeta: p.pendeta,
      tipe: 'pastoral',
    }));

    const historiLogs = (resHistori.data || []).map((h: any) => ({
      id_log: h.id_histori,
      tgl: h.tanggal_perubahan || h.created_at,
      kegiatan: h.status_baru === 'JEMAAT_INDUK' || h.status_baru === 'Jemaat Induk'
        ? `Elevasi Status: ${h.pos_pelkes?.nama_pos || 'Pos'} ditingkatkan menjadi Jemaat Induk Mandiri`
        : `Elevasi Status: ${h.pos_pelkes?.nama_pos || 'Pos'} ditingkatkan menjadi ${h.status_baru}`,
      pos_pelkes: h.pos_pelkes,
      pendeta: { nama_lengkap: 'Super User / Admin' },
      tipe: 'elevasi',
    }));

    recentLogs = [...pastoralLogs, ...historiLogs]
      .sort((a, b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime())
      .slice(0, 5);

  } catch (err) {
    console.error('Offline / network error loading dashboard stats:', err);
  }

  let totalJiwaFromPelkat = 0;
  const chartDataMap: Record<string, number> = {
    PA: 0,
    PT: 0,
    GP: 0,
    PKP: 0,
    PKB: 0,
    PKLU: 0,
  };

  if (demografiData) {
    (demografiData as DemografiRow[]).forEach((row) => {
      const sum = row.laki + row.perempuan;
      totalJiwaFromPelkat += sum;
      
      let category = (row.kategori_pelkat || '').trim().toUpperCase();
      if (category.includes('ANAK') || category === 'PA') category = 'PA';
      else if (category.includes('TERUNA') || category === 'PT') category = 'PT';
      else if (category.includes('PEMUDA') || category === 'GP') category = 'GP';
      else if (category.includes('PEREMPUAN') || category === 'PKP') category = 'PKP';
      else if (category.includes('BAPAK') || category.includes('BAPA') || category === 'PKB') category = 'PKB';
      else if (category.includes('LANJUT') || category.includes('LANSIA') || category === 'PKLU') category = 'PKLU';
      
      if (chartDataMap[category] !== undefined) {
        chartDataMap[category] += sum;
      }
    });
  }

  const totalJiwaFromPos = (posPelkesSumData || []).reduce((acc: number, curr: any) => acc + (curr.jumlah_jiwa || 0), 0);
  const totalJiwa = totalJiwaFromPos > 0 ? totalJiwaFromPos : totalJiwaFromPelkat;

  // Canonical Order: PA -> PT -> GP -> PKP -> PKB -> PKLU
  const chartData = KATEGORI_PELKAT.map((pelkat) => ({
    name: pelkat.kode,
    fullName: pelkat.nama,
    icon: pelkat.icon,
    warna: pelkat.warna,
    total: chartDataMap[pelkat.kode] || 0,
  }));

  // Build Role-Adaptive Click Targets
  const mupelHref = userMupelId ? `/hierarki/${encodeURIComponent(userMupelId)}` : '/hierarki';
  const jemaatHref = userMupelId ? `/hierarki/${encodeURIComponent(userMupelId)}` : '/hierarki?view=jemaat';
  const bajemHref = userMupelId ? `/hierarki/${encodeURIComponent(userMupelId)}?kategori=bajem` : '/hierarki?kategori=bajem';
  const posHref = userMupelId ? `/hierarki/${encodeURIComponent(userMupelId)}?kategori=pos` : '/hierarki?kategori=pos';

  const customStats = [
    {
      key: 'mupel',
      label: 'Mupel',
      value: formatNumber(mupelCount),
      href: mupelHref,
      icon: 'mupel' as const,
      iconKey: 'mupel',
    },
    {
      key: 'jemaat',
      label: 'Jemaat Induk',
      value: formatNumber(jemaatCount),
      href: jemaatHref,
      icon: 'jemaat' as const,
      iconKey: 'jemaat',
    },
    {
      key: 'bajem',
      label: 'Bajem',
      value: formatNumber(bajemCount),
      href: bajemHref,
      icon: 'bajem' as const,
      iconKey: 'bajem',
    },
    {
      key: 'pos',
      label: 'Pos Pelkes',
      value: formatNumber(posPelkesCount),
      href: posHref,
      icon: 'pos' as const,
      iconKey: 'pos',
    },
    {
      key: 'jiwa',
      label: 'Total Jiwa',
      value: formatNumber(totalJiwa),
      href: '/demografi',
      icon: 'jiwa' as const,
      iconKey: 'jiwa',
    },
    {
      key: 'giat',
      label: 'Giat Bulan Ini',
      value: formatNumber(logCount),
      href: '/laporan/pastoral',
      icon: 'giat' as const,
      iconKey: 'giat',
    },
  ];

  return (
    <div className="w-full min-h-full bg-surface-base pb-24">
      <div className="sticky top-0 z-40 bg-surface-1/85 backdrop-blur-md hairline-b px-4 py-3.5 md:px-6 pt-safe flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold tracking-tightish text-ink-primary">
            Dashboard Utama
          </h1>
          <p className="text-xs md:text-sm text-ink-secondary mt-0.5">
            Sistem Informasi Pelayanan &amp; Kesaksian GPIB
          </p>
        </div>
        <ScopeIndicator scope={roleScopeObj} />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-5 md:px-6 space-y-6">
        <section className="ambient-glow">
          <StatCards stats={customStats} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DemografiChart data={chartData} />
          </div>
          <div>
            <RecentActivity logs={recentLogs as any || []} />
          </div>
        </div>
      </main>

      <QuickActions />
    </div>
  );
}
