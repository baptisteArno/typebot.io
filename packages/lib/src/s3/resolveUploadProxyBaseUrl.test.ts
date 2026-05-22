import { describe, expect, it } from "bun:test";
import { resolveUploadProxyBaseUrl } from "./resolveUploadProxyBaseUrl";

describe("resolveUploadProxyBaseUrl", () => {
  it("uses the matching configured public URL when the request origin is public", () => {
    expect(
      resolveUploadProxyBaseUrl({
        publicBaseUrls: [
          "https://viewer.example.com",
          "https://bot.example.com",
        ],
        fallbackBaseUrl: "https://builder.example.com",
        requestOrigin: "https://bot.example.com",
      }),
    ).toBe("https://bot.example.com");
  });

  it("ignores an internal request origin and uses the first configured public URL", () => {
    expect(
      resolveUploadProxyBaseUrl({
        publicBaseUrls: ["https://bot.example.com"],
        fallbackBaseUrl: "https://builder.example.com",
        requestOrigin: "https://2e862faf612f:3000",
      }),
    ).toBe("https://bot.example.com");
  });

  it("falls back when no configured public URL is available", () => {
    expect(
      resolveUploadProxyBaseUrl({
        publicBaseUrls: [],
        fallbackBaseUrl: "https://builder.example.com",
      }),
    ).toBe("https://builder.example.com");
  });
});
