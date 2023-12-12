import { z } from '@typebot.io/forge/zod'
import OpenAI from 'openai'
import { option, ReadOnlyVariableStore } from '@typebot.io/forge'

export const messageSequenceItemSchema = option
  .object({
    id: z.string(),
    role: z.literal('Messages sequence ✨'),
    content: z
      .object({
        assistantMessagesVariableId: z.string().optional(),
        userMessagesVariableId: z.string().optional(),
      })
      .optional(),
  })
  .layout({ isHidden: true })

export const parseMessagesSequence = (
  message: z.infer<typeof messageSequenceItemSchema>,
  variables: ReadOnlyVariableStore
) => {
  if (
    !message.content?.assistantMessagesVariableId ||
    !message.content?.userMessagesVariableId
  )
    return

  const userMessages = getArrVariable(
    message.content.userMessagesVariableId,
    variables
  )

  const assistantMessages = getArrVariable(
    message.content.assistantMessagesVariableId,
    variables
  )

  let allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = []

  if (userMessages.length > assistantMessages.length)
    allMessages = userMessages.flatMap((userMessage, index) => [
      {
        role: 'user',
        content: userMessage,
      },
      { role: 'assistant', content: assistantMessages.at(index) ?? '' },
    ]) satisfies OpenAI.Chat.ChatCompletionMessageParam[]
  else {
    allMessages = assistantMessages.flatMap((assistantMessage, index) => [
      { role: 'assistant', content: assistantMessage },
      {
        role: 'user',
        content: userMessages.at(index) ?? '',
      },
    ]) satisfies OpenAI.Chat.ChatCompletionMessageParam[]
  }

  return allMessages
}

const getArrVariable = (
  variableId: string,
  variables: ReadOnlyVariableStore
): (string | null)[] => {
  const variable = variables.get(variableId)
  if (!variable) return []
  if (Array.isArray(variable)) return variable
  return [variable]
}
