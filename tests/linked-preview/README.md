# Linked draft preview authorization

Run against a disposable local PostgreSQL database named `typebot_link_qa`:

```sh
DATABASE_URL=postgresql://USER:PASSWORD@localhost:PORT/typebot_link_qa bunx nx db:push prisma
LINK_PREVIEW_TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:PORT/typebot_link_qa bunx nx test-linked-preview
```

The explicit test URL is required and restricted to loopback. Tests create unique
synthetic users, memberships, collaborations and bots, and remove their fixtures.
They do not use the saved browser auth file or production identities. The root
Nx target keeps this integration suite separate from Bun suites mocking Prisma.

Coverage uses the real Prisma/PostgreSQL queries, preview start and continuation
handlers, session serialization, linked-bot execution and builder HTTP-test
handler. Only the final outbound HTTP send is replaced with a payload capture;
server-side user-code execution is disabled. This is handler integration testing,
not browser/HTTP routing or authentication middleware end-to-end coverage.

The matrix covers GUEST shared/unshared drafts, MEMBER, ADMIN, explicit READ/WRITE
collaborators without workspace membership, outsider and missing preview identity.
It also covers delayed execution, immediate execution, access revoked after start,
recursive children, dynamic destination groups, self links, the same-workspace
boundary and published snapshots.

## Compatibility

The server stores `previewUserId` in new authenticated preview sessions and checks
that user's current access each time another draft is fetched. No database
migration is needed (session state is JSON). Restart older preview sessions to
populate the identity; their external draft links fail closed. Template previews
have no authenticated draft identity and cannot fetch another draft. Self links
and published execution retain their existing behavior. All engine instances
serving start/continue must run the fix; old instances do not enforce this check.

An already loaded draft in an existing session is not purged by this change.
Existing preview session IDs remain bearer capabilities. This fix authorizes new
linked-draft fetches; it does not redesign session ownership or revocation.

The exploitable entry requires access to a preview in the target workspace.
Membership in an unrelated workspace alone does not establish that entry path.
The HTTP test uses its existing entry-bot read policy and now expands only linked
bots readable by the requesting user, preserving explicit cross-workspace
collaboration in this helper. Runtime execution retains its same-workspace limit.
