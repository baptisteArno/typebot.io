import type { OpenAI } from 'openai'
import { options as createChatCompletionOption } from '../actions/createChatCompletion'
import { ReadOnlyVariableStore } from '@typebot.io/forge'
import { isNotEmpty } from '@typebot.io/lib'
import { z } from '@typebot.io/forge/zod'

export const parseChatCompletionMessages = ({
  options: { messages },
  variables,
}: {
  options: Pick<z.infer<typeof createChatCompletionOption>, 'messages'>
  variables: ReadOnlyVariableStore
}): OpenAI.Chat.ChatCompletionMessageParam[] => {
  const parsedMessages = messages
    ?.flatMap((message) => {
      if (!message.role) return

      if (message.role === 'Dialogue') {
        if (!message.dialogueVariableId) return
        const dialogue = variables.get(message.dialogueVariableId) ?? []
        const dialogueArr = Array.isArray(dialogue) ? dialogue : [dialogue]

        return dialogueArr.map<OpenAI.Chat.ChatCompletionMessageParam>(
          (dialogueItem, index) => {
            if (index === 0 && message.startsBy === 'assistant')
              return {
                role: 'assistant',
                content: dialogueItem,
              }
            return {
              role:
                index % (message.startsBy === 'assistant' ? 1 : 2) === 0
                  ? 'user'
                  : 'assistant',
              content: dialogueItem,
            }
          }
        )
      }

      if (!message.content) return

      return {
        role: message.role,
        content: variables.parse(message.content),
      } satisfies OpenAI.Chat.ChatCompletionMessageParam
    })
    .filter(
      (message) =>
        isNotEmpty(message?.role) && isNotEmpty(message?.content?.toString())
    ) as OpenAI.Chat.ChatCompletionMessageParam[]

  return parsedMessages
}
