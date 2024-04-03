import { WhatsAppWebhookRequestBody } from '@typebot.io/schemas/features/whatsapp'
import { isNotDefined } from '@typebot.io/lib'
import { TRPCError } from '@trpc/server'
import { env } from '@typebot.io/env'
import { resumeWhatsAppFlow } from '../whatsapp/resumeWhatsAppFlow'

type Props = {
  entry: WhatsAppWebhookRequestBody['entry']
}
export const receiveMessagePreview = ({ entry }: Props) => {
  if (!env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID is not defined',
    })
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
