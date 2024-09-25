import { z } from "@typebot.io/zod";
import { ComparisonOperators, LogicalOperator } from "./constants";

const comparisonSchema = z.object({
  id: z.string(),
  variableId: z.string().optional(),
  comparisonOperator: z.nativeEnum(ComparisonOperators).optional(),
  value: z.string().optional(),
});
export type Comparison = z.infer<typeof comparisonSchema>;

export const conditionSchema = z.object({
  logicalOperator: z.nativeEnum(LogicalOperator).optional(),
  comparisons: z.array(comparisonSchema).optional(),
});
export type Condition = z.infer<typeof conditionSchema>;
