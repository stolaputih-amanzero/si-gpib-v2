# F7 Architecture Gap Analysis & Candidate Evaluation v1.0

**Status:** 🔒 **LOCKED ARCHITECTURE DECISION ARTIFACT**  
**Parent Standard:** `WORKSPACE_PATTERN_V1.1` & `ARCHITECTURE_COVERAGE_MATRIX_V1.1`  
**Goal:** Evaluate unvalidated platform architectural surfaces to select **Reference Implementation #6 (F7)** via empirical 5-criteria scoring.

---

## 01. Standard 5 Evaluation Criteria Matrix

Each candidate is evaluated against the 5 established engineering criteria (scale 1.0 – 10.0):

1. **Novelty (25% Weight):** Tests an architectural surface NOT yet validated by F2, F3, F4, F5, or F6.
2. **Cross-Cutting Impact (25% Weight):** Touches multiple platform layers (Storage, Database RLS, Service, ACL Adapter, ViewModel, PWA, UI).
3. **Pattern Stress Potential (20% Weight):** Ability to test boundaries and potential failure modes of `WORKSPACE_PATTERN_V1.1`.
4. **Generalizability (15% Weight):** Reusability of extracted patterns across 5+ domain entities.
5. **Production Value (15% Weight):** High operational impact for church administration.

---

## 02. Candidate Evaluation Matrix

```text
                               F7 CANDIDATE SCORES
                                        │
    ┌──────────────────┬────────────────┼──────────────────┬──────────────────┐
    ▼                  ▼                ▼                  ▼                  ▼
Candidate A        Candidate B      Candidate C        Candidate D        Candidate E
Pastoral Transfer  Doc Vault &      Geospatial Map     Bulk Batch         Event Stream
& Relocation       File Lifecycle   Boundary           Mutation           Notifications
Score: 9.35        Score: 9.65      Score: 8.70        Score: 8.20        Score: 7.90
```

### Detailed Evaluation Table:

| Candidate ID | Domain Candidate | Novelty (25%) | Impact (25%) | Stress (20%) | General (15%) | Production (15%) | Weighted Score | Rank / Result |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Candidate B** | **Document Vault & File Storage Lifecycle** | 10.0 | 9.5 | 9.5 | 10.0 | 9.5 | **9.65 / 10** | 🥇 **SELECTED FOR F7** |
| **Candidate A** | **Pastoral Transfer & Relocation State Engine** | 9.0 | 9.5 | 9.0 | 10.0 | 9.5 | **9.35 / 10** | 🥈 RUNNER-UP |
| **Candidate C** | **Interactive Geospatial & Map Boundary** | 9.0 | 8.5 | 8.5 | 8.5 | 9.0 | **8.70 / 10** | 🥉 3rd |
| **Candidate D** | **Bulk Batch Transaction & Data Import** | 7.5 | 8.5 | 8.5 | 8.5 | 8.5 | **8.20 / 10** | 4th |
| **Candidate E** | **Event Stream & Notification Queue** | 7.5 | 8.0 | 8.0 | 8.0 | 8.5 | **7.90 / 10** | 5th |

---

## 03. Selected F7 Architectural Surface Rationale

### 🏆 Winner: Candidate B — Document Vault & File Storage Object Lifecycle (`/dashboard/vault`)

#### Why Candidate B won:
1. **Fills Unvalidated Binary & Object Storage Gap:** F2–F6 validated relational PostgreSQL queries, RPC commands, state machines, and PWA transport resilience. However, handling binary files, certificates, asset legal titles, official letters (`surat_keputusan`), Supabase Storage Bucket RLS, signed URLs, and file attachment lifecycles is **completely unvalidated**.
2. **Cross-Cutting Impact Across All Entities:** Document attachment is required by Person (ID certificates), Organization (decrees), Asset (legal titles/land deeds), and Aid Requests (proposals/receipts).
3. **Tests Object Storage Security Boundary:** Tests Supabase Storage Bucket RLS security policies combined with PostgreSQL ACL ViewModels.
4. **Preserves `WORKSPACE_PATTERN_V1.1`:** Evaluates whether file attachment lifecycles can operate beneath the standard ACL Adapter without breaking `WORKSPACE_PATTERN_V1.1`.

---

## 04. Execution Roadmap for F7

```text
F7_ARCHITECTURE_GAP_ANALYSIS_V1.md              🔒 LOCKED & SELECTED (Candidate B)
                        │
                        ▼
F7 Gate 1: Document Vault & Storage Object Contract  👈 NEXT
                        │
                        ▼
F7 Gate 2: Storage Data Contract & Attachment Types
                        │
                        ▼
F7 Gate 3: Supabase Storage RLS & Attachment RPC
                        │
                        ▼
F7 Gate 4: Document Vault ViewModel ACL Adapter
                        │
                        ▼
F7 Gate 5: Document Vault UX Contract & Panel UI
                        │
                        ▼
F7 Gate 6: Production Acceptance & Regression Gate
```
