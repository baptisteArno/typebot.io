import { defaultDateInputOptions } from "@typebot.io/blocks-inputs/date/constants";
import type { DateInputBlock } from "@typebot.io/blocks-inputs/date/schema";
import { isDefined } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import { en as chronoParser } from "chrono-node";
import { format } from "date-fns";
import type { ParsedReply } from "../../../types";

const formatOptions = {
  useAdditionalDayOfYearTokens: true,
  useAdditionalWeekYearTokens: true,
};

type ParseDateReplyOptions = {
  variables?: Variable[];
  sessionStore?: SessionStore;
};

export const parseDateReply = (
  reply: string,
  block: DateInputBlock,
  options?: ParseDateReplyOptions,
): ParsedReply => {
  const parsedDate = (
    block.options?.format || defaultDateInputOptions.format
  ).startsWith("dd")
    ? chronoParser.GB.parse(reply)
    : chronoParser.parse(reply);
  if (parsedDate.length === 0) return { status: "fail" };
  const formatString =
    block.options?.format ||
    (block.options?.hasTime
      ? defaultDateInputOptions.formatWithTime
      : defaultDateInputOptions.format);

  const detectedStartDate = parseDateWithNeutralTimezone(
    parsedDate[0].start.date(),
  );
  const startDate = format(detectedStartDate, formatString, formatOptions);

  const detectedEndDate = parsedDate[0].end?.date()
    ? parseDateWithNeutralTimezone(parsedDate[0].end?.date())
    : undefined;
  const endDate = detectedEndDate
    ? format(detectedEndDate, formatString, formatOptions)
    : undefined;

  if (block.options?.isRange && !endDate) return { status: "fail" };

  const startDateUtcMs = getUtcMsFromDate(detectedStartDate);
  const endDateUtcMs = detectedEndDate
    ? getUtcMsFromDate(detectedEndDate)
    : undefined;

  const maxUtcMs = parseLimitToUtcMs(block.options?.max, {
    isMaxBoundary: true,
    hasTime: block.options?.hasTime,
    variables: options?.variables,
    sessionStore: options?.sessionStore,
  });

  if (
    isDefined(maxUtcMs) &&
    (startDateUtcMs > maxUtcMs || (endDateUtcMs && endDateUtcMs > maxUtcMs))
  )
    return { status: "fail" };

  const minUtcMs = parseLimitToUtcMs(block.options?.min, {
    isMaxBoundary: false,
    hasTime: block.options?.hasTime,
    variables: options?.variables,
    sessionStore: options?.sessionStore,
  });

  if (
    isDefined(minUtcMs) &&
    (startDateUtcMs < minUtcMs || (endDateUtcMs && endDateUtcMs < minUtcMs))
  )
    return { status: "fail" };

  return {
    status: "success",
    content: block.options?.isRange ? `${startDate} to ${endDate}` : startDate,
  };
};

const parseDateWithNeutralTimezone = (date: Date) =>
  new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);

const getUtcMsFromDate = (date: Date): number =>
  Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );

const parseLimitToUtcMs = (
  limit: string | undefined,
  {
    isMaxBoundary,
    hasTime,
    variables,
    sessionStore,
  }: {
    isMaxBoundary: boolean;
    hasTime?: boolean;
    variables?: Variable[];
    sessionStore?: SessionStore;
  },
): number | undefined => {
  if (!limit) return;
  const parsedLimit =
    variables && sessionStore
      ? parseVariables(limit, { variables, sessionStore })
      : limit;
  if (!parsedLimit || parsedLimit.trim() === "") return;

  const dateIsoRegex =
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/;
  const matchIso = parsedLimit.match(dateIsoRegex);
  if (matchIso) {
    const year = Number.parseInt(matchIso[1], 10);
    const month = Number.parseInt(matchIso[2], 10) - 1;
    const day = Number.parseInt(matchIso[3], 10);
    const isTimeInLimit = matchIso[4] !== undefined;

    if (hasTime && isTimeInLimit) {
      const hours = Number.parseInt(matchIso[4], 10);
      const minutes = Number.parseInt(matchIso[5], 10);
      const seconds = matchIso[6] ? Number.parseInt(matchIso[6], 10) : 0;
      return Date.UTC(year, month, day, hours, minutes, seconds);
    }

    if (isMaxBoundary) {
      return Date.UTC(year, month, day, 23, 59, 59, 999);
    }
    return Date.UTC(year, month, day, 0, 0, 0, 0);
  }

  const chronoParsed = chronoParser.parse(parsedLimit);
  if (chronoParsed.length > 0) {
    const date = chronoParsed[0].start.date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    if (hasTime && chronoParsed[0].start.isCertain("hour")) {
      return Date.UTC(
        year,
        month,
        day,
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
      );
    }
    if (isMaxBoundary) {
      return Date.UTC(year, month, day, 23, 59, 59, 999);
    }
    return Date.UTC(year, month, day, 0, 0, 0, 0);
  }
};
