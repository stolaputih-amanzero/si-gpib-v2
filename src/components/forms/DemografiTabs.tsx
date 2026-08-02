'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PelkatTabItem {
  id: string;
  label: string;
  icon: string | ReactNode;
}

export interface DemografiTabsProps {
  activeTab: string;
  onTabChange: (kategori: string) => void;
  kategoriList: PelkatTabItem[];
  className?: string;
}

export function DemografiTabs({
  activeTab,
  onTabChange,
  kategoriList,
  className,
}: DemografiTabsProps) {
  const scrollToSection = (id: string) => {
    onTabChange(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Kategori Pelkat Navigasi"
      className={cn(
        'w-full overflow-x-auto no-scrollbar py-2 flex items-center gap-2 select-none',
        className
      )}
    >
      {kategoriList.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`section-${item.id}`}
            onClick={() => scrollToSection(item.id)}
            className={cn(
              'px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border min-h-[44px]',
              isActive
                ? 'bg-brand-primary text-white border-brand-primary shadow-2xs'
                : 'bg-surface-1 text-text-high border-border-subtle hover:bg-surface-sunken'
            )}
          >
            <span className="text-sm">{typeof item.icon === 'string' ? item.icon : item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default DemografiTabs;
