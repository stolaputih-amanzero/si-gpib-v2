import { MutasiHistoryItem } from '@/hooks/use-pendeta';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, ArrowRight, Crown, History, FileText } from 'lucide-react';

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

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Tanggal tidak tercatat';
    try {
      const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const parsedDate = new Date(cleanStr);
      if (isNaN(parsedDate.getTime())) return dateStr;
      return format(parsedDate, 'dd MMMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative border-l-2 border-brand-primary/20 ml-4 pl-6 space-y-6 py-2">
      {historyList.map((item) => {
        const isKmjEvent = item.jenis_mutasi === 'PENGANGKATAN_KMJ' || item.jenis_mutasi?.toUpperCase().includes('KMJ');
        const rawDate = item.tgl_mutasi || (item as any).created_at || (item as any).tanggal || (item as any).tgl;

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
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isKmjEvent
                      ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-50 text-brand-primary border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {isKmjEvent ? 'Pengangkatan KMJ' : item.jenis_mutasi || 'Mutasi Jemaat'}
                </span>
                <span className="text-xs text-brand-primary font-bold flex items-center gap-1 bg-brand-primary/10 px-2 py-0.5 rounded-md">
                  <Calendar size={12} />
                  {formatDate(rawDate)}
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

              {/* SK Attachment Document Viewer */}
              {(() => {
                const catatanStr = (item as any).catatan || item.alasan;
                if (!catatanStr || !catatanStr.includes('[📄 SK_MUTASI:')) return null;

                const match = catatanStr.match(/\[📄 SK_MUTASI:(.*?)\]/);
                if (!match) return null;
                const rawVal = match[1];

                const nameMatch = rawVal.match(/NAME:(.*?)\|/);
                const typeMatch = rawVal.match(/TYPE:(.*?)\|/);
                const dataMatch = rawVal.match(/DATA:(.*)/);

                const fileName = nameMatch ? nameMatch[1] : 'Dokumen_SK_Mutasi';
                const fileType = typeMatch ? typeMatch[1] : 'pdf';
                const dataUrl = dataMatch ? dataMatch[1] : rawVal;

                return (
                  <button
                    type="button"
                    onClick={() => {
                      const win = window.open();
                      if (win) {
                        win.document.write(`
                          <html>
                            <head><title>${fileName}</title></head>
                            <body style="margin:0;background:#0f172a;display:flex;justify-content:center;align-items:center;height:100vh;">
                              ${fileType === 'image'
                                ? `<img src="${dataUrl}" style="max-width:90%;max-height:90vh;object-fit:contain;border-radius:12px;" />`
                                : `<iframe src="${dataUrl}" style="width:100%;height:100vh;border:none;"></iframe>`
                              }
                            </body>
                          </html>
                        `);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20 hover:bg-emerald-500/20 transition-all mt-1"
                  >
                    <FileText size={13} />
                    <span>Lihat Lampiran SK Mutasi ({fileName})</span>
                  </button>
                );
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
