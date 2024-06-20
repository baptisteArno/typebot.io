import { BubbleBlock, InputBlock, Block } from '@sniper.io/schemas'
import { isInputBlock, isBubbleBlock } from '@sniper.io/schemas/helpers'
import type { SniperPostMessageData } from 'sniper-js'
import { BubbleBlockType } from '@sniper.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'

export const getLastChatBlockType = (
  blocks: Block[]
): BubbleBlockType | InputBlockType | undefined => {
  const displayedBlocks = blocks.filter(
    (s) => isBubbleBlock(s) || isInputBlock(s)
  ) as (BubbleBlock | InputBlock)[]
  return displayedBlocks.pop()?.type
}

export const sendEventToParent = (data: SniperPostMessageData) => {
  try {
    window.top?.postMessage(
      {
        from: 'sniper',
        ...data,
      },
      '*'
    )
  } catch (error) {
    console.error(error)
  }
}
