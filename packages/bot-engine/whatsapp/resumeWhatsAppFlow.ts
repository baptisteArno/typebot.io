import { Block, SessionState } from '@typebot.io/schemas'
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
import { setIsReplyingInChatSession } from '../queries/setIsReplyingInChatSession'
import { removeIsReplyingInChatSession } from '../queries/removeIsReplyingInChatSession'
import redis from '@typebot.io/lib/redis'
import { downloadMedia } from './downloadMedia'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { uploadFileToBucket } from '@typebot.io/lib/s3/uploadFileToBucket'
import { getBlockById } from '@typebot.io/schemas/helpers'

const incomingMessageDebounce = 3000

type Props = {
  receivedMessage: WhatsAppIncomingMessage
  sessionId: string
  credentialsId?: string
  phoneNumberId?: string
  workspaceId?: string
  contact: NonNullable<SessionState['whatsApp']>['contact']
}

export const resumeWhatsAppFlow = async ({
  receivedMessage,
  sessionId,
  workspaceId,
  credentialsId,
  phoneNumberId,
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

  const isPreview = workspaceId === undefined || credentialsId === undefined

  const credentials = await getCredentials({ credentialsId, isPreview })

  if (!credentials) {
    console.error('Could not find credentials')
    return {
      message: 'Message received',
    }
  }

  if (credentials.phoneNumberId !== phoneNumberId && !isPreview) {
    console.error('Credentials point to another phone ID, skipping...')
    return {
      message: 'Message received',
    }
  }

  const session = await getSession(sessionId)

  const { incomingMessages, isReplyingWasSet } =
    await aggregateParallelMediaMessagesIfRedisEnabled({
      receivedMessage,
      existingSessionId: session?.id,
      newSessionId: sessionId,
    })

  if (incomingMessages.length === 0) {
    if (isReplyingWasSet) await removeIsReplyingInChatSession(sessionId)

    return {
      message: 'Message received',
    }
  }

  const isSessionExpired =
    session &&
    isDefined(session.state.expiryTimeout) &&
    session?.updatedAt.getTime() + session.state.expiryTimeout < Date.now()

  if (!isReplyingWasSet) {
    if (session?.isReplying) {
      if (!isSessionExpired) {
        console.log('Is currently replying, skipping...')
        return {
          message: 'Message received',
        }
      }
    } else {
      await setIsReplyingInChatSession({
        existingSessionId: session?.id,
        newSessionId: sessionId,
      })
    }
  }

  const currentTypebot = session?.state.typebotsQueue[0].typebot
  const { block } =
    (currentTypebot && session?.state.currentBlockId
      ? getBlockById(session.state.currentBlockId, currentTypebot.groups)
      : undefined) ?? {}

  const reply = await getIncomingMessageContent({
    messages: incomingMessages,
    workspaceId,
    accessToken: credentials?.systemUserAccessToken,
    typebotId: currentTypebot?.id,
    resultId: session?.state.typebotsQueue[0].resultId,
    block,
  })

  const resumeResponse =
    session && !isSessionExpired
      ? await continueBotFlow(reply, {
          version: 2,
          state: { ...session.state, whatsApp: { contact } },
          textBubbleContentFormat: 'richText',
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
    await removeIsReplyingInChatSession(sessionId)
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
    setVariableHistory,
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
    setVariableHistory,
  })

  return {
    message: 'Message received',
  }
}

const getIncomingMessageContent = async ({
  messages,
  workspaceId,
  accessToken,
  typebotId,
  resultId,
  block,
}: {
  messages: WhatsAppIncomingMessage[]
  workspaceId?: string
  accessToken: string
  typebotId?: string
  resultId?: string
  block?: Block
}): Promise<Reply> => {
  let text: string = ''
  const attachedFileUrls: string[] = []
  for (const message of messages) {
    switch (message.type) {
      case 'text': {
        if (text !== '') text += `\n\n${message.text.body}`
        else text = message.text.body
        break
      }
      case 'button': {
        if (text !== '') text += `\n\n${message.button.text}`
        else text = message.button.text
        break
      }
      case 'interactive': {
        if (text !== '') text += `\n\n${message.interactive.button_reply.id}`
        else text = message.interactive.button_reply.id
        break
      }
      case 'document':
      case 'audio':
      case 'video':
      case 'image': {
        let mediaId: string | undefined
        if (message.type === 'video') mediaId = message.video.id
        if (message.type === 'image') mediaId = message.image.id
        if (message.type === 'audio') mediaId = message.audio.id
        if (message.type === 'document') mediaId = message.document.id
        if (!mediaId) return
        const fileVisibility =
          block?.type === InputBlockType.TEXT &&
          block.options?.audioClip?.isEnabled &&
          message.type === 'audio'
            ? block.options?.audioClip.visibility
            : block?.type === InputBlockType.FILE
            ? block.options?.visibility
            : block?.type === InputBlockType.TEXT
            ? block.options?.attachments?.visibility
            : undefined
        let fileUrl
        if (fileVisibility !== 'Public') {
          fileUrl =
            env.NEXTAUTH_URL +
            `/api/typebots/${typebotId}/whatsapp/media/${
              workspaceId ? `` : 'preview/'
            }${mediaId}`
        } else {
          const { file, mimeType } = await downloadMedia({
            mediaId,
            systemUserAccessToken: accessToken,
          })
          const url = await uploadFileToBucket({
            file,
            key:
              resultId && workspaceId && typebotId
                ? `public/workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/${mediaId}`
                : `tmp/whatsapp/media/${mediaId}`,
            mimeType,
          })
          fileUrl = url
        }
        if (message.type === 'audio')
          return {
            type: 'audio',
            url: fileUrl,
          }
        if (block?.type === InputBlockType.FILE) {
          if (text !== '') text += `, ${fileUrl}`
          else text = fileUrl
        } else if (block?.type === InputBlockType.TEXT) {
          let caption: string | undefined
          if (message.type === 'document' && message.document.caption) {
            if (!/^[\w,\s-]+\.[A-Za-z]{3}$/.test(message.document.caption))
              caption = message.document.caption
          } else if (message.type === 'image' && message.image.caption)
            caption = message.image.caption
          else if (message.type === 'video' && message.video.caption)
            caption = message.video.caption
          if (caption) text = text === '' ? caption : `${text}\n\n${caption}`
          attachedFileUrls.push(fileUrl)
        }
        break
      }
      case 'location': {
        const location = `${message.location.latitude}, ${message.location.longitude}`
        if (text !== '') text += `\n\n${location}`
        else text = location
        break
      }
    }
  }

  return {
    type: 'text',
    text,
    attachedFileUrls,
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

const aggregateParallelMediaMessagesIfRedisEnabled = async ({
  receivedMessage,
  existingSessionId,
  newSessionId,
}: {
  receivedMessage: WhatsAppIncomingMessage
  existingSessionId?: string
  newSessionId: string
}): Promise<{
  isReplyingWasSet: boolean
  incomingMessages: WhatsAppIncomingMessage[]
}> => {
  if (redis && ['document', 'video', 'image'].includes(receivedMessage.type)) {
    const redisKey = `wasession:${newSessionId}`
    try {
      const len = await redis.rpush(redisKey, JSON.stringify(receivedMessage))

      if (len === 1) {
        await setIsReplyingInChatSession({
          existingSessionId,
          newSessionId,
        })
      }

      await new Promise((resolve) =>
        setTimeout(resolve, incomingMessageDebounce)
      )

      const newMessagesResponse = await redis.lrange(redisKey, 0, -1)

      if (!newMessagesResponse || newMessagesResponse.length > len) {
        // Current message was aggregated with other messages another webhook handler. Skipping...
        return { isReplyingWasSet: true, incomingMessages: [] }
      }

      redis.del(redisKey).then()

      return {
        isReplyingWasSet: true,
        incomingMessages: newMessagesResponse.map((msgStr) =>
          JSON.parse(msgStr)
        ),
      }
    } catch (error) {
      console.error('Failed to process webhook event:', error, receivedMessage)
    }
  }

  return {
    isReplyingWasSet: false,
    incomingMessages: [receivedMessage],
  }
}
