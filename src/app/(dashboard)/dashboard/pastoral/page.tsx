import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Users, User, Camera } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

// --- Types ---
interface PastoralLog {
  id_log: string;
  tgl: string;
  kegiatan: string;
  jml_jiwa: number | null;
  catatan: string | null;
  foto_url: string | null;
  pos_pelkes: { nama_pos: string } | null;
  pendeta: { nama_lengkap: string } | null;
}

// --- Helper Functions ---
async function getPastoralLogs(): Promise<PastoralLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('t_log_pastoral')
    .select(`
      id_log, tgl, kegiatan, jml_jiwa, catatan, foto_url,
      pos_pelkes:m_pos_pelkes(nama_pos),
      pendeta:m_pendeta(nama_lengkap)
    `)
    .order('tgl', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
  return data as unknown as PastoralLog[];
}

// --- Main Page Component ---
export default async function PastoralLogPage() {
  const logs = await getPastoralLogs();

  return (
    <div className="min-h-screen bg-surface-base pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-text-high">Log Pastoral</h1>
            <p className="text-sm text-text-muted">Riwayat Kegiatan Pelayanan</p>
          </div>
          <Link 
            href="/dashboard/pastoral/baru" 
            className={cn(buttonVariants({ variant: 'default' }), "rounded-full shadow-soft bg-brand-primary hover:bg-brand-primary/90 text-white")}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Input Log Baru</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {logs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-border-subtle shadow-soft">
            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-text-high mb-1">Belum ada Log Pastoral</h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto">
              Silakan tekan tombol 'Input Log Baru' untuk mulai mencatat kegiatan pelayanan.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id_log} className="overflow-hidden border-border-subtle shadow-soft hover:border-brand-primary/30 transition-colors bg-surface-elevated">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image Area if exists */}
                    {log.foto_url && (
                      <div className="relative h-48 sm:h-auto sm:w-48 sm:flex-shrink-0 bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/log-pastoral-images/${log.foto_url}`} 
                          alt={log.kegiatan} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Camera className="w-3 h-3" /> Foto
                        </div>
                      </div>
                    )}
                    
                    {/* Content Area */}
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-text-high leading-tight">{log.kegiatan}</h3>
                        <span className="text-xs font-medium text-text-muted bg-surface-sunken px-2 py-1 rounded whitespace-nowrap ml-3">
                          {new Date(log.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center text-sm text-text-muted">
                          <MapPin className="w-4 h-4 mr-2 text-brand-primary/70 shrink-0" />
                          <span className="truncate">{log.pos_pelkes?.nama_pos || 'Tidak diketahui'}</span>
                        </div>
                        <div className="flex items-center text-sm text-text-muted">
                          <User className="w-4 h-4 mr-2 text-brand-primary/70 shrink-0" />
                          <span className="truncate">{log.pendeta?.nama_lengkap || 'Tidak diketahui'}</span>
                        </div>
                        {log.jml_jiwa && (
                          <div className="flex items-center text-sm text-text-muted">
                            <Users className="w-4 h-4 mr-2 text-brand-primary/70 shrink-0" />
                            <span>{log.jml_jiwa} Jiwa Hadir</span>
                          </div>
                        )}
                      </div>
                      
                      {log.catatan && (
                        <div className="mt-4 pt-3 border-t border-border-subtle">
                          <p className="text-sm text-text-muted italic line-clamp-2">
                            "{log.catatan}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
