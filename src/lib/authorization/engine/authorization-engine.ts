import type { 
  ContractId, 
  OperationInput, 
  EngineEvaluationResult,
  IdentityObject,
  ActiveContextObject
} from '../types';
import { DefaultContractResolver } from './contract-resolver';
import { PermissionEvaluator } from './evaluators/permission-evaluator';
import { ContextEvaluator } from './evaluators/context-evaluator';
import { RelationshipEvaluator } from './evaluators/relationship-evaluator';
import { LifecycleEvaluator } from './evaluators/lifecycle-evaluator';
import { PreconditionEvaluator } from './evaluators/precondition-evaluator';

export interface AuthorizationEngineDeps {
  identity: IdentityObject;
  activeContext: ActiveContextObject;
  currentState?: string | null;
}

export class AuthorizationEngine {
  private contractResolver = new DefaultContractResolver();
  private evaluators = [
    new PermissionEvaluator(),
    new ContextEvaluator(),
    new RelationshipEvaluator(),
    new LifecycleEvaluator(),
    new PreconditionEvaluator(),
  ];

  async evaluate(
    contractId: ContractId,
    operationInput: OperationInput,
    deps: AuthorizationEngineDeps
  ): Promise<EngineEvaluationResult> {
    // 1. Contract Resolution
    const resolution = this.contractResolver.resolve(contractId);
    
    if (resolution.status === 'NOT_FOUND' || resolution.status === 'UNRESOLVED' || resolution.status === 'DEFERRED') {
      return { status: 'CONTRACT_RESOLUTION_FAILURE', decision: null };
    }

    const contract = resolution.contract;

    // 2. L2-L6 Evaluation Pipeline (Sequential, Short-Circuit)
    const evalCtx = {
      contract,
      identity: deps.identity,
      activeContext: deps.activeContext,
      operationInput,
      currentState: deps.currentState,
    };

    for (const evaluator of this.evaluators) {
      const result = evaluator.evaluate(evalCtx);
      if (!result.passed) {
        return {
          status: 'EVALUATED',
          decision: {
            result: 'DENY',
            error_code: result.error_code,
            error_detail: result.error_detail,
            contract_id: contractId,
          }
        };
      }
    }

    // 3. All Passed -> ALLOW
    return {
      status: 'EVALUATED',
      decision: {
        result: 'ALLOW',
        error_code: null,
        error_detail: null,
        contract_id: contractId,
      }
    };
  }
}
