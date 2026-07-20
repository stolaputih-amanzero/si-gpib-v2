import { z } from 'zod';

export const URGENSI_OPTIONS = ['Rendah', 'Sedang', 'Tinggi', 'Kritis'] as const;
export type UrgensiType = typeof URGENSI_OPTIONS[number];

export const STATUS_PENGAJUAN = [
  'Draft',
  'Pending_KMJ',
  'Pending_Mupel',
  'Pending_Sinode',
  'Approved',
  'Rejected',
] as const;

export type StatusPengajuanType = typeof STATUS_PENGAJUAN[number];

export const pengajuanBantuanSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  jenis_bantuan: z.string().min(3, 'Jenis bantuan minimal 3 karakter').max(150),
  id_aset: z.string().optional().nullable(), // aset ID (tanah/bangunan/bergerak)
  kategori_aset: z.enum(['TANAH', 'BANGUNAN', 'BERGERAK']).optional().nullable(),
  biaya: z.number().min(0, 'Estimasi biaya tidak boleh negatif'),
  urgensi: z.enum(['Rendah', 'Sedang', 'Tinggi', 'Kritis'], {
    message: 'Pilih tingkat urgensi yang valid',
  }),
  keterangan: z.string().min(10, 'Keterangan minimal 10 karakter').max(1000),
});

export const approvalActionSchema = z.object({
  id_ajuan: z.string().min(1, 'ID Ajuan wajib ada'),
  aksi: z.enum(['approve', 'reject', 'revision'], {
    message: 'Aksi approval tidak valid',
  }),
  catatan: z.string().min(5, 'Catatan persetujuan/penolakan wajib diisi minimal 5 karakter').max(500),
});

export type PengajuanBantuanInput = z.infer<typeof pengajuanBantuanSchema>;
export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;

export interface BantuanFilter {
  id_pos?: string;
  status?: string;
  urgensi?: string;
  search?: string;
}
