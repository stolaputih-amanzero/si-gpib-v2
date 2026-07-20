import { KATEGORI_ASET } from '@/lib/constants/aset';

interface AsetTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: {
    ALL?: number;
    TANAH?: number;
    BANGUNAN?: number;
    BERGERAK?: number;
  };
}

export function AsetTabs({ activeTab, onTabChange, counts }: AsetTabsProps) {
  const tabs = [
    { id: '', label: 'Semua Aset', icon: '📦', count: counts?.ALL || 0 },
    ...KATEGORI_ASET.map(k => ({
      id: k.kode,
      label: k.nama,
      icon: k.icon,
      count: counts?.[k.kode as keyof typeof counts] || 0,
    })),
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab.toUpperCase() === tab.id.toUpperCase();

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`min-h-[44px] px-4 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all active:scale-95 border ${
              isActive
                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                : 'bg-surface-elevated text-text-muted hover:text-text-high border-border-subtle hover:bg-surface-sunken'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-sunken text-text-high border border-border-subtle'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
