import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { ChatCompletionOpenAIOptions } from '@typebot.io/schemas/features/blocks/integrations/openai'
import { OpenAI } from 'openai'
import { decryptV2 } from '@typebot.io/lib/api/encryption/decryptV2'
import { forgedBlocks } from '@typebot.io/forge-repository/definitions'
import { ReadOnlyVariableStore } from '@typebot.io/forge'
import {
  ParseVariablesOptions,
  parseVariables,
} from '@typebot.io/variables/parseVariables'
import { getOpenAIChatCompletionStream } from './legacy/getOpenAIChatCompletionStream'
import { getCredentials } from '../queries/getCredentials'
import { getSession } from '../queries/getSession'
import { getBlockById } from '@typebot.io/schemas/helpers'
import { isForgedBlockType } from '@typebot.io/schemas/features/blocks/forged/helpers'

type Props = {
  sessionId: string
  messages: OpenAI.Chat.ChatCompletionMessage[] | undefined
}

export const getMessageStream = async ({ sessionId, messages }: Props) => {
  const session = await getSession(sessionId)

  if (!session?.state || !session.state.currentBlockId)
    return { status: 404, message: 'Could not find session' }

  const { group, block } = getBlockById(
    session.state.currentBlockId,
    session.state.typebotsQueue[0].typebot.groups
  )
  if (!block || !group)
    return {
      status: 404,
      message: 'Could not find block or group',
    }

  if (!('options' in block))
    return {
      status: 400,
      message: 'This block does not have options',
    }

  if (block.type === IntegrationBlockType.OPEN_AI && messages) {
    try {
      const stream = await getOpenAIChatCompletionStream(
        session.state,
        block.options as ChatCompletionOpenAIOptions,
        messages
      )
      if (!stream)
        return {
          status: 500,
          message: 'Could not create stream',
        }

      return { stream }
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        const { message } = error
        return {
          status: 500,
          message,
        }
      } else {
        throw error
      }
    }
  }
  if (!isForgedBlockType(block.type))
    return {
      status: 400,
      message: 'This block does not have a stream function',
    }

  const blockDef = forgedBlocks[block.type]
  const action = blockDef?.actions.find((a) => a.name === block.options?.action)

  if (!action || !action.run?.stream)
    return {
      status: 400,
      message: 'This block does not have a stream function',
    }

  try {
    if (!block.options.credentialsId)
      return { status: 404, message: 'Could not find credentials' }
    const credentials = await getCredentials(block.options.credentialsId)
    if (!credentials)
      return { status: 404, message: 'Could not find credentials' }
    const decryptedCredentials = await decryptV2(
      credentials.data,
      credentials.iv
    )
    const variables: ReadOnlyVariableStore = {
      list: () => session.state.typebotsQueue[0].typebot.variables,
      get: (id: string) => {
        const variable = session.state.typebotsQueue[0].typebot.variables.find(
          (variable) => variable.id === id
        )
        return variable?.value
      },
      parse: (text: string, params?: ParseVariablesOptions) =>
        parseVariables(
          session.state.typebotsQueue[0].typebot.variables,
          params
        )(text),
    }
    const stream = await action.run.stream.run({
      credentials: decryptedCredentials,
      options: block.options,
      variables,
    })
    if (!stream) return { status: 500, message: 'Could not create stream' }

    return { stream }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { message } = error
      return {
        status: 500,
        message,
      }
    }
    return {
      status: 500,
      message: 'Could not create stream',
    }
  }
}
