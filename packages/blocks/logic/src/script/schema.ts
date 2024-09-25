import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const scriptOptionsSchema = z.object({
  name: z.string().optional(),
  content: z.string().optional(),
  isExecutedOnClient: z.boolean().optional(),
  shouldExecuteInParentContext: z.boolean().optional(),
});

export const scriptBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([LogicBlockType.SCRIPT]),
      options: scriptOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Script",
    ref: "scriptLogic",
  });

export type ScriptBlock = z.infer<typeof scriptBlockSchema>;
