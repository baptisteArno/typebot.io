import { z } from 'zod'
import { IntegrationStepType, stepBaseSchema } from '../shared'

export const sendEmailOptionsSchema = z.object({
  credentialsId: z.string(),
  recipients: z.array(z.string()),
  subject: z.string().optional(),
  body: z.string().optional(),
  replyTo: z.string().optional(),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
})

export const sendEmailStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([IntegrationStepType.EMAIL]),
    options: sendEmailOptionsSchema,
  })
)

export const defaultSendEmailOptions: SendEmailOptions = {
  credentialsId: 'default',
  recipients: [],
}

export type SendEmailStep = z.infer<typeof sendEmailStepSchema>
export type SendEmailOptions = z.infer<typeof sendEmailOptionsSchema>
