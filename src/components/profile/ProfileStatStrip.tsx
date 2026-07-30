'use client';

import { useEffect, useState, useRef } from 'react';
import { useProfileStats, useProfileAkun, useDeviceBiometric } from '@/hooks/use-profile';
import { FileText, Users, MapPin, Calendar, Clock, ShieldCheck, UserCheck, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ProfileStatStripProps {
  userId?: string;
  idPendeta?: string | null;
}

function useCountUp(target: number, duration: number = 600) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setCount(target);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || target <= 0) {
      setCount(target);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return count;
}

function StatCell({ label, value, isNumeric = true, rawNumber = 0, icon: Icon, colorClass }: {
  label: string;
  value: string | number;
  isNumeric?: boolean;
  rawNumber?: number;
  icon: any;
  colorClass: string;
}) {
  const animatedNumber = useCountUp(isNumeric ? (rawNumber || Number(value) || 0) : 0);
  const displayVal = isNumeric ? animatedNumber.toLocaleString('id-ID') : value;

  return (
    <div className="card-flat p-4 relative overflow-hidden flex flex-col justify-between hover:border-brand-500/30 transition-all">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider line-clamp-1">
          {label}
        </span>
        <div className={cn('p-1.5 rounded-lg shrink-0', colorClass)}>
          <Icon size={16} />
        </div>
      </div>
      <div className="font-display tnum text-xl sm:text-2xl font-bold text-ink-primary mt-2 truncate">
        {displayVal}
      </div>
    </div>
  );
}

export function ProfileStatStrip({ userId, idPendeta }: ProfileStatStripProps) {
  const { data: stats, isLoading: isStatsLoading } = useProfileStats(idPendeta);
  const { data: akun, isLoading: isAkunLoading } = useProfileAkun(userId);
  const { data: devices } = useDeviceBiometric(userId);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInView(true);
  }, []);

  if (isStatsLoading || isAkunLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card-flat p-4 h-24 skeleton" />
        ))}
      </div>
    );
  }

  // Format lama melayani "X thn Y bln"
  const totalMonths = stats?.lama_melayani_bulan || 0;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  let lamaMelayaniStr = '0 Bln';
  if (years > 0 && months > 0) lamaMelayaniStr = `${years} thn ${months} bln`;
  else if (years > 0) lamaMelayaniStr = `${years} thn`;
  else if (months > 0) lamaMelayaniStr = `${months} bln`;

  // Format last login
  let lastLoginStr = 'Belum pernah';
  if (akun?.last_login_at) {
    try {
      lastLoginStr = formatDistanceToNow(new Date(akun.last_login_at), { addSuffix: true, locale: id });
    } catch {
      lastLoginStr = 'Baru saja';
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 reveal-stagger transition-all',
        inView && 'in'
      )}
    >
      {idPendeta ? (
        <>
          <StatCell
            label="Log Pastoral"
            value={stats?.total_log || 0}
            rawNumber={stats?.total_log || 0}
            icon={FileText}
            colorClass="bg-brand-500/10 text-brand-600"
          />
          <StatCell
            label="Jiwa Dilayani"
            value={stats?.total_jiwa || 0}
            rawNumber={stats?.total_jiwa || 0}
            icon={Users}
            colorClass="bg-ok-soft text-ok"
          />
          <StatCell
            label="Pos Dilayani"
            value={stats?.pos_aktif || 0}
            rawNumber={stats?.pos_aktif || 0}
            icon={MapPin}
            colorClass="bg-info-soft text-info"
          />
          <StatCell
            label="Lama Melayani"
            value={lamaMelayaniStr}
            isNumeric={false}
            icon={Clock}
            colorClass="bg-accent-50 text-accent-600 dark:bg-amber-950/20"
          />
          <StatCell
            label="Log Bulan Ini"
            value={stats?.log_bulan_ini || 0}
            rawNumber={stats?.log_bulan_ini || 0}
            icon={Calendar}
            colorClass="bg-purple-500/10 text-purple-600"
          />
        </>
      ) : (
        <>
          <StatCell
            label="Role Akun"
            value={(akun?.role || 'Pelayan').toUpperCase()}
            isNumeric={false}
            icon={ShieldCheck}
            colorClass="bg-brand-500/10 text-brand-600"
          />
          <StatCell
            label="Status"
            value={akun?.status || 'Active'}
            isNumeric={false}
            icon={UserCheck}
            colorClass="bg-ok-soft text-ok"
          />
          <StatCell
            label="Login Terakhir"
            value={lastLoginStr}
            isNumeric={false}
            icon={Clock}
            colorClass="bg-info-soft text-info"
          />
          <StatCell
            label="Perangkat Biometrik"
            value={devices?.length || 0}
            rawNumber={devices?.length || 0}
            icon={Smartphone}
            colorClass="bg-purple-500/10 text-purple-600"
          />
        </>
      )}
    </div>
  );
}
