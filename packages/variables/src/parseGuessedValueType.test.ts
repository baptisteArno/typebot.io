import { describe, expect, test } from "bun:test";
import { parseGuessedValueType } from "./parseGuessedValueType";

describe("parseGuessedValueType", () => {
  test("converts numeric strings within the safe integer range to numbers", () => {
    expect(parseGuessedValueType("42")).toBe(42);
    expect(parseGuessedValueType("-42")).toBe(-42);
    expect(parseGuessedValueType("3.14")).toBe(3.14);
    expect(parseGuessedValueType(String(Number.MAX_SAFE_INTEGER))).toBe(
      Number.MAX_SAFE_INTEGER,
    );
  });

  test("keeps integers above Number.MAX_SAFE_INTEGER as strings to avoid precision loss", () => {
    // Number("12345678901234567") === 12345678901234568
    expect(parseGuessedValueType("12345678901234567")).toBe(
      "12345678901234567",
    );
    expect(parseGuessedValueType("9007199254740992")).toBe("9007199254740992");
  });

  test("keeps integers below Number.MIN_SAFE_INTEGER as strings to avoid precision loss", () => {
    expect(parseGuessedValueType("-12345678901234567")).toBe(
      "-12345678901234567",
    );
  });

  test("keeps strings starting with 0 or + untouched", () => {
    expect(parseGuessedValueType("0123")).toBe("0123");
    expect(parseGuessedValueType("+5551999999999")).toBe("+5551999999999");
    expect(parseGuessedValueType("0.5")).toBe(0.5);
  });

  test("parses boolean, null and undefined literals", () => {
    expect(parseGuessedValueType("true")).toBe(true);
    expect(parseGuessedValueType("false")).toBe(false);
    expect(parseGuessedValueType("null")).toBeNull();
    expect(parseGuessedValueType("undefined")).toBeUndefined();
  });

  test("returns non numeric strings and non string values untouched", () => {
    expect(parseGuessedValueType("hello")).toBe("hello");
    expect(parseGuessedValueType(["1", "2"])).toEqual(["1", "2"]);
    expect(parseGuessedValueType(null)).toBeNull();
    expect(parseGuessedValueType(undefined)).toBeUndefined();
  });
});
