import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { transformStringVariablesToList } from '@/features/variables/transformVariablesToList'
import prisma from '@/lib/prisma'
import {
  SessionState,
  Variable,
  VariableWithUnknowValue,
  VariableWithValue,
} from '@typebot.io/schemas'
import {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
} from '@typebot.io/schemas/features/blocks/integrations/openai'
import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from 'openai'
import { isDefined, byId, isNotEmpty } from '@typebot.io/lib'
import { decrypt } from '@typebot.io/lib/api/encryption'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { updateVariables } from '@/features/variables/updateVariables'
import { parseVariables } from '@/features/variables/parseVariables'

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
  let newSessionState = state
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
  const { variablesTransformedToList, messages } = parseMessages(variables)(
    options.messages
  )
  if (variablesTransformedToList.length > 0)
    newSessionState = await updateVariables(state)(variablesTransformedToList)
  const openai = new OpenAIApi(configuration)
  try {
    const {
      data: { choices, usage },
    } = await openai.createChatCompletion({
      model: options.model,
      messages,
    })
    const messageContent = choices[0].message?.content
    const totalTokens = usage?.total_tokens
    if (!messageContent) {
      return { outgoingEdgeId, newSessionState }
    }
    const newVariables = options.responseMapping.reduce<
      VariableWithUnknowValue[]
    >((newVariables, mapping) => {
      const existingVariable = variables.find(byId(mapping.variableId))
      if (!existingVariable) return newVariables
      if (mapping.valueToExtract === 'Message content') {
        newVariables.push({
          ...existingVariable,
          value: Array.isArray(existingVariable.value)
            ? existingVariable.value.concat(messageContent)
            : messageContent,
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
      newSessionState = await updateVariables(newSessionState)(newVariables)
      return {
        outgoingEdgeId,
        newSessionState,
      }
    }
    return {
      outgoingEdgeId,
      newSessionState,
    }
  } catch (err) {
    const log = {
      status: 'error',
      description: 'OpenAI block returned error',
      details: JSON.stringify(err, null, 2).substring(0, 1000),
    }
    state.result &&
      (await saveErrorLog({
        resultId: state.result.id,
        message: log.description,
        details: log.details,
      }))
    return {
      outgoingEdgeId,
      logs: [log],
      newSessionState,
    }
  }
}

const parseMessages =
  (variables: Variable[]) =>
  (
    messages: ChatCompletionOpenAIOptions['messages']
  ): {
    variablesTransformedToList: VariableWithValue[]
    messages: ChatCompletionRequestMessage[]
  } => {
    const variablesTransformedToList: VariableWithValue[] = []
    const parsedMessages = messages
      .flatMap((message) => {
        if (!message.role) return
        if (message.role === 'Messages sequence ✨') {
          if (
            !message.content?.assistantMessagesVariableId ||
            !message.content?.userMessagesVariableId
          )
            return
          variablesTransformedToList.push(
            ...transformStringVariablesToList(variables)([
              message.content.assistantMessagesVariableId,
              message.content.userMessagesVariableId,
            ])
          )
          const updatedVariables = variables.map((variable) => {
            const variableTransformedToList = variablesTransformedToList.find(
              byId(variable.id)
            )
            if (variableTransformedToList) return variableTransformedToList
            return variable
          })

          const userMessages = (updatedVariables.find(
            (variable) =>
              variable.id === message.content?.userMessagesVariableId
          )?.value ?? []) as string[]

          const assistantMessages = (updatedVariables.find(
            (variable) =>
              variable.id === message.content?.assistantMessagesVariableId
          )?.value ?? []) as string[]

          if (userMessages.length > assistantMessages.length)
            return userMessages.flatMap((userMessage, index) => [
              {
                role: 'user',
                content: userMessage,
              },
              { role: 'assistant', content: assistantMessages[index] },
            ]) satisfies ChatCompletionRequestMessage[]
          else {
            return assistantMessages.flatMap((assistantMessage, index) => [
              { role: 'assistant', content: assistantMessage },
              {
                role: 'user',
                content: userMessages[index],
              },
            ]) satisfies ChatCompletionRequestMessage[]
          }
        }
        return {
          role: message.role,
          content: parseVariables(variables)(message.content),
        } satisfies ChatCompletionRequestMessage
      })
      .filter(
        (message) => isNotEmpty(message?.role) && isNotEmpty(message?.content)
      ) as ChatCompletionRequestMessage[]

    return {
      variablesTransformedToList,
      messages: parsedMessages,
    }
  }
