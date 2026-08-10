import type { ContractId, ContractDefinition } from '../types/contract.types';

export const CONTRACT_REGISTRY: ReadonlyMap<ContractId, ContractDefinition> = new Map([
  ['OC-ORG-001', {
    contract_id: 'OC-ORG-001',
    permission: 'org.create',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'CREATE' }
  }],
  ['OC-ORG-002', {
    contract_id: 'OC-ORG-002',
    permission: 'org.update_profile',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-ORG-003', {
    contract_id: 'OC-ORG-003',
    permission: 'org.elevate_status',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-ORG-004', {
    contract_id: 'OC-ORG-004',
    permission: 'org.read',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'READ' }
  }],
  ['OC-PERSON-001', {
    contract_id: 'OC-PERSON-001',
    permission: 'person.create',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'CREATE' }
  }],
  ['OC-PERSON-002', {
    contract_id: 'OC-PERSON-002',
    permission: 'person.update',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-PERSON-003', {
    contract_id: 'OC-PERSON-003',
    permission: 'person.mutate',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-PERSON-004', {
    contract_id: 'OC-PERSON-004',
    permission: 'person.assign',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-PERSON-005', {
    contract_id: 'OC-PERSON-005',
    permission: 'person.read',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'READ' }
  }],
  ['OC-PERSON-006', {
    contract_id: 'OC-PERSON-006',
    permission: 'person.update_family',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-PERSON-007', {
    contract_id: 'OC-PERSON-007',
    permission: 'person.update_competency',
    target_entity_type: 'm_person',
    registry_status: 'UNRESOLVED',
    dimensions: {
      L2_PERMISSION: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L3_CONTEXT: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L4_RELATIONSHIP: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-PASTORAL-001', {
    contract_id: 'OC-PASTORAL-001',
    permission: 'pastoral.create',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'CREATE' }
  }],
  ['OC-PASTORAL-002', {
    contract_id: 'OC-PASTORAL-002',
    permission: 'pastoral.update',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-PASTORAL-003', {
    contract_id: 'OC-PASTORAL-003',
    permission: 'pastoral.delete',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'DELETE' }
  }],
  ['OC-PASTORAL-004', {
    contract_id: 'OC-PASTORAL-004',
    permission: 'pastoral.read',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'READ' }
  }],
  ['OC-PASTORAL-005', {
    contract_id: 'OC-PASTORAL-005',
    permission: 'schedule.create',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'CREATE' }
  }],
  ['OC-PASTORAL-006', {
    contract_id: 'OC-PASTORAL-006',
    permission: 'schedule.update',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-ASSET-001', {
    contract_id: 'OC-ASSET-001',
    permission: 'asset.create',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'CREATE' }
  }],
  ['OC-ASSET-002', {
    contract_id: 'OC-ASSET-002',
    permission: 'asset.update',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-ASSET-003', {
    contract_id: 'OC-ASSET-003',
    permission: 'asset.delete',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'DELETE' }
  }],
  ['OC-ASSET-004', {
    contract_id: 'OC-ASSET-004',
    permission: 'asset.read',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'READ' }
  }],
  ['OC-ASSET-005', {
    contract_id: 'OC-ASSET-005',
    permission: 'asset.upload_attachment',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-TERRITORY-001', {
    contract_id: 'OC-TERRITORY-001',
    permission: 'territory.create_risk',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'CREATE' }
  }],
  ['OC-TERRITORY-002', {
    contract_id: 'OC-TERRITORY-002',
    permission: 'territory.create_potential',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'CREATE' }
  }],
  ['OC-TERRITORY-003', {
    contract_id: 'OC-TERRITORY-003',
    permission: 'territory.update',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-TERRITORY-004', {
    contract_id: 'OC-TERRITORY-004',
    permission: 'territory.upload_attachment',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-DEMO-001', {
    contract_id: 'OC-DEMO-001',
    permission: 'demography.upsert',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-DEMO-002', {
    contract_id: 'OC-DEMO-002',
    permission: 'demography.read',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'READ' }
  }],
  ['OC-AID-001', {
    contract_id: 'OC-AID-001',
    permission: 'aid.create',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'CREATE' }
  }],
  ['OC-AID-002', {
    contract_id: 'OC-AID-002',
    permission: 'aid.update',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: false },
      L5_LIFECYCLE: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Lifecycle state constraint', rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'WORKFLOW_TRANSITION' }
  }],
  ['OC-AID-003', {
    contract_id: 'OC-AID-003',
    permission: 'aid.submit',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: false },
      L5_LIFECYCLE: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Lifecycle state constraint', rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'WORKFLOW_TRANSITION' }
  }],
  ['OC-AID-004', {
    contract_id: 'OC-AID-004',
    permission: 'aid.approve.step_1',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: false },
      L5_LIFECYCLE: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Lifecycle state constraint', rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'WORKFLOW_TRANSITION' }
  }],
  ['OC-AID-005', {
    contract_id: 'OC-AID-005',
    permission: 'aid.approve.step_2',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: false },
      L5_LIFECYCLE: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Lifecycle state constraint', rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'WORKFLOW_TRANSITION' }
  }],
  ['OC-AID-006', {
    contract_id: 'OC-AID-006',
    permission: 'aid.reject',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: false },
      L5_LIFECYCLE: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Lifecycle state constraint', rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'WORKFLOW_TRANSITION' }
  }],
  ['OC-AID-007', {
    contract_id: 'OC-AID-007',
    permission: 'aid.resubmit',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: false },
      L5_LIFECYCLE: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Lifecycle state constraint', rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'WORKFLOW_TRANSITION' }
  }],
  ['OC-USER-001', {
    contract_id: 'OC-USER-001',
    permission: 'user.create',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'CREATE' }
  }],
  ['OC-USER-002', {
    contract_id: 'OC-USER-002',
    permission: 'user.update_role',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-USER-003', {
    contract_id: 'OC-USER-003',
    permission: 'user.update_status',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-USER-004', {
    contract_id: 'OC-USER-004',
    permission: 'user.delete',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Context scope constraint', rls_projection: true },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'DELETE' }
  }],
  ['OC-USER-005', {
    contract_id: 'OC-USER-005',
    permission: 'user.update_own_profile',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }],
  ['OC-USER-006', {
    contract_id: 'OC-USER-006',
    permission: 'user.toggle_biometric',
    target_entity_type: 'entity',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L4_RELATIONSHIP: { applicability: 'APPLICABLE_RLS_PROJECTED', constraint: 'Relationship scope constraint', rls_projection: true },
      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },
      L6_PRECONDITIONS: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Operation precondition constraint', rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }
  }]
]);

export const CONTRACT_COUNT = CONTRACT_REGISTRY.size;
