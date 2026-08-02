'use client';

import { useState } from 'react';
import { usePengajuanList } from '@/hooks/use-bantuan';
import { Plus, Search, FileText, HeartHandshake, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { ListRow } from '@/components/list/ListRow';
import { FilterChips } from '@/components/list/FilterChips';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Badge } from '@/components/ui/badge';
import { PosName } from '@/components/ui/PosName';

export default function PengajuanBantuanOverviewPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedUrgensi] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: pengajuanList, isLoading } = usePengajuanList({
    status: selectedStatus || undefined,
    urgensi: (selectedUrgensi || undefined) as any,
    search: searchQuery || undefined,
  });

  // KPI summary stats
  const totalCount = pengajuanList?.length || 0;
  const pendingCount = pengajuanList?.filter((p) => p.status.startsWith('Pending')).length || 0;
  const approvedCount = pengajuanList?.filter((p) => p.status === 'Approved').length || 0;

  return (
    <div className="w-full space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-primary tracking-tight">
            Pengajuan Bantuan & Workflow
          </h1>
          <p className="text-xs text-ink-tertiary mt-0.5">
            Permohonan Bantuan Pos Pelkes & Approval Berjenjang
          </p>
        </div>

        <Link
          href="/bantuan/ajukan"
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs min-h-[44px] shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Ajukan Bantuan Baru</span>
          <span className="sm:hidden">+ Ajukan</span>
        </Link>
      </div>

      {/* Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Permohonan', value: totalCount, icon: <FileText size={16} /> },
          { label: 'Pending Review', value: pendingCount, icon: <Clock size={16} /> },
          { label: 'Disetujui', value: approvedCount, icon: <CheckCircle2 size={16} /> },
        ]}
        className="hairline-b bg-surface-1/40 rounded-xl py-2 px-3"
      />

      {/* Search Bar */}
      <div className="relative bg-surface-1 p-3 rounded-2xl border border-border-subtle shadow-xs">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input
          type="text"
          placeholder="Cari pengajuan (jenis bantuan, pos pelkes)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      {/* Filter Chips Status */}
      <FilterChips
        items={[
          { key: '', label: 'Semua Status', count: totalCount },
          { key: 'Pending_KMJ', label: 'Review KMJ' },
          { key: 'Pending_Mupel', label: 'Review Mupel' },
          { key: 'Pending_Sinode', label: 'Review Sinode' },
          { key: 'Approved', label: '✅ Disetujui' },
          { key: 'Rejected', label: '❌ Ditolak' },
        ]}
        active={selectedStatus}
        onChange={(key) => setSelectedStatus(key)}
        className="px-0 py-1"
      />

      {/* Main List Area */}
      <div className="pt-1">
        {isLoading ? (
          <ListSkeleton count={6} />
        ) : pengajuanList && pengajuanList.length > 0 ? (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden">
            {pengajuanList.map((item) => {
              const isApproved = item.status === 'Approved';
              const isRejected = item.status === 'Rejected';

              const iconComponent = isApproved ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : isRejected ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <HeartHandshake className="h-5 w-5" />
              );

              const iconVariant = isApproved ? 'brand' : isRejected ? 'default' : 'accent';

              const formattedBiaya = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(item.biaya || 0);

              const posNama = item.pos?.nama_pos ? (
                <PosName name={item.pos.nama_pos} />
              ) : (
                item.pos?.jemaat_induk?.nama_induk || 'Pos Pelkes'
              );

              return (
                <ListRow
                  key={item.id_ajuan}
                  icon={iconComponent}
                  iconVariant={iconVariant}
                  title={item.jenis_bantuan}
                  subtitle={
                    <span>
                      {posNama} · Urgensi: {item.urgensi}
                    </span>
                  }
                  meta={
                    <span>
                      Tgl: {item.created_at ? item.created_at.split('T')[0] : '-'} · Anggaran: {formattedBiaya}
                    </span>
                  }
                  badge={
                    <Badge
                      variant={isApproved ? 'brand' : isRejected ? 'destructive' : 'outline'}
                      className="text-[10px] py-0 px-2"
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>
                  }
                  href={`/bantuan/${item.id_ajuan}`}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="Belum Ada Pengajuan Bantuan"
            description="Tidak ada data pengajuan bantuan yang sesuai dengan kriteria filter."
            action={{
              label: 'Ajukan Bantuan Baru',
              href: '/bantuan/ajukan',
              variant: 'primary',
            }}
          />
        )}
      </div>
    </div>
  );
}
