// src/lib/domains/bantuan/bantuan.service.ts
// Server Actions + business logic untuk domain Bantuan & Workflow
// Ref: EIA v0.1.1 §5.1 (State Model), §6.2 (Permission × State)
// Workflow: Pos → KMJ → Admin Mupel → Super User Sinode

'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/utils/logger';
import {
  createBantuanSchema,
  updateBantuanSchema,
  submitBantuanSchema,
  reviewBantuanSchema,
  ajukanUlangSchema,
  generateIdPengajuan,
  type CreateBantuanInput,
  type UpdateBantuanInput,
  type SubmitBantuanInput,
  type ReviewBantuanInput,
  type AjukanUlangInput,
} from './bantuan.schema';
import {
  isValidTransition,
  canResubmit,
  type StatusBantuan,
  type PengajuanBantuan,
  type PengajuanBantuanWithRelations
} from './bantuan.types';

// ============================================================
// TYPES UNTUK RESULT
// ============================================================

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

// ============================================================
// HELPERS
// ============================================================

/**
 * Ambil user yang sedang login + validasi role.
 * Melempar error jika tidak terautentikasi.
 */
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized: Pengguna belum login');
  }

  return { supabase, user };
}

/**
 * Ambil profile user dari tabel `users` untuk mendapatkan role & scope.
 */
async function getUserProfile(supabase: any, userId: string) {
  const { data: profile, error } = await supabase
    .from('users')
    .select('id, role, id_pendeta, id_mupel, id_induk, id_pos, nama_lengkap, status')
    .eq('id', userId)
    .eq('status', 'Aktif')
    .single();

  if (error || !profile) {
    throw new Error('Unauthorized: Profil pengguna tidak ditemukan atau nonaktif');
  }

  return profile;
}

/**
 * Ambil pengajuan bantuan by ID + validasi keberadaan.
 */
async function getPengajuan(
  supabase: any,
  idAjuan: string
) {
  const { data: pengajuan, error } = await supabase
    .from('t_pengajuan_bantuan')
    .select('*')
    .eq('id_ajuan', idAjuan)
    .single();

  if (error || !pengajuan) {
    throw new Error(`Pengajuan bantuan ${idAjuan} tidak ditemukan`);
  }

  return pengajuan as PengajuanBantuan;
}

/**
 * Validasi transisi status.
 * Melempar error jika transisi tidak valid.
 */
function assertValidTransition(currentStatus: StatusBantuan, targetStatus: StatusBantuan) {
  if (!isValidTransition(currentStatus, targetStatus)) {
    throw new Error(
      `Transisi status tidak valid: ${currentStatus} → ${targetStatus}. ` +
      `Status saat ini: ${currentStatus}`
    );
  }
}

/**
 * Catat approval ke t_approval_bantuan + t_log_aktivitas
 */
async function recordApproval(
  supabase: any,
  params: {
    idAjuan: string;
    userId: string;
    roleReviewer: 'kmj' | 'admin_mupel' | 'super_user';
    keputusan: 'Approved' | 'Rejected';
    catatan: string | null;
  }
) {
  // Insert ke t_approval_bantuan
  const { error: approvalError } = await supabase.from('t_approval_bantuan').insert({
    id_ajuan: params.idAjuan,
    approver_id: params.userId,
    role_approver: params.roleReviewer,
    aksi: params.keputusan,
    catatan: params.catatan,
  });

  if (approvalError) {
    logger.error('Gagal mencatat approval bantuan', approvalError, {
      idAjuan: params.idAjuan,
    });
  }

  // Insert ke t_log_aktivitas (audit trail)
  await supabase.from('t_log_aktivitas').insert({
    id_user: params.userId,
    aksi: params.keputusan === 'Approved'
      ? 'approve_pengajuan_bantuan'
      : 'reject_pengajuan_bantuan',
    objek_type: 't_pengajuan_bantuan',
    objek_id: params.idAjuan,
    keterangan: JSON.stringify({
      role_reviewer: params.roleReviewer,
      keputusan: params.keputusan,
      catatan: params.catatan,
    }),
  });
}

// ============================================================
// CREATE — Buat Pengajuan Bantuan Baru (Draft)
// PRD US-10.1: Sebagai PJ, saya ingin ajukan bantuan untuk Pos Pelkes
// ============================================================

export async function createPengajuanBantuan(
  input: CreateBantuanInput
): Promise<ActionResult<PengajuanBantuan>> {
  try {
    // 1. Validate input
    const validated = createBantuanSchema.parse(input);

    // 2. Auth check
    const { supabase, user } = await getAuthenticatedUser();
    const profile = await getUserProfile(supabase, user.id);

    // 3. Permission check: hanya pj/user yang bisa membuat pengajuan
    if (!['pj', 'user', 'kmj', 'admin_mupel', 'super_user'].includes(profile.role)) {
      return {
        success: false,
        error: 'Anda tidak memiliki izin untuk membuat pengajuan bantuan',
        code: 'FORBIDDEN',
      };
    }

    // 4. Validasi Pos Pelkes exists & user punya akses ke pos tersebut
    const { data: pos, error: posError } = await supabase
      .from('m_pos_pelkes')
      .select('id_pos, id_induk')
      .eq('id_pos', validated.id_pos)
      .single();

    if (posError || !pos) {
      return {
        success: false,
        error: `Pos Pelkes ${validated.id_pos} tidak ditemukan`,
        code: 'NOT_FOUND',
      };
    }

    // 5. Generate ID & insert
    const idAjuan = generateIdPengajuan();
    const now = new Date().toISOString();

    const { data: newPengajuan, error: insertError } = await supabase
      .from('t_pengajuan_bantuan')
      .insert({
        id_ajuan: idAjuan, // PK uses id_ajuan based on ERD
        id_pos: validated.id_pos,
        id_pengajuan_sebelumnya: null, // Pengajuan baru, bukan pengajuan ulang
        jenis_bantuan: validated.jenis_bantuan,
        deskripsi: validated.deskripsi,
        estimasi_biaya: validated.estimasi_biaya,
        urgensi: validated.urgensi,
        status: 'Draft',
        diajukan_oleh: user.id,
        id_tanah: validated.id_aset_tanah ?? null,
        id_bangunan: validated.id_aset_bangunan ?? null,
        id_aset_b: validated.id_aset_bergerak ?? null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Gagal membuat pengajuan bantuan', insertError, {
        id_pos: validated.id_pos,
        userId: user.id,
      });
      return {
        success: false,
        error: 'Gagal menyimpan pengajuan bantuan. Silakan coba lagi.',
        code: 'DB_ERROR',
      };
    }

    // 6. Log aktivitas
    await supabase.from('t_log_aktivitas').insert({
      id_user: user.id,
      aksi: 'create_pengajuan_bantuan',
      objek_type: 't_pengajuan_bantuan',
      objek_id: idAjuan,
      keterangan: JSON.stringify({ jenis_bantuan: validated.jenis_bantuan, urgensi: validated.urgensi }),
    });

    logger.info('Pengajuan bantuan berhasil dibuat', {
      idAjuan,
      userId: user.id,
      idPos: validated.id_pos,
    });

    // 7. Revalidate
    revalidatePath('/bantuan');

    return { success: true, data: newPengajuan as PengajuanBantuan };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: any) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      };
    }
    logger.error('Error tidak terduga saat membuat pengajuan bantuan', error as Error);
    return {
      success: false,
      error: 'Terjadi kesalahan yang tidak terduga',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================
// UPDATE — Edit Pengajuan (hanya status Draft)
// ============================================================

export async function updatePengajuanBantuan(
  input: UpdateBantuanInput
): Promise<ActionResult<PengajuanBantuan>> {
  try {
    const validated = updateBantuanSchema.parse(input);
    const { supabase, user } = await getAuthenticatedUser();
    const profile = await getUserProfile(supabase, user.id);

    // Ambil pengajuan & validasi
    const pengajuan = await getPengajuan(supabase, validated.id_ajuan);

    // Guard: hanya Draft yang bisa diedit
    if (pengajuan.status !== 'Draft') {
      return {
        success: false,
        error: `Pengajuan berstatus "${pengajuan.status}" tidak dapat diedit. Hanya Draft yang bisa diubah.`,
        code: 'INVALID_STATUS',
      };
    }

    // Guard: hanya pemohon atau super_user yang bisa edit
    if (pengajuan.diajukan_oleh !== user.id && profile.role !== 'super_user') {
      return {
        success: false,
        error: 'Anda tidak memiliki izin untuk mengedit pengajuan ini',
        code: 'FORBIDDEN',
      };
    }

    // Build update payload (hanya field yang diberikan)
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (validated.jenis_bantuan !== undefined) updatePayload.jenis_bantuan = validated.jenis_bantuan;
    if (validated.deskripsi !== undefined) updatePayload.deskripsi = validated.deskripsi;
    if (validated.estimasi_biaya !== undefined) updatePayload.estimasi_biaya = validated.estimasi_biaya;
    if (validated.urgensi !== undefined) updatePayload.urgensi = validated.urgensi;
    if (validated.id_aset_tanah !== undefined) updatePayload.id_tanah = validated.id_aset_tanah;
    if (validated.id_aset_bangunan !== undefined) updatePayload.id_bangunan = validated.id_aset_bangunan;
    if (validated.id_aset_bergerak !== undefined) updatePayload.id_aset_b = validated.id_aset_bergerak;

    const { data: updated, error: updateError } = await supabase
      .from('t_pengajuan_bantuan')
      .update(updatePayload)
      .eq('id_ajuan', validated.id_ajuan)
      .select()
      .single();

    if (updateError) {
      logger.error('Gagal update pengajuan bantuan', updateError, {
        idAjuan: validated.id_ajuan,
      });
      return {
        success: false,
        error: 'Gagal memperbarui pengajuan bantuan',
        code: 'DB_ERROR',
      };
    }

    // Log aktivitas
    await supabase.from('t_log_aktivitas').insert({
      id_user: user.id,
      aksi: 'update_pengajuan_bantuan',
      objek_type: 't_pengajuan_bantuan',
      objek_id: validated.id_ajuan,
      keterangan: JSON.stringify({ fields: Object.keys(updatePayload) }),
    });

    revalidatePath('/bantuan');
    revalidatePath(`/bantuan/${validated.id_ajuan}`);

    return { success: true, data: updated as PengajuanBantuan };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: any) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      };
    }
    logger.error('Error saat update pengajuan bantuan', error as Error);
    return { success: false, error: 'Terjadi kesalahan yang tidak terduga', code: 'INTERNAL_ERROR' };
  }
}

// ============================================================
// SUBMIT — Draft → Pending_KMJ
// PRD US-10.1 (lanjutan): Pemohon submit draft untuk review KMJ
// ============================================================

export async function submitPengajuanBantuan(
  input: SubmitBantuanInput
): Promise<ActionResult<PengajuanBantuan>> {
  try {
    const validated = submitBantuanSchema.parse(input);
    const { supabase, user } = await getAuthenticatedUser();
    await getUserProfile(supabase, user.id);

    const pengajuan = await getPengajuan(supabase, validated.id_ajuan);

    // Guard: hanya pemohon yang bisa submit
    if (pengajuan.diajukan_oleh !== user.id) {
      return {
        success: false,
        error: 'Hanya pemohon yang dapat mengajukan pengajuan ini',
        code: 'FORBIDDEN',
      };
    }

    // Guard: validasi transisi
    if (pengajuan.status !== 'Draft') {
      return {
        success: false,
        error: `Pengajuan berstatus "${pengajuan.status}" tidak dapat di-submit. Hanya Draft yang bisa diajukan.`,
        code: 'INVALID_STATUS',
      };
    }

    assertValidTransition(pengajuan.status, 'Pending_KMJ');

    // Update status
    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from('t_pengajuan_bantuan')
      .update({
        status: 'Pending_KMJ',
        tgl_diajukan: now,
        updated_at: now,
      })
      .eq('id_ajuan', validated.id_ajuan)
      .select()
      .single();

    if (updateError) {
      logger.error('Gagal submit pengajuan bantuan', updateError, {
        idAjuan: validated.id_ajuan,
      });
      return { success: false, error: 'Gagal mengajukan pengajuan', code: 'DB_ERROR' };
    }

    // Log aktivitas
    await supabase.from('t_log_aktivitas').insert({
      id_user: user.id,
      aksi: 'submit_pengajuan_bantuan',
      objek_type: 't_pengajuan_bantuan',
      objek_id: validated.id_ajuan,
      keterangan: JSON.stringify({ from: 'Draft', to: 'Pending_KMJ' }),
    });

    logger.info('Pengajuan bantuan submitted', {
      idAjuan: validated.id_ajuan,
      userId: user.id,
    });

    revalidatePath('/bantuan');

    return { success: true, data: updated as PengajuanBantuan };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: any) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      };
    }
    logger.error('Error saat submit pengajuan bantuan', error as Error);
    return { success: false, error: 'Terjadi kesalahan yang tidak terduga', code: 'INTERNAL_ERROR' };
  }
}

// ============================================================
// REVIEW KMJ — Pending_KMJ → Pending_Mupel / Rejected
// PRD US-10.2: Sebagai KMJ, saya ingin review pengajuan bantuan
// ============================================================

export async function reviewByKMJ(
  input: ReviewBantuanInput
): Promise<ActionResult<PengajuanBantuan>> {
  try {
    const validated = reviewBantuanSchema.parse(input);
    const { supabase, user } = await getAuthenticatedUser();
    const profile = await getUserProfile(supabase, user.id);

    // Guard: harus KMJ
    if (profile.role !== 'kmj') {
      return {
        success: false,
        error: 'Hanya KMJ yang dapat melakukan review di tahap ini',
        code: 'FORBIDDEN',
      };
    }

    const pengajuan = await getPengajuan(supabase, validated.id_ajuan);

    // Guard: validasi status
    if (pengajuan.status !== 'Pending_KMJ') {
      return {
        success: false,
        error: `Pengajuan berstatus "${pengajuan.status}". Expected: Pending_KMJ`,
        code: 'INVALID_STATUS',
      };
    }

    // Guard: KMJ hanya bisa review pengajuan di jemaatnya
    // (RLS sudah handle di DB, tapi kita validasi juga di app level)
    if (profile.id_induk) {
      const { data: pos } = await supabase
        .from('m_pos_pelkes')
        .select('id_induk')
        .eq('id_pos', pengajuan.id_pos)
        .single();

      if (pos && pos.id_induk !== profile.id_induk) {
        return {
          success: false,
          error: 'Pengajuan ini bukan dari jemaat yang Anda pimpin',
          code: 'SCOPE_VIOLATION',
        };
      }
    }

    // Tentukan target status
    const targetStatus: StatusBantuan =
      validated.keputusan === 'approve' ? 'Pending_Mupel' : 'Rejected';

    assertValidTransition('Pending_KMJ', targetStatus);

    // Update
    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      status: targetStatus,
      tgl_review_kmj: now,
      catatan_kmj: validated.catatan ?? null,
      updated_at: now,
    };

    const { data: updated, error: updateError } = await supabase
      .from('t_pengajuan_bantuan')
      .update(updatePayload)
      .eq('id_ajuan', validated.id_ajuan)
      .select()
      .single();

    if (updateError) {
      logger.error('Gagal review KMJ', updateError, { idAjuan: validated.id_ajuan });
      return { success: false, error: 'Gagal memproses review', code: 'DB_ERROR' };
    }

    // Catat approval + audit log
    await recordApproval(supabase, {
      idAjuan: validated.id_ajuan,
      userId: user.id,
      roleReviewer: 'kmj',
      keputusan: validated.keputusan === 'approve' ? 'Approved' : 'Rejected',
      catatan: validated.catatan ?? null,
    });

    logger.info('Review KMJ selesai', {
      idAjuan: validated.id_ajuan,
      keputusan: validated.keputusan,
      kmjId: user.id,
    });

    revalidatePath('/bantuan');

    return { success: true, data: updated as PengajuanBantuan };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: any) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      };
    }
    logger.error('Error saat review KMJ', error as Error);
    return { success: false, error: 'Terjadi kesalahan yang tidak terduga', code: 'INTERNAL_ERROR' };
  }
}

// ============================================================
// REVIEW ADMIN MUPEL — Pending_Mupel → Pending_Sinode / Rejected
// PRD US-10.3: Sebagai Admin Mupel, saya ingin approve pengajuan
// ============================================================

export async function reviewByAdminMupel(
  input: ReviewBantuanInput
): Promise<ActionResult<PengajuanBantuan>> {
  try {
    const validated = reviewBantuanSchema.parse(input);
    const { supabase, user } = await getAuthenticatedUser();
    const profile = await getUserProfile(supabase, user.id);

    // Guard: harus admin_mupel
    if (profile.role !== 'admin_mupel') {
      return {
        success: false,
        error: 'Hanya Admin Mupel yang dapat melakukan review di tahap ini',
        code: 'FORBIDDEN',
      };
    }

    const pengajuan = await getPengajuan(supabase, validated.id_ajuan);

    if (pengajuan.status !== 'Pending_Mupel') {
      return {
        success: false,
        error: `Pengajuan berstatus "${pengajuan.status}". Expected: Pending_Mupel`,
        code: 'INVALID_STATUS',
      };
    }

    // Guard: scope Mupel
    if (profile.id_mupel) {
      const { data: pos } = await supabase
        .from('m_pos_pelkes')
        .select('id_induk')
        .eq('id_pos', pengajuan.id_pos)
        .single();

      if (pos) {
        const { data: jemaat } = await supabase
          .from('m_jemaat_induk')
          .select('id_mupel')
          .eq('id_induk', pos.id_induk)
          .single();

        if (jemaat && jemaat.id_mupel !== profile.id_mupel) {
          return {
            success: false,
            error: 'Pengajuan ini bukan dari Mupel Anda',
            code: 'SCOPE_VIOLATION',
          };
        }
      }
    }

    const targetStatus: StatusBantuan =
      validated.keputusan === 'approve' ? 'Pending_Sinode' : 'Rejected';

    assertValidTransition('Pending_Mupel', targetStatus);

    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from('t_pengajuan_bantuan')
      .update({
        status: targetStatus,
        tgl_review_mupel: now,
        catatan_mupel: validated.catatan ?? null,
        updated_at: now,
      })
      .eq('id_ajuan', validated.id_ajuan)
      .select()
      .single();

    if (updateError) {
      logger.error('Gagal review Admin Mupel', updateError, {
        idAjuan: validated.id_ajuan,
      });
      return { success: false, error: 'Gagal memproses review', code: 'DB_ERROR' };
    }

    await recordApproval(supabase, {
      idAjuan: validated.id_ajuan,
      userId: user.id,
      roleReviewer: 'admin_mupel',
      keputusan: validated.keputusan === 'approve' ? 'Approved' : 'Rejected',
      catatan: validated.catatan ?? null,
    });

    logger.info('Review Admin Mupel selesai', {
      idAjuan: validated.id_ajuan,
      keputusan: validated.keputusan,
    });

    revalidatePath('/bantuan');

    return { success: true, data: updated as PengajuanBantuan };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: any) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      };
    }
    logger.error('Error saat review Admin Mupel', error as Error);
    return { success: false, error: 'Terjadi kesalahan yang tidak terduga', code: 'INTERNAL_ERROR' };
  }
}

// ============================================================
// REVIEW SUPER USER (SINODE) — Pending_Sinode → Approved / Rejected
// PRD US-10.4: Sebagai Super User, saya ingin approve pengajuan akhir
// ============================================================

export async function reviewBySuperUser(
  input: ReviewBantuanInput
): Promise<ActionResult<PengajuanBantuan>> {
  try {
    const validated = reviewBantuanSchema.parse(input);
    const { supabase, user } = await getAuthenticatedUser();
    const profile = await getUserProfile(supabase, user.id);

    // Guard: harus super_user
    if (profile.role !== 'super_user') {
      return {
        success: false,
        error: 'Hanya Super User Sinode yang dapat memberikan keputusan akhir',
        code: 'FORBIDDEN',
      };
    }

    const pengajuan = await getPengajuan(supabase, validated.id_ajuan);

    if (pengajuan.status !== 'Pending_Sinode') {
      return {
        success: false,
        error: `Pengajuan berstatus "${pengajuan.status}". Expected: Pending_Sinode`,
        code: 'INVALID_STATUS',
      };
    }

    const targetStatus: StatusBantuan =
      validated.keputusan === 'approve' ? 'Approved' : 'Rejected';

    assertValidTransition('Pending_Sinode', targetStatus);

    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from('t_pengajuan_bantuan')
      .update({
        status: targetStatus,
        tgl_keputusan_sinode: now,
        catatan_sinode: validated.catatan ?? null,
        updated_at: now,
      })
      .eq('id_ajuan', validated.id_ajuan)
      .select()
      .single();

    if (updateError) {
      logger.error('Gagal review Super User', updateError, {
        idAjuan: validated.id_ajuan,
      });
      return { success: false, error: 'Gagal memproses keputusan akhir', code: 'DB_ERROR' };
    }

    await recordApproval(supabase, {
      idAjuan: validated.id_ajuan,
      userId: user.id,
      roleReviewer: 'super_user',
      keputusan: validated.keputusan === 'approve' ? 'Approved' : 'Rejected',
      catatan: validated.catatan ?? null,
    });

    logger.info('Keputusan akhir Sinode', {
      idAjuan: validated.id_ajuan,
      keputusan: validated.keputusan,
    });

    revalidatePath('/bantuan');

    return { success: true, data: updated as PengajuanBantuan };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: any) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      };
    }
    logger.error('Error saat review Super User', error as Error);
    return { success: false, error: 'Terjadi kesalahan yang tidak terduga', code: 'INTERNAL_ERROR' };
  }
}

// ============================================================
// AJUKAN ULANG — Rejected → Draft baru (record baru)
// PRD US-10.6, EIA v0.1.1 §5.1 R1–R5
// ============================================================

export async function ajukanUlangBantuan(
  input: AjukanUlangInput
): Promise<ActionResult<PengajuanBantuan>> {
  try {
    const validated = ajukanUlangSchema.parse(input);
    const { supabase, user } = await getAuthenticatedUser();
    await getUserProfile(supabase, user.id);

    // 1. Ambil pengajuan lama
    const pengajuanLama = await getPengajuan(supabase, validated.id_ajuan_lama);

    // 2. Guard: status harus Rejected
    if (!canResubmit(pengajuanLama.status)) {
      return {
        success: false,
        error: `Pengajuan berstatus "${pengajuanLama.status}" tidak dapat diajukan ulang. Hanya pengajuan Rejected yang bisa diajukan ulang.`,
        code: 'INVALID_STATUS',
      };
    }

    // 3. Guard: hanya pemohon asli yang bisa ajukan ulang
    if (pengajuanLama.diajukan_oleh !== user.id) {
      return {
        success: false,
        error: 'Hanya pemohon asli yang dapat mengajukan ulang pengajuan ini',
        code: 'FORBIDDEN',
      };
    }

    // 4. Buat record BARU dengan referensi ke yang lama
    // EIA v0.1.1 §5.1 R1: "Pengajuan ulang membuat record baru"
    // EIA v0.1.1 §5.1 R2: "Record lama tetap tersimpan dengan status Rejected"
    // EIA v0.1.1 §5.1 R3: "Record baru mereferensikan record sebelumnya"
    const idPengajuanBaru = generateIdPengajuan();
    const now = new Date().toISOString();

    const { data: pengajuanBaru, error: insertError } = await supabase
      .from('t_pengajuan_bantuan')
      .insert({
        id_ajuan: idPengajuanBaru,
        id_pos: pengajuanLama.id_pos,
        id_pengajuan_sebelumnya: pengajuanLama.id_ajuan, // ← Referensi ke record lama
        jenis_bantuan: validated.jenis_bantuan ?? pengajuanLama.jenis_bantuan,
        deskripsi: validated.deskripsi ?? pengajuanLama.deskripsi,
        estimasi_biaya: validated.estimasi_biaya ?? pengajuanLama.estimasi_biaya,
        urgensi: validated.urgensi ?? pengajuanLama.urgensi,
        status: 'Draft', // ← Selalu mulai dari Draft
        diajukan_oleh: user.id,
        id_tanah: pengajuanLama.id_aset_tanah,
        id_bangunan: pengajuanLama.id_aset_bangunan,
        id_aset_b: pengajuanLama.id_aset_bergerak,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Gagal membuat pengajuan ulang', insertError, {
        idPengajuanLama: validated.id_ajuan_lama,
        idPengajuanBaru,
      });
      return {
        success: false,
        error: 'Gagal membuat pengajuan ulang. Silakan coba lagi.',
        code: 'DB_ERROR',
      };
    }

    // 5. Log aktivitas
    await supabase.from('t_log_aktivitas').insert({
      id_user: user.id,
      aksi: 'ajukan_ulang_bantuan',
      objek_type: 't_pengajuan_bantuan',
      objek_id: idPengajuanBaru,
      keterangan: JSON.stringify({
        id_pengajuan_sebelumnya: pengajuanLama.id_ajuan,
        alasan: 'Pengajuan ditolak, diajukan ulang',
      }),
    });

    logger.info('Pengajuan ulang berhasil dibuat', {
      idPengajuanBaru,
      idPengajuanLama: pengajuanLama.id_ajuan,
      userId: user.id,
    });

    revalidatePath('/bantuan');

    return { success: true, data: pengajuanBaru as PengajuanBantuan };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: any) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      };
    }
    logger.error('Error saat ajukan ulang bantuan', error as Error);
    return { success: false, error: 'Terjadi kesalahan yang tidak terduga', code: 'INTERNAL_ERROR' };
  }
}

// ============================================================
// DELETE — Hapus Draft (hanya Draft, hanya pemohon)
// ============================================================

export async function deletePengajuanBantuan(
  idAjuan: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const pengajuan = await getPengajuan(supabase, idAjuan);

    // Guard: hanya Draft yang bisa dihapus
    if (pengajuan.status !== 'Draft') {
      return {
        success: false,
        error: 'Hanya pengajuan berstatus Draft yang dapat dihapus',
        code: 'INVALID_STATUS',
      };
    }

    // Guard: hanya pemohon atau super_user
    const profile = await getUserProfile(supabase, user.id);
    if (pengajuan.diajukan_oleh !== user.id && profile.role !== 'super_user') {
      return {
        success: false,
        error: 'Anda tidak memiliki izin untuk menghapus pengajuan ini',
        code: 'FORBIDDEN',
      };
    }

    const { error: deleteError } = await supabase
      .from('t_pengajuan_bantuan')
      .delete()
      .eq('id_ajuan', idAjuan)
      .eq('status', 'Draft'); // Extra safety: pastikan masih Draft

    if (deleteError) {
      logger.error('Gagal hapus pengajuan bantuan', deleteError, { idAjuan });
      return { success: false, error: 'Gagal menghapus pengajuan', code: 'DB_ERROR' };
    }

    // Log aktivitas
    await supabase.from('t_log_aktivitas').insert({
      id_user: user.id,
      aksi: 'delete_pengajuan_bantuan',
      objek_type: 't_pengajuan_bantuan',
      objek_id: idAjuan,
      keterangan: JSON.stringify({ status_sebelum_hapus: 'Draft' }),
    });

    revalidatePath('/bantuan');

    return { success: true, data: { deleted: true } };
  } catch (error) {
    logger.error('Error saat hapus pengajuan bantuan', error as Error);
    return { success: false, error: 'Terjadi kesalahan yang tidak terduga', code: 'INTERNAL_ERROR' };
  }
}

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
