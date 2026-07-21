'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastContextType {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
  confirm: (options: Omit<ConfirmDialogState, 'isOpen'>) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = React.useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const addToast = React.useCallback((type: ToastType, title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, type, title, description, duration: 4000 };

    setToasts((prev) => [...prev.slice(-4), newToast]); // max 5 toasts

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = React.useCallback((options: Omit<ConfirmDialogState, 'isOpen'>) => {
    setConfirmDialog({
      ...options,
      isOpen: true,
    });
  }, []);

  const handleConfirmAction = async () => {
    try {
      await confirmDialog.onConfirm();
    } finally {
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleCancelAction = () => {
    if (confirmDialog.onCancel) {
      confirmDialog.onCancel();
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const toastHelpers = React.useMemo(
    () => ({
      success: (title: string, description?: string) => addToast('success', title, description),
      error: (title: string, description?: string) => addToast('error', title, description),
      warning: (title: string, description?: string) => addToast('warning', title, description),
      info: (title: string, description?: string) => addToast('info', title, description),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: toastHelpers, confirm: showConfirm }}>
      {children}

      {/* Toasts Container */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 pointer-events-none flex flex-col gap-2 pt-safe">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-heavy backdrop-blur-md border transition-all animate-slide-up',
              t.type === 'success' && 'bg-surface-elevated/95 border-emerald-500/30 text-text-high',
              t.type === 'error' && 'bg-surface-elevated/95 border-rose-500/30 text-text-high',
              t.type === 'warning' && 'bg-surface-elevated/95 border-amber-500/30 text-text-high',
              t.type === 'info' && 'bg-surface-elevated/95 border-blue-500/30 text-text-high'
            )}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold leading-snug">{t.title}</h4>
              {t.description && (
                <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{t.description}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg text-text-muted hover:text-text-high hover:bg-surface-sunken shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-surface-elevated rounded-3xl p-5 shadow-heavy border border-border-subtle animate-scale-in text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6 stroke-[2.2px]" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-text-high">{confirmDialog.title}</h3>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{confirmDialog.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelAction}
                className="px-4 py-2.5 rounded-xl border border-border-strong text-text-high font-semibold text-xs hover:bg-surface-sunken min-h-[44px] active:scale-95 transition-all"
              >
                {confirmDialog.cancelText || 'Batal'}
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={cn(
                  'px-4 py-2.5 rounded-xl font-bold text-xs text-white min-h-[44px] active:scale-95 transition-all shadow-soft',
                  confirmDialog.variant === 'primary' ? 'bg-brand-primary hover:bg-brand-primary-dark' : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {confirmDialog.confirmText || 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
