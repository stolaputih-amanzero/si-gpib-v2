import { z } from 'zod';

export const HARI_OPTIONS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

export const JENIS_IBADAH_OPTIONS = [
  'Ibadah Hari Minggu',
  'Ibadah Rumah Tangga / Sektor',
  'Ibadah Pelkat PA',
  'Ibadah Pelkat PT',
  'Ibadah Pelkat GP',
  'Ibadah Pelkat PKP',
  'Ibadah Pelkat PKB',
  'Ibadah Pelkat PKLU',
  'Doa Pagi / Doa Fajar',
  'Ibadah Ucapan Syukur',
] as const;

export const jadwalSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  jenis: z.string().min(2, 'Jenis ibadah wajib diisi').max(100),
  hari: z.enum(HARI_OPTIONS, {
    message: 'Pilih hari ibadah yang valid',
  }),
  jam: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/, 'Format jam harus HH:mm (contoh: 09:00 atau 17:30)'),
  keterangan: z.string().max(500, 'Maksimal 500 karakter').optional().nullable(),
});

export type JadwalInput = z.infer<typeof jadwalSchema>;
