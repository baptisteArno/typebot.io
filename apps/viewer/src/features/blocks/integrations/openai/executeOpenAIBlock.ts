import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { SessionState } from 'models'
import { OpenAIBlock } from 'models/features/blocks/integrations/openai'
import { createChatCompletionOpenAI } from './createChatCompletionOpenAI'

export const executeOpenAIBlock = async (
  state: SessionState,
  block: OpenAIBlock
): Promise<ExecuteIntegrationResponse> => {
  switch (block.options.task) {
    case 'Create chat completion':
      return createChatCompletionOpenAI(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      })
    case 'Create image':
    case undefined:
      return { outgoingEdgeId: block.outgoingEdgeId }
  }
}
