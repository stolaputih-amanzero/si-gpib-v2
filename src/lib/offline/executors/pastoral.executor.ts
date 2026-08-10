import { createClient } from '@/lib/supabase/server';
import { logPastoralSchema } from '@/lib/validations/log-pastoral.schema';
import { generateTimestampId } from '@/lib/constants/id-formats';

export async function executePastoralLogInsert(
  payload: any,
  _contextId: string,
  _userId: string
): Promise<void> {
  // 1. Technical Validation (Zod) - purely structural
  const validation = logPastoralSchema.safeParse(payload);
  if (!validation.success) {
    throw new Error(`Technical validation failed: ${validation.error.issues[0].message}`);
  }

  // 2. Map payload to DB schema
  const data = validation.data;
  const insertPayload = {
    id_log: generateTimestampId('LOG'),
    id_pos: data.id_pos,
    id_induk: data.id_induk,
    id_pendeta: data.id_pendeta,
    tgl: data.tgl,
    kegiatan: data.kegiatan,
    catatan: data.catatan,
    jml_jiwa: data.jml_jiwa,
  };

  // 3. Database Execution
  const supabase = await createClient();
  const { error } = await supabase.from('t_log_pastoral').insert(insertPayload);
  
  if (error) {
    throw new Error(`Database insert failed: ${error.message}`);
  }
}
