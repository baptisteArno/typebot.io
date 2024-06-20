import { SniperViewerProps } from '@/components/SniperViewer'
import { executeCondition } from '@/features/blocks/logic/condition'
import { executeRedirect } from '@/features/blocks/logic/redirect'
import { executeSetVariable } from '@/features/blocks/logic/setVariable'
import { executeSniperLink } from '@/features/blocks/logic/sniperLink'
import { executeWait } from '@/features/blocks/logic/wait'
import { LinkedSniper } from '@/providers/SniperProvider'
import { EdgeId, LogicState } from '@/types'
import { LogicBlock } from '@sniper.io/schemas'
import { executeScript } from '@/features/blocks/logic/script/executeScript'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'

export const executeLogic = async (
  block: LogicBlock,
  context: LogicState
): Promise<{
  nextEdgeId?: EdgeId
  linkedSniper?: SniperViewerProps['sniper'] | LinkedSniper
  blockedPopupUrl?: string
}> => {
  switch (block.type) {
    case LogicBlockType.SET_VARIABLE:
      return { nextEdgeId: executeSetVariable(block, context) }
    case LogicBlockType.CONDITION:
      return { nextEdgeId: executeCondition(block, context) }
    case LogicBlockType.REDIRECT:
      return executeRedirect(block, context)
    case LogicBlockType.SCRIPT:
      return { nextEdgeId: await executeScript(block, context) }
    case LogicBlockType.SNIPER_LINK:
      return executeSniperLink(block, context)
    case LogicBlockType.WAIT:
      return { nextEdgeId: await executeWait(block, context) }
    default:
      return {}
  }
}
