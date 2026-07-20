import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Users, Building2, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// --- Types ---
interface PosDetail {
  id_pos: string;
  nama_pos: string;
  alamat: string;
  latitude: number | null;
  longitude: number | null;
  tgl_berdiri: string | null;
  keterangan: string | null;
  jemaat_induk: {
    nama_induk: string;
    id_induk: string;
  } | null;
}

interface Demografi {
  kategori_pelkat: string;
  jml_kk: number;
  laki: number;
  perempuan: number;
}

interface Aset {
  id_tanah: string | null;
  id_bangunan: string | null;
  id_aset_b: string | null;
  jenis: string;
  keterangan: string | null;
  lampiran: { file_path: string; nama_file: string } | null;
}

interface LogPastoral {
  id_log: string;
  tgl: string;
  kegiatan: string;
  jml_jiwa: number | null;
  catatan: string | null;
  pendeta: { nama_lengkap: string } | null;
}

// --- Helper Functions ---
async function getPosDetail(id_pos: string): Promise<PosDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('m_pos_pelkes')
    .select(`
      id_pos, nama_pos, alamat, latitude, longitude, tgl_berdiri, keterangan,
      jemaat_induk:m_jemaat_induk(id_induk, nama_induk)
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
    .select('kategori_pelkat, jml_kk, laki, perempuan')
    .eq('id_pos', id_pos);
  return data || [];
}

async function getAset(id_pos: string): Promise<Aset[]> {
  const supabase = await createClient();
  // Simplified query for demonstration. In production, union or separate queries might be cleaner.
  const { data: tanah } = await supabase
    .from('t_aset_tanah')
    .select('id_tanah, keterangan, lampiran:t_lampiran_aset(file_path, nama_file)')
    .eq('id_pos', id_pos);
    
  // Map to unified Aset type (simplified for brevity)
  return (tanah || []).map((t: any) => ({
    id_tanah: t.id_tanah,
    id_bangunan: null,
    id_aset_b: null,
    jenis: 'Tanah',
    keterangan: t.keterangan,
    lampiran: t.lampiran?.[0] || null
  }));
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
    .limit(10);
  return (data as unknown as LogPastoral[]) || [];
}

// --- Main Page Component ---
export default async function PosPelkesDetailPage({ params }: { params: Promise<{ id_pos: string }> }) {
  const { id_pos } = await params;

  // Parallel data fetching for optimal performance
  const [pos, demografi, aset, logs] = await Promise.all([
    getPosDetail(id_pos),
    getDemografi(id_pos),
    getAset(id_pos),
    getLogPastoral(id_pos),
  ]);

  if (!pos) {
    notFound();
  }

  const totalJiwa = demografi.reduce((acc, curr) => acc + curr.laki + curr.perempuan, 0);

  return (
    <div className="min-h-screen bg-surface-base pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link 
            href="/dashboard/pos-pelkes"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "min-h-[44px] min-w-[44px]")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-serif font-bold text-text-high truncate">{pos.nama_pos}</h1>
            <p className="text-sm text-text-muted truncate">{pos.jemaat_induk?.nama_induk}</p>
          </div>
          <Badge variant="secondary" className="text-base px-3 py-1">
            {totalJiwa} Jiwa
          </Badge>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="profil" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-12">
            <TabsTrigger value="profil" className="text-base">Profil</TabsTrigger>
            <TabsTrigger value="demografi" className="text-base">Demografi</TabsTrigger>
            <TabsTrigger value="aset" className="text-base">Aset</TabsTrigger>
            <TabsTrigger value="log" className="text-base">Log</TabsTrigger>
          </TabsList>

          {/* TAB 1: PROFIL */}
          <TabsContent value="profil" className="space-y-4 mt-0">
            <Card className="border-border-subtle shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                  Informasi Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-base text-text-muted">
                <p>{pos.alamat || 'Alamat belum diisi'}</p>
                {(pos.latitude && pos.longitude) && (
                  <div className="flex gap-2 text-sm">
                    <span>Lat: {pos.latitude}</span>
                    <span>Lng: {pos.longitude}</span>
                  </div>
                )}
                {pos.tgl_berdiri && (
                  <p className="pt-2 border-t border-border-subtle">
                    <span className="font-medium text-text-high">Berdiri:</span> {new Date(pos.tgl_berdiri).toLocaleDateString('id-ID')}
                  </p>
                )}
              </CardContent>
            </Card>

            {pos.keterangan && (
              <Card className="border-border-subtle shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Keterangan Tambahan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-text-muted whitespace-pre-wrap">{pos.keterangan}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 2: DEMOGRAFI */}
          <TabsContent value="demografi" className="mt-0">
            <Card className="border-border-subtle shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-brand-primary" />
                  Profil Pelkat
                </CardTitle>
              </CardHeader>
              <CardContent>
                {demografi.length === 0 ? (
                  <p className="text-center text-text-muted py-8">Belum ada data demografi.</p>
                ) : (
                  <div className="space-y-3">
                    {demografi.map((d, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-surface-sunken rounded-md">
                        <span className="font-medium text-text-high capitalize">{d.kategori_pelkat}</span>
                        <div className="text-right text-sm text-text-muted">
                          <div>{d.laki} Laki-laki</div>
                          <div>{d.perempuan} Perempuan</div>
                          <div className="font-bold text-brand-primary mt-1">{d.jml_kk} KK</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: ASET */}
          <TabsContent value="aset" className="mt-0">
            <Card className="border-border-subtle shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-brand-primary" />
                  Inventaris
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aset.length === 0 ? (
                  <p className="text-center text-text-muted py-8">Belum ada data aset.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aset.map((a, idx) => (
                      <div key={idx} className="border border-border-subtle rounded-lg p-4 bg-surface-sunken">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">{a.jenis}</Badge>
                          {a.lampiran?.file_path && (
                            <span className="text-xs text-text-muted flex items-center gap-1">
                              <FileText className="w-3 h-3" /> {a.lampiran.nama_file}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-muted">{a.keterangan || 'Tidak ada keterangan'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: LOG PASTORAL */}
          <TabsContent value="log" className="mt-0">
            <Card className="border-border-subtle shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-brand-primary" />
                  Riwayat Kegiatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <p className="text-center text-text-muted py-8">Belum ada log pastoral.</p>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id_log} className="relative pl-6 pb-4 border-l-2 border-border-strong last:border-0 last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-primary border-2 border-surface-elevated" />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                          <span className="font-semibold text-text-high">{log.kegiatan}</span>
                          <span className="text-xs text-text-muted whitespace-nowrap">
                            {new Date(log.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted mb-1">
                          Oleh: {log.pendeta?.nama_lengkap || 'Tidak diketahui'} 
                          {log.jml_jiwa && ` • ${log.jml_jiwa} Jiwa`}
                        </p>
                        {log.catatan && (
                          <p className="text-sm text-text-high bg-surface-sunken p-2 rounded-md italic">
                            "{log.catatan}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
