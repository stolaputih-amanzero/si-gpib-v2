import type { ContractDefinition, IdentityObject, ActiveContextObject, OperationInput, EvaluatorResult } from '../../types';

export interface EvaluatorContext {
  contract: ContractDefinition;
  identity: IdentityObject;
  activeContext: ActiveContextObject;
  operationInput: OperationInput;
  currentState?: string | null;
}

export interface Evaluator {
  evaluate(ctx: EvaluatorContext): EvaluatorResult;
}
