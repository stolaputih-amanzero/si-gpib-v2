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

export function generatePotensiWaText(item: any): string {
  const firstPhoto = (item.lampiran || []).find((f: any) =>
    f.tipe_file?.startsWith('image/') || f.file_path?.match(/\.(jpg|jpeg|png|webp)$/i)
  );
  const fullPhotoUrl = getFullPhotoUrl(firstPhoto?.file_path);

  const posName = item.pos?.nama_pos || item.id_pos || '-';
  const jemaatName = item.pos?.jemaat_induk || '-';
  const mupelName = item.pos?.mupel || '-';

  const isDirectJemaat =
    posName.toLowerCase().startsWith('jemaat ') ||
    (jemaatName && posName === jemaatName) ||
    posName === 'Pelayanan Jemaat Direct' ||
    posName === '-';

  const displayPosNama = isDirectJemaat ? '-' : posName;

  const updatedAtStr = formatDateTimeIndonesian(item.updated_at || item.created_at);
  const updatedByStr = item.updated_by || 'Pengguna System';

  const lines: string[] = [
    `*ANALISIS POTENSI WILAYAH GPIB*`,
  ];

  // Primary URL placed FIRST so WhatsApp unfurls image thumbnail preview immediately
  if (fullPhotoUrl) {
    lines.push(`*Foto Utama*: ${fullPhotoUrl}`);
  }

  lines.push(
    ``,
    `*Nama Potensi*: ${item.nama_potensi || '-'}`,
    `*Kategori Potensi*: ${item.kategori || '-'}`,
    `*Deskripsi*: ${item.deskripsi || '-'}`,
    ``,
    `*HIERARKI & WILAYAH*`,
    `• Mupel: ${mupelName}`,
    `• Jemaat Induk: ${jemaatName}`,
    `• Pos Pelkes: ${displayPosNama}`
  );

  if (item.keterangan) {
    lines.push(``);
    lines.push(`*Keterangan Tambahan*: ${item.keterangan}`);
  }

  const lat = item.latitude ?? item.pos?.latitude ?? null;
  const lng = item.longitude ?? item.pos?.longitude ?? null;

  lines.push(``);
  if (lat != null && lng != null) {
    // GPS location strictly without https:// so WA does not unfurl maps over the photo preview
    lines.push(`*Lokasi GPS*: maps.google.com/?q=${lat},${lng}`);
  } else {
    lines.push(`*Lokasi GPS*: -`);
  }

  lines.push(``);
  lines.push(`*Terakhir Diperbarui*: ${updatedAtStr}`);
  lines.push(`*Diperbarui Oleh*: ${updatedByStr}`);

  return lines.join('\n');
}

export async function sharePotensiWA(item: any): Promise<boolean> {
  const text = generatePotensiWaText(item);
  const title = `Potensi Wilayah: ${item.nama_potensi || 'GPIB'}`;
  
  return await shareToWhatsApp({
    title,
    text,
  });
}
