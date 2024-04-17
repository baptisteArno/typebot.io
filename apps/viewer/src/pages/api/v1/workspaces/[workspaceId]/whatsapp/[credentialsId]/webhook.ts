import {
  WhatsAppWebhookRequestBody,
  whatsAppWebhookRequestBodySchema,
} from '@typebot.io/schemas/features/whatsapp'
import { resumeWhatsAppFlow } from '@typebot.io/bot-engine/whatsapp/resumeWhatsAppFlow'
import { isNotDefined } from '@typebot.io/lib'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@typebot.io/lib/prisma'
import { methodNotAllowed } from '@typebot.io/lib/api/utils'

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
  if (req.method === 'GET') {
    const token = req.query['hub.verify_token'] as string | undefined
    const challenge = req.query['hub.challenge'] as string | undefined
    if (!token || !challenge)
      return res.status(400).json({
        error: 'hub.verify_token and hub.challenge are required',
      })
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    })
    if (!verificationToken)
      return res.status(401).json({
        error: 'Unauthorized',
      })
    await prisma.verificationToken.delete({
      where: {
        token,
      },
    })
    return res.status(200).send(Number(challenge))
  }
  if (req.method === 'POST') {
    const workspaceId = req.query.workspaceId as string
    const credentialsId = req.query.credentialsId as string
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { entry } = whatsAppWebhookRequestBodySchema.parse(body)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ctx = globalThis[Symbol.for('@vercel/request-context')]
    if (ctx?.get?.().waitUntil) {
      console.log('Using waitUntil')
      ctx
        .get()
        .waitUntil(processWhatsAppReply({ entry, workspaceId, credentialsId }))
      return res.status(200).json({ message: 'Message is being processed.' })
    }
    console.log('Not using waitUntil')
    const { message } = await processWhatsAppReply({
      entry,
      workspaceId,
      credentialsId,
    })
    console.log('Message:', message)
    return res.status(200).json({ message })
  }
  return methodNotAllowed(res)
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
  console.log('Received message:', receivedMessage)
  console.log(
    'sessionId',
    `wa-${phoneNumberId}-${receivedMessage.from}`,
    new Date().toISOString()
  )
  try {
    const { message } = await resumeWhatsAppFlow({
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
    console.log('Message:', message)
    return { message }
  } catch (err) {
    console.log('Error', JSON.stringify(err))
    return { message: 'Error processing message' }
  }
}
