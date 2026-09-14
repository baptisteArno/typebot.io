# Preview session creation

Preview and template starts always generate a fresh session ID, including
registration-only requests. The optional `sessionId` is accepted for wire
compatibility but ignored. Clients must use the returned ID for continuation,
streaming and payment resumption. Restarting creates a separate conversation;
it no longer resets even the caller's own previous session in place. Existing
sessions remain available under their existing lifecycle; no migration or eager
deletion is performed. The builder already uses the returned ID.

Legacy sendMessage V1/V2 still continue an existing nonempty session. When they
create a preview (missing session, JSON null or old empty-object state), they
also ignore the requested ID. This closes the read/create race without checking
ownership metadata that old sessions do not contain. Public continuation and
WhatsApp session access are outside this change.

All normal preview inserts use `newPreview` in saveStateToDatabase, which performs
a database `create`, never an upsert. Registration uses restartSession without an
ID, whose create is also insert-only. A generated-ID collision fails rather than
replacing a row. Live creation/upsert semantics remain unchanged.

## Storage regression suite

Use a dedicated disposable PostgreSQL instance, never production credentials or
an existing application database:

```sh
docker run -d --name typebot-preview-sessions-test \
  -e POSTGRES_PASSWORD=preview_test -e POSTGRES_DB=preview_test \
  -p 127.0.0.1:55439:5432 postgres:16-alpine
docker exec -i typebot-preview-sessions-test \
  psql -U postgres -d preview_test < tests/preview-sessions/schema.sql
PREVIEW_SESSION_TEST_DATABASE_URL=postgresql://postgres:preview_test@127.0.0.1:55439/preview_test \
  bunx nx test-preview-sessions
```

Wait for PostgreSQL to be ready before applying the schema. The suite requires
an explicit loopback database URL and cleans up only its own synthetic rows.
It runs in a separate process because bot-engine unit tests mock Prisma and save.
Bot/template lookup and the unused JS isolate are fixtures; the engine, session
parsing, handlers, and Prisma storage execute worktree code. This is not HTTP
authentication or a browser/WhatsApp provider end-to-end test. PostgreSQL is
covered; MySQL/PlanetScale is not exercised.

Coverage includes normal/template starts, registration, concurrent starts at a
victim ID, live/WhatsApp/preview victim rows, legacy null/empty/missing creation,
continuation with the returned ID, and forced insert collisions. Victim rows
(including timestamps and replying status) are compared before and after.

The separate-origin browser harness remains documented in
[../preview/README.md](../preview/README.md).

## Local review API

```sh
PREVIEW_SESSION_TEST_DATABASE_URL=postgresql://postgres:preview_test@127.0.0.1:55439/preview_test \
  bunx nx serve-preview-sessions
```

Open http://localhost:55440 for a synthetic victim ID and `victimIntact` status.
POST the displayed example body as JSON to `/preview`, or replace `typebotId`
with `templateSlug: "synthetic"` and POST to `/template`. Both accept
`isOnlyRegistering`. GET again to verify the victim is unchanged. This loopback
API uses the worktree engine and PostgreSQL with fixture bot lookup; it does not
run the builder/viewer UI or their authentication middleware. Its rows live only
in the disposable database. Stop the process and remove its Docker container
when review is complete.
