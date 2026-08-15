import { describe, expect, it } from "bun:test";
import { getEmailDomain } from "./getEmailDomain";

describe("getEmailDomain", () => {
  it("normalizes the domain", () => {
    expect(getEmailDomain(" Guest@Example.COM ")).toBe("example.com");
  });
});
