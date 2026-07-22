import { notFound } from 'next/navigation';
import { 
  MapPin, 
  Users, 
  Building2, 
  Calendar, 
  Home, 
  User, 
  Phone, 
  Map, 
  AlertCircle, 
  Compass, 
  Activity,
  ExternalLink
} from 'lucide-react';
import PosProfileHeroWrapper from './pos-profile-hero-wrapper';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PosThumbnailMapWrapper from '@/components/maps/PosThumbnailMapWrapper';
import { JadwalTabContent } from './jadwal-tab-content';
import { DemografiTabContent } from '@/components/demografi/DemografiTabContent';
import { PosAsetTabContent } from './pos-aset-tab-content';
import { LogPastoralTabContent } from './log-pastoral-tab-content';
import { AnalisisWilayahTabContent } from './analisis-wilayah-tab-content';
import { PendetaPelayanTabContent } from './pendeta-pelayan-tab-content';

// --- Types ---
interface PosDetail {
  id_pos: string;
  id_induk: string;
  nama_pos: string;
  kategori: string | null;
  alamat: string;
  latitude: number | null;
  longitude: number | null;
  tgl_berdiri: string | null;
  keterangan: string | null;
  foto_url?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  jumlah_kk?: number | null;
  jumlah_jiwa?: number | null;
  jemaat_induk: {
    nama_induk: string;
    id_induk: string;
    id_mupel: string;
    mupel?: {
      id_mupel: string;
      nama_mupel: string;
    } | null;
  } | null;
}

interface Demografi {
  kategori_pelkat: string;
  jml_kk: number;
  laki: number;
  perempuan: number;
  profesi?: string | null;
  pendidikan?: string | null;
  keterangan?: string | null;
}

interface LogPastoral {
  id_log: string;
  tgl: string;
  kegiatan: string;
  jml_jiwa: number | null;
  catatan: string | null;
  pendeta: { nama_lengkap: string } | null;
}

interface PJDetail {
  id_pendeta: string;
  nama_lengkap: string;
  no_wa: string | null;
  status_tugas: string;
  tgl_mulai: string;
  foto_url?: string | null;
}

interface Pelayan {
  id_pelayan: string;
  nama: string;
  no_wa: string | null;
  jabatan: string | null;
  status: string;
  keterangan: string | null;
  foto_url?: string | null;
}

interface Relawan {
  id_relawan: string;
  nama: string;
  no_wa: string | null;
  tgl_lahir: string | null;
  gender: string | null;
  kategori: string | null;
  pelatihan: string | null;
  keterangan: string | null;
  foto_url?: string | null;
}

interface Kerawanan {
  id_risiko: string;
  kategori: string | null;
  jenis_risiko: string | null;
  frekuensi: string | null;
  keterangan: string | null;
}

interface Potensi {
  id_potensi: string;
  nama_potensi: string | null;
  kategori: string | null;
  deskripsi: string | null;
  keterangan: string | null;
}



// --- Helper Functions ---
async function getRelawan(id_pos: string): Promise<Relawan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('t_relawan')
    .select('id_relawan, nama, no_wa, tgl_lahir, gender, kategori, pelatihan, keterangan, foto_url')
    .eq('id_pos', id_pos);
  return (data as Relawan[]) || [];
}

async function getKerawanan(id_pos: string): Promise<Kerawanan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('t_kerawanan_wilayah')
    .select('id_risiko, kategori, jenis_risiko, frekuensi, keterangan')
    .eq('id_pos', id_pos);
  return (data as Kerawanan[]) || [];
}

async function getPotensi(id_pos: string): Promise<Potensi[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('t_potensi_wilayah')
    .select('id_potensi, nama_potensi, kategori, deskripsi, keterangan')
    .eq('id_pos', id_pos);
  return (data as Potensi[]) || [];
}


async function getPosDetail(id_pos: string): Promise<PosDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('m_pos_pelkes')
    .select(`
      id_pos, id_induk, nama_pos, kategori, alamat, latitude, longitude, tgl_berdiri, keterangan, foto_url, updated_at, updated_by, jumlah_kk, jumlah_jiwa,
      jemaat_induk:m_jemaat_induk(id_induk, nama_induk, id_mupel, mupel:m_mupel(id_mupel, nama_mupel))
    `)
    .eq('id_pos', id_pos)
    .single();

  if (error || !data) return null;
  return data as unknown as PosDetail;
}

async function getDemografi(id_pos: string): Promise<Demografi[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('t_demografi_pelkat')
    .select('kategori_pelkat, jml_kk, laki, perempuan, profesi, pendidikan, keterangan')
    .eq('id_pos', id_pos);
  return data || [];
}

async function getLogPastoral(id_pos: string): Promise<LogPastoral[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('t_log_pastoral')
    .select(`
      id_log, tgl, kegiatan, jml_jiwa, catatan,
      pendeta:m_pendeta(nama_lengkap)
    `)
    .eq('id_pos', id_pos)
    .order('tgl', { ascending: false })
    .limit(15);
  return (data as unknown as LogPastoral[]) || [];
}

async function getPJDetail(id_pos: string): Promise<PJDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('t_penugasan_pendeta')
    .select(`
      tgl_mulai, status_tugas,
      pendeta:m_pendeta(id_pendeta, nama_lengkap, no_wa, foto_url)
    `)
    .eq('id_pos', id_pos)
    .eq('status_tugas', 'Aktif')
    .maybeSingle();

  if (error || !data) return null;
  const d = data as any;
  if (!d.pendeta) return null;
  return {
    id_pendeta: d.pendeta.id_pendeta,
    nama_lengkap: d.pendeta.nama_lengkap,
    no_wa: d.pendeta.no_wa,
    status_tugas: d.status_tugas,
    tgl_mulai: d.tgl_mulai,
    foto_url: d.pendeta.foto_url
  };
}

interface JadwalIbadah {
  id_ibadah: string;
  jenis: string;
  hari: string;
  jam: string;
  zona_waktu?: string | null;
  keterangan?: string | null;
}

async function getJadwalIbadah(id_pos: string): Promise<JadwalIbadah[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('t_jadwal_ibadah')
    .select('id_ibadah, jenis, hari, jam, zona_waktu, keterangan')
    .eq('id_pos', id_pos)
    .order('jam', { ascending: true });
  return (data as JadwalIbadah[]) || [];
}

async function getPelayan(id_pos: string): Promise<Pelayan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('t_pelayan')
    .select('id_pelayan, nama, no_wa, jabatan, status, keterangan, foto_url')
    .eq('id_pos', id_pos)
    .eq('status', 'Aktif');
  
  return (data as Pelayan[]) || [];
}

// --- Main Page Component ---
export default async function PosPelkesDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id_pos: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id_pos } = await params;
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams?.tab || 'profil';

  // Parallel data fetching for optimal performance
  const [pos, demografi, logs, pj, pelayan, relawan, kerawanan, potensi, jadwalList] = await Promise.all([
    getPosDetail(id_pos),
    getDemografi(id_pos),
    getLogPastoral(id_pos),
    getPJDetail(id_pos),
    getPelayan(id_pos),
    getRelawan(id_pos),
    getKerawanan(id_pos),
    getPotensi(id_pos),
    getJadwalIbadah(id_pos),
  ]);

  if (!pos) {
    notFound();
  }

  // Determine if current user has write access to this Pos Pelkes based on RBAC rules
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let canWrite = false;
  let canDelete = false;
  let currentUserName = 'Pelayan Pos';

  if (user) {
    const { data: userAuth } = await supabase
      .from('users')
      .select('nama_lengkap, role, id_mupel, id_induk, id_pos')
      .eq('id', user.id)
      .maybeSingle();

    if (userAuth?.nama_lengkap) {
      currentUserName = userAuth.nama_lengkap;
    } else if (user.email) {
      currentUserName = user.email;
    }

    const role = userAuth?.role || user.user_metadata?.role || 'guest';
    
    if (['super_user', 'superadmin'].includes(role)) {
      canWrite = true;
      canDelete = true;
    } else if (role === 'sinode') {
      canWrite = true;
    } else {
      const targetJemaatId = pos.id_induk;
      const targetMupelId = pos.jemaat_induk?.id_mupel;
      
      canWrite = 
        (role === 'admin_mupel' && userAuth?.id_mupel === targetMupelId) ||
        (['kmj', 'admin_jemaat', 'pj_pos'].includes(role) && userAuth?.id_induk === targetJemaatId) ||
        (['pelayan', 'relawan'].includes(role) && (
          (userAuth?.id_induk && userAuth.id_induk === targetJemaatId) ||
          (userAuth?.id_pos && userAuth.id_pos === pos.id_pos)
        ));
    }
  }

  // Calculate totals from demografi
  const demoKK = demografi.reduce((acc, curr) => acc + (curr.jml_kk || 0), 0);
  const demoLaki = demografi.reduce((acc, curr) => acc + (curr.laki || 0), 0);
  const demoPerempuan = demografi.reduce((acc, curr) => acc + (curr.perempuan || 0), 0);
  const demoJiwa = demoLaki + demoPerempuan;

  const totalKK = demoKK || pos.jumlah_kk || 0;
  const totalJiwa = demoJiwa || pos.jumlah_jiwa || 0;
  const totalLaki = demoLaki;
  const totalPerempuan = demoPerempuan;

  // Category badges configuration
  const isBajem = pos.kategori === 'Bajem' || pos.nama_pos.toLowerCase().includes('bajem');
  const catLabel = isBajem ? 'Bakal Jemaat' : 'Pos Pelkes';
  const catColor = isBajem 
    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50' 
    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50';

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto px-3.5 sm:px-6">
      {/* Premium Hero Banner Showcase Wrapper with Fullscreen Lightbox */}
      <PosProfileHeroWrapper
        pos={pos}
        catLabel={catLabel}
        catColor={catColor}
        totalKK={totalKK}
        totalJiwa={totalJiwa}
        canWrite={canWrite}
        canDelete={canDelete}
        pjName={pj?.nama_lengkap}
        jadwalList={jadwalList}
        currentUserName={currentUserName}
      />

      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="w-full">
        {/* Scrollable Tabs Trigger Container */}
        <div className="border-b border-border-subtle mb-6 bg-surface-elevated rounded-2xl p-1 shadow-soft overflow-hidden">
          <TabsList className="flex items-center justify-start overflow-x-auto w-full h-12 bg-transparent p-0 gap-1 no-scrollbar scrollbar-none touch-pan-x">
            <TabsTrigger 
              value="profil" 
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 min-h-[40px] text-xs font-bold whitespace-nowrap rounded-xl data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Home size={14} />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger 
              value="jadwal" 
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 min-h-[40px] text-xs font-bold whitespace-nowrap rounded-xl data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Calendar size={14} />
              <span>Jadwal Ibadah</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pendeta" 
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 min-h-[40px] text-xs font-bold whitespace-nowrap rounded-xl data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <User size={14} />
              <span>Pendeta & Pelayan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="demografi" 
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 min-h-[40px] text-xs font-bold whitespace-nowrap rounded-xl data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Users size={14} />
              <span>Demografi</span>
            </TabsTrigger>
            <TabsTrigger 
              value="aset" 
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 min-h-[40px] text-xs font-bold whitespace-nowrap rounded-xl data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Building2 size={14} />
              <span>Aset</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wilayah" 
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 min-h-[40px] text-xs font-bold whitespace-nowrap rounded-xl data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Compass size={14} />
              <span>Analisis Wilayah</span>
            </TabsTrigger>
            <TabsTrigger 
              value="log" 
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 min-h-[40px] text-xs font-bold whitespace-nowrap rounded-xl data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <Activity size={14} />
              <span>Log Pastoral</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: PROFIL */}
        <TabsContent value="profil" className="space-y-4 focus-visible:outline-none">
          {/* Single Card Summary Demografi (2 Horizontal Rows) */}
          <div className="bg-surface-elevated p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-soft space-y-3.5">
            {/* Baris 1: Jumlah KK & Total Jiwa */}
            <div className="grid grid-cols-2 gap-3 divide-x divide-border-subtle/60">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Home size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider block">Jumlah KK</span>
                  <p className="text-lg sm:text-xl font-black text-text-high tabular-nums">{totalKK} <span className="text-xs font-normal text-text-muted">KK</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-3 sm:pl-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Users size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider block">Total Jiwa</span>
                  <p className="text-lg sm:text-xl font-black text-brand-primary tabular-nums">{totalJiwa} <span className="text-xs font-normal text-text-muted">Jiwa</span></p>
                </div>
              </div>
            </div>

            <div className="border-t border-border-subtle/60" />

            {/* Baris 2: Laki-Laki & Perempuan */}
            <div className="grid grid-cols-2 gap-3 divide-x divide-border-subtle/60">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Users size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider block">Laki-Laki</span>
                  <p className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 tabular-nums">{totalLaki} <span className="text-xs font-normal text-text-muted">Jiwa</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-3 sm:pl-4">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/60 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                  <Users size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider block">Perempuan</span>
                  <p className="text-lg sm:text-xl font-black text-pink-600 dark:text-pink-400 tabular-nums">{totalPerempuan} <span className="text-xs font-normal text-text-muted">Jiwa</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick PJ Panel */}
          {pj && (
            <Card className="border-border-subtle shadow-soft bg-surface-elevated overflow-hidden">
              <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-3">
                <Link
                  href={`/pendeta/${pj.id_pendeta}`}
                  className="flex items-center gap-3 group hover:opacity-90 transition-opacity min-w-0 flex-1"
                >
                  {pj.foto_url ? (
                    <img
                      src={pj.foto_url}
                      alt={pj.nama_lengkap}
                      className="w-10 h-10 rounded-xl object-cover border border-border-subtle shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      {pj.nama_lengkap.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-extrabold text-brand-primary uppercase tracking-wider block">Pendeta Jemaat</span>
                    <h4 className="font-extrabold text-sm sm:text-base text-text-high leading-snug break-words group-hover:text-brand-primary group-hover:underline transition-colors">
                      <span>{pj.nama_lengkap}</span>
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Aktif: {new Date(pj.tgl_mulai).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </Link>

                {pj.no_wa && (
                  <a
                    href={`https://wa.me/${pj.no_wa.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 min-h-[32px] min-w-[32px] rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-xs"
                    title={`Chat WhatsApp dengan ${pj.nama_lengkap} (${pj.no_wa})`}
                  >
                    <Phone size={14} />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 border-border-subtle shadow-soft">
              <CardHeader className="pb-3 border-b border-border-subtle">
                <CardTitle className="flex items-center gap-2 text-base font-extrabold text-text-high">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                  Informasi Lokasi & Wilayah
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Alamat Pos</span>
                  <p className="text-sm font-medium text-text-high leading-relaxed">{pos.alamat || 'Alamat belum diisi'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
                  <div className="space-y-1">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Jemaat Induk Pengampu</span>
                    {pos.jemaat_induk ? (
                      <Link 
                        href={`/hierarki/${encodeURIComponent(pos.jemaat_induk.id_mupel)}/${encodeURIComponent(pos.jemaat_induk.id_induk)}`}
                        className="text-sm font-bold text-brand-primary hover:underline block"
                      >
                        {pos.jemaat_induk.nama_induk}
                      </Link>
                    ) : (
                      <p className="text-sm font-bold text-brand-primary">-</p>
                    )}
                  </div>
                  {pos.tgl_berdiri && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Tanggal Berdiri</span>
                      <p className="text-sm font-semibold text-text-high flex items-center gap-1.5">
                        <Calendar size={14} className="text-text-muted" />
                        {new Date(pos.tgl_berdiri).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>

                {pos.latitude && pos.longitude ? (
                  <div className="space-y-4 pt-3 border-t border-border-subtle">
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Peta Lokasi</span>
                      <div className="h-48 w-full rounded-xl overflow-hidden border border-border-subtle">
                        <PosThumbnailMapWrapper 
                          latitude={pos.latitude} 
                          longitude={pos.longitude} 
                          nama_pos={pos.nama_pos} 
                          alamat={pos.alamat} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-sunken/50 p-3.5 rounded-xl border border-border-subtle/50">
                      <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-brand-primary shrink-0" />
                        <div className="text-xs font-semibold text-text-high space-y-0.5">
                          <div>Lintang (Lat): {pos.latitude}</div>
                          <div>Bujur (Lng): {pos.longitude}</div>
                        </div>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${pos.latitude},${pos.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[36px] px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Map size={14} />
                        <span>Petunjuk Rute Map</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <span>Koordinat GPS belum disetel untuk pos ini.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Keterangan & Foto Side Card */}
            <Card className="border-border-subtle shadow-soft h-full flex flex-col">
              <CardHeader className="pb-3 border-b border-border-subtle">
                <CardTitle className="text-base font-extrabold text-text-high">Foto & Keterangan</CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Foto Profil Pos Pelkes */}
                {pos.foto_url && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Foto Tampak Depan Gedung / Lokasi</span>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border-subtle bg-surface-sunken">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={pos.foto_url} 
                        alt={`Foto Profil ${pos.nama_pos}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Catatan Keterangan</span>
                  {pos.keterangan ? (
                    <p className="text-xs text-text-muted whitespace-pre-wrap leading-relaxed italic bg-surface-sunken/60 p-3 rounded-xl border border-border-subtle/50">
                      "{pos.keterangan}"
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted italic py-3">
                      Tidak ada keterangan tambahan yang diisi.
                    </p>
                  )}
                </div>

                {/* Audit Information Metadata */}
                <div className="pt-3 border-t border-border-subtle/60 text-[11px] text-text-muted space-y-1 bg-surface-sunken/40 p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-muted">Tanggal Diperbarui:</span>
                    <span className="font-bold text-text-high font-mono">
                      {pos.updated_at 
                        ? new Date(pos.updated_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-muted">Diperbarui Oleh:</span>
                    <span className="font-bold text-brand-primary truncate max-w-[170px]" title={pos.updated_by || currentUserName}>
                      {pos.updated_by || currentUserName}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: JADWAL IBADAH */}
        <TabsContent value="jadwal" className="space-y-4 focus-visible:outline-none transition-all duration-300 ease-in-out data-[state=inactive]:hidden data-[state=active]:animate-fadeIn">
          <Card className="border-border-subtle shadow-soft">
            <CardContent className="p-5">
              <JadwalTabContent id_pos={pos.id_pos} canWrite={canWrite} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PENDETA & PELAYAN */}
        <TabsContent value="pendeta" className="space-y-6 focus-visible:outline-none transition-all duration-300 ease-in-out data-[state=inactive]:hidden data-[state=active]:animate-fadeIn">
          <PendetaPelayanTabContent
            id_pos={pos.id_pos}
            id_induk={pos.id_induk}
            nama_induk={pos.jemaat_induk?.nama_induk || ''}
            pj={pj}
            pelayan={pelayan}
            relawan={relawan}
            canWrite={canWrite}
          />
        </TabsContent>

        {/* TAB 3: DEMOGRAFI */}
        <TabsContent value="demografi" className="space-y-4 focus-visible:outline-none transition-all duration-300 ease-in-out data-[state=inactive]:hidden data-[state=active]:animate-fadeIn">
          <Card className="border-border-subtle shadow-soft">
            <CardContent className="p-5">
              <DemografiTabContent id_pos={pos.id_pos} canWrite={canWrite} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: ASET */}
        <TabsContent value="aset" className="space-y-6 focus-visible:outline-none transition-all duration-300 ease-in-out data-[state=inactive]:hidden data-[state=active]:animate-fadeIn">
          <Card className="border-border-subtle shadow-soft">
            <CardContent className="p-5">
              <PosAsetTabContent id_pos={pos.id_pos} canWrite={canWrite} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: ANALISIS WILAYAH (KERAWANAN & POTENSI) */}
        <TabsContent value="wilayah" className="space-y-6 focus-visible:outline-none transition-all duration-300 ease-in-out data-[state=inactive]:hidden data-[state=active]:animate-fadeIn">
          <AnalisisWilayahTabContent
            id_pos={pos.id_pos}
            initialKerawanan={kerawanan}
            initialPotensi={potensi}
            canWrite={canWrite}
          />
        </TabsContent>

        {/* TAB 6: LOG PASTORAL */}
        <TabsContent value="log" className="space-y-4 focus-visible:outline-none transition-all duration-300 ease-in-out data-[state=inactive]:hidden data-[state=active]:animate-fadeIn">
          <LogPastoralTabContent id_pos={pos.id_pos} id_induk={pos.id_induk} initialLogs={logs} canWrite={canWrite} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
