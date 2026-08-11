export interface AuditEventViewModel {
  log_id: string;
  topic: string;
  sequenceFormatted: string;
  actorLabel: string;
  actorTypeBadge: string;
  orgContextLabel: string;
  actionBadgeColor: string;
  actionLabel: string;
  entityLabel: string;
  stateDiffSummary: string;
  policyVersion: string;
  decisionLabel: string;
  occurredFormatted: string;
  hashShort: string;
  prevHashShort: string;
}

export interface AuditMetricsViewModel {
  totalAuditLogs: number;
  verifiedStreams: number;
  chainIntegrityStatus: string;
  integrityBadgeColor: string;
  mutationEventCount: number;
  authorizationDenialCount: number;
}

export interface AuditTrailWorkspaceViewModel {
  metrics: AuditMetricsViewModel;
  recentEvents: AuditEventViewModel[];
  hasAuditLogs: boolean;
}
