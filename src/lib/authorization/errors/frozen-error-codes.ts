import type { FrozenErrorCode } from '../types/error.types';

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
