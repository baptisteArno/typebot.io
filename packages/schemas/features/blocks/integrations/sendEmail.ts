import { z } from 'zod'
import { blockBaseSchema, credentialsBaseSchema } from '../baseSchemas'
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

export const sendEmailBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.EMAIL]),
    options: sendEmailOptionsSchema,
  })
)

export const smtpCredentialsSchema = z
  .object({
    type: z.literal('smtp'),
    data: z.object({
      host: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      isTlsEnabled: z.boolean().optional(),
      port: z.number(),
      from: z.object({
        email: z.string().optional(),
        name: z.string().optional(),
      }),
    }),
  })
  .merge(credentialsBaseSchema)

export const defaultSendEmailOptions: SendEmailOptions = {
  credentialsId: 'default',
  isCustomBody: false,
  recipients: [],
}

export type SendEmailBlock = z.infer<typeof sendEmailBlockSchema>
export type SendEmailOptions = z.infer<typeof sendEmailOptionsSchema>
export type SmtpCredentials = z.infer<typeof smtpCredentialsSchema>
