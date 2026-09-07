# SSRF destination policy

`validateIPAddress` is shared by URL/DNS preflight validation and the undici
connection lookup. Keep this classification in one place. Every DNS answer must
pass, including mixed public/blocked answers. Redirects are validated separately
before following them. Proxy requests keep their validated destination pinned,
with the original Host header and TLS server name.

`SSRF_ALLOWED_HOSTS` uses exact normalized hostname matching. It only relaxes the
RFC1918 checks (10/8, 172.16/12, 192.168/16), including IPv4-mapped representations.
It does not permit shared space, metadata, loopback, link-local, IPv6 unique local,
or other blocked special-use ranges. The existing development-only `localhost`
exception is unchanged.

## Special-use ranges

Reviewed against the [IANA IPv4 registry](https://www.iana.org/assignments/iana-ipv4-special-registry/)
and [IANA IPv6 registry](https://www.iana.org/assignments/iana-ipv6-special-registry/).
This is an explicit destination policy, not a claim that every admitted address
is globally routable or every special-use address is exploitable.

| Classification | Policy |
| --- | --- |
| Shared IPv4 100.64/10 | Block, including both boundaries |
| IPv4 protocol assignments 192.0.0/24 | Block except globally reachable anycast 192.0.0.9 and 192.0.0.10 |
| IPv4 documentation, benchmarking, deprecated relay 192.88.99/24 | Block |
| IPv4 multicast 224/4, reserved 240/4 and limited broadcast | Block |
| IPv6 mapped IPv4 ::ffff:0:0/96 | Normalize and apply IPv4 policy, preserving the RFC1918 exception |
| Well-known NAT64 64:ff9b::/96 | Apply IPv4 policy without the RFC1918 exception |
| Local NAT64 64:ff9b:1::/48, Teredo 2001::/32, 6to4 2002::/16 | Block the entire transition range; routing cannot be established from a single destination classification |
| Deprecated IPv4-compatible ::/96 and translated ::ffff:0:0:0/96 | Block |
| IPv6 discard 100::/64, dummy 100:0:0:1::/64, benchmark 2001:2::/48 | Block |
| IPv6 documentation 2001:db8::/32 and 3fff::/20, SRv6 5f00::/16 | Block |
| IPv6 deprecated site-local fec0::/10 and multicast ff00::/8 | Block |
| Globally reachable anycast/AMT/AS112 allocations | Preserve; do not blanket-block their parent protocol-assignment space |

IPv6 parsing validates DNS answers and normalizes compression, leading zeros,
case and dotted suffixes before inspecting numeric groups. Arbitrary
deployment-specific translation prefixes, VPN routes or globally numbered local
services cannot be inferred from the address alone; network egress policy remains
necessary for those deployments. Blocking transition ranges can break existing
destinations using those mechanisms, even when they ultimately reach public IPv4.

## Regression checks

```sh
bunx nx test @typebot.io/lib --excludeTaskDependencies -- src/ssrf src/safeKy.test.ts src/safeFetch.test.ts
NODE_ENV=development bunx nx test @typebot.io/lib --excludeTaskDependencies -- src/safeKy.test.ts --test-name-pattern=redirect
bunx nx test @typebot.io/bot-engine --excludeTaskDependencies -- --test-name-pattern=executeHttpRequest
bunx nx typecheck @typebot.io/lib
bunx nx typecheck @typebot.io/bot-engine
bunx nx format-and-lint
```

The second command exercises real HTTP redirects from an ephemeral localhost
server. Its development environment is required only for that fixture. The
default suite tests production blocking behavior, DNS answer permutations,
connection lookups (including undici), allowed-host semantics, encoded addresses,
range boundaries and public neighbors. Engine tests substitute fetch to assert
that no request reaches a blocked destination, including after redirects and
through proxies. These tests do not reproduce a complete published-bot exploit
or establish metadata reachability in any production network.

The connection probe is bundled for Node and executed in a Node subprocess:
Bun 1.3.9 replaces `undici` with a built-in implementation whose Agent does not
exercise the production connection path. Keep this probe on Node even though the
test runner is Bun. It verifies HTTP and HTTPS connection rejection for both IPv4
and mapped IPv4, using injected DNS answers without contacting those destinations.
