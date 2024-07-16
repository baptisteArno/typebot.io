import { CoreMessage, ToolCallPart, ToolResultPart } from 'ai'

type Props = {
  messages: CoreMessage[]
  toolCalls: ToolCallPart[]
  toolResults: ToolResultPart[]
}
export const appendToolResultsToMessages = ({
  messages,
  toolCalls,
  toolResults,
}: Props): CoreMessage[] => {
  if (toolCalls.length > 0) {
    messages.push({
      role: 'assistant',
      content: toolCalls,
    })
  }

  if (toolResults.length > 0) {
    messages.push({
      role: 'tool',
      content: toolResults,
    })
  }

  return messages
}
