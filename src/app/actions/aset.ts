'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { asetTanahSchema, asetBangunanSchema, asetBergerakSchema } from '@/lib/validations/aset.schema';
import { revalidatePath } from 'next/cache';
import { enforceContract } from '@/lib/authorization';
import type { ContractId } from '@/lib/authorization/types';

function getDbClient(supabaseServerClient: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    return createSupabaseAdmin(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseServerClient;
}

export async function createAsetAction(payload: {
  jenis_aset: 'tanah' | 'bangunan' | 'bergerak';
  id_pos: string;
  data: any;
  foto_base64?: string | null;
  dokumen_paths?: string[];
}) {
  const supabase = await createClient();
  const db = getDbClient(supabase);

  let insertedData: any = null;
  let asetId: string = '';

  const contractId: ContractId = 'OC-ASSET-001';
  const result = await enforceContract(contractId, {
    target_entity: {
      entity_type: 'Asset',
      entity_id: null,
      owning_context_id: payload.id_pos,
    },
    operation_payload: {},
  });

  if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
    throw new Error('System configuration error (Authorization).');
  }
  if (result.decision.result === 'DENY') {
    throw new Error(result.decision.error_detail || 'Access denied.');
  }

  await db.rpc('set_authorization_context', {
    p_context_id: result.context_resolution.active_context?.context_id || '',
    p_context_level: result.context_resolution.active_context?.context_level || '',
    p_user_id: result.identity_resolution.base_identity?.user_account_id || '',
    p_person_id: result.identity_resolution.base_identity?.person_linkage.person_id || '',
    p_effective_role: result.role_binding.effective_system_role || '',
  });

  if (payload.jenis_aset === 'tanah') {
    const validated = asetTanahSchema.parse(payload.data);
    asetId = `TNH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { data, error } = await db
      .from('t_aset_tanah')
      .insert({
        id_tanah: asetId,
        id_pos: validated.id_pos,
        luas_m2: validated.luas_m2,
        thn_perolehan: validated.thn_perolehan,
        status_hukum: validated.status_hukum,
        kondisi: validated.kondisi,
        potensi_sda: validated.potensi_sda || null,
        keterangan: validated.keterangan || null,
        latitude: validated.latitude,
        longitude: validated.longitude,
        foto_url: payload.foto_base64 || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Insert t_aset_tanah error:', error);
      throw new Error(error.message || 'Gagal menyimpan aset tanah');
    }
    insertedData = data;
  } else if (payload.jenis_aset === 'bangunan') {
    const validated = asetBangunanSchema.parse(payload.data);
    asetId = `BGN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { data, error } = await db
      .from('t_aset_bangunan')
      .insert({
        id_bangunan: asetId,
        id_pos: validated.id_pos,
        fungsi: validated.fungsi,
        kondisi: validated.kondisi,
        thn_berdiri: validated.thn_berdiri,
        keterangan: validated.keterangan || null,
        latitude: validated.latitude,
        longitude: validated.longitude,
        foto_url: payload.foto_base64 || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Insert t_aset_bangunan error:', error);
      throw new Error(error.message || 'Gagal menyimpan aset bangunan');
    }
    insertedData = data;
  } else if (payload.jenis_aset === 'bergerak') {
    const validated = asetBergerakSchema.parse(payload.data);
    asetId = `BRG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const tglPajakStr = validated.tgl_pajak
      ? typeof validated.tgl_pajak === 'string'
        ? validated.tgl_pajak
        : validated.tgl_pajak.toISOString().split('T')[0]
      : null;

    const { data, error } = await db
      .from('t_aset_bergerak')
      .insert({
        id_aset_b: asetId,
        id_pos: validated.id_pos,
        jenis: validated.jenis,
        merk_tipe: validated.merk_tipe,
        kondisi: validated.kondisi || 'Baik',
        thn_perolehan: validated.thn_perolehan,
        no_polisi: validated.no_polisi || null,
        tgl_pajak: tglPajakStr,
        keterangan: validated.keterangan || null,
        latitude: validated.latitude,
        longitude: validated.longitude,
        foto_url: payload.foto_base64 || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Insert t_aset_bergerak error:', error);
      throw new Error(error.message || 'Gagal menyimpan aset bergerak');
    }
    insertedData = data;
  }

  if (payload.dokumen_paths && payload.dokumen_paths.length > 0) {
    for (const filePath of payload.dokumen_paths) {
      await db.from('t_lampiran_aset').insert({
        id_lampiran: `LMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        id_tanah: payload.jenis_aset === 'tanah' ? asetId : null,
        id_bangunan: payload.jenis_aset === 'bangunan' ? asetId : null,
        id_aset_b: payload.jenis_aset === 'bergerak' ? asetId : null,
        file_path: filePath,
        created_at: new Date().toISOString(),
      });
    }
  }

  await db.from('t_log_aktivitas').insert({
    id_log: `LOG-ASET-${Date.now()}`,
    id_user: result.identity_resolution.base_identity?.user_account_id,
    aksi: 'asset.create',
    objek_type: 'Asset',
    objek_id: asetId,
    aktor: result.role_binding.effective_system_role,
    keterangan: `Membuat aset ${payload.jenis_aset} untuk pos pelkes ${payload.id_pos}`
  });

  revalidatePath('/aset');
  revalidatePath('/dashboard');
  revalidatePath(`/aset/${encodeURIComponent(payload.id_pos)}`);

  return insertedData;
}
