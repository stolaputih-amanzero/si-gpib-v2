# Webhook Workspace UX / IA Contract v0.1 — LOCKED

**Status:** 🔒 **LOCKED & APPROVED FOR GATE 5**  
**Target Route:** `/dashboard/developer/webhooks`  
**Reference Standard:** `WORKSPACE_PATTERN_V1.1` & `ARCHITECTURE_COVERAGE_MATRIX_V1.8`

---

## 01. Core UX Invariant Statement

> **Invariant:** *"UI IS NOT DELIVERY EXECUTOR, UI IS NOT AUTHORIZATION ENFORCER, & SECRET IS NEVER VISUALIZED."*

The Webhook Workspace UI is a delivery health inspection and action intent surface. The UI MUST NOT render raw webhook signing secrets (`secret_key`), calculate retry backoff timers directly, or execute DLQ replays without F12 server authorization evaluation.

---

## 02. Delivery Lifecycle Visual Indicators

1. **`DELIVERED` (Terkirim):** Emerald green badge indicator (`200 OK`, `201 Created`).
2. **`FAILED_RETRYING` (Percobaan Ulang):** Amber warning indicator with backoff schedule timestamp.
3. **`DLQ` (Dead-Letter Queue):** Rose red pulsing alert indicator. Failed all retries; requires authorized DLQ replay intent.
4. **`QUEUED` / `DELIVERING`:** Blue / Purple status badge.

---

## 03. Responsive Layout & Component Architecture

- **Mobile View (PWA Single Column):**
  1. Webhook Engine Header Banner & Overall Health (`WebhookHeader.tsx`)
  2. Webhook Reliability Metrics Grid (`WebhookMetricsGrid.tsx`)
  3. Registered Endpoints Panel (`WebhookEndpointPanel.tsx`)
  4. Outbound Delivery Stream Cards (`WebhookDeliveryStreamPanel.tsx`)
  5. DLQ Failure Inspection Modal (`WebhookDLQInspectionModal.tsx`)

- **Desktop View (Grid Layout):**
  - Top: Webhook Header, Health Badge, & Metric Cards.
  - Left: Registered Webhook Endpoints & Masked Secrets (`••••••••••••`).
  - Right: Chronological Outbound Delivery Stream, Attempt Logs & DLQ Replay Inspection Modal.

---

## 04. Component Tree Specification (Gate 5)

```text
src/
├── components/
│   └── developer/
│       └── webhooks/
│           ├── WebhookHeader.tsx                 (Header Banner & Health Status)
│           ├── WebhookMetricsGrid.tsx            (Reliability Metrics Grid)
│           ├── WebhookEndpointPanel.tsx          (Registered Endpoints & Masked Secret)
│           ├── WebhookDeliveryStreamPanel.tsx    (Delivery Stream Cards & Attempt Logs)
│           ├── WebhookDLQInspectionModal.tsx     (DLQ Inspection & Replay Action Modal)
│           └── WebhookWorkspaceShell.tsx         (Master Layout & Delivery Shell)
└── app/
    └── (dashboard)/
        └── developer/
            └── webhooks/
                └── page.tsx                      (Next.js Page Route)
```
