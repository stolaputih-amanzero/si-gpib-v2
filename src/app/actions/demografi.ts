'use server';

// Imports removed
import { enforceAction } from './helpers/enforce-action';
import { executeInTransaction } from './helpers/transaction-context';
import { logAuditEvent } from './helpers/audit-logger';

export async function upsertDemografiBatchAction(payload: any) {
  const posId = payload.id_pos;
  const claimedContextId = posId;

  // OC-DEMO-001: demography.upsert
  const outcome = await enforceAction(
    'OC-DEMO-001',
    {
      targetEntity: {
        entityId: posId,
        entityType: 'Demography',
        contextAffinityId: posId,
        contextAffinityLevel: 'POS',
      },
    },
    claimedContextId,
  );

  const upsertRows = Object.entries(payload.data || {}).map(([kategoriKey, rowValues]: any) => {
    return {
      id_pos: posId,
      kategori_pelkat: kategoriKey,
      jml_kk: Number(rowValues.jml_kk || 0),
      laki: Number(rowValues.laki || 0),
      perempuan: Number(rowValues.perempuan || 0),
      updated_at: new Date().toISOString(),
    };
  });

  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    const { error } = await supabase
      .from('t_demografi_pelkat')
      .upsert(upsertRows, { onConflict: 'id_pos,kategori_pelkat' });
    if (error) throw error;
  });

  await logAuditEvent({
    contractId: 'OC-DEMO-001',
    permissionId: 'demography.upsert',
    userId: outcome.userId,
    personId: outcome.sessionContext.linkedPersonId,
    action: 'UPSERT_DEMOGRAFI',
    entityId: posId,
    entityType: 'Demography',
    contextId: outcome.sessionContext.activeContextId,
    contextLevel: outcome.sessionContext.activeContextLevel,
    evaluatedDimensions: {} as any,
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}
