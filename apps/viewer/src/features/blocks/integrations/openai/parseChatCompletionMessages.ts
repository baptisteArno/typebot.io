import { parseVariables } from '@/features/variables/parseVariables'
import { transformStringVariablesToList } from '@/features/variables/transformVariablesToList'
import { byId, isNotEmpty } from '@typebot.io/lib'
import { Variable, VariableWithValue } from '@typebot.io/schemas'
import { ChatCompletionOpenAIOptions } from '@typebot.io/schemas/features/blocks/integrations/openai'
import type { ChatCompletionRequestMessage } from 'openai-edge'

export const parseChatCompletionMessages =
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

          return allMessages
        }
        return {
          role: message.role,
          content: parseVariables(variables)(message.content),
          name: message.name
            ? parseVariables(variables)(message.name)
            : undefined,
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
