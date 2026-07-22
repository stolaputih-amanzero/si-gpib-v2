'use client';

import { Share2 } from 'lucide-react';
import { shareToWhatsApp } from '@/lib/share/share-to-whatsapp';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  imageUrl?: string | null;
  className?: string;
  variant?: 'primary' | 'ghost' | 'outline';
  iconOnly?: boolean;
}

export function ShareButton({ 
  title, 
  text, 
  url, 
  imageUrl,
  className = '',
  variant = 'primary',
  iconOnly = false,
}: ShareButtonProps) {
  
  const handleShare = async () => {
    const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : undefined);

    // Haptic feedback saat ditekan
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light tap
    }

    const success = await shareToWhatsApp({ title, text, url: targetUrl, imageUrl });
    
    if (success && typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]); // Success pattern
    }
  };

  const baseStyles = "min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 rounded-xl px-3.5 text-xs font-semibold active:scale-95 transition-all shadow-soft";
  
  const variantStyles = variant === 'primary' 
    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
    : variant === 'ghost'
    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100"
    : "bg-surface-sunken text-text-high border border-border-subtle hover:bg-surface-hover";

  return (
    <button
      onClick={handleShare}
      className={`${baseStyles} ${variantStyles} ${className}`}
      aria-label="Bagikan ke WhatsApp"
      type="button"
    >
      <Share2 className="w-4 h-4 shrink-0" />
      {!iconOnly && <span>Bagikan WA</span>}
    </button>
  );
}
