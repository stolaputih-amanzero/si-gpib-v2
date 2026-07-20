'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useJemaatDetail, usePosByJemaat } from '@/hooks/use-hierarki';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';
import { KMJSelector } from '@/components/hierarki/KMJSelector';
import { PJSelector } from '@/components/hierarki/PJSelector';
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
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id_mupel: string; id_induk: string }>;
}

export default function JemaatDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id_mupel = decodeURIComponent(resolvedParams.id_mupel);
  const id_induk = decodeURIComponent(resolvedParams.id_induk);

  const [searchPos, setSearchPos] = useState('');
  const [showKmjModal, setShowKmjModal] = useState(false);
  const [showPjModal, setShowPjModal] = useState(false);

  const { data: jemaat, isLoading: isLoadingJemaat } = useJemaatDetail(id_induk);
  const { data: posList, isLoading: isLoadingPos } = usePosByJemaat(id_induk, searchPos);

  const hasKmj = Boolean(jemaat?.kmj?.nama_lengkap);
  const hasGps = Boolean(jemaat?.latitude && jemaat?.longitude);

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
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mt-0.5">
                <Church className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
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
              </div>
            </div>

            {/* GPS warning if missing */}
            {!hasGps && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 shrink-0">
                <AlertCircle size={14} className="text-amber-600" />
                <span>Koordinat belum diisi</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. SECTION: KMJ & PJ (2 Grid Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* A. KMJ Card */}
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-text-high text-sm">Ketua Majelis Jemaat (KMJ)</h3>
            </div>
            <button
              onClick={() => setShowKmjModal(true)}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline flex items-center gap-1"
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
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shrink-0 shadow-sm"
                >
                  <PhoneCall size={14} />
                  <span>Hubungi</span>
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
              onClick={() => setShowPjModal(true)}
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1"
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
              onClick={() => setShowPjModal(true)}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shrink-0 shadow-sm"
            >
              <Plus size={14} />
              <span>Kelola PJ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. SECTION: LIST POS PELKES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-black text-text-high">
              Daftar Pos Pelkes ({posList?.length || 0} Pos)
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari nama pos..."
              value={searchPos}
              onChange={(e) => setSearchPos(e.target.value)}
              className="w-full min-h-[40px] pl-9 pr-3.5 rounded-xl border border-border-subtle bg-surface-elevated text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        {isLoadingPos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        ) : !posList || posList.length === 0 ? (
          <div className="p-8 text-center bg-surface-elevated rounded-2xl border border-border-subtle text-text-muted space-y-2">
            <MapPin className="w-8 h-8 mx-auto opacity-50 text-emerald-500" />
            <p className="text-sm font-semibold">Belum ada Pos Pelkes di bawah Jemaat Induk ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posList.map((pos) => {
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
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            pos.kategori === 'Bajem'
                              ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                          }`}>
                            {pos.kategori || 'Pos Pelkes'}
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

      {/* 4. MODALS */}
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
