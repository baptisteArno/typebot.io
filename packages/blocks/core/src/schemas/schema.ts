import {
  type BubbleBlock,
  bubbleBlockSchema,
} from "@typebot.io/blocks-bubbles/schema";
import {
  type InputBlock,
  type InputBlockV5,
  type InputBlockV6,
  inputBlockV5Schema,
  inputBlockV6Schema,
} from "@typebot.io/blocks-inputs/schema";
import {
  type IntegrationBlock,
  type IntegrationBlockV5,
  type IntegrationBlockV6,
  integrationBlockV5Schema,
  integrationBlockV6Schema,
} from "@typebot.io/blocks-integrations/schema";
import {
  type LogicBlock,
  type LogicBlockV5,
  type LogicBlockV6,
  logicBlockV5Schema,
  logicBlockV6Schema,
} from "@typebot.io/blocks-logic/schema";
import {
  type ForgedBlock,
  forgedBlockSchema,
} from "@typebot.io/forge-repository/schemas";
import { z } from "@typebot.io/zod";
import type { ItemV6 } from "./items/schema";
import { type StartBlock, startBlockSchema } from "./start/schemas";

export type BlockIndices = {
  groupIndex: number;
  blockIndex: number;
};

export const blockSchemaV5 = z.union([
  startBlockSchema,
  bubbleBlockSchema,
  inputBlockV5Schema,
  logicBlockV5Schema,
  integrationBlockV5Schema,
]) as z.ZodType<
  StartBlock | BubbleBlock | InputBlockV5 | LogicBlockV5 | IntegrationBlockV5
>;
export type BlockV5 =
  | StartBlock
  | BubbleBlock
  | InputBlockV5
  | LogicBlockV5
  | IntegrationBlockV5;

export const blockSchemaV6 = z.union([
  startBlockSchema,
  bubbleBlockSchema,
  inputBlockV6Schema,
  logicBlockV6Schema,
  integrationBlockV6Schema,
  forgedBlockSchema,
]) as z.ZodType<
  BubbleBlock | InputBlockV6 | LogicBlockV6 | IntegrationBlockV6 | ForgedBlock
>;

export type BlockV6 =
  | BubbleBlock
  | InputBlock
  | LogicBlock
  | IntegrationBlock
  | ForgedBlock;

export type Block = BlockV5 | BlockV6;

export type BlockOptions =
  | InputBlock["options"]
  | LogicBlock["options"]
  | IntegrationBlock["options"];

export type BlockWithOptions = Extract<Block, { options?: any }>;

export type BlockWithOptionsType = BlockWithOptions["type"];

export type BlockWithItems = Extract<BlockV6, { items: ItemV6[] }>;
