import type { Prisma } from "@typebot.io/prisma/types";
import { z } from "@typebot.io/zod";

export const listVariableValue = z.array(z.string().nullable());

const baseVariableSchema = z.object({
  id: z.string(),
  name: z.string(),
  isSessionVariable: z.boolean().optional(),
});

export const variableSchema = baseVariableSchema.extend({
  value: z.string().or(listVariableValue).nullish(),
});
export type Variable = z.infer<typeof variableSchema>;

/**
 * Variable when retrieved from the database
 */
export const variableWithValueSchema = baseVariableSchema.extend({
  value: z.string().or(listVariableValue),
});
export type VariableWithValue = z.infer<typeof variableWithValueSchema>;

/**
 * Variable when computed or retrieved from a block
 */
const variableWithUnknowValueSchema = baseVariableSchema.extend({
  value: z.unknown(),
});
export type VariableWithUnknowValue = z.infer<
  typeof variableWithUnknowValueSchema
>;

export const variableStringSchema = z.custom<`{{${string}}}`>((val) =>
  /^{{.+}}$/g.test(val as string),
);
export type VariableString = z.infer<typeof variableStringSchema>;

export const setVariableHistoryItemSchema = z.object({
  resultId: z.string(),
  index: z.number(),
  blockId: z.string(),
  variableId: z.string(),
  value: z.string().or(listVariableValue).nullable(),
}) satisfies z.ZodType<Prisma.SetVariableHistoryItem>;

export type SetVariableHistoryItem = z.infer<
  typeof setVariableHistoryItemSchema
>;
