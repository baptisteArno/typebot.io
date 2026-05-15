import { describe, expect, test } from "vitest";
import {
  assertNoSecretReferences,
  SecretReferenceNotAllowedError,
} from "./assertNoSecretReferences";

describe("assertNoSecretReferences", () => {
  test("does not throw for plain text", () => {
    expect(() =>
      assertNoSecretReferences({ input: "hello", context: "text bubble" }),
    ).not.toThrow();
  });

  test("does not throw for regular variable references", () => {
    expect(() =>
      assertNoSecretReferences({
        input: "Hello {{name}}",
        context: "text bubble",
      }),
    ).not.toThrow();
  });

  test("throws SecretReferenceNotAllowedError with the offending references", () => {
    try {
      assertNoSecretReferences({
        input: "{{$secrets.STRIPE_KEY}} in a text bubble",
        context: "text bubble",
      });
      throw new Error("Expected assertNoSecretReferences to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(SecretReferenceNotAllowedError);
      if (error instanceof SecretReferenceNotAllowedError) {
        expect(error.context).toBe("text bubble");
        expect(error.references).toEqual(["STRIPE_KEY"]);
      }
    }
  });
});
