export interface ShareData {
  title: string;
  text: string;
  url?: string;
  imageUrl?: string | null;
}

/**
 * Fetch image URL and convert to File object for native Web Share API
 */
async function fetchImageAsFile(imageUrl: string, filename = 'foto-pos-pelkes.jpg'): Promise<File | null> {
  try {
    const res = await fetch(imageUrl, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    const mimeType = blob.type || 'image/jpeg';
    return new File([blob], filename, { type: mimeType });
  } catch (err) {
    console.warn('Failed to fetch image for share attachment:', err);
    return null;
  }
}

/**
 * Membagikan data ke WhatsApp.
 * Mengirim berkas foto profil bersanding dengan text keterangan terpadu (Native Share Sheet), fallback ke wa.me link.
 * @returns boolean - true jika berhasil/di-trigger, false jika user membatalkan (AbortError)
 */
export async function shareToWhatsApp(data: ShareData): Promise<boolean> {
  // Format pesan dengan styling WhatsApp (bold menggunakan *)
  const hasUrlInText = data.url && data.text.includes(data.url);
  const urlSuffix = data.url && !hasUrlInText ? `\n\nTautan: ${data.url}` : '';
  const message = data.text.startsWith('*PROFIL') || data.text.startsWith('*LAPORAN')
    ? `${data.text}${urlSuffix}\n\n_Dibagikan dari SI GPIB v2.2_`
    : `*${data.title}*\n\n${data.text}${urlSuffix}\n\n_Dibagikan dari SI GPIB v2.2_`;

  // 1. Coba Web Share API dengan Berkas Foto + Teks Keterangan (Caption)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      let imageFile: File | null = null;
      if (data.imageUrl) {
        imageFile = await fetchImageAsFile(data.imageUrl);
      }

      if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          title: data.title,
          text: message,
          files: [imageFile],
        });
        return true;
      }
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        return false;
      }
    }
  }

  // 2. Direct WhatsApp Link dengan format teks utuh
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  if (typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }
  return true;
}
