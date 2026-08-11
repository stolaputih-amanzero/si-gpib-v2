import { PolicyDecisionReasonCode } from '@/types/accessControl.types';

export interface PolicyRuleViewModel {
  policy_id: string;
  policy_name: string;
  policy_version: string;
  targetResourceLabel: string;
  allowedActionsFormatted: string;
  requiredRoleLabel: string;
  allowedScopeLabel: string;
  statusBadgeColor: string;
  temporalStatus: string;
  isActive: boolean;
}

export interface PolicyDecisionViewModel {
  request_id: string;
  effectLabel: string;
  effectBadgeColor: string;
  reason_code: PolicyDecisionReasonCode;
  reasonCodeLabel: string;
  reasonExplanation: string;
  policy_id: string | null;
  policy_version: string;
  evaluatedFormatted: string;
  isAllowed: boolean;
}

export interface AccessControlMetricsViewModel {
  totalPolicies: number;
  activePolicies: number;
  evaluatedRequests: number;
  allowedCount: number;
  deniedCount: number;
  allowRatePercent: number;
  allowRateFormatted: string;
}

export interface AccessControlWorkspaceViewModel {
  metrics: AccessControlMetricsViewModel;
  policies: PolicyRuleViewModel[];
  recentDecisions: PolicyDecisionViewModel[];
  hasPolicies: boolean;
}
