import {
  Block,
  Credentials,
  SessionState,
  SniperInSession,
} from '@sniper.io/schemas'
import {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
} from '@sniper.io/schemas/features/blocks/integrations/openai'
import { byId, isEmpty } from '@sniper.io/lib'
import { decrypt } from '@sniper.io/lib/api/encryption/decrypt'
import { resumeChatCompletion } from './resumeChatCompletion'
import { parseChatCompletionMessages } from './parseChatCompletionMessages'
import { executeChatCompletionOpenAIRequest } from './executeChatCompletionOpenAIRequest'
import prisma from '@sniper.io/lib/prisma'
import { ExecuteIntegrationResponse } from '../../../../types'
import { parseVariableNumber } from '@sniper.io/variables/parseVariableNumber'
import { updateVariablesInSession } from '@sniper.io/variables/updateVariablesInSession'
import {
  chatCompletionMessageRoles,
  defaultOpenAIOptions,
} from '@sniper.io/schemas/features/blocks/integrations/openai/constants'
import { BubbleBlockType } from '@sniper.io/schemas/features/blocks/bubbles/constants'

export const createChatCompletionOpenAI = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
    blockId,
  }: {
    outgoingEdgeId?: string
    options: ChatCompletionOpenAIOptions
    blockId: string
  }
): Promise<ExecuteIntegrationResponse> => {
  let newSessionState = state
  const noCredentialsError = {
    status: 'error',
    description: 'Make sure to select an OpenAI account',
  }

  if (!options.credentialsId) {
    return {
      outgoingEdgeId,
      logs: [noCredentialsError],
    }
  }
  const credentials = await prisma.credentials.findUnique({
    where: {
      id: options.credentialsId,
    },
  })
  if (!credentials) {
    console.error('Could not find credentials in database')
    return { outgoingEdgeId, logs: [noCredentialsError] }
  }
  const { apiKey } = (await decrypt(
    credentials.data,
    credentials.iv
  )) as OpenAICredentials['data']

  const { sniper } = newSessionState.snipersQueue[0]

  const { variablesTransformedToList, messages } = parseChatCompletionMessages(
    sniper.variables
  )(options.messages)
  if (variablesTransformedToList.length > 0)
    newSessionState = updateVariablesInSession({
      state,
      newVariables: variablesTransformedToList,
      currentBlockId: undefined,
    }).updatedState

  const temperature = parseVariableNumber(sniper.variables)(
    options.advancedSettings?.temperature
  )

  const assistantMessageVariableName = sniper.variables.find(
    (variable) =>
      options.responseMapping?.find(
        (m) => m.valueToExtract === 'Message content'
      )?.variableId === variable.id
  )?.name

  if (
    newSessionState.isStreamEnabled &&
    !newSessionState.whatsApp &&
    isNextBubbleMessageWithAssistantMessage(sniper)(
      blockId,
      assistantMessageVariableName
    )
  ) {
    return {
      clientSideActions: [
        {
          type: 'streamOpenAiChatCompletion',
          streamOpenAiChatCompletion: {
            messages: messages as {
              content?: string
              role: (typeof chatCompletionMessageRoles)[number]
            }[],
          },
          expectsDedicatedReply: true,
        },
      ],
      outgoingEdgeId,
      newSessionState,
    }
  }

  const { chatCompletion, logs } = await executeChatCompletionOpenAIRequest({
    apiKey,
    messages,
    model: options.model ?? defaultOpenAIOptions.model,
    temperature,
    baseUrl: options.baseUrl,
    apiVersion: options.apiVersion,
  })
  if (!chatCompletion)
    return {
      startTimeShouldBeUpdated: true,
      outgoingEdgeId,
      logs,
    }
  const messageContent = chatCompletion.choices.at(0)?.message?.content
  const totalTokens = chatCompletion.usage?.total_tokens
  if (isEmpty(messageContent)) {
    console.error('OpenAI block returned empty message', chatCompletion.choices)
    return { outgoingEdgeId, newSessionState, startTimeShouldBeUpdated: true }
  }
  return {
    ...(await resumeChatCompletion(newSessionState, {
      options,
      outgoingEdgeId,
      logs,
    })(messageContent, totalTokens)),
    startTimeShouldBeUpdated: true,
  }
}

const isNextBubbleMessageWithAssistantMessage =
  (sniper: SniperInSession) =>
  (blockId: string, assistantVariableName?: string): boolean => {
    if (!assistantVariableName) return false
    const nextBlock = getNextBlock(sniper)(blockId)
    if (!nextBlock) return false
    return (
      nextBlock.type === BubbleBlockType.TEXT &&
      (nextBlock.content?.richText?.length ?? 0) > 0 &&
      nextBlock.content?.richText?.at(0)?.children.at(0).text ===
        `{{${assistantVariableName}}}`
    )
  }

const getNextBlock =
  (sniper: SniperInSession) =>
  (blockId: string): Block | undefined => {
    const group = sniper.groups.find((group) =>
      group.blocks.find(byId(blockId))
    )
    if (!group) return
    const blockIndex = group.blocks.findIndex(byId(blockId))
    const nextBlockInGroup = group.blocks.at(blockIndex + 1)
    if (nextBlockInGroup) return nextBlockInGroup
    const outgoingEdgeId = group.blocks.at(blockIndex)?.outgoingEdgeId
    if (!outgoingEdgeId) return
    const outgoingEdge = sniper.edges.find(byId(outgoingEdgeId))
    if (!outgoingEdge) return
    const connectedGroup = sniper.groups.find(byId(outgoingEdge?.to.groupId))
    if (!connectedGroup) return
    return outgoingEdge.to.blockId
      ? connectedGroup.blocks.find(
          (block) => block.id === outgoingEdge.to.blockId
        )
      : connectedGroup?.blocks.at(0)
  }

const isCredentialsV2 = (credentials: Pick<Credentials, 'iv'>) =>
  credentials.iv.length === 24
