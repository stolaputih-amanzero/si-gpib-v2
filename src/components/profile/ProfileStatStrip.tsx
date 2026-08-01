'use client';

import { useEffect, useState, useRef } from 'react';
import { useProfileStats, useProfileAkun } from '@/hooks/use-profile';
import { FileText, Users, MapPin, Calendar, Clock, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

function StatCell({ label, value, isNumeric = true, rawNumber = 0, icon: Icon, iconColorClass }: {
  label: string;
  value: string | number;
  isNumeric?: boolean;
  rawNumber?: number;
  icon: any;
  iconColorClass: string;
}) {
  const animatedNumber = useCountUp(isNumeric ? (rawNumber || Number(value) || 0) : 0);
  const displayVal = isNumeric ? animatedNumber.toLocaleString('id-ID') : value;

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl hover:bg-surface-1/50 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <Icon size={16} className={cn('shrink-0 opacity-80', iconColorClass)} />
        <span className="text-xs sm:text-sm font-semibold text-ink-secondary truncate">
          {label}
        </span>
      </div>
      <div className="font-display tnum text-base sm:text-lg font-bold text-ink-primary shrink-0 ml-2">
        {displayVal}
      </div>
    </div>
  );
}

export function ProfileStatStrip({ userId, idPendeta }: ProfileStatStripProps) {
  const { data: stats, isLoading: isStatsLoading } = useProfileStats(idPendeta, userId);
  const { isLoading: isAkunLoading } = useProfileAkun(userId);
  const [inView, setInView] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInView(true);
  }, []);

  if (isStatsLoading || isAkunLoading) {
    return (
      <div className="w-full bg-surface-1/70 backdrop-blur-md rounded-3xl border border-line-subtle/50 p-4 h-16 skeleton" />
    );
  }

  const totalMonths = stats?.lama_melayani_bulan || 0;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  let lamaMelayaniStr = '0 Bln';
  if (years > 0 && months > 0) lamaMelayaniStr = `${years} thn ${months} bln`;
  else if (years > 0) lamaMelayaniStr = `${years} thn`;
  else if (months > 0) lamaMelayaniStr = `${months} bln`;

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full bg-surface-1/70 backdrop-blur-md rounded-3xl border border-line-subtle/50 p-1.5 sm:p-2 reveal-stagger transition-all shadow-2xs overflow-hidden',
        inView && 'in'
      )}
    >
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl hover:bg-surface-1/60 transition-colors text-left group min-h-[44px]"
      >
        <div className="flex items-center gap-2.5">
          <BarChart2 size={16} className="text-brand-600 dark:text-brand-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-ink-primary group-hover:text-brand-600 transition-colors">
            Statistik Pelayanan
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCollapsed && (
            <span className="text-[11px] font-mono font-medium text-ink-tertiary">
              {stats?.total_log || 0} Log • {stats?.total_jiwa || 0} Jiwa
            </span>
          )}
          <div className="p-1 rounded-lg text-ink-tertiary group-hover:text-brand-600 group-hover:bg-surface-sunken transition-colors">
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </div>
      </button>

      {/* Expandable Stat Rows */}
      {!isCollapsed && (
        <div className="divide-y divide-line-hairline/60 border-t border-line-hairline/60 pt-1 mt-1">
          <StatCell
            label="Log Pastoral"
            value={stats?.total_log || 0}
            rawNumber={stats?.total_log || 0}
            icon={FileText}
            iconColorClass="text-brand-600 dark:text-brand-400"
          />
          <StatCell
            label="Jiwa Dilayani"
            value={stats?.total_jiwa || 0}
            rawNumber={stats?.total_jiwa || 0}
            icon={Users}
            iconColorClass="text-emerald-600 dark:text-emerald-400"
          />
          <StatCell
            label="Pos Dilayani"
            value={stats?.pos_aktif || 1}
            rawNumber={stats?.pos_aktif || 1}
            icon={MapPin}
            iconColorClass="text-blue-600 dark:text-blue-400"
          />
          <StatCell
            label="Lama Melayani"
            value={lamaMelayaniStr}
            isNumeric={false}
            icon={Clock}
            iconColorClass="text-amber-600 dark:text-amber-400"
          />
          <StatCell
            label="Log Bulan Ini"
            value={stats?.log_bulan_ini || 0}
            rawNumber={stats?.log_bulan_ini || 0}
            icon={Calendar}
            iconColorClass="text-purple-600 dark:text-purple-400"
          />
        </div>
      )}
    </div>
  );
}
