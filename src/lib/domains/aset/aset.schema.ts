// src/lib/domains/aset/aset.schema.ts
import { z } from 'zod';
import { ID_FORMATS } from '@/lib/constants/id-formats';
import { KONDISI_ASET, STATUS_HUKUM_TANAH } from './aset.types';

const fotoMetaSchema = z.object({
  id_lampiran: z.string().regex(ID_FORMATS.lampiran),
  nama_file: z.string().max(255),
  file_path: z.string().min(1),
  tipe_file: z.string(),
  ukuran_file: z.number().int().positive(),
});

const baseAsetSchema = z.object({
  requestId: z.string().uuid(),
  id_pos: z.string().regex(ID_FORMATS.pos),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  gps_accuracy: z.number().optional(),
  keterangan: z.string().max(1000).optional(),
  foto: fotoMetaSchema.nullable(),
});

export const createAsetSchema = z.discriminatedUnion('jenis', [
  baseAsetSchema.extend({
    jenis: z.literal('tanah'),
    id_aset: z.string().regex(ID_FORMATS.tanah),
    luas_m2: z.number().positive().max(99_999_999),
    thn_perolehan: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    status_hukum: z.enum(STATUS_HUKUM_TANAH).optional(),
    kondisi: z.enum(KONDISI_ASET).optional(),
    potensi_sda: z.string().max(200).optional(),
  }),
  baseAsetSchema.extend({
    jenis: z.literal('bangunan'),
    id_aset: z.string().regex(ID_FORMATS.bangunan),
    nama_bangunan: z.string().min(1).max(150),
    fungsi: z.string().max(100).optional(),
    kondisi: z.enum(KONDISI_ASET).optional(),
    thn_berdiri: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  }),
  baseAsetSchema.extend({
    jenis: z.literal('bergerak'),
    id_aset: z.string().regex(ID_FORMATS.asetBergerak),
    jenis_aset: z.string().max(100),
    merk_tipe: z.string().max(100).optional(),
    kondisi: z.enum(KONDISI_ASET).default('Baik'),
    thn_perolehan: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    no_polisi: z.string().max(20).optional(),
    tgl_pajak: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
]);

export type CreateAsetSchema = z.infer<typeof createAsetSchema>;
