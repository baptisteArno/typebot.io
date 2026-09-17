import { isDefined } from '@typebot.io/lib/utils'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { getSession } from '../queries/getSession'
import { continueBotFlow } from '../continueBotFlow'
import { saveStateToDatabase } from '../saveStateToDatabase'
import { startSession } from '../startSession'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import { createHttpReqResponseMappingRunner } from '@typebot.io/variables/codeRunners'
import { buildChatChunkResponse } from './helpers/buildChatChunkResponse'

/**
 * A Webhook block's callback URL is scoped to one block. This derives a
 * deterministic session id from (blockId, externalId) so the same caller
 * always maps back to the same conversation, with no extra table needed —
 * the same trick this fork already uses for WhatsApp sessions (`wa-...`).
 */
export const buildExternalWebhookSessionId = (
  blockId: string,
  externalId: string
) => `wh-${blockId}-${externalId}`

type Props = {
  typebotId: string
  blockId: string
  /** Caller-supplied identifier — a phone number, a lead ID, anything that
   * uniquely identifies this contact in the caller's own system. */
  externalId: string
  /** The raw JSON (or plain-text) body posted by the external service. */
  body: unknown
  /** Only needed to start a brand-new conversation; unused when an existing
   * session is found and simply resumed. */
  startContext: {
    /** The typebot's public ID; null when it has never been published. */
    publicId: string | null
    /** The group the block's own outgoing edge leads to. */
    groupId: string | undefined
    responseVariableMapping:
      | { variableId?: string; bodyPath?: string }[]
      | undefined
    externalIdVariableId: string | undefined
    variables: { id: string; name: string }[]
  }
  textBubbleContentFormat?: 'richText' | 'markdown'
}

export type TriggerOrResumeWebhookResult =
  | {
      status: 'success'
      response: ReturnType<typeof buildChatChunkResponse>
    }
  | {
      status: 'error'
      code: 'NOT_PUBLISHED' | 'NOT_CONNECTED'
      message: string
    }

/**
 * Starts a new conversation for a caller this typebot has never talked to, or
 * resumes their existing one — addressed entirely by a caller-chosen
 * `externalId`, with no prior `/startChat` call required. This is what makes
 * a Webhook block usable as a genuine entry point (e.g. an SMS/lead-intake
 * channel), not just a mid-flow pause.
 *
 * - Known `externalId`, live session found: the body is fed in as the next
 *   chat reply, wherever the conversation currently is (mirrors how the
 *   built-in WhatsApp channel treats any inbound message).
 * - Unknown `externalId` (or its session expired): a fresh conversation is
 *   created, entering directly at the group this block's outgoing edge
 *   points to — skipping the Start event entirely.
 */
export const triggerOrResumeWebhookByExternalId = async ({
  blockId,
  externalId,
  body,
  startContext,
  textBubbleContentFormat = 'richText',
}: Props): Promise<TriggerOrResumeWebhookResult> => {
  const sessionId = buildExternalWebhookSessionId(blockId, externalId)
  const session = await getSession(sessionId)

  const isSessionExpired =
    session &&
    isDefined(session.state.expiryTimeout) &&
    session.updatedAt.getTime() + session.state.expiryTimeout < Date.now()

  if (session && !isSessionExpired) {
    const replyText =
      typeof body === 'string' ? body : JSON.stringify(body ?? {})

    const continuedFlow = await continueBotFlow(
      { type: 'text', text: replyText },
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
        session: { id: session.id, state: newSessionState },
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

  // No live session for this externalId (first contact, or its previous
  // session expired) — start a fresh one, entering directly at the group
  // this block's outgoing edge leads to.
  const {
    publicId,
    groupId,
    responseVariableMapping,
    externalIdVariableId,
    variables,
  } = startContext

  if (!publicId)
    return {
      status: 'error',
      code: 'NOT_PUBLISHED',
      message:
        'This typebot must be published before it can be triggered by webhook.',
    }

  if (!groupId)
    return {
      status: 'error',
      code: 'NOT_CONNECTED',
      message:
        "This Webhook block isn't connected to anything, so it can't start a new conversation. Connect it to a group first.",
    }

  const prefilledVariables: Record<string, unknown> = {}

  if (responseVariableMapping?.length) {
    let run: ((expression: string) => unknown) | undefined
    try {
      run = createHttpReqResponseMappingRunner({ data: body })
    } catch (err) {
      run = undefined
    }
    for (const mapping of responseVariableMapping) {
      if (!mapping.bodyPath || !mapping.variableId || !run) continue
      const variable = variables.find((v) => v.id === mapping.variableId)
      if (!variable) continue
      try {
        prefilledVariables[variable.name] = run(
          parseVariables(variables as never)(mapping.bodyPath)
        )
      } catch (err) {
        // Skip an unmappable field rather than failing the whole trigger.
      }
    }
  }

  if (externalIdVariableId) {
    const variable = variables.find((v) => v.id === externalIdVariableId)
    if (variable) prefilledVariables[variable.name] = externalId
  }

  const started = await startSession({
    version: 2,
    startParams: {
      type: 'live',
      publicId,
      prefilledVariables,
      startFrom: { type: 'group', groupId },
      isOnlyRegistering: false,
      isStreamEnabled: false,
      textBubbleContentFormat,
    },
  })

  const {
    messages,
    input,
    clientSideActions,
    newSessionState,
    logs,
    visitedEdges,
    setVariableHistory,
  } = started

  await saveStateToDatabase({
    session: { state: newSessionState },
    initialSessionId: sessionId,
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
      sessionId,
      messages,
      input,
      clientSideActions,
      newSessionState,
      logs,
      lastMessageNewFormat: undefined,
    }),
  }
}
