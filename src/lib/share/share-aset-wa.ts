import { shareToWhatsApp } from './share-to-whatsapp';

export function getFullPhotoUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
}

function formatDateTimeIndonesian(dateString?: string | null) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  } catch {
    return dateString;
  }
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
      : null;

  const posKategori = item.raw?.pos?.kategori || 'Pos Pelkes';
  const isBajem = posKategori.toLowerCase().includes('bajem') || (displayPosNama || '').toLowerCase().includes('bajem');
  const posLabelHeader = isBajem ? 'Bajem' : 'Pos Pelkes';

  const jemaatNama = item.jemaat_induk || item.raw?.pos?.jemaat_induk?.nama_induk || '-';
  const mupelNama = item.mupel_nama || item.raw?.pos?.jemaat_induk?.mupel?.nama_mupel || '-';

  const mainLocationTitle = displayPosNama
    ? `*${displayPosNama.toUpperCase()}* (${posLabelHeader})`
    : `*${(item.judul || 'ASET GPIB').toUpperCase()}*`;

  const kondisiVal = item.kondisi || item.raw?.kondisi || 'Baik';
  const updatedAtStr = formatDateTimeIndonesian(item.updated_at || item.raw?.updated_at || item.raw?.created_at);
  const updatedByStr = item.updated_by || item.raw?.updated_by || 'Admin Aset';

  const lines: string[] = [
    `*INVENTARIS ASET GPIB*`,
  ];

  // Primary URL placed FIRST so WhatsApp unfurls image thumbnail preview immediately
  if (fullPhotoUrl) {
    lines.push(`*Foto Utama*: ${fullPhotoUrl}`);
  }

  lines.push(
    ``,
    mainLocationTitle,
    `_${jemaatNama} - ${mupelNama}_`,
    ``,
    `*RINCIAN ASET*`,
    `- Judul Aset: ${item.judul || '-'}`,
    `- Kategori: ${categoryLabel}`,
    ``,
    `*SPESIFIKASI ASET*`
  );

  if (isTanah) {
    lines.push(`- Luas Lahan: ${item.raw?.luas_m2 || '-'} m²`);
    lines.push(`- Kondisi Lahan: ${kondisiVal}`);
    lines.push(`- Tahun Perolehan: ${item.tahun || '-'}`);
    lines.push(`- Status Hukum: ${item.raw?.status_hukum || '-'}`);
    if (item.raw?.potensi_sda) lines.push(`- Potensi SDA: ${item.raw.potensi_sda}`);
  } else if (isBangunan) {
    lines.push(`- Nama Bangunan: ${item.raw?.nama_bangunan || item.judul || '-'}`);
    lines.push(`- Fungsi Utama: ${item.raw?.fungsi || '-'}`);
    lines.push(`- Kondisi Bangunan: ${kondisiVal}`);
    lines.push(`- Tahun Berdiri: ${item.tahun || '-'}`);
  } else if (isBergerak) {
    lines.push(`- Jenis Aset: ${item.raw?.jenis || '-'}`);
    lines.push(`- Merk / Tipe: ${item.raw?.merk_tipe || '-'}`);
    lines.push(`- Kondisi Aset: ${kondisiVal}`);
    lines.push(`- Tahun Perolehan: ${item.tahun || '-'}`);
    if (item.raw?.no_polisi) lines.push(`- Nomor Polisi: ${item.raw.no_polisi}`);
    if (item.raw?.tgl_pajak) lines.push(`- Jatuh Tempo Pajak: ${item.raw.tgl_pajak}`);
  }

  if (item.keterangan) {
    lines.push(``);
    lines.push(`*KETERANGAN TAMBAHAN*`);
    lines.push(`- Catatan: ${item.keterangan}`);
  }

  const lat = item.latitude ?? item.raw?.latitude ?? item.raw?.pos?.latitude ?? null;
  const lng = item.longitude ?? item.raw?.longitude ?? item.raw?.pos?.longitude ?? null;

  lines.push(``);
  lines.push(`*LOKASI & GOOGLE MAPS*`);
  if (lat != null && lng != null) {
    // GPS location strictly without https:// so WA does not unfurl maps over the photo preview
    lines.push(`maps.google.com/?q=${lat},${lng}`);
  } else {
    lines.push(`-`);
  }

  lines.push(``);
  lines.push(`Tanggal Update: ${updatedAtStr}`);
  lines.push(`Diperbarui Oleh: ${updatedByStr}`);

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
