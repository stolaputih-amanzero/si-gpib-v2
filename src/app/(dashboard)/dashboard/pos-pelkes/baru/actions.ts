'use server'

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
// cookies import removed
import { revalidatePath } from 'next/cache'
import { enforceContract } from '@/lib/authorization'
import type { ContractId } from '@/lib/authorization/types'

// getAuthUser removed

// Removed dangling syntax
export async function savePosPelkes(formData: FormData): Promise<{ success?: boolean; id_pos?: string; error?: string | any }> {
  const supabase = await createClient()

  const id_induk = formData.get('id_induk') as string
  const nama_pos = formData.get('nama_pos') as string
  const kategori = (formData.get('kategori') as string) || 'Pos Pelkes'
  const alamat = (formData.get('alamat') as string) || null
  const latStr = formData.get('latitude') as string | null
  const lngStr = formData.get('longitude') as string | null
  const photo = formData.get('photo') as File | null

  if (!id_induk || !nama_pos) {
    return { error: 'Data tidak lengkap' }
  }

  const contractId: ContractId = 'OC-ORG-001';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Organization',
      entity_id: null,
      owning_context_id: id_induk,
    },
    operation_payload: {},
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    return { error: 'System configuration error (Authorization).' };
  }
  if (result.decision.result === 'DENY') {
    return { error: result.decision.error_detail || 'Access denied.' };
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabaseAdmin.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  const latitude = latStr ? parseFloat(latStr) : null
  const longitude = lngStr ? parseFloat(lngStr) : null

  const id_pos = `POS-${Math.floor(10000 + Math.random() * 90000)}`

  let foto_url: string | null = null

  if (photo && photo.size > 0) {
    const fileExt = photo.name.split('.').pop() || 'jpg'
    const fileName = `${id_pos}-${Date.now()}.${fileExt}`
    const filePath = `${id_pos}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('pos-pelkes-images')
      .upload(filePath, photo, {
        contentType: photo.type || 'image/jpeg',
        upsert: true
      })

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('pos-pelkes-images')
        .getPublicUrl(filePath)

      foto_url = publicUrlData?.publicUrl || filePath
    }
  }

  const insertPayload = {
    id_pos,
    id_induk,
    nama_pos,
    kategori,
    alamat,
    latitude,
    longitude,
    foto_url,
    tgl_berdiri: new Date().toISOString().split('T')[0],
    keterangan: 'Diinput via Sistem PWA'
  }

  let { error: posError } = await supabase
    .from('m_pos_pelkes')
    .insert(insertPayload)

  if (posError) {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error: adminError } = await supabaseAdmin
      .from('m_pos_pelkes')
      .insert(insertPayload)
    
    posError = adminError
  }

  if (posError) {
    return { error: `Gagal menyimpan Pos Pelkes: ${posError.message}` }
  }

  await supabaseAdmin.from('t_log_aktivitas').insert({
    id_log: `LOG-ORG-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'org.create',
    objek_type: 'Organization',
    objek_id: id_pos,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Membuat Pos Pelkes ${nama_pos}`
  });

  revalidatePath('/dashboard/pos-pelkes')
  return { success: true, id_pos }
}

export async function updatePosPelkes(id_pos: string, formData: FormData): Promise<{ success?: boolean; id_pos?: string; error?: string | any }> {
  const supabase = await createClient()

  const id_induk = formData.get('id_induk') as string
  const nama_pos = formData.get('nama_pos') as string
  const kategori = (formData.get('kategori') as string) || 'Pos Pelkes'
  const alamat = (formData.get('alamat') as string) || null
  const latStr = formData.get('latitude') as string | null
  const lngStr = formData.get('longitude') as string | null
  const keterangan = formData.get('keterangan') as string | null
  const photo = formData.get('photo') as File | null

  if (!id_induk || !nama_pos) {
    return { error: 'Data tidak lengkap' }
  }

  const contractId: ContractId = 'OC-ORG-002';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Organization',
      entity_id: id_pos,
      owning_context_id: id_induk,
    },
    operation_payload: {},
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    return { error: 'System configuration error (Authorization).' };
  }
  if (result.decision.result === 'DENY') {
    return { error: result.decision.error_detail || 'Access denied.' };
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabaseAdmin.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  const latitude = latStr ? parseFloat(latStr) : null
  const longitude = lngStr ? parseFloat(lngStr) : null

  let foto_url: string | undefined = undefined

  if (photo && photo.size > 0) {
    const fileExt = photo.name.split('.').pop() || 'jpg'
    const fileName = `${id_pos}-${Date.now()}.${fileExt}`
    const filePath = `${id_pos}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('pos-pelkes-images')
      .upload(filePath, photo, {
        contentType: photo.type || 'image/jpeg',
        upsert: true
      })

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('pos-pelkes-images')
        .getPublicUrl(filePath)

      foto_url = publicUrlData?.publicUrl || filePath
    }
  }

  const updatePayload: any = {
    id_induk,
    nama_pos,
    kategori,
    alamat,
    latitude,
    longitude,
    keterangan,
    updated_at: new Date().toISOString(),
  }

  if (foto_url) {
    updatePayload.foto_url = foto_url
  }

  let { error } = await supabase
    .from('m_pos_pelkes')
    .update(updatePayload)
    .eq('id_pos', id_pos)

  if (error) {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error: adminError } = await supabaseAdmin
      .from('m_pos_pelkes')
      .update(updatePayload)
      .eq('id_pos', id_pos)

    error = adminError
  }

  if (error) {
    return { error: `Gagal memperbarui Pos Pelkes: ${error.message}` }
  }

  await supabaseAdmin.from('t_log_aktivitas').insert({
    id_log: `LOG-ORG-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'org.update',
    objek_type: 'Organization',
    objek_id: id_pos,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Memperbarui Pos Pelkes ${nama_pos}`
  });

  revalidatePath(`/dashboard/pos-pelkes/${id_pos}`)
  revalidatePath('/dashboard/pos-pelkes')
  return { success: true }
}

export async function deletePosPelkes(id_pos: string) {
  // const supabase = await createClient()

  const contractId: ContractId = 'OC-ORG-004';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Organization',
      entity_id: id_pos,
      owning_context_id: null,
    },
    operation_payload: {},
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    return { error: 'System configuration error (Authorization).' };
  }
  if (result.decision.result === 'DENY') {
    return { error: result.decision.error_detail || 'Access denied.' };
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabaseAdmin.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  let { error } = await supabaseAdmin
    .from('m_pos_pelkes')
    .delete()
    .eq('id_pos', id_pos)

  if (error) {
    return { error: `Gagal menghapus Pos Pelkes: ${error.message}` }
  }

  await supabaseAdmin.from('t_log_aktivitas').insert({
    id_log: `LOG-ORG-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'org.delete',
    objek_type: 'Organization',
    objek_id: id_pos,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Menghapus Pos Pelkes ${id_pos}`
  });

  revalidatePath('/dashboard/pos-pelkes')
  return { success: true }
}

