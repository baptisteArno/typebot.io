import {
  WhatsAppWebhookRequestBody,
  whatsAppWebhookRequestBodySchema,
} from '@typebot.io/schemas/features/whatsapp'
import { resumeWhatsAppFlow } from '@typebot.io/bot-engine/whatsapp/resumeWhatsAppFlow'
import { isNotDefined } from '@typebot.io/lib'
import { env } from '@typebot.io/env'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@typebot.io/lib/api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const token = req.query['hub.verify_token'] as string | undefined
    const challenge = req.query['hub.challenge'] as string | undefined
    if (token !== env.ENCRYPTION_SECRET)
      return res.status(401).json({
        error: 'Unauthorized',
      })
    return res.status(200).send(Number(challenge))
  }
  if (req.method === 'POST') {
    if (!env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID)
      return res
        .status(500)
        .send('WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID is not defined')
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { entry } = whatsAppWebhookRequestBodySchema.parse(body)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ctx = globalThis[Symbol.for('@vercel/request-context')]
    if (ctx?.get?.().waitUntil) {
      ctx.get().waitUntil(processWhatsAppReply(entry))
      return res.status(200).json({ message: 'Message is being processed.' })
    }
    console.log('Processing message')
    const { message } = await processWhatsAppReply(entry)
    return res.status(200).json({ message })
  }
  return methodNotAllowed(res)
}

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
