import {
  endOfMonth,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

export const timeFilterValues = [
  "today",
  "last7Days",
  "last30Days",
  "monthToDate",
  "lastMonth",
  "yearToDate",
  "allTime",
] as const;

export type TimeFilter = (typeof timeFilterValues)[number];

export const timeFilterLabels: Record<TimeFilter, string> = {
  today: "Today",
  last7Days: "Last 7 days",
  last30Days: "Last 30 days",
  monthToDate: "Month to date",
  lastMonth: "Last month",
  yearToDate: "Year to date",
  allTime: "All time",
};

export const defaultTimeFilter = "last7Days" as const;

export const parseFromDateFromTimeFilter = (
  timeFilter: TimeFilter,
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
  timeFilter: TimeFilter,
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

export const getTimeFilterFileNameSuffix = (timeFilter?: TimeFilter) => {
  switch (timeFilter) {
    case "today":
      return "today";
    case "last7Days":
      return "last-7-days";
    case "last30Days":
      return "last-30-days";
    case "monthToDate":
      return "month-to-date";
    case "lastMonth":
      return "last-month";
    case "yearToDate":
      return "year-to-date";
    case "allTime":
    case undefined:
      return;
  }
};
