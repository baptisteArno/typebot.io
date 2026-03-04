# WhatsApp Campaigns End-to-End Design

Date: 2026-03-04  
Status: Approved  
Scope: Manual send now only (v1)

## Goal

Build an end-to-end WhatsApp campaigns feature that lets a user:

- define a reusable campaign in Builder,
- send it immediately,
- target either a segment or all eligible contacts,
- track run progress and per-recipient outcomes,
- cancel an in-flight run.

## Decisions (Validated)

- Delivery trigger: manual send now only.
- Audience selection: segment or all contacts.
- Missing/invalid phone behavior: skip recipient and continue.
- Message type: WhatsApp template message only.
- Tracking level: campaign run aggregates plus per-recipient outcomes/errors.
- Scale target: 10,000+ recipients per run.
- Cancellation: supported while running (cooperative stop between batches).
- Reusability: campaigns are multi-run (same campaign can be sent multiple times).
- Data model simplification: no `audienceType`; infer target mode from `recipientSegmentId`.
- Scope rule for all contacts:
  - if campaign typebot has `spaceId`, target contacts in same `workspaceId` and same `spaceId`;
  - if campaign typebot has no `spaceId`, target all contacts in the workspace.

## Existing Context

- Campaign/contacts/segments schema exists but is not deployed in production yet, so schema can be reshaped safely.
- Current campaign implementation is scaffolded (`packages/campaigns`) but does not execute sends end-to-end.
- Existing workflow infrastructure already runs durable jobs through `apps/workflows` using Effect Workflow + RPC.

## Recommended Approach

Use a DB-backed campaign runner with Effect workflows:

- Keep `Campaign` as reusable definition.
- Create a new immutable `CampaignRun` on each "Send now".
- Process recipients in batches in a workflow, with cooperative cancellation and retry policy.
- Persist per-recipient attempt outcomes in a dedicated run-recipient table.

This approach best matches reliability needs for 10k+ runs and existing architecture patterns.

## Architecture

### 1) Definition Layer

`Campaign` + `WhatsAppCampaignConfig` represent editable configuration:

- campaign identity and ownership (`typebotId`),
- target selection (`recipientSegmentId` nullable),
- WhatsApp config (`credentialsId`, `templateId`, template variable mapping).

### 2) Execution Layer

Each send creates a `CampaignRun`:

- immutable snapshot of resolved campaign config at launch time,
- execution status and timestamps,
- aggregate counters (`sent`, `skipped`, `failed`, `processed`, `total`),
- cancel request marker.

Each recipient in that run gets a `CampaignRecipientRun` row:

- recipient identity (`contactId`, resolved phone),
- terminal outcome (`SENT`, `SKIPPED`, `FAILED`),
- reason/error metadata.

## Data Model Changes (Prisma)

### Update `Campaign`

- Keep `recipientSegmentId` nullable and use it as audience switch:
  - `null` => all contacts,
  - non-null => segment contacts.
- Keep definition-centric state only on campaign record.

### Update `WhatsAppCampaignConfig`

- Add `credentialsId` (FK to `Credentials`).
- Keep `templateId`.
- Add `templateVariableMapping Json`.

Suggested mapping shape:

```json
{
  "1": { "kind": "contactField", "field": "firstName" },
  "2": { "kind": "contactProperty", "key": "plan" },
  "3": { "kind": "static", "value": "https://example.com" }
}
```

### Add `CampaignRun`

Fields:

- `id`, `campaignId`, `typebotId`, `workspaceId`, `spaceId` (nullable),
- `triggeredByUserId`,
- `status` (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELED`),
- `snapshot Json`,
- `totalRecipients`, `processedCount`, `sentCount`, `skippedCount`, `failedCount`,
- `cancelRequestedAt`, `startedAt`, `finishedAt`, timestamps.

Indexes:

- `(campaignId, createdAt desc)`,
- `(status, createdAt desc)`.

### Add `CampaignRecipientRun`

Fields:

- `id`, `campaignRunId`, `contactId`, `phone`,
- `status` (`SENT`, `SKIPPED`, `FAILED`),
- `skipReason` (nullable),
- `providerMessageId` (nullable),
- `errorCode` (nullable), `errorMessage` (nullable),
- `attemptedAt`.

Constraints:

- unique `(campaignRunId, contactId)` for idempotent retry safety.

## API Surface

### Campaign definition APIs (`packages/campaigns/src/orpc`)

- keep and complete `create/get/list/update/delete`.
- ensure create/update persist full WhatsApp campaign config.

### New execution APIs

- `sendNow({ typebotId, campaignId })`
  - validates campaign and credentials ownership,
  - computes target recipients and `totalRecipients`,
  - creates `CampaignRun`,
  - triggers workflow RPC with `runId`.
- `cancelRun({ typebotId, campaignRunId })`
  - marks cancellation requested.
- `listRuns({ typebotId, campaignId, ...pagination })`.
- `getRun({ typebotId, campaignRunId })`.
- `listRunRecipients({ typebotId, campaignRunId, ...filters })`.

## Recipient Resolution Rules

### Segment campaign (`recipientSegmentId != null`)

- target contacts in that segment.

### All-contacts campaign (`recipientSegmentId == null`)

- load `typebot.spaceId`:
  - with `spaceId`: contacts where `workspaceId == typebot.workspaceId` and `spaceId == typebot.spaceId`;
  - without `spaceId`: contacts where `workspaceId == typebot.workspaceId` (workspace-wide).

## Workflow Execution

Workflow: `ExecuteWhatsAppCampaignRun`

1. mark run `RUNNING`, set `startedAt`.
2. iterate recipients in deterministic batches.
3. for each recipient:
   - resolve/validate phone (E.164 normalization where possible),
   - build template payload from mapping (static + contact fields/properties),
   - send through WhatsApp sender module,
   - persist `CampaignRecipientRun`.
4. after each batch:
   - update run counters,
   - check cancellation marker and stop if requested.
5. finalize run status and `finishedAt`.

## Error Handling

### Preflight (before run)

- invalid or incomplete campaign config => reject `sendNow`.

### Recipient-level failures

- missing/invalid phone => `SKIPPED`.
- provider/transport issue => `FAILED`.

### Run-level status

- `COMPLETED` when processing loop finishes, even with some skipped/failed recipients.
- `FAILED` only for systemic run failure.
- `CANCELED` when cancellation requested and loop exits cleanly.

## Idempotency, Retry, and Cancellation

- workflow idempotency key: `campaignRunId`.
- uniqueness `(campaignRunId, contactId)` prevents duplicate sends on retries.
- retry transient send errors with bounded policy; do not retry permanent validation failures.
- cancellation is cooperative and checked between batches.

## Builder UX (v1)

- Campaign list page: show recent run summary.
- Campaign details page:
  - editable definition,
  - "Send now",
  - active run progress state,
  - "Cancel run" while running,
  - recipients result table with filters (`SENT`, `SKIPPED`, `FAILED`).

## Testing Plan

- Unit tests:
  - recipient scope resolution (segment/all contacts with space-aware logic),
  - template mapping resolution,
  - status transitions and counter aggregation,
  - cancellation checkpoint behavior.
- Integration tests:
  - run creation + workflow trigger,
  - multi-batch processing,
  - cancellation mid-run,
  - idempotent retry behavior.
- API tests:
  - authorization and validation for run APIs.

## Rollout

- release behind campaigns capability flag.
- start with conservative batch size/concurrency defaults.
- instrument logs and traces by `campaignRunId`.
- monitor failed/skipped rates and adjust batching/retry limits.

## Out of Scope (v1)

- scheduled sends,
- recurring campaigns,
- non-template outbound WhatsApp messages,
- advanced throughput shaping by provider tier.
