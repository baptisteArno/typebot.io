import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const webhookOptionsSchema = z.object({
  responseVariableMapping: z
    .array(
      z.object({
        id: z.string(),
        variableId: z.string().optional(),
        bodyPath: z.string().optional(),
      }),
    )
    .optional(),
});

export const webhookBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([LogicBlockType.WEBHOOK]),
      options: webhookOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Webhook",
    ref: "webhookLogic",
  });

export type WebhookBlock = z.infer<typeof webhookBlockSchema>;
