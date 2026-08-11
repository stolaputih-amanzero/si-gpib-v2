# F6 Architecture Gap Analysis & Candidate Evaluation v1.0

**Status:** 🔒 **LOCKED ARCHITECTURE DECISION ARTIFACT**  
**Parent Standard:** `WORKSPACE_PATTERN_V1.1` & `ARCHITECTURE_COVERAGE_MATRIX_V1.0`  
**Goal:** Evaluate unvalidated platform architectural surfaces to select **Reference Implementation #5 (F6)** via empirical scoring.

---

## 01. The 5 Evaluation Criteria Standard

To maintain strict engineering governance, candidates for F6 are scored across 5 criteria (scale 1.0 – 10.0):

1. **Novelty (Weight: 25%):** Tests an architectural surface NOT yet validated by F2, F3, F4, or F5.
2. **Cross-Cutting Impact (Weight: 25%):** Touches multiple platform layers (Database, Service, ACL, ViewModel, PWA Storage, UI).
3. **Pattern Stress Potential (Weight: 20%):** Ability to test boundaries and potential failure modes of `WORKSPACE_PATTERN_V1.1`.
4. **Generalizability (Weight: 15%):** Extracted patterns can be reused across 5+ domain entities in SI GPIB.
5. **Production Value (Weight: 15%):** High operational impact for church administrators and field ministers.

---

## 02. Candidate Evaluation Matrix

```text
                               F6 CANDIDATE SCORES
                                        │
    ┌──────────────────┬────────────────┼──────────────────┬──────────────────┐
    ▼                  ▼                ▼                  ▼                  ▼
Candidate A        Candidate B      Candidate C        Candidate D        Candidate E
Pastoral Transfer  Doc Vault &      Offline Queue      Geospatial Map     Bulk Batch
& Relocation       File Lifecycle   Sync & Conflict    Boundary           Mutation
Score: 9.35        Score: 8.85      Score: 9.60        Score: 8.40        Score: 8.10
```

### Detailed Evaluation Table:

| Candidate ID | Domain Candidate | Novelty (25%) | Impact (25%) | Stress (20%) | General (15%) | Production (15%) | Weighted Score | Rank |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Candidate C** | **Offline Queue Sync & Conflict Resolution** | 10.0 | 9.5 | 10.0 | 9.0 | 9.0 | **9.60 / 10** | 🥇 **SELECTED** |
| **Candidate A** | **Pastoral Transfer & Relocation State Engine** | 9.0 | 9.5 | 9.0 | 10.0 | 9.5 | **9.35 / 10** | 🥈 **RUNNER-UP** |
| **Candidate B** | **Document Vault & File Attachment Lifecycle** | 8.5 | 9.0 | 8.5 | 9.5 | 9.0 | **8.85 / 10** | 🥉 |
| **Candidate D** | **Interactive Geospatial & Map Boundary** | 8.5 | 8.0 | 8.5 | 8.5 | 8.5 | **8.40 / 10** | 4th |
| **Candidate E** | **Bulk Batch Transaction & Data Import** | 7.5 | 8.5 | 8.0 | 8.5 | 8.5 | **8.10 / 10** | 5th |

---

## 03. Selected F6 Architectural Surface Rationale

### 🏆 Winner: Candidate C — Offline Queue Sync & Conflict Resolution (`/dashboard/offline-sync`)

#### Why Candidate C won:
1. **Fills Critical PWA Architectural Gap:** F2–F5 proved online query/command separation and server-side RPC atomic execution. However, church workers in remote Pos Pelkes operate in low-connectivity PWA environments.
2. **Stress-Tests Client-Side Command Infrastructure:** Evaluates local IndexedDB command queueing, idempotent retry handling (`p_request_id`), conflict resolution when server state mutates during offline period, and UI queue status feedback.
3. **Preserves `WORKSPACE_PATTERN_V1.1`:** Verifies if offline queueing can sit cleanly beneath `transition_*_atomic` without altering the locked `WORKSPACE_PATTERN_V1.1` baseline.

---

## 04. Execution Roadmap for F6

```text
F6_ARCHITECTURE_GAP_ANALYSIS_V1.md          🔒 LOCKED & SELECTED (Candidate C)
                        │
                        ▼
F6 Gate 1: Offline Queue & Sync Contract   👈 NEXT
                        │
                        ▼
F6 Gate 2: Queue Payload & Conflict Types
                        │
                        ▼
F6 Gate 3: Local Storage & Sync Engine RPC
                        │
                        ▼
F6 Gate 4: Offline ViewModel ACL Adapter
                        │
                        ▼
F6 Gate 5: Offline Sync UX & Queue Panel
                        │
                        ▼
F6 Gate 6: Production Acceptance & Regression Gate
```
