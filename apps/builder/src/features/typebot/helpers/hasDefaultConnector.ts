import {
  isChoiceInput,
  isConditionBlock,
  isDefined,
  isPictureChoiceInput,
} from '@typebot.io/lib'
import { Block, InputBlockType, LogicBlockType } from '@typebot.io/schemas'

export const hasDefaultConnector = (block: Block) =>
  (!isChoiceInput(block) &&
    !isPictureChoiceInput(block) &&
    !isConditionBlock(block) &&
    block.type !== LogicBlockType.AB_TEST) ||
  (block.type === InputBlockType.CHOICE &&
    isDefined(block.options.dynamicVariableId)) ||
  (block.type === InputBlockType.PICTURE_CHOICE &&
    block.options.dynamicItems?.isEnabled &&
    block.options.dynamicItems?.pictureSrcsVariableId)
