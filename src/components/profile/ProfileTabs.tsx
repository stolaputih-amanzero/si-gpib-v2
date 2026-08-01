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
  Heart,
  Sparkles,
  Layers,
  User,
  Church,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfileTabGroup = 'pribadi' | 'pelayanan' | 'sistem';

export type ProfileTabKey =
  | 'identitas'
  | 'keluarga'
  | 'kompetensi'
  | 'hierarki'
  | 'penugasan'
  | 'mutasi'
  | 'pastoral'
  | 'keterlibatan'
  | 'akun'
  | 'aktivitas'
  | 'draft';

export interface TabGroupDef {
  key: ProfileTabGroup;
  label: string;
  icon: any;
  subTabs: {
    key: ProfileTabKey;
    label: string;
    icon: any;
    pendetaOnly?: boolean;
    privatRule?: string;
  }[];
}

export const TAB_GROUPS: TabGroupDef[] = [
  {
    key: 'pribadi',
    label: 'Pribadi',
    icon: User,
    subTabs: [
      { key: 'identitas', label: 'Identitas Pelayanan', icon: UserCheck, pendetaOnly: true },
      { key: 'keluarga', label: 'Keluarga', icon: Heart, pendetaOnly: true, privatRule: 'Privat' },
      { key: 'kompetensi', label: 'Kompetensi & Karunia', icon: Sparkles, pendetaOnly: true },
    ],
  },
  {
    key: 'pelayanan',
    label: 'Pelayanan',
    icon: Church,
    subTabs: [
      { key: 'hierarki', label: 'Hierarki Pelayanan', icon: Network },
      { key: 'penugasan', label: 'Peran & Penugasan', icon: Briefcase, pendetaOnly: true },
      { key: 'mutasi', label: 'Riwayat Mutasi', icon: History, pendetaOnly: true },
      { key: 'pastoral', label: 'Log Pastoral', icon: FileText, pendetaOnly: true },
      { key: 'keterlibatan', label: 'Keterlibatan Sinodal', icon: Layers, pendetaOnly: true },
    ],
  },
  {
    key: 'sistem',
    label: 'Sistem',
    icon: Settings,
    subTabs: [
      { key: 'akun', label: 'Akun & Keamanan', icon: Shield },
      { key: 'aktivitas', label: 'Jejak Aktivitas', icon: Activity },
      { key: 'draft', label: 'Data Lokal & Draft', icon: HardDrive },
    ],
  },
];

export function getGroupForTab(tabKey: ProfileTabKey): ProfileTabGroup {
  for (const g of TAB_GROUPS) {
    if (g.subTabs.some((s) => s.key === tabKey)) {
      return g.key;
    }
  }
  return 'pribadi';
}

interface ProfileTabsProps {
  activeTab: ProfileTabKey;
  onTabChange: (key: ProfileTabKey) => void;
  hasPendeta: boolean;
}

export function ProfileTabs({ activeTab, onTabChange, hasPendeta }: ProfileTabsProps) {
  const currentGroupKey = getGroupForTab(activeTab);
  const currentGroup = TAB_GROUPS.find((g) => g.key === currentGroupKey) || TAB_GROUPS[0];

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeBtnRef.current && scrollRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  const handleGroupClick = (groupKey: ProfileTabGroup) => {
    const targetGroup = TAB_GROUPS.find((g) => g.key === groupKey);
    if (!targetGroup) return;

    const exists = targetGroup.subTabs.some((s) => s.key === activeTab);
    if (!exists) {
      onTabChange(targetGroup.subTabs[0].key);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* 3 Main Group Segmented Control */}
      <div className="flex items-center gap-1.5 p-1 bg-surface-sunken/80 backdrop-blur-md rounded-2xl border border-line-subtle/50 shadow-2xs">
        {TAB_GROUPS.map((group) => {
          const Icon = group.icon;
          const isGroupActive = currentGroupKey === group.key;

          return (
            <button
              key={group.key}
              type="button"
              onClick={() => handleGroupClick(group.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px]',
                isGroupActive
                  ? 'bg-surface-1 text-brand-600 font-bold shadow-2xs border border-line-subtle'
                  : 'text-ink-tertiary hover:text-ink-primary hover:bg-surface-1/40'
              )}
            >
              <Icon size={16} className={cn(isGroupActive ? 'text-brand-600' : 'text-ink-tertiary')} />
              <span>{group.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub Tabs Fluid Horizontal Scroll Strip */}
      <div className="w-full">
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {currentGroup.subTabs.map((tab) => {
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
                  'relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 min-h-[42px]',
                  isActive
                    ? 'bg-brand-600 text-white shadow-2xs font-bold'
                    : isDimmed
                    ? 'text-ink-disabled hover:text-ink-secondary hover:bg-surface-sunken/60 opacity-70 border border-line-subtle/30'
                    : 'text-ink-secondary hover:text-ink-primary bg-surface-1/60 hover:bg-surface-1 border border-line-subtle/40'
                )}
              >
                <Icon size={16} className={cn(isActive ? 'text-white' : 'text-ink-tertiary')} />
                <span>{tab.label}</span>
                {tab.privatRule && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    {tab.privatRule}
                  </span>
                )}
                {isDimmed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" title="Khusus Pendeta" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
