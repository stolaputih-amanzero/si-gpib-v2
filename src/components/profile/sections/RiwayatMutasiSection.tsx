'use client';

import Link from 'next/link';
import { useRiwayatMutasi } from '@/hooks/use-profile';
import { VerticalTimeline } from '../timeline/VerticalTimeline';
import { History, Building2, Church, MapPin, ExternalLink, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface RiwayatMutasiSectionProps {
  idPendeta?: string | null;
}

export function RiwayatMutasiSection({ idPendeta }: RiwayatMutasiSectionProps) {
  const { data: mutasiList, isLoading } = useRiwayatMutasi(idPendeta);

  if (isLoading) {
    return <div className="card-flat p-6 h-64 skeleton" />;
  }

  const timelineItems = (mutasiList || []).map((m: any) => {
    let jenisTitle = 'Mutasi Penugasan';
    let badgeStyle = 'bg-info-soft text-info';

    if (m.jenis_mutasi?.toUpperCase().includes('KMJ')) {
      jenisTitle = 'Pengangkatan KMJ';
      badgeStyle = 'bg-ok-soft text-ok';
    } else if (m.jenis_mutasi?.toUpperCase().includes('PJ')) {
      jenisTitle = 'Penetapan PJ Pos';
      badgeStyle = 'bg-surface-brand text-brand-600';
    }

    const posMatch = (m.catatan || m.alasan || '').match(/\[📍 POS:(.*?)\|(.*?)\]/);
    const posId = posMatch ? posMatch[1] : null;
    const posNama = posMatch ? posMatch[2] : null;

    const idMupelLama = m.id_mupel_lama || m.jemaat_lama?.id_mupel || m.jemaat_lama?.mupel?.id_mupel || 'M - 20';
    const idIndukLama = m.id_induk_lama || m.jemaat_lama?.id_induk;
    const namaIndukLama = m.nama_induk_lama || m.jemaat_lama?.nama_induk;
    const namaMupelLama = m.nama_mupel_lama || m.jemaat_lama?.mupel?.nama_mupel;

    const idMupelBaru = m.id_mupel_baru || m.jemaat_baru?.id_mupel || m.jemaat_baru?.mupel?.id_mupel || 'M - 20';
    const idIndukBaru = m.id_induk_baru || m.jemaat_baru?.id_induk;
    const namaIndukBaru = m.nama_induk_baru || m.jemaat_baru?.nama_induk;
    const namaMupelBaru = m.nama_mupel_baru || m.jemaat_baru?.mupel?.nama_mupel;

    const hrefMupelLama = idMupelLama ? `/hierarki/${encodeURIComponent(idMupelLama)}` : '/hierarki';
    const hrefIndukLama = idIndukLama
      ? idMupelLama
        ? `/hierarki/${encodeURIComponent(idMupelLama)}/${encodeURIComponent(idIndukLama)}`
        : `/hierarki?search=${encodeURIComponent(idIndukLama)}`
      : null;

    const hrefMupelBaru = idMupelBaru ? `/hierarki/${encodeURIComponent(idMupelBaru)}` : '/hierarki';
    const hrefIndukBaru = idIndukBaru
      ? idMupelBaru
        ? `/hierarki/${encodeURIComponent(idMupelBaru)}/${encodeURIComponent(idIndukBaru)}`
        : `/hierarki?search=${encodeURIComponent(idIndukBaru)}`
      : null;
    const hrefPosBaru = posId ? `/dashboard/pos-pelkes/${encodeURIComponent(posId)}` : null;

    const cleanAlasan = (m.alasan || '').replace(/\[📍 POS:[^\]]+\]/, '').replace(/\[📄 SK_MUTASI:[^\]]+\]/, '').trim();

    return {
      id: m.id_mutasi,
      date: m.tgl_mutasi,
      title: jenisTitle,
      badge: (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeStyle}`}>
          {m.jenis_mutasi}
        </span>
      ),
      body: (
        <div className="bg-surface-sunken p-3 rounded-2xl border border-line-subtle space-y-2.5 mt-1 text-xs">
          {/* Transfer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-stretch">
            {/* Lokasi Asal */}
            <div className="bg-surface-1 p-2.5 rounded-xl border border-line-subtle space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary block">📍 Dari (Asal)</span>
              {namaMupelLama && (
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
                  <Building2 size={12} className="shrink-0" />
                  {hrefMupelLama ? (
                    <Link href={hrefMupelLama} className="hover:underline font-semibold truncate" onClick={(e) => e.stopPropagation()}>
                      {namaMupelLama}
                    </Link>
                  ) : (
                    <span className="truncate">{namaMupelLama}</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                <Church size={13} className="shrink-0" />
                {hrefIndukLama ? (
                  <Link href={hrefIndukLama} className="hover:underline font-bold truncate" onClick={(e) => e.stopPropagation()}>
                    {namaIndukLama || 'Penugasan Awal'}
                  </Link>
                ) : (
                  <span className="truncate">{namaIndukLama || 'Penugasan Awal'}</span>
                )}
              </div>
            </div>

            {/* Lokasi Tujuan */}
            <div className="bg-surface-1 p-2.5 rounded-xl border border-brand-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block">📍 Ke (Tujuan)</span>
              {namaMupelBaru && (
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
                  <Building2 size={12} className="shrink-0" />
                  {hrefMupelBaru ? (
                    <Link href={hrefMupelBaru} className="hover:underline font-semibold truncate" onClick={(e) => e.stopPropagation()}>
                      {namaMupelBaru}
                    </Link>
                  ) : (
                    <span className="truncate">{namaMupelBaru}</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                <Church size={13} className="shrink-0" />
                {hrefIndukBaru ? (
                  <Link href={hrefIndukBaru} className="hover:underline font-bold truncate" onClick={(e) => e.stopPropagation()}>
                    {namaIndukBaru || 'Tujuan Mutasi'}
                  </Link>
                ) : (
                  <span className="truncate">{namaIndukBaru || 'Tujuan Mutasi'}</span>
                )}
              </div>

              {posNama && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold border-t border-line-hairline pt-1 mt-1">
                  <MapPin size={13} className="shrink-0" />
                  {hrefPosBaru ? (
                    <Link href={hrefPosBaru} className="hover:underline font-bold truncate flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <span>{posNama}</span>
                      <ExternalLink size={10} />
                    </Link>
                  ) : (
                    <span className="truncate">{posNama}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Alasan */}
          {cleanAlasan && (
            <p className="text-ink-secondary italic text-[11px] bg-surface-1 p-2 rounded-lg border border-line-hairline">
              "{cleanAlasan}"
            </p>
          )}

          {/* SK Attachment Viewer */}
          {(() => {
            const catatanStr = m.catatan || m.alasan;
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
                onClick={(e) => {
                  e.stopPropagation();
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20 hover:bg-emerald-500/20 transition-all mt-0.5"
              >
                <FileText size={12} />
                <span>Lihat Lampiran SK Mutasi ({fileName})</span>
              </button>
            );
          })()}
        </div>
      ),
    };
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Tanggal tidak tercatat';
    try {
      const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const parsedDate = parseISO(cleanStr);
      if (isNaN(parsedDate.getTime())) return dateStr;
      return format(parsedDate, 'dd MMMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="card-flat p-5 space-y-5 bg-surface-1 animate-rise">
      <div className="flex items-center justify-between border-b border-line-hairline pb-3">
        <h3 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2">
          <History size={18} className="text-brand-600" />
          <span>Riwayat Mutasi & Perjalanan Penugasan</span>
        </h3>
        <span className="text-xs font-mono text-ink-tertiary tnum">
          {timelineItems.length} Catatan
        </span>
      </div>

      <VerticalTimeline
        items={timelineItems}
        emptyMessage="Belum ada catatan riwayat mutasi pendeta terdaftar."
        formatDateFn={formatDate}
      />
    </div>
  );
}
