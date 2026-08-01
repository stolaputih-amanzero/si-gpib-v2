'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ListRow } from '@/components/list/ListRow';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { ShieldAlert, Sparkles, Compass } from 'lucide-react';
import { SummaryStrip } from '@/components/list/SummaryStrip';

export interface WilayahTabProps {
  id_pos: string;
  canWrite?: boolean;
  initialKerawanan?: any[];
  initialPotensi?: any[];
}

export function WilayahTab({ id_pos, initialKerawanan, initialPotensi }: WilayahTabProps) {
  const { data: kerawanan, isLoading: isKerawananLoading } = useQuery({
    queryKey: ['pos-kerawanan', id_pos],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('t_kerawanan_wilayah')
        .select('*')
        .eq('id_pos', id_pos);
      return data || [];
    },
    initialData: initialKerawanan,
  });

  const { data: potensi, isLoading: isPotensiLoading } = useQuery({
    queryKey: ['pos-potensi', id_pos],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('t_potensi_wilayah')
        .select('*')
        .eq('id_pos', id_pos);
      return data || [];
    },
    initialData: initialPotensi,
  });

  if (isKerawananLoading || isPotensiLoading) {
    return <ListSkeleton count={4} />;
  }

  const hasKerawanan = kerawanan && kerawanan.length > 0;
  const hasPotensi = potensi && potensi.length > 0;

  if (!hasKerawanan && !hasPotensi) {
    return (
      <EmptyState
        icon={Compass}
        title="Belum Ada Data Analisis Wilayah"
        description="Belum ada data risiko kerawanan atau potensi wilayah yang tercatat untuk pos pelkes ini."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SummaryStrip
        metrics={[
          { label: 'Risiko Kerawanan', value: kerawanan?.length || 0, icon: <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400" /> },
          { label: 'Potensi Wilayah', value: potensi?.length || 0, icon: <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" /> },
        ]}
        className="bg-surface-1/50 rounded-xl py-2 px-3 hairline-b"
      />

      {/* Section 1: Kerawanan / Risiko */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400" />
          <span>Risiko Kerawanan Wilayah ({kerawanan?.length || 0})</span>
        </h3>

        {!hasKerawanan ? (
          <p className="text-xs text-text-muted italic px-2">Tidak ada data kerawanan tercatat.</p>
        ) : (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
            {kerawanan.map((k: any) => {
              const isKritis = k.frekuensi === 'Kritis';

              return (
                <ListRow
                  key={k.id_risiko || k.id}
                  icon={<ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  iconVariant="brand"
                  title={k.jenis_risiko || 'Risiko Wilayah'}
                  subtitle={`Kategori: ${k.kategori || 'Umum'} ${k.keterangan ? `· "${k.keterangan}"` : ''}`}
                  badge={
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isKritis
                          ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      {k.frekuensi || 'Tercatat'}
                    </span>
                  }
                  href="/laporan/kerawanan"
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Potensi Wilayah */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
          <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span>Potensi Pengembangan Wilayah ({potensi?.length || 0})</span>
        </h3>

        {!hasPotensi ? (
          <p className="text-xs text-text-muted italic px-2">Tidak ada data potensi wilayah tercatat.</p>
        ) : (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
            {potensi.map((p: any) => (
              <ListRow
                key={p.id_potensi || p.id}
                icon={<Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                iconVariant="brand"
                title={p.nama_potensi || 'Potensi Wilayah'}
                subtitle={`Kategori: ${p.kategori || 'Pengembangan'} ${p.deskripsi ? `· ${p.deskripsi}` : ''}`}
                badge={
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Potensi
                  </span>
                }
                href="/laporan/potensi"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WilayahTab;
