import { AbTestBlock, SessionState } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../../../types'
import { defaultAbTestOptions } from '@typebot.io/schemas/features/blocks/logic/abTest/constants'

export const executeAbTest = (
  _: SessionState,
  block: AbTestBlock
): ExecuteLogicResponse => {
  const aEdgeId = block.items[0].outgoingEdgeId
  const random = Math.random() * 100
  if (
    random < (block.options?.aPercent ?? defaultAbTestOptions.aPercent) &&
    aEdgeId
  ) {
    return { outgoingEdgeId: aEdgeId }
  }
  const bEdgeId = block.items[1].outgoingEdgeId
  if (bEdgeId) return { outgoingEdgeId: bEdgeId }
  return { outgoingEdgeId: block.outgoingEdgeId }
}
