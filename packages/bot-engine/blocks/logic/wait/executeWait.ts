import { ExecuteLogicResponse } from '../../../types'
import { SessionState, WaitBlock } from '@sniper.io/schemas'
import { parseVariables } from '@sniper.io/variables/parseVariables'
import { isNotDefined } from '@sniper.io/lib'

export const executeWait = (
  state: SessionState,
  block: WaitBlock
): ExecuteLogicResponse => {
  const { variables } = state.snipersQueue[0].sniper
  if (!block.options?.secondsToWaitFor)
    return { outgoingEdgeId: block.outgoingEdgeId }

  const parsedSecondsToWaitFor = safeParseFloat(
    parseVariables(variables)(block.options.secondsToWaitFor)
  )

  if (isNotDefined(parsedSecondsToWaitFor))
    return { outgoingEdgeId: block.outgoingEdgeId }

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions:
      parsedSecondsToWaitFor || block.options?.shouldPause
        ? [
            {
              type: 'wait',
              wait: { secondsToWaitFor: parsedSecondsToWaitFor ?? 0 },
              expectsDedicatedReply: block.options.shouldPause,
            },
          ]
        : undefined,
  }
}

const safeParseFloat = (value: string) => {
  const parsedValue = parseFloat(value)
  return isNaN(parsedValue) ? undefined : parsedValue
}
