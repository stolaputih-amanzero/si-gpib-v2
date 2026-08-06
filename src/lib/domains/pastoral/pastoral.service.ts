// src/lib/domains/pastoral/pastoral.service.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { createLogPastoralSchema } from './pastoral.schema';
import { db } from '@/lib/offline/dexie';
import { syncManager } from '@/lib/offline/sync-manager';
import { PASTORAL_TARGETS } from './pastoral.types';
import { generateTimestampId } from '@/lib/constants/id-formats';

export async function createLogPastoralAction(
  rawData: unknown
): Promise<{ success: boolean; error?: string; idempotent?: boolean }> {
  const validation = createLogPastoralSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }
  const data = validation.data;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Sesi tidak valid. Silakan login ulang.' };
  }

  // Pre-check RBAC
  const { data: penugasan, error: rbacError } = await supabase
    .from('t_penugasan_pendeta')
    .select('id_tugas')
    .eq('id_pendeta', user.user_metadata?.id_pendeta || '')
    .eq('id_pos', data.id_pos)
    .eq('status_tugas', 'Aktif')
    .is('tgl_selesai', null)
    .maybeSingle();

  if (rbacError || !penugasan) {
    logger.warn('RBAC Pre-check failed: User not assigned to this Pos', {
      userId: user.id,
      idPos: data.id_pos,
    });
    return { success: false, error: 'Anda tidak ditugaskan di Pos Pelkes ini.' };
  }

  const idPendeta = user.user_metadata?.id_pendeta;
  if (!idPendeta) {
    return { success: false, error: 'Profil pendeta tidak ditemukan pada akun Anda.' };
  }

  const { error: rpcError } = await supabase.rpc('create_log_pastoral_atomic', {
    p_id_log: generateTimestampId('LOG'),
    p_id_pos: data.id_pos,
    p_id_pendeta: idPendeta,
    p_tgl: data.tgl,
    p_kegiatan: data.kegiatan,
    p_jml_jiwa: data.jml_jiwa ?? null,
    p_catatan: data.catatan ?? null,
    p_foto_url: data.foto_url ?? null,
    p_request_id: data.requestId,
    p_user_id: user.id,
  });

  if (rpcError) {
    if (rpcError.message.includes('RBAC_VIOLATION')) {
      return { success: false, error: 'Akses ditolak: Penugasan tidak valid.' };
    }
    if (rpcError.message.includes('duplicate key') && rpcError.message.includes('uq_sys_txn_logs_request')) {
      logger.info('Idempotent request caught by DB constraint', { requestId: data.requestId });
      revalidatePath('/pastoral');
      return { success: true, idempotent: true };
    }
    
    logger.error('RPC create_log_pastoral_atomic failed', rpcError);
    return { success: false, error: 'Gagal menyimpan log pastoral. Silakan coba lagi.' };
  }

  revalidatePath('/pastoral');
  revalidatePath(`/dashboard/pos-pelkes/${data.id_pos}`);
  
  logger.info('Log pastoral created successfully', {
    requestId: data.requestId,
    idPos: data.id_pos,
    userId: user.id,
  });

  return { success: true };
}

export async function submitLogPastoral(rawData: unknown) {
  // Check online status if we are on client
  const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

  if (isOnline) {
    return createLogPastoralAction(rawData);
  }

  const validation = createLogPastoralSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  await db.pendingSubmissions.add({
    requestId: validation.data.requestId,
    operationType: 'rpc',
    targetIdentifier: PASTORAL_TARGETS.CREATE_LOG,
    payload: validation.data,
    status: 'pending',
    attempts: 0,
    createdAt: Date.now(),
  });

  syncManager.processQueue();

  return { success: true, queued: true };
}
