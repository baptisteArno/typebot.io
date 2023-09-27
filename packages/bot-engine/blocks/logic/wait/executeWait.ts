import { ExecuteLogicResponse } from '../../../types'
import { SessionState, WaitBlock } from '@typebot.io/schemas'
import { parseVariables } from '../../../variables/parseVariables'

export const executeWait = (
  state: SessionState,
  block: WaitBlock
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot
  const parsedSecondsToWaitFor = safeParseInt(
    parseVariables(variables)(block.options.secondsToWaitFor)
  )

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions:
      parsedSecondsToWaitFor || block.options.shouldPause
        ? [
            {
              wait: { secondsToWaitFor: parsedSecondsToWaitFor ?? 0 },
              expectsDedicatedReply: block.options.shouldPause,
            },
          ]
        : undefined,
  }
}

const safeParseInt = (value: string) => {
  const parsedValue = parseInt(value)
  return isNaN(parsedValue) ? undefined : parsedValue
}
