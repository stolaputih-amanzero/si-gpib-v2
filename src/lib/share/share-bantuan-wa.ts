import { shareToWhatsApp } from './share-to-whatsapp';

export interface ShareBantuanProps {
  id_ajuan: string;
  jenis_bantuan: string;
  id_pos: string;
  nama_pos?: string;
  nama_induk?: string;
  biaya: number;
  urgensi: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
  status: string;
  keterangan?: string | null;
  no_wa_tujuan?: string;
}

export function generateBantuanWaText(item: ShareBantuanProps): string {
  const formatRupiah = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const posName = item.nama_pos || item.id_pos;
  const jemaatName = item.nama_induk ? ` (${item.nama_induk})` : '';

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pospelkes-gpib.vercel.app';
  const detailUrl = `${originUrl}/bantuan/${item.id_ajuan}`;

  const lines: string[] = [
    `*🔔 NOTIFIKASI PENGAJUAN BANTUAN GPIB*`,
    ``,
    `*ID Pengajuan*: \`${item.id_ajuan}\``,
    `*Pos Pelkes*: ${posName}${jemaatName}`,
    `*Jenis Bantuan*: ${item.jenis_bantuan}`,
    `*Estimasi Biaya*: ${formatRupiah(item.biaya)}`,
    `*Tingkat Urgensi*: *${item.urgensi.toUpperCase()}*`,
    `*Status Saat Ini*: ${item.status}`,
  ];

  if (item.keterangan) {
    lines.push(``, `*Keterangan*:`, item.keterangan);
  }

  lines.push(``, `*Detail & Persetujuan Workflow*:`, detailUrl);

  return lines.join('\n');
}

/**
 * Memicu pengiriman Notifikasi Pengajuan Bantuan via Web Share API atau Direct WA Link.
 */
export async function shareBantuanWA(item: ShareBantuanProps): Promise<boolean> {
  const text = generateBantuanWaText(item);
  const title = `Notifikasi Bantuan: ${item.jenis_bantuan}`;

  return await shareToWhatsApp({
    title,
    text,
    url: typeof window !== 'undefined' ? `${window.location.origin}/bantuan/${item.id_ajuan}` : undefined,
  });
}
