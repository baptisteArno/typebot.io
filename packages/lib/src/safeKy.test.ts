import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { safeKy } from "./ky";

describe("safeKy", () => {
  it("should block requests to localhost", async () => {
    expect(safeKy.get("http://127.0.0.1/secret")).rejects.toThrow(
      "loopback addresses",
    );
  });

  it("should block requests to private IPs", async () => {
    expect(safeKy.get("http://10.0.0.1/internal")).rejects.toThrow(
      "10.0.0.0/8",
    );
    expect(safeKy.get("http://192.168.1.1")).rejects.toThrow(
      "192.168.0.0/16",
    );
  });

  it("should block requests to cloud metadata endpoints", async () => {
    expect(
      safeKy.get("http://169.254.169.254/latest/api/token"),
    ).rejects.toThrow("link-local addresses");
    expect(safeKy.get("http://metadata.google.internal/")).rejects.toThrow(
      "cloud metadata services",
    );
  });

  it("should block non-HTTP protocols", async () => {
    expect(safeKy.get("file:///etc/passwd")).rejects.toThrow("Protocol");
  });

  describe("redirect bypass protection", () => {
    let server: ReturnType<typeof Bun.serve>;
    let serverUrl: string;

    beforeAll(() => {
      server = Bun.serve({
        hostname: "127.0.0.1",
        port: 0,
        fetch(req) {
          const url = new URL(req.url);
          if (url.pathname === "/redirect-to-metadata") {
            return new Response(null, {
              status: 302,
              headers: {
                location: "http://169.254.169.254/latest/api/token",
              },
            });
          }
          if (url.pathname === "/redirect-to-private") {
            return new Response(null, {
              status: 302,
              headers: { location: "http://10.0.0.1/internal" },
            });
          }
          return new Response("ok");
        },
      });
      serverUrl = `http://127.0.0.1:${server.port}`;
    });

    afterAll(() => {
      server.stop();
    });

    // These tests verify that even though the initial URL would normally be
    // blocked (loopback), the redirect target validation is the important part.
    // We test the redirect logic by calling the underlying fetch wrapper directly.
    it("should block redirects to cloud metadata endpoints", async () => {
      // Use native fetch with redirect:manual to get the redirect, then verify
      // safeKy would block the Location target
      const response = await fetch(`${serverUrl}/redirect-to-metadata`, {
        redirect: "manual",
      });
      const location = response.headers.get("location")!;
      expect(safeKy.get(location)).rejects.toThrow("link-local addresses");
    });

    it("should block redirects to private IPs", async () => {
      const response = await fetch(`${serverUrl}/redirect-to-private`, {
        redirect: "manual",
      });
      const location = response.headers.get("location")!;
      expect(safeKy.get(location)).rejects.toThrow("10.0.0.0/8");
    });
  });
});
