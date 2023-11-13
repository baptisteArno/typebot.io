import {
  ContinueChatResponse,
  SessionState,
  Settings,
} from '@typebot.io/schemas'
import {
  WhatsAppCredentials,
  WhatsAppSendingMessage,
} from '@typebot.io/schemas/features/whatsapp'
import { convertMessageToWhatsAppMessage } from './convertMessageToWhatsAppMessage'
import { sendWhatsAppMessage } from './sendWhatsAppMessage'
import * as Sentry from '@sentry/nextjs'
import { HTTPError } from 'got'
import { convertInputToWhatsAppMessages } from './convertInputToWhatsAppMessage'
import { isNotDefined } from '@typebot.io/lib/utils'
import { computeTypingDuration } from '../computeTypingDuration'
import { continueBotFlow } from '../continueBotFlow'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'

// Media can take some time to be delivered. This make sure we don't send a message before the media is delivered.
const messageAfterMediaTimeout = 5000

type Props = {
  to: string
  typingEmulation: SessionState['typingEmulation']
  credentials: WhatsAppCredentials['data']
  state: SessionState
} & Pick<ContinueChatResponse, 'messages' | 'input' | 'clientSideActions'>

export const sendChatReplyToWhatsApp = async ({
  to,
  typingEmulation,
  messages,
  input,
  clientSideActions,
  credentials,
  state,
}: Props): Promise<void> => {
  const messagesBeforeInput = isLastMessageIncludedInInput(input)
    ? messages.slice(0, -1)
    : messages

  const sentMessages: WhatsAppSendingMessage[] = []

  const clientSideActionsBeforeMessages =
    clientSideActions?.filter((action) =>
      isNotDefined(action.lastBubbleBlockId)
    ) ?? []

  for (const action of clientSideActionsBeforeMessages) {
    const result = await executeClientSideAction({ to, credentials })(action)
    if (!result) continue
    const { input, newSessionState, messages, clientSideActions } =
      await continueBotFlow(result.replyToSend, { version: 2, state })

    return sendChatReplyToWhatsApp({
      to,
      messages,
      input,
      typingEmulation: newSessionState.typingEmulation,
      clientSideActions,
      credentials,
      state: newSessionState,
    })
  }

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
      const clientSideActionsAfterMessage =
        clientSideActions?.filter(
          (action) => action.lastBubbleBlockId === message.id
        ) ?? []
      for (const action of clientSideActionsAfterMessage) {
        const result = await executeClientSideAction({ to, credentials })(
          action
        )
        if (!result) continue
        const { input, newSessionState, messages, clientSideActions } =
          await continueBotFlow(result.replyToSend, { version: 2, state })

        return sendChatReplyToWhatsApp({
          to,
          messages,
          input,
          typingEmulation: newSessionState.typingEmulation,
          clientSideActions,
          credentials,
          state: newSessionState,
        })
      }
    } catch (err) {
      Sentry.captureException(err, { extra: { message } })
      console.log('Failed to send message:', JSON.stringify(message, null, 2))
      if (err instanceof HTTPError)
        console.log('HTTPError', err.response.statusCode, err.response.body)
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
        Sentry.captureException(err, { extra: { message } })
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

const isLastMessageIncludedInInput = (
  input: ContinueChatResponse['input']
): boolean => {
  if (isNotDefined(input)) return false
  return input.type === InputBlockType.CHOICE
}

const executeClientSideAction =
  (context: { to: string; credentials: WhatsAppCredentials['data'] }) =>
  async (
    clientSideAction: NonNullable<
      ContinueChatResponse['clientSideActions']
    >[number]
  ): Promise<{ replyToSend: string | undefined } | void> => {
    if ('wait' in clientSideAction) {
      await new Promise((resolve) =>
        setTimeout(resolve, clientSideAction.wait.secondsToWaitFor * 1000)
      )
      if (!clientSideAction.expectsDedicatedReply) return
      return {
        replyToSend: undefined,
      }
    }
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
          to: context.to,
          message,
          credentials: context.credentials,
        })
      } catch (err) {
        Sentry.captureException(err, { extra: { message } })
        console.log('Failed to send message:', JSON.stringify(message, null, 2))
        if (err instanceof HTTPError)
          console.log('HTTPError', err.response.statusCode, err.response.body)
      }
    }
  }
