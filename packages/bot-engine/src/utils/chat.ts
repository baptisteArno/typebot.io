import {
  BubbleBlock,
  BubbleBlockType,
  InputBlock,
  InputBlockType,
  Block,
} from 'models'
import { isBubbleBlock, isInputBlock } from 'utils'
import type { TypebotPostMessageData } from 'typebot-js'

export const getLastChatBlockType = (
  blocks: Block[]
): BubbleBlockType | InputBlockType | undefined => {
  const displayedBlocks = blocks.filter(
    (s) => isBubbleBlock(s) || isInputBlock(s)
  ) as (BubbleBlock | InputBlock)[]
  return displayedBlocks.pop()?.type
}

export const sendEventToParent = (data: TypebotPostMessageData) => {
  try {
    window.top?.postMessage(
      {
        from: 'typebot',
        ...data,
      },
      '*'
    )
  } catch (error) {
    console.error(error)
  }
}
