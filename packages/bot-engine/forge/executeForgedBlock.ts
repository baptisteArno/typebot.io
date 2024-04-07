import { VariableStore, LogsStore } from '@typebot.io/forge'
import { forgedBlocks } from '@typebot.io/forge-repository/definitions'
import { ForgedBlock } from '@typebot.io/forge-repository/types'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { isPlaneteScale } from '@typebot.io/lib/isPlanetScale'
import {
  SessionState,
  ContinueChatResponse,
  Block,
  TypebotInSession,
} from '@typebot.io/schemas'
import { deepParseVariables } from '@typebot.io/variables/deepParseVariables'
import {
  ParseVariablesOptions,
  parseVariables,
} from '@typebot.io/variables/parseVariables'
import { updateVariablesInSession } from '@typebot.io/variables/updateVariablesInSession'
import { ExecuteIntegrationResponse } from '../types'
import { byId } from '@typebot.io/lib'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { getCredentials } from '../queries/getCredentials'

export const executeForgedBlock = async (
  state: SessionState,
  block: ForgedBlock
): Promise<ExecuteIntegrationResponse> => {
  const blockDef = forgedBlocks[block.type]
  if (!blockDef) return { outgoingEdgeId: block.outgoingEdgeId }
  const action = blockDef.actions.find((a) => a.name === block.options.action)
  const noCredentialsError = {
    status: 'error',
    description: 'Credentials not provided for integration',
  }

  let credentials: { data: string; iv: string } | null = null
  if (blockDef.auth) {
    if (!block.options.credentialsId) {
      return {
        outgoingEdgeId: block.outgoingEdgeId,
        logs: [noCredentialsError],
      }
    }
    credentials = await getCredentials(block.options.credentialsId)
    if (!credentials) {
      console.error('Could not find credentials in database')
      return {
        outgoingEdgeId: block.outgoingEdgeId,
        logs: [noCredentialsError],
      }
    }
  }

  const typebot = state.typebotsQueue[0].typebot
  if (
    action?.run?.stream &&
    isNextBubbleTextWithStreamingVar(typebot)(
      block.id,
      action.run.stream.getStreamVariableId(block.options)
    ) &&
    state.isStreamEnabled &&
    !state.whatsApp &&
    // TODO: Enable once chat api is rolling
    isPlaneteScale() &&
    credentials &&
    isCredentialsV2(credentials)
    // !process.env.VERCEL_ENV
  ) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      clientSideActions: [
        {
          type: 'stream',
          expectsDedicatedReply: true,
          stream: true,
        },
      ],
    }
  }

  let newSessionState = state

  const variables: VariableStore = {
    get: (id: string) => {
      const variable = newSessionState.typebotsQueue[0].typebot.variables.find(
        (variable) => variable.id === id
      )
      return variable?.value
    },
    set: (id: string, value: unknown) => {
      const variable = newSessionState.typebotsQueue[0].typebot.variables.find(
        (variable) => variable.id === id
      )
      if (!variable) return
      newSessionState = updateVariablesInSession(newSessionState)([
        { ...variable, value },
      ])
    },
    parse: (text: string, params?: ParseVariablesOptions) =>
      parseVariables(
        newSessionState.typebotsQueue[0].typebot.variables,
        params
      )(text),
    list: () => newSessionState.typebotsQueue[0].typebot.variables,
  }
  let logs: NonNullable<ContinueChatResponse['logs']> = []
  const logsStore: LogsStore = {
    add: (log) => {
      if (typeof log === 'string') {
        logs.push({
          status: 'error',
          description: log,
        })
        return
      }
      logs.push(log)
    },
  }
  const credentialsData = credentials
    ? await decrypt(credentials.data, credentials.iv)
    : undefined

  const parsedOptions = deepParseVariables(
    state.typebotsQueue[0].typebot.variables
  )(block.options)
  await action?.run?.server?.({
    credentials: credentialsData ?? {},
    options: parsedOptions,
    variables,
    logs: logsStore,
  })

  const clientSideActions: ExecuteIntegrationResponse['clientSideActions'] = []

  if (action?.run?.web?.parseFunction) {
    clientSideActions.push({
      type: 'codeToExecute',
      codeToExecute: action?.run?.web?.parseFunction({
        options: parsedOptions,
      }),
    })
  }

  return {
    newSessionState,
    outgoingEdgeId: block.outgoingEdgeId,
    logs,
    clientSideActions,
    customEmbedBubble: action?.run?.web?.displayEmbedBubble
      ? {
          type: 'custom-embed',
          content: {
            maxBubbleWidth: action.run.web.displayEmbedBubble.maxBubbleWidth,
            initFunction: action.run.web.displayEmbedBubble.parseInitFunction({
              options: parsedOptions,
            }),
            waitForEventFunction:
              action.run.web.displayEmbedBubble.waitForEvent?.parseFunction?.({
                options: parsedOptions,
              }),
          },
        }
      : undefined,
  }
}

const isNextBubbleTextWithStreamingVar =
  (typebot: TypebotInSession) =>
  (blockId: string, streamVariableId?: string): boolean => {
    const streamVariable = typebot.variables.find(
      (variable) => variable.id === streamVariableId
    )
    if (!streamVariable) return false
    const nextBlock = getNextBlock(typebot)(blockId)
    if (!nextBlock) return false
    return (
      nextBlock.type === BubbleBlockType.TEXT &&
      (nextBlock.content?.richText?.length ?? 0) > 0 &&
      nextBlock.content?.richText?.at(0)?.children.at(0).text ===
        `{{${streamVariable.name}}}`
    )
  }

const getNextBlock =
  (typebot: TypebotInSession) =>
  (blockId: string): Block | undefined => {
    const group = typebot.groups.find((group) =>
      group.blocks.find(byId(blockId))
    )
    if (!group) return
    const blockIndex = group.blocks.findIndex(byId(blockId))
    const nextBlockInGroup = group.blocks.at(blockIndex + 1)
    if (nextBlockInGroup) return nextBlockInGroup
    const outgoingEdgeId = group.blocks.at(blockIndex)?.outgoingEdgeId
    if (!outgoingEdgeId) return
    const outgoingEdge = typebot.edges.find(byId(outgoingEdgeId))
    if (!outgoingEdge) return
    const connectedGroup = typebot.groups.find(byId(outgoingEdge?.to.groupId))
    if (!connectedGroup) return
    return outgoingEdge.to.blockId
      ? connectedGroup.blocks.find(
          (block) => block.id === outgoingEdge.to.blockId
        )
      : connectedGroup?.blocks.at(0)
  }

const isCredentialsV2 = (credentials: { iv: string }) =>
  credentials.iv.length === 24
