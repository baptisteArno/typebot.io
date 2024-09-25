import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const redirectOptionsSchema = z.object({
  url: z.string().optional(),
  isNewTab: z.boolean().optional(),
});

export const redirectBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([LogicBlockType.REDIRECT]),
      options: redirectOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Redirect",
    ref: "redirectLogic",
  });

export type RedirectBlock = z.infer<typeof redirectBlockSchema>;
