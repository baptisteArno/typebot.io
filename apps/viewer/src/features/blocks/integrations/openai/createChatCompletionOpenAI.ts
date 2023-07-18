import { ExecuteIntegrationResponse } from '@/features/chat/types'
import prisma from '@/lib/prisma'
import { SessionState } from '@typebot.io/schemas'
import {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
  chatCompletionMessageRoles,
} from '@typebot.io/schemas/features/blocks/integrations/openai'
import { isEmpty } from '@typebot.io/lib'
import { decrypt, isCredentialsV2 } from '@typebot.io/lib/api/encryption'
import { updateVariables } from '@/features/variables/updateVariables'
import { parseVariableNumber } from '@/features/variables/parseVariableNumber'
import { resumeChatCompletion } from './resumeChatCompletion'
import { parseChatCompletionMessages } from './parseChatCompletionMessages'
import { executeChatCompletionOpenAIRequest } from './executeChatCompletionOpenAIRequest'
import { isPlaneteScale } from '@/helpers/api/isPlanetScale'

export const createChatCompletionOpenAI = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: ChatCompletionOpenAIOptions }
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
  const { variablesTransformedToList, messages } = parseChatCompletionMessages(
    newSessionState.typebot.variables
  )(options.messages)
  if (variablesTransformedToList.length > 0)
    newSessionState = updateVariables(state)(variablesTransformedToList)

  const temperature = parseVariableNumber(newSessionState.typebot.variables)(
    options.advancedSettings?.temperature
  )

  if (
    isPlaneteScale() &&
    isCredentialsV2(credentials) &&
    newSessionState.isStreamEnabled
  )
    return {
      clientSideActions: [
        {
          streamOpenAiChatCompletion: {
            messages: messages as {
              content?: string
              role: (typeof chatCompletionMessageRoles)[number]
            }[],
          },
        },
      ],
      outgoingEdgeId,
      newSessionState,
    }
  const { response, logs } = await executeChatCompletionOpenAIRequest({
    apiKey,
    messages,
    model: options.model,
    temperature,
  })
  if (!response)
    return {
      outgoingEdgeId,
      logs,
    }
  const messageContent = response.choices.at(0)?.message?.content
  const totalTokens = response.usage?.total_tokens
  if (isEmpty(messageContent)) {
    console.error('OpenAI block returned empty message', response)
    return { outgoingEdgeId, newSessionState }
  }
  return resumeChatCompletion(newSessionState, {
    options,
    outgoingEdgeId,
    logs,
  })(messageContent, totalTokens)
}
