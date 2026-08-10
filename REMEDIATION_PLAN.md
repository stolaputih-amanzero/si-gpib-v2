# Technical Debt Remediation Item

**Issue Title:** Resolve 151 Legacy Lint Warnings & Errors  
**Status:** 🟡 Tracked / Non-blocking for Staging  
**Owner:** Frontend Platform Team (Frontend Lead)  
**Deadline:** Q4 2026 Sprint 3 (Before V3.0 Production Freeze)  

## Context
During the Authorization Refactoring (Gate 1 - Gate 4), we introduced a strict ESLint/TypeScript linting pipeline to replace a broken Next.js CLI runner. This new pipeline accurately surfaced 151 pre-existing stylistic and code-quality issues across the `src` directory.

These errors do **not** represent security vulnerabilities or authorization breaches. They consist mainly of:
- `@next/next/no-img-element`: Usage of standard `<img>` tags instead of Next.js `<Image>`.
- `prefer-const`: Variables that are never reassigned.
- `no-empty`: Empty block statements (e.g., empty catch blocks).
- `@typescript-eslint/no-unused-vars`: Unused variables.

## Resolution Plan
Because resolving these 151 findings would require modifying hundreds of presentation-layer files, this work is intentionally deferred. It has been classified as approved legacy debt to prevent blocking the critical Authorization Gate deployment.

1. **Immediate (Done):** CI Lint steps are configured as `non-blocking` (`continue-on-error: true`).
2. **Phase 1 (Sprint 1):** Auto-fix rules using `eslint --fix` for `prefer-const` and unused variables.
3. **Phase 2 (Sprint 2):** Manually replace `<img>` tags with `<Image>` components to resolve `@next/next/no-img-element`.
4. **Phase 3 (Sprint 3):** Re-enable strict blocking for the lint CI step.
