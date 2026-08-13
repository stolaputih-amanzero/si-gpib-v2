/**
 * src/lib/authorization/engine/context-resolver.ts
 *
 * Context Resolver — Gate 1B (IContextResolver implementation).
 *
 * Identity Resolution Sequence Step 3 (Part 1 v1.3 §2):
 *   ACTIVE CONTEXT RESOLUTION (server-validated)
 *
 * Ontological authority:
 *   - Gate 1B: Resolver Interfaces v1.0 (FROZEN)
 *   - Part 1 v1.3 §2: Identity Resolution Sequence
 *   - Gate 3 Step 1: Context Hierarchy & Scope Rules
 *   - 05-UX-Canonical-Model §2.6, §2.13, §2.14
 *
 * AUTH-02: Client Context = CLAIM; Server Resolution = TRUSTED RESULT.
 * AC-01: ActiveContextObject is SERVER-VALIDATED RESOLUTION RESULT.
 * VC-03: Session State ≠ Security Authority.
 * PR-09: Context is Explicit and Session-Bound.
 * R-15: Context Resolution Failure ≠ L3 INVALID_CONTEXT.
 * FAIL-02: No ActiveContextObject → No Engine Decision.
 *
 * This resolver is I/O bound (Supabase queries). It is NOT pure.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContextLevel } from '../types/identity.types';
import type { ActiveContextObject } from './evaluation.types';
import type { ResolutionFailure } from './resolver.types';

/**
 * IContextResolver — validates the client's claimed context and produces
 * a server-validated ActiveContextObject.
 *
 * AUTH-02: The client sends a claimedContextId (a CLAIM). This resolver
 * validates it against the database and the user's Assignments, producing
 * a TRUSTED ActiveContextObject.
 *
 * VC-03: The client's Active Context is a state preference. This resolver
 * is the server-side authority that validates it.
 */
export interface IContextResolver {
  resolveActiveContext(
    userId: string,
    claimedContextId: string,
  ): Promise<ActiveContextObject | ResolutionFailure>;
}

/**
 * Supabase-backed implementation of IContextResolver.
 *
 * Resolution sequence:
 *   1. Determine the context level and entity from claimedContextId.
 *   2. Validate that the user has a valid Assignment to this context.
 *   3. Build the ancestor hierarchy for Downward Reach (RULE-1).
 *   4. Return server-validated ActiveContextObject.
 *
 * R-15: If validation fails, return ResolutionFailure (NOT L3 INVALID_CONTEXT).
 * FAIL-02: If no ActiveContextObject can be produced, the Engine is not invoked.
 */
export class SupabaseContextResolver implements IContextResolver {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Resolves and validates the Active Context.
   *
   * AUTH-02: claimedContextId is a CLIENT CLAIM. This method validates it
   * server-side before producing the trusted ActiveContextObject.
   *
   * @param userId           - The authenticated User Account ID.
   * @param claimedContextId - The context ID claimed by the client.
   * @returns ActiveContextObject (trusted) or ResolutionFailure.
   */
  async resolveActiveContext(
    userId: string,
    claimedContextId: string,
  ): Promise<ActiveContextObject | ResolutionFailure> {
    // Step 1: Resolve the context entity and level from the claimed ID.
    // The context could be a Mupel, Jemaat, or Pos.
    // (Sinode is implicit/global and handled separately.)
    const contextEntity = await this.resolveContextEntity(claimedContextId);

    if (!contextEntity) {
      // R-15: Context Resolution Failure ≠ L3 INVALID_CONTEXT.
      // This is a technical failure (context not found), not an authorization denial.
      return {
        failureType: 'CONTEXT_NOT_FOUND',
        diagnosticMessage:
          `Claimed context '${claimedContextId}' does not exist in any ` +
          `context table (m_mupel, m_jemaat_induk, m_pos_pelkes).`,
      };
    }

    // Step 2: Validate that the user has a valid Assignment to this context.
    // AUTH-02: Server-side validation of the client's claim.
    // AD-G3-02-03: Assignment as Scope Bridge.
    const hasAssignment = await this.validateAssignment(
      userId,
      contextEntity.contextId,
      contextEntity.contextLevel,
    );

    if (!hasAssignment) {
      // R-15: This is a Context Resolution Failure, NOT L3 INVALID_CONTEXT.
      // The user claimed a context they have no assignment to.
      return {
        failureType: 'CONTEXT_CLAIM_INVALID',
        diagnosticMessage:
          `User '${userId}' has no valid Assignment to context ` +
          `'${claimedContextId}' (${contextEntity.contextLevel}). ` +
          `Client claim rejected by server-side validation.`,
      };
    }

    // Step 3: Build the ancestor hierarchy for Downward Reach (RULE-1).
    // This enables O(1) context comparison in the Engine (Gate 1C).
    const hierarchy = await this.buildHierarchy(contextEntity);

    // Step 4: Return the server-validated ActiveContextObject.
    // AC-01: This is the TRUSTED resolution result, not the client's claim.
    return {
      contextId: contextEntity.contextId,
      contextLevel: contextEntity.contextLevel,
      hierarchy,
    };
  }

  /**
   * Resolves the context entity from a context ID.
   *
   * Queries m_pos_pelkes, m_jemaat_induk, m_mupel in order
   * (most specific to least specific) to determine the context level.
   *
   * Gate 3 Step 1 §1: Context Hierarchy.
   * VC-04: Context ≠ Organization Entity (shared physical source,
   *        distinct ontology). Here we read the physical table to
   *        resolve the Context.
   *
   * @param contextId - The claimed context identifier.
   * @returns Context entity info, or null if not found.
   */
  private async resolveContextEntity(
    contextId: string,
  ): Promise<{
    contextId: string;
    contextLevel: ContextLevel;
    // Ancestor IDs for hierarchy building
    parentJemaatId?: string;
    parentMupelId?: string;
  } | null> {
    // Check Pos Pelkes (LEVEL 3)
    const { data: posRow } = await this.supabase
      .from('m_pos_pelkes')
      .select('id, id_jemaat_induk')
      .eq('id', contextId)
      .maybeSingle();

    if (posRow) {
      return {
        contextId: posRow.id,
        contextLevel: 'POS',
        parentJemaatId: posRow.id_jemaat_induk,
      };
    }

    // Check Jemaat Induk (LEVEL 2)
    const { data: jemaatRow } = await this.supabase
      .from('m_jemaat_induk')
      .select('id, id_mupel')
      .eq('id', contextId)
      .maybeSingle();

    if (jemaatRow) {
      return {
        contextId: jemaatRow.id,
        contextLevel: 'JEMAAT',
        parentMupelId: jemaatRow.id_mupel,
      };
    }

    // Check Mupel (LEVEL 1)
    const { data: mupelRow } = await this.supabase
      .from('m_mupel')
      .select('id')
      .eq('id', contextId)
      .maybeSingle();

    if (mupelRow) {
      return {
        contextId: mupelRow.id,
        contextLevel: 'MUPEL',
      };
    }

    // Context not found in any table.
    return null;
  }

  /**
   * Validates that the user has a valid Assignment to the given context.
   *
   * AD-G3-02-03: Assignment as Scope Bridge.
   * CI-G3-02-02: Assignment is authoritative mechanism for operational scope.
   *
   * This checks the Assignment tables (t_penugasan_pendeta, t_pj_jemaat,
   * t_jabatan_struktural) to verify the user has an active assignment
   * to the specified context.
   *
   * @param userId       - The User Account ID.
   * @param contextId    - The context to validate against.
   * @param contextLevel - The level of the context.
   * @returns true if the user has a valid assignment.
   */
  private async validateAssignment(
    userId: string,
    contextId: string,
    contextLevel: ContextLevel,
  ): Promise<boolean> {
    // First, resolve the personId linked to this user.
    // (Assignments are tied to Person, not User Account.)
    const personId = await this.getLinkedPersonId(userId);
    if (!personId) {
      return false;
    }

    // SUPER_ADMIN / global scope check:
    // If the user has global scope (super_user), they have access to all contexts.
    // PIPE-05: No bypass except explicit super_user.
    // RLS-10: Global Scope ≠ RLS Bypass (but super_user is a valid assignment).
    const isSuperUser = await this.checkSuperUser(userId);
    if (isSuperUser) {
      return true;
    }

    // Check assignments based on context level.
    switch (contextLevel) {
      case 'POS':
        // Check t_penugasan_pendeta (Pendeta assigned to Pos)
        // or t_pj_jemaat (PJ assigned to Pos)
        return this.hasPosAssignment(personId, contextId);

      case 'JEMAAT':
        // Check t_pj_jemaat (KMJ/PJ at Jemaat)
        // or t_jabatan_struktural (Sekretaris/Bendahara at Jemaat)
        return this.hasJemaatAssignment(personId, contextId);

      case 'MUPEL':
        // Check t_jabatan_struktural (BP Mupel positions)
        return this.hasMupelAssignment(personId, contextId);

      case 'SINODE':
        // Sinode is global scope. Only super_user / admin_sinode.
        // This is handled by the isSuperUser check above.
        return false;

      default:
        return false;
    }
  }

  /**
   * Builds the ancestor hierarchy for Downward Reach (RULE-1).
   *
   * Gate 3 Step 1 RULE-1: Ancestor context has potential read scope
   * over descendant context. The hierarchy enables O(1) comparison
   * in the Engine without additional DB queries.
   *
   * @param contextEntity - The resolved context entity.
   * @returns The hierarchy object with ancestor IDs.
   */
  private async buildHierarchy(contextEntity: {
    contextId: string;
    contextLevel: ContextLevel;
    parentJemaatId?: string;
    parentMupelId?: string;
  }): Promise<ActiveContextObject['hierarchy']> {
    // Sinode is always the root (implicit global scope).
    // Using a constant for the single Sinode entity.
    const SINODE_ID = 'SINODE-GPIB';

    const hierarchy: {
      sinodeId: string;
      mupelId?: string;
      jemaatId?: string;
      posId?: string;
    } = {
      sinodeId: SINODE_ID,
    };

    if (contextEntity.contextLevel === 'MUPEL') {
      hierarchy.mupelId = contextEntity.contextId;
    } else if (contextEntity.contextLevel === 'JEMAAT') {
      hierarchy.mupelId = contextEntity.parentMupelId;
      hierarchy.jemaatId = contextEntity.contextId;
    } else if (contextEntity.contextLevel === 'POS') {
      // For POS, we need to resolve the full ancestor chain.
      hierarchy.jemaatId = contextEntity.parentJemaatId;

      if (contextEntity.parentJemaatId) {
        // Resolve the Mupel from the parent Jemaat.
        const { data: jemaatRow } = await this.supabase
          .from('m_jemaat_induk')
          .select('id_mupel')
          .eq('id', contextEntity.parentJemaatId)
          .maybeSingle();

        if (jemaatRow) {
          hierarchy.mupelId = jemaatRow.id_mupel;
        }
      }

      hierarchy.posId = contextEntity.contextId;
    }

    return hierarchy as ActiveContextObject['hierarchy'];
  }

  // ── Helper methods ──────────────────────────────────────────────

  private async getLinkedPersonId(userId: string): Promise<string | null> {
    // Query across Person tables to find the linked personId.
    const { data: pendeta } = await this.supabase
      .from('m_pendeta')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (pendeta) return pendeta.id;

    const { data: pelayan } = await this.supabase
      .from('t_pelayan')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (pelayan) return pelayan.id;

    const { data: relawan } = await this.supabase
      .from('t_relawan')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (relawan) return relawan.id;

    return null;
  }

  private async checkSuperUser(userId: string): Promise<boolean> {
    // AD-G3-02-07: users.role is NOT ontological truth, but for the
    // purpose of identifying super_user global scope, we check the
    // users table. This is a technical check, not an authorization decision.
    const { data: userRow } = await this.supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    // Check if the user holds a super_user / SUPER_ADMIN role.
    return userRow?.role === 'super_user' || userRow?.role === 'SUPER_ADMIN';
  }

  private async hasPosAssignment(personId: string, posId: string): Promise<boolean> {
    // Check t_penugasan_pendeta (Pendeta assigned to Pos)
    const { data: penugasan } = await this.supabase
      .from('t_penugasan_pendeta')
      .select('id')
      .eq('id_pendeta', personId)
      .eq('id_pos', posId)
      .not('tanggal_selesai', 'lt', new Date().toISOString())
      .maybeSingle();

    if (penugasan) return true;

    // Check t_pj_jemaat (PJ assigned to Pos)
    const { data: pjPos } = await this.supabase
      .from('t_pj_jemaat')
      .select('id')
      .eq('id_pendeta', personId)
      .eq('id_pos', posId)
      .maybeSingle();

    return !!pjPos;
  }

  private async hasJemaatAssignment(personId: string, jemaatId: string): Promise<boolean> {
    // Check t_pj_jemaat (KMJ at Jemaat)
    const { data: kmj } = await this.supabase
      .from('t_pj_jemaat')
      .select('id')
      .eq('id_pendeta', personId)
      .eq('id_jemaat', jemaatId)
      .maybeSingle();

    if (kmj) return true;

    // Check t_jabatan_struktural (Sekretaris/Bendahara/other structural roles)
    const { data: jabatan } = await this.supabase
      .from('t_jabatan_struktural')
      .select('id')
      .eq('id_person', personId)
      .eq('id_jemaat', jemaatId)
      .maybeSingle();

    return !!jabatan;
  }

  private async hasMupelAssignment(personId: string, mupelId: string): Promise<boolean> {
    // Check t_jabatan_struktural (BP Mupel positions)
    const { data: jabatan } = await this.supabase
      .from('t_jabatan_struktural')
      .select('id')
      .eq('id_person', personId)
      .eq('id_mupel', mupelId)
      .maybeSingle();

    return !!jabatan;
  }
}
