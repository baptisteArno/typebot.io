import { TypebotViewerProps } from '@/components/TypebotViewer'
import { executeCode } from '@/features/blocks/logic/code'
import { executeCondition } from '@/features/blocks/logic/condition'
import { executeRedirect } from '@/features/blocks/logic/redirect'
import { executeSetVariable } from '@/features/blocks/logic/setVariable'
import { executeTypebotLink } from '@/features/blocks/logic/typebotLink'
import { LinkedTypebot } from '@/providers/TypebotProvider'
import { EdgeId, LogicState } from '@/types'
import { LogicBlock, LogicBlockType } from 'models'

export const executeLogic = async (
  block: LogicBlock,
  context: LogicState
): Promise<{
  nextEdgeId?: EdgeId
  linkedTypebot?: TypebotViewerProps['typebot'] | LinkedTypebot
}> => {
  switch (block.type) {
    case LogicBlockType.SET_VARIABLE:
      return { nextEdgeId: executeSetVariable(block, context) }
    case LogicBlockType.CONDITION:
      return { nextEdgeId: executeCondition(block, context) }
    case LogicBlockType.REDIRECT:
      return { nextEdgeId: executeRedirect(block, context) }
    case LogicBlockType.CODE:
      return { nextEdgeId: await executeCode(block, context) }
    case LogicBlockType.TYPEBOT_LINK:
      return await executeTypebotLink(block, context)
  }
}
