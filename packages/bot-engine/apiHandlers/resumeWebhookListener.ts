import prisma from '@typebot.io/lib/prisma'
import { isDefined } from '@typebot.io/lib/utils'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { getSession } from '../queries/getSession'
import { continueBotFlow } from '../continueBotFlow'
import { saveStateToDatabase } from '../saveStateToDatabase'
import { buildChatChunkResponse } from './helpers/buildChatChunkResponse'

type Props = {
  typebotId: string
  resultId: string
  blockId: string
  /**
   * The raw JSON body posted by the external service. It is handed to the flow
   * wrapped as `{ data: body }`, so a block's `bodyPath` expressions read
   * `data.foo` — the same envelope typebot.io uses.
   */
  body: unknown
  textBubbleContentFormat?: 'richText' | 'markdown'
}

export type ResumeWebhookListenerResult =
  | {
      status: 'success'
      response: ReturnType<typeof buildChatChunkResponse>
    }
  | {
      status: 'error'
      code: 'NOT_FOUND' | 'CONFLICT' | 'UNSUPPORTED_CHANNEL'
      message: string
    }

/**
 * Resumes a conversation that is parked on a Webhook listener block, addressed
 * by the resultId of an already-known session (e.g. one you started yourself
 * via /startChat). Requires the conversation to be waiting on THIS exact
 * block — for a webhook that should also be able to start a brand-new
 * conversation for a caller it's never seen, see
 * `triggerOrResumeWebhookByExternalId`.
 *
 * Unlike typebot.io — which relays the payload to a PartyKit room that the
 * waiting browser holds a socket to — this advances the flow server-side and
 * returns the resulting chat chunk, in the same shape as `continueChat`. The
 * caller (the Hub) relays those messages to the end user.
 */
export const resumeWebhookListener = async ({
  typebotId,
  resultId,
  blockId,
  body,
  textBubbleContentFormat = 'richText',
}: Props): Promise<ResumeWebhookListenerResult> => {
  const result = await prisma.result.findFirst({
    where: { id: resultId, typebotId },
    select: { lastChatSessionId: true },
  })

  if (!result?.lastChatSessionId)
    return {
      status: 'error',
      code: 'NOT_FOUND',
      message: 'No chat session found for this result.',
    }

  const session = await getSession(result.lastChatSessionId)

  if (!session)
    return {
      status: 'error',
      code: 'NOT_FOUND',
      message: 'No chat session found for this result.',
    }

  const isSessionExpired =
    isDefined(session.state.expiryTimeout) &&
    session.updatedAt.getTime() + session.state.expiryTimeout < Date.now()

  if (isSessionExpired)
    return {
      status: 'error',
      code: 'NOT_FOUND',
      message: 'Session expired. The conversation is no longer waiting.',
    }

  // Resuming a WhatsApp session would advance the flow but leave the generated
  // messages undelivered, because nothing pushes them to the Cloud API on this
  // path. Fail loudly instead of silently corrupting the conversation.
  if (session.state.whatsApp)
    return {
      status: 'error',
      code: 'UNSUPPORTED_CHANNEL',
      message:
        'This chat session runs on the built-in WhatsApp channel, which does not support webhook resume.',
    }

  // The session must still be parked on THIS block. Guards against a duplicate
  // or late call injecting its payload wherever the conversation has got to.
  if (session.state.currentBlockId !== blockId)
    return {
      status: 'error',
      code: 'CONFLICT',
      message: session.state.currentBlockId
        ? 'The conversation is not waiting on this webhook block.'
        : 'The conversation is not waiting for a webhook.',
    }

  const continuedFlow = await continueBotFlow(
    { type: 'text', text: JSON.stringify({ data: body }) },
    {
      version: 2,
      state: session.state,
      startTime: Date.now(),
      textBubbleContentFormat,
    }
  )

  const {
    messages,
    input,
    clientSideActions,
    newSessionState,
    logs,
    lastMessageNewFormat,
    visitedEdges,
    setVariableHistory,
  } = continuedFlow

  if (newSessionState)
    await saveStateToDatabase({
      session: {
        id: session.id,
        state: newSessionState,
      },
      input,
      logs,
      clientSideActions,
      visitedEdges,
      setVariableHistory,
      hasEmbedBubbleWithWaitEvent: messages.some(
        (message) =>
          message.type === 'custom-embed' ||
          (message.type === BubbleBlockType.EMBED &&
            message.content.waitForEvent?.isEnabled)
      ),
    })

  return {
    status: 'success',
    response: buildChatChunkResponse({
      sessionId: session.id,
      messages,
      input,
      clientSideActions,
      newSessionState,
      logs,
      lastMessageNewFormat,
    }),
  }
}
