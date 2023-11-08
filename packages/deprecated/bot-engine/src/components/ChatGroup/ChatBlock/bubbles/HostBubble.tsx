import { AudioBubble } from '@/features/blocks/bubbles/audio'
import { EmbedBubble } from '@/features/blocks/bubbles/embed'
import { ImageBubble } from '@/features/blocks/bubbles/image'
import { TextBubble } from '@/features/blocks/bubbles/textBubble'
import { VideoBubble } from '@/features/blocks/bubbles/video'
import { BubbleBlock } from '@typebot.io/schemas'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'

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
    case BubbleBlockType.AUDIO:
      return (
        <AudioBubble
          url={block.content?.url}
          onTransitionEnd={onTransitionEnd}
        />
      )
  }
}
