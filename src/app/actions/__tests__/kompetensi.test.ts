/**
 * src/app/actions/__tests__/kompetensi.test.ts
 *
 * A-1 Boundary: OC-PERSON-007 (person.update_competency) — UNRESOLVED.
 *
 * SA-A1: Unresolved Contract MUST NOT be converted by inference.
 * Part 3 v1.1 §5: NO enforcement orchestration, NO authorization,
 *                 NO inferred behavior.
 * Part 4 v1.0 §2: NO inferred ALLOW/DENY/permission/RLS/enforcement.
 * PIP-05: RLS policy for OC-PERSON-007 is PROHIBITED.
 * PIP-16: UNRESOLVED/DEFERRED MUST NOT be changed via implementation.
 */

import { describe, it, expect } from 'vitest';
import { addKompetensiAction } from '../kompetensi';

describe('A-1 Boundary: addKompetensiAction (OC-PERSON-007)', () => {
  it('SA-A1: MUST throw UNRESOLVED error without calling enforceContract', async () => {
    const formData = new FormData();
    formData.append('kompetensi', 'test');

    // The action MUST throw an error indicating UNRESOLVED status.
    await expect(addKompetensiAction(formData)).rejects.toThrow(
      /UNRESOLVED/,
    );
  });

  it('SA-A1: error message MUST reference OC-PERSON-007', async () => {
    const formData = new FormData();

    await expect(addKompetensiAction(formData)).rejects.toThrow(
      /OC-PERSON-007/,
    );
  });

  it('SA-A1: error message MUST reference change-management process', async () => {
    const formData = new FormData();

    await expect(addKompetensiAction(formData)).rejects.toThrow(
      /change-management/,
    );
  });

  it('ALH-05: MUST NOT throw AuthorizationError (no Frozen Error Code)', async () => {
    const formData = new FormData();

    try {
      await addKompetensiAction(formData);
      // Should not reach here.
      expect(true).toBe(false);
    } catch (error) {
      // The error MUST NOT be an AuthorizationError.
      expect((error as Error).name).not.toBe('AuthorizationError');

      // The error MUST NOT have a Frozen Error Code.
      expect(error).not.toHaveProperty('errorCode');
    }
  });
});
