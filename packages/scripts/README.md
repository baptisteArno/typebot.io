# Operational scripts

Run scripts through Nx from the repository root. Nx is the environment selector: production targets use the `production` configuration and load `packages/scripts/.env.production` before any Typebot modules are imported. This keeps the database and S3 configuration from the same environment file.

```sh
bunx nx run @typebot.io/scripts:inspectUser -- --email=user@example.com
bunx nx run @typebot.io/scripts:destroyUser -- --email=user@example.com --confirm
```

Do not run `tsx packages/scripts/src/...` or `bun run` from the package directly for production operations. Production database commands also generate the MySQL Prisma client before executing.

## Interactive and non-interactive use

Every value requested interactively has an equivalent long option. Both `--name=value` and `--name value` are accepted. When stdin/stdout are TTYs, an omitted value opens the usual prompt. Off-TTY or when `CI=1`, an omitted required value exits non-zero with the flag that is required; scripts never wait for input. Agents running inside a pseudo-TTY can force this behavior with `--non-interactive`.

Destructive operations require an explicit confirmation. Humans can approve the prompt. Agents and CI must pass `--confirm`; `--no-confirm` explicitly aborts. A script may inspect and print the affected records before checking confirmation, but it must not mutate anything before that check.

Frequently used inputs:

| Target | Non-interactive options |
| --- | --- |
| `inspectUser` | exactly one of `--id`, `--email`; optional `--compute-results` |
| `inspectTypebot` | exactly one of `--id`, `--public-id`, `--custom-domain` |
| `inspectPublishedTypebot` | exactly one of `--id`, `--public-id` |
| `inspectWorkspace` | `--workspace-id` |
| `inspectChatSession` / `deleteChatSession` | `--session-id` (deletion also needs `--confirm`) |
| `inspectResult` | `--result-id` |
| `inspectCredentials` | `--credentials-id` |
| `getCoupon` / `redeemCoupon` | `--code` (redemption also needs `--confirm`) |
| `getUsage` | `--workspace-id`, `--from`, `--to` |
| `searchResult` | `--typebot-id`, `--variable-id`, `--variable-name`, `--variable-value` |
| `exportResults` | `--typebot-id` |
| `generateWorkspaceSummary` | `--workspace-id` |
| `blockTypebot` | `--typebot-id --confirm` |
| `suspendWorkspace` | exactly one of `--workspace-id`, `--typebot-id`, `--public-id`; plus `--confirm` |
| `destroyUser` | `--email --confirm` |
| `updateTypebot` | `--typebot-id --confirm` |
| `updateWorkspace` | `--workspace-id --confirm` |
| `updateUserEmail` | `--current-email`, `--new-email`, `--confirm` |
| `updateWhatsAppStatusForwardUrl` | `--typebot-id`, `--url`, `--confirm` |
| `insertUsersInBrevoList` | `--list-id --confirm` |
| `deleteResultsRange` | `--typebot-id`, `--from`, `--to`, `--confirm` |
| `deleteS3Object` | `--key --confirm` |
| `addHttpProxyCredentials` | `--url`, `--name`, `--workspace-id`, `--confirm` |
| `readCsvAndDoSomething` | `--csv-path --confirm` |
| `sendEmailCampaign` | `--csv-path` or `CAMPAIGN_CSV_PATH` |

`db:bulkUpdate`, `createChatsPrices`, `migrateSubscriptionItemPriceId`, and `migrateSubscriptionsToUsageBased` do not need record identifiers, but they do require `--confirm`. `sendEmailCampaign` remains a dry run unless `SEND_EMAILS=true`.

Database backup and restore can select `local`, `staging`, or `production` explicitly with an Nx configuration:

```sh
bunx nx run @typebot.io/scripts:db:backup:local
bunx nx run @typebot.io/scripts:db:restore:staging -- --confirm
```

With no Nx configuration, those two commands prompt on a TTY. A non-interactive direct invocation must pass `--environment=local|staging|production`. Restore always retains its separate confirmation gate.

## Verification

The executable contract check verifies target/source coverage, Nx production configuration, centralized prompting, destructive confirmation gates, CLI parsing, and a mocked `destroyUser` workflow. It does not load production environment files or connect to production services.

```sh
bunx nx run @typebot.io/scripts:verify:cli
```
