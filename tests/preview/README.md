# Separate-origin builder previews

Run from the repository root:

```sh
bunx nx test-preview-isolation
bunx nx test builder
bunx nx test @typebot.io/bot-engine
bunx nx typecheck builder --skipNxCache
bunx nx typecheck viewer --skipNxCache
bunx nx format-and-lint
```

The browser target builds the React embed, then bundles the actual builder
IsolatedPreview, viewer Preview and Code / Set Variable executors. Only the
environment, visual Button component and chat API responses are fixture-specific.
Loopback servers use localhost:5198 (host) and 127.0.0.1:5199 (preview), plus
HTTPS sibling hosts builder.typebot.test:5200 and viewer.typebot.test:5201.
Chromium resolves these test hosts locally; OpenSSL generates a disposable test
certificate. The HTTPS fixture uses the actual builder proxy and verifies that
credentialed fetch, XHR, beacon, form, image and redirected requests arrive with
the owner's host-only SameSite=Lax cookie but cannot authenticate a mutation.
A synthetic HttpOnly cookie protects a counted endpoint. No database, production
credentials or external service is needed. Chromium must be installed for
Playwright. Artifacts live in the ignored test-results/preview-isolation folder.

Keep these cross-application tests in this root target. Putting imports of
builder/viewer components under the embed package creates a circular Nx dependency.
When verifying changed embed APIs, build the embed before app typechecks and
avoid restoring stale declaration outputs from the Nx cache. For formatting, use
`bunx nx format-and-lint --write`; a root `nx exec` can also execute in dependency
working directories, where repository-relative paths are incorrect.

## Boundary

```text
Builder origin, authenticated
  └─ startChat on builder API (existing authorization)
       └─ postMessage: initial reply + appearance
            └─ iframe /__preview on viewer origin
                 ├─ scripts, DOM, network
                 ├─ continueChat on viewer API using random sessionId
                 └─ postMessage: input block id / logs only
```

Flow, Theme, Settings and template previews all use this boundary. There is no
same-origin fallback and no block option that can select the execution context.
Stored bots with missing/false/true isUnsafe values use the same frame.
Stored isUnsafe and enableSafetyFlags fields are ignored when reading old
JSON. Create/update/import strip them instead of persisting them. Bot schemas
and UI no longer expose a safety toggle. Code and Set Variable API actions keep
emitting isUnsafe:true as a compatibility field: older builder tabs still use
it to select their Worker. Current isolated clients ignore it. Do not remove this
wire field until a minimum preview-client version is enforced.
No data migration is needed for execution isolation.

The initial reply contains a conversation session ID, not an account credential
or the complete bot definition. This is the existing conversation bearer
capability, with the existing session lifecycle, not a new expiring access token.
Restart creates a fresh random session; deterministic bot/user IDs are not reused.
Treat the conversation content sent to a script as visible to that script.
The server also returns previewWebhookRoom, derived from the authorized user and
bot. This existing webhook channel is distinct from the random conversation ID.
Published result channels and old API clients with legacy session IDs keep their
existing routing.

Both message receivers validate the exact origin, source window and message
schema. Each preview document has a random document ID carried by every message.
Reload starts a fresh conversation, aborts the previous start request, and rejects
messages intended for the old document. Repeated ready/init messages for the same
document do not restart it. The 20-second timeout covers frame connection only;
server-side execution retains the API's own timeouts. The frame stays blank until
its reply is available. Logs are sent in batches of at most 100 without loss. The builder does not relay arbitrary requests or execute messages.
Input/log events are untrusted presentation data. The viewer never receives
the builder session cookie through this protocol.

A payment-return document can identify its saved session in the ready message.
The builder reuses its cached bootstrap only when that session ID matches the
one it already started, avoiding repeated server-side start effects. The embed
resumes payment before consuming an initial reply, preserving the old session,
published result ID or preview webhook channel. Malformed storage and mismatched
bot/mode state cannot replace a newly supplied preview. Stripe redirect results
are simulated in the tests; no payment or provider redirect is performed.

The browser origin boundary prevents reading the builder document, storage and
non-CORS authenticated responses. Same-site sibling subdomains can still send
cookie-bearing requests. The builder proxy therefore strips Cookie before API
authentication unless Fetch Metadata or a validated Origin/Referer establishes
a same-origin request. Missing evidence and opaque origins fail closed. This
covers REST, oRPC and streaming, including GET requests and redirects. Bearer
tokens remain available to clients that explicitly supply them. Preserve
host-only session cookies: filtering cannot protect a cookie exposed directly
to the viewer through a shared Domain attribute.

Auth.js routes retain their CSRF/OAuth checks. The exact GET Google Sheets OAuth
callback also keeps its cookies: it verifies a signed, expiring state, the
signed-in user and a matching HttpOnly nonce before writing credentials. Ordinary
page navigation is unchanged. These are bounded exceptions, not exemptions for
all navigations or arbitrary callback paths.

## Configuration and rollout

NEXT_PUBLIC_VIEWER_URL's first URL must use a different hostname from the builder
(not merely another port). The viewer's NEXTAUTH_URL must name the actual builder
origin. The static preview reads NEXT_PUBLIC_BUILDER_ORIGIN from /__ENV.js;
Next configuration and the Docker entrypoint derive it from NEXTAUTH_URL.
No additional operator setting or getServerSideProps is needed. A viewer proxy
matched only on /__preview applies framing and Referrer-Policy headers at runtime.
HTTPS is expected outside local development. A local example is builder
http://localhost:3000 and viewer http://127.0.0.1:3001.

The builder CSP permits the configured preview origin. The /__preview response
allows framing only by its configured builder. If the viewer is missing,
misconfigured, or blocked by CSP, preview stops with a retryable error; scripts
never fall back to the builder. On a split rollout the viewer route and updated
embed must be available before the builder is switched. Rebuild the JS and React
embeds together with the apps. Older builder/preview clients should be refreshed
to receive the separate-origin UI; newly emitted actions keep their legacy
sandbox selection during the rollout. Actions already cached in an old client
cannot be retroactively changed. No deployment is performed by these tests.

The public viewer origin must not host builder authentication or authenticated
builder endpoints. The boundary isolates the builder account; it does not create
a separate storage partition for every bot. Viewer-origin storage and other
viewer pages remain part of that origin's trust domain.

## Compatibility

- DOM access, async scripts, arguments, expressions, leading zeros, network
  requests and client-side error logs remain supported. Device type uses the
  iframe's viewport. Relative URLs resolve against the viewer.
- Scripts cannot access the builder document, its localStorage, or read non-CORS authenticated
  builder API responses. Code that intentionally relied on those capabilities must change.
- Cross-origin clients can no longer use a browser session cookie for builder
  API authentication; use an API token. Clients or reverse proxies that remove
  Fetch Metadata, Origin and Referer also lose cookie authentication. Published
  viewer execution is unchanged, but scripts intentionally calling the builder
  with the owner's cookie are subject to this API protection too.
- Theme/settings updates are sent to the frame. Enabling progress tracking
  restarts preview so the engine can calculate progress.
- The iframe allows scripts, same-origin viewer access, forms, downloads and
  popups, but not top-level navigation or popups escaping its sandbox.
  Page redirects affect the preview rather than the builder.
- Autoplay and fullscreen permissions are delegated to the viewer. Browser
  autoplay policies still apply; delegation does not bypass user preferences.
- The preview bootstrap CSP blocks workers. This limits Worker-based scripts;
  it is defense in depth, not a claim of per-bot storage or persistence isolation.
  Unlike the former Worker approach, ordinary scripts have no execution timeout
  and share the preview page's globals.
- Published execution keeps its existing DOM/network behavior. Payment redirects,
  third-party login popups, microphone/camera prompts and third-party cookie
  restrictions need integration-specific testing; this target does not certify them.
- Automated coverage uses Chromium. Firefox and WebKit are not covered here.

For manual verification use an isolated database with synthetic owner and WRITE
collaborator accounts. Store Code and Set Variable with isUnsafe:false directly
to represent an older bot. Test as the owner, then update via the collaborator
API and import with enableSafetyFlags:false. Check that neither flag remains in
the parsed/persisted data, and verify browser execution. Check Flow, Theme, Settings, restart, continuation and active
block highlighting. Never publish the test bot.
