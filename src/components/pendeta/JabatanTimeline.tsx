import { JabatanStrukturalItem } from '@/hooks/use-jabatan-struktural';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Building, Calendar } from 'lucide-react';

interface JabatanTimelineProps {
  jabatans: JabatanStrukturalItem[];
}

export function JabatanTimeline({ jabatans }: JabatanTimelineProps) {
  if (!jabatans || jabatans.length === 0) {
    return (
      <div className="p-8 text-center text-text-muted bg-surface-sunken rounded-xl border border-border-subtle">
        <Building className="w-8 h-8 mx-auto opacity-20 mb-2" />
        <p className="text-sm font-medium">Belum ada riwayat jabatan struktural.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-border-strong ml-3 space-y-6">
      {jabatans.map((jabatan) => {
        const isAktif = jabatan.status === 'Aktif';
        
        return (
          <div key={jabatan.id_jabatan} className="relative pl-6">
            <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${
              isAktif 
                ? 'bg-emerald-500 border-white dark:border-surface-base shadow-[0_0_0_2px_rgba(16,185,129,0.2)]'
                : 'bg-surface-sunken border-border-strong'
            }`} />
            
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                isAktif 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-surface-sunken text-text-muted'
              }`}>
                {jabatan.status}
              </span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Calendar size={12} />
                {format(new Date(jabatan.tgl_mulai), 'MMM yyyy', { locale: id })}
                {' - '}
                {jabatan.tgl_selesai ? format(new Date(jabatan.tgl_selesai), 'MMM yyyy', { locale: id }) : 'Sekarang'}
              </span>
            </div>
            
            <h4 className="font-bold text-text-high text-base">{jabatan.nama_jabatan}</h4>
            
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-text-muted">
                <Building size={14} className="text-brand-primary" />
                <span className="font-medium text-brand-primary">{jabatan.kategori}</span>
                <span className="text-[10px] opacity-70 border border-border-strong px-1.5 rounded uppercase tracking-wider">{jabatan.tingkat}</span>
              </div>
              
              {jabatan.no_sk && (
                <div className="text-xs text-text-muted flex items-start gap-1">
                  <span className="font-medium">SK:</span> {jabatan.no_sk}
                  {jabatan.tgl_sk && ` (${format(new Date(jabatan.tgl_sk), 'd MMM yyyy', { locale: id })})`}
                </div>
              )}
              
              {jabatan.keterangan && (
                <p className="text-xs text-text-muted italic mt-1 bg-surface-sunken p-2 rounded-md border border-border-subtle/50">
                  {jabatan.keterangan}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
