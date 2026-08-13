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
  
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id || '';

  const targetEntity = {
    entityId: '',
    entityType: 'Asset' as const,
    contextAffinityId: data.id_pos || '',
    contextAffinityLevel: 'POS' as const,
  };

  const result = await enforceContract(
    'OC-ASSET-001',
    { targetEntity },
    supabase,
    userId,
    data.id_pos || ''
  );

  if (result.status === 'RESOLUTION_FAILURE') {
    return { success: false, error: 'INTERNAL_ERROR', message: result.diagnosticMessage };
  }
  if (result.status === 'DENY') {
    return { 
        success: false, 
        error: result.errorCode || 'ACCESS_DENIED',
        message: result.errorDetail || 'Access denied.'
    };
  }

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

export async function getAsetById(id: string) {
  const supabase = await createClient();
  
  // Existing auth contract: RLS enforces visibility.
  // We don't know the type, so we query all tables.
  const [tanah, bangunan, bergerak] = await Promise.all([
    supabase.from('t_aset_tanah').select('*, m_pos_pelkes(nama_pos)').eq('id_tanah', id).maybeSingle(),
    supabase.from('t_aset_bangunan').select('*, m_pos_pelkes(nama_pos)').eq('id_bangunan', id).maybeSingle(),
    supabase.from('t_aset_bergerak').select('*, m_pos_pelkes(nama_pos)').eq('id_aset_b', id).maybeSingle()
  ]);

  if (tanah.error) throw new Error(tanah.error.message);
  if (bangunan.error) throw new Error(bangunan.error.message);
  if (bergerak.error) throw new Error(bergerak.error.message);

  if (tanah.data) return { ...tanah.data, type: 'tanah' as const };
  if (bangunan.data) return { ...bangunan.data, type: 'bangunan' as const };
  if (bergerak.data) return { ...bergerak.data, type: 'bergerak' as const };
  
  // Fallback for asset.ts typo pattern
  const bbergerak = await supabase.from('t_aset_bbergerak').select('*, m_pos_pelkes(nama_pos)').eq('id_aset_b', id).maybeSingle();
  if (bbergerak.data) return { ...bbergerak.data, type: 'bergerak' as const };

  // If there are genuine RLS or DB errors, we could log them here.
  // For now, if no data is found, return null.
  return null;
}
