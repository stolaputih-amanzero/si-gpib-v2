'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProjectionHeader } from '@/components/projections/ProjectionHeader';
import { AidQueueProjectionResponse } from '@/lib/domains/aid-requests/aid-queue.queries';
import { HeartHandshake, Filter, ArrowUpRight, Search, Lock } from 'lucide-react';

interface AidQueueClientViewProps {
  data: AidQueueProjectionResponse;
}

export function AidQueueClientView({ data }: AidQueueClientViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!data.canReviewAid) {
    return (
      <div className="min-h-screen bg-[#0B1220] pb-24">
        <ProjectionHeader
          title="Antrean Persetujuan Bantuan (Aid Review Queue)"
          subtitle="Proyeksi persetujuan bantuan lintas unit"
          badgeLabel="Akses Terbatas"
          icon={<HeartHandshake className="w-6 h-6 text-pink-400" />}
        />
        <div className="max-w-md mx-auto mt-16 p-6 rounded-2xl bg-slate-900 border border-border-subtle text-center space-y-3">
          <Lock className="w-8 h-8 text-amber-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-100">Akses Review Terbatas</h2>
          <p className="text-xs text-slate-400">
            Halaman proyeksi ini khusus untuk peranan Ketua Majelis Jemaat (KMJ) dan Mupel/Sinode.
          </p>
        </div>
      </div>
    );
  }

  const filteredItems = data.items.filter((item) => {
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = searchQuery === '' || item.jenis.toLowerCase().includes(searchQuery.toLowerCase()) || item.pos.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0B1220] pb-24">
      {/* P-4 Analytical Lens Header */}
      <ProjectionHeader
        title="Antrean Persetujuan Bantuan (Aid Review Queue)"
        subtitle={`Proyeksi persetujuan bantuan dalam wewenang ${data.scopeLabel}`}
        badgeLabel="Antrean Review"
        icon={<HeartHandshake className="w-6 h-6 text-pink-400" />}
      />

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-5">
        {/* Filter & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari jenis bantuan atau nama pos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-border-subtle rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 min-h-[44px]"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['ALL', 'PENDING_KMJ', 'PENDING_MUPEL'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 min-h-[36px] ${
                  filterStatus === st
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-950 text-slate-400 border border-border-subtle hover:bg-slate-800'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st === 'PENDING_KMJ' ? 'Pending KMJ' : 'Pending Mupel'}
              </button>
            ))}
          </div>
        </div>

        {/* List of Aid Queue */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-border-subtle shadow-xs space-y-3 hover:border-indigo-500/40 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-border-subtle">
                    {item.id}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    item.status === 'PENDING_KMJ' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {item.status === 'PENDING_KMJ' ? 'Pending Review KMJ' : 'Pending Review Mupel'}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400 font-sans tabular-nums">{item.tgl}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {item.jenis}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Unit: <span className="font-semibold text-slate-200">{item.pos}</span> • Pemohon: <span className="text-slate-300">{item.pemohon}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nominal Ajuan:</span>
                    <span className="text-sm font-bold text-emerald-400 font-sans tabular-nums">{item.nominal}</span>
                  </div>

                  <Link
                    href={`/aid-requests/${item.id}`}
                    className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center gap-1 text-xs font-bold min-h-[44px]"
                  >
                    <span>Detail Transaction View</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
