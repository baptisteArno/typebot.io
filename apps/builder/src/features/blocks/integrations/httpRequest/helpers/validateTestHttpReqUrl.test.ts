import { describe, expect, it } from "vitest";
import {
  validateTestHttpReqHeaders,
  validateTestHttpReqUrl,
} from "./validateTestHttpReqUrl";

describe("validateTestHttpReqUrl", () => {
  describe("AWS Metadata Service (IMDSv1/v2)", () => {
    it("should block standard AWS metadata IP", () => {
      expect(() => validateTestHttpReqUrl("http://169.254.169.254")).toThrow(
        "link-local addresses",
      );
    });

    it("should block decimal encoded AWS metadata IP", () => {
      // URL parser converts this to 169.254.169.254, caught by link-local check
      expect(() => validateTestHttpReqUrl("http://2852039166")).toThrow();
    });

    it("should block hexadecimal encoded AWS metadata IP", () => {
      // URL parser converts this to 169.254.169.254, caught by link-local check
      expect(() => validateTestHttpReqUrl("http://0xa9fea9fe")).toThrow();
    });

    it("should block octal encoded AWS metadata IP", () => {
      expect(() =>
        validateTestHttpReqUrl("http://0251.0376.0251.0376"),
      ).toThrow();
    });

    it("should block with path to token endpoint", () => {
      expect(() =>
        validateTestHttpReqUrl("http://169.254.169.254/latest/api/token"),
      ).toThrow("link-local addresses");
    });

    it("should block with path to credentials endpoint", () => {
      expect(() =>
        validateTestHttpReqUrl(
          "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
        ),
      ).toThrow("link-local addresses");
    });
  });

  describe("Google Cloud Metadata Service", () => {
    it("should block metadata.google.internal hostname", () => {
      expect(() =>
        validateTestHttpReqUrl("http://metadata.google.internal/"),
      ).toThrow("cloud metadata services");
    });

    it("should block metadata.goog hostname", () => {
      expect(() => validateTestHttpReqUrl("http://metadata.goog/")).toThrow(
        "cloud metadata services",
      );
    });

    it("should block metadata hostname", () => {
      expect(() => validateTestHttpReqUrl("http://metadata/")).toThrow(
        "cloud metadata services",
      );
    });
  });

  describe("Azure Metadata Service", () => {
    it("should block Azure metadata endpoint (same as AWS)", () => {
      expect(() =>
        validateTestHttpReqUrl(
          "http://169.254.169.254/metadata/instance?api-version=2021-02-01",
        ),
      ).toThrow("link-local addresses");
    });
  });

  describe("Private IP ranges (RFC1918)", () => {
    it("should block 10.0.0.0/8", () => {
      expect(() => validateTestHttpReqUrl("http://10.0.0.1")).toThrow(
        "10.0.0.0/8",
      );
      expect(() => validateTestHttpReqUrl("http://10.255.255.255")).toThrow(
        "10.0.0.0/8",
      );
    });

    it("should block 172.16.0.0/12", () => {
      expect(() => validateTestHttpReqUrl("http://172.16.0.1")).toThrow(
        "172.16.0.0/12",
      );
      expect(() => validateTestHttpReqUrl("http://172.31.255.255")).toThrow(
        "172.16.0.0/12",
      );
    });

    it("should block 192.168.0.0/16", () => {
      expect(() => validateTestHttpReqUrl("http://192.168.0.1")).toThrow(
        "192.168.0.0/16",
      );
      expect(() => validateTestHttpReqUrl("http://192.168.255.255")).toThrow(
        "192.168.0.0/16",
      );
    });
  });

  describe("Localhost and loopback addresses", () => {
    it("should block localhost hostname", () => {
      expect(() => validateTestHttpReqUrl("http://localhost")).toThrow(
        "localhost",
      );
    });

    it("should block 127.0.0.1", () => {
      expect(() => validateTestHttpReqUrl("http://127.0.0.1")).toThrow(
        "loopback addresses",
      );
    });

    it("should block 127.0.0.0/8 range", () => {
      expect(() => validateTestHttpReqUrl("http://127.1.1.1")).toThrow(
        "loopback addresses",
      );
      expect(() => validateTestHttpReqUrl("http://127.255.255.255")).toThrow(
        "loopback addresses",
      );
    });

    it("should block 0.0.0.0", () => {
      expect(() => validateTestHttpReqUrl("http://0.0.0.0")).toThrow(
        "0.0.0.0/8",
      );
    });

    it("should block IPv6 loopback ::1", () => {
      expect(() => validateTestHttpReqUrl("http://[::1]")).toThrow(
        "IPv6 loopback",
      );
    });
  });

  describe("Link-local addresses", () => {
    it("should block entire 169.254.0.0/16 range", () => {
      expect(() => validateTestHttpReqUrl("http://169.254.0.1")).toThrow(
        "link-local addresses",
      );
      expect(() => validateTestHttpReqUrl("http://169.254.255.255")).toThrow(
        "link-local addresses",
      );
    });

    it("should block IPv6 link-local fe80::/10", () => {
      expect(() => validateTestHttpReqUrl("http://[fe80::1]")).toThrow(
        "IPv6 link-local",
      );
    });
  });

  describe("IPv6 unique local addresses", () => {
    it("should block fc00::/7", () => {
      expect(() => validateTestHttpReqUrl("http://[fc00::1]")).toThrow(
        "IPv6 unique local",
      );
      expect(() => validateTestHttpReqUrl("http://[fd00::1]")).toThrow(
        "IPv6 unique local",
      );
    });
  });

  describe("Protocol validation", () => {
    it("should only allow HTTP and HTTPS", () => {
      expect(() => validateTestHttpReqUrl("http://example.com")).not.toThrow();
      expect(() => validateTestHttpReqUrl("https://example.com")).not.toThrow();
    });

    it("should block file:// protocol", () => {
      expect(() => validateTestHttpReqUrl("file:///etc/passwd")).toThrow(
        "Protocol",
      );
    });

    it("should block ftp:// protocol", () => {
      expect(() => validateTestHttpReqUrl("ftp://example.com")).toThrow(
        "Protocol",
      );
    });

    it("should block gopher:// protocol", () => {
      expect(() => validateTestHttpReqUrl("gopher://example.com")).toThrow(
        "Protocol",
      );
    });
  });

  describe("Valid URLs", () => {
    it("should allow valid public URLs", () => {
      expect(() => validateTestHttpReqUrl("http://example.com")).not.toThrow();
      expect(() =>
        validateTestHttpReqUrl("https://api.example.com"),
      ).not.toThrow();
      expect(() =>
        validateTestHttpReqUrl("https://api.example.com/webhook"),
      ).not.toThrow();
    });

    it("should allow public IP addresses", () => {
      expect(() => validateTestHttpReqUrl("http://8.8.8.8")).not.toThrow();
      expect(() => validateTestHttpReqUrl("http://1.1.1.1")).not.toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should require a URL", () => {
      expect(() => validateTestHttpReqUrl("")).toThrow("URL is required");
    });

    it("should handle invalid URL format", () => {
      expect(() => validateTestHttpReqUrl("not-a-url")).toThrow("Invalid URL");
    });

    it("should block large numeric hostnames that could be decimal IPs", () => {
      // 8-10 digit numeric hostnames are likely encoded IPs
      expect(() => validateTestHttpReqUrl("http://2852039166")).toThrow();
      expect(() => validateTestHttpReqUrl("http://3232235777")).toThrow(); // 192.168.1.1 in decimal
    });
  });
});

describe("validateTestHttpReqHeaders", () => {
  describe("IMDSv2 token headers", () => {
    it("should block X-aws-ec2-metadata-token header", () => {
      expect(() =>
        validateTestHttpReqHeaders([
          {
            id: "1",
            key: "X-aws-ec2-metadata-token",
            value: "some-token",
          },
        ]),
      ).toThrow("bypass cloud metadata service");
    });

    it("should block X-aws-ec2-metadata-token-ttl-seconds header", () => {
      expect(() =>
        validateTestHttpReqHeaders([
          {
            id: "1",
            key: "X-aws-ec2-metadata-token-ttl-seconds",
            value: "21600",
          },
        ]),
      ).toThrow("bypass cloud metadata service");
    });

    it("should be case-insensitive", () => {
      expect(() =>
        validateTestHttpReqHeaders([
          {
            id: "1",
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
        validateTestHttpReqHeaders([
          {
            id: "1",
            key: "Metadata-Flavor",
            value: "Google",
          },
        ]),
      ).toThrow("bypass cloud metadata service");
    });

    it("should block Metadata header", () => {
      expect(() =>
        validateTestHttpReqHeaders([
          {
            id: "1",
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
        validateTestHttpReqHeaders([
          {
            id: "1",
            key: "Content-Type",
            value: "application/json",
          },
          {
            id: "2",
            key: "Authorization",
            value: "Bearer token",
          },
        ]),
      ).not.toThrow();
    });

    it("should allow custom application headers", () => {
      expect(() =>
        validateTestHttpReqHeaders([
          {
            id: "1",
            key: "X-Custom-Header",
            value: "custom-value",
          },
        ]),
      ).not.toThrow();
    });

    it("should handle undefined headers", () => {
      expect(() => validateTestHttpReqHeaders(undefined)).not.toThrow();
    });

    it("should handle empty headers array", () => {
      expect(() => validateTestHttpReqHeaders([])).not.toThrow();
    });

    it("should skip headers without a key", () => {
      expect(() =>
        validateTestHttpReqHeaders([
          {
            id: "1",
            value: "some-value",
          },
        ]),
      ).not.toThrow();
    });
  });
});
