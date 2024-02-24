import {
  sendEmailErrorDescription,
  sendEmailSuccessDescription,
} from '../blocks/integrations/sendEmail/executeSendEmailBlock'
import {
  webhookErrorDescription,
  webhookSuccessDescription,
} from '../blocks/integrations/webhook/executeWebhookBlock'

export const filterPotentiallySensitiveLogs = (log: {
  status: string
  description: string
  details?: unknown
}) =>
  ![
    webhookErrorDescription,
    webhookSuccessDescription,
    sendEmailErrorDescription,
    sendEmailSuccessDescription,
  ].includes(log.description)
