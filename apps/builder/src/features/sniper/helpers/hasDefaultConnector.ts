import { isDefined } from '@sniper.io/lib'
import {
  isChoiceInput,
  isConditionBlock,
  isPictureChoiceInput,
} from '@sniper.io/schemas/helpers'
import { BlockV6 } from '@sniper.io/schemas'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@sniper.io/schemas/features/blocks/logic/constants'

export const hasDefaultConnector = (block: BlockV6) =>
  (!isChoiceInput(block) &&
    !isPictureChoiceInput(block) &&
    !isConditionBlock(block) &&
    block.type !== LogicBlockType.AB_TEST) ||
  (block.type === InputBlockType.CHOICE &&
    isDefined(block.options?.dynamicVariableId)) ||
  (block.type === InputBlockType.PICTURE_CHOICE &&
    block.options?.dynamicItems?.isEnabled &&
    block.options.dynamicItems.pictureSrcsVariableId)
