import { BubbleBlock, InputBlock, Block } from '@typebot.io/schemas'
import { isInputBlock, isBubbleBlock } from '@typebot.io/schemas/helpers'
import type { TypebotPostMessageData } from 'typebot-js'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'

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
