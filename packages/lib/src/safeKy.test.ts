import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { env } from "@typebot.io/env";
import { safeKy } from "./ky";

const isDevelopment = env.NODE_ENV === "development";

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

  // These tests require NODE_ENV=development so that localhost is allowed as
  // the initial URL, letting us verify the redirect-following logic end-to-end.
  describe.if(isDevelopment)("redirect bypass protection", () => {
    let server: ReturnType<typeof Bun.serve>;
    let serverUrl: string;

    beforeAll(() => {
      server = Bun.serve({
        hostname: "localhost",
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
          if (url.pathname === "/redirect-chain") {
            return new Response(null, {
              status: 302,
              headers: {
                location: `http://localhost:${server.port}/redirect-to-metadata`,
              },
            });
          }
          if (url.pathname === "/ok") {
            return new Response(JSON.stringify({ status: "ok" }), {
              headers: { "content-type": "application/json" },
            });
          }
          return new Response("ok");
        },
      });
      serverUrl = `http://localhost:${server.port}`;
    });

    afterAll(() => {
      server.stop();
    });

    it("should block redirects to cloud metadata endpoints", async () => {
      expect(safeKy.get(`${serverUrl}/redirect-to-metadata`)).rejects.toThrow(
        "link-local addresses",
      );
    });

    it("should block redirects to private IPs", async () => {
      expect(safeKy.get(`${serverUrl}/redirect-to-private`)).rejects.toThrow(
        "10.0.0.0/8",
      );
    });

    it("should block chained redirects to private IPs", async () => {
      expect(safeKy.get(`${serverUrl}/redirect-chain`)).rejects.toThrow(
        "link-local addresses",
      );
    });

    it("should allow redirects to safe destinations", async () => {
      const response = await safeKy.get(`${serverUrl}/ok`);
      expect(response.status).toBe(200);
    });
  });
});
