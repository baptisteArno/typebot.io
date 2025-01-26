// parse time to 12 or 24 hour format

import type { TimeInputBlock } from "@typebot.io/blocks-inputs/time/schema";
import { defaultTimeInputOptions } from "../../../../../blocks/inputs/src/time/constants";
import type { ParsedReply } from "../../../types";

export const parseTime = (
  reply: string,
  block: TimeInputBlock,
): ParsedReply => {
  const twentyFourHourTime =
    block.options?.twentyFourHourTime ??
    defaultTimeInputOptions.twentyFourHourTime;

  if (reply.length === 0) return { status: "fail" };

  if (twentyFourHourTime) {
    return { status: "success", reply: reply };
  }

  const [hours, mins] = reply.split(":");
  let ampm = "AM";

  let hoursInt = Number(hours);

  if (hoursInt === 0) {
    hoursInt = 12;
    ampm = "AM";
  } else if (hoursInt === 12) {
    ampm = "PM";
  } else if (hoursInt > 12) {
    hoursInt = hoursInt - 12;
    ampm = "PM";
  }

  const time = `${hoursInt}:${mins} ${ampm}`;

  return { status: "success", reply: time };
};
