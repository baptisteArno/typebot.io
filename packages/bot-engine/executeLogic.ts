import { executeWait } from './blocks/logic/wait/executeWait'
import { LogicBlock, SessionState } from '@typebot.io/schemas'
import { ExecuteLogicResponse } from './types'
import { executeScript } from './blocks/logic/script/executeScript'
import { executeJumpBlock } from './blocks/logic/jump/executeJumpBlock'
import { executeRedirect } from './blocks/logic/redirect/executeRedirect'
import { executeConditionBlock } from './blocks/logic/condition/executeConditionBlock'
import { executeSetVariable } from './blocks/logic/setVariable/executeSetVariable'
import { executeValidateCpf } from './blocks/logic/validateCpf/executeValidateCpf'
import { executeValidateCnpj } from './blocks/logic/validateCnpj/executeValidateCnpj'
import { executeTypebotLink } from './blocks/logic/typebotLink/executeTypebotLink'
import { executeAbTest } from './blocks/logic/abTest/executeAbTest'
import { executeDeclareVariables } from './blocks/logic/declareVariables/executeDeclareVariables'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'

export const executeLogic =
  (state: SessionState) =>
  async (block: LogicBlock): Promise<ExecuteLogicResponse> => {
    switch (block.type) {
      case LogicBlockType.SET_VARIABLE:
        return executeSetVariable(state, block)
      case LogicBlockType.VALIDATE_CPF:
        return executeValidateCpf(state, block)
      case LogicBlockType.VALIDATE_CNPJ:
        return executeValidateCnpj(state, block)
      case LogicBlockType.CONDITION:
        return executeConditionBlock(state, block)
      case LogicBlockType.REDIRECT:
        return executeRedirect(state, block)
      case LogicBlockType.SCRIPT:
        return executeScript(state, block)
      case LogicBlockType.TYPEBOT_LINK:
        return executeTypebotLink(state, block)
      case LogicBlockType.WAIT:
        return await executeWait(state, block)
      case LogicBlockType.JUMP:
        return executeJumpBlock(state, block.options)
      case LogicBlockType.AB_TEST:
        return executeAbTest(state, block)
      case LogicBlockType.DECLARE_VARIABLES:
        return executeDeclareVariables(state, block)
      // NATIVE_VARIABLES foi movido para InputBlocks
    }
  }
