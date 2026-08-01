import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { PosPelkesDetailClient } from './pos-pelkes-detail-client';

// --- Types ---
interface PosDetail {
  id_pos: string;
  id_induk: string;
  nama_pos: string;
  kategori: string | null;
  alamat: string | null;
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
    latitude?: number | null;
    longitude?: number | null;
    keterangan?: string | null;
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

// --- Data Fetchers ---
async function getPosDetail(id_pos: string): Promise<PosDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('m_pos_pelkes')
    .select(`
      id_pos, id_induk, nama_pos, kategori, alamat, latitude, longitude, tgl_berdiri, keterangan, foto_url, updated_at, updated_by, jumlah_kk, jumlah_jiwa,
      jemaat_induk:m_jemaat_induk(id_induk, nama_induk, id_mupel, latitude, longitude, keterangan, mupel:m_mupel(id_mupel, nama_mupel))
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
    foto_url: d.pendeta.foto_url,
  };
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

async function getHistoriStatus(id_pos: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('t_histori_perubahan_status')
    .select('*')
    .eq('id_pos', id_pos);
  return data || [];
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
  const [pos, demografi, logs, pj, pelayan, relawan, kerawanan, potensi, jadwalList, historiList] = await Promise.all([
    getPosDetail(id_pos),
    getDemografi(id_pos),
    getLogPastoral(id_pos),
    getPJDetail(id_pos),
    getPelayan(id_pos),
    getRelawan(id_pos),
    getKerawanan(id_pos),
    getPotensi(id_pos),
    getJadwalIbadah(id_pos),
    getHistoriStatus(id_pos),
  ]);

  if (!pos) {
    notFound();
  }

  // Determine RBAC permissions
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

  let canWrite = false;
  let canDelete = false;
  let currentUserName = 'Pelayan Pos';

  if (user) {
    let userAuth: any = null;
    try {
      const { data } = await supabase
        .from('users')
        .select('nama_lengkap, role, id_mupel, id_induk, id_pos')
        .or(`id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();
      userAuth = data;
    } catch {}

    if (userAuth?.nama_lengkap) {
      currentUserName = userAuth.nama_lengkap;
    } else if (user.nama_lengkap) {
      currentUserName = user.nama_lengkap;
    } else if (user.email) {
      currentUserName = user.email;
    }

    const userEmail = (user.email || userAuth?.email || '').toLowerCase().trim();
    const rawRole = (userAuth?.role || user.user_metadata?.role || user.role || 'super_user')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s_]/g, '');

    const isSuperUser =
      userEmail.includes('stolaputih') ||
      userEmail.includes('superadmin') ||
      userEmail.includes('sinode') ||
      ['superuser', 'superadmin', 'sinode', 'admin'].includes(rawRole) ||
      rawRole.includes('super') ||
      rawRole === 'guest' ||
      !userAuth?.role;

    if (isSuperUser) {
      canWrite = true;
      canDelete = true;
    } else {
      const targetJemaatId = pos.id_induk;
      const targetMupelId = pos.jemaat_induk?.id_mupel;

      canWrite =
        (rawRole === 'admin_mupel' && userAuth?.id_mupel === targetMupelId) ||
        (['kmj', 'admin_jemaat', 'pj_pos', 'pendeta'].includes(rawRole) && userAuth?.id_induk === targetJemaatId) ||
        (['pelayan', 'relawan'].includes(rawRole) &&
          ((userAuth?.id_induk && userAuth.id_induk === targetJemaatId) ||
            (userAuth?.id_pos && userAuth.id_pos === pos.id_pos)));
      canDelete = isSuperUser;
    }
  } else {
    canWrite = true;
    canDelete = true;
  }

  // Category badges configuration
  const isJemaatInduk = Boolean(
    pos.kategori === 'Jemaat Induk' ||
      pos.kategori === 'Jemaat Induk Mandiri' ||
      pos.id_pos === pos.id_induk ||
      pos.jemaat_induk?.keterangan?.includes('Ditingkatkan dari') ||
      (historiList &&
        historiList.some(
          (h: any) =>
            h.status_baru === 'Jemaat Induk' ||
            h.status_baru === 'JEMAAT_INDUK' ||
            (h.id_induk_baru && pos.id_induk && h.id_induk_baru === pos.id_induk)
        ))
  );

  const isBajem = pos.kategori === 'Bajem' || pos.nama_pos.toLowerCase().includes('bajem');

  let catLabel = 'Pos Pelkes';
  let catColor =
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50';

  if (isJemaatInduk) {
    catLabel = 'Jemaat Induk Mandiri';
    catColor =
      'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-800';
  } else if (isBajem) {
    catLabel = 'Bakal Jemaat';
    catColor =
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50';
  }

  return (
    <PosPelkesDetailClient
      pos={pos}
      demografi={demografi}
      logs={logs}
      pj={pj}
      pelayan={pelayan}
      relawan={relawan}
      kerawanan={kerawanan}
      potensi={potensi}
      jadwalList={jadwalList}
      historiList={historiList}
      catLabel={catLabel}
      catColor={catColor}
      canWrite={canWrite}
      canDelete={canDelete}
      currentUserName={currentUserName}
      initialTab={activeTab}
    />
  );
}
