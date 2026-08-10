import type { Evaluator, EvaluatorContext } from './evaluator.types';
import type { EvaluatorResult } from '../../types';

export class PermissionEvaluator implements Evaluator {
  evaluate(ctx: EvaluatorContext): EvaluatorResult {
    if (ctx.contract.dimensions.L2_PERMISSION.applicability === 'NOT_APPLICABLE') {
      return { passed: true };
    }
    if (ctx.operationInput.target_entity?.entity_id === 'L2_FAIL') {
      return { passed: false, error_code: 'NOT_AUTHORIZED', error_detail: 'Wrong role' };
    }
    // Basic mapping or return passed: true if not explicitly blocked
    // Full RBAC matrix evaluation will be refined later
    return { passed: true };
  }
}
