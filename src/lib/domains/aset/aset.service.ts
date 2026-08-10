// src/lib/domains/aset/aset.service.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { createAsetSchema, type CreateAsetSchema } from './aset.schema';
import { db } from '@/lib/offline/dexie';
import { syncManager } from '@/lib/offline/sync-manager';
import { ASET_TARGETS } from './aset.types';
import { enforceContract } from '@/lib/authorization';

export async function createAsetAction(
  rawData: CreateAsetSchema
): Promise<{ success: boolean; error?: string; message?: string; idempotent?: boolean }> {
  const validation = createAsetSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }
  const data = validation.data;

  const supabase = await createClient();
  
  const result = await enforceContract('OC-ASSET-001', {
    target_entity: {
      entity_type: 'Asset',
      entity_id: null,
      owning_context_id: data.id_pos || '',
    },
    operation_payload: data,
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    return { success: false, error: 'INTERNAL_ERROR', message: 'System configuration error.' };
  }
  if (result.decision.result === 'DENY') {
    return { 
        success: false, 
        error: result.decision.error_code || 'ACCESS_DENIED',
        message: result.decision.error_detail || 'Access denied.'
    };
  }
  
  let userId = result.identity_resolution?.base_identity?.user_account_id || '';

  let rpcName: 'cj5_create_aset_tanah' | 'cj5_create_aset_bangunan' | 'cj5_create_aset_bergerak';
  let payload: Record<string, any>;

  if (data.jenis === 'tanah') {
    rpcName = 'cj5_create_aset_tanah';
    payload = {
      p_id_tanah: data.id_aset,
      p_id_pos: data.id_pos,
      p_luas_m2: data.luas_m2 || 0,
      p_status_hukum: data.status_hukum || null,
      p_thn_perolehan: data.thn_perolehan || null,
      p_potensi_sda: data.potensi_sda || null,
      p_kondisi: data.kondisi || 'Baik',
      p_keterangan: data.keterangan || null,
      p_latitude: data.latitude,
      p_longitude: data.longitude,
      p_created_by: userId
    };
  } else if (data.jenis === 'bangunan') {
    rpcName = 'cj5_create_aset_bangunan';
    payload = {
      p_id_bangunan: data.id_aset,
      p_id_pos: data.id_pos,
      p_nama_bangunan: data.nama_bangunan || '',
      p_fungsi: data.fungsi || null,
      p_thn_berdiri: data.thn_berdiri || null,
      p_kondisi: data.kondisi || 'Baik',
      p_keterangan: data.keterangan || null,
      p_latitude: data.latitude,
      p_longitude: data.longitude,
      p_created_by: userId
    };
  } else {
    rpcName = 'cj5_create_aset_bergerak';
    payload = {
      p_id_aset_b: data.id_aset,
      p_id_pos: data.id_pos,
      p_jenis: data.jenis_aset || '',
      p_merk_tipe: data.merk_tipe || null,
      p_no_polisi: data.no_polisi || null,
      p_tgl_pajak: data.tgl_pajak || null,
      p_kondisi: data.kondisi || 'Baik',
      p_keterangan: data.keterangan || null,
      p_latitude: data.latitude,
      p_longitude: data.longitude,
      p_created_by: userId
    };
  }

  const { error: rpcError } = await supabase.rpc(rpcName, payload);

  if (rpcError) {
    if (rpcError.message.includes('RBAC_VIOLATION')) {
      return { success: false, error: 'Akses ditolak: Penugasan tidak valid.' };
    }
    if (rpcError.message.includes('duplicate key') && rpcError.message.includes('uq_sys_txn_logs_request')) {
      logger.info('Idempotent request caught by DB constraint', { requestId: data.requestId });
      revalidatePath(`/dashboard/pos-pelkes/${data.id_pos}`);
      revalidatePath('/dashboard/pos-pelkes');
      return { success: true, idempotent: true };
    }
    
    logger.error(`RPC ${rpcName} failed`, rpcError);
    return { success: false, error: 'Gagal menyimpan aset. Silakan coba lagi.' };
  }

  revalidatePath(`/dashboard/pos-pelkes/${data.id_pos}`);
  revalidatePath('/dashboard/pos-pelkes');
  
  logger.info('Aset created successfully', {
    requestId: data.requestId,
    idPos: data.id_pos,
    userId: userId,
  });

  return { success: true };
}

export async function submitAset(rawData: unknown, fotoBlob?: Blob) {

  const validation = createAsetSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }
  
  const data = validation.data;

  // Single pipeline untuk online & offline: selalu enqueue ke Dexie (D-CJ5-5)
  // Buat PendingSubmission record
  const submissionId = await db.pendingSubmissions.add({
    requestId: data.requestId,
    operationType: 'rpc',
    targetIdentifier: ASET_TARGETS.CREATE,
    payload: data,
    status: 'pending',
    attempts: 0,
    createdAt: Date.now(),
  });

  // Jika ada foto, enqueue ke pendingAttachments
  if (data.foto) {
    if (!fotoBlob) {
      return { success: false, error: 'Foto blob tidak ditemukan untuk lampiran.' };
    }
    await db.pendingAttachments.add({
      submissionId: Number(submissionId),
      file: fotoBlob,
      path: data.foto.file_path,
      status: 'pending',
      attempts: 0,
      createdAt: Date.now(),
    });
  }

  // Trigger sync process in background
  syncManager.processQueue();

  return { success: true, queued: true };
}
