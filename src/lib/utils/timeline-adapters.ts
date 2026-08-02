import { TimelineEvent } from '@/components/profile/VerticalTimeline';

export function mapMutasiToTimeline(mutasiList: any[] = []): TimelineEvent[] {
  return mutasiList.map((m) => {
    let variant: 'default' | 'kmj' | 'pj' | 'mutasi' = 'mutasi';
    const jenis = (m.jenis_mutasi || '').toUpperCase();
    if (jenis.includes('KMJ')) variant = 'kmj';
    else if (jenis.includes('PJ')) variant = 'pj';

    return {
      id: m.id_riwayat || m.id || String(Math.random()),
      date: m.tgl_mutasi || m.created_at,
      title: m.jabatan_baru ? `${m.jenis_mutasi || 'Mutasi'} — ${m.jabatan_baru}` : (m.jenis_mutasi || 'Mutasi Pelayanan'),
      subtitle: m.alasan || (m.id_induk_baru ? `Ditugaskan ke Jemaat Induk ${m.id_induk_baru}` : undefined),
      badge: {
        label: m.jenis_mutasi || 'MUTASI',
        variant,
      },
      href: m.id_induk_baru ? `/jemaat/${encodeURIComponent(m.id_induk_baru)}` : undefined,
    };
  });
}

export function mapKeterlibatanToTimeline(keterlibatanList: any[] = []): TimelineEvent[] {
  return keterlibatanList.map((k) => {
    const tingkat = (k.tingkat || 'Sinodal').toUpperCase();
    let variant: 'default' | 'kmj' | 'pj' | 'mutasi' | 'sinodal' | 'mupel' = 'sinodal';
    if (tingkat.includes('MUPEL')) variant = 'mupel';

    return {
      id: k.id_keterlibatan || k.id || String(Math.random()),
      date: k.tgl_mulai || k.created_at,
      title: k.nama_kegiatan || k.jabatan || 'Keterlibatan Pelayanan',
      subtitle: k.peran ? `Peran: ${k.peran}` : k.keterangan,
      badge: {
        label: k.tingkat || 'SINODAL',
        variant,
      },
      href: k.id_mupel ? `/mupel/${encodeURIComponent(k.id_mupel)}` : undefined,
    };
  });
}
