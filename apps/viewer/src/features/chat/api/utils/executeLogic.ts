import { executeCode } from '@/features/blocks/logic/code/api'
import { executeCondition } from '@/features/blocks/logic/condition/api'
import { executeRedirect } from '@/features/blocks/logic/redirect/api'
import { executeSetVariable } from '@/features/blocks/logic/setVariable/api'
import { executeTypebotLink } from '@/features/blocks/logic/typebotLink/api'
import { executeWait } from '@/features/blocks/logic/wait/api/utils/executeWait'
import { LogicBlock, LogicBlockType, SessionState } from 'models'
import { ExecuteLogicResponse } from '../../types'

export const executeLogic =
  (state: SessionState) =>
  async (block: LogicBlock): Promise<ExecuteLogicResponse> => {
    switch (block.type) {
      case LogicBlockType.SET_VARIABLE:
        return executeSetVariable(state, block)
      case LogicBlockType.CONDITION:
        return executeCondition(state, block)
      case LogicBlockType.REDIRECT:
        return executeRedirect(state, block)
      case LogicBlockType.CODE:
        return executeCode(state, block)
      case LogicBlockType.TYPEBOT_LINK:
        return executeTypebotLink(state, block)
      case LogicBlockType.WAIT:
        return executeWait(state, block)
    }
  }
