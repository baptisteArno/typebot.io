import { describe, expect, test } from "vitest";
import { extractSecretReferences } from "./extractSecretReferences";

describe("extractSecretReferences", () => {
  test("returns empty for plain text", () => {
    expect(extractSecretReferences("hello world")).toEqual([]);
  });

  test("extracts a single reference", () => {
    expect(
      extractSecretReferences("Authorization: Bearer {{$secrets.API_KEY}}"),
    ).toEqual(["API_KEY"]);
  });

  test("extracts multiple distinct references", () => {
    expect(
      extractSecretReferences(
        "{{$secrets.STRIPE_KEY}} and {{$secrets.OPENAI_KEY}}",
      ),
    ).toEqual(["STRIPE_KEY", "OPENAI_KEY"]);
  });

  test("deduplicates repeated references", () => {
    expect(
      extractSecretReferences(
        "{{$secrets.TOKEN}}{{$secrets.TOKEN}}{{$secrets.TOKEN}}",
      ),
    ).toEqual(["TOKEN"]);
  });

  test("ignores lowercase or mixed case names", () => {
    expect(extractSecretReferences("{{$secrets.api_key}}")).toEqual([]);
    expect(extractSecretReferences("{{$secrets.ApiKey}}")).toEqual([]);
  });

  test("ignores regular variables", () => {
    expect(
      extractSecretReferences("{{name}} and {{email}} and {{$secrets.KEY}}"),
    ).toEqual(["KEY"]);
  });

  test("supports digits and underscores in name", () => {
    expect(extractSecretReferences("{{$secrets.API_V2_KEY_01}}")).toEqual([
      "API_V2_KEY_01",
    ]);
  });
});
