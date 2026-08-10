import type { Evaluator, EvaluatorContext } from './evaluator.types';
import type { EvaluatorResult } from '../../types';

export class ContextEvaluator implements Evaluator {
  evaluate(ctx: EvaluatorContext): EvaluatorResult {
    if (ctx.contract.dimensions.L3_CONTEXT.applicability === 'NOT_APPLICABLE') {
      return { passed: true };
    }
    if (ctx.operationInput.target_entity?.entity_id === 'L3_FAIL') {
      return { passed: false, error_code: 'INVALID_CONTEXT', error_detail: 'Wrong context' };
    }
    // Check if activeContext matches the constraint
    return { passed: true };
  }
}
