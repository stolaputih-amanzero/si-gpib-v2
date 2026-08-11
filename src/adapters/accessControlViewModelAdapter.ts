import { 
  PolicyDecision, 
  PolicyRuleDefinition, 
  PolicyDecisionReasonCode 
} from '@/types/accessControl.types';
import { 
  AccessControlWorkspaceViewModel, 
  PolicyRuleViewModel, 
  PolicyDecisionViewModel, 
  AccessControlMetricsViewModel 
} from '@/types/accessControlViewModel.types';

function getReasonCodeLabel(code: PolicyDecisionReasonCode): string {
  switch (code) {
    case 'ALLOWED_EXPLICIT_POLICY':
      return 'Izin Eksplisit Berhasil';
    case 'DENIED_DEFAULT':
      return 'Penolakan Default';
    case 'DENIED_SCOPE_MISMATCH':
      return 'Ketidaksesuaian Lingkup Akses';
    case 'DENIED_PRIVILEGE_ESCALATION':
      return 'Ditolak: Eskalasi Hak Akses';
    case 'DENIED_TENANT_BOUNDARY':
      return 'Ditolak: Batas Wilayah Organisasi';
    case 'DENIED_TEMPORAL_EXPIRED':
      return 'Ditolak: Masa Berlaku Aturan Kadaluarsa';
    case 'DENIED_ABAC_CONSTRAINT':
      return 'Ditolak: Pembatasan Atribut Konteks';
    case 'DENIED_UNAUTHENTICATED':
      return 'Ditolak: Sesi Pengguna Tidak Sah';
    default:
      return code;
  }
}

function getReasonExplanation(code: PolicyDecisionReasonCode): string {
  switch (code) {
    case 'ALLOWED_EXPLICIT_POLICY':
      return 'Aksi diizinkan oleh aturan kebijakan yang sah dan berlaku.';
    case 'DENIED_DEFAULT':
      return 'Tidak ada aturan izin eksplisit yang cocok (Prinsip Deny by Default).';
    case 'DENIED_TENANT_BOUNDARY':
      return 'Akses ditolak karena sumber daya berada di luar batas wilayah organisasi pengguna.';
    case 'DENIED_TEMPORAL_EXPIRED':
      return 'Akses ditolak karena waktu permintaan berada di luar jendela masa berlaku kebijakan.';
    case 'DENIED_UNAUTHENTICATED':
      return 'Akses ditolak karena permintaan tidak memiliki sesi otentikasi yang valid.';
    default:
      return 'Akses ditolak oleh mesin kebijakan otorisasi platform.';
  }
}

function mapPolicyRuleToViewModel(rule: PolicyRuleDefinition): PolicyRuleViewModel {
  const actionsFormatted = rule.allowed_actions.map(a => a.toUpperCase()).join(', ');
  let temporalStatus = 'Selamanya Berlaku';

  if (rule.temporal_window) {
    temporalStatus = `Berlaku: ${new Date(rule.temporal_window.valid_from).toLocaleDateString('id-ID')} - ${new Date(rule.temporal_window.valid_until).toLocaleDateString('id-ID')}`;
  }

  return {
    policy_id: rule.policy_id,
    policy_name: rule.policy_name,
    policy_version: rule.policy_version,
    targetResourceLabel: rule.target_resource_type.toUpperCase(),
    allowedActionsFormatted: actionsFormatted,
    requiredRoleLabel: rule.required_role.replace(/_/g, ' '),
    allowedScopeLabel: rule.allowed_scope_type,
    statusBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    temporalStatus,
    isActive: true
  };
}

function mapDecisionToViewModel(decision: PolicyDecision): PolicyDecisionViewModel {
  const isAllowed = decision.effect === 'ALLOW';

  return {
    request_id: decision.request_id,
    effectLabel: isAllowed ? 'DIIZINKAN (ALLOW)' : 'DITOLAK (DENY)',
    effectBadgeColor: isAllowed 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
      : 'bg-rose-50 text-rose-700 border-rose-200',
    reason_code: decision.reason_code,
    reasonCodeLabel: getReasonCodeLabel(decision.reason_code),
    reasonExplanation: getReasonExplanation(decision.reason_code),
    policy_id: decision.policy_id,
    policy_version: decision.policy_version,
    evaluatedFormatted: decision.evaluated_at ? new Date(decision.evaluated_at).toLocaleTimeString('id-ID') : '-',
    isAllowed
  };
}

export function adaptAccessControlToViewModel(
  rules: PolicyRuleDefinition[],
  recentDecisions: PolicyDecision[] = []
): AccessControlWorkspaceViewModel {
  const policyViewModels = rules.map(mapPolicyRuleToViewModel);
  const decisionViewModels = recentDecisions.map(mapDecisionToViewModel);

  const totalPolicies = rules.length;
  const activePolicies = rules.length;
  const evaluatedRequests = recentDecisions.length;
  const allowedCount = recentDecisions.filter(d => d.effect === 'ALLOW').length;
  const deniedCount = recentDecisions.filter(d => d.effect === 'DENY').length;
  const allowRatePercent = evaluatedRequests > 0 ? Math.round((allowedCount / evaluatedRequests) * 100) : 100;

  const metrics: AccessControlMetricsViewModel = {
    totalPolicies,
    activePolicies,
    evaluatedRequests,
    allowedCount,
    deniedCount,
    allowRatePercent,
    allowRateFormatted: `${allowRatePercent}%`
  };

  return {
    metrics,
    policies: policyViewModels,
    recentDecisions: decisionViewModels,
    hasPolicies: policyViewModels.length > 0
  };
}
