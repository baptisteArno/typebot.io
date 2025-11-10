import { ExecuteLogicResponse } from '../../../types'
import { SessionState, WaitBlock } from '@typebot.io/schemas'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import { isNotDefined } from '@typebot.io/lib'

const sleep = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000))

export const executeWait = async (
  state: SessionState,
  block: WaitBlock
): Promise<ExecuteLogicResponse> => {
  const { variables } = state.typebotsQueue[0].typebot

  if (!block.options?.secondsToWaitFor) {
    return { outgoingEdgeId: block.outgoingEdgeId }
  }

  const parsedSecondsToWaitFor = safeParseFloat(
    parseVariables(variables)(block.options.secondsToWaitFor)
  )

  if (isNotDefined(parsedSecondsToWaitFor)) {
    return { outgoingEdgeId: block.outgoingEdgeId }
  }

  // Max seconds configurable via env var WAIT_BLOCK_MAX_SECONDS (default 30)
  const rawMax =
    process.env.WAIT_BLOCK_MAX_SECONDS ||
    process.env.NEXT_PUBLIC_WAIT_BLOCK_MAX_SECONDS ||
    '30'
  const parsedMax = parseInt(rawMax, 10)
  const maxSeconds =
    Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : 30
  const secondsToWait = Math.min(parsedSecondsToWaitFor, maxSeconds)

  if (secondsToWait > 0) {
    await sleep(secondsToWait)
  }

  return {
    outgoingEdgeId: block.outgoingEdgeId,
  }
}

const safeParseFloat = (value: string) => {
  const parsedValue = parseFloat(value)
  return isNaN(parsedValue) ? undefined : parsedValue
}
