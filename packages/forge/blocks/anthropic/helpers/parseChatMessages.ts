import { Anthropic } from '@anthropic-ai/sdk'
import { options as createMessageOptions } from '../actions/createChatMessage'
import { ReadOnlyVariableStore } from '@typebot.io/forge'
import { isNotEmpty } from '@typebot.io/lib'
import { z } from '@typebot.io/forge/zod'

export const parseChatMessages = ({
  options: { messages },
  variables,
}: {
  options: Pick<z.infer<typeof createMessageOptions>, 'messages'>
  variables: ReadOnlyVariableStore
}): Anthropic.Messages.MessageParam[] => {
  const parsedMessages = messages
    ?.flatMap((message) => {
      if (!message.role) return

      if (message.role === 'Dialogue') {
        if (!message.dialogueVariableId) return
        const dialogue = variables.get(message.dialogueVariableId) ?? []
        const dialogueArr = Array.isArray(dialogue) ? dialogue : [dialogue]

        return dialogueArr.map((dialogueItem, index) => {
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
        })
      }

      if (!message.content) return

      return {
        role: message.role,
        content: variables.parse(message.content),
      } satisfies Anthropic.Messages.MessageParam
    })
    .filter(
      (message) =>
        isNotEmpty(message?.role) && isNotEmpty(message?.content?.toString())
    ) as Anthropic.Messages.MessageParam[]

  return parsedMessages
}
