# Sign-in redirect regression fixture

Run `bunx nx preview-auth-redirect` to keep http://localhost:5298 available for
review. Run `bunx nx test-auth-redirect` for Chromium regressions. The generator
bundles current worktree source at startup: restart the preview after edits.
Generated files are ignored under `test-results/auth-redirect-app`.

The fixture mounts the actual SignInForm with Next 16.2.9 navigation, nuqs and
Auth.js SessionProvider. A local Credentials provider creates only a synthetic
JWT session; presentation components and translation are stubbed. The actual
builder proxy runs for `/typebots`, with a loopback-only environment. No app .env,
database, saved user cookies, email delivery or external OAuth provider is used.
This verifies authentication state transitions and routing, not full production
provider integrations or the builder's visual appearance. The server binds only
to loopback. Do not deploy this test fixture.

Manual scenarios:

- Open `/signin?redirectPath=%2F%2Fexample.org%2F` and click **Sign in synthetic
  user**. Expect `/typebots`. Repeat while already signed in.
- Open `/signin?redirectPath=%2Ffeedback%2F123%3Ffilter%3Dactive%23reply`.
  Expect `/feedback/123?filter=active#reply`, both after sign-in and with an
  existing session. **Sign out** resets the synthetic session.
- Open `/typebots?redirectPath=%2Ffeedback%2F123%3Ffilter%3Dactive%23reply`
  to exercise the proxy's callback return.

The unit regressions run with:
`bunx nx test builder --args=src/features/auth/helpers/sanitizeRedirectPath.test.ts`.
They also cover both email entrypoints through their shared magic-link helper.
Workspace invitations, duplication and UserProvider generate root-relative paths.
Google Sheets OAuth has its own signed state and same-origin/path checks and is
unchanged. Social sign-in still uses Auth.js's server callback-origin check; its nested
`redirectPath` is checked by the proxy. No token disclosure is asserted.

Compatibility: redirectPath must now be root-relative (`/path?query#hash`).
Absolute URLs, including same-origin URLs, bare relative paths, query/hash-only
values, backslashes and control characters fall back to
`/typebots` (or continue on `/typebots` in the proxy). Percent-encoded path data
is not decoded again; encoded separators remain local in Chromium/Next tests.
Dot segments are normalized and results starting with `//` are rejected.
The proxy uses the destination query rather than carrying unrelated callback
query parameters forward. Next's normal trailing-slash behavior still applies.
Firefox/WebKit, email delivery, and real OAuth login are not verified here.
