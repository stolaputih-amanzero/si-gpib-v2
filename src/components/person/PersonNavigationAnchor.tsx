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
  return (
    <div className="sticky top-0 z-30 bg-surface-elevated/95 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xs p-2">
      {/* Main Tab Buttons */}
      <nav aria-label="Navigasi Tab Profil Personil" className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer min-h-[38px] ${
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
    </div>
  );
};
