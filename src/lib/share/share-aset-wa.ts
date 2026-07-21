import { shareToWhatsApp } from './share-to-whatsapp';

export function getFullPhotoUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
}

export function generateAsetWaText(item: any): string {
  const isTanah = item.kategori === 'TANAH';
  const isBangunan = item.kategori === 'BANGUNAN';
  const isBergerak = item.kategori === 'BERGERAK';

  const categoryLabel = isTanah ? 'Tanah / Lahan' : isBangunan ? 'Bangunan / Gedung' : 'Aset Bergerak';
  const fullPhotoUrl = getFullPhotoUrl(item.thumbnail_url);

  const displayPosNama =
    item.pos_nama &&
    !item.pos_nama.toLowerCase().startsWith('jemaat ') &&
    item.pos_nama !== item.jemaat_induk &&
    item.pos_nama !== 'Pelayanan Jemaat Direct' &&
    item.pos_nama !== '-'
      ? item.pos_nama
      : '-';

  const kondisiVal = item.kondisi || item.raw?.kondisi || 'Baik';

  const lines: string[] = [
    `📦 *INVENTARIS ASET GPIB*`,
    `----------------------------------------`,
    `📌 *Kategori*: ${categoryLabel}`,
    `🏷️ *Judul Aset*: ${item.judul || '-'}`,
    ``,
    `🏛️ *HIERARKI & WILAYAH*`,
    `• Mupel: ${item.mupel_nama || item.raw?.pos?.jemaat_induk?.mupel?.nama_mupel || '-'}`,
    `• Jemaat Induk: ${item.jemaat_induk || item.raw?.pos?.jemaat_induk?.nama_induk || '-'}`,
    `• Pos Pelkes: ${displayPosNama}`,
    ``,
    `📑 *SPESIFIKASI ASET*`,
  ];

  if (isTanah) {
    lines.push(`• Luas Lahan: ${item.raw?.luas_m2 || '-'} m²`);
    lines.push(`• Kondisi Lahan: ${kondisiVal}`);
    lines.push(`• Tahun Perolehan: ${item.tahun || '-'}`);
    lines.push(`• Status Hukum: ${item.raw?.status_hukum || '-'}`);
    if (item.raw?.potensi_sda) lines.push(`• Potensi SDA: ${item.raw.potensi_sda}`);
  } else if (isBangunan) {
    lines.push(`• Nama Bangunan: ${item.raw?.nama_bangunan || item.judul || '-'}`);
    lines.push(`• Fungsi Utama: ${item.raw?.fungsi || '-'}`);
    lines.push(`• Kondisi Bangunan: ${kondisiVal}`);
    lines.push(`• Tahun Berdiri: ${item.tahun || '-'}`);
  } else if (isBergerak) {
    lines.push(`• Jenis Aset: ${item.raw?.jenis || '-'}`);
    lines.push(`• Merk / Tipe: ${item.raw?.merk_tipe || '-'}`);
    lines.push(`• Kondisi Aset: ${kondisiVal}`);
    lines.push(`• Tahun Perolehan: ${item.tahun || '-'}`);
    if (item.raw?.no_polisi) lines.push(`• Nomor Polisi: ${item.raw.no_polisi}`);
    if (item.raw?.tgl_pajak) lines.push(`• Jatuh Tempo Pajak: ${item.raw.tgl_pajak}`);
  }

  if (item.keterangan) {
    lines.push(``);
    lines.push(`📝 *Keterangan*: ${item.keterangan}`);
  }

  const lat = item.latitude ?? item.raw?.latitude ?? item.raw?.pos?.latitude ?? null;
  const lng = item.longitude ?? item.raw?.longitude ?? item.raw?.pos?.longitude ?? null;

  lines.push(``);
  if (lat != null && lng != null) {
    // GPS location strictly without https:// so WA does not unfurl maps over the photo preview
    lines.push(`📍 *Lokasi GPS*: maps.google.com/?q=${lat},${lng}`);
  } else {
    lines.push(`📍 *Lokasi GPS*: -`);
  }

  if (fullPhotoUrl) {
    lines.push(``);
    lines.push(`📷 *Foto Utama*: ${fullPhotoUrl}`);
  }

  return lines.join('\n');
}

export async function shareAsetWA(item: any): Promise<boolean> {
  const text = generateAsetWaText(item);
  const title = `Inventaris Aset: ${item.judul || 'GPIB'}`;
  
  return await shareToWhatsApp({
    title,
    text,
  });
}
