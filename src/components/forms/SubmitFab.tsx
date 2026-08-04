'use client';

import React from 'react';
import { Send, Clock, Loader2, AlertCircle } from 'lucide-react';
import { haptic } from '@/lib/haptic/vibrate';
import { cn } from '@/lib/utils';

export interface SubmitFabProps {
  label?: string;
  icon?: React.ReactNode;
  onSubmit?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  isSubmitting?: boolean;
  isOffline?: boolean;
  hasError?: boolean;
  className?: string;
}

export function SubmitFab({
  label = 'Catat Kunjungan',
  icon = <Send size={18} />,
  onSubmit,
  isSubmitting = false,
  isOffline = false,
  hasError = false,
  className,
}: SubmitFabProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isSubmitting) return;

    if (hasError) {
      haptic.error();
    } else {
      haptic.medium();
    }

    // Only call onSubmit prop if button is not naturally submitting a parent form
    const form = e.currentTarget.closest('form');
    if (!form && onSubmit) {
      onSubmit(e);
    }
  };

  if (hasError) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-30 max-w-xl mx-auto">
        <button
          type="submit"
          data-testid="button-submit"
          onClick={handleClick}
          className={cn(
            'w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all min-h-[44px] cursor-pointer',
            className
          )}
        >
          <AlertCircle size={18} />
          <span>Gagal Menyimpan — Coba Lagi</span>
        </button>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-30 max-w-xl mx-auto">
        <button
          type="button"
          data-testid="button-submit"
          disabled
          aria-disabled="true"
          className={cn(
            'w-full h-14 rounded-2xl bg-brand-primary text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg opacity-80 cursor-not-allowed min-h-[44px]',
            className
          )}
        >
          <Loader2 size={18} className="animate-spin" />
          <span>Mengirim Log Pastoral...</span>
        </button>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-30 max-w-xl mx-auto">
        <button
          type="submit"
          data-testid="button-submit"
          onClick={handleClick}
          className={cn(
            'w-full h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all min-h-[44px] cursor-pointer',
            className
          )}
        >
          <Clock size={18} />
          <span>Simpan & Kirim Nanti (Offline)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 max-w-xl mx-auto">
      <button
        type="submit"
        data-testid="button-submit"
        onClick={handleClick}
        className={cn(
          'w-full h-14 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all min-h-[44px] cursor-pointer',
          className
        )}
      >
        {icon}
        <span>{label}</span>
      </button>
    </div>
  );
}

export default SubmitFab;
