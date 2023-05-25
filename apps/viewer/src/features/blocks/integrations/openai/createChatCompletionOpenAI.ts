import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { transformStringVariablesToList } from '@/features/variables/transformVariablesToList'
import prisma from '@/lib/prisma'
import {
  ChatReply,
  SessionState,
  Variable,
  VariableWithValue,
} from '@typebot.io/schemas'
import {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
  modelLimit,
} from '@typebot.io/schemas/features/blocks/integrations/openai'
import type {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from 'openai'
import { byId, isNotEmpty, isEmpty } from '@typebot.io/lib'
import { decrypt, isCredentialsV2 } from '@typebot.io/lib/api/encryption'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { updateVariables } from '@/features/variables/updateVariables'
import { parseVariables } from '@/features/variables/parseVariables'
import { parseVariableNumber } from '@/features/variables/parseVariableNumber'
import { encoding_for_model } from '@dqbd/tiktoken'
import got from 'got'
import { resumeChatCompletion } from './resumeChatCompletion'
import { isPlaneteScale } from '@/helpers/api/isPlanetScale'
import { isVercel } from '@/helpers/api/isVercel'

const minTokenCompletion = 200
const createChatEndpoint = 'https://api.openai.com/v1/chat/completions'

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
  const { variablesTransformedToList, messages } = parseMessages(
    newSessionState.typebot.variables,
    options.model
  )(options.messages)
  if (variablesTransformedToList.length > 0)
    newSessionState = await updateVariables(state)(variablesTransformedToList)

  const temperature = parseVariableNumber(newSessionState.typebot.variables)(
    options.advancedSettings?.temperature
  )

  try {
    if (
      isPlaneteScale() &&
      isVercel() &&
      isCredentialsV2(credentials) &&
      newSessionState.isStreamEnabled
    )
      return {
        clientSideActions: [{ streamOpenAiChatCompletion: { messages } }],
        outgoingEdgeId,
        newSessionState,
      }
    const response = await got
      .post(createChatEndpoint, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        json: {
          model: options.model,
          messages,
          temperature,
        } satisfies CreateChatCompletionRequest,
      })
      .json<CreateChatCompletionResponse>()
    const messageContent = response.choices.at(0)?.message?.content
    const totalTokens = response.usage?.total_tokens
    if (isEmpty(messageContent)) {
      console.error('OpenAI block returned empty message', response)
      return { outgoingEdgeId, newSessionState }
    }
    return resumeChatCompletion(newSessionState, {
      options,
      outgoingEdgeId,
    })(messageContent, totalTokens)
  } catch (err) {
    const log: NonNullable<ChatReply['logs']>[number] = {
      status: 'error',
      description: 'OpenAI block returned error',
    }

    if (err && typeof err === 'object') {
      if ('response' in err) {
        const { status, data } = err.response as {
          status: string
          data: string
        }
        log.details = {
          status,
          data,
        }
      } else if ('message' in err) {
        log.details = err.message
      }
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
  (variables: Variable[], model: ChatCompletionOpenAIOptions['model']) =>
  (
    messages: ChatCompletionOpenAIOptions['messages']
  ): {
    variablesTransformedToList: VariableWithValue[]
    messages: ChatCompletionRequestMessage[]
  } => {
    const variablesTransformedToList: VariableWithValue[] = []
    const firstMessagesSequenceIndex = messages.findIndex(
      (message) => message.role === 'Messages sequence ✨'
    )
    const parsedMessages = messages
      .flatMap((message, index) => {
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

          let allMessages: ChatCompletionRequestMessage[] = []

          if (userMessages.length > assistantMessages.length)
            allMessages = userMessages.flatMap((userMessage, index) => [
              {
                role: 'user',
                content: userMessage,
              },
              { role: 'assistant', content: assistantMessages.at(index) ?? '' },
            ]) satisfies ChatCompletionRequestMessage[]
          else {
            allMessages = assistantMessages.flatMap(
              (assistantMessage, index) => [
                { role: 'assistant', content: assistantMessage },
                {
                  role: 'user',
                  content: userMessages.at(index) ?? '',
                },
              ]
            ) satisfies ChatCompletionRequestMessage[]
          }

          if (index !== firstMessagesSequenceIndex) return allMessages

          const encoder = encoding_for_model(model)
          let messagesToSend: ChatCompletionRequestMessage[] = []
          let tokenCount = 0

          for (let i = allMessages.length - 1; i >= 0; i--) {
            const message = allMessages[i]
            const tokens = encoder.encode(message.content)

            if (
              tokenCount + tokens.length - minTokenCompletion >
              modelLimit[model]
            ) {
              break
            }
            tokenCount += tokens.length
            messagesToSend = [message, ...messagesToSend]
          }

          encoder.free()

          return messagesToSend
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
