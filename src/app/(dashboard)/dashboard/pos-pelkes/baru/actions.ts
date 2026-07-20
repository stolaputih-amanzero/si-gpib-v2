'use server'

import { createClient } from '@/lib/supabase/server'

export async function savePosPelkes(formData: FormData) {
  const supabase = await createClient()

  const id_induk = formData.get('id_induk') as string
  const nama_pos = formData.get('nama_pos') as string
  const kategori = (formData.get('kategori') as string) || 'Pos Pelkes'
  const alamat = formData.get('alamat') as string
  const latStr = formData.get('latitude') as string | null
  const lngStr = formData.get('longitude') as string | null
  const photo = formData.get('photo') as File | null

  if (!id_induk || !nama_pos || !alamat) {
    return { error: 'Data tidak lengkap' }
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

  return { success: true, id_pos }
}
