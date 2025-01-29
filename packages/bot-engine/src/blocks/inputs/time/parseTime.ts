import { parseDate } from "chrono-node";
import type { ParsedReply } from "../../../types";

export const parseTime = (reply: string): ParsedReply => {
  const parsedDate = parseDate(reply);

  if (!parsedDate) return { status: "fail" };

  return {
    status: "success",
    reply: `${parseWithZeroPrefix(parsedDate.getHours())}:${parseWithZeroPrefix(parsedDate.getMinutes())}`,
  };
};

const parseWithZeroPrefix = (value: number) => {
  return value < 10 ? `0${value}` : value;
};
