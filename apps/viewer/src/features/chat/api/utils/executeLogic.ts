import { executeCondition } from '@/features/blocks/logic/condition/api'
import { executeRedirect } from '@/features/blocks/logic/redirect/api'
import { executeSetVariable } from '@/features/blocks/logic/setVariable/api'
import { executeTypebotLink } from '@/features/blocks/logic/typebotLink/api'
import { executeWait } from '@/features/blocks/logic/wait/api/utils/executeWait'
import { LogicBlock, LogicBlockType, SessionState } from 'models'
import { ExecuteLogicResponse } from '../../types'
import { executeScript } from '@/features/blocks/logic/script/executeScript'
import { executeJumpBlock } from '@/features/blocks/logic/jump/executeJumpBlock'

export const executeLogic =
  (state: SessionState, lastBubbleBlockId?: string) =>
  async (block: LogicBlock): Promise<ExecuteLogicResponse> => {
    switch (block.type) {
      case LogicBlockType.SET_VARIABLE:
        return executeSetVariable(state, block)
      case LogicBlockType.CONDITION:
        return executeCondition(state, block)
      case LogicBlockType.REDIRECT:
        return executeRedirect(state, block, lastBubbleBlockId)
      case LogicBlockType.SCRIPT:
        return executeScript(state, block, lastBubbleBlockId)
      case LogicBlockType.TYPEBOT_LINK:
        return executeTypebotLink(state, block)
      case LogicBlockType.WAIT:
        return executeWait(state, block, lastBubbleBlockId)
      case LogicBlockType.JUMP:
        return executeJumpBlock(state, block.options)
    }
  }
