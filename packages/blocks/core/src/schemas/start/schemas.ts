import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";

export const startBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.literal("start"),
    label: z.string(),
  }),
);

export type StartBlock = z.infer<typeof startBlockSchema>;
