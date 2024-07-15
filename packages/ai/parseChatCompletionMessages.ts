import {
  CoreAssistantMessage,
  CoreMessage,
  CoreUserMessage,
  ToolCallPart,
  ToolResultPart,
} from 'ai'
import { VariableStore } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { splitUserTextMessageIntoBlocks } from './splitUserTextMessageIntoBlocks'

export const parseChatCompletionMessages = async ({
  messages,
  isVisionEnabled,
  shouldDownloadImages,
  variables,
  toolCalls,
  toolResults,
}: {
  messages:
    | Array<
        | {
            role: 'Dialogue'
            startsBy?: 'user' | 'assistant'
            dialogueVariableId?: string
          }
        | {
            role: 'user' | 'assistant' | 'system'
            content?: string
          }
      >
    | undefined
  isVisionEnabled: boolean
  shouldDownloadImages: boolean
  variables: VariableStore
  toolCalls?: ToolCallPart[]
  toolResults?: ToolResultPart[]
}): Promise<CoreMessage[]> => {
  if (!messages) return []
  const parsedMessages: CoreMessage[] = (
    await Promise.all(
      messages.map(async (message) => {
        if (!message.role) return

        if (message.role === 'Dialogue') {
          if (!message.dialogueVariableId) return
          const dialogue = variables.get(message.dialogueVariableId) ?? []
          const dialogueArr = Array.isArray(dialogue) ? dialogue : [dialogue]

          return Promise.all(
            dialogueArr.map<
              Promise<CoreUserMessage | CoreAssistantMessage | undefined>
            >(async (dialogueItem, index) => {
              if (!dialogueItem) return
              if (index === 0 && message.startsBy === 'assistant')
                return {
                  role: 'assistant' as const,
                  content: dialogueItem,
                }
              if (index % (message.startsBy === 'assistant' ? 1 : 2) === 0) {
                return {
                  role: 'user' as const,
                  content: isVisionEnabled
                    ? await splitUserTextMessageIntoBlocks({
                        input: dialogueItem ?? '',
                        shouldDownloadImages,
                      })
                    : dialogueItem,
                }
              }
              return {
                role: 'assistant' as const,
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
            role: 'user' as const,
            content: isVisionEnabled
              ? await splitUserTextMessageIntoBlocks({
                  input: content,
                  shouldDownloadImages,
                })
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
    .filter(isDefined)

  if (toolCalls && toolCalls.length > 0) {
    parsedMessages.push({
      role: 'assistant',
      content: toolCalls,
    })
  }

  if (toolResults && toolResults.length > 0) {
    parsedMessages.push({
      role: 'tool',
      content: toolResults,
    })
  }
  return parsedMessages
}
