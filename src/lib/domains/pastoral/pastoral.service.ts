// src/lib/domains/pastoral/pastoral.service.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { enforceContract } from '@/lib/authorization';
import type { PastoralFilter, PastoralStats } from './pastoral.types';
import { createLogPastoralSchema } from './pastoral.schema';
import { db } from '@/lib/offline/dexie';
import { syncManager } from '@/lib/offline/sync-manager';
import { PASTORAL_TARGETS } from './pastoral.types';
import { createLogPastoralAction } from '@/app/actions/log-pastoral';

export async function submitLogPastoral(rawData: unknown) {
  // Check online status if we are on client
  const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

  if (isOnline) {
    return createLogPastoralAction(rawData as any);
  }

  const validation = createLogPastoralSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  await db.pendingSubmissions.add({
    requestId: validation.data.requestId,
    operationType: 'rpc',
    targetIdentifier: PASTORAL_TARGETS.CREATE_LOG,
    payload: validation.data,
    status: 'pending',
    attempts: 0,
    createdAt: Date.now(),
  });

  syncManager.processQueue();

  return { success: true, queued: true };
}

export async function getLogPastoralList(filter: PastoralFilter) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  // Build query
  let query = supabase
    .from('t_log_pastoral')
    .select(`
      *,
      m_pos_pelkes!inner (
        id_pos,
        nama_pos,
        id_induk
      ),
      m_pendeta!inner (
        id_pendeta,
        nama_lengkap
      )
    `, { count: 'exact' })
    .eq('m_pos_pelkes.id_induk', filter.idJemaat) // Scope KMJ
    .order('tgl', { ascending: false });

  // Apply filters
  if (filter.startDate) {
    query = query.gte('tgl', filter.startDate);
  }
  if (filter.endDate) {
    query = query.lte('tgl', filter.endDate);
  }
  if (filter.idPendeta) {
    query = query.eq('id_pendeta', filter.idPendeta);
  }
  if (filter.idPos) {
    query = query.eq('id_pos', filter.idPos);
  }
  if (filter.search) {
    query = query.or(`kegiatan.ilike.%${filter.search}%,catatan.ilike.%${filter.search}%`);
  }

  // Pagination
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getPastoralStats(idJemaat: string, startDate?: string, endDate?: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('get_pastoral_stats', {
    p_id_jemaat: idJemaat,
    p_start_date: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    p_end_date: endDate || new Date().toISOString().split('T')[0],
  });

  if (error) throw error;
  return data as PastoralStats;
}

export async function exportLogPastoralToExcel(filter: PastoralFilter) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');


  
  const targetEntity = {
    entityId: filter.idJemaat || '',
    entityType: 'Context' as const,
    contextAffinityId: filter.idJemaat || '',
    contextAffinityLevel: 'POS' as const,
  };
  
  const result = await enforceContract(
    'OC-PASTORAL-004',
    { targetEntity },
    supabase,
    user.id,
    filter.idJemaat || ''
  );

  if (result.status === 'RESOLUTION_FAILURE' || result.status === 'DENY') {
    throw new Error('Unauthorized: hanya KMJ dari jemaat ini yang bisa export');
  }

  // Fetch all data (with hard limit)
  const MAX_EXPORT_ROWS = 10000;
  const safeLimit = Math.min(filter.limit || MAX_EXPORT_ROWS, MAX_EXPORT_ROWS);
  const { data } = await getLogPastoralList({ ...filter, limit: safeLimit, page: 1 });
  
  // Convert to CSV
  const headers = ['Tanggal', 'Pos Pelkes', 'Pendeta', 'Kegiatan', 'Jumlah Jiwa', 'Catatan'];
  
  const sanitize = (cell: string) => {
    // Escape formula Excel yang berpotensi injection
    if (cell.startsWith('=') || cell.startsWith('+') || cell.startsWith('-') || cell.startsWith('@')) {
      return `'${cell}`;
    }
    return cell;
  };

  const rows = data.map(log => [
    log.tgl,
    log.m_pos_pelkes?.nama_pos || '',
    log.m_pendeta?.nama_lengkap || '',
    sanitize(log.kegiatan || ''),
    log.jml_jiwa?.toString() || '',
    sanitize(log.catatan || ''),
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csv;
}
