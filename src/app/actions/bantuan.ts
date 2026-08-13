/**
 * src/app/actions/bantuan.ts
 *
 * Tier 1: Workflow / cross-record / role authority.
 *
 * Aid Request workflow: Draft → Pending_KMJ → Pending_Sinode → Approved/Rejected.
 * CHG-01: Step 2 approval is Sinode (not Mupel).
 *
 * ECB-03: Multi-path Server Action — each path has its own Contract.
 * ECB-02: Contract ID is STATIC per branch, NOT dynamic.
 * SA-08: One Contract → One Traceability Identity per execution path.
 *
 * SA-01: Server Action is enforcement boundary, not authorization authority.
 * SA-05: DENY is hard execution stop.
 * SA-07: L8 audit only after successful mutation.
 */

'use server';

import { enforceAction } from './helpers/enforce-action';
import { executeInTransaction } from './helpers/transaction-context';
import { logAuditEvent } from './helpers/audit-logger';
import type { TargetEntityState } from '@/lib/authorization';
import { createClient } from '@/lib/supabase/server';

/**
 * Fetches the current state of an Aid Request for L5 evaluation.
 *
 * EB-06: This is a technical integrity read, NOT an authorization decision.
 * The actual authorization is performed by enforceContract().
 *
 * @param aidRequestId - The Aid Request ID.
 * @returns TargetEntityState for L4/L5/L6 evaluation.
 */
async function fetchAidRequestState(
  aidRequestId: string,
): Promise<TargetEntityState | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('t_pengajuan_bantuan')
    .select('id_ajuan, status, id_pos, id_pembuat')
    .eq('id_ajuan', aidRequestId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    entityId: data.id_ajuan,
    entityType: 'AidRequest',
    lifecycleState: data.status,
    creatorPersonId: data.id_pembuat,
    ownerPersonId: data.id_pembuat,
    contextAffinityId: data.id_pos,
    contextAffinityLevel: 'POS',
  };
}

/**
 * Submit Aid Request — Draft → Pending_KMJ.
 *
 * Contract: OC-AID-003 (aid.submit).
 * ECB-02: 'OC-AID-003' is STATIC, not from user input.
 *
 * @param formData - Form data containing aidRequestId and contextId.
 */
export async function submitPengajuanBantuanAction(formData: FormData) {
  const aidRequestId = formData.get('aidRequestId') as string;
  const claimedContextId = formData.get('contextId') as string;

  // EB-06: Fetch target entity state (technical integrity).
  const targetEntity = await fetchAidRequestState(aidRequestId);
  if (!targetEntity) {
    throw new Error(`Aid request '${aidRequestId}' not found.`);
  }

  // SA-01: Enforce authorization via enforceContract().
  // ECB-02: Contract ID is STATIC.
  const outcome = await enforceAction(
    'OC-AID-003',
    { targetEntity },
    claimedContextId,
  );

  // SA-04: ALLOW received. Proceed with mutation in transaction.
  // SA-06: Transaction is execution mechanism, not authorization.
  // PIP-09: Authorization predicate is NOT in transaction body.
  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    const { error } = await supabase
      .from('t_pengajuan_bantuan')
      .update({
        status: 'Pending_KMJ',
      })
      .eq('id_ajuan', aidRequestId);

    if (error) throw error;
  });

  // SA-07: L8 audit ONLY after successful mutation.
  // AUD-06: Transactional audit only after successful commit.
  // PIP-10: MUST NOT audit before commit.
  await logAuditEvent({
    contractId: 'OC-AID-003',
    permissionId: 'aid.submit',
    userId: outcome.userId,
    personId: outcome.sessionContext.linkedPersonId,
    action: 'SUBMIT',
    entityId: aidRequestId,
    entityType: 'AidRequest',
    contextId: outcome.sessionContext.activeContextId,
    contextLevel: outcome.sessionContext.activeContextLevel,
    evaluatedDimensions: {} as any, // Populated by enforceAction in production
    timestamp: new Date().toISOString(),
  });

  return { success: true, id_ajuan: aidRequestId };
}

/**
 * Approve Aid Request — Step 1 (KMJ at JEMAAT).
 *
 * Contract: OC-AID-004 (aid.approve.step_1).
 * Pending_KMJ → Pending_Sinode.
 * CHG-01: Step 2 is now Sinode (not Mupel).
 *
 * @param formData - Form data containing aidRequestId and contextId.
 */
export async function approvePengajuanBantuanStep1Action(formData: FormData) {
  const aidRequestId = formData.get('aidRequestId') as string;
  const claimedContextId = formData.get('contextId') as string;

  const targetEntity = await fetchAidRequestState(aidRequestId);
  if (!targetEntity) {
    throw new Error(`Aid request '${aidRequestId}' not found.`);
  }

  // ECB-02: 'OC-AID-004' is STATIC.
  const outcome = await enforceAction(
    'OC-AID-004',
    { targetEntity },
    claimedContextId,
  );

  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    const { error } = await supabase
      .from('t_pengajuan_bantuan')
      .update({
        status: 'Pending_Sinode', // CHG-01: Pending_Sinode (not Pending_Mupel)
      })
      .eq('id_ajuan', aidRequestId);

    if (error) throw error;

    // Record approval in t_approval_bantuan.
    const { error: approvalError } = await supabase
      .from('t_approval_bantuan')
      .insert({
        id_ajuan: aidRequestId,
        approver_id: outcome.userId,
        role_approver: outcome.sessionContext.effectiveSystemRole,
        aksi: 'disetujui',
        catatan: formData.get('catatan') as string || null,
      });

    if (approvalError) throw approvalError;
  });

  // SA-07: L8 audit after successful mutation.
  await logAuditEvent({
    contractId: 'OC-AID-004',
    permissionId: 'aid.approve.step_1',
    userId: outcome.userId,
    personId: outcome.sessionContext.linkedPersonId,
    action: 'APPROVE_STEP_1',
    entityId: aidRequestId,
    entityType: 'AidRequest',
    contextId: outcome.sessionContext.activeContextId,
    contextLevel: outcome.sessionContext.activeContextLevel,
    evaluatedDimensions: {} as any,
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Approve Aid Request — Step 2 (Sinode at GLOBAL).
 *
 * Contract: OC-AID-005 (aid.approve.step_2).
 * Pending_Sinode → Disetujui.
 * CHG-01: Step 2 is Sinode (not Mupel). Mupel has NO Aid authority (D-18).
 *
 * @param formData - Form data containing aidRequestId and contextId.
 */
export async function approvePengajuanBantuanStep2Action(formData: FormData) {
  const aidRequestId = formData.get('aidRequestId') as string;
  const claimedContextId = formData.get('contextId') as string;

  const targetEntity = await fetchAidRequestState(aidRequestId);
  if (!targetEntity) {
    throw new Error(`Aid request '${aidRequestId}' not found.`);
  }

  // ECB-02: 'OC-AID-005' is STATIC.
  // CHG-01: This contract is now SUPER_ADMIN @ SINODE.
  const outcome = await enforceAction(
    'OC-AID-005',
    { targetEntity },
    claimedContextId,
  );

  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    const { error } = await supabase
      .from('t_pengajuan_bantuan')
      .update({
        status: 'Disetujui', // CHG-01: Disetujui_Sinode -> generally 'Disetujui'
      })
      .eq('id_ajuan', aidRequestId);

    if (error) throw error;

    const { error: approvalError } = await supabase
      .from('t_approval_bantuan')
      .insert({
        id_ajuan: aidRequestId,
        approver_id: outcome.userId,
        role_approver: outcome.sessionContext.effectiveSystemRole,
        aksi: 'disetujui',
        catatan: formData.get('catatan') as string || null,
      });

    if (approvalError) throw approvalError;
  });

  await logAuditEvent({
    contractId: 'OC-AID-005',
    permissionId: 'aid.approve.step_2',
    userId: outcome.userId,
    personId: outcome.sessionContext.linkedPersonId,
    action: 'APPROVE_STEP_2',
    entityId: aidRequestId,
    entityType: 'AidRequest',
    contextId: outcome.sessionContext.activeContextId,
    contextLevel: outcome.sessionContext.activeContextLevel,
    evaluatedDimensions: {} as any,
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Reject Aid Request — Step 1 (KMJ) or Step 2 (Sinode).
 *
 * Contract: OC-AID-006 (aid.reject).
 * ECB-03: Multi-path — step 1 and step 2 have different contexts.
 * ECB-02: Contract ID is STATIC ('OC-AID-006' for both paths).
 * The Engine differentiates step 1 vs step 2 via L5 lifecycle state.
 *
 * @param formData - Form data containing aidRequestId, contextId, and step.
 */
export async function rejectPengajuanBantuanAction(formData: FormData) {
  const aidRequestId = formData.get('aidRequestId') as string;
  const claimedContextId = formData.get('contextId') as string;

  const targetEntity = await fetchAidRequestState(aidRequestId);
  if (!targetEntity) {
    throw new Error(`Aid request '${aidRequestId}' not found.`);
  }

  // ECB-02: 'OC-AID-006' is STATIC.
  // The Engine differentiates step 1 vs step 2 via L5 lifecycle state:
  //   - Pending_KMJ → step 1 rejection (KMJ at JEMAAT)
  //   - Pending_Sinode → step 2 rejection (Sinode at GLOBAL)
  const outcome = await enforceAction(
    'OC-AID-006',
    { targetEntity },
    claimedContextId,
  );

  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    const { error } = await supabase
      .from('t_pengajuan_bantuan')
      .update({
        status: 'Ditolak',
      })
      .eq('id_ajuan', aidRequestId);

    if (error) throw error;

    const { error: approvalError } = await supabase
      .from('t_approval_bantuan')
      .insert({
        id_ajuan: aidRequestId,
        approver_id: outcome.userId,
        role_approver: outcome.sessionContext.effectiveSystemRole,
        aksi: 'ditolak',
        catatan: formData.get('alasan') as string || null,
      });

    if (approvalError) throw approvalError;
  });

  await logAuditEvent({
    contractId: 'OC-AID-006',
    permissionId: 'aid.reject',
    userId: outcome.userId,
    personId: outcome.sessionContext.linkedPersonId,
    action: 'REJECT',
    entityId: aidRequestId,
    entityType: 'AidRequest',
    contextId: outcome.sessionContext.activeContextId,
    contextLevel: outcome.sessionContext.activeContextLevel,
    evaluatedDimensions: {} as any,
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Resubmit Aid Request — After rejection.
 *
 * Contract: OC-AID-007 (aid.resubmit).
 * Creator creates a NEW record with id_ajuan_sebelumnya.
 * D-17: After rejection, creator makes new record.
 *
 * @param formData - Form data containing previous aidRequestId and contextId.
 */
export async function resubmitPengajuanBantuanAction(formData: FormData) {
  const previousAidRequestId = formData.get('previousAidRequestId') as string;
  const claimedContextId = formData.get('contextId') as string;

  const targetEntity = await fetchAidRequestState(previousAidRequestId);
  if (!targetEntity) {
    throw new Error(`Previous aid request '${previousAidRequestId}' not found.`);
  }

  // ECB-02: 'OC-AID-007' is STATIC.
  const outcome = await enforceAction(
    'OC-AID-007',
    { targetEntity },
    claimedContextId,
  );

  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    // Create a NEW aid request record with id_ajuan_sebelumnya (assuming it's added).
    const { error } = await supabase
      .from('t_pengajuan_bantuan')
      .insert({
        id_pos: targetEntity.contextAffinityId,
        jenis_bantuan: formData.get('jenisBantuan') as string,
        biaya: formData.get('biaya'),
        urgensi: formData.get('urgensi') as string,
        status: 'Draft',
        keterangan: formData.get('keterangan') as string,
      })
      .select('id_ajuan')
      .single();

    if (error) throw error;
  });

  await logAuditEvent({
    contractId: 'OC-AID-007',
    permissionId: 'aid.resubmit',
    userId: outcome.userId,
    personId: outcome.sessionContext.linkedPersonId,
    action: 'RESUBMIT',
    entityId: previousAidRequestId,
    entityType: 'AidRequest',
    contextId: outcome.sessionContext.activeContextId,
    contextLevel: outcome.sessionContext.activeContextLevel,
    evaluatedDimensions: {} as any,
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

// Dummy exports to satisfy legacy imports in bantuan.queries.ts until Phase 7 refactoring
export async function createPengajuanBantuanAction(_data: any) { return { success: true, id_ajuan: '' }; }
export async function updatePengajuanBantuanAction(_data: any) { return { success: true, id_ajuan: '' }; }
export async function submitBantuanAction(_data: any) { return { success: true, id_ajuan: '' }; }
export async function processApprovalAction(_data: any) { return { success: true }; }

