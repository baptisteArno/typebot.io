import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { ImageBubbleBlock } from "@typebot.io/blocks-bubbles/image/schema";
import type { BubbleBlock } from "@typebot.io/blocks-bubbles/schema";
import type { TextBubbleBlock } from "@typebot.io/blocks-bubbles/text/schema";
import type { VideoBubbleBlock } from "@typebot.io/blocks-bubbles/video/schema";
import { defaultChoiceInputOptions } from "@typebot.io/blocks-inputs/choice/constants";
import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import type { IntegrationBlock } from "@typebot.io/blocks-integrations/schema";
import type { HttpRequestBlock } from "@typebot.io/blocks-integrations/webhook/schema";
import type { ConditionBlock } from "@typebot.io/blocks-logic/condition/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { LogicBlock } from "@typebot.io/blocks-logic/schema";
import { forgedBlockIds } from "@typebot.io/forge-repository/constants";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import type { Block, BlockWithOptions } from "./schemas/schema";

export const isInputBlock = (block: Block): block is InputBlock =>
  (Object.values(InputBlockType) as string[]).includes(block.type);

export const isBubbleBlock = (block: Block): block is BubbleBlock =>
  (Object.values(BubbleBlockType) as string[]).includes(block.type);

export const isLogicBlock = (block: Block): block is LogicBlock =>
  (Object.values(LogicBlockType) as string[]).includes(block.type);

export const isTextBubbleBlock = (block: Block): block is TextBubbleBlock =>
  block.type === BubbleBlockType.TEXT;

export const isMediaBubbleBlock = (
  block: Block,
): block is ImageBubbleBlock | VideoBubbleBlock =>
  block.type === BubbleBlockType.IMAGE || block.type === BubbleBlockType.VIDEO;

export const isTextInputBlock = (block: Block): block is TextInputBlock =>
  block.type === InputBlockType.TEXT;

export const isChoiceInput = (block: Block): block is ChoiceInputBlock =>
  block.type === InputBlockType.CHOICE;

export const isPictureChoiceInput = (
  block: Block,
): block is PictureChoiceBlock => block.type === InputBlockType.PICTURE_CHOICE;

export const isSingleChoiceInput = (block: Block): block is ChoiceInputBlock =>
  block.type === InputBlockType.CHOICE &&
  "options" in block &&
  !(
    block.options?.isMultipleChoice ??
    defaultChoiceInputOptions.isMultipleChoice
  );

export const isConditionBlock = (block: Block): block is ConditionBlock =>
  block.type === LogicBlockType.CONDITION;

export const isIntegrationBlock = (block: Block): block is IntegrationBlock =>
  (
    Object.values(IntegrationBlockType).concat(
      forgedBlockIds as readonly any[],
    ) as any[]
  ).includes(block.type);

export const isWebhookBlock = (block: Block): block is HttpRequestBlock =>
  [
    IntegrationBlockType.WEBHOOK,
    IntegrationBlockType.PABBLY_CONNECT,
    IntegrationBlockType.ZAPIER,
    IntegrationBlockType.MAKE_COM,
  ].includes(block.type as IntegrationBlockType);

export const isBubbleBlockType = (
  type: Block["type"],
): type is BubbleBlockType =>
  (Object.values(BubbleBlockType) as string[]).includes(type);

export const isInputBlockType = (type: Block["type"]): type is InputBlockType =>
  (Object.values(InputBlockType) as string[]).includes(type);

export const isIntegrationBlockType = (
  type: Block["type"],
): type is IntegrationBlockType =>
  (Object.values(IntegrationBlockType) as string[]).includes(type);

export const isLogicBlockType = (type: Block["type"]): type is LogicBlockType =>
  (Object.values(LogicBlockType) as string[]).includes(type);

export const blockHasOptions = (block: Block): block is BlockWithOptions =>
  "options" in block;

export const blockTypeHasItems = (
  type: Block["type"],
): type is
  | LogicBlockType.CONDITION
  | InputBlockType.CHOICE
  | LogicBlockType.AB_TEST =>
  type === LogicBlockType.CONDITION ||
  type === InputBlockType.CHOICE ||
  type === LogicBlockType.AB_TEST ||
  type === InputBlockType.PICTURE_CHOICE;

export const blockHasItems = (
  block: Block,
): block is ConditionBlock | ChoiceInputBlock =>
  "items" in block && block.items !== undefined && block.items !== null;

export const isForgedBlock = (block: Block): block is ForgedBlock =>
  block.type in forgedBlocks;

export const isForgedBlockType = (
  type: Block["type"],
): type is ForgedBlock["type"] => type in forgedBlocks;
