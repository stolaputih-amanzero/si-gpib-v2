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
          'inline-flex items-center gap-1.5 p-1 pl-3 rounded-xl bg-surface-sunken hover:bg-emerald-500/10 text-ink-primary border border-line-subtle hover:border-emerald-500/30 transition-all min-h-[48px] text-xs sm:text-sm font-medium',
          className
        )}
      >
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 flex-1 min-w-0 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          title={`Hubungi via WhatsApp (${value})`}
        >
          <Icon size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate max-w-[180px] sm:max-w-[240px] font-mono">{value}</span>
          <ExternalLink size={12} className="shrink-0 text-emerald-600 opacity-75" />
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="p-2 rounded-lg text-ink-tertiary hover:text-emerald-600 hover:bg-surface-elevated transition-colors shrink-0"
          title="Salin Nomor Telepon"
        >
          {copied ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
        </button>
      </div>
    );
  }

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
