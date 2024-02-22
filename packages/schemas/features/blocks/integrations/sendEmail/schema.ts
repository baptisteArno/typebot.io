import { z } from '../../../../zod'
import { blockBaseSchema, credentialsBaseSchema } from '../../shared'
import { IntegrationBlockType } from '../constants'

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
})

export const sendEmailBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.EMAIL]),
    options: sendEmailOptionsSchema.optional(),
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

export type SendEmailBlock = z.infer<typeof sendEmailBlockSchema>
export type SmtpCredentials = z.infer<typeof smtpCredentialsSchema>
