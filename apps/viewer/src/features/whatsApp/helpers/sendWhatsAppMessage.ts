import got from 'got'
import {
  WhatsAppCredentials,
  WhatsAppSendingMessage,
} from '@typebot.io/schemas/features/whatsapp'

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
  got.post({
    url: `https://graph.facebook.com/v17.0/${credentials.phoneNumberId}/messages`,
    headers: {
      Authorization: `Bearer ${credentials.systemUserAccessToken}`,
    },
    json: {
      messaging_product: 'whatsapp',
      to,
      ...message,
    },
  })
