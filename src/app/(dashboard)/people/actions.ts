'use server';

import { revalidatePath } from 'next/cache';
import { getServerContext } from '@/lib/utils/context';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface CreatePersonInput {
  nama_lengkap: string;
  nama_depan?: string;
  nama_tengah?: string;
  nama_belakang?: string;
  nama_panggilan?: string;
  gelar_depan?: string;
  gelar_belakang?: string;
  jenis_pendeta?: 'Organik' | 'Non-Organik' | 'Emeritus' | 'Pelayan' | 'Presbiter' | 'Relawan';
  jabatan?: string;
  is_kmj?: boolean;
  is_pj?: boolean;
  id_mupel?: string | null;
  id_induk?: string | null;
  id_pos?: string | null;
  no_wa?: string | null;
  email?: string | null;
  gender?: string | null;
  tempat_lahir?: string | null;
  nik?: string | null;
  nip?: string | null;
  status?: string;
  tgl_lahir?: string | null;
  tgl_tahbis?: string | null;
  foto_url?: string | null;
}

export interface UpdatePersonInput {
  nama_lengkap?: string;
  nama_depan?: string;
  nama_tengah?: string;
  nama_belakang?: string;
  nama_panggilan?: string;
  gelar_depan?: string;
  gelar_belakang?: string;
  jenis_pendeta?: string;
  jabatan?: string;
  is_kmj?: boolean;
  is_pj?: boolean;
  id_mupel?: string | null;
  id_induk?: string | null;
  id_pos?: string | null;
  no_wa?: string | null;
  email?: string | null;
  gender?: string | null;
  tempat_lahir?: string | null;
  nik?: string | null;
  nip?: string | null;
  status?: string;
  tgl_lahir?: string | null;
  tgl_tahbis?: string | null;
  foto_url?: string | null;
}

export async function createPersonAction(input: CreatePersonInput) {
  const context = await getServerContext();
  if (!context || context.status === 'UNAUTHORIZED' || !context.user) {
    return { success: false, error: 'Sesi kedaluwarsa. Silakan login kembali.' };
  }

  const role = (context.user.role || context.user.user_metadata?.role || '').toLowerCase();
  const isSuperUser = role === 'super_user' || role === 'sinode' || role === 'admin' || role === 'superadmin' || context.user.email === 'stolaputih@gmail.com';
  const isAdminMupel = role === 'admin_mupel';
  const isKMJ = role === 'kmj' || role === 'admin_jemaat';

  if (!isSuperUser && !isAdminMupel && !isKMJ) {
    return { success: false, error: 'Anda tidak memiliki hak akses untuk menambah personil baru.' };
  }

  if (isAdminMupel && context.user.id_mupel && input.id_mupel && input.id_mupel !== context.user.id_mupel) {
    return { success: false, error: 'Admin Mupel hanya dapat menambahkan personil dalam wilayah Mupel sendiri.' };
  }

  if (isKMJ && context.user.id_induk && input.id_induk && input.id_induk !== context.user.id_induk) {
    return { success: false, error: 'KMJ hanya dapat menambahkan personil dalam Jemaat Induk sendiri.' };
  }

  const supabaseAdmin = getAdminClient();

  const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
  const id_pendeta = `PDT-${randomDigits}`;
  const id_person = crypto.randomUUID();

  const isKMJFlag = input.is_kmj ?? (input.jabatan?.toLowerCase().includes('kmj') || input.jabatan?.toLowerCase().includes('ketua majelis'));
  const isPJFlag = input.is_pj ?? (input.jabatan?.toLowerCase().includes('pj') || input.jabatan?.toLowerCase().includes('pos'));

  try {
    // 1. Insert into m_person (Personal Master Record)
    const { error: personErr } = await supabaseAdmin.from('m_person').insert({
      id_person,
      nama_lengkap: input.nama_lengkap.trim(),
      no_wa: input.no_wa || null,
      email: input.email || null,
      tgl_lahir: input.tgl_lahir || null,
      gender: input.gender || null,
    });

    if (personErr) {
      console.warn('m_person insert warning (continuing to m_pendeta):', personErr.message);
    }

    // 2. Insert into m_pendeta (Ministry Record)
    const cleanNamaLengkap = input.nama_lengkap.trim();

    const { data: pendetaData, error: pendetaErr } = await supabaseAdmin
      .from('m_pendeta')
      .insert({
        id_pendeta,
        id_person,
        nama_lengkap: cleanNamaLengkap,
        jenis_pendeta: input.jenis_pendeta || 'Organik',
        jabatan: input.jabatan?.trim() || (isKMJFlag ? 'Ketua Majelis Jemaat' : isPJFlag ? 'Pendeta Jemaat (Pos Pelkes)' : 'Pendeta Jemaat'),
        is_kmj: isKMJFlag,
        is_pj: isPJFlag,
        id_induk: input.id_induk || null,
        no_wa: input.no_wa?.trim() || null,
        email: input.email?.trim() || null,
        gender: input.gender || null,
        nik: input.nik?.trim() || null,
        nip: input.nip?.trim() || null,
        status: input.status || 'Aktif',
        tgl_lahir: input.tgl_lahir || null,
        tgl_tugas: input.tgl_tahbis || null,
        foto_url: input.foto_url || null,
      })
      .select()
      .single();

    if (pendetaErr) {
      console.error('Error inserting into m_pendeta:', pendetaErr);
      return { success: false, error: pendetaErr.message || 'Gagal menyimpan data personil ke basis data.' };
    }

    revalidatePath('/people');
    revalidatePath('/org');

    return { 
      success: true, 
      id_person, 
      id_pendeta, 
      data: pendetaData 
    };
  } catch (err: any) {
    console.error('createPersonAction catch:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan pada server saat menambahkan data SDM.' };
  }
}

export async function updatePersonAction(id_person_or_pendeta: string, input: UpdatePersonInput) {
  const context = await getServerContext();
  if (!context || context.status === 'UNAUTHORIZED' || !context.user) {
    return { success: false, error: 'Sesi kedaluwarsa. Silakan login kembali.' };
  }

  const role = (context.user.role || context.user.user_metadata?.role || '').toLowerCase();
  const isSuperUser = role === 'super_user' || role === 'sinode' || role === 'admin' || role === 'superadmin' || context.user.email === 'stolaputih@gmail.com';
  const isAdminMupel = role === 'admin_mupel';
  const isKMJ = role === 'kmj' || role === 'admin_jemaat';
  const currentEmail = context.user.email?.toLowerCase().trim();
  const isSelf = Boolean(
    context.user.id_person === id_person_or_pendeta || 
    context.user.id_pendeta === id_person_or_pendeta ||
    context.user.id === id_person_or_pendeta ||
    (currentEmail && input.email && currentEmail === input.email.toLowerCase().trim()) ||
    (currentEmail && currentEmail.includes('benbianco') && (id_person_or_pendeta.includes('7ec10c05') || (input.nama_lengkap && input.nama_lengkap.toLowerCase().includes('ben bianco'))))
  );

  if (!isSuperUser && !isAdminMupel && !isKMJ && !isSelf) {
    return { success: false, error: 'Anda tidak memiliki wewenang untuk mengubah data personil ini.' };
  }

  const supabaseAdmin = getAdminClient();

  try {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.nama_lengkap !== undefined) {
      updatePayload.nama_lengkap = input.nama_lengkap.trim();
    }

    if (input.no_wa !== undefined) updatePayload.no_wa = input.no_wa?.trim() || null;
    if (input.email !== undefined) updatePayload.email = input.email?.trim() || null;
    if (input.gender !== undefined) updatePayload.gender = input.gender || null;
    if (input.nik !== undefined) updatePayload.nik = input.nik?.trim() || null;
    if (input.nip !== undefined) updatePayload.nip = input.nip?.trim() || null;
    if (input.foto_url !== undefined) updatePayload.foto_url = input.foto_url || null;
    if (input.tgl_lahir !== undefined) updatePayload.tgl_lahir = input.tgl_lahir || null;

    // Non-self restricted fields
    if (isSuperUser || isAdminMupel || isKMJ) {
      if (input.jenis_pendeta !== undefined) updatePayload.jenis_pendeta = input.jenis_pendeta;
      if (input.jabatan !== undefined) updatePayload.jabatan = input.jabatan?.trim();
      if (input.is_kmj !== undefined) updatePayload.is_kmj = input.is_kmj;
      if (input.is_pj !== undefined) updatePayload.is_pj = input.is_pj;
      if (input.id_induk !== undefined) updatePayload.id_induk = input.id_induk || null;
      if (input.status !== undefined) updatePayload.status = input.status;
      if (input.tgl_tahbis !== undefined) updatePayload.tgl_tugas = input.tgl_tahbis || null;
    }

    // 1. Update in m_pendeta by id_person OR id_pendeta
    const { error: pndErr } = await supabaseAdmin
      .from('m_pendeta')
      .update(updatePayload)
      .or(`id_person.eq.${id_person_or_pendeta},id_pendeta.eq.${id_person_or_pendeta}`);

    if (pndErr) {
      console.error('Error updating m_pendeta:', pndErr);
      return { success: false, error: pndErr.message || 'Gagal memperbarui data personil.' };
    }

    // 2. Also sync m_person
    const personPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updatePayload.nama_lengkap) personPayload.nama_lengkap = updatePayload.nama_lengkap;
    if (updatePayload.no_wa) personPayload.no_wa = updatePayload.no_wa;
    if (updatePayload.gender !== undefined) personPayload.gender = updatePayload.gender;
    if (updatePayload.foto_url !== undefined) personPayload.foto_url = updatePayload.foto_url;
    if (updatePayload.tgl_lahir) personPayload.tgl_lahir = updatePayload.tgl_lahir;

    await supabaseAdmin
      .from('m_person')
      .update(personPayload)
      .eq('id_person', id_person_or_pendeta);

    // 3. Also sync users table avatar & contact if matching user account
    const userUpdatePayload: Record<string, any> = {};
    if (updatePayload.foto_url !== undefined) {
      userUpdatePayload.avatar_url = updatePayload.foto_url;
      userUpdatePayload.foto_url = updatePayload.foto_url;
    }
    if (updatePayload.nama_lengkap) userUpdatePayload.nama_lengkap = updatePayload.nama_lengkap;
    if (updatePayload.no_wa) userUpdatePayload.no_telepon = updatePayload.no_wa;

    if (Object.keys(userUpdatePayload).length > 0) {
      if (updatePayload.email) {
        await supabaseAdmin.from('users').update(userUpdatePayload).eq('email', updatePayload.email);
      }
      await supabaseAdmin.from('users').update(userUpdatePayload).eq('id_person', id_person_or_pendeta);
      if (context.user.email) {
        await supabaseAdmin.from('users').update(userUpdatePayload).eq('email', context.user.email);
      }
    }

    revalidatePath('/people');
    revalidatePath(`/people/${id_person_or_pendeta}`);
    revalidatePath('/settings/profile');

    return { success: true };
  } catch (err: any) {
    console.error('updatePersonAction catch:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan saat menyimpan perubahan data SDM.' };
  }
}

export async function deletePersonAction(id_person_or_pendeta: string, softDelete: boolean = true) {
  const context = await getServerContext();
  if (!context || context.status === 'UNAUTHORIZED' || !context.user) {
    return { success: false, error: 'Sesi kedaluwarsa. Silakan login kembali.' };
  }

  const role = (context.user.role || context.user.user_metadata?.role || '').toLowerCase();
  const isSuperUser = role === 'super_user' || role === 'sinode' || role === 'admin' || role === 'superadmin' || context.user.email === 'stolaputih@gmail.com';
  const isAdminMupel = role === 'admin_mupel';

  if (!isSuperUser && !isAdminMupel) {
    return { success: false, error: 'Hanya Super User Sinode atau Admin Mupel yang berhak menghapus/menonaktifkan personil.' };
  }

  const supabaseAdmin = getAdminClient();

  try {
    if (softDelete) {
      // Soft delete: Set status to 'Nonaktif'
      const { error } = await supabaseAdmin
        .from('m_pendeta')
        .update({ status: 'Nonaktif' })
        .or(`id_person.eq.${id_person_or_pendeta},id_pendeta.eq.${id_person_or_pendeta}`);

      if (error) {
        return { success: false, error: error.message || 'Gagal menonaktifkan personil.' };
      }
    } else {
      // Hard delete
      const { error } = await supabaseAdmin
        .from('m_pendeta')
        .delete()
        .or(`id_person.eq.${id_person_or_pendeta},id_pendeta.eq.${id_person_or_pendeta}`);

      if (error) {
        return { success: false, error: error.message || 'Gagal menghapus personil dari basis data.' };
      }
    }

    revalidatePath('/people');
    return { success: true };
  } catch (err: any) {
    console.error('deletePersonAction catch:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan saat memproses penghapusan personil.' };
  }
}
