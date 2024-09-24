import type { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { BubbleBlock } from "@typebot.io/blocks-bubbles/schema";
import { isBubbleBlock, isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type { TypebotPostMessageData } from "typebot-js";

export const getLastChatBlockType = (
  blocks: Block[],
): BubbleBlockType | InputBlockType | undefined => {
  const displayedBlocks = blocks.filter(
    (s) => isBubbleBlock(s) || isInputBlock(s),
  ) as (BubbleBlock | InputBlock)[];
  return displayedBlocks.pop()?.type;
};

export const sendEventToParent = (data: TypebotPostMessageData) => {
  try {
    window.top?.postMessage(
      {
        from: "typebot",
        ...data,
      },
      "*",
    );
  } catch (error) {
    console.error(error);
  }
};
