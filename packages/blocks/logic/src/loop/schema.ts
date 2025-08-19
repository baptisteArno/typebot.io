import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const loopOptionsSchema = z.object({
  iterations: z.number().int().min(1).max(100).default(3),
});

export const loopBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([LogicBlockType.LOOP]),
      options: loopOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Loop",
    ref: "loopLogic",
  });

export type LoopBlock = z.infer<typeof loopBlockSchema>;
