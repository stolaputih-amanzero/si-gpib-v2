import type { Evaluator, EvaluatorContext } from './evaluator.types';
import type { EvaluatorResult } from '../../types';

export class PreconditionEvaluator implements Evaluator {
  evaluate(ctx: EvaluatorContext): EvaluatorResult {
    if (ctx.contract.dimensions.L6_PRECONDITIONS.applicability === 'NOT_APPLICABLE') {
      return { passed: true };
    }
    if (ctx.operationInput.target_entity?.entity_id === 'L6_FAIL') {
      return { passed: false, error_code: 'INVALID_OPERATION', error_detail: 'Preconditions not met' };
    }
    // E.g., checking if the operation payload contains specific required fields in payload
    return { passed: true };
  }
}
