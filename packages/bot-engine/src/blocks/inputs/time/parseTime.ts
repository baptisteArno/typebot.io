import { defaultTimeInputOptions } from "@typebot.io/blocks-inputs/time/constants";
import type { TimeInputOptions } from "@typebot.io/blocks-inputs/time/schema";
import { parseDate } from "chrono-node";
import { format } from "date-fns";
import type { ParsedReply } from "../../../types";

export const parseTime = (
  reply: string,
  options?: TimeInputOptions,
): ParsedReply => {
  const parsedDate = parseDate(reply);

  if (!parsedDate) return { status: "fail" };

  return {
    status: "success",
    content: format(
      parsedDate,
      options?.format || defaultTimeInputOptions.format,
    ),
  };
};
