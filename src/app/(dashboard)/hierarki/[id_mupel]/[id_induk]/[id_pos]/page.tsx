'use client';

import { use } from 'react';
import Link from 'next/link';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';
import { usePosByJemaat, useJemaatDetail } from '@/hooks/use-hierarki';
import { MapPin, Church, HeartHandshake, ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ id_mupel: string; id_induk: string; id_pos: string }>;
}

export default function PosPelkesHierarkiDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id_mupel = decodeURIComponent(resolvedParams.id_mupel);
  const id_induk = decodeURIComponent(resolvedParams.id_induk);
  const id_pos = decodeURIComponent(resolvedParams.id_pos);

  const { data: jemaat } = useJemaatDetail(id_induk);
  const { data: posList, isLoading } = usePosByJemaat(id_induk);

  const pos = posList?.find((p) => p.id_pos === id_pos);
  const hasGps = Boolean(pos?.latitude && pos?.longitude);

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Nav */}
      <BreadcrumbNav
        items={[
          { label: jemaat?.mupel?.nama_mupel || id_mupel, href: `/hierarki/${encodeURIComponent(id_mupel)}` },
          { label: jemaat?.nama_induk || id_induk, href: `/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}` },
          { label: pos?.nama_pos || id_pos, isCurrent: true },
        ]}
      />

      {/* Header Banner */}
      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-2xl" />
      ) : (
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted">
                    {id_pos}
                  </span>
                  <span className="text-xs font-semibold text-text-muted">
                    Jemaat: {jemaat?.nama_induk} ({id_induk})
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-text-high tracking-tight">
                  {pos?.nama_pos || id_pos}
                </h1>
                {pos?.alamat && <p className="text-xs text-text-muted">{pos.alamat}</p>}
              </div>
            </div>

            <Link
              href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}`}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-xs font-bold text-text-high flex items-center gap-1.5 transition-colors self-start shrink-0"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Jemaat</span>
            </Link>
          </div>

          {/* Warning GPS missing */}
          {!hasGps && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 font-semibold">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Koordinat GPS belum diisi untuk Pos Pelkes ini. Silakan perbarui koordinat pada modul Pos Pelkes.</span>
            </div>
          )}
        </div>
      )}

      {/* Info Details Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info Penugasan PJ */}
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft space-y-3">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-text-high text-sm">Penugasan PJ (Pendeta Jemaat)</h3>
          </div>

          {pos?.pj ? (
            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-medium space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">PJ Penanggung Jawab</span>
              <h4 className="font-extrabold text-text-high text-sm">{pos.pj.nama_lengkap}</h4>
              {pos.pj.no_wa && <p className="text-text-muted">No. WA: {pos.pj.no_wa}</p>}
            </div>
          ) : (
            <p className="text-xs text-text-muted bg-surface-sunken p-3 rounded-xl border border-border-subtle italic">
              Belum ada Pendeta Jemaat (PJ) khusus yang ditugaskan di Pos Pelkes ini.
            </p>
          )}
        </div>

        {/* Info Jemaat Induk Context */}
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft space-y-3">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <Church className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-text-high text-sm">Gereja Induk Pengampu</h3>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 text-xs space-y-1">
            <h4 className="font-extrabold text-text-high text-sm">{jemaat?.nama_induk}</h4>
            <p className="text-text-muted">Mupel: {jemaat?.mupel?.nama_mupel || id_mupel}</p>
            <p className="text-text-muted">KMJ: {jemaat?.kmj?.nama_lengkap || 'Belum ada KMJ'}</p>
          </div>
        </div>
      </div>

      {/* Profil Lengkap Redirect Link */}
      <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-soft flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-text-high text-sm">Profil Lengkap & Demografi Pos</h3>
          <p className="text-xs text-text-muted">Akses data demografi Pelkat, inventaris aset, & log pastoral pos pelkes ini.</p>
        </div>

        <Link
          href={`/dashboard/pos-pelkes/${encodeURIComponent(id_pos)}`}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0"
        >
          <span>Buka Profil Lengkap</span>
          <FileText size={16} />
        </Link>
      </div>
    </div>
  );
}
