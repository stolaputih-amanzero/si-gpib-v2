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
  ExternalLink,
  Edit3,
  Plus
} from 'lucide-react';
import PosProfileHeroWrapper from './pos-profile-hero-wrapper';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PosThumbnailMapWrapper from '@/components/maps/PosThumbnailMapWrapper';
import AssignPjButton from './assign-pj-button';
import { JadwalTabContent } from './jadwal-tab-content';
import { DemografiTabContent } from '@/components/demografi/DemografiTabContent';

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

interface Aset {
  id: string;
  jenis: string; // 'Tanah', 'Bangunan', 'Aset Bergerak'
  nama: string;
  status: string;
  keterangan: string | null;
  lampiran: { file_path: string; nama_file: string } | null;
  detail: string | null;
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
}

interface Pelayan {
  id_pelayan: string;
  nama: string;
  no_wa: string | null;
  jabatan: string | null;
  status: string;
  keterangan: string | null;
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
    .select('id_relawan, nama, no_wa, tgl_lahir, gender, kategori, pelatihan, keterangan')
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

async function getAset(id_pos: string): Promise<Aset[]> {
  const supabase = await createClient();
  const [tanahRes, bangunanRes, bergerakRes] = await Promise.all([
    supabase
      .from('t_aset_tanah')
      .select('id_tanah, luas_m2, thn_perolehan, status_hukum, kondisi, keterangan, lampiran:t_lampiran_aset(file_path, nama_file)')
      .eq('id_pos', id_pos),
    supabase
      .from('t_aset_bangunan')
      .select('id_bangunan, fungsi, kondisi, thn_berdiri, keterangan, lampiran:t_lampiran_aset(file_path, nama_file)')
      .eq('id_pos', id_pos),
    supabase
      .from('t_aset_bergerak')
      .select('id_aset_b, jenis, merk_tipe, thn_perolehan, no_polisi, tgl_pajak, keterangan, lampiran:t_lampiran_aset(file_path, nama_file)')
      .eq('id_pos', id_pos)
  ]);

  const tanah = (tanahRes.data || []).map((t: any) => ({
    id: t.id_tanah,
    jenis: 'Tanah',
    nama: `Tanah (${t.luas_m2 || 0} m²)`,
    status: t.status_hukum || t.kondisi || 'Aktif',
    keterangan: t.keterangan,
    lampiran: t.lampiran?.[0] || null,
    detail: t.thn_perolehan ? `Tahun Perolehan: ${t.thn_perolehan}` : null
  }));

  const bangunan = (bangunanRes.data || []).map((b: any) => ({
    id: b.id_bangunan,
    jenis: 'Bangunan',
    nama: b.fungsi || 'Bangunan',
    status: b.kondisi || 'Aktif',
    keterangan: b.keterangan,
    lampiran: b.lampiran?.[0] || null,
    detail: b.thn_berdiri ? `Tahun Berdiri: ${b.thn_berdiri}` : null
  }));

  const bergerak = (bergerakRes.data || []).map((bg: any) => ({
    id: bg.id_aset_b,
    jenis: 'Aset Bergerak',
    nama: bg.merk_tipe || bg.jenis || 'Kendaraan/Peralatan',
    status: bg.no_polisi ? `No. Polisi: ${bg.no_polisi}` : 'Aktif',
    keterangan: bg.keterangan,
    lampiran: bg.lampiran?.[0] || null,
    detail: bg.thn_perolehan ? `Tahun Perolehan: ${bg.thn_perolehan}` : null
  }));

  return [...tanah, ...bangunan, ...bergerak];
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
      pendeta:m_pendeta(id_pendeta, nama_lengkap, no_wa)
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
    tgl_mulai: d.tgl_mulai
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
    .select('id_pelayan, nama, no_wa, jabatan, status, keterangan')
    .eq('id_pos', id_pos)
    .eq('status', 'Aktif');
  
  return (data as Pelayan[]) || [];
}

// --- Main Page Component ---
export default async function PosPelkesDetailPage({ params }: { params: Promise<{ id_pos: string }> }) {
  const { id_pos } = await params;

  // Parallel data fetching for optimal performance
  const [pos, demografi, aset, logs, pj, pelayan, relawan, kerawanan, potensi, jadwalList] = await Promise.all([
    getPosDetail(id_pos),
    getDemografi(id_pos),
    getAset(id_pos),
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
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
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
      <Tabs defaultValue="profil" className="w-full">
        {/* Scrollable Tabs Trigger Container */}
        <div className="border-b border-border-subtle mb-6 bg-surface-elevated rounded-xl p-1 shadow-soft">
          <TabsList className="flex items-center justify-start overflow-x-auto w-full h-11 bg-transparent p-0 gap-1 scrollbar-none">
            <TabsTrigger 
              value="profil" 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg"
            >
              <Home size={14} />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger 
              value="jadwal" 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg"
            >
              <Calendar size={14} />
              <span>Jadwal Ibadah</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pendeta" 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg"
            >
              <User size={14} />
              <span>Pendeta & Pelayan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="demografi" 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg"
            >
              <Users size={14} />
              <span>Demografi</span>
            </TabsTrigger>
            <TabsTrigger 
              value="aset" 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg"
            >
              <Building2 size={14} />
              <span>Aset</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wilayah" 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg"
            >
              <Compass size={14} />
              <span>Analisis Wilayah</span>
            </TabsTrigger>
            <TabsTrigger 
              value="log" 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg"
            >
              <Activity size={14} />
              <span>Log Pastoral</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: PROFIL */}
        <TabsContent value="profil" className="space-y-4 focus-visible:outline-none">
          {/* Stat Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft flex flex-col items-center justify-center text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Home size={16} />
              </div>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Jumlah KK</span>
              <p className="text-xl font-black text-text-high tabular-nums">{totalKK}</p>
            </div>
            <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft flex flex-col items-center justify-center text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Users size={16} />
              </div>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Jiwa</span>
              <p className="text-xl font-black text-brand-primary tabular-nums">{totalJiwa}</p>
            </div>
            <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft flex flex-col items-center justify-center text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users size={16} />
              </div>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Laki-Laki</span>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 tabular-nums">{totalLaki}</p>
            </div>
            <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft flex flex-col items-center justify-center text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-950/60 flex items-center justify-center text-pink-600 dark:text-pink-400">
                <Users size={16} />
              </div>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Perempuan</span>
              <p className="text-xl font-black text-pink-600 dark:text-pink-400 tabular-nums">{totalPerempuan}</p>
            </div>
          </div>

          {/* Quick PJ Panel */}
          {pj && (
            <Card className="border-border-subtle shadow-soft bg-gradient-to-r from-brand-primary/5 via-transparent to-transparent">
              <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-lg shrink-0">
                    {pj.nama_lengkap.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest block">Pendeta Penanggung Jawab</span>
                    <h4 className="font-extrabold text-base text-text-high leading-tight">{pj.nama_lengkap}</h4>
                    <p className="text-xs text-text-muted mt-0.5">Aktif sejak: {new Date(pj.tgl_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                {pj.no_wa && (
                  <a
                    href={`https://wa.me/${pj.no_wa.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-700 transition-colors shrink-0 shadow-xs"
                  >
                    <Phone size={14} />
                    <span>Hubungi WA</span>
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
        <TabsContent value="jadwal" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border-subtle shadow-soft">
            <CardContent className="p-5">
              <JadwalTabContent id_pos={pos.id_pos} canWrite={canWrite} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PENDETA & PELAYAN */}
        <TabsContent value="pendeta" className="space-y-6 focus-visible:outline-none">
          {/* Pendeta Section */}
          <Card className="border-border-subtle shadow-soft">
            <CardHeader className="pb-3 border-b border-border-subtle flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2 text-base font-extrabold text-text-high">
                <User className="w-5 h-5 text-brand-primary" />
                Pendeta Penanggung Jawab (PJ)
              </CardTitle>
              {canWrite && <AssignPjButton id_induk={pos.id_induk} nama_induk={pos.jemaat_induk?.nama_induk || ''} />}
            </CardHeader>
            <CardContent className="p-5">
              {pj ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surface-sunken border border-border-subtle rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-xl shrink-0">
                      {pj.nama_lengkap.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-text-high leading-tight">{pj.nama_lengkap}</h4>
                      <span className="text-xs font-semibold text-text-muted mt-1 inline-block">
                        Aktif sejak: {new Date(pj.tgl_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {pj.no_wa && (
                    <a
                      href={`https://wa.me/${pj.no_wa.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs w-full sm:w-auto justify-center"
                    >
                      <Phone size={14} />
                      <span>Chat via WhatsApp ({pj.no_wa})</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-surface-sunken/40 border border-dashed border-border-subtle rounded-xl text-text-muted space-y-1">
                  <User size={32} className="mx-auto text-text-muted/40" />
                  <p className="text-sm font-bold">Belum ada PJ Ditugaskan</p>
                  <p className="text-xs max-w-sm mx-auto px-4">
                    Tidak ada Pendeta Jemaat khusus yang ditempatkan secara terdaftar. Tugas pastoral dilayani di bawah naungan KMJ Jemaat Induk.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pelayan/Relawan Section */}
          <Card className="border-border-subtle shadow-soft">
            <CardHeader className="pb-3 border-b border-border-subtle flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2 text-base font-extrabold text-text-high">
                <Users className="w-5 h-5 text-brand-primary" />
                Majelis & Pelayan Jemaat
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-bold text-xs bg-surface-sunken">
                  {pelayan.length} Aktif
                </Badge>
                <Link
                  href={`/sdm/pelayan?id_pos=${pos.id_pos}`}
                  className="px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-[10px] font-bold text-brand-primary flex items-center gap-1 transition-all active:scale-95"
                >
                  <Edit3 size={10} />
                  <span>{canWrite ? 'Kelola Pelayan' : 'Lihat Pelayan'}</span>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {pelayan.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pelayan.map((p) => (
                    <div 
                      key={p.id_pelayan} 
                      className="p-4 border border-border-subtle rounded-xl bg-surface-sunken hover:border-brand-primary/30 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-text-high">{p.nama}</h4>
                          <p className="text-xs font-semibold text-brand-primary mt-0.5">{p.jabatan || 'Pelayan'}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {p.status}
                        </Badge>
                      </div>
                      {p.keterangan && (
                        <p className="text-xs text-text-muted line-clamp-2 italic bg-surface-elevated/50 p-2 rounded border border-border-subtle/40">
                          "{p.keterangan}"
                        </p>
                      )}
                      {p.no_wa && (
                        <a
                          href={`https://wa.me/${p.no_wa.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <Phone size={12} />
                          <span>Hubungi WA ({p.no_wa})</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-surface-sunken/40 border border-dashed border-border-subtle rounded-xl text-text-muted space-y-1">
                  <Users size={32} className="mx-auto text-text-muted/40" />
                  <p className="text-sm font-bold">Tidak ada Data Pelayan</p>
                  <p className="text-xs">Belum ada majelis jemaat atau penatua/diaken terdaftar untuk pos ini.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Relawan/Volunteer Section */}
          <Card className="border-border-subtle shadow-soft">
            <CardHeader className="pb-3 border-b border-border-subtle flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2 text-base font-extrabold text-text-high">
                <Users className="w-5 h-5 text-brand-primary" />
                Relawan & Volunteer
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-bold text-xs bg-surface-sunken">
                  {relawan.length} Terdaftar
                </Badge>
                {canWrite && (
                  <Link
                    href={`/dashboard/pos-pelkes/${pos.id_pos}/edit?tab=relawan`}
                    className="px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-[10px] font-bold text-brand-primary flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                  >
                    <Plus size={10} />
                    <span>Kelola Relawan</span>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {relawan.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relawan.map((r) => (
                    <div 
                      key={r.id_relawan} 
                      className="p-4 border border-border-subtle rounded-xl bg-surface-sunken hover:border-brand-primary/30 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-text-high">{r.nama}</h4>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-wider bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10">
                              {r.kategori || 'Relawan'}
                            </span>
                            {r.gender && (
                              <span className="text-[9px] font-bold text-text-muted px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle">
                                {r.gender === 'L' ? 'Laki-laki' : r.gender === 'P' ? 'Perempuan' : r.gender}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {r.pelatihan && (
                        <div className="text-[11px] text-text-muted bg-surface-elevated p-2 rounded-lg border border-border-subtle/50">
                          <span className="font-bold text-text-high block text-[9px] uppercase tracking-wider mb-0.5">Pelatihan:</span>
                          {r.pelatihan}
                        </div>
                      )}

                      {r.keterangan && (
                        <p className="text-xs text-text-muted italic bg-surface-elevated/50 p-2 rounded border border-border-subtle/40">
                          "{r.keterangan}"
                        </p>
                      )}

                      {r.no_wa && (
                        <a
                          href={`https://wa.me/${r.no_wa.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <Phone size={12} />
                          <span>Hubungi WA ({r.no_wa})</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-surface-sunken/40 border border-dashed border-border-subtle rounded-xl text-text-muted space-y-1">
                  <Users size={32} className="mx-auto text-text-muted/40" />
                  <p className="text-sm font-bold">Tidak ada Data Relawan</p>
                  <p className="text-xs">Belum ada relawan atau volunteer terdaftar untuk pos ini.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: DEMOGRAFI */}
        <TabsContent value="demografi" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border-subtle shadow-soft">
            <CardContent className="p-5">
              <DemografiTabContent id_pos={pos.id_pos} canWrite={canWrite} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: ASET */}
        <TabsContent value="aset" className="space-y-6 focus-visible:outline-none">
          <div className="flex justify-between items-center gap-3">
            <h2 className="text-base font-black text-text-high">Daftar Inventaris Aset</h2>
            {canWrite && (
              <Link
                href={`/dashboard/aset/baru?id_pos=${pos.id_pos}`}
                className="px-3 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[36px]"
              >
                <Plus size={14} />
                <span>Kelola & Tambah Aset</span>
              </Link>
            )}
          </div>
          {/* Asset Categorized Lists */}
          {aset.length === 0 ? (
            <Card className="border-border-subtle shadow-soft">
              <CardContent className="p-8 text-center text-text-muted space-y-2">
                <Building2 size={40} className="mx-auto text-text-muted/40" />
                <p className="text-sm font-bold">Belum ada Data Inventaris Aset</p>
                <p className="text-xs">Data tanah, bangunan, maupun barang bergerak belum diinputkan untuk pos ini.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* 1. Tanah & Lahan */}
              {aset.filter(a => a.jenis === 'Tanah').length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-black text-sm text-text-high uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Aset Tanah & Lahan ({aset.filter(a => a.jenis === 'Tanah').length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aset.filter(a => a.jenis === 'Tanah').map((a) => (
                      <div key={a.id} className="p-4 bg-surface-elevated border border-border-subtle rounded-2xl shadow-soft space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-extrabold text-sm text-text-high leading-tight">{a.nama}</h4>
                            <span className="text-[10px] text-text-muted font-bold block mt-1">ID: {a.id}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-surface-sunken">
                            {a.status}
                          </Badge>
                        </div>
                        {a.keterangan && <p className="text-xs text-text-muted leading-relaxed">{a.keterangan}</p>}
                        
                        {a.detail && (
                          <p className="text-[10px] text-text-muted font-bold uppercase">{a.detail}</p>
                        )}

                        {a.lampiran && (
                          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                            <span className="text-[10px] text-text-muted font-bold truncate max-w-[180px]">{a.lampiran.nama_file}</span>
                            <a
                              href={a.lampiran.file_path.startsWith('http') ? a.lampiran.file_path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pos-pelkes-images/${a.lampiran.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-extrabold text-brand-primary hover:underline flex items-center gap-1 shrink-0"
                            >
                              <span>Unduh Lampiran</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Bangunan */}
              {aset.filter(a => a.jenis === 'Bangunan').length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-black text-sm text-text-high uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Aset Bangunan ({aset.filter(a => a.jenis === 'Bangunan').length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aset.filter(a => a.jenis === 'Bangunan').map((a) => (
                      <div key={a.id} className="p-4 bg-surface-elevated border border-border-subtle rounded-2xl shadow-soft space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-extrabold text-sm text-text-high leading-tight">{a.nama}</h4>
                            <span className="text-[10px] text-text-muted font-bold block mt-1">ID: {a.id}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-surface-sunken">
                            {a.status}
                          </Badge>
                        </div>
                        {a.keterangan && <p className="text-xs text-text-muted leading-relaxed">{a.keterangan}</p>}
                        
                        {a.detail && (
                          <p className="text-[10px] text-text-muted font-bold uppercase">{a.detail}</p>
                        )}

                        {a.lampiran && (
                          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                            <span className="text-[10px] text-text-muted font-bold truncate max-w-[180px]">{a.lampiran.nama_file}</span>
                            <a
                              href={a.lampiran.file_path.startsWith('http') ? a.lampiran.file_path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pos-pelkes-images/${a.lampiran.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-extrabold text-brand-primary hover:underline flex items-center gap-1 shrink-0"
                            >
                              <span>Unduh Lampiran</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Aset Bergerak */}
              {aset.filter(a => a.jenis === 'Aset Bergerak').length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-black text-sm text-text-high uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Aset Bergerak & Kendaraan ({aset.filter(a => a.jenis === 'Aset Bergerak').length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aset.filter(a => a.jenis === 'Aset Bergerak').map((a) => (
                      <div key={a.id} className="p-4 bg-surface-elevated border border-border-subtle rounded-2xl shadow-soft space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-extrabold text-sm text-text-high leading-tight">{a.nama}</h4>
                            <span className="text-[10px] text-text-muted font-bold block mt-1">ID: {a.id}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold bg-surface-sunken">
                            {a.status}
                          </Badge>
                        </div>
                        {a.keterangan && <p className="text-xs text-text-muted leading-relaxed">{a.keterangan}</p>}
                        
                        {a.detail && (
                          <p className="text-[10px] text-text-muted font-bold uppercase">{a.detail}</p>
                        )}

                        {a.lampiran && (
                          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                            <span className="text-[10px] text-text-muted font-bold truncate max-w-[180px]">{a.lampiran.nama_file}</span>
                            <a
                              href={a.lampiran.file_path.startsWith('http') ? a.lampiran.file_path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pos-pelkes-images/${a.lampiran.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-extrabold text-brand-primary hover:underline flex items-center gap-1 shrink-0"
                            >
                              <span>Unduh Lampiran</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB 5: ANALISIS WILAYAH (KERAWANAN & POTENSI) */}
        <TabsContent value="wilayah" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Kerawanan Wilayah Card */}
            <Card className="border-border-subtle shadow-soft">
              <CardHeader className="pb-3 border-b border-border-subtle flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2 text-base font-extrabold text-text-high">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  Kerawanan Wilayah (Risiko)
                </CardTitle>
                {canWrite && (
                  <Link
                    href={`/dashboard/pos-pelkes/${pos.id_pos}/edit?tab=kerawanan`}
                    className="px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-[10px] font-bold text-brand-primary flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                  >
                    <Plus size={10} />
                    <span>Kelola Risiko</span>
                  </Link>
                )}
              </CardHeader>
              <CardContent className="p-5">
                {kerawanan.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-2 text-center">Tidak ada risiko kerawanan yang terdaftar.</p>
                ) : (
                  <div className="space-y-3">
                    {kerawanan.map((k) => (
                      <div key={k.id_risiko} className="p-4 bg-surface-sunken rounded-2xl border border-border-subtle space-y-2">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-[9px] font-black text-red-600 uppercase tracking-wider bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                            {k.kategori || 'Kerawanan'}
                          </span>
                          {k.frekuensi && (
                            <span className="text-[10px] font-bold text-text-muted italic">
                              Frekuensi: {k.frekuensi}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm text-text-high leading-tight">{k.jenis_risiko}</h4>
                        {k.keterangan && <p className="text-xs text-text-muted leading-relaxed italic bg-surface-elevated/50 p-2 rounded border border-border-subtle/40">"{k.keterangan}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Potensi Wilayah Card */}
            <Card className="border-border-subtle shadow-soft">
              <CardHeader className="pb-3 border-b border-border-subtle flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2 text-base font-extrabold text-text-high">
                  <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Potensi Wilayah (Sumber Daya)
                </CardTitle>
                {canWrite && (
                  <Link
                    href={`/dashboard/pos-pelkes/${pos.id_pos}/edit?tab=potensi`}
                    className="px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-[10px] font-bold text-brand-primary flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                  >
                    <Plus size={10} />
                    <span>Kelola Potensi</span>
                  </Link>
                )}
              </CardHeader>
              <CardContent className="p-5">
                {potensi.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-2 text-center">Tidak ada potensi wilayah yang terdaftar.</p>
                ) : (
                  <div className="space-y-3">
                    {potensi.map((po) => (
                      <div key={po.id_potensi} className="p-4 bg-surface-sunken rounded-2xl border border-border-subtle space-y-2">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                            {po.kategori || 'Potensi'}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-text-high leading-tight">{po.nama_potensi}</h4>
                        {po.deskripsi && <p className="text-xs text-text-muted leading-relaxed">{po.deskripsi}</p>}
                        {po.keterangan && <p className="text-xs text-text-muted italic bg-surface-elevated/50 p-2 rounded border border-border-subtle/40">"{po.keterangan}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* TAB 6: LOG PASTORAL */}
        <TabsContent value="log" className="space-y-4 focus-visible:outline-none">
          <div className="flex justify-between items-center gap-3">
            <h2 className="text-base font-black text-text-high">Riwayat Kegiatan Pastoral</h2>
            {canWrite && (
              <Link
                href={`/dashboard/pastoral/baru?id_pos=${pos.id_pos}`}
                className="px-3 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[36px]"
              >
                <Plus size={14} />
                <span>Tambah Log Pastoral</span>
              </Link>
            )}
          </div>
          
          <Card className="border-border-subtle shadow-soft">
            <CardHeader className="pb-3 border-b border-border-subtle">
              <CardTitle className="flex items-center gap-2 text-base font-extrabold text-text-high">
                <Activity className="w-5 h-5 text-brand-primary" />
                Daftar Kegiatan Pelayanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-text-muted space-y-1">
                  <Activity size={36} className="mx-auto text-text-muted/40" />
                  <p className="text-sm font-bold">Belum ada Log Pastoral</p>
                  <p className="text-xs">Catatan kunjungan pastoral belum terekam di sistem.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-border-strong ml-4 space-y-6 py-2">
                  {logs.map((log) => (
                    <div key={log.id_log} className="relative pl-6">
                      {/* Timeline Circle */}
                      <div className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-brand-primary border-4 border-surface-base" />
                      
                      <div className="space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="font-extrabold text-sm text-text-high">{log.kegiatan}</h4>
                          <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase shrink-0">
                            {new Date(log.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        
                        <p className="text-xs text-text-muted">
                          Dilayani oleh: <span className="font-semibold text-text-high">{log.pendeta?.nama_lengkap || 'Pendeta Penanggung Jawab'}</span> 
                          {log.jml_jiwa ? ` • Melibatkan ${log.jml_jiwa} Jiwa` : ''}
                        </p>

                        {log.catatan && (
                          <div className="text-xs text-text-high bg-surface-sunken p-3 rounded-xl border border-border-subtle italic leading-relaxed">
                            "{log.catatan}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
