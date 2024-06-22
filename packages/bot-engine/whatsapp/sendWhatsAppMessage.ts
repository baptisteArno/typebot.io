import {
  WhatsAppCredentials,
  WhatsAppSendingMessage,
} from '@sniper.io/schemas/features/whatsapp'
import { env } from '@sniper.io/env'
import ky from 'ky'

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
  ky.post(
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
