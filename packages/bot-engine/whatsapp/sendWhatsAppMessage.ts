import {
  WhatsAppCredentials,
  WhatsAppSendingMessage,
} from '@typebot.io/schemas/features/whatsapp'
import { env } from '@typebot.io/env'
import got from 'got'

type Props = {
  to: string
  message: WhatsAppSendingMessage
  credentials: WhatsAppCredentials['data']
}

export const sendWhatsAppMessage = async ({
  to,
  message,
  credentials,
}: Props) =>
  got.post(
    `${env.WHATSAPP_CLOUD_API_URL}/v17.0/${credentials.phoneNumberId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${credentials.systemUserAccessToken}`,
      },
      json: {
        messaging_product: 'whatsapp',
        to,
        ...message,
      },
    }
  )
