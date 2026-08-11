# External Webhook Reliability Contract v0.1 — F14 Gate 1 Specification

**Status:** 🔒 **GATE 1 LOCKED & APPROVED**  
**Target Subsystem:** External Integration & Webhook Reliability Engine (`/dashboard/developer/webhooks`)  
**Parent Standard:** `WORKSPACE_PATTERN_V1.1` & `ARCHITECTURE_COVERAGE_MATRIX_V1.8`

---

## 01. Core Architectural Invariant

> **Invariant:** *"External Webhook Reliability Subsystem is an Asynchronous Outbound Delivery Boundary consuming events from F11 Event Outbox, enforcing HMAC-SHA256 Payload Signing (X-GPIB-Signature), Idempotency, Bounded Exponential Backoff Retry, Failure Isolation, Dead-Letter Queue (DLQ), and Zero Secret Exposure, guaranteeing that external endpoint failures NEVER rollback original domain transactions."*

```text
F12 Authorization (PDP)
      │
      ▼
Domain Mutation (COMMITTED)
      │
      ├──────────────► F13 Immutable Audit Evidence (Commit Boundary)
      │
      ▼
F11 Transactional Event Outbox (Internal Source of Truth)
      │
      ▼
F14 Webhook Delivery Boundary (Asynchronous Outbound Layer)
      │
      ├──► HMAC-SHA256 Signature (X-GPIB-Signature)
      ├──► Idempotency Key (X-GPIB-Delivery-ID)
      ├──► Bounded Exponential Backoff Retry
      ├──► Timeout & Failure Isolation
      ├──► Dead-Letter Queue (DLQ)
      └──► Delivery Evidence & F13 Audit Logging
                │
                ▼
        External Endpoint (Third-Party System)
```

---

## 02. The 25 Invariants Contract Matrix

### 1. F11 Internal Event Source of Truth
F11 `sys_event_outbox` remains the sole internal event source of truth. F14 MUST NOT create a parallel event bus.

### 2. Outbound-Only Boundary
F14 is strictly an outbound event delivery layer. Inbound webhook handling is isolated from outbound delivery logic.

### 3. Zero Client-Supplied Delivery Authority
Target endpoint URLs, secret keys, retry parameters, and HTTP headers are resolved server-side.

### 4. Server-Derived Webhook Configuration
Webhook endpoints (`sys_webhook_endpoints`) are configured exclusively by authenticated server roles.

### 5. HMAC-SHA256 Payload Signing
Every outbound HTTP request contains header `X-GPIB-Signature: t={timestamp},v1={hmac_sha256_hash}` to guarantee authenticity.

### 6. Secret Never Exposed to Client/UI
Webhook signing secrets are encrypted at rest and MUST NEVER be exposed in client UI or ViewModel payloads.

### 7. Deterministic Canonical Webhook Payload
Payload serialization uses deterministic JSON key sorting to ensure consistent HMAC-SHA256 signature computation.

### 8. Per-Delivery Idempotency Key
Every delivery attempt carries a unique `X-GPIB-Delivery-ID` and idempotency key.

### 9. No Duplicate Delivery Ambiguity
Idempotency keys allow external endpoints to deduplicate retried delivery attempts safely.

### 10. Bounded Exponential Backoff
Retries execute according to bounded exponential backoff (`delay = 2^attempt * base_delay`) up to a max retry limit (e.g. 5 attempts).

### 11. Explicit Delivery Timeout
All HTTP requests enforce a strict connection and read timeout (e.g. 10,000 ms).

### 12. Failure Isolation Per Endpoint
A failing, unresponsive, or slow endpoint MUST NOT block deliveries to other endpoints or topics.

### 13. Dead-Letter Queue (DLQ) Exhaustion Isolation
Deliveries failing all retry attempts transition to `status = 'DLQ'` in `sys_webhook_deliveries`.

### 14. Authorized Explicit Replay
Replaying a DLQ delivery requires explicit F12 authorized admin approval (`DEVELOPER_ADMIN`).

### 15. DLQ Replay Identity Preservation
Replayed deliveries preserve the original `event_id` and payload identity.

### 16. Explicit Stream Ordering
Delivery sequence ordering is maintained per stream/topic according to sequence number.

### 17. Endpoint Configuration Versioning
Changes to endpoint URLs or subscribed events are version-stamped for auditability.

### 18. Secret Rotation Historical Continuity
Secret rotation invalidates old signatures for new requests while maintaining historical delivery evidence logs.

### 19. PII Minimization / Redaction
Outbound webhook payloads sanitize or redact sensitive PII data before delivery.

### 20. F13 Audit Logging for Admin Actions
Endpoint registrations, secret rotations, and DLQ replays generate immutable F13 audit evidence.

### 21. Observable Delivery Attempts
All attempts are logged in `sys_webhook_delivery_attempts` with HTTP status code, latency, and sanitized response snippet.

### 22. Webhook Engine Is Not Authorization Engine
F12 remains the sole source of truth for access control decisions.

### 23. Webhook Engine Does Not Mutate Domain State
Webhook delivery operations are read-only regarding domain entities.

### 24. Vendor-Neutral Transport Abstraction
Domain contracts use standard HTTP/JSON interfaces without coupling to specific cloud providers.

### 25. Asynchronous Isolation Invariant (CRITICAL)
External endpoint failures, timeouts, or HTTP 5xx errors MUST NEVER rollback the original committed domain mutation transaction.

---

## 03. Gate 1 Verdict & Decision Matrix

```text
F14 Gate 1 Summary:
│
├── F11 Internal Event Source & Outbound-Only Boundary                  🔒 LOCKED
├── Server-Derived Webhook Identity & HMAC-SHA256 Payload Signing        🔒 LOCKED
├── Zero Secret Leakage & Deterministic Canonical Payload               🔒 LOCKED
├── Per-Delivery Idempotency & Bounded Exponential Backoff Retry        🔒 LOCKED
├── Failure Isolation & Dead-Letter Queue (DLQ) Storage                 🔒 LOCKED
├── Authorized DLQ Replay & F13 Audit Logging for Admin Actions         🔒 LOCKED
├── Asynchronous Isolation: External Failure Never Rolls Back Mutation  🔒 LOCKED
├── WORKSPACE_PATTERN_V1.1 100% Unchanged Certification                 🔒 LOCKED
─────────────────────────────────────────────────────────────────────────────
F14 Gate 1 Status                                                      🟢 APPROVED FOR GATE 2
```
