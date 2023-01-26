import { ExecuteLogicResponse } from '@/features/chat'
import { parseVariables } from '@/features/variables'
import { SessionState, WaitBlock } from 'models'

export const executeWait = async (
  { typebot: { variables } }: SessionState,
  block: WaitBlock
): Promise<ExecuteLogicResponse> => {
  if (!block.options.secondsToWaitFor)
    return { outgoingEdgeId: block.outgoingEdgeId }
  const parsedSecondsToWaitFor = parseVariables(variables)(
    block.options.secondsToWaitFor
  )

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    // @ts-expect-error isNaN can be used with strings
    clientSideActions: isNaN(parsedSecondsToWaitFor)
      ? undefined
      : [{ wait: { secondsToWaitFor: parsedSecondsToWaitFor } }],
  }
}
