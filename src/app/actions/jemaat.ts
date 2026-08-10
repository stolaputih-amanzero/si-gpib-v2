'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { enforceContract } from '@/lib/authorization';
import type { ContractId } from '@/lib/authorization/types';

export async function saveJemaatInduk(formData: FormData) {
  const supabase = await createClient();

  const isEdit = formData.get('isEdit') === 'true';
  const id_induk = formData.get('id_induk') as string;
  const id_mupel = formData.get('id_mupel') as string;
  const nama_induk = formData.get('nama_induk') as string;
  const alamat = (formData.get('alamat') as string) || null;
  const latStr = formData.get('latitude') as string | null;
  const lngStr = formData.get('longitude') as string | null;
  const id_kmj = (formData.get('id_kmj') as string) || null;
  const keterangan = (formData.get('keterangan') as string) || null;
  const jumlah_sektor = parseInt((formData.get('jumlah_sektor') as string) || '0', 10);
  const jumlah_kk = parseInt((formData.get('jumlah_kk') as string) || '0', 10);
  const jumlah_jiwa = parseInt((formData.get('jumlah_jiwa') as string) || '0', 10);
  const photo = formData.get('photo') as File | null;

  if (!id_induk || !nama_induk) {
    return { error: 'ID Jemaat Induk dan Nama Jemaat Induk wajib diisi' };
  }

  const contractId: ContractId = isEdit ? 'OC-ORG-002' : 'OC-ORG-001';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Organization',
      entity_id: isEdit ? id_induk : null,
      owning_context_id: id_mupel,
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

  // Inject session context
  await supabaseAdmin.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  const latitude = latStr ? parseFloat(latStr) : null;
  const longitude = lngStr ? parseFloat(lngStr) : null;

  let foto_url: string | null = null;

  if (photo && photo.size > 0) {
    const fileExt = photo.name.split('.').pop() || 'jpg';
    const fileName = `${id_induk}-${Date.now()}.${fileExt}`;
    const filePath = `jemaat-induk/${id_induk}/${fileName}`;

    // 1. Try standard client upload
    const { error: uploadError } = await supabase.storage
      .from('pos-pelkes-images')
      .upload(filePath, photo, {
        contentType: photo.type || 'image/jpeg',
        upsert: true,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('pos-pelkes-images')
        .getPublicUrl(filePath);
      foto_url = publicUrlData?.publicUrl || filePath;
    } else {
      // 2. Admin fallback via Service Role Key (bypasses RLS completely)
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { error: adminUploadErr } = await supabaseAdmin.storage
        .from('pos-pelkes-images')
        .upload(filePath, photo, {
          contentType: photo.type || 'image/jpeg',
          upsert: true,
        });

      if (!adminUploadErr) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('pos-pelkes-images')
          .getPublicUrl(filePath);
        foto_url = publicUrlData?.publicUrl || filePath;
      } else {
        console.error('Storage upload admin fallback error:', adminUploadErr);
        return { error: `Gagal mengunggah foto profil: ${adminUploadErr.message}` };
      }
    }
  }

  const payload: any = {
    nama_induk,
    alamat,
    latitude,
    longitude,
    id_kmj,
    keterangan,
    jumlah_sektor,
    jumlah_kk,
    jumlah_jiwa,
    updated_at: new Date().toISOString(),
  };

  if (foto_url) {
    payload.foto_url = foto_url;
  }

  if (isEdit) {
    let { error } = await supabase
      .from('m_jemaat_induk')
      .update(payload)
      .eq('id_induk', id_induk);

    if (error) {
      const { error: adminErr } = await supabaseAdmin
        .from('m_jemaat_induk')
        .update(payload)
        .eq('id_induk', id_induk);
      error = adminErr;
    }

    if (error) {
      return { error: `Gagal memperbarui Jemaat Induk: ${error.message}` };
    }
  } else {
    payload.id_induk = id_induk;
    payload.id_mupel = id_mupel;
    payload.created_at = new Date().toISOString();

    let { error } = await supabase
      .from('m_jemaat_induk')
      .insert(payload);

    if (error) {
      const { error: adminErr } = await supabaseAdmin
        .from('m_jemaat_induk')
        .insert(payload);
      error = adminErr;
    }

    if (error) {
      return { error: `Gagal menambahkan Jemaat Induk: ${error.message}` };
    }
  }

  // Audit
  await supabaseAdmin.from('t_log_aktivitas').insert({
    id_log: `LOG-ORG-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: isEdit ? 'org.update' : 'org.create',
    objek_type: 'Organization',
    objek_id: id_induk,
    aktor: result.role_binding.effective_system_role,
    keterangan: `${isEdit ? 'Memperbarui' : 'Membuat'} Jemaat Induk ${nama_induk}`
  });

  if (id_mupel) {
    revalidatePath(`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(id_induk)}`);
    revalidatePath(`/hierarki/${encodeURIComponent(id_mupel)}`);
  }
  revalidatePath('/hierarki');

  return { success: true, foto_url };
}
