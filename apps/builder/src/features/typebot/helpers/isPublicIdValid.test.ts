import { describe, expect, it } from "bun:test";
import { isPublicIdValid, PUBLIC_ID_MAX_LENGTH } from "./isPublicIdValid";

describe("isPublicIdValid", () => {
  it.each([
    "",
    "typebot",
    "typebot-123",
    "typebot-",
  ])("accepts the existing %p format", (publicId) => {
    expect(isPublicIdValid(publicId)).toBe(true);
  });

  it.each([
    "-typebot",
    "typebot--123",
    "Typebot",
    "typebot.123",
  ])("rejects the invalid %p format", (publicId) => {
    expect(isPublicIdValid(publicId)).toBe(false);
  });

  it("rejects the CodeQL backtracking payload", () => {
    const publicId = `0-${"00-".repeat(84)}.`;

    expect(publicId).toHaveLength(PUBLIC_ID_MAX_LENGTH);
    expect(isPublicIdValid(publicId)).toBe(false);
  });

  it("accepts an identifier at the maximum length", () => {
    expect(isPublicIdValid("a".repeat(PUBLIC_ID_MAX_LENGTH))).toBe(true);
  });

  it("rejects an identifier over the maximum length", () => {
    expect(isPublicIdValid("a".repeat(PUBLIC_ID_MAX_LENGTH + 1))).toBe(false);
  });
});
