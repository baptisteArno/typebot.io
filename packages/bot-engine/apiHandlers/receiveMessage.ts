import { WhatsAppWebhookRequestBody } from '@typebot.io/schemas/features/whatsapp'
import { isNotDefined } from '@typebot.io/lib'
import { resumeWhatsAppFlow } from '../whatsapp/resumeWhatsAppFlow'

type Props = {
  entry: WhatsAppWebhookRequestBody['entry']
  credentialsId: string
  workspaceId: string
}

export const receiveMessage = async ({
  entry,
  credentialsId,
  workspaceId,
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
    credentialsId,
    workspaceId,
    contact: {
      name: contactName,
      phoneNumber: contactPhoneNumber,
    },
  })
}
