import { CONTRACT_REGISTRY } from '../registry/contract-registry';
import type { ContractId, ContractDefinition } from '../types/contract.types';

export type ContractResolutionResult =
  | { status: 'RESOLVED'; contract: ContractDefinition }
  | { status: 'UNRESOLVED'; contract: ContractDefinition }
  | { status: 'DEFERRED'; contract: ContractDefinition }
  | { status: 'NOT_FOUND' };

export interface ContractResolver {
  resolve(contractId: ContractId): ContractResolutionResult;
}

export class DefaultContractResolver implements ContractResolver {
  resolve(contractId: ContractId): ContractResolutionResult {
    const contract = CONTRACT_REGISTRY.get(contractId);
    if (!contract) return { status: 'NOT_FOUND' };
    
    if (contract.registry_status === 'ACTIVE') return { status: 'RESOLVED', contract };
    if (contract.registry_status === 'UNRESOLVED') return { status: 'UNRESOLVED', contract };
    if (contract.registry_status === 'DEFERRED') return { status: 'DEFERRED', contract };
    
    return { status: 'NOT_FOUND' };
  }
}
