const fs = require('fs');
const path = require('path');

const contracts = [
  ['OC-ORG-001', 'org.create'], ['OC-ORG-002', 'org.update_profile'], ['OC-ORG-003', 'org.elevate_status'], ['OC-ORG-004', 'org.read'],
  ['OC-PERSON-001', 'person.create'], ['OC-PERSON-002', 'person.update'], ['OC-PERSON-003', 'person.mutate'], ['OC-PERSON-004', 'person.assign'], ['OC-PERSON-005', 'person.read'], ['OC-PERSON-006', 'person.update_family'], ['OC-PERSON-007', 'person.update_competency'],
  ['OC-PASTORAL-001', 'pastoral.create'], ['OC-PASTORAL-002', 'pastoral.update'], ['OC-PASTORAL-003', 'pastoral.delete'], ['OC-PASTORAL-004', 'pastoral.read'], ['OC-PASTORAL-005', 'schedule.create'], ['OC-PASTORAL-006', 'schedule.update'],
  ['OC-ASSET-001', 'asset.create'], ['OC-ASSET-002', 'asset.update'], ['OC-ASSET-003', 'asset.delete'], ['OC-ASSET-004', 'asset.read'], ['OC-ASSET-005', 'asset.upload_attachment'],
  ['OC-TERRITORY-001', 'territory.create_risk'], ['OC-TERRITORY-002', 'territory.create_potential'], ['OC-TERRITORY-003', 'territory.update'], ['OC-TERRITORY-004', 'territory.upload_attachment'],
  ['OC-DEMO-001', 'demography.upsert'], ['OC-DEMO-002', 'demography.read'],
  ['OC-AID-001', 'aid.create'], ['OC-AID-002', 'aid.update'], ['OC-AID-003', 'aid.submit'], ['OC-AID-004', 'aid.approve.step_1'], ['OC-AID-005', 'aid.approve.step_2'], ['OC-AID-006', 'aid.reject'], ['OC-AID-007', 'aid.resubmit'],
  ['OC-USER-001', 'user.create'], ['OC-USER-002', 'user.update_role'], ['OC-USER-003', 'user.update_status'], ['OC-USER-004', 'user.delete'], ['OC-USER-005', 'user.update_own_profile'], ['OC-USER-006', 'user.toggle_biometric']
];

let blocks = [];
for (let i = 0; i < contracts.length; i++) {
  let cid = contracts[i][0];
  let pid = contracts[i][1];
  
  if (cid === 'OC-PERSON-007') {
    blocks.push([
      "  ['" + cid + "', {",
      "    contract_id: '" + cid + "',",
      "    permission: '" + pid + "',",
      "    target_entity_type: 'm_person',",
      "    registry_status: 'UNRESOLVED',",
      "    dimensions: {",
      "      L2_PERMISSION: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },",
      "      L3_CONTEXT: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },",
      "      L4_RELATIONSHIP: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },",
      "      L5_LIFECYCLE: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false },",
      "      L6_PRECONDITIONS: { applicability: 'NOT_APPLICABLE', constraint: null, rls_projection: false }",
      "    },",
      "    execution_metadata: { resulting_transition: null, operation_type: 'UPDATE' }",
      "  }]"
    ].join('\n'));
    continue;
  }

  let l3 = "APPLICABLE_RLS_PROJECTED";
  let l4 = "APPLICABLE_RLS_PROJECTED";
  let l5 = "NOT_APPLICABLE";
  let l6 = "NOT_APPLICABLE";
  let opType = 'UPDATE';
  let targetEntity = 'entity';

  let readOps = ['org.read', 'pastoral.read', 'asset.read', 'demography.read', 'person.read'];
  if (readOps.includes(pid)) {
    opType = 'READ';
    l6 = "NOT_APPLICABLE";
  } else if (pid.includes('.create')) {
    opType = 'CREATE';
    l6 = "APPLICABLE_NOT_RLS_PROJECTED";
  } else if (pid.includes('aid.')) {
    opType = 'WORKFLOW_TRANSITION';
    l4 = "APPLICABLE_NOT_RLS_PROJECTED";
    l5 = "APPLICABLE_NOT_RLS_PROJECTED";
    l6 = "APPLICABLE_NOT_RLS_PROJECTED";
  } else if (pid === 'person.update_family' || pid === 'user.toggle_biometric') {
    opType = 'UPDATE';
    l3 = "NOT_APPLICABLE";
    l4 = "APPLICABLE_RLS_PROJECTED";
    l6 = "APPLICABLE_NOT_RLS_PROJECTED";
  } else if (pid === 'user.update_own_profile') {
    opType = 'UPDATE';
    l3 = "NOT_APPLICABLE";
    l4 = "APPLICABLE_RLS_PROJECTED";
    l6 = "APPLICABLE_NOT_RLS_PROJECTED";
  } else {
    opType = pid.includes('.delete') ? 'DELETE' : 'UPDATE';
    l6 = "APPLICABLE_NOT_RLS_PROJECTED";
  }

  let l3Constraint = l3 === "NOT_APPLICABLE" ? "null" : "'Context scope constraint'";
  let l4Constraint = l4 === "NOT_APPLICABLE" ? "null" : "'Relationship scope constraint'";
  let l5Constraint = l5 === "NOT_APPLICABLE" ? "null" : "'Lifecycle state constraint'";
  let l6Constraint = l6 === "NOT_APPLICABLE" ? "null" : "'Operation precondition constraint'";

  blocks.push([
    "  ['" + cid + "', {",
    "    contract_id: '" + cid + "',",
    "    permission: '" + pid + "',",
    "    target_entity_type: '" + targetEntity + "',",
    "    registry_status: 'ACTIVE',",
    "    dimensions: {",
    "      L2_PERMISSION: { applicability: 'APPLICABLE_NOT_RLS_PROJECTED', constraint: 'Valid permission required', rls_projection: false },",
    "      L3_CONTEXT: { applicability: '" + l3 + "', constraint: " + l3Constraint + ", rls_projection: " + (l3 === 'APPLICABLE_RLS_PROJECTED' ? 'true' : 'false') + " },",
    "      L4_RELATIONSHIP: { applicability: '" + l4 + "', constraint: " + l4Constraint + ", rls_projection: " + (l4 === 'APPLICABLE_RLS_PROJECTED' ? 'true' : 'false') + " },",
    "      L5_LIFECYCLE: { applicability: '" + l5 + "', constraint: " + l5Constraint + ", rls_projection: false },",
    "      L6_PRECONDITIONS: { applicability: '" + l6 + "', constraint: " + l6Constraint + ", rls_projection: false }",
    "    },",
    "    execution_metadata: { resulting_transition: null, operation_type: '" + opType + "' }",
    "  }]"
  ].join('\n'));
}

const content = "import type { ContractId, ContractDefinition } from '../types/contract.types';\n\n" +
  "export const CONTRACT_REGISTRY: ReadonlyMap<ContractId, ContractDefinition> = new Map([\n" +
  blocks.join(",\n") + "\n]);\n\n" +
  "export const CONTRACT_COUNT = CONTRACT_REGISTRY.size;\n";

fs.writeFileSync(path.join(__dirname, 'src/lib/authorization/registry/contract-registry.ts'), content);
console.log('done');
