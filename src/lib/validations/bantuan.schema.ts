import { z } from 'zod';

export const URGENSI_OPTIONS = ['Rendah', 'Sedang', 'Tinggi', 'Kritis'] as const;
export type UrgensiType = (typeof URGENSI_OPTIONS)[number];

export const pengajuanBantuanSchema = z
  .object({
    id_pos: z.string().min(1, 'Pos Pelkes / Bajem / Jemaat wajib dipilih'),
    jenis_bantuan: z
      .string()
      .min(3, 'Jenis permohonan bantuan minimal 3 karakter')
      .max(150, 'Jenis permohonan bantuan maksimal 150 karakter'),
    biaya: z
      .number()
      .positive('Estimasi biaya harus lebih dari 0')
      .max(999999999999, 'Estimasi biaya terlalu besar'),
    urgensi: z.enum(URGENSI_OPTIONS),
    id_tanah: z.string().optional().nullable(),
    id_bangunan: z.string().optional().nullable(),
    id_aset_b: z.string().optional().nullable(),
    id_aset_tanah: z.string().optional().nullable(),
    id_aset_bangunan: z.string().optional().nullable(),
    id_aset_bergerak: z.string().optional().nullable(),
    keterangan: z.string().max(1000, 'Keterangan maksimal 1000 karakter').optional().nullable(),
  })
  .refine(
    (data) => {
      const assetCount = [
        data.id_tanah || data.id_aset_tanah,
        data.id_bangunan || data.id_aset_bangunan,
        data.id_aset_b || data.id_aset_bergerak,
      ].filter(Boolean).length;
      return assetCount <= 1;
    },
    { message: 'Hanya boleh mengaitkan 1 aset terkait', path: ['id_tanah'] }
  );

export type PengajuanBantuanInput = z.infer<typeof pengajuanBantuanSchema>;

export interface BantuanFilter {
  id_pos?: string;
  status?: string;
  urgensi?: UrgensiType | string;
  search?: string;
}

export interface ApprovalActionInput {
  id_ajuan: string;
  action?: 'APPROVE' | 'REJECT' | string;
  aksi?: 'APPROVE' | 'REJECT' | string;
  catatan?: string | null;
}
