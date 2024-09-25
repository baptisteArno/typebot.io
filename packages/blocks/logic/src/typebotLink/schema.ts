import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const typebotLinkOptionsSchema = z.object({
  typebotId: z.string().optional(),
  groupId: z.string().optional(),
  mergeResults: z.boolean().optional(),
});

export const typebotLinkBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([LogicBlockType.TYPEBOT_LINK]),
      options: typebotLinkOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Typebot link",
    ref: "typebotLinkLogic",
  });

export type TypebotLinkBlock = z.infer<typeof typebotLinkBlockSchema>;
