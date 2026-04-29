import { describe, expect, it } from "bun:test";
import { validatingLookup } from "./createSafeDispatcher";

describe("validatingLookup", () => {
  const callLookup = (hostname: string) =>
    new Promise<{ address: string; family: number }>((resolve, reject) => {
      validatingLookup(hostname, { family: 4 }, (err, address, family) => {
        if (err) return reject(err);
        resolve({ address: String(address), family: Number(family) });
      });
    });

  it("should allow public hostnames", async () => {
    const result = await callLookup("example.com");
    expect(result.address).toBeDefined();
    expect(result.family).toBe(4);
  });

  it("should reject localhost (resolves to loopback)", async () => {
    expect(callLookup("localhost")).rejects.toThrow("loopback");
  });
});
