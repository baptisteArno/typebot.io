import {
  endOfMonth,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import type { timeFilterValues } from "../constants";

export const parseFromDateFromTimeFilter = (
  timeFilter: (typeof timeFilterValues)[number],
  userTimezone = "UTC",
): Date | null => {
  const nowInUserTimezone = utcToZonedTime(new Date(), userTimezone);

  switch (timeFilter) {
    case "today": {
      return zonedTimeToUtc(startOfDay(nowInUserTimezone), userTimezone);
    }
    case "last7Days": {
      return zonedTimeToUtc(
        subDays(startOfDay(nowInUserTimezone), 6),
        userTimezone,
      );
    }
    case "last30Days": {
      return zonedTimeToUtc(
        subDays(startOfDay(nowInUserTimezone), 29),
        userTimezone,
      );
    }
    case "lastMonth": {
      return zonedTimeToUtc(
        subMonths(startOfMonth(nowInUserTimezone), 1),
        userTimezone,
      );
    }
    case "monthToDate": {
      return zonedTimeToUtc(startOfMonth(nowInUserTimezone), userTimezone);
    }
    case "yearToDate": {
      return zonedTimeToUtc(startOfYear(nowInUserTimezone), userTimezone);
    }
    case "allTime":
      return null;
  }
};

export const parseToDateFromTimeFilter = (
  timeFilter: (typeof timeFilterValues)[number],
  userTimezone = "UTC",
): Date | null => {
  const nowInUserTimezone = utcToZonedTime(new Date(), userTimezone);

  switch (timeFilter) {
    case "lastMonth": {
      return zonedTimeToUtc(
        subMonths(endOfMonth(nowInUserTimezone), 1),
        userTimezone,
      );
    }
    case "last30Days":
    case "last7Days":
    case "today":
    case "monthToDate":
    case "yearToDate":
    case "allTime":
      return null;
  }
};
