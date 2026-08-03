'use client';

import { useRouter } from 'next/navigation';
import { SuperMenuGroupConfig, SuperMenuItemConfig } from '@/lib/constants/navigation';
import { haptic } from '@/lib/haptic/vibrate';

interface MenuGroupProps {
  group: SuperMenuGroupConfig;
  onClose: () => void;
}

export function MenuGroup({ group, onClose }: MenuGroupProps) {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    haptic('light');
    onClose();
    // Delay kecil agar animasi close sheet selesai sebelum transisi halaman
    setTimeout(() => {
      router.push(href);
    }, 150);
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
        {group.title}
      </h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {group.items.map((item) => (
          <MenuItem 
            key={item.href} 
            item={item} 
            onNavigate={() => handleNavigate(item.href)} 
          />
        ))}
      </div>
    </div>
  );
}

interface MenuItemProps {
  item: SuperMenuItemConfig;
  onNavigate: () => void;
}

function MenuItem({ item, onNavigate }: MenuItemProps) {
  return (
    <button
      onClick={onNavigate}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-700 transition-colors min-h-[88px] focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${item.color}15` }} // 15 = ~8% opacity hex
      >
        <item.icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={2} />
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight line-clamp-2">
        {item.label}
      </span>
    </button>
  );
}
