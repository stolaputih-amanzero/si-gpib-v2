// src/lib/domains/bantuan/bantuan.service.ts
// Server Actions + business logic untuk domain Bantuan & Workflow
// Ref: EIA v0.1.1 §5.1 (State Model), §6.2 (Permission × State)
// Workflow: Pos → KMJ → Admin Mupel → Super User Sinode

'use server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import {
  type PengajuanBantuanWithRelations
} from './bantuan.types';



type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

// ============================================================
// GET — Detail Pengajuan (dengan relations)
// ============================================================

export async function getPengajuanDetail(
  idAjuan: string
): Promise<ActionResult<PengajuanBantuanWithRelations>> {
  try {
    const supabase = await createClient();

    const { data: pengajuan, error } = await supabase
      .from('t_pengajuan_bantuan')
      .select('*')
      .eq('id_ajuan', idAjuan)
      .single();

    if (error || !pengajuan) {
      return {
        success: false,
        error: 'Pengajuan bantuan tidak ditemukan',
        code: 'NOT_FOUND',
      };
    }

    // Ambil nama pos
    const { data: pos } = await supabase
      .from('m_pos_pelkes')
      .select('nama_pos')
      .eq('id_pos', pengajuan.id_pos)
      .single();

    // Ambil nama pemohon
    const { data: pemohon } = await supabase
      .from('users')
      .select('nama_lengkap')
      .eq('id', pengajuan.diajukan_oleh)
      .single();

    // Ambil approvals
    const { data: approvals } = await supabase
      .from('t_approval_bantuan')
      .select('*')
      .eq('id_ajuan', idAjuan)
      .order('created_at', { ascending: true });

    // Ambil pengajuan sebelumnya (jika ada — untuk badge "Pernah ditolak")
    let riwayatSebelumnya = undefined;
    if (pengajuan.id_pengajuan_sebelumnya) {
      const { data: prev } = await supabase
        .from('t_pengajuan_bantuan')
        .select('id_ajuan, status, created_at')
        .eq('id_ajuan', pengajuan.id_pengajuan_sebelumnya)
        .single();

      if (prev) {
        riwayatSebelumnya = prev;
      }
    }

    return {
      success: true,
      data: {
        ...pengajuan,
        nama_pos: pos?.nama_pos ?? 'Unknown',
        nama_pemohon: pemohon?.nama_lengkap ?? 'Unknown',
        riwayat_pengajuan_sebelumnya: riwayatSebelumnya,
        approvals: approvals ?? [],
      },
    };
  } catch (error) {
    logger.error('Error saat ambil detail pengajuan', error as Error);
    return { success: false, error: 'Terjadi kesalahan yang tidak terduga', code: 'INTERNAL_ERROR' };
  }
}
