/**
 * src/lib/authorization/engine/role-binding-resolver.ts
 *
 * Role Binding Resolver — Gate 1B (IRoleBindingResolver implementation).
 *
 * Identity Resolution Sequence Step 4 (Part 1 v1.3 §2):
 *   ROLE BINDING RESOLUTION
 *
 * Ontological authority:
 *   - Gate 1B: Resolver Interfaces v1.0 (FROZEN)
 *   - Gate 3 Step 2 v1.1: Identity & Role Model (CHG-01 amended)
 *   - Part 1 v1.3: ID-04 (effective_system_role is SINGLE SOURCE)
 *   - CHG-01: System Role → 9 Authorization Profiles
 *
 * ID-04: effective_system_role is the SINGLE SOURCE for system role.
 * AD-G3-02-02: No Direct Role Equivalence (Org Role ≠ System Role).
 * AD-G3-02-05: Authorization Is Contextual.
 * CI-G3-02-03: Effective Role is contextual.
 *
 * This resolver is I/O bound (Supabase queries). It is NOT pure.
 * It determines the effective System Role (Authorization Profile)
 * based on the user's Organizational Role and Person Type in the
 * given Active Context.
 *
 * NOTE: This file is an addition to the Implementation Contract v1.1
 * directory structure, consistent with Gate 1B which defines 4 resolvers.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  OrganizationalRole,
  PersonType,
  SystemRole,
} from '../types/identity.types';
import type { RoleBinding } from '../types/identity.types';
import type { ActiveContextObject } from './evaluation.types';
import type { ResolutionFailure } from './resolver.types';

/**
 * IRoleBindingResolver — resolves the effective System Role for a user
 * in a given Active Context.
 *
 * ID-04: The output effectiveSystemRole is the SINGLE SOURCE for
 * system role in the authorization pipeline.
 *
 * AD-G3-02-05: Authorization Is Contextual. The same user may have
 * different effective roles in different contexts.
 */
export interface IRoleBindingResolver {
  resolveRoleBinding(
    userId: string,
    activeContext: ActiveContextObject,
  ): Promise<RoleBinding | ResolutionFailure>;
}

/**
 * Supabase-backed implementation of IRoleBindingResolver.
 *
 * CHG-01 Mapping: Organizational Role + Person Type + Context Level
 *                 → System Role (Authorization Profile)
 *
 * The 9 Authorization Profiles (Gate 3 Step 2 v1.1):
 *   SUPER_ADMIN, ADMIN, APPROVER, EXECUTOR, MINISTRY,
 *   ADMINISTRATOR, CONTRIBUTOR, VOLUNTEER, VIEWER
 */
export class SupabaseRoleBindingResolver implements IRoleBindingResolver {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Resolves the effective System Role (Authorization Profile) for a user
   * in the given Active Context.
   *
   * ID-04: effectiveSystemRole is the SINGLE SOURCE for system role.
   * AD-G3-02-05: Authorization Is Contextual.
   * CI-G3-02-03: Effective Role is contextual.
   *
   * @param userId        - The authenticated User Account ID.
   * @param activeContext - The server-validated Active Context.
   * @returns RoleBinding or ResolutionFailure.
   */
  async resolveRoleBinding(
    userId: string,
    activeContext: ActiveContextObject,
  ): Promise<RoleBinding | ResolutionFailure> {
    // Step 1: Resolve the user's Person Type and Organizational Roles
    // in this context.
    const personInfo = await this.resolvePersonInfo(userId);

    if (!personInfo) {
      return {
        failureType: 'ROLE_BINDING_FAILED',
        diagnosticMessage:
          `Cannot resolve Person info for user '${userId}'. ` +
          `Role binding requires a linked Person.`,
      };
    }

    // Step 2: Resolve Organizational Roles held in this context.
    const orgRoles = await this.resolveOrganizationalRoles(
      personInfo.personId,
      activeContext,
    );

    // Step 3: Resolve the Assignment that grants this role.
    const assignmentId = await this.resolveAssignmentId(
      personInfo.personId,
      activeContext,
    );

    if (!assignmentId) {
      return {
        failureType: 'ROLE_BINDING_FAILED',
        diagnosticMessage:
          `No active Assignment found for person '${personInfo.personId}' ` +
          `in context '${activeContext.contextId}'. Cannot bind role.`,
      };
    }

    // Step 4: Map Organizational Role + Person Type + Context Level
    //         → System Role (Authorization Profile).
    // CHG-01: This is the core mapping logic.
    const effectiveSystemRole = this.mapToAuthorizationProfile(
      personInfo.personType,
      orgRoles,
      activeContext.contextLevel,
    );

    return {
      effectiveSystemRole,
      organizationalRoles: orgRoles,
      assignmentId,
    };
  }

  /**
   * Maps Organizational Role + Person Type + Context Level to
   * the System Role (Authorization Profile).
   *
   * CHG-01: 9 Authorization Profiles.
   * AD-G3-02-02: No Direct Role Equivalence. This mapping is the
   * explicit translation from Org Role to System Role, not a 1:1 alias.
   * AD-G3-02-06: No RBAC Explosion. New org roles map to existing profiles.
   *
   * @param personType   - The Person Type (PENDETA, PELAYAN_PRESBITER, etc.)
   * @param orgRoles     - Organizational Roles held in this context.
   * @param contextLevel - The Active Context level.
   * @returns The effective System Role (Authorization Profile).
   */
  private mapToAuthorizationProfile(
    personType: PersonType | null,
    orgRoles: ReadonlyArray<OrganizationalRole>,
    contextLevel: ActiveContextObject['contextLevel'],
  ): SystemRole {
    // Rule 1: SUPER_ADMIN — global scope, highest authority.
    // Determined by context level SINODE + super_user designation.
    if (contextLevel === 'SINODE' && orgRoles.includes('ADMIN_MUPEL')) {
      // This is a simplification; actual super_user check should be
      // done via a dedicated flag or role check.
      return 'SUPER_ADMIN';
    }

    // Rule 2: ADMIN — Mupel-level coordination.
    // CHG-01 (D-18): Mupel has NO Aid authority. ADMIN is coordination only.
    if (contextLevel === 'MUPEL') {
      return 'ADMIN';
    }

    // Rule 3: APPROVER — KMJ at Jemaat level.
    // D-01: KMJ must be Pendeta.
    if (orgRoles.includes('KMJ') && personType === 'PENDETA') {
      return 'APPROVER';
    }

    // Rule 4: EXECUTOR — PJ at Jemaat or Pos level.
    // D-02: PJ must be Pendeta. D-13: PJ has full managerial authority at Pos.
    if (
      (orgRoles.includes('PJ') || orgRoles.includes('PJ_POS')) &&
      personType === 'PENDETA'
    ) {
      return 'EXECUTOR';
    }

    // Rule 5: ADMINISTRATOR — Presbiter as Sekretaris/Bendahara.
    // D-10: Sekretaris/Bendahara must be Presbiter (not Pendeta).
    if (
      (orgRoles.includes('SEKRETARIS_JEMAAT') ||
        orgRoles.includes('BENDAHARA_JEMAAT')) &&
      personType === 'PELAYAN_PRESBITER'
    ) {
      return 'ADMINISTRATOR';
    }

    // Rule 6: MINISTRY — Pendeta without structural position.
    if (personType === 'PENDETA' && orgRoles.length === 0) {
      return 'MINISTRY';
    }

    // Rule 7: CONTRIBUTOR — Pelaksana Komisi (Non-Presbiter).
    // D-06: Non-Presbiter only in Komisi. D-12: Limited permissions.
    if (personType === 'PELAYAN_PELAKSANA') {
      return 'CONTRIBUTOR';
    }

    // Rule 8: VOLUNTEER — Relawan.
    // D-03: Relawan cannot hold Organizational Role.
    if (personType === 'RELAWAN') {
      return 'VOLUNTEER';
    }

    // Rule 9: VIEWER — Default fallback.
    // FAIL-01: If no specific role mapping applies, default to VIEWER.
    // This is the most restrictive profile, consistent with fail-closed.
    return 'VIEWER';
  }

  // ── Helper methods ──────────────────────────────────────────────

  private async resolvePersonInfo(
    userId: string,
  ): Promise<{ personId: string; personType: PersonType | null } | null> {
    // Similar to IdentityResolver.resolvePersonLink.
    // In production, this could be shared via a common service.
    const { data: pendeta } = await this.supabase
      .from('m_pendeta')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (pendeta) return { personId: pendeta.id, personType: 'PENDETA' };

    const { data: pelayan } = await this.supabase
      .from('t_pelayan')
      .select('id, jenis_pelayan')
      .eq('user_id', userId)
      .maybeSingle();
    if (pelayan) {
      const personType: PersonType =
        pelayan.jenis_pelayan === 'penatua' || pelayan.jenis_pelayan === 'diaken'
          ? 'PELAYAN_PRESBITER'
          : 'PELAYAN_PELAKSANA';
      return { personId: pelayan.id, personType };
    }

    const { data: relawan } = await this.supabase
      .from('t_relawan')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (relawan) return { personId: relawan.id, personType: 'RELAWAN' };

    return null;
  }

  private async resolveOrganizationalRoles(
    personId: string,
    activeContext: ActiveContextObject,
  ): Promise<ReadonlyArray<OrganizationalRole>> {
    const roles: OrganizationalRole[] = [];

    // Check t_pj_jemaat for KMJ/PJ designation.
    const { data: pjRows } = await this.supabase
      .from('t_pj_jemaat')
      .select('jenis_jabatan, id_jemaat, id_pos')
      .eq('id_pendeta', personId);

    if (pjRows) {
      for (const row of pjRows) {
        if (row.jenis_jabatan === 'KMJ' && row.id_jemaat === activeContext.contextId) {
          roles.push('KMJ');
        }
        if (row.jenis_jabatan === 'PJ') {
          if (row.id_jemaat === activeContext.contextId) {
            roles.push('PJ');
          }
          if (row.id_pos === activeContext.contextId) {
            roles.push('PJ_POS');
          }
        }
      }
    }

    // Check t_jabatan_struktural for structural positions.
    const { data: jabatanRows } = await this.supabase
      .from('t_jabatan_struktural')
      .select('nama_jabatan, id_jemaat, id_mupel')
      .eq('id_person', personId);

    if (jabatanRows) {
      for (const row of jabatanRows) {
        const jabatan = row.nama_jabatan?.toUpperCase() ?? '';

        if (row.id_jemaat === activeContext.contextId) {
          if (jabatan.includes('SEKRETARIS')) roles.push('SEKRETARIS_JEMAAT');
          if (jabatan.includes('BENDAHARA')) roles.push('BENDAHARA_JEMAAT');
        }

        if (row.id_mupel === activeContext.contextId) {
          if (jabatan.includes('KETUA') && jabatan.includes('BP')) {
            roles.push('KETUA_BP_MUPEL');
          } else {
            roles.push('ANGGOTA_BP_MUPEL');
          }
        }
      }
    }

    // Deduplicate
    return roles.filter((role, index, self) => self.indexOf(role) === index);
  }

  private async resolveAssignmentId(
    personId: string,
    activeContext: ActiveContextObject,
  ): Promise<string | null> {
    // Find the Assignment record that grants access to this context.
    // This is used for SA-08 traceability.

    // Check t_penugasan_pendeta
    const { data: penugasan } = await this.supabase
      .from('t_penugasan_pendeta')
      .select('id')
      .eq('id_pendeta', personId)
      .eq('id_pos', activeContext.contextId)
      .maybeSingle();
    if (penugasan) return penugasan.id;

    // Check t_pj_jemaat
    const { data: pj } = await this.supabase
      .from('t_pj_jemaat')
      .select('id')
      .eq('id_pendeta', personId)
      .or(`id_jemaat.eq.${activeContext.contextId},id_pos.eq.${activeContext.contextId}`)
      .maybeSingle();
    if (pj) return pj.id;

    // Check t_jabatan_struktural
    const { data: jabatan } = await this.supabase
      .from('t_jabatan_struktural')
      .select('id')
      .eq('id_person', personId)
      .or(`id_jemaat.eq.${activeContext.contextId},id_mupel.eq.${activeContext.contextId}`)
      .maybeSingle();
    if (jabatan) return jabatan.id;

    return null;
  }
}
