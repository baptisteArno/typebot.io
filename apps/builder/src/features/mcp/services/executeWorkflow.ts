import { startChat } from '@typebot.io/bot-engine/apiHandlers/startChat'

interface ExecuteWorkflowParams {
  publicId: string
  prefilledVariables?: Record<string, unknown>
}

/**
 * Execute a workflow typebot with prefilled variables.
 * Wraps the startChat function for MCP usage.
 */
export async function executeWorkflow({
  publicId,
  prefilledVariables,
}: ExecuteWorkflowParams) {
  return startChat({
    origin: undefined,
    isOnlyRegistering: false,
    publicId,
    isStreamEnabled: false,
    prefilledVariables,
    textBubbleContentFormat: 'markdown',
  })
}
