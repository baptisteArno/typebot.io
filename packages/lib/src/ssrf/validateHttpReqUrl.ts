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
 * - Link-local addresses (169.254.0.0/16, fe80::/10)
 * - Various IP encoding bypass attempts (decimal, hex, octal)
 *
 * @throws Error if the URL is blocked or invalid
 */
export const validateHttpReqUrl = (urlString: string) => {
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

  // Parse IP address if it's in standard format
  const ip = parseIPAddress(hostname);
  if (ip) {
    validateIPAddress(ip);
  }
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
const parseIPAddress = (hostname: string): ParsedIP | null => {
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

  // Try IPv6 - check if hostname contains colons (characteristic of IPv6)
  // Note: URL parser already removes brackets, so we get the raw IPv6 address
  if (hostname.includes(":")) {
    return { version: 6, address: hostname };
  }

  return null;
};

type ParsedIP =
  | { version: 4; octets: number[] }
  | { version: 6; address: string };

/**
 * Validates that an IP address is not in a blocked range
 *
 * @throws Error if the IP is in a blocked range
 */
const validateIPAddress = (ip: ParsedIP) => {
  if (ip.version === 4) {
    const [first, second] = ip.octets;

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
    if (first === 10) {
      throw new Error(
        "Access to private network range (10.0.0.0/8) is not allowed for security reasons.",
      );
    }

    // Block 172.16.0.0/12 (private)
    if (first === 172 && second >= 16 && second <= 31) {
      throw new Error(
        "Access to private network range (172.16.0.0/12) is not allowed for security reasons.",
      );
    }

    // Block 192.168.0.0/16 (private)
    if (first === 192 && second === 168) {
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
    const addr = ip.address.toLowerCase();

    // Handle IPv6-mapped IPv4 addresses (e.g., ::ffff:1.2.3.4 or ::ffff:a9fe:a9fe)
    if (addr.startsWith("::ffff:") || addr.startsWith("0:0:0:0:0:ffff:")) {
      const parts = addr.split("ffff:");
      const ipv4Part = parts[parts.length - 1];

      // Check for dotted decimal format
      if (ipv4Part.includes(".")) {
        const octets = ipv4Part.split(".").map(Number);
        if (
          octets.length === 4 &&
          octets.every((o) => !isNaN(o) && o >= 0 && o <= 255)
        ) {
          validateIPAddress({ version: 4, octets });
          return;
        }
      }

      // Check for hex format (2 groups of 16-bit hex)
      const hexGroups = ipv4Part.split(":");
      if (hexGroups.length === 2) {
        const group1 = parseInt(hexGroups[0], 16);
        const group2 = parseInt(hexGroups[1], 16);

        if (!isNaN(group1) && !isNaN(group2)) {
          const octets = [
            (group1 >> 8) & 0xff,
            group1 & 0xff,
            (group2 >> 8) & 0xff,
            group2 & 0xff,
          ];
          validateIPAddress({ version: 4, octets });
          return;
        }
      }
    }

    // Block ::1 (loopback)
    if (
      addr === "::1" ||
      addr === "0:0:0:0:0:0:0:1" ||
      addr === "0000:0000:0000:0000:0000:0000:0000:0001"
    ) {
      throw new Error(
        "Access to IPv6 loopback (::1) is not allowed for security reasons.",
      );
    }

    // Block fe80::/10 (link-local)
    if (
      addr.startsWith("fe8") ||
      addr.startsWith("fe9") ||
      addr.startsWith("fea") ||
      addr.startsWith("feb")
    ) {
      throw new Error(
        "Access to IPv6 link-local addresses (fe80::/10) is not allowed for security reasons.",
      );
    }

    // Block fc00::/7 (unique local)
    if (addr.startsWith("fc") || addr.startsWith("fd")) {
      throw new Error(
        "Access to IPv6 unique local addresses (fc00::/7) is not allowed for security reasons.",
      );
    }
  }
};
