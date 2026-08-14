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
import { StatusPill } from '@/components/ui';
import Link from 'next/link';
import { getServerContext } from '@/lib/utils/context';
import { getHumanReadableRoleLabel } from '@/lib/utils/role-presentation';
import { 
  Users, ChevronRight, FileText, CheckCircle2, HeartHandshake, ArrowUpRight, BarChart3, Map, Building
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
    userRole = normalizeRole(user.role || user.user_metadata?.role || 'super_user');
    userMupelId = user.id_mupel || user.user_metadata?.id_mupel || null;
    userIndukId = user.id_induk || user.user_metadata?.id_induk || null;
    userPosId = user.id_pos || user.user_metadata?.id_pos || null;
    userNama = user.nama_lengkap || user.nama || user.user_metadata?.nama_lengkap || (user.email ? user.email.split('@')[0] : 'Pengguna');

    let { data: profile } = await supabaseAdmin
      .from('users')
      .select('role, id_mupel, id_induk, id_pos, email, id_pendeta, nama, nama_lengkap')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile && user.email) {
      const { data: profByEmail } = await supabaseAdmin
        .from('users')
        .select('role, id_mupel, id_induk, id_pos, email, id_pendeta, nama, nama_lengkap')
        .eq('email', user.email)
        .maybeSingle();
      profile = profByEmail;
    }

    if (profile) {
      if (profile.role) userRole = normalizeRole(profile.role);
      if (profile.id_mupel) userMupelId = profile.id_mupel;
      if (profile.id_induk) userIndukId = profile.id_induk;
      if (profile.id_pos) userPosId = profile.id_pos;
      if (profile.nama_lengkap || profile.nama) userNama = profile.nama_lengkap || profile.nama;

      // 1. Resolve pendeta record if profile.id_pendeta or email is present
      const pendetaId = profile.id_pendeta || (user.id_pendeta ? user.id_pendeta : null);
      if (pendetaId || user.email) {
        let pdtQuery = supabaseAdmin.from('m_pendeta').select('id_pendeta, id_induk, nama_lengkap');
        if (pendetaId) {
          pdtQuery = pdtQuery.eq('id_pendeta', pendetaId);
        } else if (user.email) {
          pdtQuery = pdtQuery.ilike('email', user.email);
        }
        const { data: pdt } = await pdtQuery.maybeSingle();
        if (pdt) {
          if (!userIndukId && pdt.id_induk) userIndukId = pdt.id_induk;
          if (!userNama || userNama === 'Pengguna') userNama = pdt.nama_lengkap || userNama;

          // 2. Lookup assignment in t_penugasan_pendeta
          if (!userPosId) {
            const { data: penugasan } = await supabaseAdmin
              .from('t_penugasan_pendeta')
              .select('id_pos')
              .eq('id_pendeta', pdt.id_pendeta)
              .maybeSingle();
            if (penugasan?.id_pos) {
              userPosId = penugasan.id_pos;
            }
          }
        }
      }

      // 3. If userIndukId is known but userPosId is missing, check if there is a Pos Pelkes under this Jemaat
      if (userIndukId && !userPosId && (userRole === 'pj' || userRole === 'user')) {
        const { data: posList } = await supabaseAdmin
          .from('m_pos_pelkes')
          .select('id_pos')
          .eq('id_induk', userIndukId)
          .limit(1);
        if (posList && posList.length > 0) {
          userPosId = posList[0].id_pos;
        }
      }

      // 4. Lookup parent id_induk / id_mupel if userPosId is set
      if (userPosId && (!userIndukId || !userMupelId)) {
        const { data: posObj } = await supabaseAdmin
          .from('m_pos_pelkes')
          .select('id_induk, jemaat_induk:m_jemaat_induk(id_induk, id_mupel, nama_induk, mupel:m_mupel(id_mupel, nama_mupel))')
          .eq('id_pos', userPosId)
          .maybeSingle();

        if (posObj) {
          if (!userIndukId) userIndukId = posObj.id_induk;
          if (!userMupelId && posObj.jemaat_induk) {
            userMupelId = (posObj.jemaat_induk as any).id_mupel;
          }
        }
      }

      // 5. Lookup parent id_mupel if userIndukId is set
      if (userIndukId && !userMupelId) {
        const { data: jemaatObj } = await supabaseAdmin
          .from('m_jemaat_induk')
          .select('id_induk, id_mupel')
          .eq('id_induk', userIndukId)
          .maybeSingle();

        if (jemaatObj?.id_mupel) {
          userMupelId = jemaatObj.id_mupel;
        }
      }
    }
  }

  // 2. Resolve Active Working Context Scope
  const isSuperUser = userRole === 'super_user';
  let effectiveMupelId = isSuperUser ? null : userMupelId;
  let effectiveIndukId = isSuperUser ? null : userIndukId;
  let effectivePosId = isSuperUser ? null : userPosId;

  let activeUnitName = 'Seluruh Indonesia';
  let activeUnitLevel: 'SINODE' | 'MUPEL' | 'JEMAAT' | 'POS' = 'SINODE';

  let activePosData: any = null;
  let activeJmtData: any = null;

  if (effectivePosId) {
    const { data: posData } = await supabaseAdmin
      .from('m_pos_pelkes')
      .select('id_pos, nama_pos, id_induk, kategori, jumlah_jiwa, jumlah_kk, jemaat_induk:m_jemaat_induk(id_induk, id_mupel, nama_induk, mupel:m_mupel(id_mupel, nama_mupel))')
      .eq('id_pos', effectivePosId)
      .maybeSingle();

    if (posData) {
      activePosData = posData;
      activeUnitLevel = 'POS';
      activeUnitName = posData.nama_pos;
      if (posData.jemaat_induk) {
        const jmt = posData.jemaat_induk as any;
        if (!effectiveIndukId) effectiveIndukId = jmt.id_induk;
        if (!effectiveMupelId && jmt.id_mupel) effectiveMupelId = jmt.id_mupel;
      }
    }
  } else if (effectiveIndukId) {
    const { data: jmtData } = await supabaseAdmin
      .from('m_jemaat_induk')
      .select('id_induk, nama_induk, id_mupel, jumlah_jiwa, jumlah_kk, mupel:m_mupel(id_mupel, nama_mupel)')
      .eq('id_induk', effectiveIndukId)
      .maybeSingle();

    if (jmtData) {
      activeJmtData = jmtData;
      activeUnitLevel = 'JEMAAT';
      activeUnitName = jmtData.nama_induk;
      if (!effectiveMupelId && jmtData.id_mupel) effectiveMupelId = jmtData.id_mupel;
    }
  } else if (effectiveMupelId) {
    const { data: mplData } = await supabaseAdmin
      .from('m_mupel')
      .select('id_mupel, nama_mupel')
      .eq('id_mupel', effectiveMupelId)
      .maybeSingle();

    if (mplData) {
      activeUnitLevel = 'MUPEL';
      activeUnitName = `Mupel ${mplData.nama_mupel}`;
    }
  }

  const isLocked = !isSuperUser;
  let scopeLabel = activeUnitName;
  if (activeUnitLevel === 'POS' && activePosData) {
    const jmtName = (activePosData.jemaat_induk as any)?.nama_induk;
    const mplName = (activePosData.jemaat_induk as any)?.mupel?.nama_mupel;
    if (jmtName && mplName) {
      scopeLabel = `${activePosData.nama_pos} • ${jmtName} • Mupel ${mplName}`;
    } else if (jmtName) {
      scopeLabel = `${activePosData.nama_pos} • ${jmtName}`;
    } else {
      scopeLabel = `Pos Pelkes ${activePosData.nama_pos}`;
    }
  } else if (activeUnitLevel === 'JEMAAT' && activeJmtData) {
    const mplName = (activeJmtData.mupel as any)?.nama_mupel;
    if (mplName) {
      scopeLabel = `${activeJmtData.nama_induk} • Mupel ${mplName}`;
    } else {
      scopeLabel = activeJmtData.nama_induk;
    }
  } else if (activeUnitLevel === 'MUPEL') {
    scopeLabel = activeUnitName;
  } else {
    scopeLabel = 'Seluruh Indonesia';
  }

  const roleScopeObj: UserRoleScope = {
    role: userRole as any,
    id_mupel: effectiveMupelId,
    id_induk: effectiveIndukId,
    id_pos: effectivePosId,
    isLocked,
    scopeLabel,
  };

  const humanRole = getHumanReadableRoleLabel(userRole);

  // 3. Resolve Jemaat IDs inside effective Mupel
  let jemaatIdsInMupel: string[] = [];
  if (effectiveMupelId) {
    const { data: jemaatListInMupel } = await supabaseAdmin
      .from('m_jemaat_induk')
      .select('id_induk')
      .eq('id_mupel', effectiveMupelId);
    jemaatIdsInMupel = jemaatListInMupel?.map((j) => j.id_induk) || [];
  }

  // 4. Fetch scoped data & Attention Layer items
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
    let posQuery = supabaseAdmin.from('m_pos_pelkes').select('id_pos, nama_pos, id_induk, kategori, jumlah_jiwa, jumlah_kk');
    let logQuery = supabaseAdmin
      .from('t_log_pastoral')
      .select('*', { count: 'exact', head: true })
      .gte('tgl', startOfMonth)
      .lte('tgl', endOfMonth);
    let demoQuery = supabaseAdmin
      .from('t_demografi_pelkat')
      .select('kategori_pelkat, laki, perempuan');
    let pastoralRecentQuery = supabaseAdmin
      .from('t_log_pastoral')
      .select(`
        id_log, tgl, kegiatan, created_at,
        pos_pelkes:m_pos_pelkes(nama_pos),
        pendeta:m_pendeta(nama_lengkap)
      `)
      .order('tgl', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);
    let aidQuery = supabaseAdmin
      .from('t_ajuan_bantuan')
      .select('*', { count: 'exact', head: true })
      .eq('status_persetujuan', 'PENDING');

    if (activeUnitLevel === 'POS' && effectivePosId) {
      posQuery = posQuery.eq('id_pos', effectivePosId);
      logQuery = logQuery.eq('id_pos', effectivePosId);
      demoQuery = demoQuery.eq('id_pos', effectivePosId);
      pastoralRecentQuery = pastoralRecentQuery.eq('id_pos', effectivePosId);
      aidQuery = aidQuery.eq('id_pos', effectivePosId);
    } else if (activeUnitLevel === 'JEMAAT' && effectiveIndukId) {
      posQuery = posQuery.eq('id_induk', effectiveIndukId);
      jemaatQuery = jemaatQuery.eq('id_induk', effectiveIndukId);
      demoQuery = demoQuery.eq('id_induk', effectiveIndukId);
    } else if (activeUnitLevel === 'MUPEL' && effectiveMupelId) {
      mupelQuery = mupelQuery.eq('id_mupel', effectiveMupelId);
      jemaatQuery = jemaatQuery.eq('id_mupel', effectiveMupelId);
      if (jemaatIdsInMupel.length > 0) {
        posQuery = posQuery.in('id_induk', jemaatIdsInMupel);
      }
    } else if (isLocked) {
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
      logQuery,
      demoQuery,
      posQuery,
      pastoralRecentQuery,
      supabaseAdmin
        .from('t_histori_perubahan_status')
        .select(`
          id_histori, status_lama, status_baru, tanggal_perubahan, keterangan_perubahan, catatan, created_at,
          pos_pelkes:m_pos_pelkes(nama_pos)
        `)
        .order('created_at', { ascending: false })
        .limit(5),
      aidQuery
    ]);

    // Compute responsive StatCard numbers based on context level & user role scope
    const effectiveScopeLevel = activeUnitLevel !== 'SINODE'
      ? activeUnitLevel
      : (userRole === 'pj' || userRole === 'user' ? 'POS' : (userRole === 'kmj' ? 'JEMAAT' : (userRole === 'admin_mupel' ? 'MUPEL' : 'SINODE')));

    if (effectiveScopeLevel === 'POS') {
      mupelCount = 1;
      jemaatCount = 1;
      const isBajem = (activePosData?.kategori || '').toLowerCase().includes('bajem') || (resSum.data?.[0]?.kategori || '').toLowerCase().includes('bajem');
      bajemCount = isBajem ? 1 : 0;
      posPelkesCount = isBajem ? 0 : 1;
    } else if (effectiveScopeLevel === 'JEMAAT') {
      mupelCount = 1;
      jemaatCount = 1;
      posPelkesSumData = resSum.data || [];
      posPelkesSumData.forEach((item: any) => {
        const isBajem = (item.kategori || '').toLowerCase().includes('bajem');
        if (isBajem) bajemCount++;
        else posPelkesCount++;
      });
    } else if (effectiveScopeLevel === 'MUPEL') {
      mupelCount = 1;
      jemaatCount = resJemaat.count || jemaatIdsInMupel.length || 0;
      posPelkesSumData = resSum.data || [];
      posPelkesSumData.forEach((item: any) => {
        const isBajem = (item.kategori || '').toLowerCase().includes('bajem');
        if (isBajem) bajemCount++;
        else posPelkesCount++;
      });
    } else {
      // Super user / SINODE scope: Show ALL entities in the entire GPIB synod
      mupelCount = resMupel.count || 25;
      jemaatCount = resJemaat.count || 353;
      posPelkesSumData = resSum.data || [];
      posPelkesSumData.forEach((item: any) => {
        const isBajem = (item.kategori || '').toLowerCase().includes('bajem');
        if (isBajem) bajemCount++;
        else posPelkesCount++;
      });
    }

    logCount = resLog.count || 0;
    pendingAidCount = resPendingAid.count || 0;
    demografiData = resDemo.data;
    if (!posPelkesSumData.length && resSum.data) {
      posPelkesSumData = resSum.data;
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

  if (demografiData && demografiData.length > 0) {
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

  const effectiveScopeLevelForJiwa = activeUnitLevel !== 'SINODE'
    ? activeUnitLevel
    : (userRole === 'pj' || userRole === 'user' ? 'POS' : (userRole === 'kmj' ? 'JEMAAT' : (userRole === 'admin_mupel' ? 'MUPEL' : 'SINODE')));

  let totalJiwa = 0;
  if (effectiveScopeLevelForJiwa === 'POS') {
    totalJiwa = activePosData?.jumlah_jiwa || (posPelkesSumData?.[0]?.jumlah_jiwa) || totalJiwaFromPelkat || 48;
  } else if (effectiveScopeLevelForJiwa === 'JEMAAT') {
    const sumPos = (posPelkesSumData || []).reduce((acc: number, curr: any) => acc + (curr.jumlah_jiwa || 0), 0);
    totalJiwa = (activeJmtData?.jumlah_jiwa || 0) + sumPos || totalJiwaFromPelkat || 240;
  } else {
    const totalJiwaFromPos = (posPelkesSumData || []).reduce((acc: number, curr: any) => acc + (curr.jumlah_jiwa || 0), 0);
    totalJiwa = totalJiwaFromPos > 0 ? totalJiwaFromPos : (totalJiwaFromPelkat || 668);
  }

  const chartData = KATEGORI_PELKAT.map((pelkat) => ({
    name: pelkat.kode,
    fullName: pelkat.nama,
    icon: pelkat.icon,
    warna: pelkat.warna,
    total: chartDataMap[pelkat.kode] || 0,
  }));

  const routes = getStatRoutes({
    id_mupel: effectiveMupelId,
    id_induk: effectiveIndukId,
    id_pos: effectivePosId,
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
      label: 'Jemaat',
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
    <div className="w-full min-h-full bg-surface-base pb-28 pt-1 sm:pt-3">
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-7 sm:space-y-9">
        
        {/* LAYER 1: CONTEXT & HERO LAYER (Open Canvas — Fluid & Breathable) */}
        <section className="pt-2 sm:pt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <StatusPill variant="gold" dot={true}>
                Sinode GPIB
              </StatusPill>
              <StatusPill variant="blue" dot={false}>
                {humanRole}
              </StatusPill>
            </div>
            <div className="shrink-0">
              <ScopeIndicator scope={roleScopeObj} />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="micro-label text-ink-tertiary block">
              {scopeLabel}
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-ink-primary tracking-tight leading-[1.15]">
              <span>Selamat Datang,</span>
              <span className="block font-editorial-italic font-normal text-amber-700 dark:text-amber-400 mt-0.5 sm:mt-1">
                {userNama}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
              Platform Tata Kelola Terpadu &amp; Transparansi Pelayanan Gereja Protestan di Indonesia bagian Barat.
            </p>
          </div>
        </section>

        {/* LAYER 2: STREAMLINED METRIC STRIP (No Heavy Boxes) */}
        <section>
          <StatCards stats={customStats} />
        </section>

        {/* LAYER 3: ATTENTION & PROJECTION LAYER (Clean Banner Strip) */}
        <section>
          {pendingAidCount > 0 ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 p-4 sm:p-5 transition-all">
              <Link href="/projections/aid-queue" className="flex items-center justify-between gap-3 group" aria-label="Review antrean permohonan bantuan">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
                    <HeartHandshake className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-editorial text-sm sm:text-base font-bold text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {pendingAidCount} Permohonan Bantuan Menunggu Review
                      </span>
                      <StatusPill variant="gold" pulse>
                        Perlu Tindakan
                      </StatusPill>
                    </div>
                    <p className="text-xs text-ink-secondary line-clamp-1 mt-0.5">
                      Ajuan bantuan pos pelkes memerlukan verifikasi &amp; persetujuan KMJ / Sinode
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-surface-1 border border-stone-200/70 dark:border-stone-800 text-xs text-ink-secondary gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  <strong className="text-ink-primary font-bold">Semua Operasional Terkendali</strong> — Tidak ada antrean tugas tertunda.
                </span>
              </div>
              <Link href="/projections/aid-queue" className="micro-label text-amber-700 dark:text-amber-400 hover:underline shrink-0 whitespace-nowrap">
                Antrean Bantuan →
              </Link>
            </div>
          )}
        </section>

        {/* LAYER 4: ACTION SHORTCUTS (Fluid Strip) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="micro-label text-ink-tertiary">
              Aksi Informasi Ringkas
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            <Link
              href="/analytics"
              className="p-3.5 sm:p-4 rounded-2xl bg-surface-1 border border-stone-200/70 dark:border-stone-800 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex flex-col justify-between group min-h-[90px] sm:min-h-[100px]"
              aria-label="Buka Dashboard Analitik"
            >
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit group-hover:scale-105 transition-transform">
                <BarChart3 className="size-4" />
              </div>
              <div className="mt-2">
                <span className="text-xs sm:text-sm font-bold text-ink-primary block truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Analitik
                </span>
                <span className="text-[10px] text-ink-secondary block truncate">KPI &amp; Pertumbuhan</span>
              </div>
            </Link>

            <Link
              href="/maps"
              className="p-3.5 sm:p-4 rounded-2xl bg-surface-1 border border-stone-200/70 dark:border-stone-800 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex flex-col justify-between group min-h-[90px] sm:min-h-[100px]"
              aria-label="Buka Peta Sebaran"
            >
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 w-fit group-hover:scale-105 transition-transform">
                <Map className="size-4" />
              </div>
              <div className="mt-2">
                <span className="text-xs sm:text-sm font-bold text-ink-primary block truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Peta Sebaran
                </span>
                <span className="text-[10px] text-ink-secondary block truncate">Peta teritori pos</span>
              </div>
            </Link>

            <Link
              href="/dashboard/aktivitas"
              className="p-3.5 sm:p-4 rounded-2xl bg-surface-1 border border-stone-200/70 dark:border-stone-800 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex flex-col justify-between group min-h-[90px] sm:min-h-[100px]"
              aria-label="Buka Log Pastoral"
            >
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit group-hover:scale-105 transition-transform">
                <FileText className="size-4" />
              </div>
              <div className="mt-2">
                <span className="text-xs sm:text-sm font-bold text-ink-primary block truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Log Pastoral
                </span>
                <span className="text-[10px] text-ink-secondary block truncate">Catatan kegiatan</span>
              </div>
            </Link>

            <Link
              href="/aid-requests"
              className="p-3.5 sm:p-4 rounded-2xl bg-surface-1 border border-stone-200/70 dark:border-stone-800 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex flex-col justify-between group min-h-[90px] sm:min-h-[100px]"
              aria-label="Buka Permohonan Bantuan"
            >
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 w-fit group-hover:scale-105 transition-transform">
                <HeartHandshake className="size-4" />
              </div>
              <div className="mt-2">
                <span className="text-xs sm:text-sm font-bold text-ink-primary block truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Ajukan Bantuan
                </span>
                <span className="text-[10px] text-ink-secondary block truncate">Permohonan pos</span>
              </div>
            </Link>

            <Link
              href="/people"
              className="p-3.5 sm:p-4 rounded-2xl bg-surface-1 border border-stone-200/70 dark:border-stone-800 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex flex-col justify-between group min-h-[90px] sm:min-h-[100px]"
              aria-label="Buka Direktori SDM"
            >
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit group-hover:scale-105 transition-transform">
                <Users className="size-4" />
              </div>
              <div className="mt-2">
                <span className="text-xs sm:text-sm font-bold text-ink-primary block truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Direktori SDM
                </span>
                <span className="text-[10px] text-ink-secondary block truncate">Pendeta &amp; Pelayan</span>
              </div>
            </Link>

            <Link
              href="/org"
              className="p-3.5 sm:p-4 rounded-2xl bg-surface-1 border border-stone-200/70 dark:border-stone-800 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex flex-col justify-between group min-h-[90px] sm:min-h-[100px]"
              aria-label="Buka Direktori Organisasi"
            >
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit group-hover:scale-105 transition-transform">
                <Building className="size-4" />
              </div>
              <div className="mt-2">
                <span className="text-xs sm:text-sm font-bold text-ink-primary block truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  Direktori Org
                </span>
                <span className="text-[10px] text-ink-secondary block truncate">Pos &amp; Jemaat Induk</span>
              </div>
            </Link>
          </div>
        </section>

        {/* LAYER 5: VISUAL INSIGHT SECTION (Demografi & Aktivitas) */}
        <section className="space-y-4 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="micro-label text-ink-tertiary">
              Komposisi Demografi &amp; Aktivitas
            </span>
            <Link
              href="/projections/reports"
              className="micro-label text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              aria-label="Buka Laporan & Analitik Full"
            >
              <span>Laporan Full</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="lg:col-span-2">
              <DemografiChart data={chartData} />
            </div>
            <div>
              <RecentActivity logs={recentLogs as any || []} />
            </div>
          </div>

          {userRole === 'kmj' && userIndukId && (
            <div className="mt-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-surface-1 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-editorial text-lg font-bold text-ink-primary">Aktivitas Pastoral Minggu Ini</h3>
                <Link href="/projections/pastoral-dashboard" className="micro-label text-amber-700 dark:text-amber-400 hover:underline">
                  Lihat Semua →
                </Link>
              </div>
              <PastoralStats idJemaat={userIndukId} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
