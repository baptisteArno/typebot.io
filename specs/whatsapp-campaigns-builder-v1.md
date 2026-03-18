# WhatsApp Campaigns In Builder — V1 Specification

## 1. Document
1. Status: Draft for implementation.
2. Scope: Builder app (`apps/builder`), campaigns package (`packages/campaigns`), contacts package (`packages/contacts`), workflows app (`apps/workflows`), Prisma PostgreSQL schema (`packages/prisma/postgresql/schema.prisma`).
3. Primary goal: Let a user create, send, monitor, and duplicate WhatsApp campaigns directly from the Builder Campaigns tab.

## 2. Product Decisions Locked
1. Audience scope: If typebot has `spaceId`, use contacts in that `spaceId`. If typebot has `spaceId = null`, use only workspace root contacts (`spaceId = null`), not contacts from spaces.
2. `Send now` must enqueue and start delivery immediately.
3. V1 actions are only `Save draft` and `Send now`.
4. Contact import conflict policy is upsert overwrite.
5. Missing required placeholder values skip recipient with warning.
6. Campaign details page must show warnings/errors and support CSV export of failed/skipped recipients with status and reason.
7. Templates are fetched live from selected WhatsApp credentials.
8. Template selection order is approved templates first, then non-approved templates.
9. Non-approved templates are selectable for draft, but `Send now` is disabled until approved.
10. Placeholder mapping supports both contact fields and static values.
11. Campaign details must show aggregate stats and recipient issues only.
12. Duplicate creates a new `DRAFT` campaign config without run history.
13. No campaign recipient cap for V1.
14. Retry policy: one automatic retry after short delay.
15. Segment creation/management is out of scope for this feature.
16. Import UI supports both manual identifier list and CSV import with header mapping/custom fields.
17. Manual import supports comma and newline separators.
18. In-batch duplicates resolve as last occurrence wins.
19. Provider support in V1 includes Meta and 360dialog.
20. Contact import execution is ephemeral (no persisted import job tables).

## 3. Goals
1. Full happy path from Campaigns tab to send and monitoring.
2. Robust handling for large campaigns (20k+ contacts).
3. Preserve campaign history and delivery-level observability.
4. Reuse existing Typebot WhatsApp credentials as default.
5. Keep import flow generic so it can ingest phone or email contacts.

## 4. Non-Goals
1. Segment creation/edition UX.
2. Scheduled send.
3. Multi-channel campaigns.
4. Advanced retry strategies beyond one short retry.

## 5. User Journey

## 5.1 Campaigns List Page
1. Route remains `/typebots/[typebotId]/campaigns`.
2. CTA `Create campaign` opens `/typebots/[typebotId]/campaigns/create`.
3. Each row shows at least campaign name, audience label, template label, latest run summary, and status.
4. Row click opens `/typebots/[typebotId]/campaigns/[campaignId]`.
5. Row action menu includes `Duplicate`.

## 5.2 Create Campaign Page
1. Route remains `/typebots/[typebotId]/campaigns/create`.
2. Form sections are:
3. Campaign details (`name`).
4. WhatsApp credentials (default to `typebot.whatsAppCredentialsId` when present).
5. Template picker (live list from provider; approved first).
6. Audience selector (`All contacts` or segment).
7. Placeholder mapping editor (contact field or static value per placeholder).
8. Impact summary panel.
9. Footer actions (`Save draft`, `Send now`).
10. `Send now` is disabled when template status is not approved.
11. `Send now` is disabled when required fields are invalid.
12. `Save draft` remains enabled for non-approved templates when base validation passes.

## 5.3 No Contacts Empty State On Create Page
1. If scoped audience has zero contacts, show an empty state on create page.
2. Empty state exposes `Import contacts`.
3. User can import and stay on the same create route.
4. After import success, contact counts and impact summary refresh automatically.

## 5.4 Import Contacts Dialog
1. Trigger source is create campaign page empty state or import button.
2. Dialog has two modes: `Manual` and `CSV`.
3. Dialog includes progress bar and read-only code editor logs during processing.

### 5.4.1 Manual Mode
1. Input is one textarea.
2. Separators accepted: comma and newline.
3. Token parsing trims spaces.
4. Token classification: email token or phone token.
5. Invalid token produces warning log and is skipped.
6. In-batch duplicate identifier uses last occurrence.
7. Upsert is done in current audience scope only.
8. Imported manual contacts contain identifier only (`email` or `phone`).

### 5.4.2 CSV Mode
1. User can download a CSV template.
2. User uploads CSV file.
3. User maps headers to contact fields.
4. User can add custom fields at mapping step.
5. Processing is asynchronous with progress + logs.
6. Upsert is done in current audience scope only.
7. In-batch duplicates resolve as last occurrence.
8. Rows with neither email nor phone are rejected with error logs.
9. Mapping conflicts are logged per row.

## 5.5 Save Draft
1. Creates campaign with status `DRAFT`.
2. Persists selected credentials, template snapshot, audience choice, and mapping.
3. Redirects to campaigns list.

## 5.6 Send Now
1. Creates campaign and immediately creates a run in queued state.
2. Enqueues workflow job immediately.
3. Redirects to campaigns list with new row and live status updates.

## 5.7 Campaign Details Page
1. Route `/typebots/[typebotId]/campaigns/[campaignId]`.
2. Shows campaign configuration snapshot.
3. Shows aggregate counters:
4. `targeted`.
5. `sent`.
6. `delivered`.
7. `read`.
8. `failed`.
9. `skipped`.
10. Shows issues table only (failed + skipped recipients).
11. Each issue row includes recipient identifier, status, reason, attempt count, and last update date.
12. Includes `Export issues CSV`.
13. Includes `Duplicate` action.
14. Includes `Send now` action when campaign is `DRAFT` and template is approved.

## 5.8 Duplicate Campaign
1. Duplicate copies immutable config snapshot fields.
2. Duplicate does not copy runs or recipient events.
3. New duplicated campaign status is `DRAFT`.
4. User is redirected to duplicated campaign details or create-edit state.

## 6. Data Model Changes (PostgreSQL)

## 6.1 Campaign Config Persistence
`WhatsAppCampaignConfig` currently stores only `templateId`. It must store full campaign send configuration snapshot.

Required fields:
1. `credentialsId String`.
2. `templateExternalId String`.
3. `templateName String`.
4. `templateLanguage String`.
5. `templatePlaceholdersMapping Json`.
6. Template status/category are fetched live when needed and are not persisted.

`templatePlaceholdersMapping` element shape:
1. `placeholderKey`.
2. `sourceType` (`CONTACT_FIELD` | `STATIC_VALUE`).
3. `contactFieldKey` nullable.
4. `staticValue` nullable.

## 6.2 Campaign Execution Tables
Add run-level and recipient-level persistence.

```prisma
model CampaignRun {
  id             String   @id @default(cuid())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @default(now()) @updatedAt
  startedAt      DateTime?
  finishedAt     DateTime?
  status         CampaignRunStatus
  trigger        CampaignRunTrigger
  targetedCount  Int      @default(0)
  sentCount      Int      @default(0)
  deliveredCount Int      @default(0)
  readCount      Int      @default(0)
  failedCount    Int      @default(0)
  skippedCount   Int      @default(0)

  campaignId String
  campaign   Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  recipients CampaignRecipient[]

  @@index([campaignId, createdAt(sort: Desc)])
  @@index([status])
}

model CampaignRecipient {
  id                String   @id @default(cuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @default(now()) @updatedAt
  status            CampaignRecipientStatus
  retryCount        Int      @default(0)
  providerMessageId String?
  providerStatus    String?
  issueLevel        CampaignIssueLevel?
  issueCode         String?
  issueMessage      String?
  phoneSnapshot     String?
  emailSnapshot     String?
  resolvedParams    Json?
  firstSentAt       DateTime?
  deliveredAt       DateTime?
  readAt            DateTime?
  failedAt          DateTime?
  lastAttemptAt     DateTime?

  runId     String
  run       CampaignRun @relation(fields: [runId], references: [id], onDelete: Cascade)
  contactId String
  contact   Contact     @relation(fields: [contactId], references: [id], onDelete: Restrict)

  @@unique([runId, contactId])
  @@index([runId, status])
  @@index([providerMessageId])
}
```

Enums:
1. `CampaignStatus`: `DRAFT`, `QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`.
2. `CampaignRunStatus`: `QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`.
3. `CampaignRunTrigger`: `SEND_NOW`.
4. `CampaignRecipientStatus`: `PENDING`, `SENT`, `DELIVERED`, `READ`, `FAILED`, `SKIPPED`.
5. `CampaignIssueLevel`: `WARNING`, `ERROR`.

## 7. Backend API Specification

## 7.1 Campaign ORPC Endpoints
1. `campaigns.list` extends payload with latest run summary and issue counters.
2. `campaigns.get` extends payload with config snapshot + aggregate stats.
3. `campaigns.createDraft` creates draft campaign.
4. `campaigns.sendNow` sends an existing draft campaign.
5. `campaigns.createAndSendNow` creates + immediately sends campaign.
6. `campaigns.duplicate` duplicates campaign into new `DRAFT`.
7. `campaigns.getImpactPreview` returns create-page impact summary.
8. `campaigns.listTemplates` fetches live templates from selected credentials.
9. `campaigns.listIssueRecipients` paginated failed/skipped recipients.
10. `campaigns.exportIssueRecipientsCsv` returns CSV file for failed/skipped recipients.

## 7.2 Contacts ORPC Endpoints
1. `contacts.import.manual` processes and upserts manual identifiers, streamed back as progress + logs.
2. `contacts.import.csv` processes and upserts uploaded CSV, streamed back as progress + logs.
3. `contacts.count` returns scoped contact count for create-page empty state and impact panel.

## 7.3 Workflows
1. Add `packages/campaigns/src/workflows/sendCampaignWorkflow.ts`.
2. Add `packages/campaigns/src/workflows/rpc.ts`.
3. Register campaign workflows in `apps/workflows/src/index.ts`.
4. Builder triggers workflow through campaign workflow RPC client.

## 8. Template Provider Integration
1. Introduce a provider adapter interface for template list and send response normalization.
2. Meta and 360dialog both supported in V1.
3. Adapter hides base URL and auth header differences.
4. Template list response is normalized to:
5. `externalId`.
6. `name`.
7. `language`.
8. `status`.
9. `placeholders`.
10. Create-page list sorting rule is approved statuses first.
11. Send validation checks current template approval state at send time.

## 9. Send Engine Behavior
1. `Send now` creates `CampaignRun` with `QUEUED`.
2. Workflow moves run to `RUNNING`.
3. Recipients are selected from audience scope and optional segment filter.
4. Recipients missing phone are `SKIPPED` with issue level `WARNING` and an issue code.
5. Placeholder resolution happens per recipient.
6. Recipients missing required mapped values are `SKIPPED` with issue level `WARNING` and an issue code.
7. Send is attempted once, then retried once after short delay on failure.
8. Suggested delay is 3-5 seconds with jitter.
9. If retry fails, recipient is `FAILED`.
10. If send succeeds, recipient is `SENT` and provider message id is stored.
11. Webhook status updates recipient to `DELIVERED`, `READ`, or `FAILED`.
12. Run counters are updated incrementally in DB.
13. Campaign status transitions:
14. `DRAFT` on draft creation.
15. `QUEUED` right after send action accepted.
16. `RUNNING` while workflow processes recipients.
17. `COMPLETED` when no `PENDING` recipients remain.
18. `FAILED` only for run-level fatal errors.

## 10. Impact Summary Rules (Create Page)
1. `targeted`: total recipients in selected audience/segment.
2. `noPhone`: targeted recipients without phone.
3. `missingMapping`: targeted recipients with phone but missing required mapped values.
4. `estimatedSendable`: targeted minus `noPhone` minus `missingMapping`.
5. `warningsEstimate`: `noPhone + missingMapping`.
6. Summary refreshes when audience, template, mapping, or credential changes.

## 11. Campaign Details Stats And Issues
1. Stat cards are run-based, shown for latest run by default.
2. Counters exposed: `targeted`, `sent`, `delivered`, `read`, `failed`, `skipped`.
3. Issues table includes only `FAILED` and `SKIPPED`.
4. CSV export includes:
5. `campaignId`.
6. `runId`.
7. `contactId`.
8. `email`.
9. `phone`.
10. `status`.
11. `issueCode`.
12. `issueMessage`.
13. `retryCount`.
14. `lastAttemptAt`.

## 12. Performance And Scale Requirements
1. Contact selection and recipient creation run in chunks.
2. Workflow must support 20k+ recipients without loading all rows in memory.
3. DB writes are batched where possible.
4. Sending concurrency is bounded and configurable.
5. Details page queries are paginated.
6. CSV export for issues is server-side streamed.

## 13. Authorization Rules
1. Campaign read/write authorization remains Typebot-based.
2. Contact import authorization remains workspace-based and must enforce current audience scope.
3. Template fetch and send must verify credentials belong to same workspace as typebot.

## 14. Frontend Implementation Notes
1. Rework `packages/campaigns/src/react/CreateWhatsAppCampaignForm.tsx` into multi-section campaign builder form.
2. Update `apps/builder/src/pages/typebots/[typebotId]/campaigns/create.tsx` to pass `spaceId` to segment/contact endpoints.
3. Add new page `apps/builder/src/pages/typebots/[typebotId]/campaigns/[campaignId].tsx`.
4. Remove or hide `Manage segments` button from create flow.
5. Add import dialog components under campaigns feature or contacts feature namespace.
6. Reuse existing `CodeEditor` component in read-only mode for import logs.

## 15. Telemetry And Logging
1. Track campaign creation mode (`draft`, `send_now`).
2. Track send start, run completion, and run fatal failure.
3. Track import start/completion/failure.
4. Include warning/error code distribution in logs for monitoring.

## 16. Test Plan
1. Unit tests for manual parser, CSV mapping parser, dedupe last-wins, and upsert selector.
2. Unit tests for placeholder resolver with static and contact sources.
3. Unit tests for one-retry send policy.
4. Integration tests for campaign lifecycle (`draft`, `send now`, status transitions).
5. Integration tests for issue CSV export.
6. Workflow tests for large batches with chunked processing.

## 17. Migration Plan
1. Add schema changes and run migration for PostgreSQL.
2. Backfill is unnecessary because campaign feature is not in production yet.
3. Update repositories and ORPC contracts.
4. Add workflows and register in workflows app.
5. Release UI changes behind existing `campaigns` feature flag if needed.

## 18. Acceptance Criteria
1. User can create draft campaign from Campaigns tab.
2. User can send campaign immediately from create or draft detail.
3. Non-approved template blocks send but allows draft save.
4. Audience scope follows typebot `spaceId` rule exactly.
5. If no contacts exist in scope, import CTA is available.
6. Manual and CSV import both work with progress and logs.
7. Import performs scoped upsert and honors last-wins dedupe.
8. Campaign list shows new campaign and status after create/send.
9. Campaign details shows required aggregate stats.
10. Campaign details lists warnings/errors only.
11. Campaign details can export failed/skipped recipients CSV.
12. User can duplicate campaign into a new draft.
13. System handles 20k+ recipients without timeouts or memory spikes.
