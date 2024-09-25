import { defaultDateInputOptions } from "@typebot.io/blocks-inputs/date/constants";
import type { DateInputBlock } from "@typebot.io/blocks-inputs/date/schema";
import { isDefined } from "@typebot.io/lib/utils";
import { en as chronoParser } from "chrono-node";
import { format } from "date-fns";
import type { ParsedReply } from "../../../types";

export const parseDateReply = (
  reply: string,
  block: DateInputBlock,
): ParsedReply => {
  const parsedDate = (
    block.options?.format ?? defaultDateInputOptions.format
  ).startsWith("dd")
    ? chronoParser.GB.parse(reply)
    : chronoParser.parse(reply);
  if (parsedDate.length === 0) return { status: "fail" };
  const formatString =
    block.options?.format ??
    (block.options?.hasTime
      ? defaultDateInputOptions.formatWithTime
      : defaultDateInputOptions.format);

  const detectedStartDate = parseDateWithNeutralTimezone(
    parsedDate[0].start.date(),
  );
  const startDate = format(detectedStartDate, formatString);

  const detectedEndDate = parsedDate[0].end?.date()
    ? parseDateWithNeutralTimezone(parsedDate[0].end?.date())
    : undefined;
  const endDate = detectedEndDate
    ? format(detectedEndDate, formatString)
    : undefined;

  if (block.options?.isRange && !endDate) return { status: "fail" };

  const max = block.options?.max;
  if (
    isDefined(max) &&
    (detectedStartDate > new Date(max) ||
      (detectedEndDate && detectedEndDate > new Date(max)))
  )
    return { status: "fail" };

  const min = block.options?.min;
  if (
    isDefined(min) &&
    (detectedStartDate < new Date(min) ||
      (detectedEndDate && detectedEndDate < new Date(min)))
  )
    return { status: "fail" };

  return {
    status: "success",
    reply: block.options?.isRange ? `${startDate} to ${endDate}` : startDate,
  };
};

const parseDateWithNeutralTimezone = (date: Date) =>
  new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
