'use client';

import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

interface SuperButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function SuperButton({ onClick, isOpen }: SuperButtonProps) {
  const handleClick = () => {
    haptic('medium');
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative -top-6 flex items-center justify-center',
        'w-16 h-16 rounded-full',
        'shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50',
        'transition-all duration-300 ease-in-out',
        'active:scale-90',
        'focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800',
        isOpen
          ? 'bg-gray-800 dark:bg-gray-200 rotate-45'
          : 'bg-gradient-to-br from-[#1E40AF] to-[#3B82F6]'
      )}
      aria-label={isOpen ? 'Tutup menu' : 'Buka menu utama'}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <X className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
      ) : (
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      )}
    </button>
  );
}
