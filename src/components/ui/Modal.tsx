'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'md',
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container: Bottom Sheet on Mobile, Centered Dialog on Desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        className={cn(
          'relative w-full bg-surface-elevated shadow-heavy border border-border-subtle overflow-hidden transition-all',
          /* Mobile styles: Bottom Sheet */
          'rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up',
          /* Desktop styles: Centered Modal */
          'sm:rounded-2xl sm:max-h-[85vh] sm:animate-scale-in',
          maxWidthClasses,
          className
        )}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-border-strong/40 rounded-full" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between px-5 pt-3 sm:pt-5 pb-3 border-b border-border-subtle shrink-0">
            <div className="pr-4">
              {title && (
                <h2 id="modal-title" className="font-serif font-bold text-lg text-text-high">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="text-xs text-text-muted mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-text-muted hover:text-text-high hover:bg-surface-sunken active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Tutup Dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
