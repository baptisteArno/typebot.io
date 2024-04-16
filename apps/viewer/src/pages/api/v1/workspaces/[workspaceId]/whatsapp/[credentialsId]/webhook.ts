import {
  WhatsAppWebhookRequestBody,
  whatsAppWebhookRequestBodySchema,
} from '@typebot.io/schemas/features/whatsapp'
import { resumeWhatsAppFlow } from '@typebot.io/bot-engine/whatsapp/resumeWhatsAppFlow'
import { isNotDefined } from '@typebot.io/lib'
import { NextApiRequest, NextApiResponse } from 'next'

type Props = {
  entry: WhatsAppWebhookRequestBody['entry']
  workspaceId: string
  credentialsId: string
}

export const config = {
  supportsResponseStreaming: true,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const workspaceId = req.query.workspaceId as string
  const credentialsId = req.query.credentialsId as string
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { entry } = whatsAppWebhookRequestBodySchema.parse(body)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const ctx = globalThis[Symbol.for('@vercel/request-context')]
  if (ctx?.get?.().waitUntil) {
    ctx
      .get()
      .waitUntil(() =>
        processWhatsAppReply({ entry, workspaceId, credentialsId })
      )
    return res.status(200).json({ message: 'Message is being processed.' })
  }
  const { message } = await processWhatsAppReply({
    entry,
    workspaceId,
    credentialsId,
  })
  return res.status(200).json({ message })
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
