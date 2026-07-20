import { MutasiHistoryItem } from '@/hooks/use-pendeta';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, ArrowRight, Crown, History } from 'lucide-react';

interface MutationTimelineProps {
  historyList: MutasiHistoryItem[];
  isLoading?: boolean;
}

export function MutationTimeline({ historyList, isLoading }: MutationTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-surface-sunken shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-sunken rounded w-1/3"></div>
              <div className="h-3 bg-surface-sunken rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!historyList || historyList.length === 0) {
    return (
      <div className="bg-surface-elevated rounded-xl p-8 text-center border border-border-subtle space-y-2">
        <History size={36} className="mx-auto text-text-muted opacity-50" />
        <p className="font-semibold text-text-high text-sm">Belum Ada Catatan Riwayat Mutasi</p>
        <p className="text-xs text-text-muted">
          Seluruh mutasi jemaat dan pengangkatan KMJ akan tercatat di sini secara permanen.
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative border-l-2 border-brand-primary/20 ml-4 pl-6 space-y-6 py-2">
      {historyList.map((item) => {
        const isKmjEvent = item.jenis_mutasi === 'PENGANGKATAN_KMJ';

        return (
          <div key={item.id_riwayat} className="relative group">
            {/* Timeline Circle Bullet */}
            <div
              className={`absolute -left-[35px] top-1 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-surface-elevated ${
                isKmjEvent
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-brand-primary text-brand-primary'
              }`}
            >
              {isKmjEvent ? <Crown size={14} /> : <Calendar size={14} />}
            </div>

            {/* Timeline Box Content */}
            <div className="bg-surface-elevated rounded-xl p-4 border border-border-subtle shadow-soft space-y-2 hover:border-brand-primary/40 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isKmjEvent
                      ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-50 text-brand-primary border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {isKmjEvent ? 'Pengangkatan KMJ' : 'Mutasi Jemaat'}
                </span>
                <span className="text-xs text-text-muted font-medium">
                  {formatDate(item.tgl_mutasi)}
                </span>
              </div>

              {/* Transfer Details */}
              <div className="flex items-center gap-2 text-sm font-semibold text-text-high pt-1">
                {item.jemaat_lama?.nama_induk ? (
                  <>
                    <span className="truncate max-w-[150px]">{item.jemaat_lama.nama_induk}</span>
                    <ArrowRight size={14} className="shrink-0 text-brand-primary" />
                  </>
                ) : null}
                <span className="truncate text-brand-primary">
                  {item.jemaat_baru?.nama_induk || item.id_induk_baru}
                </span>
              </div>

              {/* Reason */}
              {item.alasan && (
                <p className="text-xs text-text-muted bg-surface-sunken p-2.5 rounded-lg border border-border-subtle italic">
                  "{item.alasan}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
