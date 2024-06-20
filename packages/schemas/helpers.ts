import { forgedBlockIds } from '@typebot.io/forge-repository/constants'
import {
  Block,
  InputBlock,
  BubbleBlock,
  LogicBlock,
  TextBubbleBlock,
  ImageBubbleBlock,
  VideoBubbleBlock,
  TextInputBlock,
  ChoiceInputBlock,
  PictureChoiceBlock,
  ConditionBlock,
  IntegrationBlock,
  HttpRequestBlock,
  BlockWithOptionsType,
  BlockWithOptions,
} from './features/blocks'
import { BubbleBlockType } from './features/blocks/bubbles/constants'
import { defaultChoiceInputOptions } from './features/blocks/inputs/choice/constants'
import { InputBlockType } from './features/blocks/inputs/constants'
import { IntegrationBlockType } from './features/blocks/integrations/constants'
import { LogicBlockType } from './features/blocks/logic/constants'
import { Group } from './features/typebot/types'

export const isInputBlock = (block: Block): block is InputBlock =>
  (Object.values(InputBlockType) as string[]).includes(block.type)

export const isBubbleBlock = (block: Block): block is BubbleBlock =>
  (Object.values(BubbleBlockType) as string[]).includes(block.type)

export const isLogicBlock = (block: Block): block is LogicBlock =>
  (Object.values(LogicBlockType) as string[]).includes(block.type)

export const isTextBubbleBlock = (block: Block): block is TextBubbleBlock =>
  block.type === BubbleBlockType.TEXT

export const isMediaBubbleBlock = (
  block: Block
): block is ImageBubbleBlock | VideoBubbleBlock =>
  block.type === BubbleBlockType.IMAGE || block.type === BubbleBlockType.VIDEO

export const isTextInputBlock = (block: Block): block is TextInputBlock =>
  block.type === InputBlockType.TEXT

export const isChoiceInput = (block: Block): block is ChoiceInputBlock =>
  block.type === InputBlockType.CHOICE

export const isPictureChoiceInput = (
  block: Block
): block is PictureChoiceBlock => block.type === InputBlockType.PICTURE_CHOICE

export const isSingleChoiceInput = (block: Block): block is ChoiceInputBlock =>
  block.type === InputBlockType.CHOICE &&
  'options' in block &&
  !(
    block.options?.isMultipleChoice ??
    defaultChoiceInputOptions.isMultipleChoice
  )

export const isConditionBlock = (block: Block): block is ConditionBlock =>
  block.type === LogicBlockType.CONDITION

export const isIntegrationBlock = (block: Block): block is IntegrationBlock =>
  (
    Object.values(IntegrationBlockType).concat(forgedBlockIds as any[]) as any[]
  ).includes(block.type)

export const isWebhookBlock = (block: Block): block is HttpRequestBlock =>
  [
    IntegrationBlockType.WEBHOOK,
    IntegrationBlockType.PABBLY_CONNECT,
    IntegrationBlockType.ZAPIER,
    IntegrationBlockType.MAKE_COM,
  ].includes(block.type as IntegrationBlockType)

export const isBubbleBlockType = (
  type: Block['type']
): type is BubbleBlockType =>
  (Object.values(BubbleBlockType) as string[]).includes(type)

export const blockHasOptions = (block: Block): block is BlockWithOptions =>
  'options' in block

export const blockTypeHasItems = (
  type: Block['type']
): type is
  | LogicBlockType.CONDITION
  | InputBlockType.CHOICE
  | LogicBlockType.AB_TEST =>
  type === LogicBlockType.CONDITION ||
  type === InputBlockType.CHOICE ||
  type === LogicBlockType.AB_TEST ||
  type === InputBlockType.PICTURE_CHOICE

export const blockHasItems = (
  block: Block
): block is ConditionBlock | ChoiceInputBlock =>
  'items' in block && block.items !== undefined && block.items !== null

export const getBlockById = (
  blockId: string,
  groups: Group[]
): { block: Block; group: Group; blockIndex: number; groupIndex: number } => {
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    for (
      let blockIndex = 0;
      blockIndex < (groups.at(groupIndex)?.blocks?.length ?? 0);
      blockIndex++
    ) {
      if (groups.at(groupIndex)?.blocks?.at(blockIndex)?.id === blockId) {
        return {
          block: groups[groupIndex].blocks[blockIndex],
          group: groups[groupIndex],
          blockIndex,
          groupIndex,
        }
      }
    }
  }
  throw new Error(`Block with id ${blockId} was not found`)
}
