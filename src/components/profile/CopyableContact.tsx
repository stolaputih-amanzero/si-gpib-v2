'use client';

import { useState } from 'react';
import { LucideIcon, Check, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface CopyableContactProps {
  icon: LucideIcon;
  value?: string | null;
  label?: string;
  className?: string;
}

export function CopyableContact({ icon: Icon, value, label, className }: CopyableContactProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Berhasil Disalin', `${label || 'Kontak'} "${value}" telah disalin ke clipboard.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal Menyalin', 'Perangkat tidak mendukung penyalinan otomatis.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-sunken hover:bg-surface-brand text-ink-primary hover:text-brand-600 border border-line-subtle transition-all tap min-h-[48px] text-xs sm:text-sm font-medium',
        className
      )}
      title={`Ketuk untuk menyalin ${value}`}
    >
      <Icon size={16} className="text-ink-tertiary group-hover:text-brand-600 shrink-0 transition-colors" />
      <span className="truncate max-w-[200px] sm:max-w-[280px] font-mono">{value}</span>
      {copied ? (
        <Check size={14} className="text-ok shrink-0 animate-pop ml-auto" />
      ) : (
        <Copy size={14} className="text-ink-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-auto" />
      )}
    </button>
  );
}
