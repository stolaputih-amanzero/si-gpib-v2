'use client';

import { OrgLevelFilter } from '@/hooks/use-org-directory';
import { cn } from '@/lib/utils';

interface OrgDirectoryTabsProps {
  activeTab: OrgLevelFilter;
  onTabChange: (tab: OrgLevelFilter) => void;
  totalCount: number;
}

export function OrgDirectoryTabs({ activeTab, onTabChange, totalCount }: OrgDirectoryTabsProps) {
  const tabs: { id: OrgLevelFilter; label: string }[] = [
    { id: 'all', label: 'Semua Level' },
    { id: 'mupel', label: 'Mupel' },
    { id: 'jemaat', label: 'Jemaat' },
    { id: 'bajem', label: 'Bajem' },
    { id: 'pos', label: 'Pos Pelkes' },
  ];

  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-border-subtle">
      <div className="flex items-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] flex items-center gap-1.5 whitespace-nowrap',
                isActive
                  ? 'bg-brand-primary text-white shadow-soft font-bold'
                  : 'bg-surface-sunken/60 text-text-muted hover:text-text-high hover:bg-surface-sunken'
              )}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <span className="text-[11px] font-bold text-text-muted shrink-0 hidden sm:inline">
        {totalCount} Organisasi Tampil
      </span>
    </div>
  );
}
