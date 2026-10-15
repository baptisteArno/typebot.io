import { describe, expect, it } from "bun:test";
import { parseUserIds } from "./parseUserIds";

describe("parseUserIds", () => {
  it("flattens list variables, separators and duplicates", () => {
    expect(
      parseUserIds([
        '["u-1","u-2"]',
        "u-3, u-4",
        "u-5\nu-6",
        "u-1",
        undefined,
        "  ",
      ]),
    ).toEqual(["u-1", "u-2", "u-3", "u-4", "u-5", "u-6"]);
  });

  it("returns an empty list when no recipient is set", () => {
    expect(parseUserIds(undefined)).toEqual([]);
  });
});
