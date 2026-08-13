'use server';

// Imports removed
import { revalidatePath } from 'next/cache';
import { enforceAction } from './helpers/enforce-action';
import { executeInTransaction } from './helpers/transaction-context';
import { logAuditEvent } from './helpers/audit-logger';

export async function saveJemaatInduk(formData: FormData) {
  const isEdit = formData.get('isEdit') === 'true';
  const id_induk = formData.get('id_induk') as string;
  const id_mupel = formData.get('id_mupel') as string;
  const nama_induk = formData.get('nama_induk') as string;
  const alamat = (formData.get('alamat') as string) || null;

  if (!id_induk || !nama_induk) return { error: 'ID Jemaat Induk dan Nama Jemaat Induk wajib diisi' };

  const contractId = isEdit ? 'OC-ORG-002' : 'OC-ORG-001';
  const outcome = await enforceAction(
    contractId,
    { targetEntity: { entityId: isEdit ? id_induk : 'NEW', entityType: 'Organization', contextAffinityId: id_mupel, contextAffinityLevel: 'MUPEL' } },
    id_mupel
  );

  await executeInTransaction(outcome.sessionContext, async (supabase) => {
    const payload = { nama_induk, alamat, updated_at: new Date().toISOString() };
    if (isEdit) {
      const { error } = await supabase.from('m_jemaat_induk').update(payload).eq('id_induk', id_induk);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('m_jemaat_induk').insert({ ...payload, id_induk, id_mupel, created_at: new Date().toISOString() });
      if (error) throw error;
    }
  });

  await logAuditEvent({
    contractId, permissionId: isEdit ? 'org.update' : 'org.create', userId: outcome.userId, personId: outcome.sessionContext.linkedPersonId,
    action: isEdit ? 'UPDATE_JEMAAT' : 'CREATE_JEMAAT', entityId: id_induk, entityType: 'Organization', contextId: outcome.sessionContext.activeContextId, contextLevel: outcome.sessionContext.activeContextLevel, evaluatedDimensions: {} as any, timestamp: new Date().toISOString(),
  });

  revalidatePath('/hierarki');
  return { success: true };
}
