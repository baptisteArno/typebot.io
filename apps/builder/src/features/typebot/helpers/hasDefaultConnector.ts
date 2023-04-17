import { isChoiceInput, isConditionBlock, isDefined } from '@typebot.io/lib'
import { Block, InputBlockType, LogicBlockType } from '@typebot.io/schemas'

export const hasDefaultConnector = (block: Block) =>
  (!isChoiceInput(block) &&
    !isConditionBlock(block) &&
    block.type !== LogicBlockType.AB_TEST) ||
  (block.type === InputBlockType.CHOICE &&
    isDefined(block.options.dynamicVariableId))
