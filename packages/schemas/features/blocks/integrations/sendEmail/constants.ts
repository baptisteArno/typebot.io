import { SendEmailBlock } from './schema'

export const defaultSendEmailOptions = {
  credentialsId: 'default',
  isCustomBody: false,
  isBodyCode: false,
} as const satisfies SendEmailBlock['options']
