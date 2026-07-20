import { z } from 'zod';

export const asetTanahSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  luas_m2: z.coerce.number().min(1, 'Luas tanah minimal 1 m2'),
  thn_perolehan: z.coerce.number().min(1900, 'Tahun tidak valid').max(new Date().getFullYear(), 'Tahun tidak boleh lebih dari tahun saat ini'),
  status_hukum: z.string().min(1, 'Status hukum wajib diisi'),
  kondisi: z.enum(['Baik', 'Rusak Ringan', 'Rusak Berat']),
  lokasi_lat: z.coerce.number().optional().nullable(),
  lokasi_lng: z.coerce.number().optional().nullable(),
  foto: z.any().optional(), // File object
});

export const asetBangunanSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  luas_m2: z.coerce.number().min(1, 'Luas bangunan minimal 1 m2'),
  thn_dibangun: z.coerce.number().min(1900, 'Tahun tidak valid').max(new Date().getFullYear(), 'Tahun tidak boleh lebih dari tahun saat ini'),
  kondisi: z.enum(['Baik', 'Rusak Ringan', 'Rusak Berat']),
  lokasi_lat: z.coerce.number().optional().nullable(),
  lokasi_lng: z.coerce.number().optional().nullable(),
  foto: z.any().optional(), // File object
});

export const asetBergerakSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  nama_barang: z.string().min(3, 'Nama barang minimal 3 karakter'),
  merk_tipe: z.string().optional().nullable(),
  thn_perolehan: z.coerce.number().min(1900, 'Tahun tidak valid').max(new Date().getFullYear(), 'Tahun tidak boleh lebih dari tahun saat ini'),
  jumlah: z.coerce.number().min(1, 'Jumlah minimal 1'),
  kondisi: z.enum(['Baik', 'Rusak Ringan', 'Rusak Berat']),
  foto: z.any().optional(), // File object
});

// Digunakan jika membutuhkan validasi lampiran spesifik
export const lampiranAsetSchema = z.object({
  id_entitas: z.string().min(1),
  kategori_entitas: z.enum(['POS', 'TANAH', 'BANGUNAN', 'BERGERAK']),
  jenis_dokumen: z.string().min(1),
  file_path: z.string().min(1),
});
