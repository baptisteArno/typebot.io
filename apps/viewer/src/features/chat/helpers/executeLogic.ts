import { executeWait } from '@/features/blocks/logic/wait/executeWait'
import { LogicBlock, LogicBlockType, SessionState } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../types'
import { executeScript } from '@/features/blocks/logic/script/executeScript'
import { executeJumpBlock } from '@/features/blocks/logic/jump/executeJumpBlock'
import { executeRedirect } from '@/features/blocks/logic/redirect/executeRedirect'
import { executeCondition } from '@/features/blocks/logic/condition/executeCondition'
import { executeSetVariable } from '@/features/blocks/logic/setVariable/executeSetVariable'
import { executeTypebotLink } from '@/features/blocks/logic/typebotLink/executeTypebotLink'
import { executeAbTest } from '@/features/blocks/logic/abTest/executeAbTest'

export const executeLogic =
  (state: SessionState, lastBubbleBlockId?: string) =>
  async (block: LogicBlock): Promise<ExecuteLogicResponse> => {
    switch (block.type) {
      case LogicBlockType.SET_VARIABLE:
        return executeSetVariable(state, block, lastBubbleBlockId)
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
      case LogicBlockType.AB_TEST:
        return executeAbTest(state, block)
    }
  }
