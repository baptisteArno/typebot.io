import { describe, expect, it } from "bun:test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { DateInputBlock } from "@typebot.io/blocks-inputs/date/schema";
import { SessionStore } from "@typebot.io/runtime-session-store";
import { validateAndParseInputMessage } from "../../../validateAndParseInputMessage";
import { parseDateReply } from "./parseDateReply";

const createBlock = (options?: DateInputBlock["options"]): DateInputBlock => ({
  id: "block1",
  type: InputBlockType.DATE,
  options,
});

describe("parseDateReply", () => {
  it("joins the start and end date with 'to' by default", () => {
    expect(
      parseDateReply(
        "from 01/01/2024 to 05/01/2024",
        createBlock({ isRange: true }),
      ),
    ).toEqual({
      status: "success",
      content: "01/01/2024 to 05/01/2024",
    });
  });

  it("joins the start and end date with a custom separator label", () => {
    expect(
      parseDateReply(
        "from 01/01/2024 to 05/01/2024",
        createBlock({ isRange: true, labels: { separator: "tot" } }),
      ),
    ).toEqual({
      status: "success",
      content: "01/01/2024 tot 05/01/2024",
    });
  });

  it("does not use the separator when isRange is false", () => {
    expect(
      parseDateReply(
        "01/01/2024",
        createBlock({ labels: { separator: "tot" } }),
      ),
    ).toEqual({
      status: "success",
      content: "01/01/2024",
    });
  });

  it("resolves a separator variable before formatting the reply", () => {
    expect(
      validateAndParseInputMessage(
        { type: "text", text: "from 01/01/2024 to 05/01/2024" },
        {
          block: createBlock({
            isRange: true,
            labels: { separator: "{{Date separator}}" },
          }),
          variables: [
            {
              id: "date-separator",
              name: "Date separator",
              value: "tot",
            },
          ],
          sessionStore: new SessionStore(),
        },
      ),
    ).toEqual({
      status: "success",
      content: "01/01/2024 tot 05/01/2024",
    });
  });
});
