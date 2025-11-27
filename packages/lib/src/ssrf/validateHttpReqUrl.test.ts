import { describe, expect, it } from "bun:test";
import {
  validateHttpReqHeaders,
  validateHttpReqUrl,
} from "./validateHttpReqUrl";

describe("validateHttpReqUrl", () => {
  describe("AWS Metadata Service (IMDSv1/v2)", () => {
    it("should block standard AWS metadata IP", () => {
      expect(() => validateHttpReqUrl("http://169.254.169.254")).toThrow(
        "link-local addresses",
      );
    });

    it("should block decimal encoded AWS metadata IP", () => {
      // URL parser converts this to 169.254.169.254, caught by link-local check
      expect(() => validateHttpReqUrl("http://2852039166")).toThrow();
    });

    it("should block hexadecimal encoded AWS metadata IP", () => {
      // URL parser converts this to 169.254.169.254, caught by link-local check
      expect(() => validateHttpReqUrl("http://0xa9fea9fe")).toThrow();
    });

    it("should block octal encoded AWS metadata IP", () => {
      expect(() => validateHttpReqUrl("http://0251.0376.0251.0376")).toThrow();
    });

    it("should block with path to token endpoint", () => {
      expect(() =>
        validateHttpReqUrl("http://169.254.169.254/latest/api/token"),
      ).toThrow("link-local addresses");
    });

    it("should block with path to credentials endpoint", () => {
      expect(() =>
        validateHttpReqUrl(
          "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
        ),
      ).toThrow("link-local addresses");
    });
  });

  describe("Google Cloud Metadata Service", () => {
    it("should block metadata.google.internal hostname", () => {
      expect(() =>
        validateHttpReqUrl("http://metadata.google.internal/"),
      ).toThrow("cloud metadata services");
    });

    it("should block metadata.goog hostname", () => {
      expect(() => validateHttpReqUrl("http://metadata.goog/")).toThrow(
        "cloud metadata services",
      );
    });

    it("should block metadata hostname", () => {
      expect(() => validateHttpReqUrl("http://metadata/")).toThrow(
        "cloud metadata services",
      );
    });
  });

  describe("Azure Metadata Service", () => {
    it("should block Azure metadata endpoint (same as AWS)", () => {
      expect(() =>
        validateHttpReqUrl(
          "http://169.254.169.254/metadata/instance?api-version=2021-02-01",
        ),
      ).toThrow("link-local addresses");
    });
  });

  describe("Private IP ranges (RFC1918)", () => {
    it("should block 10.0.0.0/8", () => {
      expect(() => validateHttpReqUrl("http://10.0.0.1")).toThrow("10.0.0.0/8");
      expect(() => validateHttpReqUrl("http://10.255.255.255")).toThrow(
        "10.0.0.0/8",
      );
    });

    it("should block 172.16.0.0/12", () => {
      expect(() => validateHttpReqUrl("http://172.16.0.1")).toThrow(
        "172.16.0.0/12",
      );
      expect(() => validateHttpReqUrl("http://172.31.255.255")).toThrow(
        "172.16.0.0/12",
      );
    });

    it("should block 192.168.0.0/16", () => {
      expect(() => validateHttpReqUrl("http://192.168.0.1")).toThrow(
        "192.168.0.0/16",
      );
      expect(() => validateHttpReqUrl("http://192.168.255.255")).toThrow(
        "192.168.0.0/16",
      );
    });
  });

  describe("Localhost and loopback addresses", () => {
    it("should block localhost hostname", () => {
      expect(() => validateHttpReqUrl("http://localhost")).toThrow("localhost");
    });

    it("should block 127.0.0.1", () => {
      expect(() => validateHttpReqUrl("http://127.0.0.1")).toThrow(
        "loopback addresses",
      );
    });

    it("should block 127.0.0.0/8 range", () => {
      expect(() => validateHttpReqUrl("http://127.1.1.1")).toThrow(
        "loopback addresses",
      );
      expect(() => validateHttpReqUrl("http://127.255.255.255")).toThrow(
        "loopback addresses",
      );
    });

    it("should block 0.0.0.0", () => {
      expect(() => validateHttpReqUrl("http://0.0.0.0")).toThrow("0.0.0.0/8");
    });

    it("should block IPv6 loopback ::1", () => {
      expect(() => validateHttpReqUrl("http://[::1]")).toThrow("IPv6 loopback");
    });
  });

  describe("Link-local addresses", () => {
    it("should block entire 169.254.0.0/16 range", () => {
      expect(() => validateHttpReqUrl("http://169.254.0.1")).toThrow(
        "link-local addresses",
      );
      expect(() => validateHttpReqUrl("http://169.254.255.255")).toThrow(
        "link-local addresses",
      );
    });

    it("should block IPv6 link-local fe80::/10", () => {
      expect(() => validateHttpReqUrl("http://[fe80::1]")).toThrow(
        "IPv6 link-local",
      );
    });
  });

  describe("IPv6 unique local addresses", () => {
    it("should block fc00::/7", () => {
      expect(() => validateHttpReqUrl("http://[fc00::1]")).toThrow(
        "IPv6 unique local",
      );
      expect(() => validateHttpReqUrl("http://[fd00::1]")).toThrow(
        "IPv6 unique local",
      );
    });
  });

  describe("Protocol validation", () => {
    it("should only allow HTTP and HTTPS", () => {
      expect(() => validateHttpReqUrl("http://example.com")).not.toThrow();
      expect(() => validateHttpReqUrl("https://example.com")).not.toThrow();
    });

    it("should block file:// protocol", () => {
      expect(() => validateHttpReqUrl("file:///etc/passwd")).toThrow(
        "Protocol",
      );
    });

    it("should block ftp:// protocol", () => {
      expect(() => validateHttpReqUrl("ftp://example.com")).toThrow("Protocol");
    });

    it("should block gopher:// protocol", () => {
      expect(() => validateHttpReqUrl("gopher://example.com")).toThrow(
        "Protocol",
      );
    });
  });

  describe("Valid URLs", () => {
    it("should allow valid public URLs", () => {
      expect(() => validateHttpReqUrl("http://example.com")).not.toThrow();
      expect(() => validateHttpReqUrl("https://api.example.com")).not.toThrow();
      expect(() =>
        validateHttpReqUrl("https://api.example.com/webhook"),
      ).not.toThrow();
    });

    it("should allow public IP addresses", () => {
      expect(() => validateHttpReqUrl("http://8.8.8.8")).not.toThrow();
      expect(() => validateHttpReqUrl("http://1.1.1.1")).not.toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should require a URL", () => {
      expect(() => validateHttpReqUrl("")).toThrow("URL is required");
    });

    it("should handle invalid URL format", () => {
      expect(() => validateHttpReqUrl("not-a-url")).toThrow("Invalid URL");
    });

    it("should block large numeric hostnames that could be decimal IPs", () => {
      // 8-10 digit numeric hostnames are likely encoded IPs
      expect(() => validateHttpReqUrl("http://2852039166")).toThrow();
      expect(() => validateHttpReqUrl("http://3232235777")).toThrow(); // 192.168.1.1 in decimal
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
  it("should block IPv6-mapped IPv4 addresses for AWS metadata", () => {
    expect(() => validateHttpReqUrl("http://[::ffff:169.254.169.254]")).toThrow(
      "link-local addresses",
    );
  });

  it("should block IPv6-mapped IPv4 addresses for hex AWS metadata", () => {
    expect(() => validateHttpReqUrl("http://[::ffff:a9fe:a9fe]")).toThrow(
      "link-local addresses",
    );
  });

  it("should block IPv6-mapped IPv4 addresses for private ranges", () => {
    expect(() => validateHttpReqUrl("http://[::ffff:10.0.0.1]")).toThrow(
      "10.0.0.0/8",
    );
  });
});
