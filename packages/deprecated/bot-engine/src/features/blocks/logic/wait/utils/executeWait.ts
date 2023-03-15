import { parseVariables } from '@/features/variables'
import { LogicState } from '@/types'
import { WaitBlock } from '@typebot.io/schemas'

export const executeWait = async (
  block: WaitBlock,
  { typebot: { variables } }: LogicState
) => {
  if (!block.options.secondsToWaitFor) return block.outgoingEdgeId
  const parsedSecondsToWaitFor = parseVariables(variables)(
    block.options.secondsToWaitFor
  )
  // @ts-expect-error isNaN can be used with strings
  if (isNaN(parsedSecondsToWaitFor)) return block.outgoingEdgeId
  await new Promise((resolve) =>
    setTimeout(resolve, parseInt(parsedSecondsToWaitFor) * 1000)
  )
  return block.outgoingEdgeId
}
