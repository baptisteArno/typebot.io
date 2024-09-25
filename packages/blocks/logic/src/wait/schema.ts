import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const waitOptionsSchema = z.object({
  secondsToWaitFor: z.string().optional(),
  shouldPause: z.boolean().optional(),
});

export const waitBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([LogicBlockType.WAIT]),
      options: waitOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Wait",
    ref: "waitLogic",
  });

export type WaitBlock = z.infer<typeof waitBlockSchema>;
