import { describe, expect, it } from "bun:test";
import { resolveFamulorApiBaseUrl } from "./resolveFamulorApiBaseUrl";

describe("resolveFamulorApiBaseUrl", () => {
  it("defaults to the Famulor platform API v1 origin", () => {
    expect(resolveFamulorApiBaseUrl(undefined)).toEqual({
      ok: true,
      apiBaseUrl: "https://app.famulor.io/api/v1",
    });
    expect(resolveFamulorApiBaseUrl("  ")).toEqual({
      ok: true,
      apiBaseUrl: "https://app.famulor.io/api/v1",
    });
  });

  it("accepts a white-label origin and appends /api/v1", () => {
    expect(resolveFamulorApiBaseUrl("https://voice.example.com/")).toEqual({
      ok: true,
      apiBaseUrl: "https://voice.example.com/api/v1",
    });
  });

  it("rejects the legacy host, insecure URLs, and URLs that already include a path", () => {
    expect(resolveFamulorApiBaseUrl("https://app.famulor.de")?.ok).toBe(false);
    expect(resolveFamulorApiBaseUrl("http://app.famulor.io")?.ok).toBe(false);
    expect(
      resolveFamulorApiBaseUrl("https://voice.example.com/api/v1")?.ok,
    ).toBe(false);
    expect(
      resolveFamulorApiBaseUrl("https://user:pass@voice.example.com")?.ok,
    ).toBe(false);
  });
});
