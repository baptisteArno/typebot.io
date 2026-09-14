# Webhook response authenticity

The engine accepts a Webhook result only when its payload has a valid HMAC,
bound to the stored room, block and random wait nonce. Ordinary text, empty
replies and commands cannot cross that wait. HTTP Request blocks explicitly
executed on the client retain their separate client-result contract.

```text
Authenticated executeWebhook / executeTestWebhook
  -> signed publication (room + block + payload, 60-second validity)
     production also binds the selected session's wait nonce
  -> PartyKit validates publisher and durably claims the publication nonce
     -> validates each subscription (room + block + wait nonce + expiry)
     -> signs response for that wait
  -> embed forwards the opaque response
  -> engine verifies and atomically claims the persisted wait
  -> response mapping, downstream flow, result persistence

Authenticated WhatsApp executeWebhook / executeTestWebhook
  -> signs response for the stored wait
  -> existing WhatsApp converter and resume flow
  -> same engine verification and atomic claim
```

Subscribers can receive their authorized data but cannot sign or publish payloads.
PartyKit validates before upgrading the connection and again before delivery,
including after hibernation. Publication nonces are single-use in durable storage;
concurrent or replayed POSTs return 409, even after the subscriber enters a new wait.
Production delivery must match the selected session's wait nonce, so sessions
sharing a remembered result cannot consume each other's callback. Authenticated
test publications retain their preview-room broadcast contract.
Expired nonce records are pruned on the next accepted publication. The embed keeps
its signed action pending while PartySocket reconnects after a transient disconnect.
WebSocket client messages never broadcast. Names
with slashes are URL-encoded as a single room ID: otherwise PartyKit uses only
the first segment and merges unrelated preview channels for the same user.
Known result/user/bot IDs are not subscription credentials. Access to a foreign
channel still presupposes knowledge of its identifiers; no specific payment
fraud is claimed or tested by this fixture.

Production execution retains write access, workspace status checks and the
result/typebot relation, and additionally requires the active session to match
the result, typebot and block. Test publication and builder subscription reuse
the existing authenticated test-read policy and the caller's own preview room.
Anonymous templates have no authenticated test channel.

## Configuration and rollout

Set **WEBHOOK_RELAY_SECRET** to the same independent random value (at least 32
characters, generated from at least 32 random bytes) in builder, viewer and
PartyKit server variables. Never expose it through NEXT_PUBLIC variables or
reuse ENCRYPTION_SECRET. Configure NEXT_PUBLIC_PARTYKIT_HOST as before. Use a
separate key per environment and redact subscription query strings from proxy
access logs. Production connections must use HTTPS/WSS.

Missing or inconsistent keys fail closed. Even WhatsApp-only webhook execution
requires the signing key on its server; its response bypasses PartyKit delivery.
The existing PartyKit-host configuration check on execution endpoints is retained.

Deploy as a coordinated protocol change:

1. Provision the shared server secret on all three services.
   The PartyKit main-branch deployment workflow also watches the shared signing
   and verification helpers, so changes there rebuild the relay.
2. Deploy the protected PartyKit worker and ensure the old public relay is no
   longer serving clients (including existing unauthenticated sockets). Its new
   delivery path revalidates every connection. Accept a maintenance window:
   old publishers/listeners stop working against this worker.
3. Deploy builder and viewer together with rebuilt JS and React embeds. Update
   externally hosted/pinned embed distributions too. Both apps must run the new
   engine before webhook traffic resumes; an old viewer would still trust text.
4. Refresh open builder/viewer tabs and restart waits created by the old engine.
   Validate a signed legitimate response before ending maintenance.

There is no insecure legacy fallback, and no schema migration. Existing ordinary
chat/input sessions continue; stored waits without pendingWebhook metadata must
restart. Old clients that derive rooms from resultId or previewWebhookRoom must
instead use the action's room and token, URL-encode the room, add the token query
parameter, and forward the signed response unchanged. Existing authenticated
external callback URLs and JSON-object bodies are unchanged. Non-JSON/scalar
callback bodies now return 400 instead of waking listeners with empty data.
OpenAPI output includes the new required action fields.

Wait/subscription validity is the session's expiryTimeout, or 24 hours when it
has none; the builder's settings listener lasts 15 minutes. Expired waits require
a new session; the settings listener can be restarted. Changing the shared key
invalidates outstanding capabilities, so coordinate rotation and refresh/restart
clients. This is a compatibility cost for previously unbounded waits.

The database compare-and-swap claims a response before downstream effects, so
concurrent copies cannot execute them twice. This favors at-most-once execution:
a crash after claiming but before saving the continuation leaves the wait
unresumable and requires a restart. Similarly, relay failure after claiming a
publication requires a fresh authenticated callback; replaying that POST is rejected. It does not provide transactional exactly-once
external effects or fix general concurrent session updates outside Webhook waits.

If no matching listener is connected, the relay returns 503 and the callback API
returns 502. Retry the original authenticated callback after reconnecting; each
attempt creates a new publication nonce. A successful relay response means the
payload was sent to a matching socket, not that the browser or engine acknowledged
consumption. Durable offline delivery and end-to-end acknowledgements are not
provided.

## Run the real local path

```sh
bunx nx test-webhook-authentication
bunx nx preview-webhook-authentication
bunx nx test @typebot.io/webhook-block
bunx nx test @typebot.io/bot-engine
bunx nx test-preview-isolation
bunx nx run-many -t typecheck -p builder,viewer,@typebot.io/partykit
bunx nx format-and-lint
```

The preview command runs the same replay then keeps http://localhost:5290 and
PartyKit on localhost:5292 available. It launches a disposable loopback PostgreSQL
container and removes it on exit. Stop with Ctrl-C. These fixed ports must be free.
The page lets a reviewer start a session, submit a forgery, then deliver a legitimate
callback. /report exposes the last replay result. The synthetic owner credential
is only accepted by this loopback harness; there is no production login or data.

The harness clears inherited service configuration before loading modules. It
uses the actual engine, Prisma persistence, oRPC procedures, PartyKit local
worker, embed listener, HTTP client executor, and WhatsApp conversion/resume code.
Only identity resolution, Next after() scheduling and the Meta HTTP response are
fixture adapters. Meta calls can only address the synthetic fixture phone; other
external fetch destinations are rejected. Jiti with automatic JSX handles the
workspace's mixed module packages without replacing the native isolated-vm mapper.
No deployment, real provider delivery or actual payment is performed.

Checks cover text/JSON/empty/command forgeries; unchanged state on rejection;
unauthorized publish/subscribe; foreign rooms, sessions and preview bots; expired,
wrong-purpose and tampered credentials; a legitimate Unicode payload through the
real relay and embed; concurrent consumption on PostgreSQL; replay at a later wait;
authorized web/preview/WhatsApp continuations; the builder subscription procedure;
and an actual explicitly client-executed HTTP request. Existing permission tests
cover writer/admin/member/collaborator and result/typebot binding. The browser
preview suite covers forwarding the new action with published, random preview and
legacy session-ID formats, plus preview lifecycle/payment-return compatibility.

Limits: PostgreSQL is exercised; MySQL has not been replayed. The manual page is
a QA harness, not a full Next
builder deployment; the settings subscription procedure is exercised, while its
React button is typechecked. The browser suite uses Chromium. No actual Meta,
payment, production infrastructure, multi-region rollout or proxy configuration
is certified by these tests. General public WhatsApp session access is out of scope.
