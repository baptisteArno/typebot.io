# WhatsApp session access regression

Public continueChat, clientLogs v1/v2, legacy sendMessage v1/v2 and the shared
streaming handler reject persisted `state.whatsApp` sessions as not found, before
engine, session store, log or provider side effects. The guard also covers builder
continuation/streaming callers. No public input can opt out.

This deliberately leaves `getSession`, internal WhatsApp resume and authorized
webhook paths unchanged. Existing WhatsApp sessions are protected without an ID
migration. The test phoneNumberId is synthetic Meta metadata, distinct from the
contact phone number; this fix does not assume it is a public telephone number.

Run from this worktree:

```sh
bunx nx test-whatsapp-session-access
bunx nx test @typebot.io/bot-engine
bunx nx typecheck @typebot.io/bot-engine --skipNxCache
bunx nx format-and-lint
bunx nx preview-whatsapp-session-access
```

The loopback review harness is http://127.0.0.1:5216. POST `/run` to rerun the
regressions and receive their output. It executes this worktree's actual handlers
with synthetic storage, engine and provider adapters. It is a test harness, not a
full builder/viewer deployment. No production identities, database or tokens are
used. The test target runs in its own process so Bun module mocks do not leak
into other suites. It reuses bot-engine's existing isolated-vm test preload.

Coverage includes refusal with missing, allowed and disallowed Origin, legacy
startParams alongside an existing session, random WhatsApp IDs, no side effects,
web and web-preview continuation/streaming, web client logs, the existing origin
restriction, missing sessions, internal WhatsApp resume (ordinary and webhook),
and the actual viewer streaming route. The upstream engine and Meta delivery are
mocked: these are executed boundary regressions, not database-backed or provider
end-to-end PoCs. Full browser QA requires a separately provisioned synthetic app
and database environment; the preview-isolation browser harness alone does not
supply that chat backend.

Compatibility: clients that previously drove WhatsApp sessions through public
chat APIs must use the WhatsApp integration. Web sessions, including legacy IDs
beginning with wa-, retain their existing bearer-ID semantics. WhatsApp preview
sessions are likewise internal; ordinary web previews remain public by random
session capability. The legacy viewer streaming route still uses HTTP 200 with
`{status:404,message:"Could not find session"}` for errors; no stream is exposed.
No change to Origin policy, ID format, schema or webhook authentication is made.
The separate startChatPreview overwrite issue and missing webhook-secret issue
are outside this change.
