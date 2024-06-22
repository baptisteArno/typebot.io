import { executeWait } from './blocks/logic/wait/executeWait'
import { LogicBlock, SessionState } from '@sniper.io/schemas'
import { ExecuteLogicResponse } from './types'
import { executeScript } from './blocks/logic/script/executeScript'
import { executeJumpBlock } from './blocks/logic/jump/executeJumpBlock'
import { executeRedirect } from './blocks/logic/redirect/executeRedirect'
import { executeConditionBlock } from './blocks/logic/condition/executeConditionBlock'
import { executeSetVariable } from './blocks/logic/setVariable/executeSetVariable'
import { executeSniperLink } from './blocks/logic/sniperLink/executeSniperLink'
import { executeAbTest } from './blocks/logic/abTest/executeAbTest'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'

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
      case LogicBlockType.SNIPER_LINK:
        return executeSniperLink(state, block)
      case LogicBlockType.WAIT:
        return executeWait(state, block)
      case LogicBlockType.JUMP:
        return executeJumpBlock(state, block.options)
      case LogicBlockType.AB_TEST:
        return executeAbTest(state, block)
    }
  }
