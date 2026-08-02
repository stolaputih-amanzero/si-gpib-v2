'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ListRow } from '@/components/list/ListRow';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Landmark, Building2, Car, Box } from 'lucide-react';
import { SummaryStrip } from '@/components/list/SummaryStrip';

export interface AsetTabProps {
  id_pos: string;
  canWrite?: boolean;
}

export function AsetTab({ id_pos }: AsetTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['pos-aset-full', id_pos],
    queryFn: async () => {
      const supabase = createClient();
      const [tanahRes, bangunanRes, bergerakRes] = await Promise.all([
        supabase.from('t_aset_tanah').select('*').eq('id_pos', id_pos),
        supabase.from('t_aset_bangunan').select('*').eq('id_pos', id_pos),
        supabase.from('t_aset_bergerak').select('*').eq('id_pos', id_pos),
      ]);

      return {
        tanah: tanahRes.data || [],
        bangunan: bangunanRes.data || [],
        bergerak: bergerakRes.data || [],
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <ListSkeleton count={4} />;
  }

  const tanah = data?.tanah || [];
  const bangunan = data?.bangunan || [];
  const bergerak = data?.bergerak || [];

  const totalAset = tanah.length + bangunan.length + bergerak.length;

  if (totalAset === 0) {
    return (
      <EmptyState
        icon={Box}
        title="Belum Ada Inventaris Aset"
        description="Belum ada aset fisik (tanah, bangunan, atau bergerak) yang terdaftar pada pos pelkes ini."
      />
    );
  }

  return (
    <div className="space-y-4 animate-tab-fade">
      {/* Summary Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Aset Terdaftar', value: totalAset, icon: <Box size={16} className="text-brand-primary" /> },
          { label: 'Aset Tanah', value: tanah.length, icon: <Landmark size={16} className="text-emerald-600 dark:text-emerald-400" /> },
          { label: 'Bangunan', value: bangunan.length, icon: <Building2 size={16} className="text-blue-600 dark:text-blue-400" /> },
          { label: 'Aset Bergerak', value: bergerak.length, icon: <Car size={16} className="text-amber-600 dark:text-amber-400" /> },
        ]}
        className="bg-surface-1/60 rounded-2xl py-2 px-3 border border-border-subtle shadow-2xs"
      />

      {/* Sub-Section 1: Aset Tanah */}
      {tanah.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
            <Landmark size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Aset Tanah ({tanah.length})</span>
          </h3>
          <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
            {tanah.map((item: any) => (
              <ListRow
                key={item.id_tanah}
                icon={<Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                iconVariant="accent"
                title={`Tanah Luas ${item.luas_m2 || '-'} m²`}
                subtitle={
                  <span className="flex items-center gap-2 flex-wrap">
                    <span>Status: {item.status_hukum || 'Sertifikat'}</span>
                    {item.thn_perolehan && <span>• Thn {item.thn_perolehan}</span>}
                  </span>
                }
                meta={item.kondisi || 'Baik'}
                href="/laporan/aset"
              />
            ))}
          </div>
        </div>
      )}

      {/* Sub-Section 2: Bangunan */}
      {bangunan.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
            <Building2 size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Aset Bangunan ({bangunan.length})</span>
          </h3>
          <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
            {bangunan.map((item: any) => (
              <ListRow
                key={item.id_bangunan}
                icon={<Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                iconVariant="brand"
                title={item.nama_bangunan || `Gedung ${item.fungsi || 'Pelayanan'}`}
                subtitle={
                  <span className="flex items-center gap-2 flex-wrap">
                    <span>Fungsi: {item.fungsi || 'Gedung Ibadah'}</span>
                    {item.thn_berdiri && <span>• Berdiri Thn {item.thn_berdiri}</span>}
                  </span>
                }
                meta={item.kondisi || 'Baik'}
                href="/laporan/aset"
              />
            ))}
          </div>
        </div>
      )}

      {/* Sub-Section 3: Aset Bergerak */}
      {bergerak.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
            <Car size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Aset Bergerak ({bergerak.length})</span>
          </h3>
          <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
            {bergerak.map((item: any) => (
              <ListRow
                key={item.id_aset_b}
                icon={<Car className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                iconVariant="accent"
                title={`${item.jenis || 'Aset'} ${item.merk_tipe ? `- ${item.merk_tipe}` : ''}`}
                subtitle={
                  <span className="flex items-center gap-2 flex-wrap">
                    {item.no_polisi && <span className="font-mono">Nopol: {item.no_polisi}</span>}
                    {item.thn_perolehan && <span>• Thn {item.thn_perolehan}</span>}
                  </span>
                }
                meta={item.kondisi || 'Baik'}
                href="/laporan/aset"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AsetTab;
