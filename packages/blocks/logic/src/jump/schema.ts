import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const jumpOptionsSchema = z.object({
  groupId: z.string().optional(),
  blockId: z.string().optional(),
});

export const jumpBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([LogicBlockType.JUMP]),
      options: jumpOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Jump",
    ref: "jumpLogic",
  });

export type JumpBlock = z.infer<typeof jumpBlockSchema>;
