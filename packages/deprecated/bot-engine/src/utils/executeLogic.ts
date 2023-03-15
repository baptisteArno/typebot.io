import { TypebotViewerProps } from '@/components/TypebotViewer'
import { executeCondition } from '@/features/blocks/logic/condition'
import { executeRedirect } from '@/features/blocks/logic/redirect'
import { executeSetVariable } from '@/features/blocks/logic/setVariable'
import { executeTypebotLink } from '@/features/blocks/logic/typebotLink'
import { executeWait } from '@/features/blocks/logic/wait'
import { LinkedTypebot } from '@/providers/TypebotProvider'
import { EdgeId, LogicState } from '@/types'
import { LogicBlock, LogicBlockType } from '@typebot.io/schemas'
import { executeScript } from '@/features/blocks/logic/script/executeScript'

export const executeLogic = async (
  block: LogicBlock,
  context: LogicState
): Promise<{
  nextEdgeId?: EdgeId
  linkedTypebot?: TypebotViewerProps['typebot'] | LinkedTypebot
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
    case LogicBlockType.TYPEBOT_LINK:
      return executeTypebotLink(block, context)
    case LogicBlockType.WAIT:
      return { nextEdgeId: await executeWait(block, context) }
    default:
      return {}
  }
}
