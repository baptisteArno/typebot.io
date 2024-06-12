import type { OpenAI } from 'openai'
import { VariableStore } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { ChatCompletionOptions } from '../shared/parseChatCompletionOptions'
import ky, { HTTPError } from 'ky'
import { defaultOpenAIOptions, modelsWithImageUrlSupport } from '../constants'
import { isModelCompatibleWithVision } from './isModelCompatibleWithVision'
import { splitUserTextMessageIntoBlocks } from './splitUserTextMessageIntoBlocks'

export const parseChatCompletionMessages = async ({
  options: { messages, model },
  variables,
}: {
  options: ChatCompletionOptions
  variables: VariableStore
}): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> => {
  if (!messages) return []
  const isVisionEnabled = isModelCompatibleWithVision(
    model ?? defaultOpenAIOptions.model
  )
  const parsedMessages = (
    await Promise.all(
      messages.map(async (message) => {
        if (!message.role) return

        if (message.role === 'Dialogue') {
          if (!message.dialogueVariableId) return
          const dialogue = variables.get(message.dialogueVariableId) ?? []
          const dialogueArr = Array.isArray(dialogue) ? dialogue : [dialogue]

          return Promise.all(
            dialogueArr.map(async (dialogueItem, index) => {
              if (index === 0 && message.startsBy === 'assistant')
                return {
                  role: 'assistant',
                  content: dialogueItem,
                }
              if (index % (message.startsBy === 'assistant' ? 1 : 2) === 0) {
                return {
                  role: 'user',
                  content: isVisionEnabled
                    ? await splitUserTextMessageIntoBlocks(dialogueItem ?? '')
                    : dialogueItem,
                }
              }
              return {
                role: 'assistant',
                content: dialogueItem,
              }
            })
          )
        }

        if (!message.content) return

        const content = variables.parse(message.content)

        if (isEmpty(content)) return

        if (message.role === 'user')
          return {
            role: 'user',
            content: isVisionEnabled
              ? await splitUserTextMessageIntoBlocks(content)
              : content,
          }

        return {
          role: message.role,
          content,
        }
      })
    )
  )
    .flat()
    .filter((message) => {
      return isDefined(message?.role) && isDefined(message.content)
    }) as OpenAI.Chat.ChatCompletionMessageParam[]

  return parsedMessages
}
