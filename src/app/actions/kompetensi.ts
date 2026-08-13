/**
 * src/app/actions/kompetensi.ts
 *
 * A-1: OC-PERSON-007 (person.update_competency) — UNRESOLVED.
 *
 * SA-A1: Unresolved Contract MUST NOT be converted by inference.
 * Part 3 v1.1 §5: NO enforcement orchestration, NO authorization,
 *                 NO inferred behavior.
 * Part 4 v1.0 §2: NO inferred ALLOW/DENY/permission/RLS/enforcement/error code.
 * PIP-05: RLS policy for OC-PERSON-007 is PROHIBITED.
 * PIP-15: C/D/E items MUST NOT be placed in enforceContract().
 * PIP-16: UNRESOLVED/DEFERRED MUST NOT be changed via implementation.
 *
 * ALH-01: Application handling ≠ Authorization.
 * ALH-04: UI Visibility ≠ Authorization.
 * ALH-05: No Frozen Error Code mapping for unresolved.
 *
 * This action is UNRESOLVED. It MUST NOT call enforceContract().
 * It MUST NOT produce an authorization decision.
 * It MUST NOT map to a Frozen Error Code.
 *
 * If this action is invoked, it throws a SystemError indicating
 * that the contract is UNRESOLVED and requires formal change-management.
 */

'use server';

/**
 * Add Kompetensi — OC-PERSON-007 (UNRESOLVED).
 *
 * ⚠️ A-1 BOUNDARY: This action has NO enforcement orchestration.
 * ⚠️ NO authorization check.
 * ⚠️ NO RLS policy enforcement.
 * ⚠️ NO inferred ALLOW or DENY.
 * ⚠️ NO Frozen Error Code mapping.
 *
 * SA-A1: Unresolved Contract MUST NOT be converted by inference.
 * Part 4 v1.0 §2: Application behavior may manage availability,
 * presentation, and technical failure, but may not manufacture
 * an authorization decision where none exists.
 *
 * @param formData - Form data (not used for authorization).
 * @throws Error indicating UNRESOLVED status.
 */
export async function addKompetensiAction(_formData: FormData): Promise<never> {
  // ═══════════════════════════════════════════════════════════
  // NO enforceContract() CALL.
  // NO authorization check.
  // NO RLS policy enforcement.
  // NO inferred ALLOW or DENY.
  // NO Frozen Error Code mapping.
  // ═══════════════════════════════════════════════════════════
  //
  // This action is UNRESOLVED (A-1 boundary).
  // It cannot be executed until formally resolved through
  // the change-management process (CHG-01).
  //
  // ALH-01: Application handling ≠ Authorization.
  // ALH-02: Feature Flag ≠ Authorization Substitute.
  // ALH-04: UI Visibility ≠ Authorization.
  //
  // If the UI hides this action, that is a presentation decision,
  // NOT an authorization decision (ALH-04).
  // If the action is invoked despite being hidden, it MUST fail
  // with a clear indication that it is UNRESOLVED.

  throw new Error(
    'OC-PERSON-007 (person.update_competency) is UNRESOLVED. ' +
    'No enforcement orchestration exists for this action. ' +
    'This action cannot be executed until formally resolved ' +
    'through the change-management process (CHG-01). ' +
    'SA-A1: Unresolved Contract MUST NOT be converted by inference.',
  );
}
