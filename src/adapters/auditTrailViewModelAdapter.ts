import { AuditEventPayload, AuditChainVerificationResult } from '@/types/auditTrail.types';
import { 
  AuditTrailWorkspaceViewModel, 
  AuditEventViewModel, 
  AuditMetricsViewModel 
} from '@/types/auditTrailViewModel.types';

function mapActorTypeBadge(actorType: string): string {
  switch (actorType) {
    case 'HUMAN':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'SERVICE':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'SYSTEM':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CRON':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function mapActionBadgeColor(action: string): string {
  const upper = action.toUpperCase();
  if (upper.includes('CREATE') || upper.includes('APPROVE') || upper.includes('DISBURSE')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (upper.includes('UPDATE') || upper.includes('PROCESS')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (upper.includes('DELETE') || upper.includes('REJECT')) {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function formatStateDiffSummary(mutation: AuditEventPayload['mutation']): string {
  if (mutation.changed_fields && mutation.changed_fields.length > 0) {
    return `Perubahan pada: [${mutation.changed_fields.join(', ')}]`;
  }
  if (mutation.state_after && mutation.state_before) {
    return 'Perubahan State Rekonsiliasi Terverifikasi';
  }
  if (mutation.state_after) {
    return 'Pembuatan Record Baru (Initial State)';
  }
  return 'Eksekusi Operasi Tanpa Perubahan State Data';
}

function mapEventToViewModel(event: AuditEventPayload): AuditEventViewModel {
  const hashShort = event.chain.curr_hash 
    ? `${event.chain.curr_hash.substring(0, 8)}...${event.chain.curr_hash.substring(event.chain.curr_hash.length - 6)}`
    : 'GENESIS';

  const prevHashShort = event.chain.prev_hash
    ? `${event.chain.prev_hash.substring(0, 8)}...${event.chain.prev_hash.substring(event.chain.prev_hash.length - 6)}`
    : '00000000...';

  return {
    log_id: event.log_id,
    topic: event.topic,
    sequenceFormatted: `#${String(event.chain.sequence_number).padStart(6, '0')}`,
    actorLabel: `${event.actor.actor_type}: ${event.actor.actor_id}`,
    actorTypeBadge: mapActorTypeBadge(event.actor.actor_type),
    orgContextLabel: event.actor.org_context_id,
    actionBadgeColor: mapActionBadgeColor(event.entity.action),
    actionLabel: event.entity.action.toUpperCase(),
    entityLabel: `${event.entity.entity_type.toUpperCase()} (${event.entity.entity_id})`,
    stateDiffSummary: formatStateDiffSummary(event.mutation),
    policyVersion: event.authorization.policy_version,
    decisionLabel: event.authorization.decision === 'ALLOW' ? 'DIIZINKAN (ALLOW)' : 'DITOLAK (DENY)',
    occurredFormatted: event.chain.occurred_at ? new Date(event.chain.occurred_at).toLocaleTimeString('id-ID') : '-',
    hashShort,
    prevHashShort
  };
}

export function adaptAuditTrailToViewModel(
  events: AuditEventPayload[] = [],
  verificationResult?: AuditChainVerificationResult
): AuditTrailWorkspaceViewModel {
  const eventViewModels = events.map(mapEventToViewModel);
  const totalAuditLogs = events.length;
  const verifiedStreams = new Set(events.map(e => e.topic)).size;
  const mutationEventCount = events.filter(e => e.entity.action !== 'READ').length;
  const authorizationDenialCount = events.filter(e => e.authorization.decision === 'DENY').length;

  const isValid = verificationResult ? verificationResult.is_valid : true;

  const metrics: AuditMetricsViewModel = {
    totalAuditLogs,
    verifiedStreams,
    chainIntegrityStatus: isValid ? '100% TERVERIFIKASI IMUTABEL' : 'PERINGATAN: ANOMALI RANTAI HASH DETEKSI',
    integrityBadgeColor: isValid 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
      : 'bg-rose-50 text-rose-700 border-rose-200',
    mutationEventCount,
    authorizationDenialCount
  };

  return {
    metrics,
    recentEvents: eventViewModels,
    hasAuditLogs: eventViewModels.length > 0
  };
}
