'use client';

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
}

interface PersonNavigationAnchorProps {
  tabs: TabItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const PersonNavigationAnchor: React.FC<PersonNavigationAnchorProps> = ({
  tabs,
  activeTab,
  onSelectTab,
}) => {
  const currentIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div className="sticky top-0 z-30 bg-surface-elevated/95 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xs p-2 space-y-2">
      {/* 1. Main Tab Buttons */}
      <nav aria-label="Navigasi Tab Profil Personil" className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer min-h-[36px] ${
                isActive
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-text-muted hover:bg-surface-sunken hover:text-text-high'
              }`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 2. Sleek Minimal Step Marks (Indicator Marks/Pills) */}
      <div className="flex items-center justify-center gap-1.5 pt-0.5">
        {tabs.map((tab, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={`mark-${tab.id}`}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-label={`Pindah ke tab ${tab.label}`}
              title={`${idx + 1}. ${tab.label}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                isActive
                  ? 'w-7 h-1.5 bg-amber-700 shadow-2xs'
                  : 'w-2 h-1.5 bg-border-strong hover:bg-text-muted opacity-60 hover:opacity-100'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
