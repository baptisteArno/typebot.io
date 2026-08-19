import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { DateInputBlock } from "@typebot.io/blocks-inputs/date/schema";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { Variable } from "@typebot.io/variables/schemas";
import { describe, expect, it } from "vitest";
import { parseDateReply } from "./parseDateReply";

const createDateBlock = (
  options?: DateInputBlock["options"],
): DateInputBlock => ({
  id: "block-1",
  type: InputBlockType.DATE,
  options,
});

describe("parseDateReply", () => {
  it("parses valid date replies", () => {
    const block = createDateBlock();
    const result = parseDateReply("2024-05-05", block);
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.content).toBe("2024-05-05");
    }
  });

  it("parses valid datetime replies when hasTime is enabled", () => {
    const block = createDateBlock({ hasTime: true });
    const result = parseDateReply("2024-05-05 14:30", block);
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.content).toBe("2024-05-05 14:30");
    }
  });

  it("handles date range validation", () => {
    const rangeBlock = createDateBlock({ isRange: true });
    const singleResult = parseDateReply("2024-05-01", rangeBlock);
    expect(singleResult.status).toBe("fail");

    const validRangeResult = parseDateReply(
      "2024-05-01 to 2024-05-10",
      rangeBlock,
    );
    expect(validRangeResult.status).toBe("success");
  });

  it("validates exact-date maximum boundary for date-only inputs", () => {
    const block = createDateBlock({ max: "2024-05-10" });
    const exactMaxResult = parseDateReply("2024-05-10", block);
    expect(exactMaxResult.status).toBe("success");

    const outOfBoundsResult = parseDateReply("2024-05-11", block);
    expect(outOfBoundsResult.status).toBe("fail");
  });

  it("validates datetime min and max boundaries accurately", () => {
    const block = createDateBlock({
      hasTime: true,
      min: "2024-05-01T10:00",
      max: "2024-05-10T18:00",
    });

    expect(parseDateReply("2024-05-01 09:00", block).status).toBe("fail");
    expect(parseDateReply("2024-05-01 10:00", block).status).toBe("success");
    expect(parseDateReply("2024-05-05 14:00", block).status).toBe("success");
    expect(parseDateReply("2024-05-10 18:00", block).status).toBe("success");
    expect(parseDateReply("2024-05-10 18:01", block).status).toBe("fail");
  });

  it("resolves variable-backed min and max limits", () => {
    const block = createDateBlock({
      hasTime: true,
      min: "{{minDate}}",
      max: "{{maxDate}}",
    });

    const variables: Variable[] = [
      { id: "var1", name: "minDate", value: "2024-05-01T10:00" },
      { id: "var2", name: "maxDate", value: "2024-05-10T18:00" },
    ];
    const sessionStore = {} as SessionStore;

    expect(
      parseDateReply("2024-05-01 09:00", block, { variables, sessionStore })
        .status,
    ).toBe("fail");
    expect(
      parseDateReply("2024-05-01 10:00", block, { variables, sessionStore })
        .status,
    ).toBe("success");
    expect(
      parseDateReply("2024-05-10 18:05", block, { variables, sessionStore })
        .status,
    ).toBe("fail");
  });

  describe("Timezone independence across UTC, Europe/Paris, and America/Los_Angeles", () => {
    const timezones = ["UTC", "Europe/Paris", "America/Los_Angeles"];

    timezones.forEach((timezone) => {
      it(`evaluates date & time limits identically in ${timezone}`, () => {
        const originalTz = process.env.TZ;
        process.env.TZ = timezone;

        try {
          const block = createDateBlock({
            hasTime: true,
            min: "2024-05-01T10:00",
            max: "2024-05-10T18:00",
          });

          // 09:00 must fail 10:00 minimum check regardless of server timezone
          expect(parseDateReply("2024-05-01 09:00", block).status).toBe(
            "fail",
          );

          // 10:00 exact minimum must pass
          expect(parseDateReply("2024-05-01 10:00", block).status).toBe(
            "success",
          );

          // 14:00 in-range must pass
          expect(parseDateReply("2024-05-05 14:00", block).status).toBe(
            "success",
          );

          // 18:00 exact maximum must pass
          expect(parseDateReply("2024-05-10 18:00", block).status).toBe(
            "success",
          );

          // 18:01 must fail maximum check regardless of server timezone
          expect(parseDateReply("2024-05-10 18:01", block).status).toBe(
            "fail",
          );
        } finally {
          process.env.TZ = originalTz;
        }
      });
    });
  });
});
