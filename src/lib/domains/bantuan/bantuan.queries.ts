// src/lib/domains/bantuan/bantuan.queries.ts
// TanStack Query hooks untuk domain Bantuan & Workflow
// Client-side data fetching + cache management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  createPengajuanBantuanAction,
  updatePengajuanBantuanAction,
  submitBantuanAction,
  processApprovalAction,
  resubmitPengajuanBantuanAction,
} from '@/app/actions/bantuan';
import type {
  PengajuanBantuan,
  BantuanFilters,
  BantuanListResponse,
  BantuanStats,
  StatusBantuan,
} from './bantuan.types';
import type {
  CreateBantuanInput,
  UpdateBantuanInput,
  ReviewBantuanInput,
  AjukanUlangInput,
} from './bantuan.schema';

// ============================================================
// QUERY KEYS (untuk cache invalidation)
// ============================================================

export const bantuanKeys = {
  all: ['bantuan'] as const,
  lists: () => [...bantuanKeys.all, 'list'] as const,
  list: (filters: BantuanFilters) => [...bantuanKeys.lists(), filters] as const,
  details: () => [...bantuanKeys.all, 'detail'] as const,
  detail: (id: string) => [...bantuanKeys.details(), id] as const,
  stats: () => [...bantuanKeys.all, 'stats'] as const,
};

// ============================================================
// FETCH FUNCTIONS
// ============================================================

/**
 * Ambil daftar pengajuan bantuan dengan filter & pagination.
 * RLS di Supabase sudah membatasi scope per role.
 */
async function fetchBantuanList(
  filters: any
): Promise<BantuanListResponse> {
  const supabase = createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('t_pengajuan_bantuan')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.id_pos) {
    query = query.eq('id_pos', filters.id_pos);
  }
  if (filters.urgensi) {
    query = query.eq('urgensi', filters.urgensi);
  }
  if (filters.diajukan_oleh) {
    query = query.eq('diajukan_oleh', filters.diajukan_oleh);
  }
  if (filters.search) {
    query = query.or(
      `jenis_bantuan.ilike.%${filters.search}%,deskripsi.ilike.%${filters.search}%`
    );
  }

  // Kecuali diminta historis, filter out draft yang sudah diajukan ulang
  if (!filters.includeHistoris) {
    // Tampilkan semua — termasuk yang rejected (untuk badge "Ajukan Ulang")
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Gagal memuat daftar bantuan: ${error.message}`);
  }

  return {
    data: (data ?? []) as PengajuanBantuan[],
    pagination: {
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
  };
}

/**
 * Ambil statistik bantuan (untuk dashboard)
 */
async function fetchBantuanStats(): Promise<BantuanStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('t_pengajuan_bantuan')
    .select('status, estimasi_biaya');

  if (error) {
    throw new Error(`Gagal memuat statistik bantuan: ${error.message}`);
  }

  const stats: BantuanStats = {
    total_draft: 0,
    total_pending_kmj: 0,
    total_pending_mupel: 0,
    total_pending_sinode: 0,
    total_approved: 0,
    total_rejected: 0,
    total_estimasi_approved: 0,
  };

  for (const item of data ?? []) {
    switch (item.status as StatusBantuan) {
      case 'Draft':
        stats.total_draft++;
        break;
      case 'Pending_KMJ':
        stats.total_pending_kmj++;
        break;
      case 'Pending_Mupel':
        stats.total_pending_mupel++;
        break;
      case 'Pending_Sinode':
        stats.total_pending_sinode++;
        break;
      case 'Approved':
        stats.total_approved++;
        stats.total_estimasi_approved += item.estimasi_biaya ?? 0;
        break;
      case 'Rejected':
        stats.total_rejected++;
        break;
    }
  }

  return stats;
}

/**
 * Ambil timeline status untuk tracking (PRD US-10.5)
 */
async function fetchStatusTimeline(idAjuan: string) {
  const supabase = createClient();

  // Ambil pengajuan
  const { data: pengajuan } = await supabase
    .from('t_pengajuan_bantuan')
    .select('*')
    .eq('id_ajuan', idAjuan)
    .single();

  if (!pengajuan) return [];

  // Build timeline
  const timeline = [
    {
      status: 'Draft' as StatusBantuan,
      timestamp: pengajuan.created_at,
      actor: null,
      catatan: null,
      isCurrent: pengajuan.status === 'Draft',
    },
    {
      status: 'Pending_KMJ' as StatusBantuan,
      timestamp: pengajuan.tgl_diajukan,
      actor: null,
      catatan: null,
      isCurrent: pengajuan.status === 'Pending_KMJ',
    },
    {
      status: 'Pending_Mupel' as StatusBantuan,
      timestamp: pengajuan.tgl_review_kmj,
      actor: null,
      catatan: pengajuan.catatan_kmj,
      isCurrent: pengajuan.status === 'Pending_Mupel',
    },
    {
      status: 'Pending_Sinode' as StatusBantuan,
      timestamp: pengajuan.tgl_review_mupel,
      actor: null,
      catatan: pengajuan.catatan_mupel,
      isCurrent: pengajuan.status === 'Pending_Sinode',
    },
    {
      status: (pengajuan.status === 'Approved' ? 'Approved' : 'Rejected') as StatusBantuan,
      timestamp: pengajuan.tgl_keputusan_sinode,
      actor: null,
      catatan: pengajuan.catatan_sinode,
      isCurrent: pengajuan.status === 'Approved' || pengajuan.status === 'Rejected',
    },
  ];

  return timeline;
}

// ============================================================
// QUERY HOOKS
// ============================================================

/**
 * Hook: daftar pengajuan bantuan dengan filter
 */
export function useBantuanList(filters: BantuanFilters = {}) {
  return useQuery({
    queryKey: bantuanKeys.list(filters),
    queryFn: () => fetchBantuanList(filters),
    placeholderData: (prev) => prev, // Keep previous data during pagination
    staleTime: 30_000, // 30 detik
  });
}

/**
 * Hook: detail satu pengajuan bantuan
 */
export function useBantuanDetail(idAjuan: string | undefined) {
  return useQuery({
    queryKey: bantuanKeys.detail(idAjuan ?? ''),
    queryFn: async () => {
      const { getPengajuanDetail } = await import('./bantuan.service');
      const result = await getPengajuanDetail(idAjuan!);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!idAjuan,
    staleTime: 60_000, // 1 menit
  });
}

/**
 * Hook: statistik bantuan (dashboard)
 */
export function useBantuanStats() {
  return useQuery({
    queryKey: bantuanKeys.stats(),
    queryFn: fetchBantuanStats,
    staleTime: 60_000,
  });
}

/**
 * Hook: timeline status pengajuan
 */
export function useStatusTimeline(idAjuan: string | undefined) {
  return useQuery({
    queryKey: [...bantuanKeys.detail(idAjuan ?? ''), 'timeline'],
    queryFn: () => fetchStatusTimeline(idAjuan!),
    enabled: !!idAjuan,
    staleTime: 30_000,
  });
}

// ============================================================
// MUTATION HOOKS
// ============================================================

/**
 * Hook: buat pengajuan bantuan baru
 */
export function useCreateBantuan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBantuanInput) => {
      const result = await createPengajuanBantuanAction({
        id_pos: input.id_pos,
        jenis_bantuan: input.jenis_bantuan,
        estimasi_biaya: input.estimasi_biaya,
        urgensi: input.urgensi,
        deskripsi: input.deskripsi,
        id_tanah: input.id_aset_tanah,
        id_bangunan: input.id_aset_bangunan,
        id_aset_b: input.id_aset_bergerak,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bantuanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.stats() });
    },
  });
}

/**
 * Hook: update draft pengajuan
 */
export function useUpdateBantuan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBantuanInput) => {
      const result = await updatePengajuanBantuanAction(input);
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: bantuanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.detail(data.id_ajuan) });
    },
  });
}

/**
 * Hook: submit draft → Pending_KMJ
 */
export function useSubmitBantuan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idAjuan: string) => {
      const result = await submitBantuanAction(idAjuan);
      return result;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: bantuanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.detail(data.id_ajuan) });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.stats() });
    },
  });
}

/**
 * Hook: review KMJ (approve/reject)
 */
export function useReviewKMJ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReviewBantuanInput) => {
      await processApprovalAction({
        id_ajuan: input.id_ajuan,
        aksi: input.keputusan,
        catatan: input.catatan || '',
        step: 1
      });
      return { id_ajuan: input.id_ajuan }; // processApprovalAction returns {success: true}
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: bantuanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.detail(data.id_ajuan) });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.stats() });
    },
  });
}

/**
 * Hook: review Admin Mupel (approve/reject)
 */
export function useReviewAdminMupel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReviewBantuanInput) => {
      await processApprovalAction({
        id_ajuan: input.id_ajuan,
        aksi: input.keputusan,
        catatan: input.catatan || '',
        step: 2
      });
      return { id_ajuan: input.id_ajuan };
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: bantuanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.detail(data.id_ajuan) });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.stats() });
    },
  });
}

/**
 * Hook: review Super User / Sinode (approve/reject)
 */
export function useReviewSuperUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReviewBantuanInput) => {
      await processApprovalAction({
        id_ajuan: input.id_ajuan,
        aksi: input.keputusan,
        catatan: input.catatan || '',
        step: 2
      });
      return { id_ajuan: input.id_ajuan };
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: bantuanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.detail(data.id_ajuan) });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.stats() });
    },
  });
}

/**
 * Hook: ajukan ulang bantuan yang ditolak (EIA v0.1.1)
 * PRD US-10.6
 */
export function useAjukanUlang() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AjukanUlangInput) => {
      const result = await resubmitPengajuanBantuanAction(input);
      return result;
    },
    onSuccess: (data: any) => {
      // Invalidate list + detail lama + detail baru
      queryClient.invalidateQueries({ queryKey: bantuanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.detail(data.id_ajuan) });
      queryClient.invalidateQueries({ queryKey: bantuanKeys.stats() });
    },
  });
}

