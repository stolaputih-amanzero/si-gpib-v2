'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  children,
  error,
  hint,
  required,
  icon,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      <label className="text-sm font-semibold text-text-high flex items-center justify-between">
        <span className="flex items-center gap-2">
          {icon && <span className="text-brand-primary shrink-0">{icon}</span>}
          <span>
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </span>
        </span>
      </label>

      <div className="w-full">{children}</div>

      {hint && !error && <p className="text-xs text-text-muted mt-1 leading-normal">{hint}</p>}
      {error && <p className="text-xs font-bold text-red-500 mt-1 leading-normal animate-shake">{error}</p>}
    </div>
  );
}

export default FormField;
