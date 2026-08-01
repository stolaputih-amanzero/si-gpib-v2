'use client';

import { useState } from 'react';
import { LucideIcon, Check, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { cn, formatWhatsAppUrl } from '@/lib/utils';

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

  const isPhone =
    label?.toLowerCase().includes('telepon') ||
    label?.toLowerCase().includes('wa') ||
    label?.toLowerCase().includes('phone') ||
    label?.toLowerCase().includes('hp') ||
    (value.replace(/\D/g, '').length >= 8 && !value.includes('@'));

  const waUrl = isPhone ? formatWhatsAppUrl(value) : null;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Berhasil Disalin', `${label || 'Kontak'} "${value}" telah disalin ke clipboard.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal Menyalin', 'Perangkat tidak mendukung penyalinan otomatis.');
    }
  };

  if (waUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-2 p-1.5 pl-3 rounded-xl bg-surface-sunken hover:bg-emerald-500/10 text-ink-primary border border-line-subtle hover:border-emerald-500/30 transition-all min-h-[44px] text-xs sm:text-sm font-medium w-full sm:w-auto',
          className
        )}
      >
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 min-w-0 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex-1"
          title={`Hubungi via WhatsApp (${value})`}
        >
          <Icon size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate font-mono">{value}</span>
          <ExternalLink size={12} className="shrink-0 text-emerald-600 opacity-75" />
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-surface-1 transition-colors shrink-0"
          title="Salin Nomor Telepon"
        >
          {copied ? <Check size={15} className="text-ok" /> : <Copy size={15} />}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'group flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-surface-sunken hover:bg-surface-brand text-ink-primary hover:text-brand-600 border border-line-subtle transition-all tap min-h-[44px] text-xs sm:text-sm font-medium w-full sm:w-auto',
        className
      )}
      title={`Ketuk untuk menyalin ${value}`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Icon size={16} className="text-brand-600 dark:text-brand-400 shrink-0 transition-colors" />
        <span className="truncate font-mono">{value}</span>
      </div>
      {copied ? (
        <Check size={15} className="text-ok shrink-0 animate-pop ml-2" />
      ) : (
        <Copy size={15} className="text-ink-secondary group-hover:text-brand-600 dark:text-ink-secondary shrink-0 ml-2 transition-colors" />
      )}
    </button>
  );
}
