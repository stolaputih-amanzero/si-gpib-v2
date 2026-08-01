'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ListRow } from '@/components/list/ListRow';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { UserCheck, HeartHandshake, ShieldCheck } from 'lucide-react';

export interface PelayanTabProps {
  id_pos: string;
  canWrite?: boolean;
  pj?: any;
  pelayan?: any[];
  relawan?: any[];
}

export function PelayanTab({ id_pos, pj, pelayan: initialPelayan, relawan: initialRelawan }: PelayanTabProps) {
  const { data: pelayan, isLoading: isPelayanLoading } = useQuery({
    queryKey: ['pos-pelayan', id_pos],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('t_pelayan')
        .select('*')
        .eq('id_pos', id_pos)
        .eq('status', 'Aktif');
      return data || [];
    },
    initialData: initialPelayan,
  });

  const { data: relawan, isLoading: isRelawanLoading } = useQuery({
    queryKey: ['pos-relawan', id_pos],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('t_relawan')
        .select('*')
        .eq('id_pos', id_pos);
      return data || [];
    },
    initialData: initialRelawan,
  });

  if (isPelayanLoading || isRelawanLoading) {
    return <ListSkeleton count={4} />;
  }

  const hasPJ = Boolean(pj);
  const hasPelayan = pelayan && pelayan.length > 0;
  const hasRelawan = relawan && relawan.length > 0;

  if (!hasPJ && !hasPelayan && !hasRelawan) {
    return (
      <EmptyState
        icon={UserCheck}
        title="Belum Ada Pelayan / Relawan Terdaftar"
        description="Belum ada data Pendeta PJ, Pelayan Pos, atau Relawan yang terdaftar untuk pos pelkes ini."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Pendeta PJ */}
      {hasPJ && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-brand-primary" />
            <span>Pendeta Penanggung Jawab (PJ)</span>
          </h3>

          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
            <ListRow
              icon={
                pj.foto_url ? (
                  <img src={pj.foto_url} alt={pj.nama_lengkap} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <UserCheck className="w-5 h-5 text-brand-primary" />
                )
              }
              iconVariant={pj.foto_url ? 'none' : 'brand'}
              title={pj.nama_lengkap}
              subtitle={`Status: ${pj.status_tugas || 'Aktif'} · Mulai ${new Date(pj.tgl_mulai).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })}`}
              badge={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">
                  Pendeta PJ
                </span>
              }
              href={`/pendeta/${pj.id_pendeta}`}
            />
          </div>
        </div>
      )}

      {/* Section 2: Pelayan Pos */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
          <UserCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span>Daftar Pelayan Pos Pelkes ({pelayan?.length || 0})</span>
        </h3>

        {!hasPelayan ? (
          <p className="text-xs text-text-muted italic px-2">Belum ada pelayan pos aktif terdaftar.</p>
        ) : (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
            {pelayan.map((p: any) => (
              <ListRow
                key={p.id_pelayan || p.id}
                icon={<UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                iconVariant="brand"
                title={p.nama}
                subtitle={`Jabatan: ${p.jabatan || 'Pelayan'} · ${p.no_wa ? `WA: ${p.no_wa}` : ''}`}
                badge={
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {p.status || 'Aktif'}
                  </span>
                }
                href="/sdm/pelayan"
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Relawan */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
          <HeartHandshake size={14} className="text-blue-600 dark:text-blue-400" />
          <span>Daftar Relawan ({relawan?.length || 0})</span>
        </h3>

        {!hasRelawan ? (
          <p className="text-xs text-text-muted italic px-2">Belum ada relawan terdaftar.</p>
        ) : (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
            {relawan.map((r: any) => (
              <ListRow
                key={r.id_relawan || r.id}
                icon={<HeartHandshake className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                iconVariant="brand"
                title={r.nama}
                subtitle={`Kategori: ${r.kategori || 'Pelayanan'} · ${r.pelatihan ? `Pelatihan: ${r.pelatihan}` : ''}`}
                badge={
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                    Relawan
                  </span>
                }
                href="/sdm/relawan"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PelayanTab;
