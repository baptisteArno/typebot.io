import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { ConditionBlock } from "./schema";

export const defaultConditionItemContent = {
  logicalOperator: LogicalOperator.AND,
} as const satisfies ConditionBlock["items"][number]["content"];
