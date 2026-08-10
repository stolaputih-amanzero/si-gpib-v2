import { UnifiedPersonData } from '@/lib/services/person';
import { ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';
import Link from 'next/link';

export function PersonTransferSection({ personData }: { personData: UnifiedPersonData }) {
  const mutasi = personData.mutasi || [];

  if (mutasi.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border-dashed border-border-subtle rounded-2xl animate-tab-fade">
        <ArrowRightLeft size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
        <h3 className="font-bold text-text-strong text-lg">Belum ada riwayat mutasi</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-tab-fade pb-8">
      {mutasi.map((m, i) => (
        <div key={m.id_riwayat || i} className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-text-muted bg-surface-sunken px-2 py-1 rounded-md">
              {format(new Date(m.tanggal_mutasi || m.tgl_mutasi), 'dd MMMM yyyy', { locale: dateFnsId })}
            </span>
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider border border-brand-primary/20 bg-brand-primary/5 px-2 py-1 rounded-full">
              {m.jenis_mutasi || 'MUTASI'}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-4 bg-surface-sunken p-3 rounded-xl border border-border-subtle">
            <div className="flex-1 text-center">
              <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Dari Jemaat</p>
              {m.id_induk_lama ? (
                <Link href={`/org/${encodeURIComponent(m.id_induk_lama)}`} className="text-sm font-bold text-brand-primary hover:underline">
                  {m.id_induk_lama}
                </Link>
              ) : (
                <span className="text-sm font-medium text-text-strong">-</span>
              )}
            </div>
            
            <div className="px-4 text-text-muted">
              <ArrowRightLeft size={16} />
            </div>
            
            <div className="flex-1 text-center">
              <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Ke Jemaat</p>
              {m.id_induk_baru ? (
                <Link href={`/org/${encodeURIComponent(m.id_induk_baru)}`} className="text-sm font-bold text-brand-primary hover:underline">
                  {m.id_induk_baru}
                </Link>
              ) : (
                <span className="text-sm font-medium text-text-strong">-</span>
              )}
            </div>
          </div>
          
          {m.alasan && (
            <div className="mt-3 text-sm text-text-strong border-t border-border-subtle pt-3">
              <span className="text-text-muted mr-1">Alasan:</span> {m.alasan}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
