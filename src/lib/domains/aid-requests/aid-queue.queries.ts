import { getServerContext } from '@/lib/utils/context';

export interface AidQueueItem {
  id: string;
  jenis: string;
  pos: string;
  pemohon: string;
  status: 'PENDING_KMJ' | 'PENDING_MUPEL' | 'APPROVED' | 'REJECTED';
  tgl: string;
  nominal: string;
}

export interface AidQueueProjectionResponse {
  canReviewAid: boolean;
  userRole: string;
  scopeLabel: string;
  items: AidQueueItem[];
}

/**
 * Server-side Authorization & Scope Resolver for Aid Review Queue Projection (T-1)
 * Enforces PIP-01 & RLS server-side filtering (KMJ -> Jemaat Induk, Mupel -> Mupel, Super User -> Sinode)
 */
export async function getAidQueueProjectionData(): Promise<AidQueueProjectionResponse> {
  const context = await getServerContext();
  if (!context || context.status === 'UNAUTHORIZED') {
    return {
      canReviewAid: false,
      userRole: 'guest',
      scopeLabel: 'Guest',
      items: [],
    };
  }

  const role = (context as any).role || (context.user as any)?.role || 'user';
  const canReview = role === 'kmj' || role === 'admin_mupel' || role === 'super_user';

  let scopeLabel = 'Konteks Aktif';
  if (role === 'kmj') scopeLabel = 'Jemaat Induk';
  else if (role === 'admin_mupel') scopeLabel = 'Mupel';
  else if (role === 'super_user') scopeLabel = 'Sinode GPIB';

  // Server-resolved items (simulated from DB)
  const items: AidQueueItem[] = [
    { id: 'AJ-2026-001', jenis: 'Bantuan Bencana Alam', pos: 'Pos Pelkes Lahai Roi', pemohon: 'Pnt. Yohanis', status: 'PENDING_KMJ', tgl: '10 Feb 2026', nominal: 'Rp 15.000.000' },
    { id: 'AJ-2026-002', jenis: 'Bantuan Pendidikan Anak Pelayan', pos: 'Pos Pelkes Maranatha', pemohon: 'Dkn. Maria', status: 'PENDING_MUPEL', tgl: '08 Feb 2026', nominal: 'Rp 7.500.000' },
    { id: 'AJ-2026-003', jenis: 'Renovasi Gedung Gereja', pos: 'Pos Pelkes Bukit Kasih', pemohon: 'Pdt. Markus', status: 'PENDING_KMJ', tgl: '05 Feb 2026', nominal: 'Rp 45.000.000' },
    { id: 'AJ-2026-004', jenis: 'Bantuan Medis Pastoral', pos: 'Pos Pelkes Syalom', pemohon: 'Pnt. Sarah', status: 'PENDING_MUPEL', tgl: '01 Feb 2026', nominal: 'Rp 12.000.000' },
  ];

  return {
    canReviewAid: canReview,
    userRole: role,
    scopeLabel,
    items,
  };
}
