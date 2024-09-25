import { z } from "@typebot.io/zod";

const blockSourceSchema = z.object({
  blockId: z.string(),
  itemId: z.string().optional(),
});
export type BlockSource = z.infer<typeof blockSourceSchema>;
const eventSourceSchema = z.object({
  eventId: z.string(),
});
export type TEventSource = z.infer<typeof eventSourceSchema>;
const sourceSchema = blockSourceSchema.or(eventSourceSchema);
export type Source = z.infer<typeof sourceSchema>;

const targetSchema = z.object({
  groupId: z.string(),
  blockId: z.string().optional(),
});
export type Target = z.infer<typeof targetSchema>;

export const edgeSchema = z.object({
  id: z.string(),
  from: sourceSchema,
  to: targetSchema,
});
export type Edge = z.infer<typeof edgeSchema>;
