import { BubbleBlock, BubbleBlockType } from 'models'
import React from 'react'
import { EmbedBubble } from './EmbedBubble'
import { ImageBubble } from './ImageBubble'
import { TextBubble } from './TextBubble'
import { VideoBubble } from './VideoBubble'

type Props = {
  block: BubbleBlock
  onTransitionEnd: () => void
}

export const HostBubble = ({ block, onTransitionEnd }: Props) => {
  switch (block.type) {
    case BubbleBlockType.TEXT:
      return <TextBubble block={block} onTransitionEnd={onTransitionEnd} />
    case BubbleBlockType.IMAGE:
      return <ImageBubble block={block} onTransitionEnd={onTransitionEnd} />
    case BubbleBlockType.VIDEO:
      return <VideoBubble block={block} onTransitionEnd={onTransitionEnd} />
    case BubbleBlockType.EMBED:
      return <EmbedBubble block={block} onTransitionEnd={onTransitionEnd} />
  }
}
