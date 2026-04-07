import { describe, expect, it } from "bun:test";
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
    expect(safeKy.get("http://169.254.169.254/latest/api/token")).rejects.toThrow(
      "link-local addresses",
    );
    expect(
      safeKy.get("http://metadata.google.internal/"),
    ).rejects.toThrow("cloud metadata services");
  });

  it("should block non-HTTP protocols", async () => {
    expect(safeKy.get("file:///etc/passwd")).rejects.toThrow("Protocol");
  });
});
