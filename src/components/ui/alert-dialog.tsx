'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>
  );
}

export function AlertDialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2 text-left">{children}</div>;
}

export function AlertDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-semibold text-slate-900 dark:text-slate-100", className)}>{children}</h2>;
}

export function AlertDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-base text-slate-600 dark:text-slate-400 leading-relaxed", className)}>{children}</p>;
}

export function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">{children}</div>;
}

export function AlertDialogCancel({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-12 px-5 rounded-xl font-medium border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors text-base flex items-center justify-center min-h-[48px]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function AlertDialogAction({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-12 px-5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white transition-colors text-base flex items-center justify-center min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
