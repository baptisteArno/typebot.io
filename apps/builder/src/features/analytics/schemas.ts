import { edgeSchema } from "@typebot.io/typebot/schemas/edge";
import { z } from "@typebot.io/zod";

export const totalAnswersSchema = z.object({
  blockId: z.string(),
  itemId: z.string().optional(),
  total: z.number(),
});
export type TotalAnswers = z.infer<typeof totalAnswersSchema>;

export const edgeWithTotalVisitsSchema = z.object({
  id: z.string(),
  total: z.number(),
  to: edgeSchema.shape.to.nullable(),
});
export type EdgeWithTotalVisits = z.infer<typeof edgeWithTotalVisitsSchema>;
