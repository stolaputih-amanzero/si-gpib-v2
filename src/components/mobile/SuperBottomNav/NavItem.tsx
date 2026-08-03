'use client';

import Link from 'next/link';
import { NavItemConfig } from '@/lib/constants/navigation';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

interface NavItemProps extends NavItemConfig {
  isActive: boolean;
}

export function NavItem({ icon: Icon, label, href, isActive }: NavItemProps) {
  const handleClick = () => {
    haptic('light');
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center justify-center flex-1',
        'min-w-[64px] min-h-[48px]',              // ≥ 44px touch target (Apple HIG)
        'rounded-xl transition-colors',
        'active:scale-95 active:bg-gray-100 dark:active:bg-gray-800',
        isActive ? 'text-[#1E40AF] dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
      <span className={cn(
        'text-[11px] mt-1 leading-tight',
        isActive ? 'font-semibold' : 'font-medium'
      )}>
        {label}
      </span>
      {isActive && (
        <div className="w-1 h-1 rounded-full bg-[#1E40AF] dark:bg-blue-400 mt-0.5" />
      )}
    </Link>
  );
}
