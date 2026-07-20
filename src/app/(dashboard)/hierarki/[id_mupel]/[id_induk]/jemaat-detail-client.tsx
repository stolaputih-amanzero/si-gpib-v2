'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useJemaatDetail, usePosByJemaat } from '@/hooks/use-hierarki';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';
import { KMJSelector } from '@/components/hierarki/KMJSelector';
import { PJSelector } from '@/components/hierarki/PJSelector';
import { ShareButton } from '@/components/mobile/ShareButton';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Church,
  UserCheck,
  HeartHandshake,
  MapPin,
  ChevronRight,
  AlertCircle,
  Plus,
  Search,
  PhoneCall,
  UserPlus,
  Building,
  Home,
  Users,
  Sprout,
  ExternalLink,
} from 'lucide-react';

interface JemaatDetailClientProps {
  id_mupel: string;
  id_induk: string;
}

export function JemaatDetailClient({ id_mupel, id_induk }: JemaatDetailClientProps) {
  const [searchPos, setSearchPos] = useState('');
  const [showKmjModal, setShowKmjModal] = useState(false);
  const [showPjModal, setShowPjModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: jemaat, isLoading: isLoadingJemaat } = useJemaatDetail(id_induk);
  const { data: posList, isLoading: isLoadingPos } = usePosByJemaat(id_induk, searchPos);

  const hasKmj = Boolean(jemaat?.kmj?.nama_lengkap);
  const hasGps = Boolean(jemaat?.latitude && jemaat?.longitude);

  const formatNum = (val?: number | null) => {
    return new Intl.NumberFormat('id-ID').format(val || 0);
  };

  const bajemList = (posList || []).filter((p) => p.kategori === 'Bajem');
  const posPelkesOnly = (posList || []).filter((p) => p.kategori !== 'Bajem');

  if (!mounted) {
    return (
      <div className="space-y-6 pb-12">
        <BreadcrumbNav
          items={[
            { label: id_mupel, href: `/hierarki/${encodeURIComponent(id_mupel)}` },
            { label: id_induk, isCurrent: true },
          ]}
        />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
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
          { label: jemaat?.nama_induk || id_induk, isCurrent: true },
        ]}
      />

      {/* 1. Header Banner Jemaat Induk */}
      {isLoadingJemaat ? (
        <Skeleton className="h-36 w-full rounded-2xl" />
      ) : (
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                <Church className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted">
                    {id_induk}
                  </span>
                  <span className="text-xs font-semibold text-text-muted">
                    Mupel: {jemaat?.mupel?.nama_mupel || id_mupel}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-text-high tracking-tight">
                  {jemaat?.nama_induk}
                </h1>
                {jemaat?.alamat && <p className="text-xs text-text-muted">{jemaat.alamat}</p>}

                {/* GPS Info & Map Link */}
                {hasGps ? (
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${jemaat?.latitude},${jemaat?.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 min-h-[36px]"
                    >
                      <MapPin size={14} />
                      <span>{jemaat?.latitude}, {jemaat?.longitude}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ) : (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300">
                      <AlertCircle size={14} className="text-amber-600" />
                      <span>Koordinat GPS belum diisi</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Share Button */}
            <div className="self-end sm:self-start">
              <ShareButton
                title={`Jemaat Induk GPIB: ${jemaat?.nama_induk}`}
                text={`Mupel: ${jemaat?.mupel?.nama_mupel || id_mupel}\nSektor: ${jemaat?.jumlah_sektor || 0} | KK: ${jemaat?.jumlah_kk || 0} | Jiwa: ${jemaat?.jumlah_jiwa || 0}\nKMJ: ${jemaat?.kmj?.nama_lengkap || 'Belum ada'}`}
                variant="ghost"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. SECTION: STATISTIK JEMAAT (BARU) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Card 1: Jumlah Sektor */}
        <div className="bg-surface-elevated p-3.5 sm:p-4 rounded-2xl border border-border-subtle shadow-soft space-y-1 text-center min-h-[44px]">
          <div className="w-8 h-8 mx-auto rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
            <Building size={18} />
          </div>
          <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Sektor</p>
          <p className="text-xl sm:text-2xl font-black text-text-high tabular-nums">
            {formatNum(jemaat?.jumlah_sektor)}
          </p>
        </div>

        {/* Card 2: Jumlah KK */}
        <div className="bg-surface-elevated p-3.5 sm:p-4 rounded-2xl border border-border-subtle shadow-soft space-y-1 text-center min-h-[44px]">
          <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
            <Home size={18} />
          </div>
          <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">KK</p>
          <p className="text-xl sm:text-2xl font-black text-text-high tabular-nums">
            {formatNum(jemaat?.jumlah_kk)}
          </p>
        </div>

        {/* Card 3: Jumlah Jiwa */}
        <div className="bg-surface-elevated p-3.5 sm:p-4 rounded-2xl border border-border-subtle shadow-soft space-y-1 text-center min-h-[44px]">
          <div className="w-8 h-8 mx-auto rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center">
            <Users size={18} />
          </div>
          <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Jiwa</p>
          <p className="text-xl sm:text-2xl font-black text-text-high tabular-nums">
            {formatNum(jemaat?.jumlah_jiwa)}
          </p>
        </div>
      </div>

      {/* 3. SECTION: KMJ & PJ (2 Grid Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* A. KMJ Card */}
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-text-high text-sm">Ketua Majelis Jemaat (KMJ)</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowKmjModal(true)}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline flex items-center gap-1 min-h-[44px]"
            >
              <UserPlus size={14} />
              <span>{hasKmj ? 'Ganti KMJ' : 'Assign KMJ'}</span>
            </button>
          </div>

          {hasKmj ? (
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800 flex items-center justify-between gap-3">
              <div>
                <span className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  KMJ Aktif
                </span>
                <h4 className="font-black text-text-high text-sm mt-0.5">{jemaat?.kmj?.nama_lengkap}</h4>
              </div>
              {jemaat?.kmj?.no_wa && (
                <a
                  href={`https://wa.me/${jemaat.kmj.no_wa.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shrink-0 shadow-sm"
                >
                  <PhoneCall size={14} />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>Belum ada KMJ terdaftar di Jemaat Induk ini.</span>
              </div>
              <p className="text-text-muted">Klik tombol "Assign KMJ" di atas untuk menugaskan pendeta KMJ baru.</p>
            </div>
          )}
        </div>

        {/* B. PJ Card */}
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-extrabold text-text-high text-sm">Pendeta Jemaat (PJ)</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowPjModal(true)}
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 min-h-[44px]"
            >
              <Plus size={14} />
              <span>Tambah PJ</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-between gap-3">
            <div>
              <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Total PJ Penugasan
              </span>
              <h4 className="font-black text-text-high text-sm mt-0.5">{jemaat?.pj_count || 0} Pendeta Jemaat</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowPjModal(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shrink-0 shadow-sm"
            >
              <Plus size={14} />
              <span>Kelola PJ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. SECTION: BAKAL JEMAAT (BAJEM) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-black text-text-high">
              Bakal Jemaat / Bajem ({bajemList.length})
            </h2>
          </div>
        </div>

        {bajemList.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-muted flex items-center gap-2">
            <Sprout size={16} className="text-purple-500 opacity-60" />
            <span>Belum ada Bajem terdaftar di bawah Jemaat Induk ini.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bajemList.map((pos) => (
              <Link
                key={pos.id_pos}
                href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}/${encodeURIComponent(pos.id_pos)}`}
                className="block min-h-[44px] bg-surface-elevated p-4 rounded-2xl border border-purple-200 dark:border-purple-900/40 shadow-soft hover:border-purple-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {pos.id_pos} • Bajem
                    </span>
                    <h4 className="font-extrabold text-text-high text-sm mt-1">{pos.nama_pos}</h4>
                  </div>
                  <ChevronRight size={18} className="text-text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 5. SECTION: LIST POS PELKES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-black text-text-high">
              Daftar Pos Pelkes ({posPelkesOnly.length} Pos)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Cari nama pos..."
                value={searchPos}
                onChange={(e) => setSearchPos(e.target.value)}
                className="w-full min-h-[40px] pl-9 pr-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <Link
              href="/dashboard/pos-pelkes/baru"
              className="min-h-[40px] px-3 rounded-xl bg-brand-primary text-white text-xs font-bold flex items-center gap-1.5 shrink-0 hover:bg-blue-800 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Tambah Pos</span>
            </Link>
          </div>
        </div>

        {isLoadingPos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        ) : posPelkesOnly.length === 0 ? (
          <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
            <MapPin className="w-8 h-8 mx-auto opacity-50 text-emerald-500" />
            <p className="text-sm font-semibold">Belum ada Pos Pelkes di bawah Jemaat Induk ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posPelkesOnly.map((pos) => {
              const hasPosGps = Boolean(pos.latitude && pos.longitude);

              return (
                <Link
                  key={pos.id_pos}
                  href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}/${encodeURIComponent(pos.id_pos)}`}
                  className="block group min-h-[44px] bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft hover:border-emerald-500/40 hover:shadow-medium transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <MapPin size={20} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted">
                            {pos.id_pos}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-text-high text-base group-hover:text-emerald-600 transition-colors leading-snug">
                          {pos.nama_pos}
                        </h3>

                        {pos.alamat && (
                          <p className="text-xs text-text-muted line-clamp-1">{pos.alamat}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl text-text-muted group-hover:text-emerald-600 group-hover:bg-surface-sunken transition-all shrink-0">
                      <ChevronRight size={20} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-3 text-xs text-text-muted">
                    <span className="font-semibold text-text-high flex items-center gap-1">
                      <HeartHandshake size={14} className="text-emerald-600" />
                      {pos.pj ? `PJ: ${pos.pj.nama_lengkap}` : '⚠️ Belum ada PJ'}
                    </span>

                    {!hasPosGps && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
                        ⚠️ No GPS
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. MODALS */}
      {showKmjModal && (
        <KMJSelector
          id_induk={id_induk}
          nama_induk={jemaat?.nama_induk || id_induk}
          currentKmjId={jemaat?.kmj?.id_pendeta}
          onSuccess={() => setShowKmjModal(false)}
          onClose={() => setShowKmjModal(false)}
        />
      )}

      {showPjModal && (
        <PJSelector
          id_induk={id_induk}
          nama_induk={jemaat?.nama_induk || id_induk}
          onSuccess={() => setShowPjModal(false)}
          onClose={() => setShowPjModal(false)}
        />
      )}
    </div>
  );
}
