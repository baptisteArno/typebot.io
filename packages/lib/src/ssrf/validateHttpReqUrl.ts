import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { URL } from "node:url";
import { env } from "@typebot.io/env";

const BLOCKED_HEADERS = [
  "x-aws-ec2-metadata-token",
  "x-aws-ec2-metadata-token-ttl-seconds",
  "metadata",
  "metadata-flavor",
];

/**
 * Validates a URL to prevent SSRF attacks by blocking requests to:
 * - AWS/Cloud metadata services (169.254.169.254, metadata.google.internal, etc.)
 * - Private IP ranges (RFC1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
 * - Localhost and loopback addresses (127.0.0.0/8, ::1)
 * - Unspecified addresses (0.0.0.0/8, ::/128)
 * - Link-local addresses (169.254.0.0/16, fe80::/10)
 * - Shared address space (100.64.0.0/10) and other special-use destinations
 * - Various IP encoding bypass attempts (decimal, hex, octal)
 * - Hostnames that resolve to blocked IP ranges
 *
 * Hostnames listed in the SSRF_ALLOWED_HOSTS env var skip the RFC1918
 * private-range checks (10/8, 172.16/12, 192.168/16) so self-hosters can
 * reach internal corporate APIs. All other protections remain active —
 * including link-local (169.254/16, the actual CVE-2025-64709 vector),
 * loopback, cloud metadata hostnames, encoded-IP detection, and IMDS
 * bypass header blocks.
 *
 * @throws Error if the URL is blocked or invalid
 */
export const validateHttpReqUrl = async (
  urlString: string,
  options?: ValidateHttpReqUrlOptions,
) => {
  await resolveAndValidateHttpReqUrl(urlString, options);
};

export const resolveAndValidateHttpReqUrl = async (
  urlString: string,
  {
    lookupHost = lookup,
    allowedHosts = env.SSRF_ALLOWED_HOSTS,
  }: ValidateHttpReqUrlOptions = {},
): Promise<ValidatedHttpReqUrl> => {
  if (!urlString?.trim()) {
    throw new Error("URL is required");
  }

  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error("Invalid URL format");
  }

  // Only allow HTTP/HTTPS protocols
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(
      `Protocol "${url.protocol}" is not allowed. Only HTTP and HTTPS are permitted.`,
    );
  }

  let hostname = url.hostname.toLowerCase();

  // Strip brackets from IPv6 addresses for consistent parsing
  // URL parser keeps them: [::1], [fe80::1], etc.
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    hostname = hostname.slice(1, -1);
  }

  // Block cloud metadata service hostnames (non-IP formats)
  const blockedHostnames = [
    "metadata.google.internal",
    "metadata.goog",
    "metadata",
  ];

  if (blockedHostnames.includes(hostname)) {
    throw new Error(
      "Access to cloud metadata services is not allowed for security reasons.",
    );
  }

  // Block localhost hostname variations (non-IP formats)
  if (hostname === "localhost" && env.NODE_ENV !== "development") {
    throw new Error("Access to localhost is not allowed for security reasons.");
  }

  // Detect and block decimal/hex/octal encoded IPs
  // 169.254.169.254 in decimal = 2852039166
  // Common patterns: pure decimal, mixed octal (0251.0376...), hex (0xa9fe...)
  const suspiciousPatterns = [
    /^\d{8,10}$/, // Pure decimal IP (e.g., 2852039166)
    /^0x[0-9a-f]+$/i, // Pure hex
    /^0[0-7]{3}\./i, // Octal notation (at least 3 digits with leading 0)
  ];

  if (suspiciousPatterns.some((pattern) => pattern.test(hostname))) {
    throw new Error(
      "IP address encoding (decimal, hex, octal) is not allowed for security reasons.",
    );
  }

  const isAllowlisted = allowedHosts?.includes(hostname) ?? false;

  // Parse IP address if it's in standard format
  const ip = parseIPAddress(hostname);
  if (ip) {
    validateIPAddress(ip, { allowPrivateRanges: isAllowlisted });
    return { url, hostname, resolvedAddress: hostname };
  }

  const resolvedAddresses = await lookupHost(hostname, {
    all: true,
    order: "verbatim",
  });

  if (resolvedAddresses.length === 0) {
    throw new Error(`Hostname "${hostname}" could not be resolved.`);
  }

  resolvedAddresses.forEach((resolvedAddress) => {
    const parsedResolvedAddress = parseIPAddress(resolvedAddress.address);

    if (!parsedResolvedAddress) {
      throw new Error(
        `Hostname "${hostname}" resolved to an invalid IP address.`,
      );
    }

    if (hostname !== "localhost")
      validateIPAddress(parsedResolvedAddress, {
        allowPrivateRanges: isAllowlisted,
      });
  });

  return {
    url,
    hostname,
    resolvedAddress: resolvedAddresses[0].address,
  };
};

/**
 * Validates HTTP headers to prevent bypass of cloud metadata service protections
 *
 * @throws Error if blocked headers are detected
 */
export const validateHttpReqHeaders = (
  headers?:
    | Record<string, string | string[] | undefined>
    | Array<{ key?: string; value?: string }>,
) => {
  if (!headers) return;

  const headersList = Array.isArray(headers)
    ? headers
    : Object.entries(headers).map(([key, value]) => ({
        key,
        value: String(value),
      }));

  for (const header of headersList) {
    // Skip headers without a key
    if (!header.key) continue;

    const key = header.key.toLowerCase().trim();

    if (BLOCKED_HEADERS.some((blocked) => key.includes(blocked))) {
      throw new Error(
        `Header "${header.key}" is not allowed as it could be used to bypass cloud metadata service protections.`,
      );
    }
  }
};

/**
 * Parses an IP address from a hostname string, returns null if not a valid IP
 */
export const parseIPAddress = (hostname: string): ParsedIP | null => {
  // Try IPv4
  const ipv4Match = hostname.match(
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,
  );
  if (ipv4Match) {
    const octets = ipv4Match.slice(1, 5).map(Number);
    if (octets.every((octet) => octet >= 0 && octet <= 255)) {
      return { version: 4, octets };
    }
  }

  // DNS answers must be valid IPs too, not merely strings containing colons.
  if (isIP(hostname) === 6 && !hostname.includes("%")) {
    return { version: 6, address: hostname };
  }

  return null;
};

export type ParsedIP =
  | { version: 4; octets: number[] }
  | { version: 6; address: string };

type LookupHost = (
  hostname: string,
  options: {
    all: true;
    order: "verbatim";
  },
) => Promise<Array<{ address: string; family: number }>>;

type ValidateHttpReqUrlOptions = {
  lookupHost?: LookupHost;
  allowedHosts?: readonly string[];
};

export type ValidatedHttpReqUrl = {
  url: URL;
  hostname: string;
  resolvedAddress: string;
};

/**
 * Validates that an IP address is not in a blocked range.
 *
 * When `allowPrivateRanges` is true (set by the caller for hostnames in
 * SSRF_ALLOWED_HOSTS), RFC1918 private ranges are skipped — but link-local,
 * loopback, shared/special-use ranges, IPv6 unspecified and unique local remain
 * blocked. This preserves protection against the metadata-service vector
 * (169.254.169.254) even for allowlisted hostnames whose DNS could be
 * hijacked.
 *
 * @throws Error if the IP is in a blocked range
 */
export const validateIPAddress = (
  ip: ParsedIP,
  { allowPrivateRanges = false }: { allowPrivateRanges?: boolean } = {},
) => {
  if (ip.version === 4) {
    const [first, second, third, fourth] = ip.octets;

    // Non-public special-use destinations are never covered by the RFC1918 opt-out.
    // https://www.iana.org/assignments/iana-ipv4-special-registry/
    if (first === 100 && second >= 64 && second <= 127)
      throw new Error(
        "Access to shared address space (100.64.0.0/10) is not allowed for security reasons.",
      );

    if (
      (first === 192 &&
        second === 0 &&
        third === 0 &&
        fourth !== 9 &&
        fourth !== 10) ||
      (first === 192 && second === 0 && third === 2) ||
      (first === 192 && second === 88 && third === 99) ||
      (first === 198 && (second === 18 || second === 19)) ||
      (first === 198 && second === 51 && third === 100) ||
      (first === 203 && second === 0 && third === 113) ||
      first >= 224
    )
      throw new Error(
        "Access to special-use IPv4 addresses is not allowed for security reasons.",
      );

    // Block 127.0.0.0/8 (loopback)
    if (first === 127) {
      throw new Error(
        "Access to loopback addresses (127.0.0.0/8) is not allowed for security reasons.",
      );
    }

    // Block 169.254.0.0/16 (link-local / AWS metadata)
    if (first === 169 && second === 254) {
      throw new Error(
        "Access to link-local addresses (169.254.0.0/16) is not allowed for security reasons. This range includes cloud metadata services.",
      );
    }

    // Block 10.0.0.0/8 (private)
    if (first === 10 && !allowPrivateRanges) {
      throw new Error(
        "Access to private network range (10.0.0.0/8) is not allowed for security reasons.",
      );
    }

    // Block 172.16.0.0/12 (private)
    if (first === 172 && second >= 16 && second <= 31 && !allowPrivateRanges) {
      throw new Error(
        "Access to private network range (172.16.0.0/12) is not allowed for security reasons.",
      );
    }

    // Block 192.168.0.0/16 (private)
    if (first === 192 && second === 168 && !allowPrivateRanges) {
      throw new Error(
        "Access to private network range (192.168.0.0/16) is not allowed for security reasons.",
      );
    }

    // Block 0.0.0.0/8 (this network)
    if (first === 0) {
      throw new Error(
        "Access to 0.0.0.0/8 range is not allowed for security reasons.",
      );
    }
  }

  if (ip.version === 6) {
    // Normalize DNS answers too: unlike URL literals, they can use any valid
    // compression, leading zeros, or a dotted IPv4 suffix.
    if (isIP(ip.address) !== 6 || ip.address.includes("%"))
      throw new Error("Invalid IPv6 address.");
    const address = new URL(`http://[${ip.address}]`).hostname.slice(1, -1);
    const halves = address.split("::");
    const leadingGroups = halves[0] ? halves[0].split(":") : [];
    const trailingGroups = halves[1] ? halves[1].split(":") : [];
    const groups = (
      halves.length === 1
        ? leadingGroups
        : [
            ...leadingGroups,
            ...Array.from(
              { length: 8 - leadingGroups.length - trailingGroups.length },
              () => "0",
            ),
            ...trailingGroups,
          ]
    ).map((group) => Number.parseInt(group, 16));

    if (groups.slice(0, 6).every((group) => group === 0) && groups[6] === 0) {
      if (groups[7] === 0)
        throw new Error(
          "Access to IPv6 unspecified address (::/128) is not allowed for security reasons.",
        );
      if (groups[7] === 1)
        throw new Error(
          "Access to IPv6 loopback (::1) is not allowed for security reasons.",
        );
    }

    const isMappedIPv4 =
      groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff;
    const isWellKnownNat64 =
      groups[0] === 0x64 &&
      groups[1] === 0xff9b &&
      groups.slice(2, 6).every((group) => group === 0);
    if (isMappedIPv4 || isWellKnownNat64) {
      validateIPAddress(
        {
          version: 4,
          octets: [
            groups[6] >> 8,
            groups[6] & 0xff,
            groups[7] >> 8,
            groups[7] & 0xff,
          ],
        },
        {
          // NAT64 is a translation route, not the RFC1918/mapped address itself.
          allowPrivateRanges: isMappedIPv4 && allowPrivateRanges,
        },
      );
      return;
    }

    if ((groups[0] & 0xffc0) === 0xfe80)
      throw new Error(
        "Access to IPv6 link-local addresses (fe80::/10) is not allowed for security reasons.",
      );
    if ((groups[0] & 0xfe00) === 0xfc00)
      throw new Error(
        "Access to IPv6 unique local addresses (fc00::/7) is not allowed for security reasons.",
      );

    // Known non-public ranges and transition mechanisms whose routing cannot be
    // validated from a single embedded IPv4 destination (Teredo, 6to4, local NAT64).
    // https://www.iana.org/assignments/iana-ipv6-special-registry/
    if (
      groups.slice(0, 6).every((group) => group === 0) || // deprecated IPv4-compatible ::/96
      (groups.slice(0, 4).every((group) => group === 0) &&
        groups[4] === 0xffff &&
        groups[5] === 0) || // translated IPv4
      (groups[0] === 0x64 && groups[1] === 0xff9b && groups[2] === 1) ||
      (groups[0] === 0x100 &&
        groups[1] === 0 &&
        groups[2] === 0 &&
        groups[3] <= 1) ||
      // 2001::/23 is non-global except for the specific IANA allocations below.
      (groups[0] === 0x2001 &&
        groups[1] <= 0x1ff &&
        !(
          (groups[1] === 1 &&
            groups.slice(2, 7).every((group) => group === 0) &&
            groups[7] >= 1 &&
            groups[7] <= 3) || // PCP, TURN and DNS-SD anycast /128s
          groups[1] === 3 || // AMT 2001:3::/32
          (groups[1] === 4 && groups[2] === 0x112) || // AS112 2001:4:112::/48
          (groups[1] & 0xfff0) === 0x20 || // ORCHIDv2 2001:20::/28
          // DETs 2001:30::/28
          (groups[1] & 0xfff0) === 0x30
        )) ||
      (groups[0] === 0x2001 && groups[1] === 0xdb8) ||
      groups[0] === 0x2002 ||
      (groups[0] === 0x3fff && groups[1] <= 0xfff) ||
      groups[0] === 0x5f00 ||
      (groups[0] & 0xffc0) === 0xfec0 || // deprecated site-local
      (groups[0] & 0xff00) === 0xff00 // multicast
    )
      throw new Error(
        "Access to special-use IPv6 addresses is not allowed for security reasons.",
      );
  }
};
