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
        'flex flex-col items-center justify-center flex-1 py-1',
        'min-w-[56px] min-h-[48px]',
        'rounded-xl transition-colors',
        'active:scale-95',
        isActive ? 'text-blue-500 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
      )}
      aria-label={`Navigasi ke ${label}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
      <span className="text-[11px] mt-1 leading-none whitespace-nowrap tracking-tight">
        {label}
      </span>
    </Link>
  );
}
