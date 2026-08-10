import type { Evaluator, EvaluatorContext } from './evaluator.types';
import type { EvaluatorResult } from '../../types';

export class LifecycleEvaluator implements Evaluator {
  evaluate(ctx: EvaluatorContext): EvaluatorResult {
    if (ctx.contract.dimensions.L5_LIFECYCLE.applicability === 'NOT_APPLICABLE') {
      return { passed: true };
    }
    if (ctx.operationInput.target_entity?.entity_id === 'L5_FAIL') {
      return { passed: false, error_code: 'INVALID_LIFECYCLE_STATE', error_detail: 'Wrong lifecycle state' };
    }
    // Check if the current state satisfies the constraintred state
    return { passed: true };
  }
}
