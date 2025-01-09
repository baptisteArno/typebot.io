import { z } from "@typebot.io/zod";

export const totalAnswersSchema = z.object({
  blockId: z.string(),
  itemId: z.string().optional(),
  total: z.number(),
});
export type TotalAnswers = z.infer<typeof totalAnswersSchema>;

export const edgeWithTotalUsersSchema = z.object({
  edgeId: z.string(),
  total: z.number(),
});
export type EdgeWithTotalUsers = z.infer<typeof edgeWithTotalUsersSchema>;
