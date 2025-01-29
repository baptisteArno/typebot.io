import { z } from "@typebot.io/zod";

export const blockBaseSchema = z.object({
  id: z.string(),
  outgoingEdgeId: z.string().optional(),
});
export type BlockBase = z.infer<typeof blockBaseSchema>;

export const optionBaseSchema = z.object({
  variableId: z.string().optional(),
});

const itemBaseV5Schema = z.object({
  id: z.string(),
  blockId: z.string().optional(),
  outgoingEdgeId: z.string().optional(),
});

export const itemBaseSchemas = {
  v5: itemBaseV5Schema,
  v6: itemBaseV5Schema.omit({ blockId: true }),
};

export const itemBaseSchema = z.union([itemBaseSchemas.v5, itemBaseSchemas.v6]);
