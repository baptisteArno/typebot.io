import { describe, expect, it } from "bun:test";
import { parseColumnsOrder } from "./parseColumnsOrder";
import type { ResultHeaderCell } from "./schemas/results";

const resultHeader = [
  {
    id: "createdAt",
    label: "Created at",
  },
  {
    id: "email",
    label: "Email",
  },
  {
    id: "name",
    label: "Name",
  },
] satisfies ResultHeaderCell[];

describe("parseColumnsOrder", () => {
  it("returns the default order when no order is saved", () => {
    expect(parseColumnsOrder(undefined, resultHeader)).toEqual([
      "select",
      "createdAt",
      "email",
      "name",
      "logs",
    ]);
  });

  it("keeps the saved order and appends missing result headers", () => {
    expect(parseColumnsOrder(["email", "createdAt"], resultHeader)).toEqual([
      "select",
      "email",
      "createdAt",
      "name",
      "logs",
    ]);
  });

  it("resets orders saved with the old control column format", () => {
    expect(
      parseColumnsOrder(["select", "email", "logs"], resultHeader),
    ).toEqual(["select", "createdAt", "email", "name", "logs"]);
  });
});
