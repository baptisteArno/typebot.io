import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'

export const sendEmailOptionsSchema = z.object({
  credentialsId: z.string(),
  isCustomBody: z.boolean().optional(),
  isBodyCode: z.boolean().optional(),
  recipients: z.array(z.string()),
  subject: z.string().optional(),
  body: z.string().optional(),
  replyTo: z.string().optional(),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  attachmentsVariableId: z.string().optional(),
})

export const sendEmailBlockSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([IntegrationBlockType.EMAIL]),
    options: sendEmailOptionsSchema,
  })
)

export const defaultSendEmailOptions: SendEmailOptions = {
  credentialsId: 'default',
  isCustomBody: false,
  recipients: [],
}

export type SendEmailBlock = z.infer<typeof sendEmailBlockSchema>
export type SendEmailOptions = z.infer<typeof sendEmailOptionsSchema>
