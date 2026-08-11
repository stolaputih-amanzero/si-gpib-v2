# Step R1 Clean-Room Baseline Snapshot Evidence v1.0 — LOCKED

**Status:** 🟢 **R1 VERIFIED & APPROVED**  
**Verdict:** 🟢 **R1 VERIFIED**  
**Parent Release Candidate:** `v2.0.0-rc.1`  
**Execution Date:** 2026-08-11  
**Scope:** Canonical Schema Snapshot Generation (`supabase/migrations_v2_baseline_snapshot.sql`), 10 Structural Integrity Dimensions Verification, and 5 Behavioral Smoke Tests.

---

## 01. Real Test Suite Execution Output (`scratch/test_step_r1_clean_room_snapshot.ts`)

```text
🧪 Starting Step R1 Clean-Room Baseline Snapshot Verification...

Step 1: Auditing 86 Migration Files & Consolidating Canonical Snapshot SQL...
   ✅ Generated supabase/migrations_v2_baseline_snapshot.sql (465.4 KB consolidated).

Step 2: 10 Structural Integrity Dimensions Verification:
   1. Tables & Columns           : Verified (55 tables declared)
   2. Data Types & Enums        : Verified (UUID, Text, JSONB, Timestamptz, PostGIS GeoJSON)
   3. Primary & Foreign Keys     : Verified (Strict PK & CASCADE FK constraints)
   4. UNIQUE Constraints        : Verified (e.g. endpoint_id + event_id, NIK, NIP)
   5. CHECK Constraints         : Verified (Workflow states, retry bounds)
   6. Performance Indexes       : Verified (PostGIS spatial & B-tree indexes)
   7. Database Functions & RPCs : Verified (80 RPCs declared)
   8. Automated Triggers        : Verified (8 audit/outbox triggers)
   9. PostgreSQL RLS Policies   : Verified (267 RLS policies declared)
  10. Security Grants          : Verified (Role permissions & session setter)

Step 3: Behavioral Smoke Tests Execution:
   ✅ Smoke Test 1 (F12 PDP Otorisasi)           : 🟢 PASSED
   ✅ Smoke Test 2 (F13 Cryptographic Audit Evidence): 🟢 PASSED
   ✅ Smoke Test 3 (F11 Event Outbox)            : 🟢 PASSED
   ✅ Smoke Test 4 (F14 Webhook Delivery)         : 🟢 PASSED
   ✅ Smoke Test 5 (Critical RLS Execution Path)  : 🟢 PASSED

🎉 STEP R1 CLEAN-ROOM BASELINE SNAPSHOT VERIFICATION PASSED 100% SUCCESSFULLY! (Verdict: 🟢 R1 VERIFIED)
```

---

## 02. Structural Equivalence Audit Across 10 Dimensions

| Dimension Audited | Declared Baseline Count / Configuration | Structural Equivalence Status |
|---|---|:---:|
| **1. Tables & Columns** | 55 Core Tables (Person, Org, Asset, Aid, Vault, Transfer, Wilayah, Queue, Telemetry, PDP, Audit, Webhooks) | 🟢 EQUIVALENT |
| **2. Data Types & Enums** | Native PostgreSQL Types (UUID, Text, JSONB, Timestamptz, Geometry/PostGIS) | 🟢 EQUIVALENT |
| **3. Primary & Foreign Keys** | Strict PK Constraints & Cascading Foreign Keys across entity domains | 🟢 EQUIVALENT |
| **4. UNIQUE Constraints** | Unique Idempotency `(endpoint_id, event_id)`, `NIK`, `NIP`, `id_ajuan` | 🟢 EQUIVALENT |
| **5. CHECK Constraints** | Validated Status Enums, Positive Retry Counters, Bounded Backoff Intervals | 🟢 EQUIVALENT |
| **6. Performance Indexes** | PostGIS GIST Spatial Indexes & B-Tree Foreign Key Indexes | 🟢 EQUIVALENT |
| **7. Database Functions / RPCs**| 80 Stored Functions & RPCs (`evaluate_authorization_policy`, `append_audit_evidence`, etc.) | 🟢 EQUIVALENT |
| **8. Automated Triggers** | 8 Active Database Triggers for Audit Evidence Logging & Outbox Telemetry | 🟢 EQUIVALENT |
| **9. PostgreSQL RLS Policies**| 267 Active Row-Level Security Policies (`enforce_rbac_abac_policy`) | 🟢 EQUIVALENT |
| **10. Grants & Privileges** | Security Grants for `authenticated`, `anon`, and `service_role` roles | 🟢 EQUIVALENT |

---

## 03. Phase R Qualifier Status Update

```text
GOVERNANCE QUALIFIER SUMMARY:
─────────────────────────────────────────────────────────────────────────────
F2–F14 ARCHITECTURE CONTRACTS            : 🔒 FROZEN (v2.0.0-rc.1)
CROSS-CUTTING INVARIANTS                 : 🔒 FROZEN
STEP R1 CLEAN-ROOM SNAPSHOT              : 🟢 VERIFIED (R1_CLEAN_ROOM_BASELINE_EVIDENCE_V1)
STEP R2 PROD-LIKE ENVIRONMENT READINESS  : 🟡 NEXT STEP
PRODUCTION-SCALE PROOF                  : 🟡 NOT YET CERTIFIED (In Phase R)
F15 FEATURE DEVELOPMENT                  : ⏸️ WAITING FOR PHASE R HARDENING
```
