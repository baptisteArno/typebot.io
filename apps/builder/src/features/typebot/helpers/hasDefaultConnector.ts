import {
  isChoiceInput,
  isConditionBlock,
  isPictureChoiceInput,
} from "@typebot.io/blocks-core/helpers";
import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { isDefined } from "@typebot.io/lib/utils";

export const hasDefaultConnector = (block: BlockV6) =>
  (!isChoiceInput(block) &&
    !isPictureChoiceInput(block) &&
    !isConditionBlock(block) &&
    block.type !== LogicBlockType.AB_TEST) ||
  (block.type === InputBlockType.CHOICE &&
    isDefined(block.options?.dynamicVariableId)) ||
  (block.type === InputBlockType.PICTURE_CHOICE &&
    block.options?.dynamicItems?.isEnabled &&
    block.options.dynamicItems.pictureSrcsVariableId);
