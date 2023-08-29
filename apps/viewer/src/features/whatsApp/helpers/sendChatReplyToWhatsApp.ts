import {
  ChatReply,
  InputBlockType,
  SessionState,
  Settings,
} from '@typebot.io/schemas'
import {
  WhatsAppCredentials,
  WhatsAppSendingMessage,
} from '@typebot.io/schemas/features/whatsapp'
import { convertMessageToWhatsAppMessage } from './convertMessageToWhatsAppMessage'
import { sendWhatsAppMessage } from './sendWhatsAppMessage'
import { captureException } from '@sentry/nextjs'
import { isNotDefined } from '@typebot.io/lib/utils'
import { HTTPError } from 'got'
import { computeTypingDuration } from '@typebot.io/lib/computeTypingDuration'
import { convertInputToWhatsAppMessages } from './convertInputToWhatsAppMessage'

// Media can take some time to be delivered. This make sure we don't send a message before the media is delivered.
const messageAfterMediaTimeout = 5000

type Props = {
  to: string
  typingEmulation: SessionState['typingEmulation']
  credentials: WhatsAppCredentials['data']
} & Pick<ChatReply, 'messages' | 'input' | 'clientSideActions'>

export const sendChatReplyToWhatsApp = async ({
  to,
  typingEmulation,
  messages,
  input,
  clientSideActions,
  credentials,
}: Props) => {
  const messagesBeforeInput = isLastMessageIncludedInInput(input)
    ? messages.slice(0, -1)
    : messages

  const sentMessages: WhatsAppSendingMessage[] = []

  for (const message of messagesBeforeInput) {
    const whatsAppMessage = convertMessageToWhatsAppMessage(message)
    if (isNotDefined(whatsAppMessage)) continue
    const lastSentMessageIsMedia = ['audio', 'video', 'image'].includes(
      sentMessages.at(-1)?.type ?? ''
    )
    const typingDuration = lastSentMessageIsMedia
      ? messageAfterMediaTimeout
      : getTypingDuration({
          message: whatsAppMessage,
          typingEmulation,
        })
    if (typingDuration)
      await new Promise((resolve) => setTimeout(resolve, typingDuration))
    try {
      await sendWhatsAppMessage({
        to,
        message: whatsAppMessage,
        credentials,
      })
      sentMessages.push(whatsAppMessage)
    } catch (err) {
      captureException(err, { extra: { message } })
      console.log('Failed to send message:', JSON.stringify(message, null, 2))
      if (err instanceof HTTPError)
        console.log('HTTPError', err.response.statusCode, err.response.body)
    }
  }

  if (clientSideActions)
    for (const clientSideAction of clientSideActions) {
      if ('redirect' in clientSideAction && clientSideAction.redirect.url) {
        const message = {
          type: 'text',
          text: {
            body: clientSideAction.redirect.url,
            preview_url: true,
          },
        } satisfies WhatsAppSendingMessage
        try {
          await sendWhatsAppMessage({
            to,
            message,
            credentials,
          })
        } catch (err) {
          captureException(err, { extra: { message } })
          console.log(
            'Failed to send message:',
            JSON.stringify(message, null, 2)
          )
          if (err instanceof HTTPError)
            console.log('HTTPError', err.response.statusCode, err.response.body)
        }
      }
    }

  if (input) {
    const inputWhatsAppMessages = convertInputToWhatsAppMessages(
      input,
      messages.at(-1)
    )
    for (const message of inputWhatsAppMessages) {
      try {
        const lastSentMessageIsMedia = ['audio', 'video', 'image'].includes(
          sentMessages.at(-1)?.type ?? ''
        )
        const typingDuration = lastSentMessageIsMedia
          ? messageAfterMediaTimeout
          : getTypingDuration({
              message,
              typingEmulation,
            })
        if (typingDuration)
          await new Promise((resolve) => setTimeout(resolve, typingDuration))
        await sendWhatsAppMessage({
          to,
          message,
          credentials,
        })
      } catch (err) {
        captureException(err, { extra: { message } })
        console.log('Failed to send message:', JSON.stringify(message, null, 2))
        if (err instanceof HTTPError)
          console.log('HTTPError', err.response.statusCode, err.response.body)
      }
    }
  }
}

const getTypingDuration = ({
  message,
  typingEmulation,
}: {
  message: WhatsAppSendingMessage
  typingEmulation?: Settings['typingEmulation']
}): number | undefined => {
  switch (message.type) {
    case 'text':
      return computeTypingDuration({
        bubbleContent: message.text.body,
        typingSettings: typingEmulation,
      })
    case 'interactive':
      if (!message.interactive.body?.text) return
      return computeTypingDuration({
        bubbleContent: message.interactive.body?.text ?? '',
        typingSettings: typingEmulation,
      })
    case 'audio':
    case 'video':
    case 'image':
    case 'template':
      return
  }
}

const isLastMessageIncludedInInput = (input: ChatReply['input']): boolean => {
  if (isNotDefined(input)) return false
  return input.type === InputBlockType.CHOICE
}
