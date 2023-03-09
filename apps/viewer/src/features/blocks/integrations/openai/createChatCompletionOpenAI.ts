import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { parseVariables, updateVariables } from '@/features/variables/utils'
import prisma from '@/lib/prisma'
import { SessionState, VariableWithUnknowValue } from 'models'
import {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
} from 'models/features/blocks/integrations/openai'
import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from 'openai'
import { isDefined, byId, isNotEmpty } from 'utils'
import { decrypt } from 'utils/api/encryption'

export const createChatCompletionOpenAI = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
  }: { outgoingEdgeId?: string; options: ChatCompletionOpenAIOptions }
): Promise<ExecuteIntegrationResponse> => {
  const {
    typebot: { variables },
  } = state
  if (!options.credentialsId) return { outgoingEdgeId }
  const credentials = await prisma.credentials.findUnique({
    where: {
      id: options.credentialsId,
    },
  })
  if (!credentials) return { outgoingEdgeId }
  const { apiKey } = decrypt(
    credentials.data,
    credentials.iv
  ) as OpenAICredentials['data']
  const configuration = new Configuration({
    apiKey,
  })
  const openai = new OpenAIApi(configuration)
  const {
    data: { choices, usage },
  } = await openai.createChatCompletion({
    model: options.model,
    messages: options.messages
      .map((message) => ({
        role: message.role,
        content: parseVariables(variables)(message.content),
      }))
      .filter(
        (message) => isNotEmpty(message.role) && isNotEmpty(message.content)
      ) as ChatCompletionRequestMessage[],
  })
  const messageContent = choices[0].message?.content
  const totalTokens = usage?.total_tokens
  if (!messageContent) {
    return { outgoingEdgeId }
  }
  const newVariables = options.responseMapping.reduce<
    VariableWithUnknowValue[]
  >((newVariables, mapping) => {
    const existingVariable = variables.find(byId(mapping.variableId))
    if (!existingVariable) return newVariables
    if (mapping.valueToExtract === 'Message content') {
      newVariables.push({
        ...existingVariable,
        value: messageContent,
      })
    }
    if (mapping.valueToExtract === 'Total tokens' && isDefined(totalTokens)) {
      newVariables.push({
        ...existingVariable,
        value: totalTokens,
      })
    }
    return newVariables
  }, [])
  if (newVariables.length > 0) {
    const newSessionState = await updateVariables(state)(newVariables)
    return {
      outgoingEdgeId,
      newSessionState,
    }
  }
  return {
    outgoingEdgeId,
  }
}
