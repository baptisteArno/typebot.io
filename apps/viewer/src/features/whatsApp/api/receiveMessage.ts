import { publicProcedure } from '@/helpers/server/trpc'
import { whatsAppWebhookRequestBodySchema } from '@typebot.io/schemas/features/whatsapp'
import { resumeWhatsAppFlow } from '../helpers/resumeWhatsAppFlow'
import { z } from 'zod'
import { isNotDefined } from '@typebot.io/lib'

export const receiveMessage = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/workspaces/{workspaceId}/whatsapp/phoneNumbers/{phoneNumberId}/webhook',
      summary: 'Message webhook',
      tags: ['WhatsApp'],
    },
  })
  .input(
    z
      .object({ workspaceId: z.string(), phoneNumberId: z.string() })
      .merge(whatsAppWebhookRequestBodySchema)
  )
  .output(
    z.object({
      message: z.string(),
    })
  )
  .mutation(async ({ input: { entry, workspaceId, phoneNumberId } }) => {
    const receivedMessage = entry.at(0)?.changes.at(0)?.value.messages?.at(0)
    if (isNotDefined(receivedMessage)) return { message: 'No message found' }
    const contactName =
      entry.at(0)?.changes.at(0)?.value?.contacts?.at(0)?.profile?.name ?? ''
    const contactPhoneNumber =
      entry.at(0)?.changes.at(0)?.value?.messages?.at(0)?.from ?? ''
    return resumeWhatsAppFlow({
      receivedMessage,
      sessionId: `wa-${phoneNumberId}-${receivedMessage.from}`,
      phoneNumberId,
      workspaceId,
      contact: {
        name: contactName,
        phoneNumber: contactPhoneNumber,
      },
    })
  })
