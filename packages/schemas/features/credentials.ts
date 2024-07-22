import { z } from '../zod'
import { stripeCredentialsSchema } from './blocks/inputs/payment/schema'
import { googleSheetsCredentialsSchema } from './blocks/integrations/googleSheets/schema'
import { smtpCredentialsSchema } from './blocks/integrations/sendEmail'
import { whatsAppCredentialsSchema } from './whatsapp'
import { forgedCredentialsSchemas } from '@typebot.io/forge-repository/credentials'

const credentialsSchema = z.discriminatedUnion('type', [
  smtpCredentialsSchema,
  googleSheetsCredentialsSchema,
  stripeCredentialsSchema,
  whatsAppCredentialsSchema,
  ...Object.values(forgedCredentialsSchemas),
])

export type Credentials = z.infer<typeof credentialsSchema>

export const credentialsTypes = [
  'smtp',
  'google sheets',
  'stripe',
  'whatsApp',
  ...(Object.keys(forgedCredentialsSchemas) as Array<
    keyof typeof forgedCredentialsSchemas
  >),
] as const

export const credentialsTypeSchema = z.enum(credentialsTypes)
