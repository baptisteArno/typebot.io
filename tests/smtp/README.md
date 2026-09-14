# SMTP configuration test egress

The builder SMTP configuration test validates the destination before creating a
Nodemailer transport. It shares the existing HTTP destination classification,
validates every DNS answer, then pins the transport to the first validated IP.
The requested DNS hostname remains the TLS server name for direct TLS and
STARTTLS. Nodemailer 9.0.1 does not resolve numeric hosts; its DNS cache and
multi-address fallback cannot introduce another destination. STARTTLS upgrades
the existing socket. A later configuration test resolves and validates again.

`SSRF_ALLOWED_HOSTS` keeps its existing exact, lowercase hostname contract. An
entry such as `smtp.internal.example` permits that hostname's RFC1918 addresses
(10/8, 172.16/12, 192.168/16, including IPv4-mapped forms). It does not grant
access to metadata, loopback, link-local, shared/special-use addresses or IPv6
ULA. SMTP does not inherit HTTP's development-only localhost exception. This
operator-controlled exception is instance-wide: any authenticated caller of the
SMTP test can use the permitted internal destination; it is not a workspace ACL.
Only configure it for relays intended to be available to those users.

Public SMTP remains supported on integer ports 1–65535, including direct TLS and
STARTTLS. Hosts accept ASCII/punycode DNS names and IPv4/IPv6 literals, including
bracketed IPv6. DNS name case and a final dot are normalized. URLs, embedded
ports/credentials, whitespace and encoded IPv4 forms are rejected. Unicode DNS
names must be supplied in punycode. A mixed public/blocked DNS answer fails
closed. Pinning the first answer deliberately removes Nodemailer's multi-IP
failover: a host whose first address is unreachable can fail even when another
address works. The next test performs a fresh lookup.

This change is limited to `email.testSmtpConfig`. It does not change stored SMTP
credential execution, notification/auth SMTP, authentication rules or common
HTTP boundaries. The primitive addressed is blind TCP/SMTP SSRF; neither HTTP
body access nor cloud metadata extraction is established. Globally numbered
internal services and deployment-specific routing still require network egress
controls, as documented by the shared destination policy.

## Controlled regression

```sh
bunx nx test builder --args=src/features/blocks/integrations/sendEmail/api/handleTestSmtpConfig.test.ts
bunx nx typecheck builder --skipNxCache
bunx nx format-and-lint
```

Requires Node 24, Bun and OpenSSL (macOS/Linux). The Bun runner bundles the actual
handler, resolver and Nodemailer for a separate Node process. Only environment
configuration is replaced at build time. The probe replaces OS DNS with synthetic
answers and intercepts socket creation: it first asserts the validated numeric
host, then maps that socket to its own ephemeral loopback SMTP fixture. No public
IP, internal service or third-party recipient is contacted. The fixture captures
four messages and never relays them. A disposable certificate stays in memory;
only the test socket trusts it. No system trust store is modified.

Assertions cover blocked literals in plaintext and TLS modes, encoded addresses,
malformed hosts, empty/invalid/mixed DNS answers, exact RFC1918 allowlisting,
metadata protection despite allowlisting, a changed DNS answer after validation,
fresh validation on the next invocation, refusal without multi-IP fallback,
public IPv4/IPv6 acceptance, successful SMTP/TLS/STARTTLS, certificate-name
mismatch and port bounds. The development environment fixture also proves that
SMTP's localhost policy has no development bypass.

This is a handler-to-socket integration regression, not an authenticated browser
or production end-to-end exploit replay. All fixture identities are synthetic.
