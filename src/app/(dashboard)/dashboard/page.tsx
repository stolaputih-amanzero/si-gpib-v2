import { createClient as createServerClient } from '@/lib/supabase/server';
import { normalizeRole } from '@/hooks/use-hierarki-selector';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { StatCards } from '@/components/dashboard/StatCards';
import { DemografiChart } from '@/components/dashboard/DemografiChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { ScopeIndicator, UserRoleScope } from '@/components/analitik/ScopeIndicator';
import { getStatRoutes } from '@/lib/utils/stat-routes';
import { formatNumber } from '@/lib/utils';
import { PastoralStats } from '@/components/pastoral/PastoralStats';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { getServerContext } from '@/lib/utils/context';
import { getHumanReadableRoleLabel } from '@/lib/utils/role-presentation';
import { 
  Users, ChevronRight, AlertCircle, FileText, CheckCircle2, HeartHandshake, ArrowUpRight
} from 'lucide-react';

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
  const context = await getServerContext();
  const user = context?.user || (await supabaseServer.auth.getUser()).data.user;

  let userRole: string = 'guest';
  let userMupelId: string | null = null;
  let userIndukId: string | null = null;
  let userPosId: string | null = null;
  let userNama: string = 'Pengguna';

  if (user) {
    let { data: profile } = await supabaseAdmin
      .from('users')
      .select('role, id_mupel, id_induk, id_pos, email, id_pendeta, nama')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile && user.email) {
      const { data: profByEmail } = await supabaseAdmin
        .from('users')
        .select('role, id_mupel, id_induk, id_pos, email, id_pendeta, nama')
        .eq('email', user.email)
        .maybeSingle();
      profile = profByEmail;
    }

    if (profile) {
      userRole = normalizeRole(profile.role);
      userMupelId = profile.id_mupel || null;
      userIndukId = profile.id_induk || null;
      userPosId = profile.id_pos || null;
      if (profile.nama) userNama = profile.nama;

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
          .eq('id_mupel', userIndukId)
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
  else if (userRole === 'pj' || userRole === 'user') scopeLabel = 'Pos Pelkes Penugasan Anda';

  const roleScopeObj: UserRoleScope = {
    role: userRole as any,
    id_mupel: userMupelId,
    id_induk: userIndukId,
    id_pos: userPosId,
    isLocked,
    scopeLabel,
  };

  const humanRole = getHumanReadableRoleLabel(userRole);

  // 2. Resolve Jemaat IDs inside user's Mupel
  let jemaatIdsInMupel: string[] = [];
  if (isLocked && userMupelId) {
    const { data: jemaatListInMupel } = await supabaseAdmin
      .from('m_jemaat_induk')
      .select('id_induk')
      .eq('id_mupel', userMupelId);
    jemaatIdsInMupel = jemaatListInMupel?.map((j) => j.id_induk) || [];
  }

  // 3. Fetch scoped data & Attention Layer items
  let mupelCount = 0;
  let jemaatCount = 0;
  let bajemCount = 0;
  let posPelkesCount = 0;
  let logCount = 0;
  let pendingAidCount = 0;
  let demografiData: any[] | null = [];
  let posPelkesSumData: any[] | null = [];
  let recentLogs: any[] | null = [];

  try {
    let mupelQuery = supabaseAdmin.from('m_mupel').select('*', { count: 'exact', head: true });
    let jemaatQuery = supabaseAdmin.from('m_jemaat_induk').select('*', { count: 'exact', head: true });
    let posQuery = supabaseAdmin.from('m_pos_pelkes').select('id_pos, nama_pos, id_induk, status, status_perkembangan');

    if (isLocked) {
      if (userRole === 'admin_mupel' && userMupelId) {
        mupelQuery = mupelQuery.eq('id_mupel', userMupelId);
        jemaatQuery = jemaatQuery.eq('id_mupel', userMupelId);
        if (jemaatIdsInMupel.length > 0) {
          posQuery = posQuery.in('id_induk', jemaatIdsInMupel);
        }
      } else if (userRole === 'kmj' && userIndukId) {
        if (userMupelId) mupelQuery = mupelQuery.eq('id_mupel', userMupelId);
        jemaatQuery = jemaatQuery.eq('id_induk', userIndukId);
        posQuery = posQuery.eq('id_induk', userIndukId);
      } else if ((userRole === 'pj' || userRole === 'user')) {
        if (userMupelId) mupelQuery = mupelQuery.eq('id_mupel', userMupelId);
        if (userIndukId) jemaatQuery = jemaatQuery.eq('id_induk', userIndukId);
        if (userPosId) {
          posQuery = posQuery.eq('id_pos', userPosId);
        } else if (userIndukId) {
          posQuery = posQuery.eq('id_induk', userIndukId);
        }
      }
    }

    const [resMupel, resJemaat, resLog, resDemo, resSum, resPastoral, resHistori, resPendingAid] = await Promise.all([
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
        .limit(5),
      supabaseAdmin
        .from('t_ajuan_bantuan')
        .select('*', { count: 'exact', head: true })
        .eq('status_persetujuan', 'PENDING')
    ]);

    mupelCount = resMupel.count || (userMupelId ? 1 : 0);
    jemaatCount = resJemaat.count || (userIndukId ? 1 : 0);
    logCount = resLog.count || 0;
    pendingAidCount = resPendingAid.count || 0;
    demografiData = resDemo.data;
    posPelkesSumData = resSum.data;

    if (posPelkesSumData) {
      posPelkesSumData.forEach((item: any) => {
        const combinedStatus = `${item.status || ''} ${item.status_perkembangan || ''} ${item.nama_pos || ''}`.toLowerCase();
        const isBajem = combinedStatus.includes('bajem') || combinedStatus.includes('bakal jemaat');
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

  const chartData = KATEGORI_PELKAT.map((pelkat) => ({
    name: pelkat.kode,
    fullName: pelkat.nama,
    icon: pelkat.icon,
    warna: pelkat.warna,
    total: chartDataMap[pelkat.kode] || 0,
  }));

  const routes = getStatRoutes({
    id_mupel: userMupelId,
    id_induk: userIndukId,
    id_pos: userPosId,
  });

  const customStats = [
    {
      key: 'mupel',
      label: 'Mupel',
      value: formatNumber(mupelCount || 0),
      href: routes.mupel,
      iconKey: 'mupel',
    },
    {
      key: 'jemaat',
      label: 'Jemaat Induk',
      value: formatNumber(jemaatCount || 0),
      href: routes.jemaat,
      iconKey: 'jemaat',
    },
    {
      key: 'bajem',
      label: 'Bajem',
      value: formatNumber(bajemCount || 0),
      href: routes.bajem,
      iconKey: 'bajem',
    },
    {
      key: 'pos',
      label: 'Pos Pelkes',
      value: formatNumber(posPelkesCount || 0),
      href: routes.pos,
      iconKey: 'pos',
    },
    {
      key: 'jiwa',
      label: 'Total Jiwa',
      value: formatNumber(totalJiwa || 0),
      href: routes.jiwa,
      iconKey: 'jiwa',
    },
    {
      key: 'giat',
      label: 'Giat Pastoral',
      value: formatNumber(logCount || 0),
      href: routes.giat,
      iconKey: 'giat',
    },
  ];

  return (
    <div className="w-full min-h-full bg-[#0B1220] pb-20">
      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* LAYER 1: CONTEXT LAYER (Konteks Kerja User) */}
        <section className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  ⛪ Sinode GPIB
                </span>
                <span className="text-slate-600">•</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {humanRole}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-semibold text-slate-400">
                  {scopeLabel}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
                Selamat Datang, {userNama}
              </h1>
            </div>
            <div className="shrink-0">
              <ScopeIndicator scope={roleScopeObj} />
            </div>
          </div>
        </section>

        {/* LAYER 2: ATTENTION LAYER (Perhatian Utama Operasional & Proyeksi Antrean) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Perlu Perhatian &amp; Proyeksi Operasional</span>
            </h2>
          </div>

          <div className="space-y-2.5">
            {pendingAidCount > 0 ? (
              <Card className="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                <CardContent className="p-3.5 sm:p-4">
                  <Link href="/projections/aid-queue" className="flex items-center justify-between group min-h-[44px]" aria-label="Review antrean permohonan bantuan">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                        <HeartHandshake className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-100 truncate group-hover:text-amber-400 transition-colors">
                            {pendingAidCount} Permohonan Bantuan Menunggu Review
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shrink-0 uppercase tracking-wider">
                            Proyeksi Review
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          Ajuan bantuan pos pelkes memerlukan verifikasi &amp; persetujuan KMJ / Sinode
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border-subtle bg-slate-900/60">
                <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-100 block">Semua Operasional Lancar</span>
                      <span className="text-xs text-slate-400 block">Tidak ada antrean persetujuan bantuan atau tugas mendesak yang tertunda.</span>
                    </div>
                  </div>
                  <Link href="/projections/aid-queue" className="text-xs font-bold text-indigo-400 hover:underline min-h-[44px] flex items-center" aria-label="Review antrean permohonan bantuan">
                    Buka Antrean Bantuan
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* LAYER 3: ACTION LAYER (Entri Aksi Informasi Shortcuts) */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Aksi Informasi Ringkas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <Link
              href="/dashboard/aktivitas"
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:bg-slate-800/60 hover:border-blue-500/40 transition-all flex flex-col justify-between group min-h-[88px] shadow-xs"
              aria-label="Buka Log Pastoral"
            >
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 w-fit group-hover:scale-105 transition-transform border border-blue-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block truncate group-hover:text-blue-400 transition-colors">
                  Log Pastoral
                </span>
                <span className="text-[11px] text-slate-400 block truncate">Catatan kegiatan</span>
              </div>
            </Link>

            <Link
              href="/dashboard/aid-requests"
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:bg-slate-800/60 hover:border-amber-500/40 transition-all flex flex-col justify-between group min-h-[88px] shadow-xs"
              aria-label="Buka Permohonan Bantuan"
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit group-hover:scale-105 transition-transform border border-amber-500/20">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block truncate group-hover:text-amber-400 transition-colors">
                  Ajukan Bantuan
                </span>
                <span className="text-[11px] text-slate-400 block truncate">Permohonan pos</span>
              </div>
            </Link>

            <Link
              href="/people"
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:bg-slate-800/60 hover:border-emerald-500/40 transition-all flex flex-col justify-between group min-h-[88px] shadow-xs"
              aria-label="Buka Direktori SDM"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-105 transition-transform border border-emerald-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block truncate group-hover:text-emerald-400 transition-colors">
                  Direktori SDM
                </span>
                <span className="text-[11px] text-slate-400 block truncate">Pendeta &amp; Pelayan</span>
              </div>
            </Link>

            <Link
              href="/org"
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:bg-slate-800/60 hover:border-purple-500/40 transition-all flex flex-col justify-between group min-h-[88px] shadow-xs"
              aria-label="Buka Direktori Organisasi"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 w-fit group-hover:scale-105 transition-transform border border-purple-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block truncate group-hover:text-purple-400 transition-colors">
                  Direktori Org
                </span>
                <span className="text-[11px] text-slate-400 block truncate">Pos &amp; Jemaat Induk</span>
              </div>
            </Link>
          </div>
        </section>

        {/* LAYER 4: INSIGHT LAYER (Statistik & Demografi Ringkas) */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ringkasan Statistik &amp; Demografi
            </h2>
            <Link
              href="/projections/reports"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 min-h-[44px]"
              aria-label="Buka Laporan & Analitik Full"
            >
              <span>Buka Laporan Full</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="ambient-glow">
            <StatCards stats={customStats} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DemografiChart data={chartData} />
            </div>
            <div>
              <RecentActivity logs={recentLogs as any || []} />
            </div>
          </div>

          {userRole === 'kmj' && userIndukId && (
            <Card className="mt-6 border-slate-800/80 bg-slate-900/90">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base font-bold text-slate-100">
                  <span>Aktivitas Pastoral Minggu Ini</span>
                  <Link href="/pastoral" className="text-xs font-bold text-blue-400 hover:underline">
                    Lihat Semua
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PastoralStats idJemaat={userIndukId} />
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
