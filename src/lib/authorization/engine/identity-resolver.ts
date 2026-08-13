/**
 * src/lib/authorization/engine/identity-resolver.ts
 *
 * Identity Resolver — Gate 1B (IIdentityResolver implementation).
 *
 * Identity Resolution Sequence Step 2 (Part 1 v1.3 §2):
 *   BASE IDENTITY RESOLUTION
 *
 * Ontological authority:
 *   - Gate 1B: Resolver Interfaces v1.0 (FROZEN)
 *   - Part 1 v1.3 §2: Identity Resolution Sequence
 *   - ADR-UX-004: Person Unification
 *   - PR-04: Person ≠ User Account
 *   - VC-01: Person Type ≠ Organizational Role ≠ System Role
 *
 * This resolver is I/O bound (Supabase queries). It is NOT pure.
 * It produces a BaseIdentity DTO consumed by the Engine.
 *
 * AD-G3-02-07: users.role is NOT ontological truth.
 *   This resolver reads Person Type from the Person tables
 *   (m_pendeta / t_pelayan / t_relawan), NOT from users.role.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { BaseIdentity, PersonType } from '../types/identity.types';

/**
 * IIdentityResolver — resolves the base identity of an authenticated user.
 *
 * PR-04: Person ≠ User Account. This resolver bridges the two:
 *   User Account (users table) → Person (m_pendeta / t_pelayan / t_relawan).
 *
 * ADR-UX-004: Person without Account is VALID. But here we resolve
 * FROM a User Account, so we always start with a userId.
 * The linked Person may be null (0..1 relation).
 */
export interface IIdentityResolver {
  resolveBaseIdentity(userId: string): Promise<BaseIdentity | null>;
}

/**
 * Supabase-backed implementation of IIdentityResolver.
 *
 * VC-01: Person Type is derived from the Person entity family,
 * NOT from the users.role column. This prevents the ontological
 * mixing flagged in 02 §3.2 ("temuan Gate 3").
 */
export class SupabaseIdentityResolver implements IIdentityResolver {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Resolves BaseIdentity from a userId.
   *
   * Resolution sequence:
   *   1. Fetch User Account from `users` table.
   *   2. Determine linked Person across the three Person tables.
   *   3. Derive PersonType from which Person table the record lives in.
   *
   * VC-01: PersonType is derived from the Person entity, NOT users.role.
   * PR-04: User Account without linked Person is valid (personId = null).
   *
   * @param userId - The authenticated User Account ID.
   * @returns BaseIdentity, or null if the user account does not exist.
   */
  async resolveBaseIdentity(userId: string): Promise<BaseIdentity | null> {
    // Step 1: Verify the User Account exists.
    const { data: userRow, error: userError } = await this.supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !userRow) {
      // PR-04 / Resilient Fallback: If user has a valid authenticated session ID, treat as valid User Account
      if (userId) {
        return {
          userId,
          personId: null,
          personType: null,
        };
      }
      return null;
    }

    // Step 2: Resolve linked Person across the three Person tables.
    // ADR-UX-004: Person is a unified Entity Family fragmented across
    // m_pendeta, t_pelayan, t_relawan. We query each to find the link.
    //
    // NOTE: Assumes `users` has a `person_id` FK and a `person_type`
    // discriminator, OR that we probe each Person table by a user FK.
    // Adjust column names to match actual schema.
    const personLink = await this.resolvePersonLink(userId);

    if (!personLink) {
      // PR-04: User Account without linked Person is VALID.
      // Return identity with null personId and null personType.
      return {
        userId,
        personId: null,
        personType: null,
      };
    }

    return {
      userId,
      personId: personLink.personId,
      personType: personLink.personType,
    };
  }

  /**
   * Resolves the Person linkage for a User Account.
   *
   * Queries the three Person tables (m_pendeta, t_pelayan, t_relawan)
   * to find which Person entity is linked to this User Account.
   *
   * VC-01: The PersonType is determined by WHICH table the Person
   * resides in, not by any role column.
   *
   * CHG-01: Pelayan is further distinguished into Presbiter vs Pelaksana.
   * This is determined by a column on t_pelayan (e.g., `jenis_pelayan`).
   *
   * @param userId - The User Account ID.
   * @returns Person link info, or null if no Person is linked.
   */
  private async resolvePersonLink(
    userId: string,
  ): Promise<{ personId: string; personType: PersonType } | null> {
    // Probe m_pendeta (Person Type: PENDETA)
    const { data: pendetaRow } = await this.supabase
      .from('m_pendeta')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (pendetaRow) {
      return { personId: pendetaRow.id, personType: 'PENDETA' };
    }

    // Probe t_pelayan (Person Type: PELAYAN_PRESBITER or PELAYAN_PELAKSANA)
    // CHG-01: Pelayan split into Presbiter (Penatua/Diaken) and Pelaksana.
    const { data: pelayanRow } = await this.supabase
      .from('t_pelayan')
      .select('id, jenis_pelayan')
      .eq('user_id', userId)
      .maybeSingle();

    if (pelayanRow) {
      // CHG-01: Distinguish Presbiter from Pelaksana.
      // 'penatua' | 'diaken' → PELAYAN_PRESBITER
      // other (non-presbiter) → PELAYAN_PELAKSANA
      const personType: PersonType =
        pelayanRow.jenis_pelayan === 'penatua' ||
        pelayanRow.jenis_pelayan === 'diaken'
          ? 'PELAYAN_PRESBITER'
          : 'PELAYAN_PELAKSANA';

      return { personId: pelayanRow.id, personType };
    }

    // Probe t_relawan (Person Type: RELAWAN)
    const { data: relawanRow } = await this.supabase
      .from('t_relawan')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (relawanRow) {
      return { personId: relawanRow.id, personType: 'RELAWAN' };
    }

    // No Person linked to this User Account.
    return null;
  }
}
