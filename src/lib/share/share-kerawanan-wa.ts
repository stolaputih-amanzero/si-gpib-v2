import { shareToWhatsApp } from './share-to-whatsapp';

function getFullPhotoUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!supabaseUrl) return path;

  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  if (cleanPath.startsWith('storage/v1/object/public/')) {
    return `${supabaseUrl}/${cleanPath}`;
  }
  return `${supabaseUrl}/storage/v1/object/public/assets-images/${cleanPath}`;
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

export function generateKerawananWaText(item: any): string {
  const firstPhoto = (item.lampiran || []).find((f: any) =>
    f.tipe_file?.startsWith('image/') || f.file_path?.match(/\.(jpg|jpeg|png|webp)$/i)
  );
  const fullPhotoUrl = getFullPhotoUrl(firstPhoto?.file_path);

  const posName = item.pos?.nama_pos || item.id_pos || '-';
  const jemaatName = item.pos?.jemaat_induk || item.pos?.jemaat?.nama_induk || '-';
  const mupelName = item.pos?.mupel || item.pos?.jemaat?.id_mupel || '-';

  const isDirectJemaat =
    posName.toLowerCase().startsWith('jemaat ') ||
    (jemaatName && posName === jemaatName) ||
    posName === 'Pelayanan Jemaat Direct' ||
    posName === '-';

  const displayPosNama = isDirectJemaat ? null : posName;
  const posKategori = item.pos?.kategori || 'Pos Pelkes';
  const isBajem = posKategori.toLowerCase().includes('bajem') || (displayPosNama || '').toLowerCase().includes('bajem');
  const posLabelHeader = isBajem ? 'Bajem' : 'Pos Pelkes';

  const mainLocationTitle = displayPosNama
    ? `*${displayPosNama.toUpperCase()}* (${posLabelHeader})`
    : `*${(item.jenis_risiko || 'KERAWANAN WILAYAH').toUpperCase()}*`;

  const updatedAtStr = formatDateTimeIndonesian(item.updated_at || item.created_at);
  const updatedByStr = item.updated_by || 'Pengguna System';

  const lines: string[] = [
    `*ANALISIS KERAWANAN WILAYAH GPIB*`,
  ];

  // Primary URL placed FIRST so WhatsApp unfurls image thumbnail preview immediately
  if (fullPhotoUrl) {
    lines.push(`*Foto Utama*: ${fullPhotoUrl}`);
  }

  lines.push(
    ``,
    mainLocationTitle,
    `_${jemaatName} - ${mupelName}_`,
    ``,
    `*RINCIAN KERAWANAN*`,
    `- Kategori Risiko: ${item.kategori || '-'}`,
    `- Jenis Risiko / Ancaman: ${item.jenis_risiko || '-'}`,
    `- Tingkat Frekuensi: ${item.frekuensi || 'Sedang'}`
  );

  if (item.keterangan) {
    lines.push(``);
    lines.push(`*KETERANGAN TAMBAHAN*`);
    lines.push(`- Catatan & Mitigasi: ${item.keterangan}`);
  }

  const lat = item.latitude ?? item.pos?.latitude ?? null;
  const lng = item.longitude ?? item.pos?.longitude ?? null;

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

export async function shareKerawananWA(item: any): Promise<boolean> {
  const text = generateKerawananWaText(item);
  const title = `Kerawanan Wilayah: ${item.jenis_risiko || 'GPIB'}`;
  
  return await shareToWhatsApp({
    title,
    text,
  });
}
