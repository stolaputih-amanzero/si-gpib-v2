export type ContractId =
  | 'OC-ORG-001' | 'OC-ORG-002' | 'OC-ORG-003' | 'OC-ORG-004'
  | 'OC-PERSON-001' | 'OC-PERSON-002' | 'OC-PERSON-003' | 'OC-PERSON-004'
  | 'OC-PERSON-005' | 'OC-PERSON-006' | 'OC-PERSON-007'
  | 'OC-PASTORAL-001' | 'OC-PASTORAL-002' | 'OC-PASTORAL-003'
  | 'OC-PASTORAL-004' | 'OC-PASTORAL-005' | 'OC-PASTORAL-006'
  | 'OC-ASSET-001' | 'OC-ASSET-002' | 'OC-ASSET-003'
  | 'OC-ASSET-004' | 'OC-ASSET-005'
  | 'OC-TERRITORY-001' | 'OC-TERRITORY-002' | 'OC-TERRITORY-003' | 'OC-TERRITORY-004'
  | 'OC-DEMO-001' | 'OC-DEMO-002'
  | 'OC-AID-001' | 'OC-AID-002' | 'OC-AID-003' | 'OC-AID-004'
  | 'OC-AID-005' | 'OC-AID-006' | 'OC-AID-007'
  | 'OC-USER-001' | 'OC-USER-002' | 'OC-USER-003'
  | 'OC-USER-004' | 'OC-USER-005' | 'OC-USER-006';

export type PermissionId =
  | 'org.create' | 'org.update_profile' | 'org.elevate_status' | 'org.read'
  | 'person.create' | 'person.update' | 'person.mutate' | 'person.assign'
  | 'person.read' | 'person.update_family' | 'person.update_competency'
  | 'pastoral.create' | 'pastoral.update' | 'pastoral.delete' | 'pastoral.read'
  | 'schedule.create' | 'schedule.update'
  | 'asset.create' | 'asset.update' | 'asset.delete' | 'asset.read' | 'asset.upload_attachment'
  | 'territory.create_risk' | 'territory.create_potential' | 'territory.update' | 'territory.upload_attachment'
  | 'demography.upsert' | 'demography.read'
  | 'aid.create' | 'aid.update' | 'aid.submit' | 'aid.approve.step_1'
  | 'aid.approve.step_2' | 'aid.reject' | 'aid.resubmit'
  | 'user.create' | 'user.update_role' | 'user.update_status' | 'user.delete'
  | 'user.update_own_profile' | 'user.toggle_biometric';

export type AuthorizationDimension =
  | 'L2_PERMISSION'
  | 'L3_CONTEXT'
  | 'L4_RELATIONSHIP'
  | 'L5_LIFECYCLE'
  | 'L6_PRECONDITIONS';

export type DimensionApplicability =
  | 'APPLICABLE_RLS_PROJECTED'
  | 'APPLICABLE_NOT_RLS_PROJECTED'
  | 'NOT_APPLICABLE';

export type ContractRegistryStatus = 'ACTIVE' | 'UNRESOLVED' | 'DEFERRED';

export type OperationType =
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'WORKFLOW_TRANSITION'
  | 'CROSS_RECORD'
  | 'UPSERT';

export interface DimensionDefinition {
  applicability: DimensionApplicability;
  constraint: string | null;
  rls_projection: boolean;
}

export interface ContractDefinition {
  contract_id: ContractId;
  permission: PermissionId;
  target_entity_type: string;
  registry_status: ContractRegistryStatus;
  dimensions: {
    L2_PERMISSION: DimensionDefinition;
    L3_CONTEXT: DimensionDefinition;
    L4_RELATIONSHIP: DimensionDefinition;
    L5_LIFECYCLE: DimensionDefinition;
    L6_PRECONDITIONS: DimensionDefinition;
  };
  execution_metadata: {
    resulting_transition: string | null;
    operation_type: OperationType;
  };
}
