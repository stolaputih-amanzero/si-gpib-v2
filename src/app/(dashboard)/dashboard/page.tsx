import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { StatCards } from "@/components/dashboard/StatCards";
import { DemografiChart } from "@/components/dashboard/DemografiChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";

interface DemografiRow {
  kategori_pelkat: string;
  laki: number;
  perempuan: number;
}

export default async function Dashboard() {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  let posCount: number | null = 0;
  let jemaatCount: number | null = 0;
  let logCount: number | null = 0;
  let demografiData: any[] | null = [];
  let posPelkesSumData: any[] | null = [];
  let recentLogs: any[] | null = [];

  try {
    const [resPos, resJemaat, resLog, resDemo, resSum, resPastoral, resHistori] = await Promise.all([
      supabaseAdmin.from('m_pos_pelkes').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('m_jemaat_induk').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('t_log_pastoral')
        .select('*', { count: 'exact', head: true })
        .gte('tgl', startOfMonth)
        .lte('tgl', endOfMonth),
      supabaseAdmin
        .from('t_demografi_pelkat')
        .select('kategori_pelkat, laki, perempuan'),
      supabaseAdmin
        .from('m_pos_pelkes')
        .select('jumlah_jiwa'),
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

    posCount = resPos.count;
    jemaatCount = resJemaat.count;
    logCount = resLog.count;
    demografiData = resDemo.data;
    posPelkesSumData = resSum.data;

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
    'Pelayanan Anak (PA)': 0,
    'Persekutuan Teruna (PT)': 0,
    'Gerakan Pemuda (GP)': 0,
    'Persekutuan Kaum Perempuan (PKP)': 0,
    'Persekutuan Kaum Bapak (PKB)': 0,
    'Persekutuan Kaum Lanjut Usia (PKLU)': 0,
  };

  if (demografiData) {
    (demografiData as DemografiRow[]).forEach((row) => {
      const sum = row.laki + row.perempuan;
      totalJiwaFromPelkat += sum;
      
      let category = row.kategori_pelkat;
      if (category.toLowerCase().includes('anak') || category === 'PA') category = 'PA';
      else if (category.toLowerCase().includes('teruna') || category === 'PT') category = 'PT';
      else if (category.toLowerCase().includes('pemuda') || category === 'GP') category = 'GP';
      else if (category.toLowerCase().includes('perempuan') || category === 'PKP') category = 'PKP';
      else if (category.toLowerCase().includes('bapak') || category.toLowerCase().includes('bapa') || category === 'PKB') category = 'PKB';
      else if (category.toLowerCase().includes('lanjut usia') || category.toLowerCase().includes('lansia') || category === 'PKLU') category = 'PKLU';
      else category = category.substring(0, 4).toUpperCase();
      
      chartDataMap[category] = (chartDataMap[category] || 0) + sum;
    });
  }

  const totalJiwaFromPos = (posPelkesSumData || []).reduce((acc: number, curr: any) => acc + (curr.jumlah_jiwa || 0), 0);
  const totalJiwa = totalJiwaFromPos > 0 ? totalJiwaFromPos : totalJiwaFromPelkat;

  const chartData = Object.entries(chartDataMap)
    .map(([name, total]) => ({ name, total }))
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div className="w-full min-h-full bg-surface-base pb-24">
      <div className="sticky top-0 z-40 bg-surface-1/85 backdrop-blur-md hairline-b px-4 py-3.5 md:px-6 pt-safe">
        <h1 className="text-xl md:text-2xl font-display font-semibold tracking-tightish text-ink-primary">
          Dashboard Utama
        </h1>
        <p className="text-xs md:text-sm text-ink-secondary mt-0.5">
          Sistem Informasi Pelayanan &amp; Kesaksian GPIB
        </p>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-5 md:px-6 space-y-6">
        <section className="ambient-glow">
          <StatCards 
            posCount={posCount || 0}
            jemaatCount={jemaatCount || 0}
            totalJiwa={totalJiwa}
            logCount={logCount || 0}
          />
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
