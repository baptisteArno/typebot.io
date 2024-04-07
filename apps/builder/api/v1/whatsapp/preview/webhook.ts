import {
  WhatsAppWebhookRequestBody,
  whatsAppWebhookRequestBodySchema,
} from '@typebot.io/schemas/features/whatsapp'
import { resumeWhatsAppFlow } from '@typebot.io/bot-engine/whatsapp/resumeWhatsAppFlow'
import { isNotDefined } from '@typebot.io/lib'
import { env } from '@typebot.io/env'
import type { RequestContext } from '@vercel/edge'

const processWhatsAppReply = async (
  entry: WhatsAppWebhookRequestBody['entry']
) => {
  const receivedMessage = entry.at(0)?.changes.at(0)?.value.messages?.at(0)
  if (isNotDefined(receivedMessage)) return { message: 'No message found' }
  const contactName =
    entry.at(0)?.changes.at(0)?.value?.contacts?.at(0)?.profile?.name ?? ''
  const contactPhoneNumber =
    entry.at(0)?.changes.at(0)?.value?.messages?.at(0)?.from ?? ''
  return resumeWhatsAppFlow({
    receivedMessage,
    sessionId: `wa-preview-${receivedMessage.from}`,
    contact: {
      name: contactName,
      phoneNumber: contactPhoneNumber,
    },
  })
}

export async function POST(request: Request, context: RequestContext) {
  if (!env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID)
    return new Response(
      'WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID is not defined',
      {
        status: 500,
      }
    )
  const body = await request.json()
  const { entry } = whatsAppWebhookRequestBodySchema.parse(body)
  context.waitUntil(processWhatsAppReply(entry))
  return new Response('Message is being processed.', { status: 200 })
}
