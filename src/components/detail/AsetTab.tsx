'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ListRow } from '@/components/list/ListRow';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Box, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SummaryStrip } from '@/components/list/SummaryStrip';

export interface AsetTabProps {
  id_pos: string;
  canWrite?: boolean;
}

export function AsetTab({ id_pos }: AsetTabProps) {
  const { data: asetList, isLoading } = useQuery({
    queryKey: ['pos-aset-list', id_pos],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('t_aset_pos_pelkes')
        .select('*')
        .eq('id_pos', id_pos)
        .order('nama_aset', { ascending: true });
      return data || [];
    },
  });

  if (isLoading) {
    return <ListSkeleton count={4} />;
  }

  if (!asetList || asetList.length === 0) {
    return (
      <EmptyState
        icon={Box}
        title="Belum Ada Inventaris Aset"
        description="Belum ada aset fisik atau bangunan yang terdaftar pada pos pelkes ini."
      />
    );
  }

  const totalAset = asetList.length;
  const baikCount = asetList.filter((a: any) => a.kondisi === 'Baik').length;
  const rusakCount = asetList.filter((a: any) => a.kondisi && a.kondisi !== 'Baik').length;

  return (
    <div className="space-y-4">
      <SummaryStrip
        metrics={[
          { label: 'Total Aset Terdaftar', value: totalAset, icon: <Box size={16} className="text-brand-primary" /> },
          { label: 'Kondisi Baik', value: baikCount, icon: <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" /> },
          { label: 'Perlu Perbaikan', value: rusakCount, icon: <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" /> },
        ]}
        className="bg-surface-1/50 rounded-xl py-2 px-3 hairline-b"
      />

      <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
        {asetList.map((item: any) => {
          const isBaik = item.kondisi === 'Baik';

          return (
            <ListRow
              key={item.id_aset || item.id}
              icon={<Box className="w-5 h-5 text-brand-primary" />}
              iconVariant="brand"
              title={item.nama_aset || 'Aset Pos'}
              subtitle={
                <span className="flex items-center gap-2">
                  <span>Kategori: {item.kategori || 'Fisik'}</span>
                  {item.jumlah && <span className="font-bold">• {item.jumlah} Unit</span>}
                </span>
              }
              badge={
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isBaik
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  {item.kondisi || 'Tercatat'}
                </span>
              }
              href={`/laporan/aset`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default AsetTab;
