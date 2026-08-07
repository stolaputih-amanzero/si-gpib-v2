'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const mutasiSchema = z.object({
  id_pendeta: z.string().min(1, 'ID Pendeta wajib diisi'),
  id_induk_baru: z.string().min(1, 'Jemaat tujuan wajib dipilih'),
  jenis_mutasi: z.string().min(1, 'Jenis mutasi wajib dipilih'),
  alasan: z.string().min(10, 'Alasan minimal 10 karakter'),
  file_sk_url: z.string().optional(),
});

export async function mutasiPendetaAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // HARD GATE: Hanya Super User
    if (user?.user_metadata?.role !== 'super_user') {
      return { 
        success: false, 
        error: 'Akses ditolak: Hanya Admin Sinode (super_user) yang dapat mengeksekusi mutasi.' 
      };
    }

    const rawData = {
      id_pendeta: formData.get('id_pendeta'),
      id_induk_baru: formData.get('id_induk_baru'),
      jenis_mutasi: formData.get('jenis_mutasi'),
      alasan: formData.get('alasan'),
      file_sk_url: formData.get('file_sk_url'),
    };

    const validatedData = mutasiSchema.parse(rawData);

    // Panggil RPC Atomic
    const { error: rpcError } = await supabase.rpc('mutasi_pendeta', {
      p_id_pendeta: validatedData.id_pendeta,
      p_id_induk_baru: validatedData.id_induk_baru,
      p_alasan: validatedData.alasan,
      p_jenis_mutasi: validatedData.jenis_mutasi,
      p_file_sk: validatedData.file_sk_url || null,
    });

    if (rpcError) {
      console.error('RPC Error mutasi_pendeta:', rpcError);
      return { success: false, error: rpcError.message };
    }

    // Revalidate cache agar UI terupdate
    revalidatePath('/sdm/pendeta');
    revalidatePath('/hierarki');
    
    return { success: true };
  } catch (error) {
    console.error('Error mutasiPendetaAction:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Terjadi kesalahan saat memproses mutasi.' };
  }
}
