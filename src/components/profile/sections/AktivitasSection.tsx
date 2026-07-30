'use client';

import { useAktivitasUser } from '@/hooks/use-profile';
import { VerticalTimeline } from '../timeline/VerticalTimeline';
import { Activity, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface AktivitasSectionProps {
  userId?: string;
  isAuthorized?: boolean;
}

export function AktivitasSection({ userId, isAuthorized = true }: AktivitasSectionProps) {
  const { data: aktivitasList, isLoading } = useAktivitasUser(userId);

  if (!isAuthorized) {
    return (
      <div className="card-flat p-8 text-center space-y-2 bg-surface-1 border border-line-subtle animate-rise">
        <ShieldAlert size={32} className="mx-auto text-ink-tertiary opacity-40" />
        <p className="font-semibold text-sm text-ink-primary">Akses Jejak Aktivitas Dibatasi</p>
        <p className="text-xs text-ink-tertiary max-w-sm mx-auto">
          Jejak audit dan aktivitas privat pengguna hanya dapat diakses oleh akun bersangkutan atau Super User Sinode.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="card-flat p-6 h-64 skeleton" />;
  }

  const timelineItems = (aktivitasList || []).map((a) => {
    let actionBadge = 'bg-surface-brand text-brand-600';
    const aksiUpper = a.aksi.toUpperCase();

    if (aksiUpper.includes('LOGIN')) actionBadge = 'bg-info-soft text-info';
    else if (aksiUpper.includes('CREATE') || aksiUpper.includes('TAMBAH')) actionBadge = 'bg-ok-soft text-ok';
    else if (aksiUpper.includes('EDIT') || aksiUpper.includes('UPDATE')) actionBadge = 'bg-surface-accent text-accent-600';
    else if (aksiUpper.includes('DELETE') || aksiUpper.includes('REJECT')) actionBadge = 'bg-bad-soft text-bad';

    return {
      id: a.id,
      date: a.created_at,
      title: `${a.aksi} ${a.fitur ? `• ${a.fitur}` : ''}`,
      subtitle: a.detail || undefined,
      body: a.ip_address ? `IP: ${a.ip_address}` : undefined,
      badge: (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${actionBadge}`}>
          {a.aksi}
        </span>
      ),
    };
  });

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="card-flat p-5 space-y-5 bg-surface-1 animate-rise">
      <div className="flex items-center justify-between border-b border-line-hairline pb-3">
        <h3 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2">
          <Activity size={18} className="text-brand-600" />
          <span>Jejak Audit & Aktivitas Pengguna</span>
        </h3>
        <span className="text-xs font-mono text-ink-tertiary tnum">
          {timelineItems.length} Log Terakhir
        </span>
      </div>

      <VerticalTimeline
        items={timelineItems}
        emptyMessage="Belum ada catatan aktivitas tercatat untuk akun ini."
        formatDateFn={formatDate}
      />
    </div>
  );
}
