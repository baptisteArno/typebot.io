import { options as createChatCompletionOption } from '../actions/createChatCompletion'
import { VariableStore } from '@typebot.io/forge'
import { isDefined, isNotEmpty } from '@typebot.io/lib'
import { z } from '@typebot.io/forge/zod'
import { CoreMessage } from 'ai'

export const parseMessages = ({
  options: { messages },
  variables,
}: {
  options: Pick<z.infer<typeof createChatCompletionOption>, 'messages'>
  variables: VariableStore
}) =>
  messages
    ?.flatMap<CoreMessage | undefined>((message) => {
      if (!message.role) return

      if (message.role === 'Dialogue') {
        if (!message.dialogueVariableId) return
        const dialogue = variables.get(message.dialogueVariableId) ?? []
        const dialogueArr = Array.isArray(dialogue) ? dialogue : [dialogue]

        return dialogueArr.map((dialogueItem, index) => {
          if (dialogueItem === null) return
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
      }
    })
    .filter(isDefined)
    .filter(
      (message) =>
        isNotEmpty(message?.role) && isNotEmpty(message?.content?.toString())
    ) ?? []
