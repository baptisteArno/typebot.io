import { continueBotFlow } from '@/features/chat/helpers/continueBotFlow'
import { saveStateToDatabase } from '@/features/chat/helpers/saveStateToDatabase'
import { getSession } from '@/features/chat/queries/getSession'
import { SessionState } from '@typebot.io/schemas'
import {
  WhatsAppCredentials,
  WhatsAppIncomingMessage,
} from '@typebot.io/schemas/features/whatsapp'
import { startWhatsAppSession } from './startWhatsAppSession'
import prisma from '@/lib/prisma'
import { decrypt } from '@typebot.io/lib/api'
import { downloadMedia } from './downloadMedia'
import { env } from '@typebot.io/env'
import { sendChatReplyToWhatsApp } from './sendChatReplyToWhatsApp'

export const resumeWhatsAppFlow = async ({
  receivedMessage,
  sessionId,
  workspaceId,
  phoneNumberId,
  contact,
}: {
  receivedMessage: WhatsAppIncomingMessage
  sessionId: string
  phoneNumberId: string
  workspaceId?: string
  contact: NonNullable<SessionState['whatsApp']>['contact']
}) => {
  const messageSendDate = new Date(Number(receivedMessage.timestamp) * 1000)
  const messageSentBefore3MinutesAgo =
    messageSendDate.getTime() < Date.now() - 180000
  if (messageSentBefore3MinutesAgo) {
    console.log('Message is too old', messageSendDate.getTime())
    return {
      message: 'Message received',
    }
  }

  const session = await getSession(sessionId)

  const initialCredentials = session
    ? await getCredentials(phoneNumberId)(session.state)
    : undefined

  const { typebot, resultId } = session?.state.typebotsQueue[0] ?? {}
  const messageContent = await getIncomingMessageContent({
    message: receivedMessage,
    systemUserToken: initialCredentials?.systemUserAccessToken,
    downloadPath:
      typebot && resultId
        ? `typebots/${typebot.id}/results/${resultId}`
        : undefined,
  })

  const isPreview = workspaceId === undefined

  const sessionState =
    isPreview && session?.state
      ? ({
          ...session?.state,
          whatsApp: {
            contact,
          },
        } satisfies SessionState)
      : session?.state

  const resumeResponse = sessionState
    ? await continueBotFlow(sessionState)(messageContent)
    : workspaceId
    ? await startWhatsAppSession({
        message: receivedMessage,
        sessionId,
        workspaceId,
        phoneNumberId,
        contact,
      })
    : undefined

  if (!resumeResponse) {
    console.error('Could not find or create session', sessionId)
    return {
      message: 'Message received',
    }
  }

  const credentials =
    initialCredentials ??
    (await getCredentials(phoneNumberId)(resumeResponse.newSessionState))

  if (!credentials) {
    console.error('Could not find credentials')
    return {
      message: 'Message received',
    }
  }

  const { input, logs, newSessionState, messages, clientSideActions } =
    resumeResponse

  await sendChatReplyToWhatsApp({
    to: receivedMessage.from,
    messages,
    input,
    typingEmulation: newSessionState.typingEmulation,
    clientSideActions,
    credentials,
  })

  await saveStateToDatabase({
    isFirstSave: !session,
    clientSideActions: [],
    input,
    logs,
    session: {
      id: sessionId,
      state: {
        ...newSessionState,
        currentBlock: !input ? undefined : newSessionState.currentBlock,
      },
    },
  })

  return {
    message: 'Message received',
  }
}

const getIncomingMessageContent = async ({
  message,
  systemUserToken,
  downloadPath,
}: {
  message: WhatsAppIncomingMessage
  systemUserToken: string | undefined
  downloadPath?: string
}): Promise<string | undefined> => {
  switch (message.type) {
    case 'text':
      return message.text.body
    case 'button':
      return message.button.text
    case 'interactive': {
      return message.interactive.button_reply.id
    }
    case 'document':
    case 'audio':
      return
    case 'video':
    case 'image':
      if (!systemUserToken || !downloadPath) return ''
      return downloadMedia({
        mediaId: 'video' in message ? message.video.id : message.image.id,
        systemUserToken,
        downloadPath,
      })
  }
}

const getCredentials =
  (phoneNumberId: string) =>
  async (
    state: SessionState
  ): Promise<WhatsAppCredentials['data'] | undefined> => {
    const isPreview = !state.typebotsQueue[0].resultId
    if (isPreview) {
      if (!env.META_SYSTEM_USER_TOKEN) return
      return {
        systemUserAccessToken: env.META_SYSTEM_USER_TOKEN,
        phoneNumberId,
      }
    }
    if (!state.whatsApp) return

    const credentials = await prisma.credentials.findUnique({
      where: {
        id: state.whatsApp.credentialsId,
      },
      select: {
        data: true,
        iv: true,
      },
    })
    if (!credentials) return
    const data = (await decrypt(
      credentials.data,
      credentials.iv
    )) as WhatsAppCredentials['data']
    return {
      systemUserAccessToken: data.systemUserAccessToken,
      phoneNumberId,
    }
  }
