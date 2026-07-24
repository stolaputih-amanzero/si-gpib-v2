'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';
import { usePosByJemaat, useJemaatDetail } from '@/hooks/use-hierarki';
import { MapPin, Church, HeartHandshake, ArrowLeft, FileText, AlertTriangle, Home, Users, Compass, ExternalLink, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareButton } from '@/components/mobile/ShareButton';
import { StatusHistoryTimeline } from '@/components/hierarki/StatusHistoryTimeline';
import { cn } from '@/lib/utils';

interface PosDetailClientProps {
  id_mupel: string;
  id_induk: string;
  id_pos: string;
}

export function PosDetailClient({ id_mupel, id_induk, id_pos }: PosDetailClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: jemaat } = useJemaatDetail(id_induk);
  const { data: posList, isLoading } = usePosByJemaat(id_induk);

  const pos = posList?.find((p) => p.id_pos === id_pos);
  const hasGps = Boolean(pos?.latitude && pos?.longitude);

  const isBajem = pos?.kategori === 'Bajem' || pos?.nama_pos?.toLowerCase().includes('bajem');
  const catLabel = isBajem ? 'Bakal Jemaat' : 'Pos Pelkes';
  const catColor = isBajem 
    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50' 
    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50';

  if (!mounted) {
    return (
      <div className="space-y-6 pb-12">
        <BreadcrumbNav
          items={[
            { label: id_mupel, href: `/hierarki/${encodeURIComponent(id_mupel)}` },
            { label: id_induk, href: `/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}` },
            { label: id_pos, isCurrent: true },
          ]}
        />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-brand-primary/10 text-brand-primary shrink-0 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex flex-col justify-center space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted">
                    {id_pos}
                  </span>
                  <span className={cn("text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border", catColor)}>
                    {catLabel}
                  </span>
                  <span className="text-xs font-semibold text-text-muted truncate">
                    Jemaat Induk: {jemaat?.nama_induk}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-text-high tracking-tight leading-tight">
                  {pos?.nama_pos || id_pos}
                </h1>
                {pos?.alamat && <p className="text-xs text-text-muted leading-relaxed">{pos.alamat}</p>}
                
                {hasGps && (
                  <div className="pt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-text-muted flex items-center gap-1">
                      <Compass size={12} className="text-brand-primary" />
                      <span>GPS: {pos?.latitude}, {pos?.longitude}</span>
                    </span>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${pos?.latitude},${pos?.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-md font-bold text-[10px] transition-colors"
                    >
                      <span>Rute Google Maps</span>
                      <ExternalLink size={8} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
              <ShareButton
                title={`Pos Pelkes GPIB: ${pos?.nama_pos || id_pos}`}
                text={`Jemaat Induk: ${jemaat?.nama_induk || id_induk}\nAlamat: ${pos?.alamat || '-'}\nJumlah KK: ${pos?.jumlah_kk || 0}\nTotal Jiwa: ${pos?.jumlah_jiwa || 0}`}
                variant="ghost"
                iconOnly
              />
              <Link
                href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}`}
                className="min-h-[40px] px-3.5 py-2 rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-xs font-bold text-text-high flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
              >
                <ArrowLeft size={16} />
                <span>Kembali</span>
              </Link>
            </div>
          </div>

          {/* Warning GPS missing */}
          {!hasGps && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Koordinat GPS belum diisi untuk Pos Pelkes ini. Silakan perbarui koordinat pada modul Pos Pelkes agar peta rute aktif.</span>
            </div>
          )}
        </div>
      )}

      {/* Statistik Demografi Ringkasan Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Home size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Jumlah KK</span>
            <p className="text-xl font-black text-text-high tabular-nums">{pos?.jumlah_kk || 0} KK</p>
          </div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Jumlah Jiwa</span>
            <p className="text-xl font-black text-text-high tabular-nums">{pos?.jumlah_jiwa || 0} Jiwa</p>
          </div>
        </div>
      </div>

      {/* Info Details Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info Penugasan PJ */}
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-text-high text-sm">Penugasan PJ (Pendeta Jemaat)</h3>
            </div>

            {pos?.pj ? (
              <div className="p-4 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-1.5">
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">PJ Penanggung Jawab</span>
                <h4 className="font-black text-sm text-text-high">{pos.pj.nama_lengkap}</h4>
                {pos.pj.no_wa && (
                  <p className="text-text-muted font-medium">No. WA: {pos.pj.no_wa}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-text-muted bg-surface-sunken/50 p-4 rounded-xl border border-border-subtle italic">
                Belum ada Pendeta Jemaat (PJ) khusus yang ditugaskan di Pos Pelkes ini.
              </p>
            )}
          </div>
          
          {pos?.pj?.no_wa && (
            <a
              href={`https://wa.me/${pos.pj.no_wa.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[36px] w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Phone size={12} />
              <span>Hubungi PJ via WhatsApp</span>
            </a>
          )}
        </div>

        {/* Info Jemaat Induk Context */}
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft space-y-3">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <Church className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-text-high text-sm">Gereja Induk Pengampu</h3>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-2">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">Nama Jemaat Induk</span>
              <h4 className="font-black text-sm text-text-high mt-0.5">{jemaat?.nama_induk}</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle/50">
              <div>
                <span className="text-[9px] font-bold text-text-muted block">MUPEL</span>
                <span className="font-bold text-text-high text-xs">{jemaat?.mupel?.nama_mupel || id_mupel}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-muted block">KMJ AKTIF</span>
                <span className="font-bold text-text-high text-xs truncate block" title={jemaat?.kmj?.nama_lengkap || 'Belum ada KMJ'}>
                  {jemaat?.kmj?.nama_lengkap || 'Belum ada KMJ'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Peningkatan Status Timeline */}
      <StatusHistoryTimeline id_pos={id_pos} />

      {/* Profil Lengkap Redirect Link */}
      <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-text-high text-sm">Profil Lengkap & Demografi Pos</h3>
          <p className="text-xs text-text-muted leading-relaxed">Akses data demografi Pelkat, inventaris aset komprehensif, & log pastoral pos pelkes ini.</p>
        </div>

        <Link
          href={`/dashboard/pos-pelkes/${encodeURIComponent(id_pos)}`}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm shrink-0"
        >
          <span>Buka Profil Lengkap</span>
          <FileText size={16} />
        </Link>
      </div>
    </div>
  );
}
