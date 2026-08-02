'use client';

import React from 'react';
import { UserX } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GracefulFallbackProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  message?: string;
  className?: string;
}

export function GracefulFallback({
  icon: Icon = UserX,
  title = 'Akun Non-Pendeta',
  message = 'Akun ini tidak terhubung dengan data pendeta. Section pelayanan, mutasi, dan dimensi keluarga tidak tersedia untuk peran ini.',
  className,
}: GracefulFallbackProps) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-surface-1 border border-border-subtle text-center space-y-2.5 shadow-2xs max-w-lg mx-auto my-4',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-surface-sunken text-text-tertiary flex items-center justify-center mx-auto shadow-2xs border border-border-subtle">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-text-high">{title}</h3>
        <p className="text-xs text-text-muted leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

export default GracefulFallback;
