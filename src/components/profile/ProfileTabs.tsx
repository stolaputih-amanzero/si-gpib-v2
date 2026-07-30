'use client';

import { useRef, useEffect } from 'react';
import {
  Shield,
  UserCheck,
  Network,
  Briefcase,
  History,
  FileText,
  Activity,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfileTabKey =
  | 'akun'
  | 'identitas'
  | 'hierarki'
  | 'penugasan'
  | 'mutasi'
  | 'pastoral'
  | 'aktivitas'
  | 'draft';

interface TabItem {
  key: ProfileTabKey;
  label: string;
  icon: any;
  pendetaOnly?: boolean;
}

const TABS: TabItem[] = [
  { key: 'akun', label: 'Akun & Keamanan', icon: Shield },
  { key: 'identitas', label: 'Identitas Pelayanan', icon: UserCheck, pendetaOnly: true },
  { key: 'hierarki', label: 'Hierarki Pelayanan', icon: Network },
  { key: 'penugasan', label: 'Peran & Penugasan', icon: Briefcase, pendetaOnly: true },
  { key: 'mutasi', label: 'Riwayat Mutasi', icon: History, pendetaOnly: true },
  { key: 'pastoral', label: 'Log Pastoral', icon: FileText, pendetaOnly: true },
  { key: 'aktivitas', label: 'Jejak Aktivitas', icon: Activity },
  { key: 'draft', label: 'Data Lokal & Draft', icon: HardDrive },
];

interface ProfileTabsProps {
  activeTab: ProfileTabKey;
  onTabChange: (key: ProfileTabKey) => void;
  hasPendeta: boolean;
}

export function ProfileTabs({ activeTab, onTabChange, hasPendeta }: ProfileTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Auto scroll active tab into view on mobile
  useEffect(() => {
    if (activeBtnRef.current && scrollRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  return (
    <div className="border-b border-line-hairline bg-surface-1 rounded-2xl p-1.5 elevate-1">
      <div
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const isDimmed = tab.pendetaOnly && !hasPendeta;

          return (
            <button
              key={tab.key}
              ref={isActive ? activeBtnRef : null}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 min-h-[44px] tap',
                isActive
                  ? 'bg-brand-600 text-white shadow-soft font-bold'
                  : isDimmed
                  ? 'text-ink-disabled hover:text-ink-secondary hover:bg-surface-sunken opacity-70'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-sunken'
              )}
            >
              <Icon size={16} className={cn(isActive ? 'text-white' : 'text-ink-tertiary')} />
              <span>{tab.label}</span>
              {isDimmed && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" title="Khusus Pendeta" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
