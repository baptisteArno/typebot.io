import { expect, it } from "bun:test";
import { option } from "./index";

it("loads unselected discriminated options from stored JSON", () => {
  const optionsSchema = option.object({
    selection: option.discriminatedUnion("type", [
      option.object({ type: option.literal("custom"), value: option.string }),
    ]),
  });

  expect(optionsSchema.parse({ selection: {} })).toEqual({ selection: {} });
  expect(
    optionsSchema.parse({ selection: { type: "custom", value: "hello" } }),
  ).toEqual({ selection: { type: "custom", value: "hello" } });
  expect(
    optionsSchema.safeParse({ selection: { type: "unknown" } }).success,
  ).toBe(false);
});
