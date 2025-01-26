import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { IntegrationBlockType } from "../constants";

export const sendEmailOptionsSchema = z.object({
  credentialsId: z.string().optional(),
  isCustomBody: z.boolean().optional(),
  isBodyCode: z.boolean().optional(),
  recipients: z.array(z.string()).optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  replyTo: z.string().optional(),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  attachmentsVariableId: z.string().optional(),
});

export const sendEmailBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([IntegrationBlockType.EMAIL]),
      options: sendEmailOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Send email",
    ref: "sendEmailBlock",
  });

export type SendEmailBlock = z.infer<typeof sendEmailBlockSchema>;
