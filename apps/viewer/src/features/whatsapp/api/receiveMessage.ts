import { publicProcedure } from '@/helpers/server/trpc'
import { whatsAppWebhookRequestBodySchema } from '@typebot.io/schemas/features/whatsapp'
import { z } from 'zod'
import { isNotDefined } from '@typebot.io/lib'
import { resumeWhatsAppFlow } from '@typebot.io/bot-engine/whatsapp/resumeWhatsAppFlow'

export const receiveMessage = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/workspaces/{workspaceId}/whatsapp/{credentialsId}/webhook',
      summary: 'Message webhook',
      tags: ['WhatsApp'],
    },
  })
  .input(
    z
      .object({ workspaceId: z.string(), credentialsId: z.string() })
      .merge(whatsAppWebhookRequestBodySchema)
  )
  .output(
    z.object({
      message: z.string(),
    })
  )
  .mutation(async ({ input: { entry, workspaceId, credentialsId } }) => {
    const receivedMessage = entry.at(0)?.changes.at(0)?.value.messages?.at(0)
    if (isNotDefined(receivedMessage)) return { message: 'No message found' }
    const contactName =
      entry.at(0)?.changes.at(0)?.value?.contacts?.at(0)?.profile?.name ?? ''
    const contactPhoneNumber =
      entry.at(0)?.changes.at(0)?.value?.messages?.at(0)?.from ?? ''
    return resumeWhatsAppFlow({
      receivedMessage,
      sessionId: `wa-${credentialsId}-${receivedMessage.from}`,
      credentialsId,
      workspaceId,
      contact: {
        name: contactName,
        phoneNumber: contactPhoneNumber,
      },
    })
  })
