'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function validateCreateAccess(supabase: any, id_induk: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: Pengguna tidak terautentikasi')
  }

  const { data: userAuth } = await supabase
    .from('users')
    .select('role, id_mupel, id_induk, id_pos')
    .eq('id', user.id)
    .maybeSingle()

  const role = userAuth?.role || user.user_metadata?.role || 'guest'

  if (['super_user', 'superadmin', 'sinode'].includes(role)) {
    return true
  }

  const { data: targetJemaat } = await supabase
    .from('m_jemaat_induk')
    .select('id_mupel')
    .eq('id_induk', id_induk)
    .maybeSingle()

  if (!targetJemaat) {
    throw new Error('Unauthorized: Jemaat Induk tidak ditemukan')
  }

  const targetMupelId = targetJemaat.id_mupel

  const isAllowed =
    (role === 'admin_mupel' && userAuth?.id_mupel === targetMupelId) ||
    (['kmj', 'admin_jemaat', 'pj_pos', 'pelayan', 'relawan'].includes(role) && userAuth?.id_induk === id_induk)

  if (!isAllowed) {
    throw new Error('Unauthorized: Anda tidak memiliki hak akses tulis untuk Jemaat Induk ini')
  }

  return true
}

async function validateWriteAccess(supabase: any, targetIdPos: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: Pengguna tidak terautentikasi')
  }

  const { data: userAuth } = await supabase
    .from('users')
    .select('role, id_mupel, id_induk, id_pos')
    .eq('id', user.id)
    .maybeSingle()

  const role = userAuth?.role || user.user_metadata?.role || 'guest'

  if (['super_user', 'superadmin', 'sinode'].includes(role)) {
    return true
  }

  const { data: targetPos } = await supabase
    .from('m_pos_pelkes')
    .select('id_induk, jemaat_induk:m_jemaat_induk(id_mupel)')
    .eq('id_pos', targetIdPos)
    .maybeSingle()

  if (!targetPos) {
    throw new Error('Unauthorized: Pos Pelkes tidak ditemukan')
  }

  const targetJemaatId = targetPos.id_induk
  const targetMupelId = (targetPos.jemaat_induk as any)?.id_mupel

  const isAllowed =
    (role === 'admin_mupel' && userAuth?.id_mupel === targetMupelId) ||
    (['kmj', 'admin_jemaat', 'pj_pos'].includes(role) && userAuth?.id_induk === targetJemaatId) ||
    (['pelayan', 'relawan'].includes(role) && (
      (userAuth?.id_induk && userAuth.id_induk === targetJemaatId) ||
      (userAuth?.id_pos && userAuth.id_pos === targetIdPos)
    ))

  if (!isAllowed) {
    throw new Error('Unauthorized: Anda tidak memiliki hak akses tulis untuk Pos Pelkes ini')
  }

  return true
}

export async function savePosPelkes(formData: FormData) {
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

  try {
    await validateCreateAccess(supabase, id_induk)
  } catch (authError: any) {
    return { error: authError.message }
  }

  const latitude = latStr ? parseFloat(latStr) : null
  const longitude = lngStr ? parseFloat(lngStr) : null

  // Generate ID Pos (Format: POS-{random5})
  const id_pos = `POS-${Math.floor(10000 + Math.random() * 90000)}`

  // 1. Insert ke m_pos_pelkes
  const { error: posError } = await supabase
    .from('m_pos_pelkes')
    .insert({
      id_pos,
      id_induk,
      nama_pos,
      kategori,
      alamat,
      latitude,
      longitude,
      tgl_berdiri: new Date().toISOString().split('T')[0], // Default today
      keterangan: 'Diinput via Sistem PWA'
    })

  if (posError) {
    return { error: `Gagal menyimpan Pos Pelkes: ${posError.message}` }
  }

  // 2. Jika ada foto, proses unggah dan aset
  if (photo && photo.size > 0) {
    const fileExt = photo.name.split('.').pop() || 'jpg'
    const fileName = `${id_pos}-${Date.now()}.${fileExt}`
    const filePath = `${id_pos}/${fileName}`

    // 2a. Upload file ke storage bucket 'pos-pelkes-images'
    const { error: uploadError } = await supabase.storage
      .from('pos-pelkes-images')
      .upload(filePath, photo, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      // Continue anyway, but maybe log it. We won't block the whole process just for the image error.
      console.error('Failed to upload image:', uploadError.message)
    } else {
      // 2b. Buat record t_aset_tanah (karena lampiran butuh id_tanah, sesuai instruksi)
      const id_tanah = `TNH-${Math.floor(10000 + Math.random() * 90000)}`
      
      const { error: tanahError } = await supabase
        .from('t_aset_tanah')
        .insert({
          id_tanah,
          id_pos,
          keterangan: 'Tanah default dari input awal',
          status_hukum: 'Belum Diketahui'
        })

      if (!tanahError) {
        // 2c. Insert ke t_lampiran_aset
        const id_lampiran = `LMP-${Math.floor(10000 + Math.random() * 90000)}`
        await supabase
          .from('t_lampiran_aset')
          .insert({
            id_lampiran,
            id_tanah,
            nama_file: fileName,
            file_path: filePath,
            tipe_file: 'image/jpeg',
            ukuran_file: parseFloat((photo.size / 1024).toFixed(2)), // in KB
            keterangan: 'Foto awal Pos Pelkes'
          })
      }
    }
  }

  revalidatePath('/dashboard/pos-pelkes')
  return { success: true, id_pos }
}

export async function updatePosPelkes(id_pos: string, formData: FormData) {
  const supabase = await createClient()

  const id_induk = formData.get('id_induk') as string
  const nama_pos = formData.get('nama_pos') as string
  const kategori = (formData.get('kategori') as string) || 'Pos Pelkes'
  const alamat = (formData.get('alamat') as string) || null
  const latStr = formData.get('latitude') as string | null
  const lngStr = formData.get('longitude') as string | null
  const keterangan = formData.get('keterangan') as string | null

  if (!id_induk || !nama_pos) {
    return { error: 'Data tidak lengkap' }
  }

  try {
    await validateWriteAccess(supabase, id_pos)
  } catch (authError: any) {
    return { error: authError.message }
  }

  const latitude = latStr ? parseFloat(latStr) : null
  const longitude = lngStr ? parseFloat(lngStr) : null

  const { error } = await supabase
    .from('m_pos_pelkes')
    .update({
      id_induk,
      nama_pos,
      kategori,
      alamat,
      latitude,
      longitude,
      keterangan
    })
    .eq('id_pos', id_pos)

  if (error) {
    return { error: `Gagal memperbarui Pos Pelkes: ${error.message}` }
  }

  revalidatePath(`/dashboard/pos-pelkes/${id_pos}`)
  revalidatePath('/dashboard/pos-pelkes')
  return { success: true }
}

export async function deletePosPelkes(id_pos: string) {
  const supabase = await createClient()

  try {
    await validateWriteAccess(supabase, id_pos)
  } catch (authError: any) {
    return { error: authError.message }
  }

  const { error } = await supabase
    .from('m_pos_pelkes')
    .delete()
    .eq('id_pos', id_pos)

  if (error) {
    return { error: `Gagal menghapus Pos Pelkes: ${error.message}` }
  }

  return { success: true }
}

