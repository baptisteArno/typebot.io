import { describe, expect, it } from "bun:test";
import { parseUserIds } from "./parseUserIds";

describe("parseUserIds", () => {
  it("parses list variables, separators and duplicates", () => {
    expect(parseUserIds('["u-1","u-2","u-1"]')).toEqual(["u-1", "u-2"]);
    expect(parseUserIds("u-3, u-4\nu-5 u-3")).toEqual(["u-3", "u-4", "u-5"]);
  });

  it("returns an empty list when no recipient is set", () => {
    expect(parseUserIds(undefined)).toEqual([]);
  });
});
