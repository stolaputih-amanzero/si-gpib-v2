export interface ShareData {
  title: string;
  text: string;
  url?: string;
}

/**
 * Membagikan data ke WhatsApp.
 * Memprioritaskan Web Share API (Native Share Sheet), fallback ke wa.me link.
 * @returns boolean - true jika berhasil/di-trigger, false jika user membatalkan (AbortError)
 */
export async function shareToWhatsApp(data: ShareData): Promise<boolean> {
  // Format pesan dengan styling WhatsApp (bold menggunakan *)
  const hasUrlInText = data.url && data.text.includes(data.url);
  const urlSuffix = data.url && !hasUrlInText ? `\n\n🔗 ${data.url}` : '';
  const message = `*${data.title}*\n\n${data.text}${urlSuffix}\n\n_Dibagikan dari SI GPIB v2.2_`;

  // 1. Coba Web Share API (Native di Mobile)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: message,
      });
      return true;
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        return false; // User membatalkan share, bukan error
      }
      // Jika error lain, lanjut ke fallback WhatsApp
      console.warn('Web Share API gagal, menggunakan fallback WhatsApp:', error);
    }
  }

  // 2. Fallback: WhatsApp Direct Link
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  
  // Buka di tab baru dengan security flags
  if (typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }
  
  return true;
}
