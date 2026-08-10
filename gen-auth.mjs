import fs from 'fs';
import path from 'path';

const baseDir = path.join(process.cwd(), 'src/lib/authorization');
fs.mkdirSync(path.join(baseDir, 'types'), { recursive: true });
fs.mkdirSync(path.join(baseDir, 'registry'), { recursive: true });
fs.mkdirSync(path.join(baseDir, 'errors'), { recursive: true });
fs.mkdirSync(path.join(baseDir, '__tests__'), { recursive: true });

// 1. contract.types.ts
const contractTypesContent = `export type ContractId =
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
`;
fs.writeFileSync(path.join(baseDir, 'types/contract.types.ts'), contractTypesContent);

// 2. identity.types.ts
const identityTypesContent = `export type PersonType = 'Pendeta' | 'Pelayan' | 'Relawan';

export type SystemRole =
  | 'super_user'
  | 'admin_mupel'
  | 'kmj'
  | 'pj'
  | 'pendeta'
  | 'pelayan'
  | 'relawan'
  | 'read_only';

export type ContextLevel = 'POS' | 'JEMAAT' | 'MUPEL' | 'GLOBAL';

export interface BaseIdentity {
  user_account_id: string;
  session_valid: boolean;
}

export interface IdentityObject {
  system_identity: {
    user_account_id: string;
    session_valid: boolean;
  };
  person_linkage: {
    person_id: string | null;
    person_type: PersonType | null;
    homebase_context_id: string | null;
  };
  role_bindings: {
    effective_system_role: SystemRole;
    organizational_roles: string[];
  };
}

export interface ActiveContextObject {
  context_id: string;
  context_level: ContextLevel;
  parent_context_id: string | null;
  descendant_reachability: string[];
  resolution_source: 'SERVER_SIDE_VALIDATION';
}
`;
fs.writeFileSync(path.join(baseDir, 'types/identity.types.ts'), identityTypesContent);

// 3. decision.types.ts
const decisionTypesContent = `import type { ContractId } from './contract.types';
import type { FrozenErrorCode } from './error.types';

export interface AuthorizationDecision {
  result: 'ALLOW' | 'DENY';
  error_code: FrozenErrorCode | null;
  error_detail: string | null;
  contract_id: ContractId;
}

export type AuthorizationResult =
  | { status: 'CONTRACT_RESOLUTION_FAILURE'; decision: null }
  | { status: 'EVALUATED'; decision: AuthorizationDecision };

export type OperationPayload = Record<string, unknown>;

export interface OperationInput {
  target_entity: string;
  operation_payload: OperationPayload;
}

export type EvaluatorResult =
  | { passed: true }
  | { passed: false; error_code: FrozenErrorCode; error_detail: string };
`;
fs.writeFileSync(path.join(baseDir, 'types/decision.types.ts'), decisionTypesContent);

// 4. error.types.ts
const errorTypesContent = `export type FrozenErrorCode =
  | 'NOT_AUTHORIZED'
  | 'INVALID_CONTEXT'
  | 'RELATIONSHIP_VIOLATION'
  | 'INVALID_LIFECYCLE_STATE'
  | 'INVALID_OPERATION';
`;
fs.writeFileSync(path.join(baseDir, 'types/error.types.ts'), errorTypesContent);

const frozenErrorCodesContent = `import type { FrozenErrorCode } from '../types/error.types';

export const FROZEN_ERROR_CODES: readonly FrozenErrorCode[] = [
  'NOT_AUTHORIZED',
  'INVALID_CONTEXT',
  'RELATIONSHIP_VIOLATION',
  'INVALID_LIFECYCLE_STATE',
  'INVALID_OPERATION',
] as const;

export function isFrozenErrorCode(code: string): code is FrozenErrorCode {
  return (FROZEN_ERROR_CODES as readonly string[]).includes(code);
}
`;
fs.writeFileSync(path.join(baseDir, 'errors/frozen-error-codes.ts'), frozenErrorCodesContent);

// 5. registry/permission-registry.ts
const permissionList = [
  'org.create', 'org.update_profile', 'org.elevate_status', 'org.read',
  'person.create', 'person.update', 'person.mutate', 'person.assign', 'person.read', 'person.update_family', 'person.update_competency',
  'pastoral.create', 'pastoral.update', 'pastoral.delete', 'pastoral.read', 'schedule.create', 'schedule.update',
  'asset.create', 'asset.update', 'asset.delete', 'asset.read', 'asset.upload_attachment',
  'territory.create_risk', 'territory.create_potential', 'territory.update', 'territory.upload_attachment',
  'demography.upsert', 'demography.read',
  'aid.create', 'aid.update', 'aid.submit', 'aid.approve.step_1', 'aid.approve.step_2', 'aid.reject', 'aid.resubmit',
  'user.create', 'user.update_role', 'user.update_status', 'user.delete', 'user.update_own_profile', 'user.toggle_biometric'
];

function getDomain(perm) {
  const prefix = perm.split('.')[0];
  switch(prefix) {
    case 'org': return 'Organizational';
    case 'person': return 'Person';
    case 'pastoral': case 'schedule': return 'Pastoral';
    case 'asset': return 'Asset';
    case 'territory': return 'Territory';
    case 'demography': return 'Demography';
    case 'aid': return 'Aid & Workflow';
    case 'user': return 'User & Security';
    default: return 'Unknown';
  }
}

const permissionRegistryLines = permissionList.map(p => 
  \`  { permission_id: '\${p}', domain: '\${getDomain(p)}', business_action: '\${p.replace('.', ' ')}' }\`
).join(',\\n');

const permissionRegistryContent = `import type { PermissionId } from '../types/contract.types';

export const PERMISSION_REGISTRY = [
\${permissionRegistryLines}
] as const;

export const PERMISSION_COUNT = PERMISSION_REGISTRY.length;
`;
fs.writeFileSync(path.join(baseDir, 'registry/permission-registry.ts'), permissionRegistryContent);

// 6. registry/contract-registry.ts
const contractMap = [
  ['OC-ORG-001', 'org.create'], ['OC-ORG-002', 'org.update_profile'], ['OC-ORG-003', 'org.elevate_status'], ['OC-ORG-004', 'org.read'],
  ['OC-PERSON-001', 'person.create'], ['OC-PERSON-002', 'person.update'], ['OC-PERSON-003', 'person.mutate'], ['OC-PERSON-004', 'person.assign'], ['OC-PERSON-005', 'person.read'], ['OC-PERSON-006', 'person.update_family'], ['OC-PERSON-007', 'person.update_competency'],
  ['OC-PASTORAL-001', 'pastoral.create'], ['OC-PASTORAL-002', 'pastoral.update'], ['OC-PASTORAL-003', 'pastoral.delete'], ['OC-PASTORAL-004', 'pastoral.read'], ['OC-PASTORAL-005', 'schedule.create'], ['OC-PASTORAL-006', 'schedule.update'],
  ['OC-ASSET-001', 'asset.create'], ['OC-ASSET-002', 'asset.update'], ['OC-ASSET-003', 'asset.delete'], ['OC-ASSET-004', 'asset.read'], ['OC-ASSET-005', 'asset.upload_attachment'],
  ['OC-TERRITORY-001', 'territory.create_risk'], ['OC-TERRITORY-002', 'territory.create_potential'], ['OC-TERRITORY-003', 'territory.update'], ['OC-TERRITORY-004', 'territory.upload_attachment'],
  ['OC-DEMO-001', 'demography.upsert'], ['OC-DEMO-002', 'demography.read'],
  ['OC-AID-001', 'aid.create'], ['OC-AID-002', 'aid.update'], ['OC-AID-003', 'aid.submit'], ['OC-AID-004', 'aid.approve.step_1'], ['OC-AID-005', 'aid.approve.step_2'], ['OC-AID-006', 'aid.reject'], ['OC-AID-007', 'aid.resubmit'],
  ['OC-USER-001', 'user.create'], ['OC-USER-002', 'user.update_role'], ['OC-USER-003', 'user.update_status'], ['OC-USER-004', 'user.delete'], ['OC-USER-005', 'user.update_own_profile'], ['OC-USER-006', 'user.toggle_biometric']
];

function generateContractEntry(contractId, permissionId) {
  if (contractId === 'OC-PERSON-007') {
    return \`  ['\${contractId}', {
    contract_id: '\${contractId}',
    permission: '\${permissionId}',
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
  }]\`;
  }

  let l3 = "APPLICABLE_RLS_PROJECTED";
  let l4 = "APPLICABLE_RLS_PROJECTED";
  let l5 = "NOT_APPLICABLE";
  let l6 = "NOT_APPLICABLE";
  let opType = 'UPDATE';
  let targetEntity = 'entity';

  const readOps = ['org.read', 'pastoral.read', 'asset.read', 'demography.read', 'person.read'];
  if (readOps.includes(permissionId)) {
    opType = 'READ';
    l6 = "NOT_APPLICABLE";
  } else if (permissionId.includes('.create')) {
    opType = 'CREATE';
    l6 = "APPLICABLE_NOT_RLS_PROJECTED";
  } else if (permissionId.includes('aid.')) {
    opType = 'WORKFLOW_TRANSITION';
    l4 = "APPLICABLE_NOT_RLS_PROJECTED";
    l5 = "APPLICABLE_NOT_RLS_PROJECTED";
    l6 = "APPLICABLE_NOT_RLS_PROJECTED";
  } else if (permissionId === 'person.update_family' || permissionId === 'user.toggle_biometric') {
    opType = 'UPDATE';
    l3 = "NOT_APPLICABLE";
    l4 = "APPLICABLE_RLS_PROJECTED"; // Self + super_user
    l6 = "APPLICABLE_NOT_RLS_PROJECTED";
  } else if (permissionId === 'user.update_own_profile') {
    opType = 'UPDATE';
    l3 = "NOT_APPLICABLE";
    l4 = "APPLICABLE_RLS_PROJECTED"; // Self
    l6 = "APPLICABLE_NOT_RLS_PROJECTED";
  } else {
    opType = permissionId.includes('.delete') ? 'DELETE' : 'UPDATE';
    l6 = "APPLICABLE_NOT_RLS_PROJECTED";
  }

  return \`  ['\${contractId}', {
    contract_id: '\${contractId}',
    permission: '\${permissionId}',
    target_entity_type: '\${targetEntity}',
    registry_status: 'ACTIVE',
    dimensions: {
      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },
      L3_CONTEXT: { applicability: '\${l3}', constraint: \${l3 === 'NOT_APPLICABLE' ? 'null' : "'Context scope required'"}, rls_projection: \${l3 === 'APPLICABLE_RLS_PROJECTED'} },
      L4_RELATIONSHIP: { applicability: '\${l4}', constraint: \${l4 === 'NOT_APPLICABLE' ? 'null' : "'Relationship constraints applied'"}, rls_projection: \${l4 === 'APPLICABLE_RLS_PROJECTED'} },
      L5_LIFECYCLE: { applicability: '\${l5}', constraint: \${l5 === 'NOT_APPLICABLE' ? 'null' : "'Lifecycle state valid'"}, rls_projection: false },
      L6_PRECONDITIONS: { applicability: '\${l6}', constraint: \${l6 === 'NOT_APPLICABLE' ? 'null' : "'Preconditions met'"}, rls_projection: false }
    },
    execution_metadata: { resulting_transition: null, operation_type: '\${opType}' }
  }]\`;
}

const contractRegistryLines = contractMap.map(c => generateContractEntry(c[0], c[1])).join(',\\n');

const contractRegistryContent = `import type { ContractId, ContractDefinition } from '../types/contract.types';

export const CONTRACT_REGISTRY: ReadonlyMap<ContractId, ContractDefinition> = new Map([
\${contractRegistryLines}
]);

export const CONTRACT_COUNT = CONTRACT_REGISTRY.size;
`;
fs.writeFileSync(path.join(baseDir, 'registry/contract-registry.ts'), contractRegistryContent);

// Barrels
fs.writeFileSync(path.join(baseDir, 'registry/index.ts'), `export * from './contract-registry';
export * from './permission-registry';
`);
fs.writeFileSync(path.join(baseDir, 'types/index.ts'), `export * from './contract.types';
export * from './identity.types';
export * from './decision.types';
export * from './error.types';
`);
fs.writeFileSync(path.join(baseDir, 'errors/index.ts'), `export * from './frozen-error-codes';
`);
fs.writeFileSync(path.join(baseDir, 'index.ts'), `export * from './types';
export * from './registry';
export * from './errors';
`);

console.log('Files generated successfully.');
