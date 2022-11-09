import {
  BubbleBlock,
  BubbleBlockType,
  InputBlock,
  InputBlockType,
  Block,
  TypingEmulation,
} from 'models'
import { isBubbleBlock, isInputBlock } from 'utils'
import type { TypebotPostMessageData } from 'typebot-js'

export const computeTypingTimeout = (
  bubbleContent: string,
  typingSettings: TypingEmulation
) => {
  let wordCount = bubbleContent.match(/(\w+)/g)?.length ?? 0
  if (wordCount === 0) wordCount = bubbleContent.length
  const typedWordsPerMinute = typingSettings.speed
  let typingTimeout = typingSettings.enabled
    ? (wordCount / typedWordsPerMinute) * 60000
    : 0
  if (typingTimeout > typingSettings.maxDelay * 1000)
    typingTimeout = typingSettings.maxDelay * 1000
  return typingTimeout
}

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
