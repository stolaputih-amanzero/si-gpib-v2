'use client';

import React, { useState } from 'react';
import { 
  PolicyRuleDefinition, 
  PolicyDecision 
} from '@/types/accessControl.types';
import { adaptAccessControlToViewModel } from '@/adapters/accessControlViewModelAdapter';
import { PolicyDecisionViewModel } from '@/types/accessControlViewModel.types';
import { AccessControlHeader } from './AccessControlHeader';
import { PolicyEvaluationMetrics } from './PolicyEvaluationMetrics';
import { PolicyRuleGridPanel } from './PolicyRuleGridPanel';
import { PolicyInspectionModal } from './PolicyInspectionModal';

interface AccessControlWorkspaceShellProps {
  initialRules?: PolicyRuleDefinition[];
  initialDecisions?: PolicyDecision[];
}

export const AccessControlWorkspaceShell: React.FC<AccessControlWorkspaceShellProps> = ({
  initialRules,
  initialDecisions
}) => {
  const [selectedDecision, setSelectedDecision] = useState<PolicyDecisionViewModel | null>(null);

  const sampleRules: PolicyRuleDefinition[] = initialRules || [
    {
      policy_id: 'POL-PERSON-READ',
      policy_name: 'Person Profile Read Policy',
      policy_version: '1.0.0',
      target_resource_type: 'person',
      allowed_actions: ['read'],
      required_role: 'SECTOR_SECRETARY',
      allowed_scope_type: 'SEKTOR'
    },
    {
      policy_id: 'POL-PERSON-WRITE',
      policy_name: 'Person Profile Mutation Policy',
      policy_version: '1.0.0',
      target_resource_type: 'person',
      allowed_actions: ['write', 'read'],
      required_role: 'ADMIN_JEMAAT',
      allowed_scope_type: 'JEMAAT'
    },
    {
      policy_id: 'POL-AID-APPROVE',
      policy_name: 'Aid Request Approval Policy',
      policy_version: '1.0.0',
      target_resource_type: 'aid_request',
      allowed_actions: ['approve', 'read'],
      required_role: 'FINANCE_COMMISSIONER',
      allowed_scope_type: 'JEMAAT'
    },
    {
      policy_id: 'POL-QUEUE-EXECUTE',
      policy_name: 'Bulk Queue Execution Policy',
      policy_version: '1.0.0',
      target_resource_type: 'batch_queue',
      allowed_actions: ['execute', 'read'],
      required_role: 'DEVELOPER_ADMIN',
      allowed_scope_type: 'SINODE'
    }
  ];

  const sampleDecisions: PolicyDecision[] = initialDecisions || [
    {
      request_id: 'REQ-AUTH-801',
      effect: 'ALLOW',
      policy_id: 'POL-AID-APPROVE',
      policy_version: '1.0.0',
      evaluated_at: new Date(Date.now() - 30000).toISOString(),
      reason_code: 'ALLOWED_EXPLICIT_POLICY',
      granted_scope: 'ORG-JMT-001'
    },
    {
      request_id: 'REQ-AUTH-802',
      effect: 'DENY',
      policy_id: 'POL-AID-APPROVE',
      policy_version: '1.0.0',
      evaluated_at: new Date(Date.now() - 25000).toISOString(),
      reason_code: 'DENIED_TENANT_BOUNDARY',
      denial_message: 'Subject org scope does not cover resource org context boundary.'
    },
    {
      request_id: 'REQ-AUTH-803',
      effect: 'DENY',
      policy_id: null,
      policy_version: '1.0.0',
      evaluated_at: new Date(Date.now() - 15000).toISOString(),
      reason_code: 'DENIED_DEFAULT',
      denial_message: 'No matching ALLOW policy rule found (Deny by default).'
    },
    {
      request_id: 'REQ-AUTH-804',
      effect: 'DENY',
      policy_id: 'POL-PERSON-WRITE',
      policy_version: '1.0.0',
      evaluated_at: new Date(Date.now() - 5000).toISOString(),
      reason_code: 'DENIED_TEMPORAL_EXPIRED',
      denial_message: 'Policy rule has expired.'
    }
  ];

  const vm = adaptAccessControlToViewModel(sampleRules, sampleDecisions);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <AccessControlHeader vm={vm} />
      <PolicyEvaluationMetrics vm={vm} />
      <PolicyRuleGridPanel
        policies={vm.policies}
        recentDecisions={vm.recentDecisions}
        onSelectDecision={(dec) => setSelectedDecision(dec)}
      />

      <PolicyInspectionModal
        decision={selectedDecision}
        onClose={() => setSelectedDecision(null)}
      />
    </div>
  );
};
