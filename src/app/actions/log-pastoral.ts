/**
 * src/app/actions/log-pastoral.ts
 *
 * Tier 3: Ordinary CRUD & reads.
 *
 * Contract traceability: OC-PASTORAL-001–004.
 * P1: Context-Owned Entity (Pos-level).
 * P6: Creator-Based Access (parametric).
 * P7: Context Scope with Downward Reach (Read).
 */

'use server';

import { enforceAction } from './helpers/enforce-action';
import { executeInTransaction } from './helpers/transaction-context';
import { logAuditEvent } from './helpers/audit-logger';
import type { TargetEntityState } from '@/lib/authorization';
import { createClient } from '@/lib/supabase/server';

/**
 * Create Pastoral Log.
 *
 * Contract: OC-PASTORAL-001 (pastoral.create).
 * P1: Context-Owned Entity (Pos-level).
 *
 * @param formData - Form data containing pastoral log fields.
 */
export async function createLogPastoralAction(formData: FormData) {
  const claimedContextId = formData.get('contextId') as string;
  const posId = formData.get('idPos') as string;

  const targetEntity: TargetEntityState = {
    entityId: '', // New record, no ID yet
    entityType: 'PastoralLog',
    contextAffinityId: posId,
    contextAffinityLevel: 'POS',
  };

  // ECB-02: 'OC-PASTORAL-001' is STATIC.
  const outcome = await enforceAction(
    'OC-PASTORAL-001',
    { targetEntity },
    claimedContextId,
  );

  let newLogId: string = '';

  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    const { data, error } = await supabase
      .from('t_log_pastoral')
      .insert({
        id_log: crypto.randomUUID().slice(0, 30), // Sample generation
        id_pos: posId,
        id_pendeta: outcome.sessionContext.linkedPersonId,
        kegiatan: formData.get('jenisKegiatan') as string, // Using DB schema 'kegiatan'
        catatan: formData.get('deskripsi') as string, // Using DB schema 'catatan'
        tgl: formData.get('tanggalKegiatan') as string, // Using DB schema 'tgl'
        jml_jiwa: parseInt(formData.get('jumlahPeserta') as string) || 0, // Using DB schema 'jml_jiwa'
        created_at: new Date().toISOString(),
      })
      .select('id_log')
      .single();

    if (error) throw error;
    newLogId = data.id_log;
  });

  await logAuditEvent({
    contractId: 'OC-PASTORAL-001',
    permissionId: 'pastoral.create',
    userId: outcome.userId,
    personId: outcome.sessionContext.linkedPersonId,
    action: 'CREATE',
    entityId: newLogId,
    entityType: 'PastoralLog',
    contextId: outcome.sessionContext.activeContextId,
    contextLevel: outcome.sessionContext.activeContextLevel,
    evaluatedDimensions: {} as any,
    timestamp: new Date().toISOString(),
  });

  return { success: true, id: newLogId };
}

/**
 * Update Pastoral Log — Creator-Based Access.
 *
 * Contract: OC-PASTORAL-002 (pastoral.update).
 * P6: Creator-Based Access.
 * L4 Relationship: creator.
 *
 * @param formData - Form data containing log ID and updated fields.
 */
export async function updateLogPastoralAction(formData: FormData) {
  const logId = formData.get('logId') as string;
  const claimedContextId = formData.get('contextId') as string;

  // Fetch current state for L4 (creator) and L3 (context) evaluation.
  const supabase = await createClient();
  const { data: existingLog, error: fetchError } = await supabase
    .from('t_log_pastoral')
    .select('id_log, id_pendeta, id_pos')
    .eq('id_log', logId)
    .maybeSingle();

  if (fetchError || !existingLog) {
    throw new Error(`Pastoral log '${logId}' not found.`);
  }

  const targetEntity: TargetEntityState = {
    entityId: existingLog.id_log,
    entityType: 'PastoralLog',
    creatorPersonId: existingLog.id_pendeta,
    ownerPersonId: existingLog.id_pendeta,
    contextAffinityId: existingLog.id_pos,
    contextAffinityLevel: 'POS',
  };

  // ECB-02: 'OC-PASTORAL-002' is STATIC.
  const outcome = await enforceAction(
    'OC-PASTORAL-002',
    { targetEntity },
    claimedContextId,
  );

  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    const { error } = await supabase
      .from('t_log_pastoral')
      .update({
        kegiatan: formData.get('jenisKegiatan') as string,
        catatan: formData.get('deskripsi') as string,
        tgl: formData.get('tanggalKegiatan') as string,
        jml_jiwa: parseInt(formData.get('jumlahPeserta') as string) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id_log', logId);

    if (error) throw error;
  });

  await logAuditEvent({
    contractId: 'OC-PASTORAL-002',
    permissionId: 'pastoral.update',
    userId: outcome.userId,
    personId: outcome.sessionContext.linkedPersonId,
    action: 'UPDATE',
    entityId: logId,
    entityType: 'PastoralLog',
    contextId: outcome.sessionContext.activeContextId,
    contextLevel: outcome.sessionContext.activeContextLevel,
    evaluatedDimensions: {} as any,
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Delete Pastoral Log.
 *
 * Contract: OC-PASTORAL-003 (pastoral.delete).
 * D-12: NOT granted to CONTRIBUTOR (Pelaksana Komisi).
 * P1: Context-Owned Entity (Pos-level).
 *
 * @param formData - Form data containing log ID and contextId.
 */
export async function deleteLogPastoralAction(formData: FormData) {
  const logId = formData.get('logId') as string;
  const claimedContextId = formData.get('contextId') as string;

  const supabase = await createClient();
  const { data: existingLog, error: fetchError } = await supabase
    .from('t_log_pastoral')
    .select('id_log, id_pendeta, id_pos')
    .eq('id_log', logId)
    .maybeSingle();

  if (fetchError || !existingLog) {
    throw new Error(`Pastoral log '${logId}' not found.`);
  }

  const targetEntity: TargetEntityState = {
    entityId: existingLog.id_log,
    entityType: 'PastoralLog',
    creatorPersonId: existingLog.id_pendeta,
    ownerPersonId: existingLog.id_pendeta,
    contextAffinityId: existingLog.id_pos,
    contextAffinityLevel: 'POS',
  };

  // ECB-02: 'OC-PASTORAL-003' is STATIC.
  const outcome = await enforceAction(
    'OC-PASTORAL-003',
    { targetEntity },
    claimedContextId,
  );

  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    const { error } = await supabase
      .from('t_log_pastoral')
      .delete()
      .eq('id_log', logId);

    if (error) throw error;
  });

  await logAuditEvent({
    contractId: 'OC-PASTORAL-003',
    permissionId: 'pastoral.delete',
    userId: outcome.userId,
    personId: outcome.sessionContext.linkedPersonId,
    action: 'DELETE',
    entityId: logId,
    entityType: 'PastoralLog',
    contextId: outcome.sessionContext.activeContextId,
    contextLevel: outcome.sessionContext.activeContextLevel,
    evaluatedDimensions: {} as any,
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}
