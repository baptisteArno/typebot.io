import { z } from 'zod'
import { stripeCredentialsSchema } from './blocks/inputs/payment/schemas'
import { googleSheetsCredentialsSchema } from './blocks/integrations/googleSheets/schemas'
import { openAICredentialsSchema } from './blocks/integrations/openai'
import { smtpCredentialsSchema } from './blocks/integrations/sendEmail'
import { whatsAppCredentialsSchema } from './whatsapp'
import { zemanticAiCredentialsSchema } from './blocks'

export const credentialsSchema = z.discriminatedUnion('type', [
  smtpCredentialsSchema,
  googleSheetsCredentialsSchema,
  stripeCredentialsSchema,
  openAICredentialsSchema,
  whatsAppCredentialsSchema,
  zemanticAiCredentialsSchema,
])

export type Credentials = z.infer<typeof credentialsSchema>
