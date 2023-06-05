import { executeWait } from '@/features/blocks/logic/wait/executeWait'
import { LogicBlock, LogicBlockType, SessionState } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from '../types'
import { executeScript } from '@/features/blocks/logic/script/executeScript'
import { executeJumpBlock } from '@/features/blocks/logic/jump/executeJumpBlock'
import { executeRedirect } from '@/features/blocks/logic/redirect/executeRedirect'
import { executeConditionBlock } from '@/features/blocks/logic/condition/executeConditionBlock'
import { executeSetVariable } from '@/features/blocks/logic/setVariable/executeSetVariable'
import { executeTypebotLink } from '@/features/blocks/logic/typebotLink/executeTypebotLink'
import { executeAbTest } from '@/features/blocks/logic/abTest/executeAbTest'

export const executeLogic =
  (state: SessionState) =>
  async (block: LogicBlock): Promise<ExecuteLogicResponse> => {
    switch (block.type) {
      case LogicBlockType.SET_VARIABLE:
        return executeSetVariable(state, block)
      case LogicBlockType.CONDITION:
        return executeConditionBlock(state, block)
      case LogicBlockType.REDIRECT:
        return executeRedirect(state, block)
      case LogicBlockType.SCRIPT:
        return executeScript(state, block)
      case LogicBlockType.TYPEBOT_LINK:
        return executeTypebotLink(state, block)
      case LogicBlockType.WAIT:
        return executeWait(state, block)
      case LogicBlockType.JUMP:
        return executeJumpBlock(state, block.options)
      case LogicBlockType.AB_TEST:
        return executeAbTest(state, block)
    }
  }
