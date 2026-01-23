import { describe, expect, it } from "bun:test";
import { filterSuppressedRecipients } from "./suppressedEmails";

describe("filterSuppressedRecipients", () => {
  it("filters suppressed recipients from comma-separated strings", () => {
    const result = filterSuppressedRecipients(
      "Alice <a@example.com>, b@example.com, c@example.com",
      ["b@example.com"],
    );

    expect(result).toBe("Alice <a@example.com>, c@example.com");
  });

  it("filters suppressed recipients from arrays", () => {
    const result = filterSuppressedRecipients(
      [
        "a@example.com",
        { name: "Bee", address: "b@example.com" },
        "c@example.com",
      ],
      ["b@example.com", "c@example.com"],
    );

    expect(result).toEqual(["a@example.com"]);
  });

  it("returns undefined when all recipients are suppressed", () => {
    const result = filterSuppressedRecipients("a@example.com, b@example.com", [
      "a@example.com",
      "b@example.com",
    ]);

    expect(result).toBeUndefined();
  });

  it("filters address objects with multiple emails", () => {
    const result = filterSuppressedRecipients(
      [{ name: "Group", address: "a@example.com, b@example.com" }],
      ["b@example.com"],
    );

    expect(result).toEqual([{ name: "Group", address: "a@example.com" }]);
  });
});
