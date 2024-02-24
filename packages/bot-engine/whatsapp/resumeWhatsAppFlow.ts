import { SessionState } from '@typebot.io/schemas'
import {
  WhatsAppCredentials,
  WhatsAppIncomingMessage,
} from '@typebot.io/schemas/features/whatsapp'
import { env } from '@typebot.io/env'
import { sendChatReplyToWhatsApp } from './sendChatReplyToWhatsApp'
import { startWhatsAppSession } from './startWhatsAppSession'
import { getSession } from '../queries/getSession'
import { continueBotFlow } from '../continueBotFlow'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { saveStateToDatabase } from '../saveStateToDatabase'
import prisma from '@typebot.io/lib/prisma'
import { isDefined } from '@typebot.io/lib/utils'
import { Reply } from '../types'

type Props = {
  receivedMessage: WhatsAppIncomingMessage
  sessionId: string
  credentialsId?: string
  workspaceId?: string
  contact: NonNullable<SessionState['whatsApp']>['contact']
}

export const resumeWhatsAppFlow = async ({
  receivedMessage,
  sessionId,
  workspaceId,
  credentialsId,
  contact,
}: Props): Promise<{ message: string }> => {
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

  const isPreview = workspaceId === undefined || credentialsId === undefined

  const { typebot } = session?.state.typebotsQueue[0] ?? {}

  const credentials = await getCredentials({ credentialsId, isPreview })

  if (!credentials) {
    console.error('Could not find credentials')
    return {
      message: 'Message received',
    }
  }

  const reply = await getIncomingMessageContent({
    message: receivedMessage,
    typebotId: typebot?.id,
    workspaceId,
    accessToken: credentials?.systemUserAccessToken,
  })

  const isSessionExpired =
    session &&
    isDefined(session.state.expiryTimeout) &&
    session?.updatedAt.getTime() + session.state.expiryTimeout < Date.now()

  const resumeResponse =
    session && !isSessionExpired
      ? await continueBotFlow(reply, {
          version: 2,
          state: { ...session.state, whatsApp: { contact } },
        })
      : workspaceId
      ? await startWhatsAppSession({
          incomingMessage: reply,
          workspaceId,
          credentials: { ...credentials, id: credentialsId as string },
          contact,
        })
      : { error: 'workspaceId not found' }

  if ('error' in resumeResponse) {
    console.log('Chat not starting:', resumeResponse.error)
    return {
      message: 'Message received',
    }
  }

  const {
    input,
    logs,
    newSessionState,
    messages,
    clientSideActions,
    visitedEdges,
  } = resumeResponse

  const isFirstChatChunk = (!session || isSessionExpired) ?? false
  await sendChatReplyToWhatsApp({
    to: receivedMessage.from,
    messages,
    input,
    isFirstChatChunk,
    typingEmulation: newSessionState.typingEmulation,
    clientSideActions,
    credentials,
    state: newSessionState,
  })

  await saveStateToDatabase({
    forceCreateSession: !session && isDefined(input),
    clientSideActions: [],
    input,
    logs,
    session: {
      id: sessionId,
      state: {
        ...newSessionState,
        currentBlockId: !input ? undefined : newSessionState.currentBlockId,
      },
    },
    visitedEdges,
  })

  return {
    message: 'Message received',
  }
}

const getIncomingMessageContent = async ({
  message,
  typebotId,
  workspaceId,
  accessToken,
}: {
  message: WhatsAppIncomingMessage
  typebotId?: string
  workspaceId?: string
  accessToken: string
}): Promise<Reply> => {
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
    case 'video':
    case 'image':
      if (!typebotId) return
      let mediaId: string | undefined
      if (message.type === 'video') mediaId = message.video.id
      if (message.type === 'image') mediaId = message.image.id
      if (message.type === 'audio') mediaId = message.audio.id
      if (message.type === 'document') mediaId = message.document.id
      if (!mediaId) return
      return { type: 'whatsapp media', mediaId, workspaceId, accessToken }
    case 'location':
      return `${message.location.latitude}, ${message.location.longitude}`
  }
}

const getCredentials = async ({
  credentialsId,
  isPreview,
}: {
  credentialsId?: string
  isPreview: boolean
}): Promise<WhatsAppCredentials['data'] | undefined> => {
  if (isPreview) {
    if (
      !env.META_SYSTEM_USER_TOKEN ||
      !env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID
    )
      return
    return {
      systemUserAccessToken: env.META_SYSTEM_USER_TOKEN,
      phoneNumberId: env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID,
    }
  }

  if (!credentialsId) return

  const credentials = await prisma.credentials.findUnique({
    where: {
      id: credentialsId,
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
    phoneNumberId: data.phoneNumberId,
  }
}
