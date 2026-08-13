'use server';

// import removed
import { enforceAction } from './helpers/enforce-action';
import { executeInTransaction } from './helpers/transaction-context';
// import removed

export async function assignKmjAction(data: { id_induk: string; id_pendeta: string }) {
  const outcome = await enforceAction(
    'OC-ORG-002',
    { targetEntity: { entityId: data.id_induk, entityType: 'Organization', contextAffinityId: data.id_induk, contextAffinityLevel: 'JEMAAT' } },
    data.id_induk
  );
  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    await supabase.rpc('set_kmj', { p_id_induk: data.id_induk, p_id_pendeta: data.id_pendeta });
  });
  return { success: true };
}

export async function assignPjAction(data: { id_induk: string; id_pendeta: string }) {
  const outcome = await enforceAction(
    'OC-ORG-002',
    { targetEntity: { entityId: data.id_induk, entityType: 'Organization', contextAffinityId: data.id_induk, contextAffinityLevel: 'JEMAAT' } },
    data.id_induk
  );
  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    await supabase.rpc('assign_pj', { p_id_induk: data.id_induk, p_id_pendeta: data.id_pendeta });
  });
  return { success: true };
}
