import {
  WhatsAppWebhookRequestBody,
  whatsAppWebhookRequestBodySchema,
} from '@typebot.io/schemas/features/whatsapp'
import { resumeWhatsAppFlow } from '@typebot.io/bot-engine/whatsapp/resumeWhatsAppFlow'
import { isNotDefined } from '@typebot.io/lib'
import type { RequestContext } from '@vercel/edge'

type Props = {
  entry: WhatsAppWebhookRequestBody['entry']
  workspaceId: string
  credentialsId: string
}

const processWhatsAppReply = async ({
  entry,
  workspaceId,
  credentialsId,
}: Props) => {
  const receivedMessage = entry.at(0)?.changes.at(0)?.value.messages?.at(0)
  if (isNotDefined(receivedMessage)) return { message: 'No message found' }
  const contactName =
    entry.at(0)?.changes.at(0)?.value?.contacts?.at(0)?.profile?.name ?? ''
  const contactPhoneNumber =
    entry.at(0)?.changes.at(0)?.value?.messages?.at(0)?.from ?? ''
  const phoneNumberId = entry.at(0)?.changes.at(0)?.value
    .metadata.phone_number_id
  if (!phoneNumberId) return { message: 'No phone number id found' }
  return resumeWhatsAppFlow({
    receivedMessage,
    sessionId: `wa-${phoneNumberId}-${receivedMessage.from}`,
    phoneNumberId,
    credentialsId,
    workspaceId,
    contact: {
      name: contactName,
      phoneNumber: contactPhoneNumber,
    },
  })
}

export async function POST(request: Request, context: RequestContext) {
  const workspaceId = request.url.match(/\/workspaces\/([^/]+)\//)?.[1]
  const credentialsId = request.url.match(/\/whatsapp\/([^/]+)\//)?.[1]
  if (!workspaceId || !credentialsId) {
    console.error('No workspace or credentials id found')
    return { message: 'No workspace or credentials id found' }
  }
  const body = await request.json()
  const { entry } = whatsAppWebhookRequestBodySchema.parse(body)
  context.waitUntil(processWhatsAppReply({ entry, workspaceId, credentialsId }))
  return new Response('Message is being processed.', { status: 200 })
}
