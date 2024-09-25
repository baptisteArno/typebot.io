import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { IntegrationBlockType } from "../constants";
import { chatwootTasks } from "./constants";

export const chatwootOptionsSchema = z.object({
  task: z.enum(chatwootTasks).optional(),
  baseUrl: z.string().optional(),
  websiteToken: z.string().optional(),
  user: z
    .object({
      id: z.string().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
      avatarUrl: z.string().optional(),
      phoneNumber: z.string().optional(),
    })
    .optional(),
});

export const chatwootBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([IntegrationBlockType.CHATWOOT]),
      options: chatwootOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Chatwoot",
    ref: "chatwootBlock",
  });

export type ChatwootBlock = z.infer<typeof chatwootBlockSchema>;
