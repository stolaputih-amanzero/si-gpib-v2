'use server';

import { createClient } from '@/lib/supabase/server';
import { enforceContract } from '@/lib/authorization/enforce/enforce-contract';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { uploadFile } from '@/lib/services/storage';
import { revalidatePath } from 'next/cache';
import {
  keluargaSchema,
  KeluargaSchemaInput,
  kompetensiSchema,
  KompetensiSchemaInput,
  keterlibatanSchema,
  KeterlibatanSchemaInput,
} from '@/lib/validations/pendeta-360.schema';

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function addKeluargaAction(pendetaId: string, payload: KeluargaSchemaInput) {
  const supabase = await createClient();

  // 1. Validate Payload
  const validated = keluargaSchema.parse(payload);

  // 2. Authorization
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'UNAUTHENTICATED' };
  const userId = user.id;

  const authResult = await enforceContract(
    'OC-PERSON-006',
    {
      targetEntity: {
        entityId: pendetaId,
        entityType: 'Pendeta' as const,
        contextAffinityId: pendetaId,
        contextAffinityLevel: 'JEMAAT' as const,
      }
    },
    supabase,
    userId,
    pendetaId
  );

  if (authResult.status === 'RESOLUTION_FAILURE') {
    return { success: false, error: 'Authorization Failure', detail: 'Sesi tidak valid atau hak akses ditolak.' };
  }
  if (authResult.status === 'DENY') {
    return { success: false, error: authResult.errorCode, detail: authResult.errorDetail };
  }

  // 3. Execution
  const { error } = await supabase.from('t_keluarga_pendeta').insert({
    id_pendeta: pendetaId,
    ...validated,
  });

  if (error) {
    return { success: false, error: 'DB_ERROR', detail: error.message };
  }

  return { success: true };
}

export async function addKeterlibatanAction(pendetaId: string, payload: KeterlibatanSchemaInput) {
  const supabase = await createClient();

  // 1. Validate Payload
  const validated = keterlibatanSchema.parse(payload);

  // 2. Authorization (Fallback to OC-PERSON-002 as instructed)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'UNAUTHENTICATED' };
  const userId = user.id;

  const authResult = await enforceContract(
    'OC-PERSON-002',
    {
      targetEntity: {
        entityId: pendetaId,
        entityType: 'Pendeta' as const,
        contextAffinityId: pendetaId,
        contextAffinityLevel: 'JEMAAT' as const,
      }
    },
    supabase,
    userId,
    pendetaId
  );

  if (authResult.status === 'RESOLUTION_FAILURE') {
    return { success: false, error: 'Authorization Failure', detail: 'Sesi tidak valid atau hak akses ditolak.' };
  }
  if (authResult.status === 'DENY') {
    return { success: false, error: authResult.errorCode, detail: authResult.errorDetail };
  }

  // 3. Execution
  const { error } = await supabase.from('t_keterlibatan_pendeta').insert({
    id_pendeta: pendetaId,
    ...validated,
  });

  if (error) {
    return { success: false, error: 'DB_ERROR', detail: error.message };
  }

  return { success: true };
}

export async function addKompetensiAction(pendetaId: string, payload: KompetensiSchemaInput) {
  const supabase = await createClient();
  
  // 1. Validate Payload
  const validated = kompetensiSchema.parse(payload);

  // 2. Manual Server-Side RBAC (Fallback for OC-PERSON-007)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'UNAUTHENTICATED', detail: 'Sesi tidak valid.' };
  }

  const userPendetaId = user.user_metadata?.id_pendeta || (user as any).id_pendeta;
  const isSuperUser = user.role === 'super_user' || user.user_metadata?.role === 'super_user';

  if (!isSuperUser && userPendetaId !== pendetaId) {
    return { success: false, error: 'NOT_AUTHORIZED', detail: 'Hanya bisa mengubah kompetensi sendiri.' };
  }

  // TODO: Gate 9 - Migrate to enforceContract once OC-PERSON-007 is resolved and RLS is applied.
  
  // 3. Execution (Bypass RLS since t_kompetensi_pendeta doesn't have it anyway, but we use admin just in case)
  const { error } = await supabaseAdmin.from('t_kompetensi_pendeta').insert({
    id_pendeta: pendetaId,
    ...validated,
  });

  if (error) {
    return { success: false, error: 'DB_ERROR', detail: error.message };
  }

  return { success: true };
}

export async function updateKeluargaAction(id_keluarga: string, pendetaId: string, payload: KeluargaSchemaInput) {
  const supabase = await createClient();
  const validated = keluargaSchema.parse(payload);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'UNAUTHENTICATED' };
  const userId = user.id;
  const authResult = await enforceContract(
    'OC-PERSON-006',
    { targetEntity: { entityId: pendetaId, entityType: 'Pendeta' as const, contextAffinityId: pendetaId, contextAffinityLevel: 'JEMAAT' as const } },
    supabase,
    userId,
    pendetaId
  );
  if (authResult.status === 'DENY') return { success: false, error: authResult.errorCode };
  const { error } = await supabase.from('t_keluarga_pendeta').update(validated).eq('id_keluarga', id_keluarga);
  return { success: !error, error: error?.message };
}

export async function deleteKeluargaAction(id_keluarga: string, pendetaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'UNAUTHENTICATED' };
  const userId = user.id;
  const authResult = await enforceContract(
    'OC-PERSON-006',
    { targetEntity: { entityId: pendetaId, entityType: 'Pendeta' as const, contextAffinityId: pendetaId, contextAffinityLevel: 'JEMAAT' as const } },
    supabase,
    userId,
    pendetaId
  );
  if (authResult.status === 'DENY') return { success: false, error: authResult.errorCode };
  const { error } = await supabase.from('t_keluarga_pendeta').delete().eq('id_keluarga', id_keluarga);
  return { success: !error, error: error?.message };
}

export async function updateKeterlibatanAction(id: string, pendetaId: string, payload: KeterlibatanSchemaInput) {
  const supabase = await createClient();
  const validated = keterlibatanSchema.parse(payload);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'UNAUTHENTICATED' };
  const userId = user.id;
  const authResult = await enforceContract(
    'OC-PERSON-002',
    { targetEntity: { entityId: pendetaId, entityType: 'Pendeta' as const, contextAffinityId: pendetaId, contextAffinityLevel: 'JEMAAT' as const } },
    supabase,
    userId,
    pendetaId
  );
  if (authResult.status === 'DENY') return { success: false, error: authResult.errorCode };
  const { error } = await supabase.from('t_keterlibatan_pendeta').update(validated).eq('id_keterlibatan', id);
  return { success: !error, error: error?.message };
}

export async function deleteKeterlibatanAction(id: string, pendetaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'UNAUTHENTICATED' };
  const userId = user.id;
  const authResult = await enforceContract(
    'OC-PERSON-002',
    { targetEntity: { entityId: pendetaId, entityType: 'Pendeta' as const, contextAffinityId: pendetaId, contextAffinityLevel: 'JEMAAT' as const } },
    supabase,
    userId,
    pendetaId
  );
  if (authResult.status === 'DENY') return { success: false, error: authResult.errorCode };
  const { error } = await supabase.from('t_keterlibatan_pendeta').delete().eq('id_keterlibatan', id);
  return { success: !error, error: error?.message };
}

export async function updateKompetensiAction(id: string, pendetaId: string, payload: KompetensiSchemaInput) {
  const supabase = await createClient();
  const validated = kompetensiSchema.parse(payload);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'UNAUTHENTICATED' };
  const isSuperUser = user.role === 'super_user' || user.user_metadata?.role === 'super_user';
  if (!isSuperUser && (user.user_metadata?.id_pendeta || (user as any).id_pendeta) !== pendetaId) return { success: false, error: 'NOT_AUTHORIZED' };
  const { error } = await supabaseAdmin.from('t_kompetensi_pendeta').update(validated).eq('id_kompetensi', id);
  return { success: !error, error: error?.message };
}

export async function deleteKompetensiAction(id: string, pendetaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'UNAUTHENTICATED' };
  const isSuperUser = user.role === 'super_user' || user.user_metadata?.role === 'super_user';
  if (!isSuperUser && (user.user_metadata?.id_pendeta || (user as any).id_pendeta) !== pendetaId) return { success: false, error: 'NOT_AUTHORIZED' };
  const { error } = await supabaseAdmin.from('t_kompetensi_pendeta').delete().eq('id_kompetensi', id);
  return { success: !error, error: error?.message };
}

export async function uploadFotoKeluarga(
  idKeluarga: string,
  idPendeta: string,
  file: File
) {
  const db = supabaseAdmin;

  const uploadResult = await uploadFile({
    bucket: 'documents',
    folder: `keluarga/${idPendeta}`,
    file,
    contractId: 'OC-PERSON-006',
    contractPayload: {
      target_entity: { entity_type: 'FamilyMember', entity_id: idKeluarga, owning_context_id: idPendeta },
      operation_payload: { action: 'upload_foto' },
    },
  });

  if (!uploadResult.success) {
    return { success: false, error: uploadResult.error };
  }

  const { error: dbError } = await db
    .from('t_keluarga_pendeta')
    .update({ foto_url: uploadResult.path! })
    .eq('id_keluarga', idKeluarga);

  if (!dbError) {
    revalidatePath(`/people/${encodeURIComponent(idPendeta)}`);
  }

  return { success: !dbError, error: dbError?.message };
}

export async function uploadDokumenKompetensi(
  idKompetensi: string,
  idPendeta: string,
  file: File
) {
  const db = supabaseAdmin;

  const uploadResult = await uploadFile({
    bucket: 'documents',
    folder: `kompetensi/${idPendeta}`,
    file,
    contractId: 'OC-PERSON-007',
    contractPayload: {
      target_entity: { entity_type: 'Competency', entity_id: idKompetensi, owning_context_id: idPendeta },
      operation_payload: { action: 'upload_sertifikat' },
    },
  });

  if (!uploadResult.success) {
    return { success: false, error: uploadResult.error };
  }

  const { error: dbError } = await db
    .from('t_kompetensi_pendeta')
    .update({ file_sertifikat: uploadResult.path! })
    .eq('id_kompetensi', idKompetensi);

  if (!dbError) {
    revalidatePath(`/people/${encodeURIComponent(idPendeta)}`);
  }

  return { success: !dbError, error: dbError?.message };
}
