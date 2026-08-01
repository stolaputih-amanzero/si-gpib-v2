'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ListRow } from '@/components/list/ListRow';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Activity, Calendar, Users } from 'lucide-react';

export interface PastoralTabProps {
  id_pos: string;
  canWrite?: boolean;
  initialLogs?: any[];
}

export function PastoralTab({ id_pos, initialLogs }: PastoralTabProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['pos-pastoral-logs', id_pos],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('t_log_pastoral')
        .select(`
          id_log, tgl, kegiatan, jml_jiwa, catatan,
          pendeta:m_pendeta(nama_lengkap)
        `)
        .eq('id_pos', id_pos)
        .order('tgl', { ascending: false });
      return data || [];
    },
    initialData: initialLogs,
  });

  if (isLoading) {
    return <ListSkeleton count={4} />;
  }

  if (!logs || logs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Belum Ada Log Pastoral"
        description="Belum ada catatan kunjungan atau kegiatan pastoral yang terdaftar di pos ini."
      />
    );
  }

  return (
    <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
      {logs.map((log: any) => {
        const formattedDate = log.tgl
          ? new Date(log.tgl).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : '-';

        return (
          <ListRow
            key={log.id_log}
            icon={<Activity className="w-5 h-5 text-brand-primary" />}
            iconVariant="brand"
            title={log.kegiatan || 'Kegiatan Pastoral'}
            subtitle={
              <span className="flex items-center gap-2 flex-wrap">
                <span>Pendeta: {log.pendeta?.nama_lengkap || '-'}</span>
                {log.jml_jiwa && (
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-primary">
                    <Users size={12} />
                    <span>{log.jml_jiwa} Jiwa</span>
                  </span>
                )}
              </span>
            }
            meta={
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Calendar size={12} />
                <span>{formattedDate}</span>
              </span>
            }
            href={`/laporan/pastoral`}
          />
        );
      })}
    </div>
  );
}

export default PastoralTab;
