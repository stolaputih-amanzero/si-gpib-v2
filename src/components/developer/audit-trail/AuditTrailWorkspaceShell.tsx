'use client';

import React, { useState } from 'react';
import { AuditEventPayload } from '@/types/auditTrail.types';
import { adaptAuditTrailToViewModel } from '@/adapters/auditTrailViewModelAdapter';
import { AuditEventViewModel } from '@/types/auditTrailViewModel.types';
import { AuditHeader } from './AuditHeader';
import { AuditMetricsGrid } from './AuditMetricsGrid';
import { AuditTimelineStreamPanel } from './AuditTimelineStreamPanel';
import { AuditVerificationModal } from './AuditVerificationModal';

interface AuditTrailWorkspaceShellProps {
  initialEvents?: AuditEventPayload[];
}

export const AuditTrailWorkspaceShell: React.FC<AuditTrailWorkspaceShellProps> = ({
  initialEvents
}) => {
  const [selectedEvent, setSelectedEvent] = useState<AuditEventViewModel | null>(null);

  const sampleEvents: AuditEventPayload[] = initialEvents || [
    {
      log_id: 'LOG-AUDIT-101',
      topic: 'domain.aid_request',
      actor: {
        actor_id: 'USER-SEC-100',
        actor_type: 'HUMAN',
        org_context_id: 'ORG-JMT-001'
      },
      authorization: {
        policy_id: 'POL-AID-APPROVE',
        policy_version: '1.0.0',
        decision: 'ALLOW',
        reason_code: 'ALLOWED_EXPLICIT_POLICY',
        granted_scope: 'ORG-JMT-001'
      },
      entity: {
        entity_type: 'aid_request',
        entity_id: 'AID-001',
        action: 'APPROVE'
      },
      mutation: {
        state_before: { status: 'SUBMITTED', amount: 1500000 },
        state_after: { status: 'APPROVED', amount: 1500000 },
        changed_fields: ['status']
      },
      correlation: {
        request_id: 'REQ-AUD-801',
        transaction_id: 'TX-AUD-801',
        correlation_id: 'CORR-AUD-801'
      },
      chain: {
        sequence_number: 1,
        prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
        curr_hash: '3f7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        occurred_at: new Date(Date.now() - 60000).toISOString()
      }
    },
    {
      log_id: 'LOG-AUDIT-102',
      topic: 'domain.aid_request',
      actor: {
        actor_id: 'USER-SEC-100',
        actor_type: 'HUMAN',
        org_context_id: 'ORG-JMT-001'
      },
      authorization: {
        policy_id: 'POL-AID-APPROVE',
        policy_version: '1.0.0',
        decision: 'ALLOW',
        reason_code: 'ALLOWED_EXPLICIT_POLICY',
        granted_scope: 'ORG-JMT-001'
      },
      entity: {
        entity_type: 'aid_request',
        entity_id: 'AID-001',
        action: 'DISBURSE'
      },
      mutation: {
        state_before: { status: 'APPROVED', amount: 1500000 },
        state_after: { status: 'DISBURSED', amount: 1500000 },
        changed_fields: ['status', 'disbursed_at']
      },
      correlation: {
        request_id: 'REQ-AUD-802',
        transaction_id: 'TX-AUD-802',
        correlation_id: 'CORR-AUD-802'
      },
      chain: {
        sequence_number: 2,
        prev_hash: '3f7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        curr_hash: '9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        occurred_at: new Date(Date.now() - 30000).toISOString()
      }
    },
    {
      log_id: 'LOG-AUDIT-103',
      topic: 'domain.person',
      actor: {
        actor_id: 'SYSTEM_CRON',
        actor_type: 'CRON',
        org_context_id: 'ORG-JMT-001'
      },
      authorization: {
        policy_id: 'POL-CRON-SYNC',
        policy_version: '1.0.0',
        decision: 'ALLOW',
        reason_code: 'SYSTEM_EXECUTION'
      },
      entity: {
        entity_type: 'person',
        entity_id: 'PER-999',
        action: 'UPDATE'
      },
      mutation: {
        state_before: { status_jamaah: 'AKTIF' },
        state_after: { status_jamaah: 'MUTASI' },
        changed_fields: ['status_jamaah']
      },
      correlation: {
        request_id: 'REQ-AUD-803',
        transaction_id: 'TX-AUD-803',
        correlation_id: 'CORR-AUD-803'
      },
      chain: {
        sequence_number: 1,
        prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
        curr_hash: '5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b',
        occurred_at: new Date(Date.now() - 10000).toISOString()
      }
    }
  ];

  const vm = adaptAuditTrailToViewModel(sampleEvents);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <AuditHeader
        vm={vm}
        onOpenVerificationModal={() => {
          if (vm.recentEvents.length > 0) setSelectedEvent(vm.recentEvents[0]);
        }}
      />

      <AuditMetricsGrid vm={vm} />

      <AuditTimelineStreamPanel
        events={vm.recentEvents}
        onSelectEvent={(evt) => setSelectedEvent(evt)}
      />

      <AuditVerificationModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
