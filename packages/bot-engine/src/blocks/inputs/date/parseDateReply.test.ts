import { describe, expect, it } from "bun:test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { DateInputBlock } from "@typebot.io/blocks-inputs/date/schema";
import { parseDateReply } from "./parseDateReply";

const createBlock = (options?: DateInputBlock["options"]): DateInputBlock => ({
  id: "block1",
  type: InputBlockType.DATE,
  options,
});

describe("parseDateReply", () => {
  it("should join the start and end date with 'to' by default", () => {
    const result = parseDateReply("from 01/01/2024 to 05/01/2024", {
      ...createBlock({ isRange: true }),
    });
    expect(result.status).toBe("success");
    expect((result as { content: string }).content).toBe(
      "01/01/2024 to 05/01/2024",
    );
  });

  it("should join the start and end date with a custom separator label", () => {
    const result = parseDateReply("from 01/01/2024 to 05/01/2024", {
      ...createBlock({ isRange: true, labels: { separator: "tot" } }),
    });
    expect(result.status).toBe("success");
    expect((result as { content: string }).content).toBe(
      "01/01/2024 tot 05/01/2024",
    );
  });

  it("should not use the separator when isRange is false", () => {
    const result = parseDateReply("01/01/2024", {
      ...createBlock({ labels: { separator: "tot" } }),
    });
    expect(result.status).toBe("success");
    expect((result as { content: string }).content).toBe("01/01/2024");
  });
});
