import { ExecuteLogicResponse } from '@/features/chat'
import { parseVariables } from '@/features/variables'
import { SessionState, WaitBlock } from 'models'

export const executeWait = async (
  { typebot: { variables } }: SessionState,
  block: WaitBlock,
  lastBubbleBlockId?: string
): Promise<ExecuteLogicResponse> => {
  if (!block.options.secondsToWaitFor)
    return { outgoingEdgeId: block.outgoingEdgeId }
  const parsedSecondsToWaitFor = safeParseInt(
    parseVariables(variables)(block.options.secondsToWaitFor)
  )

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: parsedSecondsToWaitFor
      ? [
          {
            wait: { secondsToWaitFor: parsedSecondsToWaitFor },
            lastBubbleBlockId,
          },
        ]
      : undefined,
  }
}

const safeParseInt = (value: string) => {
  const parsedValue = parseInt(value)
  return isNaN(parsedValue) ? undefined : parsedValue
}
