import { describe, expect, it } from "bun:test";
import {
  validateHttpReqHeaders,
  validateHttpReqUrl,
} from "./validateHttpReqUrl";

const lookupHost = async (
  hostname: string,
  _options: {
    all: true;
    order: "verbatim";
  },
) => {
  if (hostname === "example.com") {
    return [{ address: "93.184.216.34", family: 4 }];
  }

  if (hostname === "api.example.com") {
    return [{ address: "93.184.216.35", family: 4 }];
  }

  if (hostname === "ssrf-repro.example") {
    return [{ address: "127.0.0.1", family: 4 }];
  }

  if (hostname === "internal.example") {
    return [{ address: "10.0.0.5", family: 4 }];
  }

  throw new Error(`Unexpected hostname lookup: ${hostname}`);
};

const expectUrlToThrow = async (
  url: string,
  message?: string,
  customLookupHost = lookupHost,
) => {
  const expectation = expect(
    validateHttpReqUrl(url, { lookupHost: customLookupHost }),
  );

  if (!message) return expectation.rejects.toThrow();

  return expectation.rejects.toThrow(message);
};

const expectUrlToPass = async (url: string, customLookupHost = lookupHost) =>
  expect(
    validateHttpReqUrl(url, { lookupHost: customLookupHost }),
  ).resolves.toBeUndefined();

describe("validateHttpReqUrl", () => {
  describe("AWS Metadata Service (IMDSv1/v2)", () => {
    it("should block standard AWS metadata IP", async () => {
      await expectUrlToThrow("http://169.254.169.254", "link-local addresses");
    });

    it("should block decimal encoded AWS metadata IP", async () => {
      // URL parser converts this to 169.254.169.254, caught by link-local check
      await expectUrlToThrow("http://2852039166");
    });

    it("should block hexadecimal encoded AWS metadata IP", async () => {
      // URL parser converts this to 169.254.169.254, caught by link-local check
      await expectUrlToThrow("http://0xa9fea9fe");
    });

    it("should block octal encoded AWS metadata IP", async () => {
      await expectUrlToThrow("http://0251.0376.0251.0376");
    });

    it("should block with path to token endpoint", async () => {
      await expectUrlToThrow(
        "http://169.254.169.254/latest/api/token",
        "link-local addresses",
      );
    });

    it("should block with path to credentials endpoint", async () => {
      await expectUrlToThrow(
        "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
        "link-local addresses",
      );
    });
  });

  describe("Google Cloud Metadata Service", () => {
    it("should block metadata.google.internal hostname", async () => {
      await expectUrlToThrow(
        "http://metadata.google.internal/",
        "cloud metadata services",
      );
    });

    it("should block metadata.goog hostname", async () => {
      await expectUrlToThrow(
        "http://metadata.goog/",
        "cloud metadata services",
      );
    });

    it("should block metadata hostname", async () => {
      await expectUrlToThrow("http://metadata/", "cloud metadata services");
    });
  });

  describe("Azure Metadata Service", () => {
    it("should block Azure metadata endpoint (same as AWS)", async () => {
      await expectUrlToThrow(
        "http://169.254.169.254/metadata/instance?api-version=2021-02-01",
        "link-local addresses",
      );
    });
  });

  describe("Private IP ranges (RFC1918)", () => {
    it("should block 10.0.0.0/8", async () => {
      await expectUrlToThrow("http://10.0.0.1", "10.0.0.0/8");
      await expectUrlToThrow("http://10.255.255.255", "10.0.0.0/8");
    });

    it("should block 172.16.0.0/12", async () => {
      await expectUrlToThrow("http://172.16.0.1", "172.16.0.0/12");
      await expectUrlToThrow("http://172.31.255.255", "172.16.0.0/12");
    });

    it("should block 192.168.0.0/16", async () => {
      await expectUrlToThrow("http://192.168.0.1", "192.168.0.0/16");
      await expectUrlToThrow("http://192.168.255.255", "192.168.0.0/16");
    });
  });

  describe("Localhost and loopback addresses", () => {
    it("should block localhost hostname", async () => {
      await expectUrlToThrow("http://localhost", "localhost");
    });

    it("should block 127.0.0.1", async () => {
      await expectUrlToThrow("http://127.0.0.1", "loopback addresses");
    });

    it("should block 127.0.0.0/8 range", async () => {
      await expectUrlToThrow("http://127.1.1.1", "loopback addresses");
      await expectUrlToThrow("http://127.255.255.255", "loopback addresses");
    });

    it("should block 0.0.0.0", async () => {
      await expectUrlToThrow("http://0.0.0.0", "0.0.0.0/8");
    });

    it("should block IPv6 loopback ::1", async () => {
      await expectUrlToThrow("http://[::1]", "IPv6 loopback");
    });
  });

  describe("Link-local addresses", () => {
    it("should block entire 169.254.0.0/16 range", async () => {
      await expectUrlToThrow("http://169.254.0.1", "link-local addresses");
      await expectUrlToThrow("http://169.254.255.255", "link-local addresses");
    });

    it("should block IPv6 link-local fe80::/10", async () => {
      await expectUrlToThrow("http://[fe80::1]", "IPv6 link-local");
    });
  });

  describe("IPv6 unique local addresses", () => {
    it("should block fc00::/7", async () => {
      await expectUrlToThrow("http://[fc00::1]", "IPv6 unique local");
      await expectUrlToThrow("http://[fd00::1]", "IPv6 unique local");
    });
  });

  describe("Protocol validation", () => {
    it("should only allow HTTP and HTTPS", async () => {
      await expectUrlToPass("http://example.com");
      await expectUrlToPass("https://example.com");
    });

    it("should block file:// protocol", async () => {
      await expectUrlToThrow("file:///etc/passwd", "Protocol");
    });

    it("should block ftp:// protocol", async () => {
      await expectUrlToThrow("ftp://example.com", "Protocol");
    });

    it("should block gopher:// protocol", async () => {
      await expectUrlToThrow("gopher://example.com", "Protocol");
    });
  });

  describe("Resolved hostnames", () => {
    it("should block hostnames that resolve to loopback", async () => {
      await expectUrlToThrow("http://ssrf-repro.example", "loopback addresses");
    });

    it("should block hostnames that resolve to private IPs", async () => {
      await expectUrlToThrow("http://internal.example", "10.0.0.0/8");
    });
  });

  describe("Valid URLs", () => {
    it("should allow valid public URLs", async () => {
      await expectUrlToPass("http://example.com");
      await expectUrlToPass("https://api.example.com");
      await expectUrlToPass("https://api.example.com/webhook");
    });

    it("should allow public IP addresses", async () => {
      await expectUrlToPass("http://8.8.8.8");
      await expectUrlToPass("http://1.1.1.1");
    });
  });

  describe("Edge cases", () => {
    it("should require a URL", async () => {
      await expectUrlToThrow("", "URL is required");
    });

    it("should handle invalid URL format", async () => {
      await expectUrlToThrow("not-a-url", "Invalid URL");
    });

    it("should block large numeric hostnames that could be decimal IPs", async () => {
      // 8-10 digit numeric hostnames are likely encoded IPs
      await expectUrlToThrow("http://2852039166");
      await expectUrlToThrow("http://3232235777"); // 192.168.1.1 in decimal
    });
  });
});

describe("validateHttpReqHeaders", () => {
  describe("IMDSv2 token headers", () => {
    it("should block X-aws-ec2-metadata-token header", () => {
      expect(() =>
        validateHttpReqHeaders([
          {
            key: "X-aws-ec2-metadata-token",
            value: "some-token",
          },
        ]),
      ).toThrow("bypass cloud metadata service");
    });

    it("should block X-aws-ec2-metadata-token-ttl-seconds header", () => {
      expect(() =>
        validateHttpReqHeaders([
          {
            key: "X-aws-ec2-metadata-token-ttl-seconds",
            value: "21600",
          },
        ]),
      ).toThrow("bypass cloud metadata service");
    });

    it("should be case-insensitive", () => {
      expect(() =>
        validateHttpReqHeaders([
          {
            key: "x-AWS-ec2-METADATA-token",
            value: "some-token",
          },
        ]),
      ).toThrow("bypass cloud metadata service");
    });
  });

  describe("Google Cloud metadata headers", () => {
    it("should block Metadata-Flavor header", () => {
      expect(() =>
        validateHttpReqHeaders([
          {
            key: "Metadata-Flavor",
            value: "Google",
          },
        ]),
      ).toThrow("bypass cloud metadata service");
    });

    it("should block Metadata header", () => {
      expect(() =>
        validateHttpReqHeaders([
          {
            key: "Metadata",
            value: "true",
          },
        ]),
      ).toThrow("bypass cloud metadata service");
    });
  });

  describe("Valid headers", () => {
    it("should allow standard headers", () => {
      expect(() =>
        validateHttpReqHeaders([
          {
            key: "Content-Type",
            value: "application/json",
          },
          {
            key: "Authorization",
            value: "Bearer token",
          },
        ]),
      ).not.toThrow();
    });

    it("should allow custom application headers", () => {
      expect(() =>
        validateHttpReqHeaders([
          {
            key: "X-Custom-Header",
            value: "custom-value",
          },
        ]),
      ).not.toThrow();
    });

    it("should handle undefined headers", () => {
      expect(() => validateHttpReqHeaders(undefined)).not.toThrow();
    });

    it("should handle empty headers array", () => {
      expect(() => validateHttpReqHeaders([])).not.toThrow();
    });

    it("should skip headers without a key", () => {
      expect(() =>
        validateHttpReqHeaders([
          {
            value: "some-value",
          },
        ]),
      ).not.toThrow();
    });
  });
});

describe("validateHttpReqUrl - IPv6-mapped IPv4", () => {
  it("should block the advisory PoC for the AWS metadata token endpoint", async () => {
    await expectUrlToThrow(
      "http://[::ffff:169.254.169.254]/latest/api/token",
      "link-local addresses",
    );
  });

  it("should block IPv6-mapped IPv4 addresses for hex AWS metadata", async () => {
    await expectUrlToThrow("http://[::ffff:a9fe:a9fe]", "link-local addresses");
  });

  it("should block IPv6-mapped IPv4 loopback addresses", async () => {
    await expectUrlToThrow("http://[::ffff:127.0.0.1]", "loopback addresses");
  });

  it("should block IPv6-mapped IPv4 addresses for 10.0.0.0/8", async () => {
    await expectUrlToThrow("http://[::ffff:10.0.0.1]", "10.0.0.0/8");
  });

  it("should block IPv6-mapped IPv4 addresses for 172.16.0.0/12", async () => {
    await expectUrlToThrow("http://[::ffff:172.16.0.1]", "172.16.0.0/12");
  });

  it("should block IPv6-mapped IPv4 addresses for 192.168.0.0/16", async () => {
    await expectUrlToThrow("http://[::ffff:192.168.1.1]", "192.168.0.0/16");
  });

  it("should block the expanded IPv6-mapped IPv4 prefix as well", async () => {
    await expectUrlToThrow(
      "http://[0:0:0:0:0:ffff:169.254.169.254]",
      "link-local addresses",
    );
  });
});
