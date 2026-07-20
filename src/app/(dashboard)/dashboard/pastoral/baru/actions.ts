'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';

// Skema Validasi
const logSchema = z.object({
  id_pos: z.string().min(1, 'Pos Pelkes wajib dipilih'),
  id_pendeta: z.string().min(1, 'Pendeta wajib dipilih'),
  tgl: z.string().min(1, 'Tanggal wajib diisi'),
  kegiatan: z.string().min(3, 'Kegiatan minimal 3 karakter'),
  jml_jiwa: z.number().nullable().optional(),
  catatan: z.string().optional(),
  keterangan: z.string().optional(),
  foto_url: z.string().nullable().optional(), // File path hasil upload ke bucket
});

export async function submitPastoralLog(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();

    // Validasi payload menggunakan Zod
    const rawData = {
      id_pos: formData.get('id_pos'),
      id_pendeta: formData.get('id_pendeta'),
      tgl: formData.get('tgl'),
      kegiatan: formData.get('kegiatan'),
      jml_jiwa: formData.get('jml_jiwa') ? parseInt(formData.get('jml_jiwa') as string, 10) : null,
      catatan: formData.get('catatan') || '',
      keterangan: formData.get('keterangan') || '',
      foto_url: formData.get('foto_url') || null,
    };

    const validated = logSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        error: 'Data tidak valid. Periksa kembali form Anda.',
        details: validated.error.flatten().fieldErrors,
      };
    }

    // Generate ID unik untuk log
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const id_log = `LOG-${timestamp}${random}`;

    // Insert ke database
    const { error: insertError } = await supabase
      .from('t_log_pastoral')
      .insert({
        id_log,
        id_pos: validated.data.id_pos,
        id_pendeta: validated.data.id_pendeta,
        tgl: validated.data.tgl,
        kegiatan: validated.data.kegiatan,
        jml_jiwa: validated.data.jml_jiwa,
        catatan: validated.data.catatan,
        keterangan: validated.data.keterangan,
        foto_url: validated.data.foto_url,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return { error: 'Gagal menyimpan data ke database: ' + insertError.message };
    }

    revalidatePath('/dashboard/pastoral');
    revalidatePath(`/dashboard/pos-pelkes/${validated.data.id_pos}`); // update log di detail pos pelkes

  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem: ' + err.message };
  }

  // Harus di luar blok try-catch karena cara kerja Next.js error boundary
  redirect('/dashboard/pastoral');
}
